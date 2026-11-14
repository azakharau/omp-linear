import { describe, expect, test } from "bun:test";
import * as os from "node:os";
import * as path from "node:path";
import { credentialSpellings, readsCredentials } from "../src/auth/guard";

const home = os.homedir();
const spellings = credentialSpellings(["~/secrets/acme-linear.env"], [path.join(home, ".omp/agent/linear/connections.json")]);

describe("credential guard", () => {
	test.each([
		["bash", { command: "cat ~/secrets/acme-linear.env" }],
		["bash", { command: `source ${home}/secrets/acme-linear.env && curl https://api.linear.app/graphql` }],
		["bash", { command: "grep KEY $HOME/secrets/acme-linear.env" }],
		["eval", { code: 'open(Path.home() / "secrets" / "acme-linear.env")' }],
		["read", { path: `${home}/.omp/agent/linear/connections.json` }],
		["grep", { pattern: "token", path: "~/.omp/agent/linear/connections.json" }],
	])("blocks %s %j", (toolName, input) => {
		expect(readsCredentials(toolName, input, spellings)).toBe(true);
	});

	test.each([
		["bash", { command: "bun run check" }],
		["read", { path: "connections.json" }],
		["read", { path: `${home}/proj/app/README.md` }],
		["edit", { path: "~/secrets/acme-linear.env" }],
		["bash", {}],
	])("allows %s %j", (toolName, input) => {
		expect(readsCredentials(toolName, input, spellings)).toBe(false);
	});
});
