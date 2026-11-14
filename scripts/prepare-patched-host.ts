/**
 * Builds an isolated, patched copy of the pinned OMP host under `.patched-host/`:
 *   1. verifies the pinned host version and the digests of every file the patch touches,
 *   2. copies `node_modules/@oh-my-pi/pi-coding-agent/{src,package.json}`,
 *   3. applies `host-patch/restricted-extension-tools.patch` with `patch -p1`.
 * The global OMP install and `node_modules` are never modified.
 */
import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const HOST_PACKAGE_DIR = path.join(ROOT, "node_modules", "@oh-my-pi", "pi-coding-agent");
export const PATCHED_HOST_DIR = path.join(ROOT, ".patched-host");
export const PATCH_FILE = path.join(ROOT, "host-patch", "restricted-extension-tools.patch");
export const PINNED_HOST_VERSION = "18.2.7";

/** sha256 of every pristine file the patch touches, pinned to host 18.2.7. */
export const PINNED_FILE_DIGESTS: Record<string, string> = {
 "src/config/settings-schema.ts": "277f30e761f891b14827ba38c7b294e7700d652b8834aa6092506ef85591aa3a",
 "src/extensibility/extensions/runner.ts": "4c0669c19f3a947fc629c13259e1ed070a977f97424d89ef7a57edf769fb73bb",
 "src/extensibility/extensions/types.ts": "5a81d51811007312e77c1a0f25e3ebb1424a3a81a7181280eca9f19b977360f7",
 "src/sdk.ts": "ea371761d1a997b5077f984dc9408e1559bc7786aaa10a256934cf93ff261876",
 "src/session/agent-session-types.ts": "2fcc7a5bafd406f84aa751c45ec28e8c51fdeae79f7f60be8a87359ae389e653",
 "src/session/agent-session.ts": "cc62a8860c30e15aacdfee0a98430ddd3085d434387b99ab7abd82f63c5f5c2a",
 "src/session/session-tools.ts": "4d9aeb8450f0b0b4d63a0fad81c1051fe805ddc94c462ff95ab2a8574539101e",
 "src/task/index.ts": "6252dc99e7dce761747fad0d29c3de2616bbdfc1fcedb77fb494f4e1a76d6061",
};
export function sha256File(file: string): string {
 return createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

export function verifyPinnedHost(packageDir = HOST_PACKAGE_DIR): { version: string; mismatches: string[] } {
 const version = JSON.parse(fs.readFileSync(path.join(packageDir, "package.json"), "utf8")).version as string;
 const mismatches: string[] = [];
 if (version !== PINNED_HOST_VERSION) mismatches.push(`package.json version ${version} != ${PINNED_HOST_VERSION}`);
 for (const [relative, expected] of Object.entries(PINNED_FILE_DIGESTS)) {
  const actual = sha256File(path.join(packageDir, relative));
  if (actual !== expected) mismatches.push(`${relative}: ${actual} != ${expected}`);
 }
 return { version, mismatches };
}

export function preparePatchedHost(options: { packageDir?: string; targetDir?: string; patchFile?: string } = {}): string {
 const packageDir = options.packageDir ?? HOST_PACKAGE_DIR;
 const targetDir = options.targetDir ?? PATCHED_HOST_DIR;
 const patchFile = options.patchFile ?? PATCH_FILE;
 const { mismatches } = verifyPinnedHost(packageDir);
 if (mismatches.length > 0) {
  throw new Error(`host source does not match the pinned ${PINNED_HOST_VERSION} digests:\n${mismatches.join("\n")}`);
 }
 fs.rmSync(targetDir, { recursive: true, force: true });
 fs.mkdirSync(targetDir, { recursive: true });
 fs.cpSync(path.join(packageDir, "src"), path.join(targetDir, "src"), { recursive: true });
 // `src/utils/changelog.ts` and a few workers import these two files from the package root.
 // `package.json` also makes the copy self-referencing: extensions loaded by this host import
 // `@oh-my-pi/pi-coding-agent/*`, which the host resolves from its own tree (see `name`/`exports`),
 // so the patched host and its extensions share one module instance per file.
 for (const file of ["package.json", "CHANGELOG.md"]) {
  fs.copyFileSync(path.join(packageDir, file), path.join(targetDir, file));
 }
 const result = spawnSync("patch", ["-p1", "--forward", "--no-backup-if-mismatch", "-i", patchFile], {
  cwd: targetDir,
  encoding: "utf8",
 });
 if (result.status !== 0) {
  throw new Error(`patch failed (exit ${result.status}):\n${result.stdout}${result.stderr}`);
 }
 return targetDir;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
 const dir = preparePatchedHost();
 console.log(`patched host ready at ${dir} (host ${PINNED_HOST_VERSION}, patch ${sha256File(PATCH_FILE).slice(0, 16)})`);
}
