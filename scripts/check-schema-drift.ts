/**
 * Schema drift: the pinned SDL (`schema/linear.schema.graphql`) against live Linear introspection.
 *
 * Reports root Query/Mutation fields present on only one side, argument changes on shared roots,
 * and every hand-written ergonomic document that no longer validates against the live schema or
 * uses a field, argument or enum value the live schema marks deprecated.
 *
 * With --write, the live schema replaces the pinned SDL. Then run `bun run generate:catalog`.
 * The live API is the source of truth: the SDK file in linear/linear lags behind it.
 *
 * Usage: bun run schema:check [--key-file <path>] [--json] [--endpoint <url>] [--write]
 *   The API key comes from --key-file (a `LINEAR_API_KEY=...` file) or the LINEAR_API_KEY variable.
 * Exit codes: 0 no drift (or written, with every ergonomic document valid), 1 drift found,
 * 2 the request failed.
 */
import * as fs from "node:fs";
import { fileURLToPath } from "node:url";
import {
	buildClientSchema,
	type GraphQLField,
	type GraphQLSchema,
	getIntrospectionQuery,
	type IntrospectionQuery,
	isIntrospectionType,
	isNonNullType,
	isSpecifiedScalarType,
	NoDeprecatedCustomRule,
	parse,
	printSchema,
	printType,
	specifiedRules,
	validate,
} from "graphql";
import { readApiKeyFile } from "../src/auth/key-file";
import { safeMessage } from "../src/client/graphql";
import { OP_DOCUMENTS } from "../src/ops/index";
import { LOOKUP_DOCUMENTS } from "../src/ops/resolve";
import { getSchema } from "../src/schema/catalog";

export interface RootDrift {
	liveOnly: string[];
	pinnedOnly: string[];
	/** Shared roots whose arguments differ: `+name!` added required, `+name` added optional, `-name` removed. */
	changedArgs: Record<string, string[]>;
}

export interface DriftReport {
	query: RootDrift;
	mutation: RootDrift;
	/** Named types whose printed definition (fields, arguments, values, descriptions) differs or exists on one side only. */
	changedTypes: string[];
	/** Hand-written documents with their live validation errors, deprecated usage included. */
	invalidDocuments: Record<string, string[]>;
	drift: boolean;
}

type FieldMap = Record<string, GraphQLField<unknown, unknown>>;

function compareRoots(pinned: FieldMap, live: FieldMap): RootDrift {
	const changedArgs: Record<string, string[]> = {};
	for (const name of Object.keys(pinned)) {
		const liveField = live[name];
		if (!liveField) continue;
		const pinnedArgs = new Set(pinned[name]!.args.map(arg => arg.name));
		const liveArgs = new Set(liveField.args.map(arg => arg.name));
		const changes = [
			...liveField.args.filter(arg => !pinnedArgs.has(arg.name)).map(arg => `+${arg.name}${isNonNullType(arg.type) && arg.defaultValue === undefined ? "!" : ""}`),
			...[...pinnedArgs].filter(arg => !liveArgs.has(arg)).map(arg => `-${arg}`),
		];
		if (changes.length > 0) changedArgs[name] = changes;
	}
	return {
		liveOnly: Object.keys(live).filter(name => !(name in pinned)).sort(),
		pinnedOnly: Object.keys(pinned).filter(name => !(name in live)).sort(),
		changedArgs,
	};
}

/** Pure comparison; no network. */
export function compareSchemas(pinned: GraphQLSchema, live: GraphQLSchema, documents: Record<string, string>): DriftReport {
	const query = compareRoots(pinned.getQueryType()?.getFields() ?? {}, live.getQueryType()?.getFields() ?? {});
	const mutation = compareRoots(pinned.getMutationType()?.getFields() ?? {}, live.getMutationType()?.getFields() ?? {});
	const changedTypes = compareTypes(pinned, live);
	const invalidDocuments: Record<string, string[]> = {};
	for (const [name, document] of Object.entries(documents)) {
		const errors = validate(live, parse(document), [...specifiedRules, NoDeprecatedCustomRule]).map(error => error.message);
		if (errors.length > 0) invalidDocuments[name] = errors;
	}
	const drift =
		[query, mutation].some(side => side.liveOnly.length + side.pinnedOnly.length + Object.keys(side.changedArgs).length > 0) ||
		changedTypes.length > 0 ||
		Object.keys(invalidDocuments).length > 0;
	return { query, mutation, changedTypes, invalidDocuments, drift };
}

/** Introspection types and built-in scalars are skipped: a built-in scalar appears only once something uses it. */
function compareTypes(pinned: GraphQLSchema, live: GraphQLSchema): string[] {
	const pinnedTypes = pinned.getTypeMap();
	const liveTypes = live.getTypeMap();
	const names = new Set(
		[...Object.values(pinnedTypes), ...Object.values(liveTypes)]
			.filter(type => !isIntrospectionType(type) && !isSpecifiedScalarType(type))
			.map(type => type.name),
	);
	return [...names]
		.filter(name => {
			const a = pinnedTypes[name];
			const b = liveTypes[name];
			return !a || !b || printType(a) !== printType(b);
		})
		.sort();
}

async function fetchLiveSchema(endpoint: string, apiKey: string): Promise<GraphQLSchema> {
	const response = await fetch(endpoint, {
		method: "POST",
		headers: { "content-type": "application/json", authorization: apiKey },
		body: JSON.stringify({ query: getIntrospectionQuery() }),
		signal: AbortSignal.timeout(60_000),
	});
	if (!response.ok) throw new Error(`introspection failed: HTTP ${response.status}`);
	const body = (await response.json()) as { data?: IntrospectionQuery; errors?: { message: string }[] };
	if (!body.data) throw new Error(`introspection failed: ${(body.errors ?? []).map(error => error.message).join("; ") || "no data"}`);
	return buildClientSchema(body.data);
}

function summary(report: DriftReport): string {
	const lines: string[] = [];
	for (const [label, side] of [["Query", report.query], ["Mutation", report.mutation]] as const) {
		lines.push(`${label}: ${side.liveOnly.length} live-only, ${side.pinnedOnly.length} pinned-only, ${Object.keys(side.changedArgs).length} with changed arguments`);
		if (side.liveOnly.length > 0) lines.push(`  live-only: ${side.liveOnly.join(", ")}`);
		if (side.pinnedOnly.length > 0) lines.push(`  pinned-only (may be internal, hidden from public introspection): ${side.pinnedOnly.join(", ")}`);
		for (const [root, changes] of Object.entries(side.changedArgs)) lines.push(`  ${root}: ${changes.join(" ")}`);
	}
	const invalid = Object.entries(report.invalidDocuments);
	lines.push(`Types with a changed definition: ${report.changedTypes.length}`);
	if (report.changedTypes.length > 0) lines.push(`  ${report.changedTypes.join(", ")}`);
	lines.push(`Ergonomic documents invalid or using deprecated fields against live schema: ${invalid.length}`);
	for (const [name, errors] of invalid) lines.push(`  ${name}: ${errors.join("; ")}`);
	lines.push(report.drift ? "Result: DRIFT" : "Result: no drift");
	return lines.join("\n");
}

if (import.meta.main) {
	const argv = process.argv.slice(2);
	const option = (name: string) => {
		const index = argv.indexOf(name);
		return index >= 0 ? argv[index + 1] : undefined;
	};
	let apiKey: string | undefined;
	try {
		const keyFile = option("--key-file");
		apiKey = keyFile ? readApiKeyFile(keyFile) : process.env.LINEAR_API_KEY;
		if (!apiKey) throw new Error("no API key: pass --key-file <path> or set LINEAR_API_KEY");
		const endpoint = option("--endpoint") ?? "https://api.linear.app/graphql";
		const live = await fetchLiveSchema(endpoint, apiKey);
		const report = compareSchemas(getSchema(), live, { ...OP_DOCUMENTS, ...LOOKUP_DOCUMENTS });
		console.log(argv.includes("--json") ? JSON.stringify(report, null, 2) : summary(report));
		if (argv.includes("--write")) {
			const target = fileURLToPath(new URL("../schema/linear.schema.graphql", import.meta.url));
			fs.writeFileSync(target, `# Linear GraphQL schema from live introspection of ${endpoint} (bun run schema:check --write).\n\n${printSchema(live)}\n`);
			console.log(`wrote ${target}; now run: bun run generate:catalog`);
			process.exit(Object.keys(report.invalidDocuments).length > 0 ? 1 : 0);
		}
		process.exit(report.drift ? 1 : 0);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error(`schema:check failed: ${safeMessage(message, apiKey ? [apiKey] : [])}`);
		process.exit(2);
	}
}

