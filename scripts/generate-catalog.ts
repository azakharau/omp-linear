/**
 * Generates the pinned Linear operation catalog from schema/linear.schema.graphql.
 *
 * Output is deterministic: roots sorted by tool name, object keys emitted in a fixed order.
 * Run: bun run scripts/generate-catalog.ts
 */
import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import {
 buildSchema,
 getNamedType,
 isEnumType,
 isInputObjectType,
 isListType,
 isNonNullType,
 isScalarType,
 type GraphQLArgument,
 type GraphQLField,
 type GraphQLInputType,
 type GraphQLSchema,
} from "graphql";

const ROOT = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const SDL_PATH = path.join(ROOT, "schema", "linear.schema.graphql");
const OUT_DIR = path.join(ROOT, "generated");
const LINEAR_COMMIT = "87d638c0b151575505d36822839324d2287f2e06";

type JsonSchema = Record<string, unknown>;

/** Scalars that carry no extra structure beyond a JSON string. */
const STRING_SCALARS = new Set(["String", "ID", "DateTime", "TimelessDate", "URL", "UUID"]);

function nonNullSchema(type: GraphQLInputType, defs: Record<string, JsonSchema>, building: Set<string>): JsonSchema {
 if (isListType(type)) return { type: "array", items: jsonSchema(type.ofType, defs, building) };
 const named = getNamedType(type);
 if (isEnumType(named)) return { type: "string", enum: named.getValues().map((v) => v.name) };
 if (isScalarType(named)) {
  if (named.name === "Boolean") return { type: "boolean" };
  if (named.name === "Int") return { type: "integer" };
  if (named.name === "Float") return { type: "number" };
  if (STRING_SCALARS.has(named.name)) return { type: "string", description: `GraphQL scalar ${named.name}` };
  if (named.name === "JSONObject") return { type: "object", additionalProperties: true, description: "GraphQL scalar JSONObject" };
  // JSON and any unknown custom scalar: any non-null JSON value.
  return { not: { type: "null" }, description: `GraphQL scalar ${named.name}` };
 }
 if (isInputObjectType(named)) {
  if (!defs[named.name] && !building.has(named.name)) {
   building.add(named.name);
   const properties: Record<string, JsonSchema> = {};
   const required: string[] = [];
   for (const field of Object.values(named.getFields())) {
    properties[field.name] = {
     ...jsonSchema(field.type, defs, building),
     ...(field.description ? { description: field.description } : {}),
     ...(field.defaultValue !== undefined ? { default: field.defaultValue } : {}),
    };
    if (isNonNullType(field.type) && field.defaultValue === undefined) required.push(field.name);
   }
   defs[named.name] = { type: "object", properties, ...(required.length ? { required } : {}), additionalProperties: false };
   building.delete(named.name);
  }
  return { $ref: `#/$defs/${named.name}` };
 }
 return { not: { type: "null" } };
}

/** JSON Schema for a GraphQL input type, preserving nullability recursively. */
function jsonSchema(type: GraphQLInputType, defs: Record<string, JsonSchema>, building: Set<string> = new Set()): JsonSchema {
 if (isNonNullType(type)) return nonNullSchema(type.ofType, defs, building);
 return { anyOf: [nonNullSchema(type, defs, building), { type: "null" }] };
}

function argumentSchema(args: readonly GraphQLArgument[], kind: string, root: string): JsonSchema {
 const defs: Record<string, JsonSchema> = {};
 const properties: Record<string, JsonSchema> = {
  i: { type: "string", description: "Short intent for this call" },
 };
 const required: string[] = ["i"];
 for (const arg of args) {
  properties[arg.name] = {
   ...jsonSchema(arg.type, defs),
   ...(arg.description ? { description: arg.description } : {}),
   ...(arg.defaultValue !== undefined ? { default: arg.defaultValue } : {}),
  };
  if (isNonNullType(arg.type) && arg.defaultValue === undefined) required.push(arg.name);
 }
 properties.selection = {
  type: "string",
  minLength: 1,
  description: "Optional GraphQL selection set override, e.g. `{ id title }`. Omit for the default selection.",
 };
 return {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties,
  required,
  additionalProperties: false,
  $defs: defs,
  description: `${kind}.${root}`,
 };
}

function descriptorFor(kind: "Query" | "Mutation", field: GraphQLField<unknown, unknown>) {
 return {
  kind,
  root: field.name,
  tool: `${kind === "Query" ? "lq" : "lm"}_${field.name}`,
  description: field.description ?? `${kind}.${field.name}`,
  deprecated: field.deprecationReason ?? null,
  parameters: argumentSchema(field.args, kind, field.name),
  argNames: field.args.map((a) => a.name),
  returnType: String(field.type),
 };
}

export function buildCatalog(schema: GraphQLSchema) {
 const query = schema.getQueryType();
 const mutation = schema.getMutationType();
 if (!query || !mutation) throw new Error("pinned schema must declare both Query and Mutation types");
 const queryFields = Object.values(query.getFields());
 const mutationFields = Object.values(mutation.getFields());
 const descriptors = [
  ...queryFields.map((f) => descriptorFor("Query", f)),
  ...mutationFields.map((f) => descriptorFor("Mutation", f)),
 ].sort((a, b) => (a.tool < b.tool ? -1 : a.tool > b.tool ? 1 : 0));
 if (descriptors.length !== queryFields.length + mutationFields.length) {
  throw new Error(`descriptor count ${descriptors.length} != root field count ${queryFields.length + mutationFields.length}`);
 }
 return { descriptors, queryCount: queryFields.length, mutationCount: mutationFields.length };
}

if (import.meta.main) {
 const sdl = fs.readFileSync(SDL_PATH, "utf8");
 const schemaSha256 = createHash("sha256").update(sdl).digest("hex");
 const { descriptors, queryCount, mutationCount } = buildCatalog(buildSchema(sdl));
 const total = queryCount + mutationCount;
 const manifest = {
  schemaSha256,
  linearCommit: LINEAR_COMMIT,
  queryCount,
  mutationCount,
  total,
  generatedAt: new Date().toISOString(),
  roots: descriptors.map((d) => ({ kind: d.kind, root: d.root, tool: d.tool, argCount: d.argNames.length, deprecated: d.deprecated })),
 };
 fs.mkdirSync(OUT_DIR, { recursive: true });
 fs.writeFileSync(path.join(OUT_DIR, "catalog.json"), `${JSON.stringify(descriptors)}\n`);
 fs.writeFileSync(path.join(OUT_DIR, "coverage-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
 const refs = descriptors.filter((d) => JSON.stringify(d.parameters).includes("$ref")).length;
 console.log(
  `catalog: ${total} roots (Query ${queryCount}, Mutation ${mutationCount}), deprecated ${descriptors.filter((d) => d.deprecated).length}, with $ref ${refs}, sha256 ${schemaSha256}`,
 );
}
