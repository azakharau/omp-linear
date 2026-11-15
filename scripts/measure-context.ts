/**
 * Startup-context and activation measurement on the REAL installed `omp` binary.
 *
 * A fake OpenAI-Responses model on loopback records every request body and answers with
 * scripted tool calls; a fake Linear GraphQL server answers the extension. Each variant runs in
 * its own agent dir under `.scratch/measure/<variant>/`; HOME and XDG_* point into `.scratch`, so
 * the real `~/.omp` is never read or written. Tokens are counted with js-tiktoken `o200k_base`.
 *
 * Variants:
 *   none                   `--no-extensions`
 *   ext                    `-e src/index.ts` as shipped (`linear_tool_search` native, every other Linear tool inactive)
 *   ext-manifest           the package loaded from `extensions: [<repo>]` in the agent config.yml
 *   ext-search-device      comparison: only `linear_tool_search` remounted `loadMode: "discoverable"` (an xd:// device)
 *   ext-ergonomic-devices  search + utility + ergonomic tools discoverable (devices)
 *   ext-all-devices        every Linear tool discoverable
 *   mcp                    the official Linear MCP server (needs LINEAR_API_KEY or --key-file)
 *
 * Scenarios:
 *   S1  start-up: one request, final answer
 *   S2  reach `linear_issue_get` (activate through search when needed) and call it
 *   S3  same as S2 inside a `task` subagent
 *   S4  a `task` subagent whose agent definition restricts tools to `read`
 *
 * Usage: bun run scripts/measure-context.ts [--variants a,b] [--scenarios S1,S2] [--key-file path]
 *        [--api-key-file path-for-linear.apiKeyFile] [--omp /path/to/omp] [--out dir]
 * Writes `<out>/report.json` and `<out>/report.md` (default out: .scratch/measure).
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { getEncoding } from "js-tiktoken";

const ROOT = path.resolve(import.meta.dir, "..");
const ISSUE_UUID = "1e9f5a3c-6c1d-4f7e-9b2a-0c8d7e6f5a41";
const FAKE_ISSUE_IDENTIFIER = "SMK-1";
const DEFAULT_OMP = Bun.which("omp") ?? "omp";
const VARIANTS = ["none", "ext", "ext-manifest", "ext-search-device", "ext-ergonomic-devices", "ext-all-devices", "mcp"] as const;
type Variant = (typeof VARIANTS)[number];
const SCENARIOS = ["S1", "S2", "S3", "S4"] as const;
type Scenario = (typeof SCENARIOS)[number];
const TARGET_OP = "linear_issue_get";
const SEARCH = "linear_tool_search";

function argValue(name: string): string | undefined {
	const index = process.argv.indexOf(name);
	return index >= 0 ? process.argv[index + 1] : undefined;
}

const outDir = path.resolve(argValue("--out") ?? path.join(ROOT, ".scratch", "measure"));
const ompBin = argValue("--omp") ?? process.env.OMP_BIN ?? DEFAULT_OMP;
const selectedVariants = (argValue("--variants")?.split(",") ?? [...VARIANTS]) as Variant[];
const selectedScenarios = (argValue("--scenarios")?.split(",") ?? [...SCENARIOS]) as Scenario[];
const keyFile = argValue("--key-file");
const apiKeyFileSetting = argValue("--api-key-file");

// ---------------------------------------------------------------- request model

interface ResponsesTool {
	name?: string;
	type?: string;
	parameters?: unknown;
}

interface InputItem {
	type?: string;
	role?: string;
	content?: unknown;
	name?: string;
	call_id?: string;
	arguments?: string;
	output?: unknown;
}

interface ResponsesRequest {
	instructions?: string;
	input?: InputItem[];
	tools?: ResponsesTool[];
}

interface Recorded {
	conversation: string;
	body: ResponsesRequest;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function textOf(value: unknown): string {
	if (typeof value === "string") return value;
	return JSON.stringify(value ?? "");
}

const MARKER = /\[\[([A-Z0-9-]+)\]\]/;

/** The scenario marker of the first user message identifies the conversation (main or child). */
function conversationOf(body: ResponsesRequest): string {
	for (const item of body.input ?? []) {
		if (item.role !== "user") continue;
		const match = MARKER.exec(textOf(item.content));
		if (match) return match[1]!;
	}
	return "UNKNOWN";
}

function toolNames(body: ResponsesRequest): string[] {
	return (body.tools ?? []).map(tool => tool.name ?? tool.type ?? "?");
}

/** Host-authored text the model sees: instructions plus every non-tool-call input item. */
function hostText(body: ResponsesRequest): string {
	const parts = [body.instructions ?? ""];
	for (const item of body.input ?? []) {
		if (item.type === "function_call") continue;
		parts.push(textOf(item.content ?? item.output));
	}
	return parts.join("\n");
}

type Availability = "tool" | "device" | "absent";

function availability(body: ResponsesRequest, name: string): Availability {
	if (toolNames(body).includes(name)) return "tool";
	const text = hostText(body);
	if (text.includes(`xd://${name}`) || new RegExp(`(^|\\n)\\s*- \`?${name}\`? [—-]`).test(text)) return "device";
	return "absent";
}

interface CallRecord {
	name: string;
	args: Record<string, unknown>;
	output: string | null;
}

/** Calls made so far in this conversation, with their outputs; device writes are unwrapped. */
function callsOf(body: ResponsesRequest): CallRecord[] {
	const outputs = new Map<string, string>();
	for (const item of body.input ?? []) {
		if (item.type === "function_call_output" && item.call_id) outputs.set(item.call_id, textOf(item.output));
	}
	const calls: CallRecord[] = [];
	for (const item of body.input ?? []) {
		if (item.type !== "function_call" || !item.name) continue;
		let args: Record<string, unknown> = {};
		try {
			const parsed: unknown = JSON.parse(item.arguments ?? "{}");
			if (isRecord(parsed)) args = parsed;
		} catch {
			// keep empty args
		}
		let name = item.name;
		if (name === "write" && typeof args.path === "string" && args.path.startsWith("xd://")) {
			name = args.path.slice("xd://".length);
			try {
				const inner: unknown = JSON.parse(typeof args.content === "string" ? args.content : "{}");
				args = isRecord(inner) ? inner : {};
			} catch {
				args = {};
			}
		}
		calls.push({ name, args, output: item.call_id ? (outputs.get(item.call_id) ?? null) : null });
	}
	return calls;
}

// ---------------------------------------------------------------- scripted model

type Action = { kind: "call"; name: string; args: Record<string, unknown> } | { kind: "final"; text: string };

function invoke(body: ResponsesRequest, name: string, args: Record<string, unknown>): Action {
	const withIntent = { i: "Measuring", ...args };
	if (availability(body, name) === "tool") return { kind: "call", name, args: withIntent };
	return { kind: "call", name: "write", args: { i: "Measuring", path: `xd://${name}`, content: JSON.stringify(args) } };
}

/** Reach and call `linear_issue_get`, activating it through search when it is not yet available. */
function reachOperation(body: ResponsesRequest): Action {
	const calls = callsOf(body);
	if (calls.some(call => call.name === TARGET_OP)) return { kind: "final", text: "done" };
	if (availability(body, TARGET_OP) !== "absent") return invoke(body, TARGET_OP, { issue: ISSUE_UUID });
	if (!calls.some(call => call.name === SEARCH) && availability(body, SEARCH) !== "absent") {
		return invoke(body, SEARCH, { activate: TARGET_OP });
	}
	return { kind: "final", text: "unreachable" };
}

function spawnChild(body: ResponsesRequest, marker: string, agent?: string): Action {
	if (callsOf(body).some(call => call.name === "task")) return { kind: "final", text: "done" };
	const item: Record<string, unknown> = { task: `[[${marker}]] Read issue ${ISSUE_UUID} from Linear.`, solutionSpace: "one fix: scripted measurement", name: "Measure" };
	if (agent) item.agent = agent;
	return { kind: "call", name: "task", args: { i: "Measuring", context: "Scripted measurement.", tasks: [item] } };
}

/** Children finish through `yield` when the host offers it. */
function finish(body: ResponsesRequest, action: Action): Action {
	if (action.kind !== "final" || !toolNames(body).includes("yield")) return action;
	if (callsOf(body).some(call => call.name === "yield")) return action;
	return { kind: "call", name: "yield", args: { i: "Finishing", result: { data: action.text } } };
}

function decide(conversation: string, body: ResponsesRequest): Action {
	switch (conversation) {
		case "S1":
			return { kind: "final", text: "ok" };
		case "S2":
			return reachOperation(body);
		case "S3":
			return spawnChild(body, "CHILD-S2");
		case "S4":
			return spawnChild(body, "CHILD-R", "linear-restricted");
		case "CHILD-S2":
			return finish(body, reachOperation(body));
		case "CHILD-R":
			return finish(body, reachOperation(body));
		default:
			return { kind: "final", text: "ok" };
	}
}

let sequence = 0;

function sse(action: Action): Response {
	const completed = (id: string) => ({
		type: "response.completed",
		response: { id, status: "completed", usage: { input_tokens: 1, output_tokens: 1, total_tokens: 2, input_tokens_details: { cached_tokens: 0 } } },
	});
	const index = ++sequence;
	const events =
		action.kind === "call"
			? [
					{ type: "response.output_item.added", output_index: 0, item: { type: "function_call", id: `fc_${index}`, call_id: `call_${index}`, name: action.name, arguments: "" } },
					{ type: "response.function_call_arguments.done", output_index: 0, item_id: `fc_${index}`, arguments: JSON.stringify(action.args) },
					{ type: "response.output_item.done", output_index: 0, item: { type: "function_call", id: `fc_${index}`, call_id: `call_${index}`, name: action.name, arguments: JSON.stringify(action.args) } },
					completed(`r${index}`),
				]
			: [
					{ type: "response.output_text.delta", output_index: 0, delta: action.text },
					{ type: "response.output_item.done", output_index: 0, item: { type: "message", id: `m${index}`, role: "assistant", status: "completed", content: [{ type: "output_text", text: action.text }] } },
					completed(`r${index}`),
				];
	return new Response(events.map(event => `data: ${JSON.stringify(event)}\n\n`).join(""), { headers: { "content-type": "text/event-stream" } });
}

function startModel(recorded: Recorded[]) {
	return Bun.serve({
		port: 0,
		hostname: "127.0.0.1",
		fetch: async request => {
			const text = await request.text();
			let body: ResponsesRequest = {};
			try {
				const parsed: unknown = JSON.parse(text);
				if (isRecord(parsed)) body = parsed as ResponsesRequest;
			} catch {
				// non-JSON probes get a final answer
			}
			const conversation = conversationOf(body);
			recorded.push({ conversation, body });
			return sse(decide(conversation, body));
		},
	});
}

/** Fake Linear: an issue for `LinearIssueDetailGet`, a viewer for anything else. Records authorization headers. */
function startLinear(authorizations: string[]) {
	return Bun.serve({
		port: 0,
		hostname: "127.0.0.1",
		fetch: async request => {
			authorizations.push(request.headers.get("authorization") ?? "");
			const body: unknown = await request.json();
			const query = isRecord(body) && typeof body.query === "string" ? body.query : "";
			if (query.includes("LinearIssueDetailGet")) {
				return Response.json({
					data: {
						issue: {
							id: ISSUE_UUID, identifier: FAKE_ISSUE_IDENTIFIER, title: "Measured issue", description: null, url: "https://linear.app/x/issue/SMK-1",
							priority: 0, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z",
							state: { id: "s1", name: "Todo", type: "unstarted" }, team: { id: "t1", key: "SMK", name: "Smoke" },
							assignee: null, project: null, projectMilestone: null, labels: { nodes: [] },
							comments: { nodes: [], pageInfo: { hasNextPage: false } }, relations: { nodes: [] }, inverseRelations: { nodes: [] },
						},
					},
				});
			}
			return Response.json({ data: { viewer: { id: "u1", name: "Measure" } } });
		},
	});
}

// ---------------------------------------------------------------- variants

/**
 * Device variants are copies of the package whose entry wraps `pi.registerTool` and remounts the
 * selected Linear tools `loadMode: "discoverable"`. A copy (not a wrapper importing `src/index.ts`)
 * keeps the extension module itself as the loader's entry, exactly as `-e src/index.ts` loads it.
 */
function variantModule(variant: Variant): string | null {
	if (variant === "none" || variant === "mcp" || variant === "ext-manifest") return null;
	if (variant === "ext") return path.join(ROOT, "src", "index.ts");
	const dir = path.join(outDir, "variants", variant);
	fs.rmSync(dir, { recursive: true, force: true });
	fs.mkdirSync(dir, { recursive: true });
	fs.cpSync(path.join(ROOT, "src"), path.join(dir, "src"), { recursive: true });
	fs.copyFileSync(path.join(ROOT, "package.json"), path.join(dir, "package.json"));
	for (const link of ["generated", "schema", "node_modules"]) fs.symlinkSync(path.join(ROOT, link), path.join(dir, link));
	const rule =
		variant === "ext-search-device"
			? `name === "${SEARCH}"`
			: variant === "ext-ergonomic-devices"
				? `!/^l[qm]_/.test(name)`
				: "true";
	const entry = path.join(dir, "src", "index.ts");
	const source = fs.readFileSync(entry, "utf8");
	const marker = "export default createLinearExtension();";
	if (!source.includes(marker)) throw new Error(`${entry}: default export not found`);
	fs.writeFileSync(
		entry,
		source.replace(
			marker,
			`// Measurement variant ${variant}: remounts selected Linear tools as discoverable xd:// devices.
const measuredInner = createLinearExtension();
export default function measuredVariant(pi: object) {
	const proxy = new Proxy(pi, {
		get(target, key, receiver) {
			const value = Reflect.get(target, key, receiver);
			if (key !== "registerTool" || typeof value !== "function") return typeof value === "function" ? value.bind(target) : value;
			return (definition: { name: string; loadMode?: string; defaultInactive?: boolean }) => {
				const name = definition.name;
				if (${rule}) {
					const { defaultInactive: _inactive, ...rest } = definition;
					return value.call(target, { ...rest, loadMode: "discoverable" });
				}
				return value.call(target, definition);
			};
		},
	});
	return measuredInner(proxy as never);
}`,
		),
	);
	return entry;
}

function readKey(file: string): string {
	for (const raw of fs.readFileSync(file, "utf8").split("\n")) {
		const line = raw.trim().replace(/^export\s+/, "");
		if (line.startsWith("LINEAR_API_KEY=")) return line.slice("LINEAR_API_KEY=".length).trim().replace(/^["']|["']$/g, "");
	}
	throw new Error(`LINEAR_API_KEY is not set in ${file}`);
}

function prepareAgentDir(variant: Variant, modelUrl: string, linearUrl: string): { agentDir: string; home: string; cwd: string } {
	const base = path.join(outDir, "runs", variant);
	fs.rmSync(base, { recursive: true, force: true });
	const agentDir = path.join(base, "agent");
	const home = path.join(base, "home");
	const cwd = path.join(base, "cwd");
	for (const dir of [agentDir, home, cwd, path.join(agentDir, "agents")]) fs.mkdirSync(dir, { recursive: true });
	fs.writeFileSync(
		path.join(agentDir, "models.yml"),
		["providers:", "  fake:", `    baseUrl: ${modelUrl}v1`, "    auth: none", "    api: openai-responses", "    models:", "      - id: fake-1", "        name: Fake", "        contextWindow: 200000", "        maxTokens: 8000", ""].join("\n"),
	);
	const config = [
		"modelRoles:",
		"  default: fake/fake-1",
		"  task: fake/fake-1",
		"  smol: fake/fake-1",
		"  tiny: fake/fake-1",
		"  commit: fake/fake-1",
		"async:",
		"  enabled: false",
		"linear:",
		`  endpoint: ${linearUrl}graphql`,
	];
	if (apiKeyFileSetting) config.push(`  apiKeyFile: ${apiKeyFileSetting}`);
	if (variant === "ext-manifest") config.push("extensions:", `  - ${ROOT}`);
	fs.writeFileSync(path.join(agentDir, "config.yml"), `${config.join("\n")}\n`);
	fs.writeFileSync(
		path.join(agentDir, "agents", "linear-restricted.md"),
		"---\nname: linear-restricted\ndescription: Measurement agent restricted to read\ntools: read\n---\nYou are a scripted measurement agent.\n",
	);
	if (variant === "mcp") {
		fs.writeFileSync(
			path.join(agentDir, "mcp.json"),
			JSON.stringify({ mcpServers: { linear: { type: "http", url: "https://mcp.linear.app/mcp", headers: { Authorization: "Bearer ${LINEAR_API_KEY}" } } } }),
		);
	}
	return { agentDir, home, cwd };
}

async function runOmp(variant: Variant, scenario: Scenario, dirs: { agentDir: string; home: string; cwd: string }): Promise<{ exitCode: number | null; stderr: string; stdout: string }> {
	const env: Record<string, string> = {
		PATH: process.env.PATH ?? "/usr/bin:/bin",
		HOME: dirs.home,
		XDG_CONFIG_HOME: path.join(dirs.home, ".config"),
		XDG_DATA_HOME: path.join(dirs.home, ".local", "share"),
		XDG_STATE_HOME: path.join(dirs.home, ".local", "state"),
		XDG_CACHE_HOME: path.join(dirs.home, ".cache"),
		PI_CODING_AGENT_DIR: dirs.agentDir,
		TMPDIR: process.env.TMPDIR ?? path.join(ROOT, ".scratch", "tmp"),
		TERM: "dumb",
	};
	if (variant === "mcp") {
		const key = keyFile ? readKey(keyFile) : process.env.LINEAR_API_KEY;
		if (!key) throw new Error("variant mcp needs --key-file or LINEAR_API_KEY");
		env.LINEAR_API_KEY = key;
	}
	fs.mkdirSync(env.TMPDIR!, { recursive: true });
	const args = [ompBin, "-p", "--no-session", "--no-skills", "--no-rules", "--no-context-files", "--model", "fake/fake-1"];
	const module = variantModule(variant);
	if (variant === "none") args.push("--no-extensions");
	if (module) args.push("--no-extensions", "-e", module);
	args.push(`[[${scenario}]] Measure.`);
	const child = Bun.spawn(args, { cwd: dirs.cwd, env, stdin: "ignore", stdout: "pipe", stderr: "pipe", timeout: 180_000 });
	const [stdout, stderr] = await Promise.all([new Response(child.stdout).text(), new Response(child.stderr).text()]);
	await child.exited;
	return { exitCode: child.exitCode, stdout, stderr };
}

// ---------------------------------------------------------------- metrics

const encoder = getEncoding("o200k_base");
const tokens = (text: string) => encoder.encode(text).length;

interface RequestMetrics {
	conversation: string;
	instructions: number;
	tools: number;
	input: number;
	total: number;
	toolCount: number;
	linearTools: string[];
	linearDevices: number;
}

function metrics(record: Recorded): RequestMetrics {
	const instructions = tokens(record.body.instructions ?? "");
	const toolsTokens = tokens(JSON.stringify(record.body.tools ?? []));
	const input = tokens(JSON.stringify(record.body.input ?? []));
	const names = toolNames(record.body);
	const devices = (record.body.instructions ?? "").split("\n").filter(line => /^\s*- `?(linear_|lq_|lm_)/.test(line)).length;
	return {
		conversation: record.conversation,
		instructions,
		tools: toolsTokens,
		input,
		total: instructions + toolsTokens + input,
		toolCount: names.length,
		linearTools: names.filter(name => /^(linear_|lq_|lm_)/.test(name)),
		linearDevices: devices,
	};
}

/** What happened to the `linear_issue_get` call, from its tool output. */
function classify(output: string | null): string {
	if (output === null) return "no-output";
	if (output.includes(FAKE_ISSUE_IDENTIFIER)) return "ok";
	if (output.includes("No Linear connection selected")) return "reached-execute:no-connection";
	if (output.includes("OMP >= 18.20.0 is required")) return "reached-execute:no-author";
	return `error:${output.slice(0, 160).replace(/\s+/g, " ")}`;
}

interface ConversationResult {
	requests: number;
	firstRequestTokens: number | null;
	linearVisibleAtStart: Availability;
	searchVisibleAtStart: Availability;
	turnsBeforeOperation: number | null;
	operation: string;
	instructionsChanged: number;
	toolsChanged: number;
}

function conversationResult(records: Recorded[]): ConversationResult {
	// Side requests without tools (e.g. a child's preamble) are not the agent's turn.
	records = records.filter(record => (record.body.tools ?? []).length > 0);
	const first = records[0];
	let instructionsChanged = 0;
	let toolsChanged = 0;
	for (let index = 1; index < records.length; index++) {
		if (records[index]!.body.instructions !== records[index - 1]!.body.instructions) instructionsChanged++;
		if (JSON.stringify(records[index]!.body.tools) !== JSON.stringify(records[index - 1]!.body.tools)) toolsChanged++;
	}
	const last = records.at(-1);
	const calls = last ? callsOf(last.body) : [];
	const opIndex = calls.findIndex(call => call.name === TARGET_OP);
	return {
		requests: records.length,
		firstRequestTokens: first ? metrics(first).total : null,
		linearVisibleAtStart: first ? availability(first.body, TARGET_OP) : "absent",
		searchVisibleAtStart: first ? availability(first.body, SEARCH) : "absent",
		turnsBeforeOperation: opIndex >= 0 ? opIndex : null,
		operation: opIndex >= 0 ? classify(calls[opIndex]!.output) : "not-called",
		instructionsChanged,
		toolsChanged,
	};
}

// ---------------------------------------------------------------- main

interface RunReport {
	variant: Variant;
	scenario: Scenario;
	exitCode: number | null;
	stderrTail: string;
	start: RequestMetrics | null;
	conversations: Record<string, ConversationResult>;
	keyInModelRequests: boolean;
	linearRequests: number;
	/** Every Linear request carried the `--api-key-file` key as its Authorization header. */
	linearAuthMatchesKeyFile: boolean | null;
}

const recorded: Recorded[] = [];
const authorizations: string[] = [];
const model = startModel(recorded);
const linear = startLinear(authorizations);
const reports: RunReport[] = [];
const secretValue = apiKeyFileSetting && fs.existsSync(apiKeyFileSetting) ? readKey(apiKeyFileSetting) : null;

try {
	for (const variant of selectedVariants) {
		const scenarios = variant === "none" || variant === "mcp" ? selectedScenarios.filter(s => s === "S1") : selectedScenarios;
		for (const scenario of scenarios) {
			const dirs = prepareAgentDir(variant, model.url.toString(), linear.url.toString());
			recorded.length = 0;
			authorizations.length = 0;
			const result = await runOmp(variant, scenario, dirs);
			const runRecords = [...recorded];
			fs.writeFileSync(path.join(dirs.agentDir, "..", "requests.json"), JSON.stringify(runRecords, null, 1));
			const byConversation = new Map<string, Recorded[]>();
			for (const record of runRecords) byConversation.set(record.conversation, [...(byConversation.get(record.conversation) ?? []), record]);
			const conversations: Record<string, ConversationResult> = {};
			for (const [name, records] of byConversation) conversations[name] = conversationResult(records);
			const mainFirst = byConversation.get(scenario)?.[0];
			reports.push({
				variant,
				scenario,
				exitCode: result.exitCode,
				stderrTail: result.stderr.slice(-400),
				start: mainFirst ? metrics(mainFirst) : null,
				conversations,
				keyInModelRequests: secretValue !== null && runRecords.some(record => JSON.stringify(record.body).includes(secretValue)),
				linearRequests: authorizations.length,
				linearAuthMatchesKeyFile: secretValue === null ? null : authorizations.length > 0 && authorizations.every(value => value === secretValue),
			});
			console.error(`${variant} ${scenario}: exit ${result.exitCode}, ${runRecords.length} model requests`);
		}
	}
} finally {
	model.stop(true);
	linear.stop(true);
}

const baseline = reports.find(report => report.variant === "none" && report.scenario === "S1")?.start?.total ?? null;
const lines = [
	"| variant | S1 total tokens | delta vs none | instructions | tools | Linear tools at start | Linear devices at start |",
	"|---|---|---|---|---|---|---|",
];
for (const report of reports.filter(r => r.scenario === "S1")) {
	const start = report.start;
	lines.push(
		`| ${report.variant} | ${start?.total ?? "n/a"} | ${start && baseline !== null ? start.total - baseline : "n/a"} | ${start?.instructions ?? "n/a"} | ${start?.tools ?? "n/a"} | ${start?.linearTools.join(", ") || "-"} | ${start?.linearDevices ?? 0} |`,
	);
}
lines.push("", "| variant | scenario | conversation | requests | visible at start (op/search) | turns before op | op result | instructions changed | tools changed |", "|---|---|---|---|---|---|---|---|---|");
for (const report of reports.filter(r => r.scenario !== "S1")) {
	for (const [name, c] of Object.entries(report.conversations)) {
		lines.push(`| ${report.variant} | ${report.scenario} | ${name} | ${c.requests} | ${c.linearVisibleAtStart}/${c.searchVisibleAtStart} | ${c.turnsBeforeOperation ?? "-"} | ${c.operation} | ${c.instructionsChanged} | ${c.toolsChanged} |`);
	}
}
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "report.json"), JSON.stringify(reports, null, 1));
fs.writeFileSync(path.join(outDir, "report.md"), `${lines.join("\n")}\n`);
console.log(lines.join("\n"));
const keyLeak = reports.some(report => report.keyInModelRequests);
if (keyLeak) console.log("\nFAIL: the API key value appeared in a model request");
process.exit(keyLeak ? 1 : 0);
