import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import { createLinearExtension } from "../src/index";
import {
	type Host,
	type HostSession,
	type HostSessionManager,
	PATCHED_HOST,
	PRISTINE_HOST,
	fakeModelServer,
	loadHost,
	openSession,
	runLoaderPathProof,
	tempDir,
} from "./harness";

const agentDir = tempDir("omp-linear-patch-agent-");
let patched: Host;
let pristine: Host;

beforeAll(async () => {
	if (!fs.existsSync(PATCHED_HOST)) throw new Error("run `bun run scripts/prepare-patched-host.ts` first");
	[patched, pristine] = await Promise.all([loadHost(PATCHED_HOST), loadHost(PRISTINE_HOST)]);
});
afterAll(() => fs.rmSync(agentDir, { recursive: true, force: true }));

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

interface RestrictedChildOptions {
	host: Host;
	allowlist: string[];
	disabledAgents?: string[];
}

/**
 * Opens a session the way the task executor opens a restricted child: `restrictToolNames: true`,
 * explicit `toolNames`, and the parent's extension factories forwarded as prepared extensions.
 */
async function openRestrictedChild(o: RestrictedChildOptions): Promise<{ session: HostSession; model: ReturnType<typeof fakeModelServer> }> {
	const model = fakeModelServer([]);
	const extension = createLinearExtension({ agentDir, endpoint: "http://127.0.0.1:9/graphql" });
	const session = await openSession({
		host: o.host,
		agentDir,
		sessionManager: o.host.SessionManager.inMemory(),
		extensions: [],
		modelUrl: model.url,
		toolNames: ["read", "grep"],
		settings: {
			"task.restrictedExtensionTools": o.allowlist,
			...(o.disabledAgents ? { "task.disabledAgents": o.disabledAgents } : {}),
		},
		extras: {
			restrictToolNames: true,
			preloadedPreparedExtensions: [
				{ factory: sentinel, path: "inline:sentinel", resolvedPath: "inline:sentinel", error: null },
				{ factory: extension, path: "inline:linear", resolvedPath: "inline:linear", error: null },
			],
		},
	});
	return { session, model };
}

describe("host patch: restricted children and extension tools", () => {
	test("patched host: a restricted child registers only the allowlisted extension tools and can activate within them", async () => {
		const { session, model } = await openRestrictedChild({ host: patched, allowlist: ["linear_tool_search", "linear_schema_help"] });
		try {
			await session.prompt("hello");
			const seen = model.requests[0]!.tools.map(t => t.name);
			expect(seen).toContain("read");
			expect(seen).toContain("linear_tool_search");
			expect(seen).not.toContain("unrelated_sentinel");
			expect(seen.some(name => name.startsWith("lq_") || name.startsWith("lm_"))).toBe(false);
			const registered = session.getAllToolNames();
			expect(registered).toContain("linear_schema_help");
			for (const name of ["linear_graphql", "linear_connections", "unrelated_sentinel", "lq_issue", "lm_issueCreate"]) {
				expect(registered).not.toContain(name);
			}
			await session.setActiveToolsByName(["read", "linear_tool_search", "linear_schema_help"]);
			expect(session.getActiveToolNames()).toContain("linear_schema_help");
		} finally {
			await session.dispose();
			model.stop();
		}
	});

	test("patched host: the child cannot activate a tool outside its ceiling", async () => {
		const { session, model } = await openRestrictedChild({ host: patched, allowlist: ["linear_tool_search", "lq_issue"] });
		try {
			await expect(session.setActiveToolsByName(["read", "linear_tool_search", "lq_issue"])).resolves.toBeUndefined();
			expect(session.getActiveToolNames()).toContain("lq_issue");
			await expect(session.setActiveToolsByName(["read", "linear_tool_search", "lm_issueCreate"])).rejects.toThrow(/outside its ceiling: lm_issueCreate/);
			expect(session.getActiveToolNames()).not.toContain("lm_issueCreate");
			await expect(session.setActiveToolsByName(["read", "bash"])).rejects.toThrow(/outside its ceiling: bash/);
		} finally {
			await session.dispose();
			model.stop();
		}
	});

	test("negative control: the unpatched host ignores the allowlist and exposes no extension tools", async () => {
		const { session, model } = await openRestrictedChild({ host: pristine, allowlist: ["linear_tool_search", "linear_schema_help"] });
		try {
			await session.prompt("hello");
			const seen = model.requests[0]!.tools.map(t => t.name);
			expect(seen).toContain("read");
			expect(seen).not.toContain("linear_tool_search");
			expect(seen).not.toContain("linear_schema_help");
			expect(session.getAllToolNames()).not.toContain("linear_tool_search");
		} finally {
			await session.dispose();
			model.stop();
		}
	});

	test("negative control: the unpatched host has no ceiling on runtime activation", async () => {
		const { session, model } = await openRestrictedChild({ host: pristine, allowlist: [] });
		try {
			await expect(session.setActiveToolsByName(["read", "bash"])).resolves.toBeUndefined();
		} finally {
			await session.dispose();
			model.stop();
		}
	});

	test("patched host: ctx.getEffectiveAgents is the task tool's roster: disabledAgents, spawn policy and session agents", async () => {
		const model = fakeModelServer([]);
		let effective: (() => Promise<{ name: string }[]>) | undefined;
		const probe = (pi: { on(event: string, handler: (event: unknown, ctx: Record<string, unknown>) => void): void }) =>
			pi.on("session_start", (_event, ctx) => {
				effective = ctx.getEffectiveAgents as typeof effective;
			});
		const rosterWith = async (extras: { settings?: Record<string, unknown>; extras?: Record<string, unknown>; sessionManager?: HostSessionManager }, body?: (session: HostSession) => Promise<void>) => {
			const session = await openSession({
				host: patched,
				agentDir,
				sessionManager: extras.sessionManager ?? patched.SessionManager.inMemory(),
				extensions: [probe],
				modelUrl: model.url,
				toolNames: ["read"],
				...extras,
			});
			try {
				expect(effective).toBeDefined();
				await body?.(session);
				return (await effective!()).map(a => a.name);
			} finally {
				await session.dispose();
			}
		};
		try {
			const baseline = await rosterWith({});
			expect(baseline.length).toBeGreaterThan(0);
			const disabled = baseline[0]!;

			const filtered = await rosterWith({ settings: { "task.disabledAgents": [disabled] } });
			expect(filtered).not.toContain(disabled);
			expect(filtered.length).toBe(baseline.length - 1);

			// spawns: "none" forbids every child; a single allowed name clamps the roster to it.
			expect(await rosterWith({ extras: { spawns: "none" } })).toEqual([]);
			expect(await rosterWith({ extras: { spawns: baseline[1] ?? disabled } })).toEqual([baseline[1] ?? disabled]);

			// A session-scoped model mention (read from the branch at open) is part of the roster, exactly as the task tool sees it.
			const withMention = patched.SessionManager.inMemory();
			withMention.appendCustomEntry("model_mention", { agent: "m1", selector: "openai/gpt-4o", name: "GPT-4o" });
			const mentioned = await rosterWith({ sessionManager: withMention }, async session => {
				expect(session.getSessionAgents().map(a => a.name)).toContain("m1");
			});
			expect(mentioned).toContain("m1");
			expect(mentioned.length).toBe(baseline.length + 1);
		} finally {
			model.stop();
		}
	});

	test("patched host: the real loader binds the package to the patched tree's own AgentRegistry, not node_modules", () => {
		// The copied `package.json` (`name`/`exports`) makes `.patched-host` self-referencing, so the
		// host's rewrite of `@oh-my-pi/pi-coding-agent/*` lands in its own tree; rename it and this reports null.
		expect(Object.is(patched.AgentRegistry, pristine.AgentRegistry)).toBe(false);
		const { toolNames, authorLabel, storePath } = runLoaderPathProof(PATCHED_HOST, agentDir);
		expect(toolNames).toContain("linear_connections");
		expect(authorLabel).toBe("OMP · Main");
		expect(storePath).toBe(`${agentDir}/linear/connections.json`);
	}, 30_000);
});
