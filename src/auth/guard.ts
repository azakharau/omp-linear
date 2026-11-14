import * as os from "node:os";
import * as path from "node:path";
import { expandHome } from "./key-file";

/**
 * Agent tools that can read a file, and the input field that names it. A credentials file is read
 * only by this extension, in process. An agent that reads it can call Linear outside the extension
 * and set any `createAsUser` name, so these calls are blocked.
 */
const READ_FIELDS: Readonly<Record<string, string>> = {
	bash: "command",
	eval: "code",
	read: "path",
	grep: "path",
	glob: "path",
};

export const CREDENTIAL_ACCESS_REASON =
	"Linear credentials are read only by the Linear extension. Use the linear_* tools (start with linear_tool_search). " +
	"If they are missing in this session, stop and report it. Do not call the Linear API directly or set createAsUser.";

/**
 * The spellings of each credentials file an agent can write: the absolute path, the `~/`, `$HOME/` and
 * `${HOME}/` forms under the home directory and, for a configured file (`named`), its bare file name.
 * The store's name (`connections.json`) is too common to match bare.
 */
export function credentialSpellings(named: readonly string[], stores: readonly string[]): string[] {
	const home = os.homedir();
	const spell = (file: string): string[] => {
		const absolute = path.resolve(expandHome(file));
		const relative = path.relative(home, absolute);
		const underHome = relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
		return underHome ? [absolute, `~/${relative}`, `$HOME/${relative}`, `\${HOME}/${relative}`] : [absolute];
	};
	const spellings = [...named.flatMap(file => [...spell(file), path.basename(expandHome(file))]), ...stores.flatMap(spell)];
	return [...new Set(spellings.filter(s => s.length > 0))];
}

/** True when a file-reading tool call names one of `spellings`. */
export function readsCredentials(toolName: string, input: unknown, spellings: readonly string[]): boolean {
	const field = READ_FIELDS[toolName];
	if (!field || !input || typeof input !== "object" || !(field in input)) return false;
	const value = (input as Record<string, unknown>)[field];
	return typeof value === "string" && spellings.some(s => value.includes(s));
}
