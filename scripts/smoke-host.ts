/**
 * One smoke host: loads exactly one OMP host (argv[2]) and this package through the host's
 * REAL extension loader (`additionalExtensionPaths` -> `package.json` `omp.extensions`),
 * then drives the steps against a fake Linear GraphQL server and a fake OAuth issuer on
 * loopback. Prints one JSON line `{ steps: SmokeStep[] }`.
 * Spawned by `scripts/smoke.ts`; one host per process because the host's specifier shim is a
 * process-global `Bun.plugin`.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { getAgentDir } from "@oh-my-pi/pi-coding-agent";
import { createCredentialStore } from "../src/auth/store";
import { STATE_ENTRY_TYPE } from "../src/state";
import {
 type Host,
 type Notification,
 ROOT,
 type ScriptedCall,
 fakeModelServer,
 loadHost,
 openSession,
 tempDir,
} from "../test/harness";

export interface SmokeStep {
 step: string;
 status: "PASS" | "FAIL";
 detail: string;
}

const hostRoot = process.argv[2];
if (!hostRoot) throw new Error("usage: smoke-host.ts <hostRoot>");

const AUTHOR = "OMP · Main";
const API_KEY = "lin_api_smoke_secret_9f3c";
const steps: SmokeStep[] = [];

function record(step: string, ok: boolean, detail: string): void {
 steps.push({ step, status: ok ? "PASS" : "FAIL", detail });
}

function toolOutputs(request: { input?: unknown[] }): string[] {
 return (request.input ?? [])
  .filter((item): item is { type: string; output: string } => (item as { type?: string }).type === "function_call_output")
  .map(item => item.output);
}

interface LinearRequest {
 authorization: string | null;
 body: { query: string; variables?: Record<string, unknown> };
}

/** Fake Linear GraphQL: answers every mutation/query with a success payload and records the request. */
function fakeLinear() {
 const requests: LinearRequest[] = [];
 const server = Bun.serve({
  port: 0,
  fetch: async request => {
   const body = (await request.json()) as LinearRequest["body"];
   requests.push({ authorization: request.headers.get("authorization"), body });
   return Response.json({ data: { issueCreate: { success: true, issue: { id: "issue-1", identifier: "SMK-1" } } } });
  },
 });
 return { requests, url: `${server.url}graphql`, stop: () => server.stop(true) };
}

/** Fake OAuth issuer: token endpoint only; the authorize step is driven by the smoke itself. */
function fakeIssuer() {
 const tokenRequests: URLSearchParams[] = [];
 const server = Bun.serve({
  port: 0,
  fetch: async request => {
   tokenRequests.push(new URLSearchParams(await request.text()));
   return Response.json({ access_token: "smoke-oauth-access", refresh_token: "smoke-oauth-refresh", expires_in: 3600, scope: "read write" });
  },
 });
 return { tokenRequests, tokenUrl: `${server.url}oauth/token`, stop: () => server.stop(true) };
}

function writeProject(dir: string, config: string): string {
 fs.mkdirSync(path.join(dir, ".omp"), { recursive: true });
 fs.writeFileSync(path.join(dir, ".omp", "config.yml"), config);
 return dir;
}

/** Loads the scratch agent dir's `config.yml` as the user layer and the project's `.omp/config.yml` over it. */
async function loadSettings(host: Host, cwd: string): Promise<unknown> {
 return host.Settings.loadIsolated({ cwd, agentDir: getAgentDir() });
}

async function runMain(host: Host): Promise<void> {
 const linear = fakeLinear();
 const issuer = fakeIssuer();
 const probe = Bun.serve({ port: 0, fetch: () => new Response("") });
 const redirectPort = probe.port;
 probe.stop(true);
 // Credential-bearing keys (endpoint, tokenUrl) are user-only; the project carries the rest.
 fs.writeFileSync(path.join(getAgentDir(), "config.yml"), ["linear:", `  endpoint: ${linear.url}`, "  oauth:", `    tokenUrl: ${issuer.tokenUrl}`, ""].join("\n"));
 const baseConfig = ["linear:", "  oauth:", "    clientId: smoke-client", `    redirectPort: ${redirectPort}`, ""].join("\n");
 const project = writeProject(tempDir("omp-linear-smoke-project-"), baseConfig);
 const deniedProject = writeProject(tempDir("omp-linear-smoke-denied-"), `${baseConfig}tools:\n  approval:\n    lm_issueCreate: deny\n`);
 const store = createCredentialStore(path.join(getAgentDir(), "linear", "connections.json"));
 await store.upsert({ id: "key-smoke", kind: "api_key", label: "smoke api key", actor: "user", workspace: null, createdAt: new Date().toISOString(), secret: { apiKey: API_KEY } });

 const input = { teamId: "team-1", title: "Smoke issue" };
 const rawMutation = "mutation Smoke($input: IssueCreateInput!) { issueCreate(input: $input) { success issue { identifier } } }";
 // Prompt 1 plays requests 0-3 and ends its turn at 4; the raw prompt resumes at request 5.
 const script: ScriptedCall[] = [
  // "create issue" ranks the ergonomic linear_issue_create first; the typed lm_issueCreate sits lower.
  ["linear_tool_search", { i: "Searching", query: "create issue", limit: 10 }],
  ["linear_tool_search", { i: "Activating", activate: "lm_issueCreate" }],
  ["lm_issueCreate", { i: "Creating", input }],
  null,
  ["linear_tool_search", { i: "Activating", activate: "linear_graphql" }],
  ["linear_graphql", { i: "Raw", document: rawMutation, variables: { input } }],
 ];
 const model = fakeModelServer(script);
 const notifications: Notification[] = [];
 // `/linear-login` announces the authorize URL through ctx.ui.notify; the smoke plays the browser.
 const sink = {
  push(notification: Notification) {
   notifications.push(notification);
   const match = /Open to authorize Linear: (\S+)/.exec(notification.message);
   if (!match) return;
   const authorize = new URL(match[1]!);
   const redirect = new URL(authorize.searchParams.get("redirect_uri")!);
   redirect.searchParams.set("code", "smoke-code");
   redirect.searchParams.set("state", authorize.searchParams.get("state")!);
   void fetch(redirect);
  },
 };
 const session = await openSession({
  host,
  agentDir: getAgentDir(),
  cwd: project,
  sessionManager: host.SessionManager.inMemory(),
  settingsInstance: await loadSettings(host, project),
  modelUrl: model.url,
  toolNames: ["read"],
  agentId: "Main",
  notifications: sink,
  extras: { additionalExtensionPaths: [ROOT] },
 });
 try {
  const registered = session.getAllToolNames();
  const operations = registered.filter(n => n.startsWith("lq_") || n.startsWith("lm_")).length;
  record("loader: package loaded through the real extension loader", operations === 495 && registered.includes("linear_tool_search"), `${operations} typed operations registered, linear_tool_search ${registered.includes("linear_tool_search") ? "present" : "missing"}`);

  await session.prompt("/linear-use key-smoke");
  await session.prompt("search, activate, create");
  const searchOutput = toolOutputs(model.requests[1]!)[0] ?? "";
  const visibleAfterSearch = model.requests[1]!.tools.map(t => t.name).filter(n => n.startsWith("lm_"));
  record("search: candidates returned, nothing activated", searchOutput.includes("lm_issueCreate") && visibleAfterSearch.length === 0, `candidates include lm_issueCreate=${searchOutput.includes("lm_issueCreate")}, lm_* visible after search=${visibleAfterSearch.length}`);
  const visibleAfterActivate = model.requests[2]!.tools.map(t => t.name).filter(n => n.startsWith("lm_") || n.startsWith("lq_"));
  record("activate: lm_issueCreate is the only active operation", visibleAfterActivate.length === 1 && visibleAfterActivate[0] === "lm_issueCreate", `active operations: ${visibleAfterActivate.join(",") || "none"}`);
  const createOutput = toolOutputs(model.requests[3]!)[0] ?? "";
  const first = linear.requests[0];
  record(
   "api_key call: one request, Authorization = stored key, secret absent from tool output",
   linear.requests.length === 1 && first?.authorization === API_KEY && createOutput.includes("SMK-1") && !createOutput.includes(API_KEY),
   `requests=${linear.requests.length} [${linear.requests.map(r => r.body.query.slice(0, 40)).join(" | ")}], header matches=${first?.authorization === API_KEY}, output has SMK-1=${createOutput.includes("SMK-1")}, output contains secret=${createOutput.includes(API_KEY)}`,
  );

  await session.prompt("/linear-login app smoke-app");
  const stored = store.list().find(c => c.label === "smoke-app");
  const loginErrors = notifications.filter(n => n.level === "error").map(n => n.message);
  record("oauth: PKCE login against the fake issuer stores an actor=app connection", !!stored && stored.kind === "oauth" && stored.actor === "app" && issuer.tokenRequests.length === 1 && loginErrors.length === 0, `stored=${stored ? `${stored.kind}/${stored.actor}` : "none"}, token exchanges=${issuer.tokenRequests.length}, errors=${JSON.stringify(loginErrors)}`);

  await session.prompt("raw mutation as app");
  const rawOutput = toolOutputs(model.requests[6]!)[0] ?? "";
  const raw = linear.requests[1];
  const createAsUser = (raw?.body.variables?.input as { createAsUser?: string } | undefined)?.createAsUser;
  record(
   "raw mutation actor=app: createAsUser attributed to the session author with the OAuth bearer",
   linear.requests.length === 2 && createAsUser === AUTHOR && raw?.authorization === "Bearer smoke-oauth-access" && rawOutput.includes("SMK-1") && !rawOutput.includes("smoke-oauth-access"),
   `requests=${linear.requests.length}, createAsUser=${JSON.stringify(createAsUser)}, authorization=${raw?.authorization ?? "none"}, output contains token=${rawOutput.includes("smoke-oauth-access")}`,
  );
 } finally {
  await session.dispose();
  model.stop();
 }

 const deniedModel = fakeModelServer([script[1], script[2]]);
 const deniedManager = host.SessionManager.inMemory();
 deniedManager.appendCustomEntry(STATE_ENTRY_TYPE, { connectionId: "key-smoke", activeOperation: null, actor: null });
 const before = linear.requests.length;
 const denied = await openSession({
  host,
  agentDir: getAgentDir(),
  cwd: deniedProject,
  sessionManager: deniedManager,
  settingsInstance: await loadSettings(host, deniedProject),
  modelUrl: deniedModel.url,
  toolNames: ["read"],
  agentId: "Main",
  extras: { additionalExtensionPaths: [ROOT] },
 });
 try {
  await denied.prompt("create while denied");
  const deniedOutput = toolOutputs(deniedModel.requests[2]!)[0] ?? "";
  record("denied: tools.approval lm_issueCreate=deny blocks before any request", /blocked by user policy/.test(deniedOutput) && linear.requests.length === before, `output=${JSON.stringify(deniedOutput.slice(0, 120))}, new requests=${linear.requests.length - before}`);
 } finally {
  await denied.dispose();
  deniedModel.stop();
  linear.stop();
  issuer.stop();
  fs.rmSync(project, { recursive: true, force: true });
  fs.rmSync(deniedProject, { recursive: true, force: true });
 }
}

const host = await loadHost(hostRoot);
try {
 await runMain(host);
} catch (error) {
 record("unexpected failure", false, error instanceof Error ? (error.stack ?? error.message) : String(error));
}
console.log(JSON.stringify({ steps }));
