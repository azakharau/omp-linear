import { afterAll, describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	statSync,
	utimesSync,
	writeFileSync,
} from "node:fs";
import { createServer, type Server } from "node:http";
import { hostname, tmpdir } from "node:os";
import { join } from "node:path";
import type { AddressInfo } from "node:net";

import { createLinearClient } from "../src/client/graphql.ts";
import { authHeadersFor, createCredentialStore, type Connection } from "../src/auth/store.ts";
import {
	buildAuthorizeUrl,
	createPkce,
	ensureFreshAccessToken,
	exchangeCode,
	loginOAuth,
	resolveOAuthConfig,
	revokeToken,
	startLoopbackCallback,
	type OAuthClientConfig,
} from "../src/auth/oauth.ts";

const SENTINELS = {
	accessToken: "sentinel-access-2Kq9",
	refreshToken: "sentinel-refresh-7Pz1",
	rotatedAccess: "sentinel-rotated-4Rt8",
	apiKey: "lin_api_sentinel-8Wm3",
};

/** Picks a port the OS currently considers free, then releases it. */
function reserveFreePort(): Promise<number> {
	return new Promise(done => {
		const probe = createServer();
		probe.listen(0, "127.0.0.1", () => {
			const { port } = probe.address() as AddressInfo;
			probe.close(() => done(port));
		});
	});
}

interface FakeServer {
	url: string;
	requests: { path: string; body: string; headers: Record<string, string> }[];
	close(): void;
}

const servers: Server[] = [];

function startServer(handler: (path: string, body: string, headers: Record<string, string>) => {
	status: number;
	body: string;
	headers?: Record<string, string>;
	delayMs?: number;
}): Promise<FakeServer> {
	const requests: FakeServer["requests"] = [];
	const server = createServer((request, response) => {
		const chunks: Buffer[] = [];
		request.on("data", chunk => chunks.push(chunk as Buffer));
		request.on("end", () => {
			const body = Buffer.concat(chunks).toString("utf8");
			const headers: Record<string, string> = {};
			for (const [key, value] of Object.entries(request.headers)) {
				if (typeof value === "string") headers[key] = value;
			}
			const path = new URL(request.url ?? "/", "http://127.0.0.1").pathname;
			requests.push({ path, body, headers });
			const reply = handler(path, body, headers);
			const send = () => {
				response.writeHead(reply.status, { "content-type": "application/json", ...reply.headers });
				response.end(reply.body);
			};
			if (reply.delayMs) setTimeout(send, reply.delayMs);
			else send();
		});
	});
	servers.push(server);
	const { promise, resolve } = Promise.withResolvers<FakeServer>();
	server.listen(0, "127.0.0.1", () => {
		const address = server.address() as AddressInfo;
		resolve({
			url: `http://127.0.0.1:${address.port}`,
			requests,
			close: () => server.close(),
		});
	});
	return promise;
}

afterAll(() => {
	for (const server of servers) server.close();
});

function tempStorePath(): string {
	return join(mkdtempSync(join(tmpdir(), "omp-linear-store-")), "nested", "connections.json");
}

describe("credential store", () => {
	test("persists connections, hides secrets and keeps the file private", async () => {
		const path = tempStorePath();
		const store = createCredentialStore(path);
		expect(store.list()).toEqual([]);

		const oauth: Connection = {
			id: "linear-oauth-a",
			kind: "oauth",
			label: "work",
			actor: "user",
			workspace: null,
			createdAt: "2026-09-22T10:00:00.000Z",
			secret: {
				accessToken: SENTINELS.accessToken,
				refreshToken: SENTINELS.refreshToken,
				expiresAt: 1,
				scope: "read,write",
			},
		};
		const apiKey: Connection = {
			id: "linear-key-b",
			kind: "api_key",
			label: "personal",
			actor: "user",
			workspace: null,
			createdAt: "2026-09-22T10:01:00.000Z",
			secret: { apiKey: SENTINELS.apiKey },
		};
		await store.upsert(oauth);
		await store.upsert(apiKey);

		const summaries = store.list();
		expect(summaries.map(entry => entry.id)).toEqual(["linear-oauth-a", "linear-key-b"]);
		const summaryJson = JSON.stringify(summaries);
		expect(summaryJson).not.toContain("secret");
		for (const sentinel of Object.values(SENTINELS)) {
			expect(summaryJson).not.toContain(sentinel);
		}

		expect(statSync(path).mode & 0o777).toBe(0o600);
		expect(statSync(join(path, "..")).mode & 0o777).toBe(0o700);

		// A second store over the same path sees the persisted records.
		const reopened = createCredentialStore(path);
		expect(reopened.get("linear-oauth-a")?.kind).toBe("oauth");
		expect(authHeadersFor(reopened.get("linear-oauth-a")!)).toEqual({
			authorization: `Bearer ${SENTINELS.accessToken}`,
		});
		expect(authHeadersFor(reopened.get("linear-key-b")!)).toEqual({
			authorization: SENTINELS.apiKey,
		});

		expect(await reopened.remove("linear-key-b")).toBe(true);
		expect(await reopened.remove("linear-key-b")).toBe(false);
		expect(reopened.list().map(entry => entry.id)).toEqual(["linear-oauth-a"]);
	});
});

describe("oauth config", () => {
	test("reports the missing client id instead of fabricating one", () => {
		expect(resolveOAuthConfig(undefined)).toEqual({ missing: ["clientId"] });
		expect(resolveOAuthConfig({ clientSecret: "s" })).toEqual({ missing: ["clientId"] });
		const resolved = resolveOAuthConfig({ clientId: "abc" });
		expect(resolved).toMatchObject({
			clientId: "abc",
			clientSecret: null,
			authorizeUrl: "https://linear.app/oauth/authorize",
			tokenUrl: "https://api.linear.app/oauth/token",
			scopes: ["read", "write", "issues:create", "comments:create"],
		});
	});
});

describe("pkce", () => {
	test("challenge is base64url(sha256(verifier))", () => {
		const pkce = createPkce();
		const expected = createHash("sha256").update(pkce.verifier).digest("base64url");
		expect(pkce.challenge).toBe(expected);
		expect(pkce.challenge).not.toBe(pkce.verifier);
		expect(pkce.state.length).toBeGreaterThanOrEqual(43);
		expect(createPkce().state).not.toBe(pkce.state);
	});

	test("authorize url carries S256, state and actor", () => {
		const config = resolveOAuthConfig({ clientId: "client-1" }) as OAuthClientConfig;
		const user = new URL(
			buildAuthorizeUrl(config, {
				challenge: "chal",
				state: "st",
				redirectUri: "http://127.0.0.1:1234/callback",
				actor: "user",
			}),
		);
		expect(user.searchParams.get("code_challenge_method")).toBe("S256");
		expect(user.searchParams.get("code_challenge")).toBe("chal");
		expect(user.searchParams.get("state")).toBe("st");
		expect(user.searchParams.get("actor")).toBe("user");
		expect(user.searchParams.get("response_type")).toBe("code");
		expect(user.searchParams.get("redirect_uri")).toBe("http://127.0.0.1:1234/callback");
		expect(user.searchParams.get("prompt")).toBeNull();

		const app = new URL(
			buildAuthorizeUrl(config, {
				challenge: "chal",
				state: "st",
				redirectUri: "http://127.0.0.1:1234/callback",
				actor: "app",
			}),
		);
		expect(app.searchParams.get("actor")).toBe("app");
		expect(app.searchParams.get("prompt")).toBe("consent");
	});
});
/** Tests may bind an OS-assigned port; production must not (Linear matches the URI). */
const EPHEMERAL = { redirect: { port: 0, allowEphemeralPort: true } } as const;


describe("loopback callback", () => {
	test("rejects a mismatched state and never yields a code", async () => {
		const callback = await startLoopbackCallback({ expectedState: "good", timeoutMs: 5_000, ...EPHEMERAL });
		const response = await fetch(`${callback.redirectUri}?code=c1&state=evil`);
		expect(response.status).toBe(400);
		expect(await response.text()).not.toContain("c1");
		await expect(callback.waitForCode()).rejects.toThrow(/state mismatch/);
		callback.close();
	});

	test("resolves the code on a matching state without echoing it", async () => {
		const callback = await startLoopbackCallback({ expectedState: "good", timeoutMs: 5_000, ...EPHEMERAL });
		const response = await fetch(`${callback.redirectUri}?code=secret-code&state=good`);
		expect(response.status).toBe(200);
		expect(await response.text()).not.toContain("secret-code");
		expect(await callback.waitForCode()).toEqual({ code: "secret-code" });
		callback.close();
	});

	// Real timers: the deadline lives inside startLoopbackCallback and drives a real
	// socket listener, so faking the clock would not close the server under test.
	test("times out and closes the listener", async () => {
		const callback = await startLoopbackCallback({ expectedState: "good", timeoutMs: 40, ...EPHEMERAL });
		await expect(callback.waitForCode()).rejects.toThrow(/timed out/);
		await expect(fetch(`${callback.redirectUri}?code=c&state=good`)).rejects.toThrow();
	});
});

describe("token endpoint interaction", () => {
	test("the login flow round-trips state, PKCE and one byte-identical redirect URI", async () => {
		// A fixed port is reserved first, mirroring a registered redirect URI.
		const port = await reserveFreePort();
		const issuer = await startServer((path, body) => {
			if (path === "/token") {
				const form = new URLSearchParams(body);
				return form.get("grant_type") === "authorization_code"
					? {
						status: 200,
						body: JSON.stringify({
							access_token: SENTINELS.accessToken,
							refresh_token: SENTINELS.refreshToken,
							expires_in: 3600,
							scope: "read,write",
						}),
					}
					: {
						status: 200,
						body: JSON.stringify({
							access_token: SENTINELS.rotatedAccess,
							refresh_token: SENTINELS.refreshToken,
							expires_in: 3600,
						}),
					};
			}
			if (path === "/revoke") return { status: 200, body: "{}" };
			return { status: 404, body: "{}" };
		});
		const config: OAuthClientConfig = {
			clientId: "client-1",
			clientSecret: "client-secret",
			authorizeUrl: `${issuer.url}/authorize`,
			tokenUrl: `${issuer.url}/token`,
			revokeUrl: `${issuer.url}/revoke`,
			scopes: ["read", "write"],
		};
		const store = createCredentialStore(tempStorePath());
		let authorizeParams: URLSearchParams | undefined;

		const summary = await loginOAuth({
			cfg: config,
			actor: "user",
			label: "work",
			store,
			redirect: { port },
			timeoutMs: 5_000,
			openUrl: async url => {
				// Play the authorization server: redirect back through real HTTP.
				const authorize = new URL(url);
				authorizeParams = authorize.searchParams;
				const redirect = new URL(authorize.searchParams.get("redirect_uri")!);
				redirect.searchParams.set("code", "code-xyz");
				redirect.searchParams.set("state", authorize.searchParams.get("state")!);
				await fetch(redirect.toString());
			},
		});

		const exchange = new URLSearchParams(issuer.requests.find(entry => entry.path === "/token")!.body);
		// Linear matches the redirect URI byte-for-byte across both legs.
		expect(exchange.get("redirect_uri")).toBe(`http://127.0.0.1:${port}/callback`);
		expect(exchange.get("redirect_uri")).toBe(authorizeParams!.get("redirect_uri"));
		expect(exchange.get("code")).toBe("code-xyz");
		expect(exchange.get("client_secret")).toBe("client-secret");
		expect(createHash("sha256").update(exchange.get("code_verifier") ?? "").digest("base64url")).toBe(
			authorizeParams?.get("code_challenge") ?? "",
		);
		expect(authorizeParams!.get("code_challenge_method")).toBe("S256");
		expect(JSON.stringify(summary)).not.toContain(SENTINELS.accessToken);
		// The state that reached the loopback is the one we advertised: a mismatch
		// would have rejected the callback and loginOAuth would never have resolved.
		expect(authorizeParams!.get("state")).toBeTruthy();
		const stored = store.get(summary.id)!;
		if (stored.kind !== "oauth") throw new Error("unreachable");
		expect(stored.secret.accessToken).toBe(SENTINELS.accessToken);

		// Force the refresh branch and check it rotates through the same issuer.
		await store.upsert({ ...stored, secret: { ...stored.secret, expiresAt: Date.now() + 1_000 } });
		const refreshed = await ensureFreshAccessToken(config, store, summary.id, fetch);
		expect(refreshed.kind === "oauth" && refreshed.secret.accessToken).toBe(SENTINELS.rotatedAccess);

		await revokeToken(config, SENTINELS.rotatedAccess);
		const revoke = issuer.requests.find(entry => entry.path === "/revoke")!;
		expect(new URLSearchParams(revoke.body).get("token")).toBe(SENTINELS.rotatedAccess);
		// The token must not ride along in a header instead.
		expect(revoke.headers.authorization).toBeUndefined();
	});

	test("a busy redirect port is reported instead of silently moving", async () => {
		const port = await reserveFreePort();
		const squatter = createServer((_request, response) => response.end("busy"));
		await new Promise<void>(done => squatter.listen(port, "127.0.0.1", done));
		try {
			await expect(
				startLoopbackCallback({ expectedState: "s", timeoutMs: 1_000, redirect: { port } }),
			).rejects.toThrow(new RegExp(`redirect port ${port} is already in use`));
		} finally {
			squatter.close();
		}
	});

	test("an ephemeral redirect port is refused outside tests", () => {
		expect(() => startLoopbackCallback({ expectedState: "s", timeoutMs: 1_000, redirect: { port: 0 } })).toThrow(
			/redirect port of 0/,
		);
	});

	test("refresh happens only when the token is within the expiry margin", async () => {
		let tokenRequests = 0;
		const token = await startServer(path => {
			if (path !== "/token") return { status: 404, body: "{}" };
			tokenRequests += 1;
			return {
				status: 200,
				body: JSON.stringify({
					access_token: SENTINELS.rotatedAccess,
					refresh_token: SENTINELS.refreshToken,
					expires_in: 3600,
				}),
			};
		});
		const config: OAuthClientConfig = {
			clientId: "client-1",
			clientSecret: null,
			authorizeUrl: `${token.url}/authorize`,
			tokenUrl: `${token.url}/token`,
			revokeUrl: `${token.url}/revoke`,
			scopes: ["read"],
		};
		const store = createCredentialStore(tempStorePath());
		const now = 1_000_000_000_000;
		await store.upsert({
			id: "c1",
			kind: "oauth",
			label: "work",
			actor: "user",
			workspace: null,
			createdAt: "2026-09-22T10:00:00.000Z",
			secret: {
				accessToken: SENTINELS.accessToken,
				refreshToken: SENTINELS.refreshToken,
				expiresAt: now + 10 * 60_000,
				scope: "read",
			},
		});

		const fresh = await ensureFreshAccessToken(config, store, "c1", fetch, () => now);
		expect(tokenRequests).toBe(0);
		if (fresh.kind !== "oauth") throw new Error("unreachable");
		expect(fresh.secret.accessToken).toBe(SENTINELS.accessToken);

		// Move the clock past expiresAt - 60s.
		const stale = await ensureFreshAccessToken(config, store, "c1", fetch, () => now + 10 * 60_000);
		expect(tokenRequests).toBe(1);
		if (stale.kind !== "oauth") throw new Error("unreachable");
		expect(stale.secret.accessToken).toBe(SENTINELS.rotatedAccess);
		const persisted = store.get("c1");
		if (persisted?.kind !== "oauth") throw new Error("unreachable");
		expect(persisted.secret.accessToken).toBe(SENTINELS.rotatedAccess);
		expect(new URLSearchParams(token.requests[0]!.body).get("grant_type")).toBe("refresh_token");
	});

	test("exchange and revoke surface endpoint failures", async () => {
		const token = await startServer(path =>
			path === "/revoke"
				? { status: 400, body: JSON.stringify({ error: "invalid_token" }) }
				: { status: 401, body: JSON.stringify({ error: "invalid_client" }) },
		);
		const config: OAuthClientConfig = {
			clientId: "client-1",
			clientSecret: null,
			authorizeUrl: `${token.url}/authorize`,
			tokenUrl: `${token.url}/token`,
			revokeUrl: `${token.url}/revoke`,
			scopes: ["read"],
		};
		await expect(
			exchangeCode(config, { code: "c", verifier: "v", redirectUri: "http://127.0.0.1/callback" }),
		).rejects.toThrow(/HTTP 401/);
		await expect(revokeToken(config, SENTINELS.accessToken)).rejects.toThrow(/HTTP 400/);
		const revoke = token.requests.find(entry => entry.path === "/revoke")!;
		expect(new URLSearchParams(revoke.body).get("token")).toBe(SENTINELS.accessToken);
	});

	test("a token error that echoes the request keeps only error/error_description, scrubbed and capped", async () => {
		const secret = "client-secret-value-123456";
		const token = await startServer(() => ({
			status: 400,
			body: JSON.stringify({
				error: "invalid_grant",
				error_description: `bad code verifier-abcdefgh with ${secret} ${"x".repeat(400)}`,
				echo: { client_secret: secret, code: "code-abcdefgh" },
			}),
		}));
		const config: OAuthClientConfig = {
			clientId: "client-1",
			clientSecret: secret,
			authorizeUrl: `${token.url}/authorize`,
			tokenUrl: `${token.url}/token`,
			revokeUrl: `${token.url}/revoke`,
			scopes: ["read"],
		};
		const error = await exchangeCode(config, { code: "code-abcdefgh", verifier: "verifier-abcdefgh", redirectUri: "http://127.0.0.1/callback" }).catch(e => e as Error);
		if (!(error instanceof Error)) throw new Error("exchange should fail");
		expect(error.message).toMatch(/^token endpoint rejected the request: HTTP 400 invalid_grant: bad code \[redacted\] with \[redacted\]/);
		for (const leaked of [secret, "verifier-abcdefgh", "code-abcdefgh", "echo"]) expect(error.message).not.toContain(leaked);
		expect(error.message.length).toBeLessThan(260);
	});
});

describe("graphql client", () => {
	const QUERY = "query Ping { viewer { id } }";

	async function clientFor(
		reply: (body: string) => { status: number; body: string; headers?: Record<string, string>; delayMs?: number },
		timeoutMs?: number,
	) {
		const server = await startServer((_path, body) => reply(body));
		return {
			server,
			client: createLinearClient({
				endpoint: `${server.url}/graphql`,
				getAuthHeaders: async () => ({ authorization: `Bearer ${SENTINELS.accessToken}` }),
				headers: { "x-extra": "1" },
				timeoutMs,
			}),
		};
	}

	test("an auth-header failure that echoes a credential is reported with the known secrets scrubbed and nothing sent", async () => {
		const secret = "plainsecretvalue-9q8w7e";
		let fetched = 0;
		const client = createLinearClient({
			endpoint: "http://127.0.0.1:9/graphql",
			fetchImpl: (async () => {
				fetched++;
				return new Response("{}");
			}) as unknown as typeof fetch,
			getAuthHeaders: async () => {
				throw new Error(`refresh rejected for ${secret}`);
			},
			knownSecrets: () => [secret],
		});
		const result = await client.execute(QUERY, {});
		expect(result).toMatchObject({ ok: false, kind: "auth", outcome: "not_sent" });
		if (result.ok) throw new Error("unreachable");
		expect(result.message).toBe("could not build auth headers: refresh rejected for [redacted]");
		expect(fetched).toBe(0);
	});

	test("200 with data only", async () => {
		const { server, client } = await clientFor(() => ({
			status: 200,
			body: JSON.stringify({ data: { viewer: { id: "u1" } } }),
			headers: { "x-ratelimit-requests-remaining": "1400", "x-ratelimit-requests-reset": "1760000000" },
		}));
		const result = await client.execute(QUERY, { a: 1 });
		expect(result).toMatchObject({
			ok: true,
			data: { viewer: { id: "u1" } },
			partialErrors: null,
			rateLimit: { remaining: 1400, resetAt: 1760000000 },
		});
		expect(server.requests.length).toBe(1);
		expect(server.requests[0]!.headers.authorization).toBe(`Bearer ${SENTINELS.accessToken}`);
		expect(server.requests[0]!.headers["x-extra"]).toBe("1");
		expect(JSON.parse(server.requests[0]!.body)).toEqual({ query: QUERY, variables: { a: 1 } });
	});

	test("200 with data and errors is a partial success", async () => {
		const { server, client } = await clientFor(() => ({
			status: 200,
			body: JSON.stringify({
				data: { viewer: null },
				errors: [{ message: "partial failure", path: ["viewer"] }],
			}),
		}));
		const result = await client.execute(QUERY);
		expect(result.ok).toBe(true);
		if (!result.ok) throw new Error("unreachable");
		expect(result.partialErrors).toEqual([{ message: "partial failure", path: ["viewer"] }]);
		expect(server.requests.length).toBe(1);
	});

	test("200 with errors only is a graphql failure", async () => {
		const { server, client } = await clientFor(() => ({
			status: 200,
			body: JSON.stringify({ errors: [{ message: "Field does not exist" }] }),
		}));
		const result = await client.execute(QUERY);
		expect(result).toMatchObject({ ok: false, kind: "graphql", status: 200, message: "Field does not exist" });
		expect(server.requests.length).toBe(1);
	});

	test("401 is an auth failure", async () => {
		const { server, client } = await clientFor(() => ({
			status: 401,
			body: JSON.stringify({ errors: [{ message: "Authentication required" }] }),
		}));
		const result = await client.execute(QUERY);
		expect(result).toMatchObject({ ok: false, kind: "auth", status: 401 });
		expect(server.requests.length).toBe(1);
	});

	test("429 carries retryAfterMs", async () => {
		const { server, client } = await clientFor(() => ({
			status: 429,
			body: JSON.stringify({ errors: [{ message: "rate limited" }] }),
			headers: { "retry-after": "42" },
		}));
		const result = await client.execute(QUERY);
		expect(result).toMatchObject({ ok: false, kind: "rate_limited", status: 429, retryAfterMs: 42_000 });
		expect(server.requests.length).toBe(1);
	});

	test("500 is an http failure and is not retried", async () => {
		const { server, client } = await clientFor(() => ({ status: 500, body: "upstream exploded" }));
		const result = await client.execute(QUERY);
		expect(result).toMatchObject({ ok: false, kind: "http", status: 500 });
		expect(server.requests.length).toBe(1);
	});

	// Real timers: the transport deadline races a real in-flight HTTP response; a fake
	// clock cannot reproduce "server is still sending" versus "client gave up".
	test("a slow server produces a timeout after exactly one request", async () => {
		const { server, client } = await clientFor(
			() => ({ status: 200, body: JSON.stringify({ data: {} }), delayMs: 300 }),
			60,
		);
		const result = await client.execute(QUERY);
		expect(result).toMatchObject({ ok: false, kind: "timeout", status: null });
		expect(server.requests.length).toBe(1);
	});

	test("an unreachable endpoint is a network failure", async () => {
		const client = createLinearClient({
			endpoint: "http://127.0.0.1:1/graphql",
			getAuthHeaders: async () => ({}),
			timeoutMs: 2_000,
		});
		const result = await client.execute(QUERY);
		expect(result).toMatchObject({ ok: false, kind: "network", status: null });
	});

	test("never leaks the authorization header into the result", async () => {
		const { client } = await clientFor(() => ({
			status: 500,
			body: JSON.stringify({ errors: [{ message: "boom" }] }),
		}));
		const result = await client.execute(QUERY);
		expect(JSON.stringify(result)).not.toContain(SENTINELS.accessToken);
	});

	test("an error path that echoes the credential is scrubbed; indexes stay numbers", async () => {
		const { client } = await clientFor(() => ({
			status: 200,
			body: JSON.stringify({ data: null, errors: [{ message: "bad", path: ["viewer", 0, `Bearer ${SENTINELS.accessToken}`] }] }),
		}));
		const result = await client.execute(QUERY);
		expect(result).toMatchObject({ ok: false, kind: "graphql" });
		if (result.ok) throw new Error("unreachable");
		expect(result.errors).toEqual([{ message: "bad", path: ["viewer", 0, "[redacted]"] }]);
		expect(JSON.stringify(result)).not.toContain(SENTINELS.accessToken);
	});
});

describe("send-safety semantics", () => {
	const QUERY = "query Ping { viewer { id } }";

	async function clientFor(
		reply: (body: string) => { status: number; body: string; headers?: Record<string, string>; delayMs?: number },
	) {
		const server = await startServer((_path, body) => reply(body));
		return {
			server,
			client: createLinearClient({
				endpoint: `${server.url}/graphql`,
				getAuthHeaders: async () => ({ authorization: `Bearer ${SENTINELS.accessToken}` }),
			}),
		};
	}

	test("a pre-aborted caller signal sends nothing at all", async () => {
		const server = await startServer(() => ({ status: 200, body: JSON.stringify({ data: {} }) }));
		const client = createLinearClient({
			endpoint: `${server.url}/graphql`,
			getAuthHeaders: async () => ({ authorization: `Bearer ${SENTINELS.accessToken}` }),
		});
		const result = await client.execute(QUERY, undefined, { signal: AbortSignal.abort() });
		// not_sent is the only outcome a caller may safely retry after.
		expect(result).toMatchObject({ ok: false, kind: "aborted", outcome: "not_sent" });
		expect(server.requests.length).toBe(0);
	});

	test("an abort raised during getAuthHeaders never reaches fetch", async () => {
		const controller = new AbortController();
		let fetchCalls = 0;
		const client = createLinearClient({
			endpoint: "http://127.0.0.1:1/graphql",
			getAuthHeaders: async () => {
				controller.abort();
				return { authorization: `Bearer ${SENTINELS.accessToken}` };
			},
			fetchImpl: (async () => {
				fetchCalls += 1;
				return new Response("{}", { status: 200 });
			}) as unknown as typeof fetch,
		});
		const result = await client.execute(QUERY, undefined, { signal: controller.signal });
		expect(result).toMatchObject({ ok: false, kind: "aborted", outcome: "not_sent" });
		expect(fetchCalls).toBe(0);
	});

	test("outcome classes follow proof, not convenience", async () => {
		const classes: { label: string; status: number; body: string; expect: Record<string, unknown> }[] = [
			{
				label: "4xx",
				status: 422,
				body: JSON.stringify({ errors: [{ message: "bad input" }] }),
				expect: { kind: "http", outcome: "rejected" },
			},
			{
				label: "401",
				status: 401,
				body: JSON.stringify({ errors: [{ message: "nope" }] }),
				expect: { kind: "auth", outcome: "rejected" },
			},
			{
				label: "graphql errors",
				status: 200,
				body: JSON.stringify({ errors: [{ message: "field missing" }] }),
				expect: { kind: "graphql", outcome: "rejected" },
			},
			{
				label: "5xx",
				status: 502,
				body: "upstream exploded",
				expect: { kind: "http", outcome: "unknown" },
			},
			{
				label: "non-JSON 2xx",
				status: 200,
				body: "<html>proxy interference</html>",
				expect: { kind: "http", outcome: "unknown" },
			},
			{
				label: "2xx without data or errors",
				status: 200,
				body: JSON.stringify({ extensions: {} }),
				expect: { kind: "graphql", outcome: "unknown" },
			},
		];
		for (const scenario of classes) {
			const { client } = await clientFor(() => ({ status: scenario.status, body: scenario.body }));
			expect({ label: scenario.label, ...(await client.execute(QUERY)) }).toMatchObject({
				label: scenario.label,
				ok: false,
				...scenario.expect,
			});
		}
	});

	test("a 429 is a refusal carrying its retry delay", async () => {
		const { client } = await clientFor(() => ({
			status: 429,
			body: JSON.stringify({ errors: [{ message: "slow down" }] }),
			headers: { "retry-after": "7" },
		}));
		expect(await client.execute(QUERY)).toMatchObject({
			ok: false,
			kind: "rate_limited",
			outcome: "rejected",
			retryAfterMs: 7_000,
		});
	});

	test("a request in flight when the deadline expires is undecided", async () => {
		// Real timers: the request must genuinely be in flight when the deadline hits.
		const silent = await startServer(() => ({ status: 200, body: "{}", delayMs: 400 }));
		const silentClient = createLinearClient({
			endpoint: `${silent.url}/graphql`,
			getAuthHeaders: async () => ({}),
			timeoutMs: 60,
		});
		expect(await silentClient.execute(QUERY)).toMatchObject({
			ok: false,
			kind: "timeout",
			outcome: "unknown",
		});
		expect(silent.requests.length).toBe(1);
	});

	test("a dropped connection is undecided", async () => {
		const client = createLinearClient({
			endpoint: "http://127.0.0.1:1/graphql",
			getAuthHeaders: async () => ({}),
			timeoutMs: 2_000,
		});
		expect(await client.execute(QUERY)).toMatchObject({ kind: "network", outcome: "unknown" });
	});

	test("an oversized response body is discarded instead of buffered", async () => {
		const { client } = await clientFor(() => ({
			status: 200,
			body: JSON.stringify({ data: { blob: "x".repeat(200_000) } }),
		}));
		const result = await client.execute(QUERY, undefined, { maxResponseBytes: 4_096 });
		expect(result).toMatchObject({ ok: false, kind: "too_large", outcome: "unknown", status: 200 });
		expect((result as { message: string }).message).toContain("4096");
	});

	test("credentials echoed by the server are scrubbed from the failure message", async () => {
		const leaked = "lin_oauth_leaked-token-abcdef";
		const { client } = await clientFor(() => ({
			status: 500,
			body: JSON.stringify({
				errors: [{ message: `upstream rejected Bearer ${SENTINELS.accessToken} and ${leaked}` }],
			}),
		}));
		const serialized = JSON.stringify(await client.execute(QUERY));
		expect(serialized).not.toContain(SENTINELS.accessToken);
		expect(serialized).not.toContain(leaked);
		expect(serialized).toContain("[redacted]");
	});

	test("operationName is forwarded so a multi-operation document is unambiguous", async () => {
		const { server, client } = await clientFor(() => ({ status: 200, body: JSON.stringify({ data: {} }) }));
		await client.execute("query A { viewer { id } } query B { viewer { id } }", undefined, {
			operationName: "B",
		});
		expect(JSON.parse(server.requests[0]!.body).operationName).toBe("B");
	});
});

describe("store durability", () => {
	test("a corrupt store file is reported and left byte-for-byte intact", async () => {
		const path = tempStorePath();
		mkdirSync(join(path, ".."), { recursive: true, mode: 0o700 });
		const corrupt = '{"version":1,"connections":[ truncated';
		writeFileSync(path, corrupt);
		const store = createCredentialStore(path);

		expect(() => store.list()).toThrow(/not valid JSON/);
		await expect(
			store.upsert({
				id: "x",
				kind: "api_key",
				label: "l",
				actor: "user",
				workspace: null,
				createdAt: "2026-09-22T00:00:00.000Z",
				secret: { apiKey: SENTINELS.apiKey },
			}),
		).rejects.toThrow(/not valid JSON/);
		// Overwriting would have destroyed a recoverable credential file.
		expect(readFileSync(path, "utf8")).toBe(corrupt);
	});

	test("a slow refresh keeps its lock; a logout on another handle waits and wins", async () => {
		// Real timing: the point is a transaction that holds the lock for longer
		// than a naive age-based staleness check would tolerate.
		let tokenRequests = 0;
		const server = await startServer(() => {
			tokenRequests += 1;
			return {
				status: 200,
				delayMs: 1_500,
				body: JSON.stringify({
					access_token: SENTINELS.rotatedAccess,
					refresh_token: SENTINELS.refreshToken,
					expires_in: 3600,
				}),
			};
		});
		const cfg: OAuthClientConfig = {
			clientId: "client-1",
			clientSecret: null,
			authorizeUrl: `${server.url}/authorize`,
			tokenUrl: `${server.url}/token`,
			revokeUrl: `${server.url}/revoke`,
			scopes: ["read"],
		};
		const path = tempStorePath();
		const refresher = createCredentialStore(path);
		const logout = createCredentialStore(path);
		await refresher.upsert({
			id: "conn",
			kind: "oauth",
			label: "work",
			actor: "user",
			workspace: null,
			createdAt: "2026-09-22T00:00:00.000Z",
			secret: {
				accessToken: SENTINELS.accessToken,
				refreshToken: SENTINELS.refreshToken,
				expiresAt: Date.now() + 1_000,
				scope: "read",
			},
		});

		const refreshing = ensureFreshAccessToken(cfg, refresher, "conn", fetch);
		await new Promise(done => setTimeout(done, 50));
		const removing = logout.remove("conn");
		const [refreshed, removed] = await Promise.all([refreshing, removing]);

		expect(tokenRequests).toBe(1);
		expect(refreshed.kind === "oauth" && refreshed.secret.accessToken).toBe(SENTINELS.rotatedAccess);
		// The logout ran after the refresh committed, so it saw and deleted the row.
		expect(removed).toBe(true);
		expect(refresher.list()).toEqual([]);
		// The rotated token must not survive the logout anywhere on disk.
		expect(readFileSync(path, "utf8")).not.toContain(SENTINELS.rotatedAccess);
		expect(existsSync(`${path}.lock`)).toBe(false);
	});

	test("two handles writing different ids both land", async () => {
		const path = tempStorePath();
		const a = createCredentialStore(path);
		const b = createCredentialStore(path);
		const connection = (id: string): Connection => ({
			id,
			kind: "api_key",
			label: id,
			actor: "user",
			workspace: null,
			createdAt: "2026-09-22T00:00:00.000Z",
			secret: { apiKey: `${SENTINELS.apiKey}-${id}` },
		});

		await Promise.all([a.upsert(connection("one")), b.upsert(connection("two"))]);

		expect(a.list().map(entry => entry.id).sort()).toEqual(["one", "two"]);
	});

	test("a stale lock is broken only when its owner is provably dead", async () => {
		const deadPath = tempStorePath();
		mkdirSync(join(deadPath, ".."), { recursive: true, mode: 0o700 });
		const stale = new Date(Date.now() - 60_000);

		// A pid above the kernel maximum can never exist, so process.kill gives ESRCH.
		const deadPid = 4_194_305;
		writeFileSync(
			`${deadPath}.lock`,
			JSON.stringify({ pid: deadPid, hostname: hostname(), token: "old", createdAt: stale.toISOString() }),
		);
		utimesSync(`${deadPath}.lock`, stale, stale);
		const deadStore = createCredentialStore(deadPath, { lockTimeoutMs: 400 });
		expect(await deadStore.transaction(tx => tx.list())).toEqual([]);

		const livePath = tempStorePath();
		mkdirSync(join(livePath, ".."), { recursive: true, mode: 0o700 });
		writeFileSync(
			`${livePath}.lock`,
			JSON.stringify({
				pid: process.pid,
				hostname: hostname(),
				token: "live",
				createdAt: stale.toISOString(),
			}),
		);
		utimesSync(`${livePath}.lock`, stale, stale);
		const liveStore = createCredentialStore(livePath, { lockTimeoutMs: 400 });
		// The heartbeat stopped, but the owner is alive: stealing would corrupt its work.
		await expect(liveStore.transaction(tx => tx.list())).rejects.toThrow(/timed out acquiring/);
		expect(existsSync(`${livePath}.lock`)).toBe(true);
	});

	test("a failed transaction commits nothing and releases the lock", async () => {
		const path = tempStorePath();
		const store = createCredentialStore(path, { lockTimeoutMs: 1_000 });
		await expect(
			store.transaction(tx => {
				tx.upsert({
					id: "doomed",
					kind: "api_key",
					label: "l",
					actor: "user",
					workspace: null,
					createdAt: "2026-09-22T00:00:00.000Z",
					secret: { apiKey: SENTINELS.apiKey },
				});
				throw new Error("body failed");
			}),
		).rejects.toThrow(/body failed/);

		expect(existsSync(`${path}.lock`)).toBe(false);
		expect(await store.transaction(tx => tx.list())).toEqual([]);
	});

	test("a replayed OAuth redirect is refused instead of feeding a second code", async () => {
		const pkce = createPkce();
		const callback = await startLoopbackCallback({
			expectedState: pkce.state,
			timeoutMs: 5_000,
			...EPHEMERAL,
		});
		try {
			const first = await fetch(`${callback.redirectUri}?code=code-1&state=${pkce.state}`);
			expect(first.status).toBe(200);
			expect(await callback.waitForCode()).toEqual({ code: "code-1" });

			const replay = await fetch(`${callback.redirectUri}?code=code-2&state=${pkce.state}`);
			expect(replay.status).toBe(410);
			// The already-settled promise keeps the first code.
			expect(await callback.waitForCode()).toEqual({ code: "code-1" });
		} finally {
			callback.close();
		}
	});
});
