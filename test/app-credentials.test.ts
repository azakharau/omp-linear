import { afterAll, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { appAccessToken, forgetAppAccessToken } from "../src/auth/app-credentials.ts";
import { readApiKeyFile } from "../src/auth/key-file.ts";

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "omp-linear-app-creds-"));
afterAll(() => fs.rmSync(dir, { recursive: true, force: true }));

test("a late 401 for an old app token does not evict its replacement", async () => {
	let issued = 0;
	const fetchImpl = (async () => Response.json({ access_token: `token-${++issued}`, expires_in: 2_591_999 })) as unknown as typeof fetch;
	const credentials = { clientId: "race-client", clientSecret: "race-secret-0123" };
	const tokenUrl = "http://127.0.0.1:9/race-token";

	expect(await appAccessToken(credentials, tokenUrl, fetchImpl)).toBe("token-1");
	forgetAppAccessToken(credentials, tokenUrl, "token-1");
	expect(await appAccessToken(credentials, tokenUrl, fetchImpl)).toBe("token-2");
	// A second request that also carried token-1 answers 401 after the renewal.
	forgetAppAccessToken(credentials, tokenUrl, "token-1");
	expect(await appAccessToken(credentials, tokenUrl, fetchImpl)).toBe("token-2");
	expect(issued).toBe(2);
});

test("a key file must be a regular file of at most 64 KiB", () => {
	const big = path.join(dir, "big.env");
	fs.writeFileSync(big, `LINEAR_API_KEY=lin_api_x\n${"#".repeat(70_000)}\n`);
	expect(() => readApiKeyFile(big)).toThrow(/larger than 65536 bytes/);
	expect(() => readApiKeyFile(dir)).toThrow(/not a regular file/);
	const ok = path.join(dir, "ok.env");
	fs.writeFileSync(ok, "export LINEAR_API_KEY='lin_api_ok'\n");
	expect(readApiKeyFile(ok)).toBe("lin_api_ok");
});
