import { afterAll, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { buildSchema, parse, validate, type OperationDefinitionNode } from "graphql";

import { createLinearClient, type LinearClient } from "../src/client/graphql.ts";
import { ergonomicOps, OP_DOCUMENTS, type ActorContext } from "../src/ops/index.ts";
import {
	ISSUE_LOOKUP,
	LABEL_LOOKUP,
	MILESTONE_LOOKUP,
	PROJECT_LOOKUP,
	STATE_LOOKUP,
	TEAM_LOOKUP,
} from "../src/ops/resolve.ts";

const schema = buildSchema(readFileSync("schema/linear.schema.graphql", "utf8"));

const ALL_DOCUMENTS: Record<string, string> = {
	...OP_DOCUMENTS,
	TEAM_LOOKUP,
	ISSUE_LOOKUP,
	STATE_LOOKUP,
	LABEL_LOOKUP,
	PROJECT_LOOKUP,
	MILESTONE_LOOKUP,
};

const USER_CTX: ActorContext = { actor: "user", authorLabel: "Codey" };
const APP_CTX: ActorContext = { actor: "app", authorLabel: "Codey" };

type Responder = (variables: Record<string, unknown>) => unknown;

interface Recorded {
	operation: "query" | "mutation";
	name: string;
	variables: Record<string, unknown>;
}

const servers: Server[] = [];

afterAll(() => {
	for (const server of servers) server.close();
});

/** Fake Linear endpoint: it parses the incoming document and answers per operation name. */
function fakeLinear(
	responders: Record<string, Responder>,
	options: { hangOn?: string[]; timeoutMs?: number } = {},
): Promise<{ client: LinearClient; calls: Recorded[] }> {
	const calls: Recorded[] = [];
	const server = createServer((request, response) => {
		const chunks: Buffer[] = [];
		request.on("data", chunk => chunks.push(chunk as Buffer));
		request.on("end", () => {
			const payload = JSON.parse(Buffer.concat(chunks).toString("utf8")) as {
				query: string;
				variables?: Record<string, unknown>;
			};
			const document = parse(payload.query);
			const operation = document.definitions.find(
				(definition): definition is OperationDefinitionNode => definition.kind === "OperationDefinition",
			);
			if (!operation) throw new Error("no operation in document");
			const name = operation.name?.value ?? "";
			calls.push({
				operation: operation.operation === "mutation" ? "mutation" : "query",
				name,
				variables: payload.variables ?? {},
			});
			// Simulates "the request was sent, the answer never came".
			if (options.hangOn?.includes(name)) return;
			const responder = responders[name];
			const body = responder
				? JSON.stringify({ data: responder(payload.variables ?? {}) })
				: JSON.stringify({ errors: [{ message: `no canned response for ${name}` }] });
			response.writeHead(200, { "content-type": "application/json" });
			response.end(body);
		});
	});
	servers.push(server);
	const { promise, resolve } = Promise.withResolvers<{ client: LinearClient; calls: Recorded[] }>();
	server.listen(0, "127.0.0.1", () => {
		const address = server.address() as AddressInfo;
		resolve({
			calls,
			client: createLinearClient({
				endpoint: `http://127.0.0.1:${address.port}/graphql`,
				getAuthHeaders: async () => ({ authorization: "Bearer test-token" }),
				timeoutMs: options.timeoutMs ?? 5_000,
			}),
		});
	});
	return promise;
}

function opNamed(name: string) {
	const op = ergonomicOps.find(entry => entry.name === name);
	if (!op) throw new Error(`missing ergonomic op ${name}`);
	return op;
}

const ISSUE_ABC12 = {
	id: "11111111-1111-4111-8111-111111111111",
	identifier: "ABC-12",
	title: "Fix the thing",
	description: null,
	url: "https://linear.app/x/issue/ABC-12",
	priority: 2,
	createdAt: "2026-09-01T00:00:00.000Z",
	updatedAt: "2026-09-20T00:00:00.000Z",
	state: { id: "s-progress", name: "In Progress", type: "started" },
	team: { id: "t-1", key: "ABC", name: "Alpha" },
	assignee: null,
	project: null,
	projectMilestone: null,
	labels: { nodes: [] },
};

const ISSUE_FOUND = () => ({ issues: { nodes: [{ id: ISSUE_ABC12.id, identifier: "ABC-12" }] } });

describe("operation documents", () => {
	test("every hand-written document validates against the pinned Linear schema", () => {
		for (const [name, document] of Object.entries(ALL_DOCUMENTS)) {
			const errors = validate(schema, parse(document));
			expect(`${name}: ${errors.map(error => error.message).join(" | ")}`).toBe(`${name}: `);
		}
	});

	test("the catalog exposes the twelve contracted ops with JSON Schema parameters", () => {
		expect(ergonomicOps.map(op => op.name).sort()).toEqual([
			"linear_issue_comment_add",
			"linear_issue_create",
			"linear_issue_get",
			"linear_issue_relation_add",
			"linear_issue_search",
			"linear_issue_transition",
			"linear_issue_update",
			"linear_milestone_create",
			"linear_milestone_update",
			"linear_project_create",
			"linear_project_get",
			"linear_project_update",
		]);
		for (const op of ergonomicOps) {
			expect(op.parameters.type).toBe("object");
			expect(op.parameters.additionalProperties).toBe(false);
			// Attribution comes from the connection, never from model-supplied arguments.
			const properties = op.parameters.properties as Record<string, unknown> | undefined;
			expect(Object.keys(properties ?? {})).not.toContain("createAsUser");
		}
		expect(
			ergonomicOps
				.filter(op => op.tier === "read")
				.map(op => op.name)
				.sort(),
		).toEqual(["linear_issue_get", "linear_issue_search", "linear_project_get"]);
	});
});

describe("linear_project_get", () => {
	const PROJECT = {
		id: "p-1",
		name: "Roadmap",
		description: "next quarter",
		url: "https://linear.app/x/project/p-1",
		startDate: null,
		targetDate: "2026-12-01",
		createdAt: "2026-09-01T00:00:00.000Z",
		updatedAt: "2026-09-20T00:00:00.000Z",
		status: { id: "ps-1", name: "Planned", type: "planned" },
		lead: { id: "u-1", name: "Ada", displayName: "ada" },
		teams: { nodes: [{ id: "t-1", key: "ABC", name: "Alpha" }] },
		projectMilestones: { nodes: [{ id: "m-1", name: "Beta", targetDate: "2026-11-01" }] },
	};

	test("resolves the project by name and returns the fetched entity", async () => {
		const { client, calls } = await fakeLinear({
			LinearProjectLookup: () => ({ projects: { nodes: [{ id: "p-1", name: "Roadmap" }] } }),
			LinearProjectGet: () => ({ project: PROJECT }),
		});

		const result = await opNamed("linear_project_get").run(client, { project: "Roadmap" }, USER_CTX);

		expect(calls.map(call => call.name)).toEqual(["LinearProjectLookup", "LinearProjectGet"]);
		expect(calls[1]!.variables).toEqual({ id: "p-1" });
		expect(result).toEqual({ project: PROJECT });
	});

	test("an ambiguous project name lists the candidates and fetches nothing", async () => {
		const { client, calls } = await fakeLinear({
			LinearProjectLookup: () => ({
				projects: {
					nodes: [
						{ id: "p-1", name: "Roadmap" },
						{ id: "p-2", name: "Roadmap" },
					],
				},
			}),
			LinearProjectGet: () => ({ project: PROJECT }),
		});

		await expect(
			opNamed("linear_project_get").run(client, { project: "Roadmap" }, USER_CTX),
		).rejects.toThrow(/^ambiguous project "Roadmap": 2 candidates/);
		expect(calls.map(call => call.name)).toEqual(["LinearProjectLookup"]);
		expect(calls.filter(call => call.operation === "mutation")).toEqual([]);
	});
});

describe("actor attribution", () => {
	test("an app actor attributes issues and comments to the author label", async () => {
		const { client, calls } = await fakeLinear({
			LinearTeamLookup: () => ({ teams: { nodes: [{ id: "t-1", key: "ABC", name: "Alpha" }] } }),
			LinearIssueCreate: () => ({ issueCreate: { success: true, issue: { id: ISSUE_ABC12.id } } }),
			LinearIssueGet: () => ({ issue: ISSUE_ABC12 }),
			LinearIssueLookup: ISSUE_FOUND,
			LinearCommentCreate: () => ({ commentCreate: { success: true, comment: { id: "c-1" } } }),
			LinearCommentGet: () => ({ comment: { id: "c-1", body: "hi", url: null, createdAt: "x", user: null, issue: null } }),
		});

		await opNamed("linear_issue_create").run(client, { team: "ABC", title: "New" }, APP_CTX);
		await opNamed("linear_issue_comment_add").run(client, { issue: "ABC-12", body: "hi" }, APP_CTX);

		const inputs = calls
			.filter(call => call.operation === "mutation")
			.map(call => call.variables.input as Record<string, unknown>);
		expect(inputs.map(input => input.createAsUser)).toEqual(["Codey", "Codey"]);
		expect(inputs.every(input => !("displayIconUrl" in input))).toBe(true);
	});

	test("a user actor never sends createAsUser", async () => {
		const { client, calls } = await fakeLinear({
			LinearTeamLookup: () => ({ teams: { nodes: [{ id: "t-1", key: "ABC", name: "Alpha" }] } }),
			LinearIssueCreate: () => ({ issueCreate: { success: true, issue: { id: ISSUE_ABC12.id } } }),
			LinearIssueGet: () => ({ issue: ISSUE_ABC12 }),
		});

		await opNamed("linear_issue_create").run(client, { team: "ABC", title: "New" }, USER_CTX);

		const input = calls.find(call => call.operation === "mutation")!.variables.input as Record<string, unknown>;
		expect(input).toEqual({ teamId: "t-1", title: "New" });
	});
});

describe("linear_issue_update", () => {
	test("performs exactly one mutation and one refetch", async () => {
		const { client, calls } = await fakeLinear({
			LinearIssueLookup: ISSUE_FOUND,
			LinearIssueGet: () => ({ issue: ISSUE_ABC12 }),
			LinearStateLookup: () => ({
				workflowStates: {
					nodes: [{ id: "s-done", name: "Done", type: "completed", team: { id: "t-1", key: "ABC" } }],
				},
			}),
			LinearIssueUpdate: () => ({ issueUpdate: { success: true, issue: { id: ISSUE_ABC12.id } } }),
		});

		const result = await opNamed("linear_issue_update").run(
			client,
			{ issue: "ABC-12", state: "Done", expectedStateName: "In Progress" },
			USER_CTX,
		);

		expect(calls.filter(call => call.operation === "mutation").map(call => call.name)).toEqual([
			"LinearIssueUpdate",
		]);
		expect(calls.at(-1)).toMatchObject({ operation: "query", name: "LinearIssueGet" });
		const mutation = calls.find(call => call.operation === "mutation")!;
		expect(mutation.variables).toEqual({ id: ISSUE_ABC12.id, input: { stateId: "s-done" } });
		expect(result).toMatchObject({ issue: { identifier: "ABC-12" } });
	});

	test("an expected-state mismatch throws before any mutation", async () => {
		const { client, calls } = await fakeLinear({
			LinearIssueLookup: ISSUE_FOUND,
			LinearIssueGet: () => ({ issue: ISSUE_ABC12 }),
			LinearIssueUpdate: () => ({ issueUpdate: { success: true, issue: { id: ISSUE_ABC12.id } } }),
		});

		await expect(
			opNamed("linear_issue_update").run(
				client,
				{ issue: "ABC-12", title: "new title", expectedStateName: "Todo" },
				USER_CTX,
			),
		).rejects.toThrow(/expected ABC-12 to be in state "Todo", observed "In Progress"/);
		expect(calls.filter(call => call.operation === "mutation")).toEqual([]);
	});

	test("an updatedAt mismatch throws before any mutation", async () => {
		const { client, calls } = await fakeLinear({
			LinearIssueLookup: ISSUE_FOUND,
			LinearIssueGet: () => ({ issue: ISSUE_ABC12 }),
			LinearIssueUpdate: () => ({ issueUpdate: { success: true, issue: { id: ISSUE_ABC12.id } } }),
		});

		await expect(
			opNamed("linear_issue_update").run(
				client,
				{ issue: "ABC-12", title: "new title", expectedUpdatedAt: "2026-01-01T00:00:00.000Z" },
				USER_CTX,
			),
		).rejects.toThrow(/updatedAt/);
		expect(calls.filter(call => call.operation === "mutation")).toEqual([]);
	});

	test("a success:false payload is an error", async () => {
		const { client, calls } = await fakeLinear({
			LinearIssueLookup: ISSUE_FOUND,
			LinearIssueGet: () => ({ issue: ISSUE_ABC12 }),
			LinearIssueUpdate: () => ({ issueUpdate: { success: false, issue: null } }),
		});

		await expect(
			opNamed("linear_issue_update").run(client, { issue: "ABC-12", title: "t" }, USER_CTX),
		).rejects.toThrow(/issueUpdate reported success: false/);
		// A rejected mutation changed nothing, so there is nothing to refetch.
		expect(calls.filter(call => call.name === "LinearIssueGet")).toEqual([]);
	});

	test("an unanswered mutation is reported as possibly applied and is never refetched", async () => {
		const { client, calls } = await fakeLinear(
			{
				LinearIssueLookup: ISSUE_FOUND,
				LinearIssueGet: () => ({ issue: ISSUE_ABC12 }),
			},
			// Real timers: the point of the test is a request that is genuinely in
			// flight when the client's deadline expires.
			{ hangOn: ["LinearIssueUpdate"], timeoutMs: 80 },
		);

		await expect(
			opNamed("linear_issue_update").run(client, { issue: "ABC-12", title: "t" }, USER_CTX),
		).rejects.toThrow(/may or may not have been applied/);
		expect(calls.filter(call => call.operation === "mutation").length).toBe(1);
		expect(calls.filter(call => call.name === "LinearIssueGet")).toEqual([]);
	});
});

describe("reference resolution", () => {
	test("an ambiguous team lists both candidates and mutates nothing", async () => {
		const { client, calls } = await fakeLinear({
			LinearTeamLookup: () => ({
				teams: {
					nodes: [
						{ id: "t-1", key: "ABC", name: "Alpha" },
						{ id: "t-2", key: "ABD", name: "Alpha" },
					],
				},
			}),
			LinearIssueCreate: () => ({ issueCreate: { success: true, issue: { id: "x" } } }),
		});

		const error = await opNamed("linear_issue_create")
			.run(client, { team: "Alpha", title: "New" }, USER_CTX)
			.then(
				() => null,
				(reason: unknown) => reason as Error,
			);
		expect(error?.message).toMatch(/^ambiguous team "Alpha": 2 candidates: /);
		expect(error?.message).toContain("t-1 (ABC Alpha)");
		expect(error?.message).toContain("t-2 (ABD Alpha)");
		expect(calls.filter(call => call.operation === "mutation")).toEqual([]);
	});

	test("an unknown workflow state is a not-found error, not a silent skip", async () => {
		const { client, calls } = await fakeLinear({
			LinearTeamLookup: () => ({ teams: { nodes: [{ id: "t-1", key: "ABC", name: "Alpha" }] } }),
			LinearStateLookup: () => ({ workflowStates: { nodes: [] } }),
		});

		await expect(
			opNamed("linear_issue_create").run(client, { team: "ABC", title: "New", state: "Nope" }, USER_CTX),
		).rejects.toThrow(/workflow state not found: "Nope"/);
		expect(calls.filter(call => call.operation === "mutation")).toEqual([]);
	});

	test("a UUID reference skips the lookup request entirely", async () => {
		const { client, calls } = await fakeLinear({ LinearIssueGet: () => ({ issue: ISSUE_ABC12 }) });
		await opNamed("linear_issue_get").run(client, { issue: ISSUE_ABC12.id }, USER_CTX);
		expect(calls.map(call => call.name)).toEqual(["LinearIssueGet"]);
	});
});

describe("linear_issue_create", () => {
	test("resolves names to ids, mutates once and refetches once", async () => {
		const { client, calls } = await fakeLinear({
			LinearTeamLookup: () => ({ teams: { nodes: [{ id: "t-1", key: "ABC", name: "Alpha" }] } }),
			LinearStateLookup: () => ({
				workflowStates: {
					nodes: [{ id: "s-todo", name: "Todo", type: "unstarted", team: { id: "t-1", key: "ABC" } }],
				},
			}),
			LinearLabelLookup: () => ({
				issueLabels: { nodes: [{ id: "l-bug", name: "bug", team: { id: "t-1", key: "ABC" } }] },
			}),
			LinearIssueCreate: () => ({ issueCreate: { success: true, issue: { id: ISSUE_ABC12.id } } }),
			LinearIssueGet: () => ({ issue: ISSUE_ABC12 }),
		});

		const result = await opNamed("linear_issue_create").run(
			client,
			{ team: "ABC", title: "New issue", state: "Todo", labels: ["bug"], priority: 2 },
			USER_CTX,
		);

		const mutations = calls.filter(call => call.operation === "mutation");
		expect(mutations.map(call => call.name)).toEqual(["LinearIssueCreate"]);
		expect(mutations[0]!.variables).toEqual({
			input: { teamId: "t-1", title: "New issue", stateId: "s-todo", labelIds: ["l-bug"], priority: 2 },
		});
		expect(calls.at(-1)).toMatchObject({ name: "LinearIssueGet" });
		expect(result).toMatchObject({ issue: { id: ISSUE_ABC12.id } });
	});
});

describe("linear_issue_transition", () => {
	test("reports the requested and the observed state after the refetch", async () => {
		const { client, calls } = await fakeLinear({
			LinearIssueLookup: ISSUE_FOUND,
			LinearStateLookup: () => ({
				workflowStates: {
					nodes: [{ id: "s-done", name: "Done", type: "completed", team: { id: "t-1", key: "ABC" } }],
				},
			}),
			LinearIssueUpdate: () => ({ issueUpdate: { success: true, issue: { id: ISSUE_ABC12.id } } }),
			// The server moved the issue to a different state than requested.
			LinearIssueGet: () => ({
				issue: { ...ISSUE_ABC12, state: { id: "s-review", name: "In Review", type: "started" } },
			}),
		});

		const result = await opNamed("linear_issue_transition").run(
			client,
			{ issue: "ABC-12", targetState: "Done", expectedStateName: "In Review" },
			USER_CTX,
		);

		expect(result).toMatchObject({ requestedState: "Done", observedState: "In Review" });
		expect(calls.filter(call => call.operation === "mutation").length).toBe(1);
	});
});

describe("linear_issue_search", () => {
	test("is a single request that passes the cursor through and returns pageInfo verbatim", async () => {
		const { client, calls } = await fakeLinear({
			LinearIssueSearch: () => ({
				issueSearch: {
					nodes: [{ id: "i1", identifier: "ABC-12", title: "Fix the thing" }],
					pageInfo: { hasNextPage: true, endCursor: "cursor-2" },
				},
			}),
		});

		const result = await opNamed("linear_issue_search").run(
			client,
			{ query: "thing", teamKey: "ABC", stateName: "In Progress", first: 10, after: "cursor-1" },
			USER_CTX,
		);

		expect(calls.length).toBe(1);
		expect(calls[0]!.variables).toEqual({
			query: "thing",
			filter: { team: { key: { eq: "ABC" } }, state: { name: { eq: "In Progress" } } },
			first: 10,
			after: "cursor-1",
			includeArchived: false,
		});
		expect(result).toEqual({
			nodes: [{ id: "i1", identifier: "ABC-12", title: "Fix the thing" }],
			pageInfo: { hasNextPage: true, endCursor: "cursor-2" },
		});
	});

	test("caps an oversized page request at 100", async () => {
		const { client, calls } = await fakeLinear({
			LinearIssueSearch: () => ({ issueSearch: { nodes: [], pageInfo: { hasNextPage: false, endCursor: null } } }),
		});
		await opNamed("linear_issue_search").run(client, { first: 5000 }, USER_CTX);
		expect(calls[0]!.variables.first).toBe(100);
	});
});

describe("comment, relation, project and milestone ops", () => {
	const canned: Record<string, Responder> = {
		LinearIssueLookup: ISSUE_FOUND,
		LinearCommentCreate: () => ({ commentCreate: { success: true, comment: { id: "c-1" } } }),
		LinearCommentGet: () => ({
			comment: {
				id: "c-1",
				body: "hello",
				url: "https://linear.app/x/comment/c-1",
				createdAt: "2026-09-22T00:00:00.000Z",
				user: { id: "u-1", displayName: "agent" },
				issue: { id: ISSUE_ABC12.id, identifier: "ABC-12" },
			},
		}),
		LinearIssueRelationCreate: () => ({
			issueRelationCreate: { success: true, issueRelation: { id: "r-1", issue: { id: ISSUE_ABC12.id } } },
		}),
		LinearIssueRelationsGet: () => ({
			issue: {
				id: ISSUE_ABC12.id,
				identifier: "ABC-12",
				updatedAt: ISSUE_ABC12.updatedAt,
				relations: { nodes: [] },
			},
		}),
		LinearTeamLookup: () => ({ teams: { nodes: [{ id: "t-1", key: "ABC", name: "Alpha" }] } }),
		LinearProjectCreate: () => ({ projectCreate: { success: true, project: { id: "p-1" } } }),
		LinearProjectLookup: () => ({ projects: { nodes: [{ id: "p-1", name: "Roadmap" }] } }),
		LinearProjectUpdate: () => ({ projectUpdate: { success: true, project: { id: "p-1" } } }),
		LinearProjectGet: () => ({
			project: {
				id: "p-1",
				name: "Roadmap",
				description: "",
				url: "https://linear.app/x/project/p-1",
				startDate: null,
				targetDate: null,
				createdAt: "2026-09-01T00:00:00.000Z",
				updatedAt: "2026-09-20T00:00:00.000Z",
				status: { id: "ps-1", name: "Planned", type: "planned" },
				lead: null,
			},
		}),
		LinearMilestoneCreate: () => ({
			projectMilestoneCreate: { success: true, projectMilestone: { id: "m-1" } },
		}),
		LinearMilestoneLookup: () => ({ projectMilestones: { nodes: [{ id: "m-1", name: "Beta" }] } }),
		LinearMilestoneUpdate: () => ({
			projectMilestoneUpdate: { success: true, projectMilestone: { id: "m-1" } },
		}),
		LinearMilestoneGet: () => ({
			projectMilestone: {
				id: "m-1",
				name: "Beta",
				description: null,
				targetDate: null,
				createdAt: "2026-09-01T00:00:00.000Z",
				updatedAt: "2026-09-20T00:00:00.000Z",
				project: { id: "p-1", name: "Roadmap" },
			},
		}),
	};

	const cases: { op: string; args: Record<string, unknown>; mutation: string; refetch: string }[] = [
		{
			op: "linear_issue_comment_add",
			args: { issue: "ABC-12", body: "hello" },
			mutation: "LinearCommentCreate",
			refetch: "LinearCommentGet",
		},
		{
			op: "linear_issue_relation_add",
			args: { issue: "ABC-12", relatedIssue: ISSUE_ABC12.id, type: "blocks" },
			mutation: "LinearIssueRelationCreate",
			refetch: "LinearIssueRelationsGet",
		},
		{
			op: "linear_project_create",
			args: { name: "Roadmap", teams: ["ABC"] },
			mutation: "LinearProjectCreate",
			refetch: "LinearProjectGet",
		},
		{
			op: "linear_project_update",
			args: { project: "Roadmap", description: "next quarter" },
			mutation: "LinearProjectUpdate",
			refetch: "LinearProjectGet",
		},
		{
			op: "linear_milestone_create",
			args: { project: "Roadmap", name: "Beta" },
			mutation: "LinearMilestoneCreate",
			refetch: "LinearMilestoneGet",
		},
		{
			op: "linear_milestone_update",
			args: { project: "Roadmap", milestone: "Beta", targetDate: "2026-12-01" },
			mutation: "LinearMilestoneUpdate",
			refetch: "LinearMilestoneGet",
		},
	];

	test("each mutates once and refetches the affected entity once", async () => {
		for (const scenario of cases) {
			const { client, calls } = await fakeLinear(canned);
			await opNamed(scenario.op).run(client, scenario.args, USER_CTX);
			expect(calls.filter(call => call.operation === "mutation").map(call => call.name)).toEqual([
				scenario.mutation,
			]);
			expect(calls.at(-1)?.name).toBe(scenario.refetch);
		}
	});
});
