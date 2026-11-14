import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

/** `~/x` → `<home>/x`; everything else unchanged. */
export function expandHome(file: string): string {
	return file === "~" || file.startsWith("~/") ? path.join(os.homedir(), file.slice(1)) : file;
}

/**
 * Reads `keys` from an env-style file (`KEY=value`, optional `export` and quotes). Read on every
 * call so a rotated value applies without a restart. Errors name the path and the key, never the
 * file content. `what` names the file in the not-found error.
 */
export function readEnvKeys<K extends string>(file: string, keys: readonly K[], what: string): Record<K, string> {
	const resolved = expandHome(file);
	let content: string;
	try {
		content = fs.readFileSync(resolved, "utf8");
	} catch {
		throw new Error(`${what} not found: ${resolved}`);
	}
	const found = new Map<string, string>();
	for (const raw of content.split("\n")) {
		const line = raw.trim().replace(/^export\s+/, "");
		const eq = line.indexOf("=");
		if (eq <= 0) continue;
		const value = line
			.slice(eq + 1)
			.trim()
			.replace(/^(["'])(.*)\1$/, "$2");
		const key = line.slice(0, eq).trim();
		if (value && !found.has(key)) found.set(key, value);
	}
	const result = {} as Record<K, string>;
	for (const key of keys) {
		const value = found.get(key);
		if (!value) throw new Error(`${key} is not set in ${resolved}`);
		result[key] = value;
	}
	return result;
}

/** `LINEAR_API_KEY` from an env-style file. */
export function readApiKeyFile(file: string): string {
	return readEnvKeys(file, ["LINEAR_API_KEY"], "Linear API key file").LINEAR_API_KEY;
}
