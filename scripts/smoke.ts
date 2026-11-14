/**
 * End-to-end smoke: a real OMP session loads this package through the host's own extension
 * loader, against a fake Linear GraphQL server and a fake OAuth issuer on loopback. The host
 * (`@oh-my-pi/pi-coding-agent` 18.20.0 sources in node_modules) runs in its own process
 * (`scripts/smoke-host.ts`): search, activation, api_key call, OAuth login + actor=app
 * attribution and native deny. `scripts/smoke-binary.ts` covers the installed `omp` binary.
 * Prints a JSON summary with PASS/FAIL per step and exits non-zero when any step fails.
 * No network beyond loopback; credentials live in a throwaway agent dir.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import type { SmokeStep } from "./smoke-host";

const ROOT = path.resolve(import.meta.dir, "..");
const HOST_ROOT = path.join(ROOT, "node_modules", "@oh-my-pi", "pi-coding-agent", "src");

/**
 * Only these inherited variables reach the host process. HOME, XDG_* and the agent dir point
 * at a throwaway scratch tree so the real ~/.omp profile, auth store and `.env` files can never
 * be consumed; everything else (API keys, PI_/OMP_ profile selectors, tokens) is dropped.
 */
const ENV_ALLOWLIST = ["PATH", "TMPDIR", "LANG", "LC_ALL", "TERM", "SSL_CERT_FILE", "SSL_CERT_DIR"] as const;

function childEnv(scratch: string): Record<string, string> {
 const env: Record<string, string> = {};
 for (const key of ENV_ALLOWLIST) {
  const value = process.env[key];
  if (value !== undefined) env[key] = value;
 }
 const home = path.join(scratch, "home");
 env.HOME = home;
 env.USERPROFILE = home;
 env.XDG_CONFIG_HOME = path.join(scratch, "xdg-config");
 env.XDG_DATA_HOME = path.join(scratch, "xdg-data");
 env.XDG_STATE_HOME = path.join(scratch, "xdg-state");
 env.XDG_CACHE_HOME = path.join(scratch, "xdg-cache");
 env.PI_CODING_AGENT_DIR = path.join(scratch, "agent");
 for (const dir of [home, env.XDG_CONFIG_HOME, env.XDG_DATA_HOME, env.XDG_STATE_HOME, env.XDG_CACHE_HOME, env.PI_CODING_AGENT_DIR]) {
  fs.mkdirSync(dir, { recursive: true });
 }
 return env;
}

/** Parses the host's final JSON line; a crashed host or an empty step set is a failure, never a PASS. */
export function interpretHostResult(name: string, exitCode: number | null, stdout: string, stderr: string): SmokeStep[] {
 const fail = (detail: string): SmokeStep[] => [{ step: `${name}: host process`, status: "FAIL", detail }];
 const marker = stdout.lastIndexOf("\n{");
 const line = marker >= 0 ? stdout.slice(marker + 1) : stdout;
 let parsed: { steps?: unknown };
 try {
  parsed = JSON.parse(line) as { steps?: unknown };
 } catch {
  return fail(`exit ${exitCode}, no result JSON: ${stderr.slice(-800)}`);
 }
 const steps = Array.isArray(parsed.steps) ? (parsed.steps as SmokeStep[]) : [];
 if (steps.length === 0) return fail(`exit ${exitCode}: host reported no steps`);
 const named = steps.map(step => ({ ...step, step: `${name}: ${step.step}` }));
 if (exitCode !== 0) {
  named.push({ step: `${name}: host process`, status: "FAIL", detail: `exit ${exitCode} after reporting: ${stderr.slice(-800)}` });
 }
 return named;
}

function runHost(scratch: string): SmokeStep[] {
 if (!fs.existsSync(path.join(HOST_ROOT, "sdk.ts"))) {
  return [{ step: "host: present", status: "FAIL", detail: `${HOST_ROOT} missing (run bun install)` }];
 }
 const child = Bun.spawnSync([process.execPath, "run", path.join(ROOT, "scripts", "smoke-host.ts"), HOST_ROOT], {
  cwd: ROOT,
  env: childEnv(scratch),
  stdout: "pipe",
  stderr: "pipe",
 });
 return interpretHostResult("host", child.exitCode, child.stdout.toString(), child.stderr.toString());
}

if (import.meta.main) {
 const scratch = fs.mkdtempSync(path.join(fs.realpathSync(require("node:os").tmpdir()), "omp-linear-smoke-"));
 let steps: SmokeStep[];
 try {
  steps = runHost(scratch);
 } finally {
  fs.rmSync(scratch, { recursive: true, force: true });
 }
 const failed = steps.filter(s => s.status === "FAIL").length;
 console.log(JSON.stringify({ result: failed === 0 ? "PASS" : "FAIL", passed: steps.length - failed, failed, steps }, null, 2));
 process.exit(failed === 0 ? 0 : 1);
}
