/**
 * Native Oh My Pi extension for Linear.
 *
 * Exactly one tool is always visible: `linear_tool_search`. It returns ranked candidates from the
 * private catalog and, given `activate`, swaps exactly one Linear operation into the active tool
 * set. Everything else — `linear_graphql`, `linear_schema_help`, `linear_connections`, 11 ergonomic
 * ops and 550 typed `lq_*`/`lm_*` operations — is registered `defaultInactive`.
 *
 * Credentials live under the host agent dir (never under cwd). The selected connection and the
 * activated operation are persisted as `linear-state` entries. The author of every outbound call
 * is the host-provided `ctx.agent` identity (OMP >= 18.20.0); `actor=app` connections attribute
 * mutations to that author via `createAsUser`.
 */
import { randomUUID } from "node:crypto";
import * as path from "node:path";
import type { ToolApproval } from "@oh-my-pi/pi-agent-core";
import {
	type ExtensionAPI,
	type ExtensionCommandContext,
	type ExtensionContext,
	type ExtensionFactory,
	getAgentDir,
} from "@oh-my-pi/pi-coding-agent";
import { rawApproval, typedApproval } from "./approval";
import { ensureFreshAccessToken, loginOAuth, revokeToken } from "./auth/oauth";
import { readApiKeyFile } from "./auth/key-file";
import { type Actor, type Connection, type ConnectionSummary, type CredentialStore, createCredentialStore, authHeadersFor } from "./auth/store";
import { type SearchDoc, type SearchIndex, createSearchIndex, search } from "./catalog/search";
import { type LinearClient, type LinearOutcome, type LinearResult, createLinearClient, safeMessage } from "./client/graphql";
import { type Author, resolveAuthor } from "./identity/actor";
import { attributeTypedArgs, attributionTargets } from "./identity/attribution";
import { ergonomicOps } from "./ops/index";
import { encodeOutput } from "./output/encode";
import { type ResolvedOAuth, readLinearSettings, resolveOAuth } from "./settings";
import { type OperationDescriptor, composeOperation, describe, getSchema, loadCatalog } from "./schema/catalog";
import { type UnpinnedNames, classifyRawDocument, injectCreateAsUser, mutationPayloadRoots } from "./schema/raw";
import { type LinearSessionState, emptyState, persistState, restoreState } from "./state";

export const LINEAR_ENDPOINT = "https://api.linear.app/graphql";

/** Where the connection of a call comes from: /linear-use, `linear.defaultConnection` or `linear.apiKeyFile`. */
type ConnectionSource = "session" | "default" | "file";

/** In-memory connection built from `linear.apiKeyFile`; it is never written to the store. */
const API_KEY_FILE_CONNECTION = { id: "api-key-file", kind: "api_key", label: "API key file", actor: "user", workspace: null } as const;

/** The only always-visible Linear tool. */
export const SEARCH_TOOL = "linear_tool_search";

/** Utility tools; activatable like every operation. */
export const UTILITY_TOOLS = ["linear_schema_help", "linear_graphql", "linear_connections"] as const;

export interface LinearExtensionOptions {
 /** Host agent directory; the credential store lives at `<agentDir>/linear/connections.json`. */
 agentDir?: string;
 endpoint?: string;
 fetchImpl?: typeof fetch;
 openUrl?: (url: string) => Promise<void>;
 /**
  * Test seam: when `false`, activation validates the name but never calls `setActiveTools`.
  * Lets a test prove its activation assertions can fail.
  */
 activation?: boolean;
 /**
  * Test seam: when `false`, `actor=app` connections send mutations without `createAsUser`.
  * Lets a test prove its attribution assertions can fail.
  */
 attribution?: boolean;
}

const UTILITY_SEARCH_TEXT: Record<(typeof UTILITY_TOOLS)[number], string> = {
 linear_schema_help: "Schema help for Linear operations and arguments.",
 linear_graphql: "Run a raw custom GraphQL document.",
 linear_connections: "List Linear connections, the selected one and the session author.",
};

const ERGONOMIC_SEARCH_TEXT: Record<string, string> = {
 linear_issue_create: "Create a Linear issue. Aliases: new issue, create ticket.",
 linear_issue_update: "Update a Linear issue: edit, rename.",
 linear_issue_transition: "Transition a Linear issue to another workflow state, done.",
 linear_issue_get: "Get a Linear issue by identifier MNE-940 or UUID.",
 linear_issue_comment_add: "Add a comment to a Linear issue, reply.",
 linear_issue_relation_add: "Add a relation between Linear issues: blocks, related.",
 linear_issue_search: "Search Linear issues with filters and cursor pagination.",
 linear_project_create: "Create a Linear project.",
 linear_project_update: "Update a Linear project.",
 linear_milestone_create: "Create a Linear project milestone.",
 linear_milestone_update: "Update a Linear project milestone.",
};

/** The host injects and strips its own intent field (`i`); tool schemas declare only real arguments. */
function objectSchema(properties: Record<string, unknown>, required: string[]): Record<string, unknown> {
 return { type: "object", properties, required, additionalProperties: false };
}

/** Catalog schemas carry an `i` property; the host owns that field, so it is removed before registration. */
function withoutIntent(schema: Record<string, unknown>): Record<string, unknown> {
 const properties = schema.properties as Record<string, unknown> | undefined;
 if (!properties || !("i" in properties)) return schema;
 const { i: _intent, ...rest } = properties;
 const required = Array.isArray(schema.required) ? (schema.required as string[]).filter(name => name !== "i") : undefined;
 return { ...schema, properties: rest, ...(required ? { required } : {}) };
}

function text(value: string, details?: unknown, isError = false) {
 return { content: [{ type: "text" as const, text: value }], details, isError };
}

let searchIndexCache: SearchIndex | undefined;

function searchIndex(catalog: OperationDescriptor[]): SearchIndex {
 if (!searchIndexCache) {
  const docs: SearchDoc[] = [
   ...catalog.map(d => ({ tool: d.tool, kind: d.kind, root: d.root, text: `${d.description} ${d.argNames.join(" ")}` })),
   ...ergonomicOps.map(op => ({
    tool: op.name,
    kind: "Ergonomic",
    root: op.name.replace(/^linear_/, ""),
    text: ERGONOMIC_SEARCH_TEXT[op.name] ?? op.description,
   })),
   ...UTILITY_TOOLS.map(tool => ({ tool, kind: "Utility", root: tool.replace(/^linear_/, ""), text: UTILITY_SEARCH_TEXT[tool] })),
  ];
  searchIndexCache = createSearchIndex(docs);
 }
 return searchIndexCache;
}

/** OAuth client from the session settings (`linear.oauth`) and environment; never fabricated. */
function oauthFor(cwd: string): ResolvedOAuth {
 return resolveOAuth(readLinearSettings(cwd).oauth);
}

const OUTCOME_TEXT: Record<LinearOutcome, string> = {
 not_sent: "no request was sent; retrying is safe",
 rejected: "the server refused the request; nothing was applied",
 unknown: "the request was sent but no trustworthy response arrived",
 completed: "completed",
};

/** `mutation` selects the wording: an unknown-outcome mutation may already have been applied. */
function describeFailure(result: Extract<LinearResult, { ok: false }>, mutation: boolean): string {
 const lines = [
  `Linear request failed (${result.kind}${result.status !== null ? ` HTTP ${result.status}` : ""}): ${result.message}`,
  `Outcome ${result.outcome}: ${OUTCOME_TEXT[result.outcome]}.`,
 ];
 if (mutation && result.outcome === "unknown") {
  lines.push("The mutation outcome is UNKNOWN — it may already have been applied. Do not repeat it blindly; query Linear to verify first.");
 }
 for (const error of result.errors ?? []) lines.push(`- ${error.message}${error.path ? ` at ${JSON.stringify(error.path)}` : ""}`);
 if (result.retryAfterMs !== null) lines.push(`Retry after ${result.retryAfterMs}ms.`);
 return lines.join("\n");
}

function mutationReportedFailure(data: unknown, responseKey: string): boolean {
 if (!data || typeof data !== "object" || !(responseKey in data)) return false;
 const payload: unknown = (data as Record<string, unknown>)[responseKey];
 return !!payload && typeof payload === "object" && "success" in payload && payload.success === false;
}

function describeUnpinned(unpinned: UnpinnedNames): string {
 const buckets = (Object.keys(unpinned) as (keyof UnpinnedNames)[])
  .filter(key => unpinned[key].length > 0)
  .map(key => `${key}: ${unpinned[key].join(", ")}`);
 return `Validation unknown: the document uses names the pinned schema does not know (sent anyway; the server decides): ${buckets.join("; ")}`;
}

/**
 * Renders a completed request. `mutationKeys` are the response keys whose payload must not report
 * `success:false` (empty for queries); `unpinned` is non-null when the pinned schema could not fully
 * validate the document.
 */
function renderResult(result: LinearResult, mutationKeys: readonly string[], unpinned: UnpinnedNames | null = null) {
 if (!result.ok) throw new Error(describeFailure(result, mutationKeys.length > 0));
 const failed = mutationKeys.filter(key => mutationReportedFailure(result.data, key));
 if (failed.length > 0) throw new Error(`Linear mutation ${failed.join(", ")} reported success=false`);
 const encoded = encodeOutput(result.data);
 const notes: string[] = [];
 if (unpinned) notes.push(describeUnpinned(unpinned));
 if (result.partialErrors) {
  notes.push(`Partial errors (data below is incomplete):\n${result.partialErrors.map(e => `- ${e.message}${e.path ? ` at ${JSON.stringify(e.path)}` : ""}`).join("\n")}`);
 }
 if (result.rateLimit.remaining !== null) notes.push(`Rate limit: ${result.rateLimit.remaining} requests remaining`);
 const body = notes.length > 0 ? `${notes.join("\n")}\n\n${encoded.text}` : encoded.text;
 return text(body, {
  format: encoded.format,
  shape: encoded.shape,
  bytes: encoded.bytes,
  outcome: result.outcome,
  rateLimit: result.rateLimit,
  partialErrors: result.partialErrors,
  validation: unpinned ? "unknown" : "pinned",
  unpinned,
 });
}

/** Everything an outbound call needs, resolved per call and never cached across sessions. */
interface OutboundCall {
 connection: Connection;
 client: LinearClient;
 author: Author;
 actor: Actor;
}

export function createLinearExtension(options: LinearExtensionOptions = {}): ExtensionFactory {
 const catalog = loadCatalog();
 const fetchImpl = options.fetchImpl ?? fetch;
 const activationEnabled = options.activation !== false;
 const attributionEnabled = options.attribution !== false;
 const index = searchIndex(catalog);
 const targets = attributionTargets(getSchema());
 const activatable = new Set<string>([...UTILITY_TOOLS, ...ergonomicOps.map(op => op.name), ...catalog.map(d => d.tool)]);

 return (pi: ExtensionAPI) => {
  const store: CredentialStore = createCredentialStore(
   path.join(options.agentDir ?? getAgentDir(), "linear", "connections.json"),
  );
  let state: LinearSessionState = emptyState();
  let activationChain: Promise<unknown> = Promise.resolve();

  /**
   * The connection for this call: the session choice (/linear-use), then `linear.defaultConnection`,
   * then `linear.apiKeyFile`. The key file is read on every call and is never stored or persisted.
   */
  function resolveConnection(cwd: string): { connection: Connection; source: ConnectionSource } {
   if (state.connectionId) {
    const connection = store.get(state.connectionId);
    if (!connection) {
     throw new Error(`Selected Linear connection "${state.connectionId}" no longer exists; run /linear-use <id>.`);
    }
    return { connection, source: "session" };
   }
   const settings = readLinearSettings(cwd);
   if (settings.defaultConnection) {
    const connection = store.get(settings.defaultConnection);
    if (!connection) {
     throw new Error(`linear.defaultConnection "${settings.defaultConnection}" is not a stored connection; fix the setting or run /linear-use <id>.`);
    }
    return { connection, source: "default" };
   }
   if (settings.apiKeyFile) {
    const apiKey = readApiKeyFile(settings.apiKeyFile);
    return {
     connection: { ...API_KEY_FILE_CONNECTION, createdAt: new Date().toISOString(), secret: { apiKey } },
     source: "file",
    };
   }
   throw new Error(
    "No Linear connection selected. Set linear.apiKeyFile in the OMP settings, or run /linear-login (OAuth) or /linear-key (API key), then /linear-use <id>.",
   );
  }

  function clientFor(connection: Connection, cwd: string): LinearClient {
   return createLinearClient({
    endpoint: options.endpoint ?? readLinearSettings(cwd).endpoint ?? LINEAR_ENDPOINT,
    fetchImpl,
    getAuthHeaders: async () => {
     if (connection.kind !== "oauth") return authHeadersFor(connection);
     const oauth = oauthFor(cwd);
     if ("missing" in oauth) return authHeadersFor(connection);
     return authHeadersFor(await ensureFreshAccessToken(oauth.cfg, store, connection.id, fetchImpl));
    },
    knownSecrets: () => connectionSecrets(store.get(connection.id) ?? connection, cwd),
   });
  }

  /** Every credential value tied to `connection`, for scrubbing error text. */
  function connectionSecrets(connection: Connection, cwd: string): string[] {
   if (connection.kind === "api_key") return [connection.secret.apiKey];
   let clientSecret: string | null = null;
   try {
    const oauth = oauthFor(cwd);
    if (!("missing" in oauth)) clientSecret = oauth.cfg.clientSecret;
   } catch {
    // Invalid OAuth settings: scrub the token values that are known.
   }
   return [connection.secret.accessToken, connection.secret.refreshToken, clientSecret].filter((value): value is string => !!value);
  }

  /** Fails before any HTTP when the host gives no agent identity or no connection is available. */
  function openCall(ctx: ExtensionContext): OutboundCall {
   const author = resolveAuthor(ctx.agent);
   const { connection } = resolveConnection(ctx.cwd);
   return { connection, client: clientFor(connection, ctx.cwd), author, actor: connection.actor };
  }

  /** Secret-free view of the connection the next call would use, or why there is none. */
  function effectiveConnection(cwd: string): { id: string; kind: string; actor: Actor; label: string; source: ConnectionSource } | { error: string } {
   try {
    const { connection, source } = resolveConnection(cwd);
    return { id: connection.id, kind: connection.kind, actor: connection.actor, label: connection.label, source };
   } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
   }
  }

  function attributes(call: OutboundCall): boolean {
   return call.actor === "app" && attributionEnabled;
  }

  /** Serialized: concurrent activations apply in call order and never interleave `setActiveTools`. */
  function activate(name: string): Promise<{ activated: string | null; replaced: string | null }> {
   const run = activationChain.then(async () => {
    if (!activatable.has(name)) {
     throw new Error(
      name === SEARCH_TOOL
       ? `${name} is always active; nothing to activate`
       : `Unknown Linear tool "${name}"; use linear_tool_search to find exact names`,
     );
    }
    const replaced = state.activeOperation;
    if (!activationEnabled) return { activated: null, replaced };
    await pi.setActiveTools([...new Set([...pi.getActiveTools().filter(tool => !activatable.has(tool)), name])]);
    state = { ...state, activeOperation: name };
    persistState(pi, state);
    return { activated: name, replaced };
   });
   activationChain = run.catch(() => undefined);
   return run;
  }

  function select(connectionId: string | null): void {
   state = { ...state, connectionId };
   persistState(pi, state);
  }

  async function onSessionOpen(ctx: ExtensionContext): Promise<void> {
   state = restoreState(ctx.sessionManager);
   try {
    state = { ...state, actor: resolveAuthor(ctx.agent) };
   } catch {
    state = { ...state, actor: null };
   }
   if (state.activeOperation && activationEnabled && !pi.getActiveTools().includes(state.activeOperation)) {
    const restored = state.activeOperation;
    await pi.setActiveTools([...new Set([...pi.getActiveTools().filter(tool => !activatable.has(tool)), restored])]);
   }
  }

  pi.on("session_start", async (_event, ctx) => onSessionOpen(ctx));
  pi.on("session_switch", async (_event, ctx) => onSessionOpen(ctx));

  pi.registerTool({
   name: SEARCH_TOOL,
   label: "Linear tool search",
   description:
    "Search the private Linear catalog (550 typed operations, ergonomic ops, raw GraphQL, schema help, connections) by natural language; returns ranked candidates only. Pass `activate` with an exact tool name to make that single Linear operation available (it replaces the previously activated one).",
   parameters: {
    type: "object",
    properties: {
     query: { type: "string", minLength: 1 },
     limit: { type: "integer", minimum: 1, maximum: 25, default: 5 },
     activate: { type: "string", minLength: 1 },
    },
    anyOf: [{ required: ["query"] }, { required: ["activate"] }],
    additionalProperties: false,
   } as never,
   loadMode: "essential",
   approval: "read",
   async execute(_id, params) {
    const { query, limit, activate: toActivate } = params as { query?: string; limit?: number; activate?: string };
    if (!query && !toActivate) throw new Error("linear_tool_search needs `query` and/or `activate`");
    const activation = toActivate ? await activate(toActivate) : null;
    const active = new Set(pi.getActiveTools());
    const candidates = query
     ? search(index, query, limit ?? 5).map(hit => ({
      tool: hit.tool,
      kind: hit.kind,
      score: Number(hit.score.toFixed(3)),
      summary: hit.summary,
      active: active.has(hit.tool),
     }))
     : [];
    const lines: string[] = [];
    if (toActivate) {
     lines.push(
      activation?.activated
       ? `Activated ${toActivate}${activation.replaced ? ` (replaced ${activation.replaced})` : ""}.`
       : `Activation of ${toActivate} is disabled in this session (activation seam off).`,
     );
    }
    if (query) lines.push(encodeOutput({ query, candidates }).text);
    if (!toActivate) lines.push("Nothing was activated. Call linear_tool_search again with `activate: <exact tool name>`.");
    return text(lines.join("\n"), { candidates, activation }, toActivate !== undefined && activation?.activated === null);
   },
  });

  pi.registerTool({
   name: "linear_schema_help",
   label: "Linear schema help",
   description:
    "Describe any name in the pinned Linear schema: an operation (tool name lq_issue or root field issue) with arguments, return fields and deprecation, or any object, input, interface, union, enum or scalar type. Unknown names get closest matches.",
   parameters: objectSchema({ name: { type: "string", minLength: 1 } }, ["name"]) as never,
   loadMode: "essential",
   defaultInactive: true,
   approval: "read",
   async execute(_id, params) {
    return text(describe((params as { name: string }).name));
   },
  });

  pi.registerTool({
   name: "linear_graphql",
   label: "Linear GraphQL",
   description:
    "Execute a raw GraphQL document against Linear with the selected connection. The document is validated against the pinned schema; names the pinned schema does not know are reported as validation=unknown and still sent. Queries need read approval, mutations need write approval. Subscriptions are rejected. With an actor=app connection every mutation whose input accepts createAsUser is attributed to the session author.",
   parameters: objectSchema(
    {
     document: { type: "string", minLength: 1 },
     variables: { type: "object", additionalProperties: true },
     operationName: { type: "string" },
    },
    ["document"],
   ) as never,
   loadMode: "essential",
   defaultInactive: true,
   approval: rawApproval,
   async execute(_id, params, signal, _onUpdate, ctx) {
    const { document, variables, operationName } = params as {
     document: string;
     variables?: Record<string, unknown>;
     operationName?: string;
    };
    const classified = classifyRawDocument(document, operationName);
    const call = openCall(ctx);
    let outbound = { document: classified.document, variables: variables ?? {} };
    if (classified.operation === "mutation" && attributes(call)) {
     const roots = classified.mutationRoots.flatMap(root => targets.get(root.field) ?? []);
     if (roots.length > 0) {
      outbound = injectCreateAsUser(outbound.document, outbound.variables, roots, call.author.label, operationName);
     }
    }
    // Response keys are taken from the document actually sent, fragments and aliases expanded.
    const mutationKeys = mutationPayloadRoots(outbound.document, operationName).map(root => root.alias);
    const result = await call.client.execute(outbound.document, outbound.variables, { signal, operationName });
    return renderResult(result, mutationKeys, classified.validation === "unknown" ? classified.unpinned : null);
   },
  });

  pi.registerTool({
   name: "linear_connections",
   label: "Linear connections",
   description: "List stored Linear connections (no secrets), the selected one and the session author.",
   parameters: objectSchema({}, []) as never,
   loadMode: "essential",
   defaultInactive: true,
   approval: "read",
   async execute(_id, _params, _signal, _onUpdate, ctx) {
    const payload = {
     selected: state.connectionId,
     effective: effectiveConnection(ctx.cwd),
     activeOperation: state.activeOperation,
     author: state.actor,
     connections: store.list(),
    };
    return text(JSON.stringify(payload, null, 0), payload);
   },
  });

  for (const op of ergonomicOps) {
   pi.registerTool({
    name: op.name,
    label: op.name,
    description: op.description,
    parameters: op.parameters as never,
    loadMode: "essential",
    defaultInactive: true,
    approval: op.tier,
    async execute(_id, params, _signal, _onUpdate, ctx) {
     const call = openCall(ctx);
     const actorCtx = { actor: attributes(call) ? ("app" as const) : ("user" as const), authorLabel: call.author.label };
     const encoded = encodeOutput(await op.run(call.client, params as Record<string, unknown>, actorCtx));
     return text(encoded.text, {
      format: encoded.format,
      shape: encoded.shape,
      bytes: encoded.bytes,
     });
    },
   });
  }

  for (const descriptor of catalog) {
   const approval: ToolApproval = typedApproval(descriptor);
   const target = descriptor.kind === "Mutation" ? targets.get(descriptor.root) : undefined;
   pi.registerTool({
    name: descriptor.tool,
    label: `${descriptor.kind}.${descriptor.root}`,
    description: `${descriptor.deprecated ? `[DEPRECATED: ${descriptor.deprecated}] ` : ""}${descriptor.description}`.slice(0, 1000),
    parameters: withoutIntent(descriptor.parameters) as never,
    loadMode: "essential",
    defaultInactive: true,
    approval,
    async execute(_id, params, signal, _onUpdate, ctx) {
     const call = openCall(ctx);
     const args = params as Record<string, unknown>;
     const attributed = target && attributes(call) ? attributeTypedArgs(args, target, call.author.label) : args;
     const { document, variables } = composeOperation(descriptor, attributed);
     const result = await call.client.execute(document, variables, { signal });
     return renderResult(result, descriptor.kind === "Mutation" ? [descriptor.root] : []);
    },
   });
  }

  pi.registerCommand("linear-login", {
   description: "Log in to Linear with OAuth (PKCE): /linear-login [user|app] [label]",
   handler: async (args: string, ctx: ExtensionCommandContext) => {
    const [first, ...rest] = args.trim().split(/\s+/).filter(Boolean);
    const actor: Actor = first === "app" ? "app" : "user";
    const label = (first === "app" || first === "user" ? rest : [first, ...rest]).filter(Boolean).join(" ") || `linear-${actor}`;
    let oauth: ResolvedOAuth;
    try {
     oauth = oauthFor(ctx.cwd);
    } catch (error) {
     ctx.ui.notify(`Linear settings are invalid: ${error instanceof Error ? error.message : String(error)}`, "error");
     return;
    }
    if ("missing" in oauth) {
     ctx.ui.notify(
      `Linear OAuth is not configured (missing: ${oauth.missing.join(", ")}). Register an OAuth application in Linear, then set linear.oauth.clientId and linear.oauth.redirectPort (the loopback port of the registered redirect URI http://127.0.0.1:<port>/callback) in the OMP settings; LINEAR_OAUTH_CLIENT_ID / LINEAR_OAUTH_CLIENT_SECRET override the client credentials. Or use /linear-key.`,
      "error",
     );
     return;
    }
    let summary: ConnectionSummary;
    try {
     summary = await loginOAuth({
      cfg: oauth.cfg,
      actor,
      label,
      store,
      fetchImpl,
      redirect: oauth.redirect,
      openUrl: options.openUrl ?? (async url => ctx.ui.notify(`Open to authorize Linear: ${url}`, "info")),
     });
    } catch (error) {
     ctx.ui.notify(`Linear login failed: ${error instanceof Error ? error.message : String(error)}`, "error");
     return;
    }
    select(summary.id);
    ctx.ui.notify(`Linear connection ${summary.id} (${summary.label}, ${summary.actor}) stored and selected.`, "info");
   },
  });

  pi.registerCommand("linear-key", {
   description: "Store a Linear personal API key: /linear-key [label] (the key is requested in a dialog, never typed inline)",
   handler: async (args: string, ctx: ExtensionCommandContext) => {
    const label = args.trim() || "linear-api-key";
    const apiKey = (await ctx.ui.input("Linear API key", "lin_api_..."))?.trim();
    if (!apiKey) {
     ctx.ui.notify("No API key entered; nothing stored.", "warning");
     return;
    }
    const id = `key-${randomUUID().slice(0, 8)}`;
    await store.transaction(tx =>
     tx.upsert({
      id,
      kind: "api_key",
      label,
      actor: "user",
      workspace: null,
      createdAt: new Date().toISOString(),
      secret: { apiKey },
     }),
    );
    select(id);
    ctx.ui.notify(`Linear API key stored as ${id} and selected.`, "info");
   },
  });

  pi.registerCommand("linear-use", {
   description: "Select a stored Linear connection for this session: /linear-use <id>",
   getArgumentCompletions: prefix =>
    store
     .list()
     .filter(c => c.id.startsWith(prefix))
     .map(c => ({ value: c.id, label: `${c.id} — ${c.label} (${c.kind}, ${c.actor})` })),
   handler: async (args: string, ctx: ExtensionCommandContext) => {
    const id = args.trim();
    if (!id || !store.get(id)) {
     ctx.ui.notify(
      `Unknown Linear connection "${id}". Known: ${store.list().map(c => c.id).join(", ") || "none"}.`,
      "error",
     );
     return;
    }
    select(id);
    ctx.ui.notify(`Linear connection ${id} selected.`, "info");
   },
  });

  pi.registerCommand("linear-logout", {
   description: "Remove a stored Linear connection (revokes OAuth tokens when possible): /linear-logout [id]",
   handler: async (args: string, ctx: ExtensionCommandContext) => {
    const id = args.trim() || state.connectionId;
    const connection = id ? store.get(id) : undefined;
    if (!id || !connection) {
     ctx.ui.notify(`Unknown Linear connection "${id ?? ""}"; nothing removed.`, "error");
     return;
    }
    if (connection.kind === "oauth") {
     const oauth = oauthFor(ctx.cwd);
     if ("missing" in oauth) {
      ctx.ui.notify("OAuth client not configured; token removed locally without revocation.", "warning");
     } else {
      try {
       await revokeToken(oauth.cfg, connection.secret.accessToken, fetchImpl);
      } catch (error) {
       const message = safeMessage(error instanceof Error ? error.message : String(error), connectionSecrets(connection, ctx.cwd));
       ctx.ui.notify(`Token revocation failed (${message}); removing locally.`, "warning");
      }
     }
    }
    const removed = await store.transaction(tx => tx.remove(id));
    if (state.connectionId === id) select(null);
    ctx.ui.notify(removed ? `Linear connection ${id} removed.` : `Linear connection ${id} was already removed.`, "info");
   },
  });
 };
}

export default createLinearExtension();
