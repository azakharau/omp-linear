/**
 * Generates the pinned Linear operation catalog from schema/linear.schema.graphql, which
 * `bun run schema:check --write` takes from live Linear introspection.
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
 coerceInputLiteral,
 getNamedType,
 isEnumType,
 isInputObjectType,
 isListType,
 isNonNullType,
 isRequiredArgument,
 isRequiredInputField,
 isScalarType,
 type GraphQLArgument,
 type GraphQLField,
 type GraphQLInputField,
 type GraphQLInputObjectType,
 type GraphQLInputType,
 type GraphQLSchema,
} from "graphql";

const ROOT = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const SDL_PATH = path.join(ROOT, "schema", "linear.schema.graphql");
const OUT_DIR = path.join(ROOT, "generated");
type JsonSchema = Record<string, unknown>;

/**
 * Scalars that carry no extra structure beyond a JSON string. `Duration` and the `*OrDuration`
 * scalars take an ISO 8601 date or duration string, for example `2026-01-31` or `-P2W`.
 */
const STRING_SCALARS = new Set(["String", "ID", "DateTime", "TimelessDate", "URL", "UUID", "Duration", "DateTimeOrDuration", "TimelessDateOrDuration"]);

/** Any non-null JSON value. Codex rejects the `not` keyword in tool schemas, so list the types. */
const NON_NULL_JSON_TYPES = ["string", "number", "boolean", "object", "array"];

/** Default of an argument or input field as a JSON value; graphql 17 keeps SDL defaults as literals. */
function defaultOf(input: GraphQLArgument | GraphQLInputField): unknown {
 return input.default?.literal ? coerceInputLiteral(input.default.literal, input.type) : input.default?.value;
}

/**
 * A nested input object is spelled out only when few other input objects are reachable from it,
 * such as StringComparator. Others, such as the filters on related entities, become open objects
 * that name their GraphQL type: a host may keep an activated tool's schema in every later request.
 * An argument's own type is always spelled out.
 */
export const MAX_NESTED_CLOSURE = 3;

const OPAQUE_PREFIX = "GraphQL input ";

const closureCache = new WeakMap<GraphQLInputObjectType, number>();

function closureSize(type: GraphQLInputObjectType): number {
 const cached = closureCache.get(type);
 if (cached !== undefined) return cached;
 const seen = new Set<string>([type.name]);
 const stack = [type];
 while (stack.length > 0) {
  for (const field of Object.values(stack.pop()!.getFields())) {
   const named = getNamedType(field.type);
   if (isInputObjectType(named) && !seen.has(named.name)) {
    seen.add(named.name);
    stack.push(named);
   }
  }
 }
 closureCache.set(type, seen.size - 1);
 return seen.size - 1;
}

function nonNullSchema(type: GraphQLInputType, defs: Record<string, JsonSchema>, building: Set<string>, depth: number): JsonSchema {
 if (isListType(type)) return { type: "array", items: jsonSchema(type.ofType, defs, building, depth) };
 const named = getNamedType(type);
 if (isEnumType(named)) return { type: "string", enum: named.getValues().map((v) => v.name) };
 if (isScalarType(named)) {
  if (named.name === "Boolean") return { type: "boolean" };
  if (named.name === "Int") return { type: "integer" };
  if (named.name === "Float") return { type: "number" };
  if (STRING_SCALARS.has(named.name)) return { type: "string", description: `GraphQL scalar ${named.name}` };
  if (named.name === "JSONObject") return { type: "object", additionalProperties: true, description: "GraphQL scalar JSONObject" };
  // JSON and any unknown custom scalar: any non-null JSON value.
  return { type: NON_NULL_JSON_TYPES, description: `GraphQL scalar ${named.name}` };
 }
 if (isInputObjectType(named)) {
  const known = defs[named.name] !== undefined || building.has(named.name);
  if (!known && depth > 1 && closureSize(named) > MAX_NESTED_CLOSURE) {
   return {
    type: "object",
    additionalProperties: true,
    description: `${OPAQUE_PREFIX}${named.name}; linear_schema_help lists its fields`,
   };
  }
  if (!known) {
   building.add(named.name);
   const properties: Record<string, JsonSchema> = {};
   const required: string[] = [];
   for (const field of Object.values(named.getFields())) {
    const fallback = defaultOf(field);
    const schema = jsonSchema(field.type, defs, building, depth + 1);
    // A non-null open object carries its type name only in its own description; keep it.
    const hint = typeof schema.description === "string" && schema.description.startsWith(OPAQUE_PREFIX) ? ` (${schema.description})` : "";
    properties[field.name] = {
     ...schema,
     ...(field.description ? { description: `${field.description}${hint}` } : {}),
     ...(fallback !== undefined ? { default: fallback } : {}),
    };
    if (isRequiredInputField(field)) required.push(field.name);
   }
   defs[named.name] = { type: "object", properties, ...(required.length ? { required } : {}), additionalProperties: false };
   building.delete(named.name);
  }
  return { $ref: `#/$defs/${named.name}` };
 }
 throw new Error(`unsupported GraphQL input type ${String(type)}`);
}

/** JSON Schema for a GraphQL input type, preserving nullability recursively. */
function jsonSchema(type: GraphQLInputType, defs: Record<string, JsonSchema>, building: Set<string> = new Set(), depth = 1): JsonSchema {
 if (isNonNullType(type)) return nonNullSchema(type.ofType, defs, building, depth);
 return { anyOf: [nonNullSchema(type, defs, building, depth), { type: "null" }] };
}

function argumentSchema(args: readonly GraphQLArgument[], kind: string, root: string): JsonSchema {
 const defs: Record<string, JsonSchema> = {};
 const properties: Record<string, JsonSchema> = {
  i: { type: "string", description: "Short intent for this call" },
 };
 const required: string[] = ["i"];
 for (const arg of args) {
  const fallback = defaultOf(arg);
  properties[arg.name] = {
   ...jsonSchema(arg.type, defs),
   ...(arg.description ? { description: arg.description } : {}),
   ...(fallback !== undefined ? { default: fallback } : {}),
  };
  if (isRequiredArgument(arg)) required.push(arg.name);
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
