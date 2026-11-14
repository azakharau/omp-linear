/**
 * Records and checks which inputs `dist/index.js` was built from. The stamp is a SHA-256 over
 * every file in `src/`, `bun.lock` and the `build` script string, so it does not depend on the
 * bun version that produced the bundle bytes.
 *   --write  store the stamp in dist/index.js.inputs (run by `bun run build`)
 *   --check  exit 1 when the stored stamp does not match the current inputs
 */
import * as fs from "node:fs";
import * as path from "node:path";

const ROOT = path.resolve(import.meta.dir, "..");
const STAMP = path.join(ROOT, "dist", "index.js.inputs");

function listFiles(dir: string): string[] {
	return fs
		.readdirSync(dir, { withFileTypes: true, recursive: true })
		.filter(entry => entry.isFile())
		.map(entry => path.relative(ROOT, path.join(entry.parentPath, entry.name)))
		.sort();
}

function inputsDigest(): string {
	const hash = new Bun.CryptoHasher("sha256");
	const buildScript = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8")).scripts.build;
	hash.update(`build:${buildScript}\0`);
	for (const file of [...listFiles(path.join(ROOT, "src")), "bun.lock"]) {
		hash.update(`${file}\0`);
		hash.update(fs.readFileSync(path.join(ROOT, file)));
		hash.update("\0");
	}
	return hash.digest("hex");
}

const mode = process.argv[2];
if (mode === "--write") {
	fs.writeFileSync(STAMP, `${inputsDigest()}\n`);
} else if (mode === "--check") {
	const stored = fs.existsSync(STAMP) ? fs.readFileSync(STAMP, "utf8").trim() : "";
	if (stored !== inputsDigest()) {
		console.error("dist/index.js is stale: run `bun run build` and commit dist/.");
		process.exit(1);
	}
} else {
	console.error("usage: bun run scripts/bundle-stamp.ts --write | --check");
	process.exit(2);
}
