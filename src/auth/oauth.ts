/**
 * Linear OAuth 2.0 authorization-code flow with PKCE and a loopback redirect.
 *
 * Endpoint URLs, the `actor` parameter and the scope names come from Linear's
 * public OAuth documentation; they are configuration, not schema-derived facts.
 */
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";

import {
 type Actor,
 type Connection,
 type ConnectionSummary,
 type CredentialStore,
 summarize,
} from "./store.ts";
import { safeMessage } from "../client/graphql";

export interface OAuthClientConfig {
 clientId: string;
 clientSecret: string | null;
 authorizeUrl: string;
 tokenUrl: string;
 revokeUrl: string;
 scopes: string[];
}

export interface OAuthTokens {
 accessToken: string;
 refreshToken: string | null;
 /** Lifetime in seconds as reported by the token endpoint. */
 expiresIn: number | null;
 scope: string | null;
}

export const OAUTH_DEFAULTS = {
 authorizeUrl: "https://linear.app/oauth/authorize",
 tokenUrl: "https://api.linear.app/oauth/token",
 revokeUrl: "https://api.linear.app/oauth/revoke",
 scopes: ["read", "write", "issues:create", "comments:create", "initiative:write"],
} as const;

/**
 * Fills defaults around a caller-provided partial. Never fabricates a client id:
 * an unconfigured plugin reports what is missing instead.
 */
export function resolveOAuthConfig(
 partial: Partial<OAuthClientConfig> | undefined,
): OAuthClientConfig | { missing: string[] } {
 if (!partial?.clientId) return { missing: ["clientId"] };
 return {
  clientId: partial.clientId,
  clientSecret: partial.clientSecret ?? null,
  authorizeUrl: partial.authorizeUrl ?? OAUTH_DEFAULTS.authorizeUrl,
  tokenUrl: partial.tokenUrl ?? OAUTH_DEFAULTS.tokenUrl,
  revokeUrl: partial.revokeUrl ?? OAUTH_DEFAULTS.revokeUrl,
  scopes: partial.scopes?.length ? partial.scopes : [...OAUTH_DEFAULTS.scopes],
 };
}

export interface Pkce {
 verifier: string;
 /** base64url(SHA-256(verifier)), i.e. `code_challenge_method=S256`. */
 challenge: string;
 state: string;
}

export function createPkce(): Pkce {
 const verifier = randomBytes(64).toString("base64url");
 return {
  verifier,
  challenge: createHash("sha256").update(verifier).digest("base64url"),
  state: randomBytes(32).toString("base64url"),
 };
}

export function buildAuthorizeUrl(
 config: OAuthClientConfig,
 params: { challenge: string; state: string; redirectUri: string; actor: Actor },
): string {
 const url = new URL(config.authorizeUrl);
 url.searchParams.set("response_type", "code");
 url.searchParams.set("client_id", config.clientId);
 url.searchParams.set("redirect_uri", params.redirectUri);
 url.searchParams.set("scope", config.scopes.join(","));
 url.searchParams.set("state", params.state);
 url.searchParams.set("code_challenge", params.challenge);
 url.searchParams.set("code_challenge_method", "S256");
 url.searchParams.set("actor", params.actor);
 // App-actor grants must be re-confirmed by the installing user.
 if (params.actor === "app") url.searchParams.set("prompt", "consent");
 return url.toString();
}

/**
 * Where the authorization server is allowed to send the user back. Linear
 * matches the redirect URI byte-for-byte against the one registered in the
 * OAuth application, so the port cannot be ephemeral in production: the caller
 * states it, and the same string is used in the authorize URL and the exchange.
 */
export interface OAuthRedirectConfig {
 port: number;
 /** Defaults to `/callback`; must match the registered redirect URI path. */
 path?: string;
 /**
  * Host written into the redirect URI: `127.0.0.1` (default) or `localhost`, whichever the
  * Linear application registered. The listener always binds 127.0.0.1.
  */
 host?: "127.0.0.1" | "localhost";
 /** Tests only: allows port 0, which the OS assigns and Linear would reject. */
 allowEphemeralPort?: boolean;
}

export interface LoopbackCallback {
 redirectUri: string;
 waitForCode(): Promise<{ code: string }>;
 close(): void;
}

export function redirectUriFor(redirect: OAuthRedirectConfig, port = redirect.port): string {
 return `http://${redirect.host ?? "127.0.0.1"}:${port}${redirect.path ?? DEFAULT_CALLBACK_PATH}`;
}

const DEFAULT_CALLBACK_PATH = "/callback";

function callbackPage(title: string, detail: string): string {
 return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title></head><body style="font-family:system-ui;padding:2rem"><h1>${title}</h1><p>${detail}</p></body></html>`;
}

function isErrnoCode(error: unknown, code: string): boolean {
 return typeof error === "object" && error !== null && "code" in error && error.code === code;
}

/**
 * Starts a loopback listener for the OAuth redirect. The response page never
 * echoes the authorization code or any token material. The listener binds the
 * exact port named by `redirect`, because that port is part of the registered
 * redirect URI; a busy port is an error, never a silent fallback to another one.
 */
export function startLoopbackCallback(options: {
 expectedState: string;
 timeoutMs: number;
 redirect: OAuthRedirectConfig;
}): Promise<LoopbackCallback> {
 const { redirect } = options;
 if (redirect.port === 0 && !redirect.allowEphemeralPort) {
  throw new Error(
   "an OAuth redirect port of 0 would produce a redirect URI Linear cannot match; configure linear.oauth.redirectPort to the port registered in the Linear OAuth app",
  );
 }
 const callbackPath = redirect.path ?? DEFAULT_CALLBACK_PATH;
 const pending = Promise.withResolvers<{ code: string }>();
 // waitForCode() may be called after the rejection already happened.
 pending.promise.catch(() => { });

 // The authorization code is single-use: a replayed or duplicated redirect must
 // not be able to feed a second code into the same flow.
 let settled = false;
 const server = createServer((request, response) => {
  const url = new URL(request.url ?? "/", "http://127.0.0.1");
  if (url.pathname !== callbackPath) {
   response.writeHead(404, { "content-type": "text/plain" });
   response.end("not found");
   return;
  }
  if (settled) {
   response.writeHead(410, { "content-type": "text/html" });
   response.end(callbackPage("Already handled", "This authorization callback was already used."));
   return;
  }
  const error = url.searchParams.get("error");
  const state = url.searchParams.get("state");
  const received = url.searchParams.get("code");
  settled = true;
  if (error !== null) {
   response.writeHead(400, { "content-type": "text/html" });
   response.end(callbackPage("Authorization failed", "The authorization server returned an error."));
   pending.reject(new Error(`authorization denied: ${error}`));
   return;
  }
  if (state !== options.expectedState) {
   response.writeHead(400, { "content-type": "text/html" });
   response.end(callbackPage("Authorization failed", "State parameter mismatch."));
   pending.reject(new Error("oauth state mismatch"));
   return;
  }
  if (received === null) {
   response.writeHead(400, { "content-type": "text/html" });
   response.end(callbackPage("Authorization failed", "No authorization code was provided."));
   pending.reject(new Error("missing authorization code"));
   return;
  }
  response.writeHead(200, { "content-type": "text/html" });
  response.end(callbackPage("Linear connected", "You can close this window and return to the terminal."));
  pending.resolve({ code: received });
 });

 const started = Promise.withResolvers<LoopbackCallback>();
 server.once("error", error => {
  // Falling back to another port would produce a redirect URI the OAuth app
  // does not know, so the failure is surfaced instead.
  started.reject(
   isErrnoCode(error, "EADDRINUSE")
    ? new Error(
     `redirect port ${redirect.port} is already in use; configure linear.oauth.redirectPort to the port registered in the Linear OAuth app`,
    )
    : error,
  );
 });
 server.listen(redirect.port, "127.0.0.1", () => {
  const address = server.address() as AddressInfo;
  let closed = false;
  const close = () => {
   if (closed) return;
   closed = true;
   clearTimeout(timer);
   server.closeAllConnections();
   server.close();
  };
  const timer = setTimeout(() => {
   pending.reject(new Error(`timed out waiting for OAuth callback after ${options.timeoutMs}ms`));
   close();
  }, options.timeoutMs);
  timer.unref?.();
  started.resolve({
   redirectUri: redirectUriFor(redirect, address.port),
   waitForCode: () => pending.promise,
   close,
  });
 });
 return started.promise;
}

async function postTokenRequest(
 url: string,
 form: URLSearchParams,
 fetchImpl: typeof fetch,
): Promise<OAuthTokens> {
 const response = await fetchImpl(url, {
  method: "POST",
  headers: { "content-type": "application/x-www-form-urlencoded", accept: "application/json" },
  body: form.toString(),
 });
 const text = await response.text();
 if (!response.ok) {
  throw new Error(`token endpoint rejected the request: HTTP ${response.status}${oauthErrorDetail(text, [...form.values()])}`);
 }
 const body: unknown = JSON.parse(text);
 if (typeof body !== "object" || body === null || !("access_token" in body)) {
  throw new Error("token endpoint response did not contain access_token");
 }
 const accessToken = body.access_token;
 if (typeof accessToken !== "string") {
  throw new Error("token endpoint returned a non-string access_token");
 }
 const refreshToken = "refresh_token" in body ? body.refresh_token : undefined;
 const expiresIn = "expires_in" in body ? body.expires_in : undefined;
 const scope = "scope" in body ? body.scope : undefined;
 return {
  accessToken,
  refreshToken: typeof refreshToken === "string" ? refreshToken : null,
  expiresIn: typeof expiresIn === "number" ? expiresIn : null,
  scope: typeof scope === "string" ? scope : null,
 };
}

/**
 * Only the RFC 6749 `error` / `error_description` fields of a token error, scrubbed of every value
 * the request carried (code, verifier, refresh token, client secret) and capped. Never the raw body.
 */
function oauthErrorDetail(body: string, sent: string[]): string {
 let parsed: unknown;
 try {
  parsed = JSON.parse(body);
 } catch {
  return "";
 }
 if (typeof parsed !== "object" || parsed === null) return "";
 const record = new Map<string, unknown>(Object.entries(parsed));
 const fields = [record.get("error"), record.get("error_description")].filter(
  (value): value is string => typeof value === "string" && value.length > 0,
 );
 return fields.length > 0 ? ` ${safeMessage(fields.join(": "), sent)}` : "";
}

export function exchangeCode(
 config: OAuthClientConfig,
 params: { code: string; verifier: string; redirectUri: string },
 fetchImpl: typeof fetch = fetch,
): Promise<OAuthTokens> {
 const form = new URLSearchParams({
  grant_type: "authorization_code",
  code: params.code,
  redirect_uri: params.redirectUri,
  client_id: config.clientId,
  code_verifier: params.verifier,
 });
 if (config.clientSecret) form.set("client_secret", config.clientSecret);
 return postTokenRequest(config.tokenUrl, form, fetchImpl);
}

export function refreshAccessToken(
 config: OAuthClientConfig,
 refreshToken: string,
 fetchImpl: typeof fetch = fetch,
): Promise<OAuthTokens> {
 const form = new URLSearchParams({
  grant_type: "refresh_token",
  refresh_token: refreshToken,
  client_id: config.clientId,
 });
 if (config.clientSecret) form.set("client_secret", config.clientSecret);
 return postTokenRequest(config.tokenUrl, form, fetchImpl);
}

/**
 * `client_credentials` grant: an `actor=app` access token (30 days, no refresh token). Every
 * process of one app in one workspace must request the same `scopes`: Linear revokes the existing
 * app-actor tokens when the scope set changes.
 */
export function requestClientCredentialsToken(
 config: { tokenUrl: string; clientId: string; clientSecret: string },
 scopes: readonly string[],
 fetchImpl: typeof fetch = fetch,
): Promise<OAuthTokens> {
 const form = new URLSearchParams({
  grant_type: "client_credentials",
  scope: scopes.join(","),
  client_id: config.clientId,
  client_secret: config.clientSecret,
 });
 return postTokenRequest(config.tokenUrl, form, fetchImpl);
}

/**
 * Linear's revocation endpoint takes the token in the form body, not in the
 * Authorization header.
 */
export async function revokeToken(
 config: OAuthClientConfig,
 accessToken: string,
 fetchImpl: typeof fetch = fetch,
): Promise<void> {
 const form = new URLSearchParams({ token: accessToken, client_id: config.clientId });
 if (config.clientSecret) form.set("client_secret", config.clientSecret);
 const response = await fetchImpl(config.revokeUrl, {
  method: "POST",
  headers: { "content-type": "application/x-www-form-urlencoded", accept: "application/json" },
  body: form.toString(),
 });
 if (!response.ok) {
  throw new Error(`token revocation failed: HTTP ${response.status}`);
 }
}

export async function loginOAuth(options: {
 cfg: OAuthClientConfig;
 actor: Actor;
 label: string;
 store: CredentialStore;
 redirect: OAuthRedirectConfig;
 openUrl: (url: string) => Promise<void>;
 fetchImpl?: typeof fetch;
 timeoutMs?: number;
}): Promise<ConnectionSummary> {
 const fetchImpl = options.fetchImpl ?? fetch;
 const pkce = createPkce();
 const callback = await startLoopbackCallback({
  expectedState: pkce.state,
  timeoutMs: options.timeoutMs ?? 300_000,
  redirect: options.redirect,
 });
 try {
  await options.openUrl(
   buildAuthorizeUrl(options.cfg, {
    challenge: pkce.challenge,
    state: pkce.state,
    redirectUri: callback.redirectUri,
    actor: options.actor,
   }),
  );
  const { code } = await callback.waitForCode();
  const tokens = await exchangeCode(
   options.cfg,
   { code, verifier: pkce.verifier, redirectUri: callback.redirectUri },
   fetchImpl,
  );
  const connection: Connection = {
   id: `linear-oauth-${randomUUID().slice(0, 8)}`,
   kind: "oauth",
   label: options.label,
   actor: options.actor,
   workspace: null,
   createdAt: new Date().toISOString(),
   secret: {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresAt: tokens.expiresIn === null ? null : Date.now() + tokens.expiresIn * 1000,
    scope: tokens.scope,
   },
  };
  await options.store.upsert(connection);
  return summarize(connection);
 } finally {
  callback.close();
 }
}

/** Refresh margin: a token expiring within a minute is treated as already stale. */
const REFRESH_MARGIN_MS = 60_000;

/**
 * Returns a connection whose access token is valid now, refreshing it at most
 * once across all sessions: the whole read-decide-refresh-write cycle, network
 * call included, runs inside one store transaction, so a second session waits
 * and then observes the rotated token instead of minting another one.
 */
export async function ensureFreshAccessToken(
 config: OAuthClientConfig,
 store: CredentialStore,
 id: string,
 fetchImpl: typeof fetch = fetch,
 now: () => number = Date.now,
): Promise<Connection> {
 const before = store.get(id);
 if (!before) throw new Error(`unknown Linear connection: ${id}`);
 if (before.kind !== "oauth") return before;
 if (before.secret.expiresAt === null || before.secret.expiresAt - REFRESH_MARGIN_MS > now()) {
  return before;
 }

 return store.transaction(async tx => {
  // Re-read: another session may have rotated the token while we waited.
  const connection = tx.get(id);
  if (!connection) throw new Error(`unknown Linear connection: ${id}`);
  if (connection.kind !== "oauth") return connection;
  const { expiresAt, refreshToken } = connection.secret;
  if (expiresAt === null || expiresAt - REFRESH_MARGIN_MS > now()) return connection;
  if (refreshToken === null) {
   throw new Error(`connection ${id} has an expired access token and no refresh token; re-login required`);
  }
  const tokens = await refreshAccessToken(config, refreshToken, fetchImpl);
  const refreshed: Connection = {
   ...connection,
   secret: {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken ?? refreshToken,
    expiresAt: tokens.expiresIn === null ? null : now() + tokens.expiresIn * 1000,
    scope: tokens.scope ?? connection.secret.scope,
   },
  };
  tx.upsert(refreshed);
  return refreshed;
 });
}
