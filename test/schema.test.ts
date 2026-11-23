import { describe, expect, test } from "bun:test";
import {
	buildSchema,
	isEnumType,
	isInputObjectType,
	isListType,
	isNonNullType,
	isRequiredArgument,
	isRequiredInputField,
	Kind,
	type GraphQLInputType,
} from "graphql";
import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import {
	composeOperation,
	describe as describeName,
	describeOperation,
	getSchema,
	loadCatalog,
	type OperationDescriptor,
} from "../src/schema/catalog.ts";
import { attributeTypedArgs, attributionTargets } from "../src/identity/attribution.ts";
import { classifyRawDocument, composeSelectionValidation, injectCreateAsUser, mutationPayloadRoots } from "../src/schema/raw.ts";

const ROOT = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const catalog = loadCatalog();
const schema = getSchema();
const byTool = new Map(catalog.map((d) => [d.tool, d]));

function descriptor(tool: string): OperationDescriptor {
	const found = byTool.get(tool);
	if (!found) throw new Error(`missing descriptor ${tool}`);
	return found;
}

function properties(d: OperationDescriptor): Record<string, unknown> {
	return (d.parameters as { properties: Record<string, unknown> }).properties;
}

describe("catalog coverage", () => {
	test("covers every Query and Mutation root field exactly once", () => {
		const roots = new Set<string>();
		for (const d of catalog) roots.add(`${d.kind}.${d.root}`);
		const expected = new Set<string>();
		for (const name of Object.keys(schema.getQueryType()!.getFields())) expected.add(`Query.${name}`);
		for (const name of Object.keys(schema.getMutationType()!.getFields())) expected.add(`Mutation.${name}`);
		expect(catalog.length).toBe(495);
		expect(roots.size).toBe(catalog.length);
		expect([...roots].sort()).toEqual([...expected].sort());
	});

	test("manifest matches the pinned schema digest and the generated catalog", () => {
		const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "generated", "coverage-manifest.json"), "utf8"));
		const sdl = fs.readFileSync(path.join(ROOT, "schema", "linear.schema.graphql"));
		expect(manifest.schemaSha256).toBe(createHash("sha256").update(sdl).digest("hex"));
		expect(manifest.total).toBe(495);
		expect(manifest.queryCount + manifest.mutationCount).toBe(495);
		expect(manifest.roots.length).toBe(495);
	});

	test("every argument is present with required mirroring GraphQL non-null", () => {
		for (const d of catalog) {
			const rootType = d.kind === "Query" ? schema.getQueryType()! : schema.getMutationType()!;
			const field = rootType.getFields()[d.root]!;
			const props = properties(d);
			const required = (d.parameters as { required: string[] }).required;
			expect(d.argNames).toEqual(field.args.map((a) => a.name));
			expect(required).toContain("i");
			expect(props.selection).toBeDefined();
			expect(required).not.toContain("selection");
			for (const arg of field.args) {
				expect(props[arg.name]).toBeDefined();
				expect(required.includes(arg.name)).toBe(isRequiredArgument(arg));
			}
		}
	});

	test("recursive input objects round-trip through $defs/$ref; nested relation filters stay opaque", () => {
		const issues = descriptor("lq_issues");
		const filter = properties(issues).filter as { anyOf: [{ $ref: string }, unknown] };
		expect(filter.anyOf[0].$ref).toBe("#/$defs/IssueFilter");
		const defs = (issues.parameters as { $defs: Record<string, { properties: Record<string, unknown> }> }).$defs;
		expect(defs.IssueFilter).toBeDefined();
		const or = defs.IssueFilter.properties.or as { anyOf: [{ items: { $ref: string } }, unknown] };
		expect(or.anyOf[0].items.$ref).toBe("#/$defs/IssueFilter");
		const title = defs.IssueFilter.properties.title as { anyOf: [{ $ref: string }, unknown] };
		expect(defs[title.anyOf[0].$ref.replace("#/$defs/", "")]?.properties.eq).toBeDefined();
		const state = defs.IssueFilter.properties.state as { anyOf: [Record<string, unknown>, unknown] };
		expect(state.anyOf[0]).toMatchObject({ type: "object", additionalProperties: true });
		expect(state.anyOf[0].description).toContain("WorkflowStateFilter");
		expect(defs.WorkflowStateFilter).toBeUndefined();
	});

	test("every parameter schema stays small enough to keep in each model request", () => {
		// A host can keep an activated tool's schema in every later request.
		const oversized = catalog
			.map((d) => [d.tool, JSON.stringify(d.parameters).length] as const)
			.filter(([, size]) => size > 64_000);
		expect(oversized).toEqual([]);
	});

	test("enum arguments expose their values", () => {
		const teams = descriptor("lq_administrableTeams");
		const orderBy = properties(teams).orderBy as { anyOf: [{ enum: string[] }, unknown] };
		expect(orderBy.anyOf[0].enum).toEqual(["createdAt", "updatedAt"]);
	});

	test("no parameter schema uses the not keyword, which Codex rejects", () => {
		const withNot: string[] = [];
		const walk = (node: unknown, where: string): void => {
			if (!node || typeof node !== "object") return;
			const schemaNode = node as Record<string, unknown>;
			if ("not" in schemaNode) withNot.push(where);
			for (const key of ["properties", "$defs"]) {
				const map = schemaNode[key] as Record<string, unknown> | undefined;
				for (const [name, child] of Object.entries(map ?? {})) walk(child, `${where}.${name}`);
			}
			walk(schemaNode.items, `${where}[]`);
			for (const [index, child] of ((schemaNode.anyOf as unknown[] | undefined) ?? []).entries()) walk(child, `${where}|${index}`);
		};
		for (const d of catalog) walk(d.parameters, d.tool);
		expect(withNot).toEqual([]);
		const timeframe = (descriptor("lq_searchDocuments").parameters as { $defs: Record<string, { properties: Record<string, { anyOf: unknown[] }> }> }).$defs.DateComparator.properties.eq;
		expect(timeframe.anyOf[0]).toEqual({ type: "string", description: "GraphQL scalar DateTimeOrDuration" });
	});
});

describe("composeOperation", () => {
	test("builds a validated document with variables for Query.issues", () => {
		const { document, variables } = composeOperation(descriptor("lq_issues"), {
			i: "list bugs",
			first: 10,
			filter: { title: { contains: "bug" } },
		});
		expect(document.startsWith("query lq_issues($filter: IssueFilter, $first: Int)")).toBe(true);
		expect(document).toContain("nodes {");
		expect(document).toContain("pageInfo {");
		expect(document).toContain("hasNextPage");
		expect(variables).toEqual({ first: 10, filter: { title: { contains: "bug" } } });
	});

	test("rejects an invalid value inside a nested input that the tool schema leaves open", () => {
		expect(() => composeOperation(descriptor("lq_issues"), { filter: { team: { key: [] } } })).toThrow(/^lq_issues: invalid argument filter\.team\.key/);
		expect(() => composeOperation(descriptor("lq_issues"), { filter: { team: { nope: { eq: "x" } } } })).toThrow(/nope/);
		const { variables } = composeOperation(descriptor("lq_issues"), { filter: { team: { key: { eq: "ENG" } } } });
		expect(variables).toEqual({ filter: { team: { key: { eq: "ENG" } } } });
	});

	test("honours an explicit selection override", () => {
		const { document } = composeOperation(descriptor("lq_issue"), { id: "ENG-1" }, "{ id title }");
		expect(document).toBe("query lq_issue($id: String!) {\n  issue(id: $id) {\n    id\n    title\n  }\n}");
	});

	test("a selection can never introduce a sibling root field", () => {
		expect(() =>
			composeOperation(descriptor("lm_issueArchive"), { id: "x" }, '{ success } extra: issueDelete(id: "x") { success }'),
		).toThrow(/invalid selection/);
		// The document is built from one root field node, so the injected call cannot survive.
		const { document } = composeOperation(descriptor("lm_issueArchive"), { id: "x" }, "{ success }");
		expect(document).not.toContain("issueDelete");
		expect(classifyRawDocument(document).mutationRoots).toEqual([{ alias: "issueArchive", field: "issueArchive" }]);
	});

	test("named fragments in a selection are attached and validated", () => {
		const { document } = composeOperation(
			descriptor("lq_issue"),
			{ id: "ENG-1" },
			"{ ...IssueBits } fragment IssueBits on Issue { id title }",
		);
		expect(document).toContain("...IssueBits");
		expect(document).toContain("fragment IssueBits on Issue");
		expect(() => composeOperation(descriptor("lq_issue"), { id: "x" }, "{ ...Missing }")).toThrow(/Unknown fragment "Missing"/);
		// A fragment spread lands inside the root field, so it cannot reach the Query root.
		expect(() =>
			composeOperation(descriptor("lq_issue"), { id: "x" }, "{ ...Evil } fragment Evil on Query { issues { nodes { id } } }"),
		).toThrow(/Fragment "Evil" cannot be spread here/);
	});

	test("rejects selections that are not a bare selection set", () => {
		expect(() => composeOperation(descriptor("lq_issue"), { id: "x" }, "query Other { viewer { id } }")).toThrow(
			/expected a bare selection set/,
		);
		expect(() => composeOperation(descriptor("lq_issue"), { id: "x" }, "{ id } { title }")).toThrow(/invalid selection/);
		expect(() => composeOperation(descriptor("lq_issue"), { id: "x" }, "{}")).toThrow(/invalid selection/);
	});

	test("throws the GraphQL validation messages for a bogus selection field", () => {
		expect(() => composeOperation(descriptor("lq_issue"), { id: "x" }, "{ id notAField }")).toThrow(/Cannot query field "notAField" on type "Issue"/);
	});

	test("throws when a required argument is missing", () => {
		expect(() => composeOperation(descriptor("lm_issueArchive"), {})).toThrow(/missing required argument "id"/);
	});

	test("every generated descriptor composes into a schema-valid document", () => {
		// Smallest value of a GraphQL input type: required fields only, one list item.
		const sample = (type: GraphQLInputType): unknown => {
			const inner = isNonNullType(type) ? type.ofType : type;
			if (isListType(inner)) return [sample(inner.ofType)];
			if (isInputObjectType(inner)) {
				return Object.fromEntries(Object.values(inner.getFields()).filter(isRequiredInputField).map((f) => [f.name, sample(f.type)]));
			}
			if (isEnumType(inner)) return inner.getValues()[0]!.name;
			if (inner.name === "Int" || inner.name === "Float") return 1;
			if (inner.name === "Boolean") return true;
			return "x";
		};
		const failures: string[] = [];
		for (const d of catalog) {
			const rootType = d.kind === "Query" ? schema.getQueryType()! : schema.getMutationType()!;
			const field = rootType.getFields()[d.root]!;
			const args: Record<string, unknown> = {};
			for (const arg of field.args) {
				if (!isRequiredArgument(arg)) continue;
				args[arg.name] = sample(arg.type);
			}
			try {
				composeOperation(d, args);
			} catch (error) {
				failures.push(`${d.tool}: ${error instanceof Error ? error.message : String(error)}`);
			}
		}
		expect(failures).toEqual([]);
	});

	test("mutation payload selections are composed as mutations", () => {
		const { document } = composeOperation(descriptor("lm_issueArchive"), { id: "abc", trash: true });
		expect(document.startsWith("mutation lm_issueArchive($trash: Boolean, $id: String!)")).toBe(true);
		expect(document).toContain("success");
	});
});

describe("describe", () => {
	test("renders args, return fields and deprecation for operations", () => {
		const help = describeOperation("lq_issue");
		expect(help).toContain("lq_issue — Query.issue: Issue!");
		expect(help).toContain("id: String!");
		expect(help).toContain("Returns Issue with fields:");
		expect(describeOperation("issue")).toBe(help);
		const deprecated = catalog.find((d) => d.deprecated)!;
		expect(describeOperation(deprecated.tool)).toContain(`DEPRECATED: ${deprecated.deprecated}`);
		expect(() => describeOperation("lq_notAThing")).toThrow(/unknown Linear operation/);
	});

	test("describes object, input, enum, union and scalar types exactly", () => {
		const object = describeName("Issue");
		expect(object.startsWith("type Issue")).toBe(true);
		expect(object).toContain("  identifier: String!");
		expect(object).toContain("comments(");

		const input = describeName("IssueCreateInput");
		expect(input.startsWith("input IssueCreateInput")).toBe(true);
		expect(input).toContain("  teamId: String!");

		expect(describeName("PaginationOrderBy")).toBe(
			"enum PaginationOrderBy — The timestamp used to order a paginated list. Forward pagination returns the newest results first.\n  createdAt\n  updatedAt",
		);

		const union = describeName("AgentActivityContent");
		expect(union.startsWith("union AgentActivityContent")).toBe(true);
		expect(union).toContain(" | ");

		expect(describeName("DateTime").startsWith("scalar DateTime —")).toBe(true);

		const iface = describeName("Node");
		expect(iface.startsWith("interface Node")).toBe(true);
	});

	test("marks deprecated members and suggests close names for unknown ones", () => {
		const deprecatedField = Object.values(schema.getQueryType()!.getFields()).find((f) => f.deprecationReason)!;
		expect(describeName("Query")).toContain(`${deprecatedField.name}`);
		expect(describeName("Query")).toContain("[deprecated:");

		const unknown = describeName("issuCreate");
		expect(unknown.startsWith('unknown name "issuCreate"; did you mean: ')).toBe(true);
		expect(unknown).toContain("issueCreate");
		expect(describeName("zzzzzzzzzzzzzzzzunknown")).toContain('unknown name "zzzzzzzzzzzzzzzzunknown"');
	});

	test("tool names, root fields and type names all resolve", () => {
		expect(describeName("lm_issueCreate")).toContain("lm_issueCreate — Mutation.issueCreate");
		expect(describeName("issueCreate")).toContain("lm_issueCreate — Mutation.issueCreate");
	});
});

describe("classifyRawDocument", () => {
	test("classifies query as read and mutation as write", () => {
		expect(classifyRawDocument("query Me { viewer { id } }")).toEqual({
			operation: "query",
			tier: "read",
			name: "Me",
			document: "query Me { viewer { id } }",
			validation: "pinned",
			unpinned: { fields: [], arguments: [], types: [], inputFields: [] },
			mutationRoots: [],
		});
		const mutation = classifyRawDocument('mutation { issueArchive(id: "x") { success } }');
		expect(mutation.tier).toBe("write");
		expect(mutation.name).toBeNull();
	});

	test("a string literal named mutation stays a read", () => {
		expect(classifyRawDocument('query { issue(id: "mutation") { id } }').tier).toBe("read");
	});

	test("lists every top-level mutation root including aliases", () => {
		const document =
			'mutation M { a: issueArchive(id: "1") { success } b: issueArchive(id: "2") { success } commentCreate(input: {body: "x"}) { success } }';
		expect(classifyRawDocument(document).mutationRoots).toEqual([
			{ alias: "a", field: "issueArchive" },
			{ alias: "b", field: "issueArchive" },
			{ alias: "commentCreate", field: "commentCreate" },
		]);
	});

	test("selects by operationName and rejects an unknown one", () => {
		const document = 'query A { viewer { id } } mutation B { issueArchive(id: "x") { success } }';
		expect(classifyRawDocument(document, "B").tier).toBe("write");
		expect(() => classifyRawDocument(document, "C")).toThrow(/unknown operationName "C"/);
		expect(() => classifyRawDocument(document)).toThrow(/operationName is required/);
	});

	test("post-pin drift is reported, not rejected", () => {
		const fields = classifyRawDocument("query { viewer { id brandNewField } issues { nodes { id anotherNewField } } }");
		expect(fields.tier).toBe("read");
		expect(fields.validation).toBe("unknown");
		expect(fields.unpinned.fields).toEqual(["User.brandNewField", "Issue.anotherNewField"]);

		const newMutation = classifyRawDocument("mutation M($input: FooCreateInput!) { fooCreate(input: $input) { foo { id } } }");
		expect(newMutation.tier).toBe("write");
		expect(newMutation.validation).toBe("unknown");
		expect(newMutation.unpinned.types).toEqual(["FooCreateInput"]);
		expect(newMutation.unpinned.fields).toEqual(["Mutation.fooCreate"]);
		expect(newMutation.mutationRoots).toEqual([{ alias: "fooCreate", field: "fooCreate" }]);

		const literal = classifyRawDocument("mutation { fooCreate(input: {bar: 1}) { foo { id } } }");
		expect(literal.validation).toBe("unknown");
		expect(literal.unpinned.fields).toEqual(["Mutation.fooCreate"]);

		const newArgument = classifyRawDocument('query { issue(id: "x", newArg: true) { id } }');
		expect(newArgument.unpinned.arguments).toEqual(["Query.issue(newArg)"]);

		const newEnum = classifyRawDocument("query { issues(orderBy: brandNew) { nodes { id } } }");
		expect(newEnum.unpinned.inputFields).toEqual(["PaginationOrderBy.brandNew"]);

		const newInputField = classifyRawDocument("query { issues(filter: {brandNewField: {eq: 1}}) { nodes { id } } }");
		expect(newInputField.unpinned.inputFields).toEqual(["IssueFilter.brandNewField"]);
	});

	test("keeps structural problems hard failures", () => {
		expect(() => classifyRawDocument("subscription S { issue { id } }")).toThrow(/subscriptions are not supported/);
		expect(() => classifyRawDocument("query {")).toThrow(/invalid GraphQL document/);
		expect(() => classifyRawDocument("query { issue(id: $missing) { id } }")).toThrow(/Variable "\$missing" is not defined/);
		expect(() => classifyRawDocument("query Q($unused: String) { viewer { id } }")).toThrow(/Variable "\$unused" is never used/);
		expect(() => classifyRawDocument("query { ...Missing }")).toThrow(/Unknown fragment "Missing"/);
		expect(() => classifyRawDocument("query A { viewer { id } } query A { viewer { id } }", "A")).toThrow(
			/There can be only one operation named "A"/,
		);
		expect(() => classifyRawDocument('query { issues(filter: {title: "x"}) { nodes { id } } }')).toThrow(/does not validate/);
	});

	test("mutationPayloadRoots sees through fragments", () => {
		const spread =
			'mutation M { ...Roots } fragment Roots on Mutation { created: issueCreate(input: {title: "T", teamId: "t"}) { success } commentCreate(input: {body: "b"}) { success } }';
		expect(mutationPayloadRoots(spread)).toEqual([
			{ alias: "created", field: "issueCreate" },
			{ alias: "commentCreate", field: "commentCreate" },
		]);
		expect(classifyRawDocument(spread).mutationRoots).toEqual(mutationPayloadRoots(spread));

		const inline = 'mutation M { ... on Mutation { boxed: issueCreate(input: {title: "T", teamId: "t"}) { success } } }';
		expect(mutationPayloadRoots(inline)).toEqual([{ alias: "boxed", field: "issueCreate" }]);

		expect(mutationPayloadRoots("query Q { viewer { id } }")).toEqual([]);
		expect(() => mutationPayloadRoots("mutation M { ...Missing }")).toThrow(/unknown fragment "Missing"/);
	});
});

describe("composeSelectionValidation", () => {
	test("unknown fields stay hard errors on the typed path", () => {
		expect(() => composeSelectionValidation("query T { viewer { id brandNewField } }", "lq_viewer")).toThrow(
			/lq_viewer: invalid operation: Cannot query field "brandNewField"/,
		);
		expect(composeSelectionValidation("query T { viewer { id } }", "lq_viewer").kind).toBe(Kind.DOCUMENT);
	});
});

describe("injectCreateAsUser", () => {
	const targets = [
		{ field: "issueCreate", inputArg: "input" },
		{ field: "commentCreate", inputArg: "input" },
	];

	test("rewrites an inline object literal", () => {
		const result = injectCreateAsUser('mutation { issueCreate(input: {title: "T", teamId: "t"}) { success } }', {}, targets, "Agent A");
		expect(result.document).toContain('createAsUser: "Agent A"');
		expect(result.variables).toEqual({});
		expect(classifyRawDocument(result.document).mutationRoots).toEqual([{ alias: "issueCreate", field: "issueCreate" }]);
	});

	test("replaces an existing createAsUser rather than duplicating it", () => {
		const result = injectCreateAsUser('mutation { issueCreate(input: {title: "T", createAsUser: "old"}) { success } }', {}, targets, "Agent A");
		expect(result.document).toContain('createAsUser: "Agent A"');
		expect(result.document).not.toContain('"old"');
	});

	test("rewrites variable values, including a list of inputs", () => {
		const single = injectCreateAsUser(
			"mutation M($input: IssueCreateInput!) { issueCreate(input: $input) { success } }",
			{ input: { title: "T" } },
			targets,
			"Agent A",
		);
		expect(single.variables).toEqual({ input: { title: "T", createAsUser: "Agent A" } });
		expect(single.document).toContain("issueCreate(input: $input)");
		const batch = injectCreateAsUser(
			"mutation M($input: CommentCreateInput!) { commentCreate(input: $input) { success } }",
			{ input: [{ body: "a" }, { body: "b" }] },
			targets,
			"Agent A",
		);
		expect(batch.variables).toEqual({ input: [{ body: "a", createAsUser: "Agent A" }, { body: "b", createAsUser: "Agent A" }] });
	});

	test("transforms every aliased copy of a target mutation", () => {
		const result = injectCreateAsUser(
			'mutation M($second: IssueCreateInput!) { first: issueCreate(input: {title: "A", teamId: "t"}) { success } second: issueCreate(input: $second) { success } }',
			{ second: { title: "B" } },
			targets,
			"Agent A",
		);
		expect(result.document.match(/createAsUser: "Agent A"/g)).toHaveLength(1);
		expect(result.variables).toEqual({ second: { title: "B", createAsUser: "Agent A" } });
		expect(result.document).toContain('first: issueCreate(input: { title: "A", teamId: "t", createAsUser: "Agent A" })');
	});

	test("leaves untargeted mutations and queries untouched", () => {
		const document = 'mutation { issueArchive(id: "x") { success } }';
		expect(injectCreateAsUser(document, {}, targets, "Agent A")).toEqual({ document, variables: {} });
	});

	test("throws on a parse error or a variable with no value", () => {
		expect(() => injectCreateAsUser("mutation {", {}, targets, "Agent A")).toThrow(/invalid GraphQL document/);
		expect(() =>
			injectCreateAsUser("mutation M($input: IssueCreateInput!) { issueCreate(input: $input) { success } }", {}, targets, "Agent A"),
		).toThrow(/variable "\$input" has no value/);
		expect(() => injectCreateAsUser("mutation { issueCreate { success } }", {}, targets, "Agent A")).toThrow(/missing "input" argument/);
	});

	test("only the selected operation is rewritten", () => {
		const document =
			'mutation A($input: IssueCreateInput!) { issueCreate(input: $input) { success } } mutation B { commentCreate(input: {body: "b"}) { success } }';
		const result = injectCreateAsUser(document, { input: { title: "T" } }, targets, "Agent A", "A");
		expect(result.variables).toEqual({ input: { title: "T", createAsUser: "Agent A" } });
		expect(result.document).toContain('commentCreate(input: { body: "b" })');
		expect(result.document).not.toContain('body: "b", createAsUser');
		expect(() => injectCreateAsUser(document, {}, targets, "Agent A")).toThrow(/operationName is required/);
		expect(() => injectCreateAsUser(document, {}, targets, "Agent A", "C")).toThrow(/unknown operationName "C"/);
	});

	test("a variable default value is materialised when no runtime value is supplied", () => {
		const result = injectCreateAsUser(
			'mutation M($input: IssueCreateInput! = {title: "D", teamId: "t"}) { issueCreate(input: $input) { success } }',
			{},
			targets,
			"Agent A",
		);
		expect(result.variables).toEqual({ input: { title: "D", teamId: "t", createAsUser: "Agent A" } });
	});

	test("targets reached through fragments are rewritten", () => {
		const result = injectCreateAsUser(
			'mutation M { ...Roots } fragment Roots on Mutation { issueCreate(input: {title: "T", teamId: "t"}) { success } }',
			{},
			targets,
			"Agent A",
		);
		expect(result.document).toContain('createAsUser: "Agent A"');
		expect(mutationPayloadRoots(result.document)).toEqual([{ alias: "issueCreate", field: "issueCreate" }]);
	});

	test("a direct createAsUser argument (attachmentLinkURL) is forced to the author in typed and raw calls", () => {
		const pinned = attributionTargets(schema);
		const link = pinned.get("attachmentLinkURL");
		expect(link).toEqual({ field: "attachmentLinkURL", inputArg: "createAsUser", kind: "argument" });
		expect(pinned.get("issueCreate")).toEqual({ field: "issueCreate", inputArg: "input" });

		expect(attributeTypedArgs({ issueId: "i", url: "u" }, link!, "Task Agent")).toEqual({ issueId: "i", url: "u", createAsUser: "Task Agent" });
		expect(() => attributeTypedArgs({ issueId: "i", url: "u", createAsUser: "Code Reviewer" }, link!, "Task Agent")).toThrow(/conflicts with the session author/);

		const literal = injectCreateAsUser('mutation { attachmentLinkURL(issueId: "i", url: "u", createAsUser: "Code Reviewer") { success } }', {}, [link!], "Task Agent");
		expect(literal.document).toContain('createAsUser: "Task Agent"');
		expect(literal.document).not.toContain('"Code Reviewer"');
		const missing = injectCreateAsUser('mutation { attachmentLinkURL(issueId: "i", url: "u") { success } }', {}, [link!], "Task Agent");
		expect(missing.document).toContain('createAsUser: "Task Agent"');
		const variable = injectCreateAsUser(
			"mutation M($who: String) { attachmentLinkURL(issueId: \"i\", url: \"u\", createAsUser: $who) { success } }",
			{ who: "Code Reviewer" },
			[link!],
			"Task Agent",
		);
		expect(variable.variables).toEqual({ who: "Task Agent" });
	});

	test("a null author (main session) injects nothing and rejects any caller-supplied createAsUser", () => {
		const link = attributionTargets(schema).get("attachmentLinkURL")!;
		expect(attributeTypedArgs({ issueId: "i", url: "u" }, link, null)).toEqual({ issueId: "i", url: "u" });
		expect(() => attributeTypedArgs({ issueId: "i", url: "u", createAsUser: "Code Reviewer" }, link, null)).toThrow(/not allowed/);

		const linkDoc = 'mutation { attachmentLinkURL(issueId: "i", url: "u") { success } }';
		expect(injectCreateAsUser(linkDoc, {}, [link], null)).toEqual({ document: linkDoc, variables: {} });
		const issueDoc = "mutation M($input: IssueCreateInput!) { issueCreate(input: $input) { success } }";
		const input = { title: "T", teamId: "t" };
		expect(injectCreateAsUser(issueDoc, { input }, targets, null)).toEqual({ document: issueDoc, variables: { input } });
		expect(() => injectCreateAsUser(issueDoc, { input: { ...input, createAsUser: "X" } }, targets, null)).toThrow(/not allowed/);
		expect(() =>
			injectCreateAsUser('mutation { attachmentLinkURL(issueId: "i", url: "u", createAsUser: "X") { success } }', {}, [link], null),
		).toThrow(/not allowed/);
		expect(() =>
			injectCreateAsUser('mutation { issueCreate(input: {title: "T", teamId: "t", createAsUser: "X"}) { success } }', {}, targets, null),
		).toThrow(/not allowed/);
	});
});

test("the pinned SDL on disk is the one the catalog was generated from", () => {
	const sdl = fs.readFileSync(path.join(ROOT, "schema", "linear.schema.graphql"), "utf8");
	const rebuilt = buildSchema(sdl);
	expect(Object.keys(rebuilt.getQueryType()!.getFields()).length + Object.keys(rebuilt.getMutationType()!.getFields()).length).toBe(495);
});
