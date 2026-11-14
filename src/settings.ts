/**
 * Extension configuration from the host's settings, block `linear`.
 *
 * Read from the session's settings — the same `getGlobalSettings()`/`getProjectSettings()`
 * raw layers the host exposes to extensions (see `legacy-pi-coding-agent-shim.ts`), project
 * over global. Tool and command handlers run inside the session's active settings scope
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
});
export type LinearOAuthSettings = typeof OAuthSettingsSchema.infer;

const LinearSettingsSchema = type({
 /** GraphQL endpoint override (proxies, fakes); default https://api.linear.app/graphql. */
 "endpoint?": "string",
 /** Env-style file with `LINEAR_API_KEY=...`; read on every call, the key never enters the session. */
 "apiKeyFile?": "string",
 /** Stored connection id used when the session has not selected one with /linear-use. */
 "defaultConnection?": "string",
 "oauth?": OAuthSettingsSchema,
});
const SettingsLayerSchema = type({ "linear?": LinearSettingsSchema });

export interface LinearSettings {
 endpoint?: string;
 apiKeyFile?: string;
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

/** `linear` from the session settings, project layer over global. */
export function readLinearSettings(cwd: string): LinearSettings {
 const settings = findScopedSettings(cwd);
 if (!settings) return { oauth: {} };
 const global = linearBlock(settings.getGlobalSettings(), "global");
 const project = linearBlock(settings.getProjectSettings(), "project");
 return {
  endpoint: project.endpoint ?? global.endpoint,
  apiKeyFile: project.apiKeyFile ?? global.apiKeyFile,
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
 return { cfg, redirect: { port: settings.redirectPort, path: settings.redirectPath } };
}
