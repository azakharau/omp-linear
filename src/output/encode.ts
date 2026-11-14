/**
 * Tool-result encoding: one format, chosen from a frozen policy table, serialised exactly once.
 *
 * The decision is purely structural — shape class plus row count — and is taken before anything is
 * serialised, so a payload is never encoded twice to compare formats. The table in `policy.json` is
 * produced offline by `scripts/measure-toon-policy.ts` from real token counts (o200k_base and
 * cl100k_base) over the populated 495-operation corpus at a ladder of page sizes: a class is marked
 * `toon` only where both tokenizers show at least a 15% median token saving and every sample decodes
 * back losslessly, and `minRows` is the smallest table size from which that holds and keeps holding.
 */
import { encode } from "@toon-format/toon";
import policy from "./policy.json" with { type: "json" };

export type OutputShape = "table" | "keyed-table" | "object" | "nested" | "scalar";

export interface EncodedOutput {
 text: string;
 format: "toon" | "json";
 shape: OutputShape;
 /** Byte length of `text`, i.e. of the format actually chosen. */
 bytes: number;
}

/** The frozen per-class decision; see `scripts/measure-toon-policy.ts`. */
export const POLICY: Record<OutputShape, "toon" | "json"> = policy.decisions as Record<OutputShape, "toon" | "json">;
/** Measured break-even table size per class; below it TOON costs more tokens than it saves. */
export const MIN_ROWS: Record<OutputShape, number | null> = policy.minRows as Record<OutputShape, number | null>;

function isPrimitive(value: unknown): boolean {
 return value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}

/** A uniform table: a non-empty array of rows with identical key sets and primitive cells only. */
function isTable(value: unknown): value is Record<string, unknown>[] {
 if (!Array.isArray(value) || value.length === 0) return false;
 let keys: string | undefined;
 for (const row of value) {
  if (row === null || typeof row !== "object" || Array.isArray(row)) return false;
  const rowKeys = Object.keys(row as Record<string, unknown>).join("\u0000");
  if (keys === undefined) keys = rowKeys;
  else if (rowKeys !== keys) return false;
  if (!Object.values(row as Record<string, unknown>).every(isPrimitive)) return false;
 }
 return true;
}

/** Classifies the payload into the classes the policy table was measured over. */
export function analyzeShape(value: unknown): OutputShape {
 if (value === undefined || isPrimitive(value)) return "scalar";
 if (isTable(value)) return "table";
 if (Array.isArray(value)) return "nested";
 const entries = Object.values(value as Record<string, unknown>);
 if (entries.every(isPrimitive)) return "object";
 if (entries.every((entry) => isPrimitive(entry) || isTable(entry)) && entries.some(isTable)) return "keyed-table";
 return "nested";
}

/** Rows in the payload's largest table; 0 when it holds none. Never serialises. */
function tableRows(shape: OutputShape, value: unknown): number {
 if (shape === "table") return (value as unknown[]).length;
 if (shape !== "keyed-table") return 0;
 let rows = 0;
 for (const entry of Object.values(value as Record<string, unknown>)) if (isTable(entry)) rows = Math.max(rows, entry.length);
 return rows;
}

export function encodeOutput(value: unknown): EncodedOutput {
 const shape = analyzeShape(value);
 const minRows = MIN_ROWS[shape];
 if (POLICY[shape] === "toon" && minRows !== null && tableRows(shape, value) >= minRows) {
  try {
   const toon = encode(value as Parameters<typeof encode>[0]);
   return { text: toon, format: "toon", shape, bytes: Buffer.byteLength(toon, "utf8") };
  } catch {
   // Sole fallback path: the encoder rejected a value the classifier admitted (it refuses
   // `undefined` cells and cyclic structures). Falling through serialises once, as JSON.
  }
 }
 const json = JSON.stringify(value, null, 0) ?? "null";
 return { text: json, format: "json", shape, bytes: Buffer.byteLength(json, "utf8") };
}
