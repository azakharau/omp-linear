import { describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { encodeOutput, MIN_ROWS, type OutputShape, POLICY } from "../src/output/encode.ts";
import { catalog, LIST_ROWS, populateOne } from "../scripts/support/populate.ts";

/**
 * Output population verification.
 *
 * Every one of the 495 catalog operations is composed with its default selection and executed
 * against the pinned schema with a synthesising resolver, producing a response of exactly the shape
 * the real API would return for that selection. Each response goes through `encodeOutput`, and the
 * resulting format/shape/byte decision is compared to a frozen baseline, so a change in the
 * selection builder or the encode policy shows up as an explicit, reviewable diff instead of a
 * silent shift in what the model is handed.
 *
 * Refresh the baseline deliberately with `UPDATE_POPULATION_BASELINE=1 bun test test/toon-population.test.ts`.
 */
const ROOT = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const BASELINE = path.join(ROOT, "test", "fixtures", "toon-population-baseline.json");

interface PopulationRow {
 tool: string;
 shape: OutputShape;
 format: "toon" | "json";
 bytes: number;
}

const rows: PopulationRow[] = [];
for (const d of catalog) {
 const encoded = encodeOutput(await populateOne(d));
 rows.push({ tool: d.tool, shape: encoded.shape, format: encoded.format, bytes: encoded.bytes });
}

const summary = {
 operations: rows.length,
 byFormat: rows.reduce<Record<string, number>>((acc, r) => ({ ...acc, [r.format]: (acc[r.format] ?? 0) + 1 }), {}),
 byShape: rows.reduce<Record<string, number>>((acc, r) => ({ ...acc, [r.shape]: (acc[r.shape] ?? 0) + 1 }), {}),
 encodedBytesTotal: rows.reduce((a, r) => a + r.bytes, 0),
};

if (process.env.UPDATE_POPULATION_BASELINE === "1") {
 fs.writeFileSync(BASELINE, `${JSON.stringify({ listRows: LIST_ROWS, policy: POLICY, minRows: MIN_ROWS, summary, rows }, null, "\t")}\n`);
}

const baseline = JSON.parse(fs.readFileSync(BASELINE, "utf8")) as {
 listRows: number;
 policy: typeof POLICY;
 summary: typeof summary;
 rows: PopulationRow[];
};

describe("schema-derived output population", () => {
 test("every catalog operation produces a populated response", () => {
  expect(rows.length).toBe(495);
  expect(baseline.listRows).toBe(LIST_ROWS);
  // A populated response is never empty: the default selection always pulls real fields.
  expect(rows.filter((r) => r.bytes < 3)).toEqual([]);
 });

 test("the encode decision for each operation matches the frozen baseline", () => {
  expect(baseline.policy).toEqual(POLICY);
  expect(summary).toEqual(baseline.summary);
  const diffs = rows.filter((r, i) => JSON.stringify(r) !== JSON.stringify(baseline.rows[i]));
  expect(diffs.map((d) => `${d.tool}: ${JSON.stringify(d)} != ${JSON.stringify(baseline.rows.find((b) => b.tool === d.tool))}`)).toEqual([]);
 });

 test("every operation follows the frozen policy table for its class", () => {
  const wrong = rows.filter((r) => r.format !== POLICY[r.shape] && r.format !== "json");
  expect(wrong).toEqual([]);
  // TOON only ever appears for classes the measurement marked safe.
  expect(rows.filter((r) => r.format === "toon").every((r) => POLICY[r.shape] === "toon")).toBe(true);
 });
});
