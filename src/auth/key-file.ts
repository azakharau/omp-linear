import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

/** `~/x` → `<home>/x`; everything else unchanged. */
export function expandHome(file: string): string {
	return file === "~" || file.startsWith("~/") ? path.join(os.homedir(), file.slice(1)) : file;
}

/**
 * Reads `LINEAR_API_KEY` from an env-style file (`LINEAR_API_KEY=...`, optional `export` and
 * quotes). Read on every call so a rotated key applies without a restart. Errors name the path,
 * never the file content.
 */
export function readApiKeyFile(file: string): string {
	const resolved = expandHome(file);
	let content: string;
	try {
		content = fs.readFileSync(resolved, "utf8");
	} catch {
		throw new Error(`Linear API key file not found: ${resolved}`);
	}
	for (const raw of content.split("\n")) {
		const line = raw.trim().replace(/^export\s+/, "");
		if (!line.startsWith("LINEAR_API_KEY=")) continue;
		const value = line
			.slice("LINEAR_API_KEY=".length)
			.trim()
			.replace(/^(["'])(.*)\1$/, "$2");
		if (value) return value;
	}
	throw new Error(`LINEAR_API_KEY is not set in ${resolved}`);
}
