/**
 * Extension configuration from the host's settings, block `linear`.
 *
 * Read from the session's settings — the same `getGlobalSettings()`/`getProjectSettings()`
 * raw layers the host exposes to extensions (see `legacy-pi-coding-agent-shim.ts`), project
 * over global, except the credential-bearing keys in `USER_ONLY`, which only the global layer
 * may set. Tool and command handlers run inside the session's active settings scope
 * (`ExtensionRunner.runScoped`), so `findScopedSettings(cwd)` is that session's instance.
 * `LINEAR_OAUTH_CLIENT_ID` / `LINEAR_OAUTH_CLIENT_SECRET` from the environment take
 * precedence for the OAuth client credentials. Nothing is fabricated: a missing client id
 * or redirect port is a configuration error the command reports.
 */
import { OmpErrors, type } from "@oh-my-pi/omptype";
import { findScopedSettings } from "@oh-my-pi/pi-coding-agent/config/settings";
import { type OAuthClientConfig, type OAuthRedirectConfig, resolveOAuthConfig } from "./auth/oauth";

const OAuthSettingsSchema = type({
 "clientId?": "string",
 "clientSecret?": "string",
 "authorizeUrl?": "string",
 "tokenUrl?": "string",
 "revokeUrl?": "string",
 "scopes?": "string[]",
 "redirectPort?": "number.integer",
 "redirectPath?": "string",
 /** Host in the registered redirect URI; the callback listener binds 127.0.0.1 either way. */
 "redirectHost?": "'127.0.0.1' | 'localhost'",
});
export type LinearOAuthSettings = typeof OAuthSettingsSchema.infer;

const LinearSettingsSchema = type({
 /** GraphQL endpoint override (proxies, fakes); default https://api.linear.app/graphql. */
 "endpoint?": "string",
 /** Env-style file with `LINEAR_API_KEY=...`; read on every call, the key never enters the session. */
 "apiKeyFile?": "string",
 /**
  * Env-style file with `LINEAR_CLIENT_ID` and `LINEAR_CLIENT_SECRET` of an OAuth app with client
  * credentials on: actor=app tokens without a browser login. Read on every call.
  */
 "appCredentialsFile?": "string",
 /** Stored connection id used when the session has not selected one with /linear-use. */
 "defaultConnection?": "string",
 "oauth?": OAuthSettingsSchema,
});
const SettingsLayerSchema = type({ "linear?": LinearSettingsSchema });

export interface LinearSettings {
 endpoint?: string;
 apiKeyFile?: string;
 appCredentialsFile?: string;
 defaultConnection?: string;
 oauth: LinearOAuthSettings;
}

export type ResolvedOAuth = { cfg: OAuthClientConfig; redirect: OAuthRedirectConfig } | { missing: string[] };

/** Validates one raw settings layer; throws naming the offending `linear.*` key. */
function linearBlock(layer: unknown, source: string): typeof LinearSettingsSchema.infer {
 const checked = SettingsLayerSchema(layer);
 if (checked instanceof OmpErrors) {
  throw new Error(`Invalid linear settings (${source}): ${checked.map(e => `${e.path.join(".")}: ${e.problem}`).join("; ")}`);
 }
 return checked.linear ?? {};
}

/**
 * Settings that decide where credentials go or which credential is read. A project config is
 * repository content, so it may not set them: a cloned repository could otherwise send the
 * user's key or OAuth code to its own server.
 */
const USER_ONLY = ["endpoint", "apiKeyFile", "appCredentialsFile", "oauth.authorizeUrl", "oauth.tokenUrl", "oauth.revokeUrl"] as const;

function rejectUserOnly(project: typeof LinearSettingsSchema.infer): void {
 const oauth: Record<string, unknown> = project.oauth ?? {};
 const set = USER_ONLY.filter(key =>
  key.startsWith("oauth.")
   ? oauth[key.slice("oauth.".length)] !== undefined
   : project[key as "endpoint" | "apiKeyFile" | "appCredentialsFile"] !== undefined,
 );
 if (set.length > 0) {
  throw new Error(
   `Project settings may not set ${set.map(key => `linear.${key}`).join(", ")}: these decide where credentials are sent. Move them to the user config (<agent dir>/config.yml).`,
  );
 }
}

/** `linear` from the session settings, project layer over global; credential-bearing keys from the user layer only. */
export function readLinearSettings(cwd: string): LinearSettings {
 const settings = findScopedSettings(cwd);
 if (!settings) return { oauth: {} };
 const global = linearBlock(settings.getGlobalSettings(), "global");
 const project = linearBlock(settings.getProjectSettings(), "project");
 rejectUserOnly(project);
 return {
  endpoint: global.endpoint,
  apiKeyFile: global.apiKeyFile,
  appCredentialsFile: global.appCredentialsFile,
  defaultConnection: project.defaultConnection ?? global.defaultConnection,
  oauth: { ...global.oauth, ...project.oauth },
 };
}

/**
 * Environment over settings for the client credentials; everything else from settings.
 * `missing` names every required piece that is absent (`clientId`, `redirectPort`).
 */
export function resolveOAuth(settings: LinearOAuthSettings, env: NodeJS.ProcessEnv = process.env): ResolvedOAuth {
 const clientId = env.LINEAR_OAUTH_CLIENT_ID || settings.clientId;
 const clientSecret = env.LINEAR_OAUTH_CLIENT_SECRET || settings.clientSecret || null;
 const missing: string[] = [];
 if (!clientId) missing.push("clientId");
 if (settings.redirectPort === undefined || settings.redirectPort <= 0) missing.push("redirectPort");
 if (missing.length > 0 || !clientId || settings.redirectPort === undefined) return { missing };
 const cfg = resolveOAuthConfig({
  clientId,
  clientSecret,
  authorizeUrl: settings.authorizeUrl,
  tokenUrl: settings.tokenUrl,
  revokeUrl: settings.revokeUrl,
  scopes: settings.scopes,
 });
 if ("missing" in cfg) return cfg;
 return { cfg, redirect: { port: settings.redirectPort, path: settings.redirectPath, host: settings.redirectHost } };
}
