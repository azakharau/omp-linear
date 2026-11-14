import { describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { interpretHostResult } from "../scripts/smoke";

const ROOT = path.resolve(import.meta.dir, "..");
const okLine = JSON.stringify({ steps: [{ step: "search", status: "PASS", detail: "ok" }] });

describe("smoke driver host-result interpretation", () => {
	test("parseable PASS JSON followed by a non-zero exit is a FAIL", () => {
		const steps = interpretHostResult("pristine", 1, `noise\n${okLine}`, "boom");
		expect(steps.map(s => s.status)).toEqual(["PASS", "FAIL"]);
		expect(steps[1].detail).toContain("exit 1 after reporting");
	});

	test("empty step set is a FAIL even with exit 0", () => {
		const steps = interpretHostResult("patched", 0, JSON.stringify({ steps: [] }), "");
		expect(steps).toHaveLength(1);
		expect(steps[0].status).toBe("FAIL");
		expect(steps[0].detail).toContain("no steps");
	});

	test("missing JSON is a FAIL carrying stderr", () => {
		const steps = interpretHostResult("pristine", 0, "nothing here", "stack trace");
		expect(steps[0].status).toBe("FAIL");
		expect(steps[0].detail).toContain("stack trace");
	});

	test("clean exit with steps passes them through prefixed", () => {
		const steps = interpretHostResult("pristine", 0, okLine, "");
		expect(steps).toEqual([{ step: "pristine: search", status: "PASS", detail: "ok" }]);
	});
});

describe("smoke driver environment isolation", () => {
	test("host child never sees inherited secrets or the real HOME", () => {
		const probe = path.join(os.tmpdir(), `omp-linear-smoke-probe-${process.pid}.ts`);
		fs.writeFileSync(
			probe,
			`console.log(JSON.stringify({ steps: [{ step: "env", status: "PASS", detail: JSON.stringify(process.env) }] }));`,
		);
		const src = fs.readFileSync(path.join(ROOT, "scripts", "smoke.ts"), "utf8");
		// Drive the real childEnv() by re-running the driver module with the host script swapped for the probe.
		const driver = src
			.replace(/path\.join\(ROOT, "scripts", "smoke-host\.ts"\)/g, JSON.stringify(probe))
			.replace(/if \(import\.meta\.main\) \{/, "if (true) {");
		const driverPath = path.join(ROOT, "scripts", `.smoke-probe-${process.pid}.ts`);
		fs.writeFileSync(driverPath, driver);
		try {
			const run = Bun.spawnSync([process.execPath, "run", driverPath], {
				cwd: ROOT,
				env: { ...process.env, LINEAR_API_KEY: "SECRET_LEAK_CANARY", OPENAI_API_KEY: "SECRET_LEAK_CANARY", PI_PROFILE: "cto" },
				stdout: "pipe",
				stderr: "pipe",
			});
			const out = run.stdout.toString();
			expect(out).not.toContain("SECRET_LEAK_CANARY");
			const summary = JSON.parse(out) as { steps: { detail: string }[] };
			for (const step of summary.steps.filter(s => s.detail.startsWith("{"))) {
				const env = JSON.parse(step.detail) as Record<string, string>;
				expect(env.HOME).not.toBe(os.homedir());
				expect(env.HOME.includes("omp-linear-smoke-")).toBe(true);
				expect(env.PI_CODING_AGENT_DIR.includes("omp-linear-smoke-")).toBe(true);
				expect(env.PI_PROFILE).toBeUndefined();
				expect(env.LINEAR_API_KEY).toBeUndefined();
			}
		} finally {
			fs.rmSync(driverPath, { force: true });
			fs.rmSync(probe, { force: true });
		}
	});
});
