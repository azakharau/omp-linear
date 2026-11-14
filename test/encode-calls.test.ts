import { expect, mock, test } from "bun:test";

/**
 * The runtime must encode exactly once: never dual-encode to compare formats, and never invoke the
 * TOON encoder at all for a class the policy table marks `json`. The check spies on the encoder
 * module itself, so it fails if the policy is ever re-implemented as a runtime measurement.
 */
let calls = 0;
// Dynamic imports are required here: `mock.module` must be installed before `encode.ts` binds the
// encoder, which is exactly the module-loading boundary this test exercises.
const real = await import("@toon-format/toon");
// Captured before `mock.module` replaces the registry entry: the namespace binding is live, so
// calling `real.encode` afterwards would re-enter the counting wrapper forever.
const realEncode = real.encode;
mock.module("@toon-format/toon", () => ({
 ...real,
 encode: (value: unknown, options?: unknown) => {
  calls++;
  return options ? realEncode(value as never, options as never) : realEncode(value as never);
 },
}));

const { encodeOutput, POLICY } = await import("../src/output/encode.ts");

const table = Array.from({ length: 50 }, (_, i) => ({ id: `issue-${i}`, title: `Row ${i}`, priority: i % 4 }));
const keyedTable = { nodes: table, hasNextPage: false, endCursor: "c-50" };
const nested = { nodes: Array.from({ length: 40 }, (_, i) => ({ id: `issue-${i}`, state: { name: "Todo" } })) };
const object = Object.fromEntries(Array.from({ length: 40 }, (_, i) => [`field${i}`, `value-${i}-padding-padding`]));
const scalar = "x".repeat(2000);

const samples: Record<string, unknown> = { table, "keyed-table": keyedTable, nested, object, scalar };

test("the encoder is called once for toon classes and never for json classes", () => {
 for (const [shape, value] of Object.entries(samples)) {
  calls = 0;
  const encoded = encodeOutput(value);
  expect(`${shape}:${encoded.shape}`).toBe(`${shape}:${shape}`);
  expect(encoded.format).toBe(POLICY[shape as keyof typeof POLICY]);
  expect(`${shape}:${calls}`).toBe(`${shape}:${encoded.format === "toon" ? 1 : 0}`);
 }
});

test("a payload below the measured row threshold never reaches the encoder", () => {
 calls = 0;
 const oneRow = [{ id: 1, name: "only", note: "n".repeat(4000) }];
 expect(encodeOutput(oneRow).format).toBe("json");
 expect(calls).toBe(0);
});
