/**
 * Smoke on the REAL installed `omp` binary (default: `omp` on PATH, or
 * `--omp <bin>` / `OMP_BIN`). Runs `scripts/measure-context.ts` with a throwaway key file for
 * `linear.apiKeyFile`, a fake model and a fake Linear on loopback, for two load paths:
 * `-e src/index.ts` and `extensions: [<repo>]` in the agent config. HOME, XDG_* and the agent
 * dir live in a scratch dir under `.scratch/`; the real `~/.omp` is never read or written.
 *
 * Checks per load path: at start the Linear tools are `linear_tool_search` and the ergonomic
 * `linear_*` ops as native functions, no typed or utility tool, and no Linear xd:// device is listed; `linear_issue_get` returns the fake issue in the main agent (S2), in a `task`
 * child (S3) and in a child restricted to `read` (S4); every Linear request carries the key
 * file value; the key never appears in a model request.
 * Prints a JSON summary with PASS/FAIL per step and exits non-zero when any step fails.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { ergonomicOps } from "../src/ops/index.ts";

const ROOT = path.resolve(import.meta.dir, "..");
const VARIANTS = ["ext", "ext-manifest"] as const;
const SCENARIOS = ["S1", "S2", "S3", "S4"] as const;

interface Step {
	step: string;
	status: "PASS" | "FAIL";
	detail: string;
}

interface Conversation {
	operation: string;
}

interface Report {
	variant: string;
	scenario: string;
	exitCode: number | null;
	stderrTail: string;
	start: { linearTools: string[]; linearDevices: number } | null;
	conversations: Record<string, Conversation>;
	keyInModelRequests: boolean;
	linearRequests: number;
	linearAuthMatchesKeyFile: boolean | null;
}

function argValue(name: string): string | undefined {
	const index = process.argv.indexOf(name);
	return index >= 0 ? process.argv[index + 1] : undefined;
}

function check(reports: Report[]): Step[] {
	const steps: Step[] = [];
	const record = (step: string, ok: boolean, detail: string) => steps.push({ step, status: ok ? "PASS" : "FAIL", detail });
	for (const variant of VARIANTS) {
		for (const scenario of SCENARIOS) {
			const report = reports.find(r => r.variant === variant && r.scenario === scenario);
			if (!report) {
				record(`${variant} ${scenario}: ran`, false, "no report");
				continue;
			}
			record(`${variant} ${scenario}: omp exited 0`, report.exitCode === 0, `exit ${report.exitCode}: ${report.stderrTail.slice(-200)}`);
			record(`${variant} ${scenario}: key absent from model requests`, !report.keyInModelRequests, `keyInModelRequests=${report.keyInModelRequests}`);
			if (scenario === "S1") {
				const start = report.start;
				const expected = ["linear_tool_search", ...ergonomicOps.filter(op => !op.onDemand).map(op => op.name)].sort().join();
				record(
					`${variant} S1: linear_tool_search and the ergonomic ops are the only Linear tools, native, no Linear device`,
					start !== null && [...start.linearTools].sort().join() === expected && start.linearDevices === 0,
					`linearTools=${JSON.stringify(start?.linearTools)}, linearDevices=${start?.linearDevices}`,
				);
				continue;
			}
			const outcomes = Object.entries(report.conversations).filter(([, c]) => c.operation !== "not-called");
			const child = scenario !== "S2";
			const reached = outcomes.filter(([name]) => (child ? name !== scenario : name === scenario));
			record(
				`${variant} ${scenario}: linear_issue_get returns the fake issue${child ? " in the task child" : ""}`,
				reached.length > 0 && outcomes.every(([, c]) => c.operation === "ok"),
				outcomes.map(([name, c]) => `${name}=${c.operation}`).join(", ") || "not called",
			);
			record(
				`${variant} ${scenario}: Linear requests carry the key file value`,
				report.linearRequests > 0 && report.linearAuthMatchesKeyFile === true,
				`requests=${report.linearRequests}, match=${report.linearAuthMatchesKeyFile}`,
			);
		}
	}
	return steps;
}

if (import.meta.main) {
	const scratch = path.join(ROOT, ".scratch", "smoke-binary");
	fs.rmSync(scratch, { recursive: true, force: true });
	fs.mkdirSync(scratch, { recursive: true });
	const keyFile = path.join(scratch, "linear.env");
	fs.writeFileSync(keyFile, "LINEAR_API_KEY=lin_api_smoke_binary_4c1e9b\n", { mode: 0o600 });
	const omp = argValue("--omp") ?? process.env.OMP_BIN;
	const args = [
		process.execPath,
		"run",
		path.join(ROOT, "scripts", "measure-context.ts"),
		"--variants",
		VARIANTS.join(","),
		"--scenarios",
		SCENARIOS.join(","),
		"--api-key-file",
		keyFile,
		"--out",
		path.join(scratch, "out"),
		...(omp ? ["--omp", omp] : []),
	];
	let steps: Step[];
	try {
		const child = Bun.spawn(args, { cwd: ROOT, stdout: "pipe", stderr: "pipe" });
		const [, stderr] = await Promise.all([new Response(child.stdout).text(), new Response(child.stderr).text()]);
		await child.exited;
		const reportFile = path.join(scratch, "out", "report.json");
		steps = fs.existsSync(reportFile)
			? check(JSON.parse(fs.readFileSync(reportFile, "utf8")) as Report[])
			: [{ step: "measure-context: report written", status: "FAIL", detail: `exit ${child.exitCode}: ${stderr.slice(-800)}` }];
	} finally {
		fs.rmSync(scratch, { recursive: true, force: true });
	}
	const failed = steps.filter(s => s.status === "FAIL").length;
	console.log(JSON.stringify({ result: failed === 0 ? "PASS" : "FAIL", passed: steps.length - failed, failed, steps }, null, 2));
	process.exit(failed === 0 ? 0 : 1);
}
