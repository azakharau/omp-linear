import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as path from "node:path";
import { type Connection, createCredentialStore } from "../src/auth/store";
import { authorLabel, resolveAuthor } from "../src/identity/actor";
import { SEARCH_TOOL, createLinearExtension } from "../src/index";
import { type LinearSessionState, STATE_ENTRY_TYPE } from "../src/state";
import {
	type Host,
	type HostSession,
	type HostSessionManager,
	type ModelRequest,
	PRISTINE_HOST,
	type ScriptedCall,
	fakeModelServer,
	loadHost,
	openSession,
	runLoaderPathProof,
	tempDir,
} from "./harness";

const agentDir = tempDir("omp-linear-agent-");
const storePath = path.join(agentDir, "linear", "connections.json");
let host: Host;

beforeAll(async () => {
	host = await loadHost(PRISTINE_HOST);
});
afterAll(() => fs.rmSync(agentDir, { recursive: true, force: true }));

interface LinearRequest {
	authorization: string | null;
	body: { query: string; variables?: Record<string, unknown> };
}

function fakeLinear(respond: (body: LinearRequest["body"], authorization: string | null) => unknown) {
	const requests: LinearRequest[] = [];
	const server = Bun.serve({
		port: 0,
		fetch: async request => {
			const body = (await request.json()) as LinearRequest["body"];
			const authorization = request.headers.get("authorization");
			requests.push({ authorization, body });
			const reply = respond(body, authorization);
			return reply instanceof Response ? reply : Response.json(reply);
		},
	});
	return { requests, url: server.url.toString(), stop: () => server.stop(true) };
}

function toolNamesOf(request: ModelRequest): string[] {
	return request.tools.map(t => t.name);
}

function toolOutputs(request: ModelRequest): string[] {
	return (request.input ?? [])
		.filter((item): item is { type: string; output: string } => (item as { type?: string }).type === "function_call_output")
		.map(item => item.output);
}

function isLinearOperation(name: string): boolean {
	return name.startsWith("lq_") || name.startsWith("lm_");
}

function seedState(sessionManager: HostSessionManager, state: LinearSessionState): void {
	sessionManager.appendCustomEntry(STATE_ENTRY_TYPE, state);
}

async function storeConnection(connection: Connection): Promise<() => Promise<boolean>> {
	const store = createCredentialStore(storePath);
	await store.upsert(connection);
	return () => store.remove(connection.id);
}

/** API keys always act as the user; `actor=app` needs an OAuth connection (bearer token, no refresh). */
function connection(id: string, actor: "user" | "app"): Connection {
	const base = { id, label: id, workspace: null, createdAt: new Date().toISOString() };
	return actor === "user"
		? { ...base, kind: "api_key", actor, secret: { apiKey: `lin_api_${id}` } }
		: { ...base, kind: "oauth", actor, secret: { accessToken: `oauth_${id}`, refreshToken: null, expiresAt: null, scope: null } };
}

/** Prompts once and returns the first tool output the model receives in request `index`. */
async function promptForOutput(session: HostSession, model: ReturnType<typeof fakeModelServer>, index: number): Promise<string> {
	await session.prompt("go");
	const output = toolOutputs(model.requests[index]!)[0];
	if (output === undefined) throw new Error(`no tool output in model request ${index}`);
	return output;
}

const sentinel = (pi: { registerTool(def: unknown): void }) =>
	pi.registerTool({
		name: "unrelated_sentinel",
		label: "Sentinel",
		description: "NON_LINEAR_SENTINEL_TOOL",
		parameters: { type: "object", properties: {}, additionalProperties: false },
		loadMode: "essential",
		approval: "read",
		async execute() {
			return { content: [{ type: "text", text: "sentinel" }] };
		},
	});

interface Scenario {
	script: ScriptedCall[];
	endpoint?: string;
	activation?: boolean;
	attribution?: boolean;
	sessionManager?: HostSessionManager;
	fetchImpl?: typeof fetch;
	openUrl?: (url: string) => Promise<void>;
	settings?: Record<string, unknown>;
	settingsInstance?: unknown;
	notifications?: { message: string; level: string }[];
	cwd?: string;
	agentId?: string;
	/** Opens the session as a `task` subagent (`ctx.agent.kind === "sub"`) of `parentId`. */
	child?: { name: string; parentId: string };
}

async function withSession<T>(o: Scenario, body: (session: HostSession, model: ReturnType<typeof fakeModelServer>) => Promise<T>): Promise<T> {
	const model = fakeModelServer(o.script);
	const extension = createLinearExtension({
		agentDir,
		endpoint: o.endpoint ?? "http://127.0.0.1:9/graphql",
		activation: o.activation,
		attribution: o.attribution,
		fetchImpl: o.fetchImpl,
		openUrl: o.openUrl,
	});
	const session = await openSession({
		host,
		agentDir,
		sessionManager: o.sessionManager ?? host.SessionManager.inMemory(),
		extensions: [sentinel, extension],
		modelUrl: model.url,
		toolNames: ["unrelated_sentinel", "read", "write"],
		settings: o.settings,
		settingsInstance: o.settingsInstance,
		notifications: o.notifications,
		cwd: o.cwd,
		agentId: o.agentId,
		extras: o.child ? { taskDepth: 1, agentName: o.child.name, parentAgentId: o.child.parentId } : undefined,
	});
	try {
		return await body(session, model);
	} finally {
		await session.dispose();
		model.stop();
	}
}

/** `linear_tool_search` is an xd:// device: the model calls it through `write`. */
const searchCall = (args: Record<string, unknown>): ScriptedCall => ["write", { i: "Linear search", path: `xd://${SEARCH_TOOL}`, content: JSON.stringify(args) }];
const activateCall = (tool: string): ScriptedCall => searchCall({ activate: tool });

describe("linear extension in a real OMP session", () => {
	test("first model request lists linear_tool_search as a device and exposes no Linear tool; everything else is registered but inactive", async () => {
		await withSession({ script: [] }, async (session, model) => {
			await session.prompt("hello");
			const seen = toolNamesOf(model.requests[0]!);
			expect(seen).toContain("unrelated_sentinel");
			expect(seen.filter(name => name.startsWith("linear_") || isLinearOperation(name))).toEqual([]);
			expect(JSON.stringify(model.requests[0]!)).toContain(`- ${SEARCH_TOOL} — Search the private Linear catalog`);
			const all = session.getAllToolNames();
			expect(all.filter(isLinearOperation).length).toBe(550);
			for (const name of ["linear_graphql", "linear_schema_help", "linear_connections", "linear_issue_create"]) {
				expect(all).toContain(name);
				expect(seen).not.toContain(name);
			}
		});
	}, 30_000); // First session in the file: cold host start-up (read/write transport, xd:// catalog).

	test("a query returns candidates only and activates nothing", async () => {
		await withSession({ script: [searchCall({ query: "create issue" })] }, async (session, model) => {
			await session.prompt("find me the create issue tool");
			const output = toolOutputs(model.requests[1]!)[0]!;
			expect(output).toContain("linear_issue_create");
			expect(output).toContain("Nothing was activated");
			expect(session.getActiveToolNames().filter(name => isLinearOperation(name) || (name.startsWith("linear_") && name !== SEARCH_TOOL))).toEqual([]);
			expect(toolNamesOf(model.requests[1]!)).not.toContain("linear_issue_create");
		});
	});

	test("activate swaps exactly one Linear operation, keeps unrelated tools and persists the choice", async () => {
		const script: ScriptedCall[] = [activateCall("lq_issue"), activateCall("lm_issueCreate"), activateCall("linear_graphql")];
		await withSession({ script }, async (session, model) => {
			await session.prompt("activate");
			expect(toolNamesOf(model.requests[1]!)).toContain("lq_issue");
			const afterSecond = toolNamesOf(model.requests[2]!);
			expect(afterSecond).toContain("lm_issueCreate");
			expect(afterSecond).not.toContain("lq_issue");
			expect(afterSecond).toContain("unrelated_sentinel");
			expect(afterSecond).not.toContain(SEARCH_TOOL);
			const afterThird = toolNamesOf(model.requests[3]!);
			expect(afterThird).toContain("linear_graphql");
			expect(afterThird).not.toContain("lm_issueCreate");
			expect(session.getActiveToolNames()).toContain("linear_graphql");
			const branch = session.sessionManager.getBranch() as { type: string; customType?: string; data?: LinearSessionState }[];
			const states = branch.filter(e => e.type === "custom" && e.customType === STATE_ENTRY_TYPE);
			expect(states.at(-1)?.data?.activeOperation).toBe("linear_graphql");
		});
	});

	test("activation assertions are falsifiable: with the activation seam off, nothing changes", async () => {
		await withSession({ script: [activateCall("lq_issue")], activation: false }, async (session, model) => {
			await session.prompt("activate");
			expect(toolNamesOf(model.requests[1]!)).not.toContain("lq_issue");
			expect(session.getActiveToolNames()).not.toContain("lq_issue");
			expect(toolOutputs(model.requests[1]!)[0]).toContain("disabled");
		});
	});

	test("no connection selected: typed and raw tools error out and Linear is never contacted", async () => {
		let fetches = 0;
		const countingFetch = (async (input: string | URL | Request, init?: RequestInit) => {
			fetches++;
			return fetch(input, init);
		}) as typeof fetch;
		const script: ScriptedCall[] = [
			activateCall("lq_viewer"),
			["lq_viewer", { i: "Reading viewer" }],
			activateCall("linear_graphql"),
			["linear_graphql", { i: "Raw", document: "query { viewer { id } }" }],
		];
		await withSession({ script, fetchImpl: countingFetch }, async (session, model) => {
			await session.prompt("who am I");
			const outputs = [...toolOutputs(model.requests[2]!), ...toolOutputs(model.requests[4]!)];
			expect(outputs.length).toBe(2);
			for (const output of outputs) expect(output).toContain("No Linear connection selected");
			expect(fetches).toBe(0);
			expect(session.getActiveToolNames()).toContain("linear_graphql");
		});
	});

	test("connected: one typed call is exactly one Linear request carrying the stored API key header", async () => {
		const remove = await storeConnection(connection("key-test", "user"));
		const linear = fakeLinear(() => ({ data: { viewer: { id: "user-1", name: "Tester" } } }));
		const sessionManager = host.SessionManager.inMemory();
		seedState(sessionManager, { connectionId: "key-test", activeOperation: null, actor: null });
		const script: ScriptedCall[] = [activateCall("lq_viewer"), ["lq_viewer", { i: "Reading viewer" }]];
		try {
			await withSession({ script, endpoint: `${linear.url}graphql`, sessionManager }, async (session, model) => {
				const output = await promptForOutput(session, model, 2);
				expect(output).toContain("Tester");
				expect(output).not.toContain("lin_api_key-test");
				expect(linear.requests.length).toBe(1);
				expect(linear.requests[0]!.authorization).toBe("lin_api_key-test");
				expect(linear.requests[0]!.body.query).toContain("viewer");
			});
		} finally {
			linear.stop();
			await remove();
		}
	});

	test("linear.apiKeyFile: without /linear-use a typed call sends the file key, which never reaches the model; the connection reports source=file", async () => {
		const project = tempDir("omp-linear-keyfile-");
		const keyFile = path.join(project, "linear.env");
		const secret = "lin_api_keyfile_secret_7d2a";
		fs.writeFileSync(keyFile, `export LINEAR_API_KEY="${secret}"\n`);
		fs.mkdirSync(path.join(project, ".omp"), { recursive: true });
		fs.writeFileSync(path.join(project, ".omp", "config.yml"), ["linear:", `  apiKeyFile: ${keyFile}`, ""].join("\n"));
		const linear = fakeLinear(() => ({ data: { viewer: { id: "user-1", name: "Tester" } } }));
		const script: ScriptedCall[] = [
			activateCall("lq_viewer"),
			["lq_viewer", { i: "Reading viewer" }],
			activateCall("linear_connections"),
			["linear_connections", { i: "Listing" }],
		];
		try {
			const settingsInstance = await host.Settings.loadIsolated({ inMemory: true, cwd: project, agentDir });
			await withSession({ script, endpoint: `${linear.url}graphql`, cwd: project, settingsInstance }, async (session, model) => {
				await session.prompt("viewer and connections");
				expect(toolOutputs(model.requests[2]!)[0]).toContain("Tester");
				expect(linear.requests.map(r => r.authorization)).toEqual([secret]);
				const listed = JSON.parse(toolOutputs(model.requests[4]!)[0]!) as { selected: string | null; effective: { id: string; source: string } };
				expect(listed.selected).toBeNull();
				expect(listed.effective).toMatchObject({ id: "api-key-file", source: "file" });
				expect(model.requests.some(r => JSON.stringify(r).includes(secret))).toBe(false);
				expect(session.sessionManager.getBranch().some(entry => JSON.stringify(entry).includes(secret))).toBe(false);
			});
		} finally {
			linear.stop();
			fs.rmSync(project, { recursive: true, force: true });
		}
	});

	test("native deny: tools.approval denies lm_issueCreate before execute, so a valid connection makes zero requests", async () => {
		const remove = await storeConnection(connection("key-deny", "user"));
		const linear = fakeLinear(() => ({ data: { issueCreate: { success: true, issue: { id: "i1", identifier: "ABC-1" } } } }));
		const input = { teamId: "team-1", title: "Denied" };
		const script: ScriptedCall[] = [activateCall("lm_issueCreate"), ["lm_issueCreate", { i: "Creating", input }]];
		try {
			const denied = host.SessionManager.inMemory();
			seedState(denied, { connectionId: "key-deny", activeOperation: null, actor: null });
			await withSession(
				{ script, endpoint: `${linear.url}graphql`, sessionManager: denied, settings: { "tools.approval": { lm_issueCreate: "deny" } } },
				async (session, model) => {
					expect(await promptForOutput(session, model, 2)).toMatch(/blocked by user policy/);
					expect(linear.requests.length).toBe(0);
				},
			);
			const allowed = host.SessionManager.inMemory();
			seedState(allowed, { connectionId: "key-deny", activeOperation: null, actor: null });
			await withSession({ script, endpoint: `${linear.url}graphql`, sessionManager: allowed }, async (session, model) => {
				expect(await promptForOutput(session, model, 2)).toContain("ABC-1");
				expect(linear.requests.length).toBe(1);
			});
		} finally {
			linear.stop();
			await remove();
		}
	});

	test("actor=app: Main and two concurrent subagent sessions each attribute mutations to their own ctx.agent author; actor=user sends none", async () => {
		const linear = fakeLinear(body => {
			const key = body.query.includes("commentCreate") ? "commentCreate" : "issueCreate";
			return { data: { [key]: { success: true, [key === "issueCreate" ? "issue" : "comment"]: { id: "x" } } } };
		});
		const removeApp = await storeConnection(connection("key-app", "app"));
		const removeUser = await storeConnection(connection("key-user", "user"));
		const rawMutation = 'mutation ($input: CommentCreateInput!) { c: commentCreate(input: $input) { success } }';
		const scriptFor = (): ScriptedCall[] => [
			activateCall("lm_issueCreate"),
			["lm_issueCreate", { i: "Creating", input: { teamId: "team-1", title: "Attributed" } }],
			activateCall("linear_graphql"),
			["linear_graphql", { i: "Raw", document: rawMutation, variables: { input: { issueId: "i1", body: "hi" } } }],
		];
		const run = async (connectionId: string, agentId: string, attribution?: boolean, child?: Scenario["child"]) => {
			const sessionManager = host.SessionManager.inMemory();
			seedState(sessionManager, { connectionId, activeOperation: null, actor: null });
			return withSession({ script: scriptFor(), endpoint: `${linear.url}graphql`, sessionManager, agentId, attribution, child }, async (_session, model) => {
				await _session.prompt("create and comment");
				expect(toolOutputs(model.requests[2]!)[0]).not.toMatch(/failed|error/i);
				expect(toolOutputs(model.requests[4]!)[0]).not.toMatch(/failed|error/i);
			});
		};
		const task = { name: "task", parentId: "Main" };
		try {
			await Promise.all([run("key-app", "Main"), run("key-app", "0-Child1", undefined, task), run("key-app", "1-Child2", undefined, task)]);
			const labels = ["OMP · Main", "OMP · task [0-Child1]", "OMP · task [1-Child2]"];
			const createAsUsers = linear.requests.map(r => (r.body.variables?.input as { createAsUser?: string } | undefined)?.createAsUser);
			expect(linear.requests.length).toBe(6);
			expect(createAsUsers.every(value => typeof value === "string")).toBe(true);
			expect(new Set(createAsUsers)).toEqual(new Set(labels));
			for (const label of labels) expect(createAsUsers.filter(v => v === label).length).toBe(2);

			linear.requests.length = 0;
			await run("key-user", "2-UserActor", undefined, task);
			expect(linear.requests.length).toBe(2);
			expect(linear.requests.every(r => (r.body.variables?.input as { createAsUser?: string }).createAsUser === undefined)).toBe(true);

			linear.requests.length = 0;
			await run("key-app", "3-NoAttribution", false, task);
			expect(linear.requests.length).toBe(2);
			expect(linear.requests.every(r => (r.body.variables?.input as { createAsUser?: string }).createAsUser === undefined)).toBe(true);
		} finally {
			linear.stop();
			await removeApp();
			await removeUser();
		}
	});

	test("actor=app: ergonomic create, comment and link ops carry the ctx.agent author of the main and the child session; actor=user sends none", async () => {
		const uuid = "11111111-2222-4333-8444-555555555555";
		const linear = fakeLinear(body => {
			if (body.query.includes("issueCreate(")) return { data: { issueCreate: { success: true, issue: { id: uuid } } } };
			if (body.query.includes("commentCreate(")) return { data: { commentCreate: { success: true, comment: { id: uuid } } } };
			if (body.query.includes("attachmentLinkURL(")) return { data: { attachmentLinkURL: { success: true, attachment: { id: uuid } } } };
			return { data: { issue: { id: uuid, identifier: "ABC-1" }, comment: { id: uuid, body: "hi" }, attachment: { id: uuid, url: "https://x.test/pr/1" } } };
		});
		const removeApp = await storeConnection(connection("ergo-app", "app"));
		const removeUser = await storeConnection(connection("ergo-user", "user"));
		const script: ScriptedCall[] = [
			activateCall("linear_issue_create"),
			["linear_issue_create", { i: "Creating", team: uuid, title: "Attributed" }],
			activateCall("linear_issue_comment_add"),
			["linear_issue_comment_add", { i: "Commenting", issue: uuid, body: "hi" }],
			activateCall("linear_issue_link_add"),
			["linear_issue_link_add", { i: "Linking", issue: uuid, url: "https://x.test/pr/1" }],
		];
		const authorOf = (r: (typeof linear.requests)[number]) => {
			const vars = r.body.variables ?? {};
			return ((vars.input as { createAsUser?: string } | undefined)?.createAsUser ?? vars.createAsUser) as string | undefined;
		};
		const run = async (connectionId: string, agentId: string, child?: Scenario["child"]) => {
			linear.requests.length = 0;
			const sessionManager = host.SessionManager.inMemory();
			seedState(sessionManager, { connectionId, activeOperation: null, actor: null });
			await withSession({ script, endpoint: `${linear.url}graphql`, sessionManager, agentId, child }, async (session, model) => {
				await session.prompt("create, comment, link");
				for (const index of [2, 4, 6]) expect(toolOutputs(model.requests[index]!)[0]).not.toMatch(/failed|error/i);
			});
			const mutations = linear.requests.filter(r => r.body.query.trimStart().startsWith("mutation"));
			expect(mutations.length).toBe(3);
			return mutations.map(authorOf);
		};
		try {
			expect(await run("ergo-app", "Main")).toEqual(["OMP · Main", "OMP · Main", "OMP · Main"]);
			const childLabel = "OMP · reviewer [0-Ergo]";
			expect(await run("ergo-app", "0-Ergo", { name: "reviewer", parentId: "Main" })).toEqual([childLabel, childLabel, childLabel]);
			expect(await run("ergo-user", "1-Ergo", { name: "reviewer", parentId: "Main" })).toEqual([undefined, undefined, undefined]);
		} finally {
			linear.stop();
			await removeApp();
			await removeUser();
		}
	}, 30_000);

	test("actor=app rejects a caller-supplied createAsUser that differs from the session author, before any request", async () => {
		const linear = fakeLinear(() => ({ data: { issueCreate: { success: true, issue: { id: "x" } } } }));
		const remove = await storeConnection(connection("key-app2", "app"));
		const sessionManager = host.SessionManager.inMemory();
		seedState(sessionManager, { connectionId: "key-app2", activeOperation: null, actor: null });
		const script: ScriptedCall[] = [
			activateCall("lm_issueCreate"),
			["lm_issueCreate", { i: "Creating", input: { teamId: "team-1", title: "Spoof", createAsUser: "someone else" } }],
		];
		try {
			await withSession({ script, endpoint: `${linear.url}graphql`, sessionManager }, async (session, model) => {
				expect(await promptForOutput(session, model, 2)).toContain("conflicts with the session author");
				expect(linear.requests.length).toBe(0);
			});
		} finally {
			linear.stop();
			await remove();
		}
	});

	test("typed selection cannot smuggle a sibling root field: lm_issueArchive with an injected issueDelete errors before any request", async () => {
		const linear = fakeLinear(() => ({ data: { issueArchive: { success: true }, extra: { success: true } } }));
		const remove = await storeConnection(connection("key-sel", "user"));
		const sessionManager = host.SessionManager.inMemory();
		seedState(sessionManager, { connectionId: "key-sel", activeOperation: null, actor: null });
		const script: ScriptedCall[] = [
			activateCall("lm_issueArchive"),
			["lm_issueArchive", { i: "Archiving", id: "issue-1", selection: '{ success } extra: issueDelete(id:"x"){success}' }],
		];
		try {
			await withSession({ script, endpoint: `${linear.url}graphql`, sessionManager }, async (session, model) => {
				expect(await promptForOutput(session, model, 2)).toMatch(/invalid selection/);
				expect(linear.requests.length).toBe(0);
			});
		} finally {
			linear.stop();
			await remove();
		}
	});

	test("raw mutation through a root fragment spread: actor=app still attributes, and success:false behind the fragment alias is reported", async () => {
		const linear = fakeLinear(() => ({ data: { made: { success: false } } }));
		const remove = await storeConnection(connection("key-frag", "app"));
		const sessionManager = host.SessionManager.inMemory();
		seedState(sessionManager, { connectionId: "key-frag", activeOperation: null, actor: null });
		const document = [
			"mutation Create($input: IssueCreateInput!) { ...Roots }",
			"fragment Roots on Mutation { made: issueCreate(input: $input) { success } }",
		].join("\n");
		const script: ScriptedCall[] = [
			activateCall("linear_graphql"),
			["linear_graphql", { i: "Raw", document, variables: { input: { teamId: "team-1", title: "Frag" } } }],
		];
		try {
			await withSession({ script, endpoint: `${linear.url}graphql`, sessionManager, agentId: "0-Frag", child: { name: "reviewer", parentId: "Main" } }, async (session, model) => {
				const output = await promptForOutput(session, model, 2);
				expect(output).toMatch(/mutation made reported success=false/);
				expect(linear.requests.length).toBe(1);
				expect((linear.requests[0]!.body.variables?.input as { createAsUser?: string }).createAsUser).toBe("OMP · reviewer [0-Frag]");
			});
		} finally {
			linear.stop();
			await remove();
		}
	});

	test("raw document with a post-pin field is sent with validation=unknown and the server's answer is returned", async () => {
		const linear = fakeLinear(() => ({ data: { viewer: { id: "user-1", futureField: 42 } } }));
		const remove = await storeConnection(connection("key-drift", "user"));
		const sessionManager = host.SessionManager.inMemory();
		seedState(sessionManager, { connectionId: "key-drift", activeOperation: null, actor: null });
		const script: ScriptedCall[] = [activateCall("linear_graphql"), ["linear_graphql", { i: "Raw", document: "{ viewer { id futureField } }" }]];
		try {
			await withSession({ script, endpoint: `${linear.url}graphql`, sessionManager }, async (session, model) => {
				const output = await promptForOutput(session, model, 2);
				expect(output).toMatch(/Validation unknown/);
				expect(output).toContain("fields: User.futureField");
				expect(output).toContain("futureField");
				expect(output).toContain("42");
				expect(linear.requests.length).toBe(1);
			});
		} finally {
			linear.stop();
			await remove();
		}
	});

	test("schema help describes any pinned type: IssueCreateInput lists createAsUser", async () => {
		const script: ScriptedCall[] = [activateCall("linear_schema_help"), ["linear_schema_help", { i: "Help", name: "IssueCreateInput" }]];
		await withSession({ script }, async (session, model) => {
			const output = await promptForOutput(session, model, 2);
			expect(output).toContain("IssueCreateInput");
			expect(output).toContain("createAsUser");
		});
	});

	test("a mutation answered with HTTP 500 is reported as outcome unknown (may have applied), never as rejected", async () => {
		const linear = fakeLinear(() => new Response("upstream exploded", { status: 500 }));
		const remove = await storeConnection(connection("key-500", "user"));
		const sessionManager = host.SessionManager.inMemory();
		seedState(sessionManager, { connectionId: "key-500", activeOperation: null, actor: null });
		const script: ScriptedCall[] = [activateCall("lm_issueArchive"), ["lm_issueArchive", { i: "Archiving", id: "issue-1" }]];
		try {
			await withSession({ script, endpoint: `${linear.url}graphql`, sessionManager }, async (session, model) => {
				const output = await promptForOutput(session, model, 2);
				expect(output).toMatch(/HTTP 500/);
				expect(output).toMatch(/mutation outcome is UNKNOWN/);
				expect(output).not.toMatch(/rejected|refused/);
				expect(linear.requests.length).toBe(1);
			});
		} finally {
			linear.stop();
			await remove();
		}
	});

	test("reopening a session restores the selected connection and the activated operation", async () => {
		const sessionsDir = tempDir("omp-linear-sessions-");
		try {
			const sessionFile = path.join(sessionsDir, "session.jsonl");
			const first = await host.SessionManager.open(sessionFile, sessionsDir);
			seedState(first, { connectionId: "conn-A", activeOperation: null, actor: null });
			let sessionId = "";
			await withSession({ script: [activateCall("lq_teams")], sessionManager: first }, async session => {
				await session.prompt("activate teams");
				sessionId = session.sessionManager.getSessionId();
			});
			const reopened = await host.SessionManager.open(sessionFile, sessionsDir);
			await withSession({ script: [activateCall("linear_connections"), ["linear_connections", { i: "Listing" }]], sessionManager: reopened }, async (session, model) => {
				expect(session.sessionManager.getSessionId()).toBe(sessionId);
				await session.prompt("connections");
				expect(toolNamesOf(model.requests[0]!)).toContain("lq_teams");
				const rawOutput = toolOutputs(model.requests[2]!).find(o => o.includes('"selected"'));
				if (!rawOutput) throw new Error(`connections output missing: ${JSON.stringify(toolOutputs(model.requests[2]!))}`);
				const output = JSON.parse(rawOutput) as { selected: string; activeOperation: string; author: { label: string } };
				expect(output.selected).toBe("conn-A");
				expect(output.activeOperation).toBe("linear_connections");
				expect(output.author.label).toBe("OMP · Main");
			});
		} finally {
			fs.rmSync(sessionsDir, { recursive: true, force: true });
		}
	});

	test("real loader path: package.json omp.extensions loads src/index.ts, reads ctx.agent from the host runner and uses the host agent dir", async () => {
		// One host per process, loaded through the host's own loader: host identity, credentials under the host agent dir.
		const remove = await storeConnection(connection("loader-proof", "user"));
		try {
			const { toolNames, authorLabel, connectionIds } = runLoaderPathProof(PRISTINE_HOST, agentDir);
			expect(toolNames).toContain(SEARCH_TOOL);
			expect(toolNames).toContain("linear_connections");
			expect(toolNames.filter(isLinearOperation).length).toBe(550);
			expect(authorLabel).toBe("OMP · Main");
			expect(connectionIds).toContain("loader-proof");
		} finally {
			await remove();
		}
	}, 30_000);

	test("author labels: main is OMP · Main, a subagent names its definition and registry id, a missing identity throws", () => {
		expect(authorLabel({ kind: "main", id: "Main", name: "main" })).toBe("OMP · Main");
		expect(authorLabel({ kind: "sub", id: "0-Review", name: "reviewer" })).toBe("OMP · reviewer [0-Review]");
		expect(() => resolveAuthor(undefined)).toThrow(/OMP >= 18.20.0 is required/);
	});

	test("diagnostics: a 401 that echoes the credential is reported with status, kind, message and outcome but never the secret", async () => {
		const seen: string[] = [];
		const linear = fakeLinear((_body, authorization) => {
			seen.push(authorization ?? "");
			return new Response(JSON.stringify({ errors: [{ message: `invalid token ${authorization}` }] }), {
				status: 401,
				headers: { "content-type": "application/json" },
			});
		});
		const remove = await storeConnection(connection("key-diag", "user"));
		const sessionManager = host.SessionManager.inMemory();
		seedState(sessionManager, { connectionId: "key-diag", activeOperation: null, actor: null });
		const script: ScriptedCall[] = [activateCall("lq_issue"), ["lq_issue", { i: "Reading", id: "issue-1" }]];
		try {
			await withSession({ script, endpoint: `${linear.url}graphql`, sessionManager }, async (session, model) => {
				const output = await promptForOutput(session, model, 2);
				expect(seen).toEqual(["lin_api_key-diag"]);
				expect(output).toContain("auth HTTP 401");
				expect(output).toContain("invalid token");
				expect(output).toMatch(/Outcome rejected: the server refused the request/);
				expect(output).not.toContain("lin_api_key-diag");
				expect(output).not.toContain("key-diag");
				expect(JSON.stringify(model.requests[2]?.input)).not.toContain("lin_api_key-diag");
			});
		} finally {
			linear.stop();
			await remove();
		}
	});

	test("diagnostics: partial success (data + errors) renders the data, every error with its path and the rate-limit remaining, typed and raw", async () => {
		const linear = fakeLinear(
			() =>
				new Response(
					JSON.stringify({
						data: { issue: { id: "issue-1", title: "Half there", assignee: null } },
						errors: [{ message: "assignee lookup failed", path: ["issue", "assignee"] }],
					}),
					{ headers: { "content-type": "application/json", "x-ratelimit-requests-remaining": "1499" } },
				),
		);
		const remove = await storeConnection(connection("key-partial", "user"));
		const sessionManager = host.SessionManager.inMemory();
		seedState(sessionManager, { connectionId: "key-partial", activeOperation: null, actor: null });
		const script: ScriptedCall[] = [
			activateCall("lq_issue"),
			["lq_issue", { i: "Reading", id: "issue-1" }],
			activateCall("linear_graphql"),
			["linear_graphql", { i: "Raw", document: '{ issue(id: "issue-1") { id title assignee { id } } }' }],
		];
		try {
			await withSession({ script, endpoint: `${linear.url}graphql`, sessionManager }, async (session, model) => {
				await session.prompt("go");
				for (const index of [2, 4]) {
					const output = toolOutputs(model.requests[index]!)[0] ?? "";
					expect(output).toContain("Half there");
					expect(output).toContain("Partial errors");
					expect(output).toContain('assignee lookup failed at ["issue","assignee"]');
					expect(output).toContain("Rate limit: 1499 requests remaining");
				}
				expect(linear.requests.length).toBe(2);
			});
		} finally {
			linear.stop();
			await remove();
		}
	});

	test("/linear-login without linear.oauth settings reports the missing configuration and stores nothing", async () => {
		const notifications: { message: string; level: string }[] = [];
		const before = createCredentialStore(storePath).list().length;
		await withSession({ script: [], notifications }, async session => {
			await session.prompt("/linear-login");
		});
		const error = notifications.find(n => n.level === "error");
		expect(error?.message).toMatch(/missing: clientId, redirectPort/);
		expect(error?.message).toContain("linear.oauth.redirectPort");
		expect(createCredentialStore(storePath).list().length).toBe(before);
	});

	test("/linear-login reads linear.oauth from the project's .omp/config.yml and completes PKCE on the configured redirect port", async () => {
		const project = tempDir("omp-linear-oauth-project-");
		const probe = Bun.serve({ port: 0, fetch: () => new Response("") });
		const redirectPort = probe.port;
		probe.stop(true);
		const tokenRequests: URLSearchParams[] = [];
		const tokenServer = Bun.serve({
			port: 0,
			fetch: async req => {
				tokenRequests.push(new URLSearchParams(await req.text()));
				return Response.json({ access_token: "oauth-access", refresh_token: "oauth-refresh", expires_in: 3600, scope: "read write" });
			},
		});
		fs.mkdirSync(path.join(project, ".omp"));
		fs.writeFileSync(
			path.join(project, ".omp", "config.yml"),
			[
				"linear:",
				"  oauth:",
				"    clientId: settings-client",
				`    redirectPort: ${redirectPort}`,
				"    redirectPath: /oauth/done",
				`    tokenUrl: http://127.0.0.1:${tokenServer.port}/token`,
				"    scopes: [read]",
			].join("\n"),
		);
		const notifications: { message: string; level: string }[] = [];
		const authorizeUrls: URL[] = [];
		const openUrl = async (url: string) => {
			const authorize = new URL(url);
			authorizeUrls.push(authorize);
			const redirect = new URL(authorize.searchParams.get("redirect_uri")!);
			redirect.searchParams.set("code", "auth-code");
			redirect.searchParams.set("state", authorize.searchParams.get("state")!);
			await fetch(redirect);
		};
		try {
			const settingsInstance = await host.Settings.loadIsolated({ inMemory: true, cwd: project, agentDir });
			await withSession({ script: [], notifications, openUrl, cwd: project, settingsInstance }, async session => {
				await session.prompt("/linear-login app settings-login");
			});
			expect(notifications.filter(n => n.level === "error")).toEqual([]);
			expect(authorizeUrls.length).toBe(1);
			const authorize = authorizeUrls[0]!;
			expect(authorize.searchParams.get("client_id")).toBe("settings-client");
			expect(authorize.searchParams.get("redirect_uri")).toBe(`http://127.0.0.1:${redirectPort}/oauth/done`);
			expect(authorize.searchParams.get("scope")).toBe("read");
			expect(authorize.searchParams.get("actor")).toBe("app");
			expect(tokenRequests.length).toBe(1);
			expect(tokenRequests[0]!.get("redirect_uri")).toBe(`http://127.0.0.1:${redirectPort}/oauth/done`);
			expect(tokenRequests[0]!.get("client_id")).toBe("settings-client");
			const stored = createCredentialStore(storePath).list().find(c => c.label === "settings-login");
			expect(stored).toMatchObject({ kind: "oauth", actor: "app" });
			expect(notifications.some(n => n.message.includes(`${stored!.id} (settings-login, app) stored and selected`))).toBe(true);
			await createCredentialStore(storePath).remove(stored!.id);
		} finally {
			tokenServer.stop(true);
			fs.rmSync(project, { recursive: true, force: true });
		}
	});

	test("/linear-login with a malformed linear.oauth block names the offending key and stores nothing", async () => {
		const project = tempDir("omp-linear-oauth-malformed-");
		fs.mkdirSync(path.join(project, ".omp"));
		fs.writeFileSync(path.join(project, ".omp", "config.yml"), ["linear:", "  oauth:", "    clientId: settings-client", "    redirectPort: not-a-port"].join("\n"));
		const notifications: { message: string; level: string }[] = [];
		const before = createCredentialStore(storePath).list().length;
		try {
			const settingsInstance = await host.Settings.loadIsolated({ inMemory: true, cwd: project, agentDir });
			await withSession({ script: [], notifications, cwd: project, settingsInstance }, async session => {
				await session.prompt("/linear-login app malformed");
			});
			const error = notifications.find(n => n.level === "error");
			expect(error?.message).toMatch(/^Linear settings are invalid: /);
			expect(error?.message).toContain("linear.oauth.redirectPort");
			expect(createCredentialStore(storePath).list().length).toBe(before);
		} finally {
			fs.rmSync(project, { recursive: true, force: true });
		}
	});
});

