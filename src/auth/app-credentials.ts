import { readEnvKeys } from "./key-file";
import { requestClientCredentialsToken } from "./oauth";

/**
 * Scope set of every `client_credentials` token this extension requests. Linear revokes the
 * app's existing app-actor tokens in a workspace when another process asks for a different set,
 * so all processes sharing the app must use this same set.
 */
export const APP_CREDENTIALS_SCOPES = ["read", "write"] as const;

/** Renew a cached token when less than this remains (tokens live 30 days). */
const RENEW_BEFORE_MS = 24 * 60 * 60 * 1000;

export interface AppCredentials {
	clientId: string;
	clientSecret: string;
}

/** `LINEAR_CLIENT_ID` and `LINEAR_CLIENT_SECRET` from an env-style file, read on every call. */
export function readAppCredentialsFile(file: string): AppCredentials {
	const values = readEnvKeys(file, ["LINEAR_CLIENT_ID", "LINEAR_CLIENT_SECRET"], "Linear app credentials file");
	return { clientId: values.LINEAR_CLIENT_ID, clientSecret: values.LINEAR_CLIENT_SECRET };
}

interface CachedToken {
	token: Promise<string>;
	/** Set once the request resolves. */
	accessToken?: string;
	expiresAt?: number;
}

/**
 * One token per (token URL, client, secret) for the whole process: main and subagent sessions
 * share it, so Linear sees one token request per process and 30 days, not one per call.
 * Concurrent callers share the pending request.
 */
const cache = new Map<string, CachedToken>();

function cacheKey(tokenUrl: string, credentials: AppCredentials): string {
	return `${tokenUrl}\n${credentials.clientId}\n${credentials.clientSecret}`;
}

export function appAccessToken(
	credentials: AppCredentials,
	tokenUrl: string,
	fetchImpl: typeof fetch,
	now: () => number = Date.now,
): Promise<string> {
	const key = cacheKey(tokenUrl, credentials);
	const cached = cache.get(key);
	if (cached && (cached.expiresAt === undefined || cached.expiresAt - now() > RENEW_BEFORE_MS)) return cached.token;
	const entry: CachedToken = {
		token: requestClientCredentialsToken({ tokenUrl, ...credentials }, APP_CREDENTIALS_SCOPES, fetchImpl).then(
			tokens => {
				entry.accessToken = tokens.accessToken;
				// No announced lifetime: keep it until Linear rejects it (forgetAppAccessToken).
				entry.expiresAt = tokens.expiresIn === null ? Number.POSITIVE_INFINITY : now() + tokens.expiresIn * 1000;
				return tokens.accessToken;
			},
			(error: unknown) => {
				if (cache.get(key) === entry) cache.delete(key);
				throw error;
			},
		),
	};
	cache.set(key, entry);
	return entry.token;
}

/**
 * Drops the cached token after Linear rejected it (revoked, rotated secret, cleanup). Only an entry
 * that holds `rejected` is dropped: a late 401 for an old token must not evict its replacement.
 */
export function forgetAppAccessToken(credentials: AppCredentials, tokenUrl: string, rejected: string): void {
	const key = cacheKey(tokenUrl, credentials);
	if (cache.get(key)?.accessToken === rejected) cache.delete(key);
}

/** The cached token value, if one has resolved, for scrubbing error text; never requests one. */
export function cachedAppAccessToken(credentials: AppCredentials, tokenUrl: string): string | null {
	return cache.get(cacheKey(tokenUrl, credentials))?.accessToken ?? null;
}
