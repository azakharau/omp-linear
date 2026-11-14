import { describe, expect, test } from "bun:test";
import { decode, encode } from "@toon-format/toon";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { encodeOutput, POLICY } from "../src/output/encode.ts";

/**
 * Conformance of the pinned TOON encoder against the complete official spec encode suite.
 *
 * Every case is executed with the options the case itself declares, so nothing is skipped because
 * of an option this project happens not to use. Conformance of the encoder and the `encodeOutput`
 * format policy are deliberately separate: a value that `encodeOutput` emits as JSON (wrong shape
 * or below the size floor) is not a conformance failure and is never counted as a conformance pass.
 */
const FIXTURES = path.join(path.resolve(fileURLToPath(new URL("..", import.meta.url))), "test", "fixtures", "toon-conformance");

interface SpecCase {
 name: string;
 input: unknown;
 expected: string;
 specSection?: string;
 options?: Record<string, unknown>;
 minSpecVersion?: string;
}

// The 9 upstream encode fixture files and their case counts, pinned so that a fixture refresh that
// silently drops cases fails instead of shrinking the suite.
const FILES: Record<string, number> = {
 "arrays-nested.json": 15,
 "arrays-objects.json": 18,
 "arrays-primitive.json": 13,
 "arrays-tabular.json": 16,
 "delimiters.json": 22,
 "objects-keyed.json": 13,
 "objects.json": 34,
 "primitives.json": 44,
 "whitespace.json": 4,
};

/**
 * Cases excluded from the run, by name, with the reason. Empty: the pinned encoder implements every
 * option the suite exercises, so all 179 cases are applicable.
 */
const EXCLUSIONS: { name: string; reason: string }[] = [];

const cases: { file: string; entry: SpecCase }[] = [];
for (const file of Object.keys(FILES)) {
 const fixture = JSON.parse(fs.readFileSync(path.join(FIXTURES, file), "utf8")) as { tests: SpecCase[] };
 for (const entry of fixture.tests) cases.push({ file, entry });
}

/** The value as it survives a JSON response body, which is all the encoder is ever handed. */
function asTransported(value: unknown): unknown {
 return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

describe("TOON spec conformance", () => {
 test("the pinned fixture suite is complete", () => {
  const counts: Record<string, number> = {};
  for (const { file } of cases) counts[file] = (counts[file] ?? 0) + 1;
  expect(counts).toEqual(FILES);
  expect(cases.length).toBe(179);
  expect(EXCLUSIONS).toEqual([]);
 });

 test("every applicable case encodes byte-exactly as the spec expects", () => {
  const excluded = new Set(EXCLUSIONS.map((e) => e.name));
  const failures: string[] = [];
  let ran = 0;
  for (const { file, entry } of cases) {
   if (excluded.has(entry.name)) continue;
   ran++;
   const options = entry.options && Object.keys(entry.options).length ? entry.options : undefined;
   let actual: string;
   try {
    actual = options ? encode(entry.input, options) : encode(entry.input);
   } catch (error) {
    failures.push(`${file}/${entry.name}: threw ${error instanceof Error ? error.message : String(error)}`);
    continue;
   }
   if (actual !== entry.expected) failures.push(`${file}/${entry.name}: got ${JSON.stringify(actual)} want ${JSON.stringify(entry.expected)}`);
  }
  expect(failures).toEqual([]);
  expect(ran).toBe(179);
 });

 test("default-option cases round-trip back to the original value", () => {
  const failures: string[] = [];
  let ran = 0;
  for (const { file, entry } of cases) {
   if (entry.options && Object.keys(entry.options).length) continue;
   ran++;
   try {
    expect(decode(entry.expected)).toEqual(asTransported(entry.input) as never);
   } catch (error) {
    failures.push(`${file}/${entry.name}: ${error instanceof Error ? error.message : String(error)}`);
   }
  }
  expect(failures).toEqual([]);
  expect(ran).toBe(154);
 });

 test("encodeOutput emits spec bytes for the classes and sizes its policy selects", () => {
  let qualified = 0;
  for (const { file, entry } of cases) {
   if (entry.options && Object.keys(entry.options).length) continue;
   const encoded = encodeOutput(entry.input);
   if (encoded.format === "toon") {
    qualified++;
    expect(POLICY[encoded.shape]).toBe("toon");
    expect(`${file}/${entry.name}\n${encoded.text}`).toBe(`${file}/${entry.name}\n${entry.expected}`);
   } else {
    // Either the class is JSON, or the payload is below the measured row threshold.
    expect(JSON.parse(encoded.text)).toEqual(asTransported(entry.input) as never);
   }
   expect(encoded.bytes).toBe(Buffer.byteLength(encoded.text, "utf8"));
  }
  // Policy result, not a conformance score: the spec fixtures are mostly scalars and small
  // nested values; only their tabular arrays reach the measured thresholds.
  expect(qualified).toBe(1);
 });
});
