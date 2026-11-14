/**
 * Offline measurement of the TOON-vs-JSON output policy.
 *
 * Populates every catalog operation from the pinned schema (no network) at a ladder of page sizes,
 * encodes each response both ways, and counts real tokens with two tokenizers. A shape class may
 * use TOON only where BOTH tokenizers show at least a 15% median token saving AND every sample
 * decodes back losslessly; the smallest page size at which that holds — and keeps holding for every
 * larger size — becomes the class's minimum row count. No byte filter is applied: small payloads
 * are exactly the ones the row threshold has to be derived from.
 *
 * The decision table is written to `test/fixtures/toon-token-policy.json` and to
 * `src/output/policy.json`, which the runtime consults. The runtime never measures, never
 * serialises twice, and decides purely from the value's structure.
 *
 * Run: `bun run scripts/measure-toon-policy.ts`
 */
import { decode, encode } from "@toon-format/toon";
import { getEncoding } from "js-tiktoken";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { analyzeShape, type OutputShape } from "../src/output/encode.ts";
import { catalog, populateOne } from "./support/populate.ts";

const ROOT = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const FIXTURE = path.join(ROOT, "test", "fixtures", "toon-token-policy.json");
const POLICY = path.join(ROOT, "src", "output", "policy.json");

const ENCODINGS = ["o200k_base", "cl100k_base"] as const;
type EncodingName = (typeof ENCODINGS)[number];
const tokenizers: Record<EncodingName, { encode(text: string): number[] }> = {
 o200k_base: getEncoding("o200k_base"),
 cl100k_base: getEncoding("cl100k_base"),
};

/** TOON must save at least this fraction of tokens, on both tokenizers, to be worth using. */
const MIN_MEDIAN_SAVING = 0.15;
/** Page sizes populated; each one yields tables of exactly that many rows. */
const PAGE_SIZES = [1, 2, 3, 5, 10, 25, 50] as const;
const SHAPES: OutputShape[] = ["table", "keyed-table", "object", "nested", "scalar"];

interface Sample {
 tool: string;
 shape: OutputShape;
 jsonTokens: Record<EncodingName, number>;
 toonTokens: Record<EncodingName, number>;
 lossless: boolean;
}

function median(values: number[]): number {
 if (!values.length) return 0;
 const sorted = [...values].sort((a, b) => a - b);
 const mid = sorted.length >> 1;
 return sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

const corpora = new Map<number, Sample[]>();
for (const listRows of PAGE_SIZES) {
 const samples: Sample[] = [];
 corpora.set(listRows, samples);
 for (const descriptor of catalog) {
  const payload = await populateOne(descriptor, listRows);
  const json = JSON.stringify(payload) ?? "null";
  const shape = analyzeShape(payload);
  let toon: string | null = null;
  try {
   toon = encode(payload as Parameters<typeof encode>[0]);
  } catch {
   // The encoder refuses the value: a non-saving, non-lossless sample.
  }
  const jsonTokens = {} as Record<EncodingName, number>;
  const toonTokens = {} as Record<EncodingName, number>;
  for (const name of ENCODINGS) {
   jsonTokens[name] = tokenizers[name].encode(json).length;
   toonTokens[name] = toon === null ? Number.POSITIVE_INFINITY : tokenizers[name].encode(toon).length;
  }
  let lossless = false;
  if (toon !== null) {
   try {
    lossless = JSON.stringify(decode(toon)) === JSON.stringify(JSON.parse(json));
   } catch {
    lossless = false;
   }
  }
  samples.push({ tool: descriptor.tool, shape, jsonTokens, toonTokens, lossless });
 }
}

interface CorpusReport {
 samples: number;
 lossless: number;
 tokenizers: Record<EncodingName, { jsonTokens: number; toonTokens: number; medianSaving: number; totalSaving: number }>;
 qualifies: boolean;
 note: string;
}

interface ClassReport {
 byPageSize: Record<string, CorpusReport>;
 decision: "toon" | "json";
 /** Smallest table row count from which TOON wins and keeps winning; null when the class is JSON. */
 minRows: number | null;
 reason: string;
}

function measureClass(samples: Sample[], shape: OutputShape): CorpusReport {
 const group = samples.filter((s) => s.shape === shape);
 const tokenizerStats = {} as CorpusReport["tokenizers"];
 for (const name of ENCODINGS) {
  const jsonTokens = group.reduce((a, s) => a + s.jsonTokens[name], 0);
  const toonTokens = group.reduce((a, s) => a + (Number.isFinite(s.toonTokens[name]) ? s.toonTokens[name] : s.jsonTokens[name]), 0);
  tokenizerStats[name] = {
   jsonTokens,
   toonTokens,
   medianSaving: median(group.map((s) => (s.jsonTokens[name] ? 1 - s.toonTokens[name] / s.jsonTokens[name] : 0))),
   totalSaving: jsonTokens ? 1 - toonTokens / jsonTokens : 0,
  };
 }
 const losslessCount = group.filter((s) => s.lossless).length;
 const allLossless = group.length > 0 && losslessCount === group.length;
 const beatsBoth = group.length > 0 && ENCODINGS.every((name) => tokenizerStats[name].medianSaving >= MIN_MEDIAN_SAVING);
 const note = !group.length
  ? "no samples of this class at this page size"
  : !allLossless
   ? `${group.length - losslessCount} of ${group.length} samples do not decode losslessly`
   : beatsBoth
    ? `median token saving >= ${MIN_MEDIAN_SAVING} on both tokenizers`
    : `median token saving below ${MIN_MEDIAN_SAVING} on ${ENCODINGS.filter((n) => tokenizerStats[n].medianSaving < MIN_MEDIAN_SAVING).join(", ")}`;
 return { samples: group.length, lossless: losslessCount, tokenizers: tokenizerStats, qualifies: allLossless && beatsBoth, note };
}

const report: Record<string, ClassReport> = {};
for (const shape of SHAPES) {
 const byPageSize: Record<string, CorpusReport> = {};
 for (const listRows of PAGE_SIZES) byPageSize[String(listRows)] = measureClass(corpora.get(listRows)!, shape);
 // A bare scalar has no structure to encode: TOON would strip the quotes that tell a string from
 // a number, so the class is never a candidate however the token counts fall.
 const structural = shape !== "scalar";
 // The break-even is the smallest page size that qualifies and stays qualified for every larger
 // size, so one lucky small corpus cannot open the gate.
 const sizes = [...PAGE_SIZES];
 const breakEven = sizes.find((size, i) => sizes.slice(i).every((larger) => byPageSize[String(larger)]!.qualifies));
 const decision = structural && breakEven !== undefined ? "toon" : "json";
 const reason = !structural
  ? "a bare scalar carries no structure; JSON keeps the value type unambiguous"
  : breakEven !== undefined
   ? `wins from ${breakEven} row(s) per table upwards on both tokenizers, losslessly`
   : sizes.map((size) => `${size} rows: ${byPageSize[String(size)]!.note}`).join("; ");
 report[shape] = { byPageSize, decision, minRows: decision === "toon" ? breakEven! : null, reason };
}

const measured = {
 generatedFrom: "scripts/measure-toon-policy.ts",
 tokenizers: ENCODINGS,
 minMedianSaving: MIN_MEDIAN_SAVING,
 pageSizes: PAGE_SIZES,
 operations: catalog.length,
 classes: report,
};
fs.writeFileSync(FIXTURE, `${JSON.stringify(measured, null, "\t")}\n`);

// The runtime policy table carries the decisions and row thresholds only: no measurement ships.
const policy = {
 source: "test/fixtures/toon-token-policy.json",
 minMedianSaving: MIN_MEDIAN_SAVING,
 tokenizers: ENCODINGS,
 pageSizes: PAGE_SIZES,
 decisions: Object.fromEntries(SHAPES.map((shape) => [shape, report[shape]!.decision])),
 minRows: Object.fromEntries(SHAPES.map((shape) => [shape, report[shape]!.minRows])),
};
fs.writeFileSync(POLICY, `${JSON.stringify(policy, null, "\t")}\n`);

for (const shape of SHAPES) {
 const r = report[shape]!;
 for (const size of PAGE_SIZES) {
  const c = r.byPageSize[String(size)]!;
  if (!c.samples) continue;
  const cells = ENCODINGS.map((n) => `${n} median ${(c.tokenizers[n].medianSaving * 100).toFixed(1)}%`);
  console.log(`${shape.padEnd(12)} rows=${String(size).padStart(2)} n=${String(c.samples).padStart(3)} lossless=${c.lossless}/${c.samples} ${cells.join(" | ")} ${c.qualifies ? "OK" : "--"}`);
 }
 console.log(`${shape.padEnd(12)} -> ${r.decision}${r.minRows === null ? "" : ` from ${r.minRows} row(s)`} (${r.reason})\n`);
}
console.log(`policy: ${JSON.stringify(policy.decisions)} minRows: ${JSON.stringify(policy.minRows)}`);
