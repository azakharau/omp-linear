/**
 * In-process OMP session harness (pattern from the research proof script).
 * `hostRoot` is the host source tree in node_modules (`PRISTINE_HOST`).
 * The fake model server speaks the OpenAI Responses SSE dialect and returns scripted tool calls.
 */
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { getBundledModel } from "@oh-my-pi/pi-catalog/models";
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const PRISTINE_HOST = path.join(ROOT, "node_modules", "@oh-my-pi", "pi-coding-agent", "src");

export interface Host {
 createAgentSession: (options: Record<string, unknown>) => Promise<{ session: HostSession }>;
 discoverAuthStorage: (agentDir: string) => Promise<unknown>;
 ModelRegistry: new (auth: unknown) => { authStorage: { keys: { setRuntime(p: string, k: string): void } } };
 Settings: {
  isolated(overrides: Record<string, unknown>): unknown;
  loadIsolated(options: { cwd?: string; agentDir?: string; inMemory?: boolean }): Promise<unknown>;
 };
 SessionManager: { inMemory(): HostSessionManager; open(file: string, cwd?: string): Promise<HostSessionManager> };
 initializeExtensions: (session: HostSession, hooks: Record<string, unknown>) => Promise<void>;
}

export interface HostSessionManager {
 getSessionId(): string;
 getBranch(): unknown[];
 appendCustomEntry(customType: string, data: unknown): void;
}

export interface HostSession {
 prompt(text: string): Promise<void>;
 getActiveToolNames(): string[];
 getAllToolNames(): string[];
 setActiveToolsByName(names: string[]): Promise<void>;
 sessionManager: HostSessionManager;
 dispose(): Promise<void>;
 getSessionAgents(): { name: string }[];
}

export async function loadHost(hostRoot: string): Promise<Host> {
 const [sdk, models, settings, sessions, runtimeInit] = await Promise.all([
  import(path.join(hostRoot, "sdk.ts")),
  import(path.join(hostRoot, "config", "model-registry.ts")),
  import(path.join(hostRoot, "config", "settings.ts")),
  import(path.join(hostRoot, "session", "session-manager.ts")),
  import(path.join(hostRoot, "modes", "runtime-init.ts")),
 ]);
 return {
  createAgentSession: sdk.createAgentSession,
  discoverAuthStorage: sdk.discoverAuthStorage,
  ModelRegistry: models.ModelRegistry,
  Settings: settings.Settings,
  SessionManager: sessions.SessionManager,
  initializeExtensions: runtimeInit.initializeExtensions,
 };
}

/** One model reply: a tool call, or `null` to end the turn with final text. */
export type ScriptedCall = [name: string, args: Record<string, unknown>] | null;

function completed(id: string) {
 return {
  type: "response.completed",
  response: { id, status: "completed", usage: { input_tokens: 1, output_tokens: 1, total_tokens: 2, input_tokens_details: { cached_tokens: 0 } } },
 };
}

function sse(events: unknown[]): Response {
 return new Response(events.map(e => `data: ${JSON.stringify(e)}\n\n`).join(""), { headers: { "content-type": "text/event-stream" } });
}

let callSequence = 0;

function toolCall(name: string, args: Record<string, unknown>) {
 const index = ++callSequence;
 const a = JSON.stringify(args);
 const id = `fc_${index}`;
 const call = `call_${index}`;
 return [
  { type: "response.output_item.added", output_index: 0, item: { type: "function_call", id, call_id: call, name, arguments: "" } },
  { type: "response.function_call_arguments.done", output_index: 0, item_id: id, arguments: a },
  { type: "response.output_item.done", output_index: 0, item: { type: "function_call", id, call_id: call, name, arguments: a } },
  completed(`r${index}`),
 ];
}

function finalText() {
 return [
  { type: "response.output_text.delta", output_index: 0, delta: "Done." },
  { type: "response.output_item.done", output_index: 0, item: { type: "message", id: "m", role: "assistant", status: "completed", content: [{ type: "output_text", text: "Done." }] } },
  completed("done"),
 ];
}

export interface ModelRequest {
 tools: { name: string }[];
 input?: unknown[];
}

/** Fake model: request i answers with script[i] (a tool call, or `null` = end the turn) or a final text when the script is exhausted. */
export function fakeModelServer(script: ScriptedCall[]) {
 const requests: ModelRequest[] = [];
 const server = Bun.serve({
  port: 0,
  fetch: async request => {
   const body = JSON.parse(await request.text()) as ModelRequest;
   requests.push(body);
   const index = requests.length - 1;
   const step = script[index];
   return sse(step ? toolCall(step[0], step[1]) : finalText());
  },
 });
 return { requests, url: server.url.toString(), stop: () => server.stop(true) };
}

export function tempDir(prefix: string): string {
 return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

export interface Notification {
 message: string;
 level: string;
}

export interface NotificationSink {
 push(notification: Notification): unknown;
}

let sequence = 0;

export interface SessionOptions {
 host: Host;
 agentDir: string;
 cwd?: string;
 sessionManager: HostSessionManager;
 /** In-process factories; omit when the session loads the package through `additionalExtensionPaths`. */
 extensions?: unknown[];
 modelUrl?: string;
 toolNames?: string[];
 settings?: Record<string, unknown>;
 /** A fully loaded host `Settings` instance (e.g. from a temp project's `.omp/config.yml`); overrides `settings`. */
 settingsInstance?: unknown;
 /** Receives every `ctx.ui.notify(message, level)` an extension issues in this session (an array or any `push` sink). */
 notifications?: NotificationSink;
 extras?: Record<string, unknown>;
 agentId?: string;
}

export async function openSession(o: SessionOptions): Promise<HostSession> {
 const cwd = o.cwd ?? ROOT;
 const auth = await o.host.discoverAuthStorage(o.agentDir);
 const registry = new o.host.ModelRegistry(auth);
 registry.authStorage.keys.setRuntime("openai", "offline-key");
 const base = getBundledModel("openai", "gpt-5");
 if (!base) throw new Error("bundled gpt-5 model missing");
 const agentId = o.agentId ?? `test-${++sequence}`;
 const { session } = await o.host.createAgentSession({
  cwd,
  agentDir: o.agentDir,
  agentId,
  agentDisplayName: agentId,
  modelRegistry: registry,
  sessionManager: o.sessionManager,
  settings: o.settingsInstance ?? o.host.Settings.isolated({ "plan.enabled": false, "tools.xdevDocs": "catalog", ...(o.settings ?? {}) }),
  model: o.modelUrl ? { ...base, baseUrl: `${o.modelUrl}v1` } : base,
  getApiKey: () => "offline-key",
  disableExtensionDiscovery: true,
  skills: [],
  contextFiles: [],
  promptTemplates: [],
  slashCommands: [],
  enableMCP: false,
  enableLsp: false,
  rules: [],
  workspaceTree: { rootPath: cwd, rendered: "", truncated: false, totalLines: 0, agentsMdFiles: [] },
  ...(o.extensions ? { extensions: o.extensions } : {}),
  ...(o.toolNames ? { toolNames: o.toolNames } : {}),
  ...(o.extras ?? {}),
 });
 const notifications = o.notifications;
 await o.host.initializeExtensions(session, {
  reportSendError: () => { },
  reportRuntimeError: () => { },
  ...(notifications ? { uiContext: recordingUIContext(notifications) } : {}),
 });
 return session;
}

/** Headless `ExtensionUIContext` (mirrors the runner's no-op one) whose `notify` records into `sink`. */
function recordingUIContext(sink: NotificationSink): Record<string, unknown> {
 return {
  select: async () => undefined,
  confirm: async () => false,
  input: async () => undefined,
  notify: (message: string, level = "info") => sink.push({ message, level }),
  onTerminalInput: () => () => { },
  setStatus: () => { },
  setWorkingMessage: () => { },
  setWidget: () => { },
  setFooter: () => { },
  setHeader: () => { },
  setTitle: () => { },
  custom: async () => undefined,
  setEditorText: () => { },
  pasteToEditor: () => { },
  getEditorText: () => "",
  editor: async () => undefined,
  addAutocompleteProvider: () => { },
  setEditorComponent: () => { },
  theme: {},
  getAllThemes: async () => [],
  getTheme: async () => undefined,
  setTheme: async () => ({ success: false }),
  getToolsExpanded: () => false,
  setToolsExpanded: () => { },
 };
}

export interface LoaderPathProof {
 toolNames: string[];
 authorLabel: string | null;
 /** Connection ids `linear_connections` listed: proves which agent dir the store was opened under. */
 connectionIds: string[];
}

/**
 * Runs `test/loader-path.child.ts` against `hostRoot` in a fresh process. The host's legacy-pi
 * shim registers a process-global `Bun.plugin` that rewrites `@oh-my-pi/*` imports to the first
 * host loaded, so a process with two hosts cannot prove which one an extension bound to.
 * The child runs profile-less with `PI_CODING_AGENT_DIR=agentDir`, exactly how a real host
 * decides where the extension keeps credentials.
 */
export function runLoaderPathProof(hostRoot: string, agentDir: string): LoaderPathProof {
 const { OMP_PROFILE: _omp, PI_PROFILE: _pi, ...env } = process.env;
 const child = Bun.spawnSync([process.execPath, "run", path.join(ROOT, "test", "loader-path.child.ts"), hostRoot], {
  cwd: ROOT,
  env: { ...env, PI_CODING_AGENT_DIR: agentDir },
  stdout: "pipe",
  stderr: "pipe",
 });
 const stdout = child.stdout.toString();
 if (child.exitCode !== 0) throw new Error(`loader-path child failed (${child.exitCode}): ${child.stderr.toString()}\n${stdout}`);
 const marker = stdout.lastIndexOf("\n{");
 return JSON.parse(stdout.slice(marker + 1)) as LoaderPathProof;
}
