/**
 * Pinned Linear operation catalog: descriptor loading, document composition and schema help.
 *
 * The catalog itself is generated ahead of time by scripts/generate-catalog.ts; this module only
 * reads it and re-uses the pinned SDL for validation and default selection sets.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import {
 buildSchema,
 getNamedType,
 isEnumType,
 isInputObjectType,
 isInterfaceType,
 isNonNullType,
 isObjectType,
 isScalarType,
 isUnionType,
 Kind,
 OperationTypeNode,
 parse,
 parseType,
 print,
 type ArgumentNode,
 type DocumentNode,
 type FieldNode,
 type FragmentDefinitionNode,
 type GraphQLField,
 type GraphQLNamedType,
 type GraphQLObjectType,
 type GraphQLSchema,
 type OperationDefinitionNode,
 type SelectionSetNode,
 type VariableDefinitionNode,
 type VariableNode,
} from "graphql";
import { composeSelectionValidation } from "./raw.ts";

export interface OperationDescriptor {
 kind: "Query" | "Mutation";
 root: string;
 /** `lq_<root>` for queries, `lm_<root>` for mutations. */
 tool: string;
 description: string;
 deprecated: string | null;
 /** JSON Schema (draft-07) for the tool arguments, including `i` and optional `selection`. */
 parameters: Record<string, unknown>;
 argNames: string[];
 returnType: string;
}

/** Package root: the nearest ancestor holding generated/catalog.json (`src/schema/` from source, `dist/` from the bundle). */
function packageRoot(): string {
	for (let dir = import.meta.dir; ; dir = path.dirname(dir)) {
		if (fs.existsSync(path.join(dir, "generated", "catalog.json"))) return dir;
		if (dir === path.dirname(dir)) throw new Error(`generated/catalog.json not found above ${import.meta.dir}`);
	}
}

const ROOT = packageRoot();

let catalogCache: OperationDescriptor[] | undefined;
let schemaCache: GraphQLSchema | undefined;

/** All 495 generated Query/Mutation descriptors, read once from generated/catalog.json. */
export function loadCatalog(): OperationDescriptor[] {
 if (!catalogCache) {
  const raw = fs.readFileSync(path.join(ROOT, "generated", "catalog.json"), "utf8");
  catalogCache = JSON.parse(raw) as OperationDescriptor[];
 }
 return catalogCache;
}

/** The pinned Linear schema, built once. */
export function getSchema(): GraphQLSchema {
 if (!schemaCache) schemaCache = buildSchema(fs.readFileSync(path.join(ROOT, "schema", "linear.schema.graphql"), "utf8"));
 return schemaCache;
}

function rootField(schema: GraphQLSchema, descriptor: OperationDescriptor): GraphQLField<unknown, unknown> {
 const rootType = descriptor.kind === "Query" ? schema.getQueryType() : schema.getMutationType();
 const field = rootType?.getFields()[descriptor.root];
 if (!field) throw new Error(`${descriptor.tool}: ${descriptor.kind}.${descriptor.root} is not part of the pinned schema`);
 return field;
}

/** A field is selectable without arguments when every argument is optional. */
function selectableWithoutArgs(field: GraphQLField<unknown, unknown>): boolean {
 return field.args.every((arg) => !isNonNullType(arg.type) || arg.defaultValue !== undefined);
}

function leafFieldNames(type: GraphQLNamedType): string[] {
 if (!isObjectType(type) && !isInterfaceType(type)) return [];
 return Object.values(type.getFields())
  .filter((field) => !field.deprecationReason && selectableWithoutArgs(field))
  .filter((field) => {
   const named = getNamedType(field.type);
   return isScalarType(named) || isEnumType(named);
  })
  .map((field) => field.name);
}

/**
 * Default selection set for a return type: scalars and enums, nested objects reduced to their
 * identifying fields, connections unrolled into `nodes`/`pageInfo`. Returns "" for leaf returns.
 */
function defaultSelection(type: GraphQLNamedType, depth: number): string {
 if (isUnionType(type)) {
  const members = type.getTypes().map((member) => `... on ${member.name} { ${leafFieldNames(member).join(" ") || "__typename"} }`);
  return `{ __typename ${members.join(" ")} }`;
 }
 if (!isObjectType(type) && !isInterfaceType(type)) return "";
 const fields = type.getFields();
 const nodes = fields.nodes;
 if (nodes && selectableWithoutArgs(nodes)) {
  const nodeSelection = defaultSelection(getNamedType(nodes.type), depth - 1) || "";
  const pageInfo = fields.pageInfo ? " pageInfo { hasNextPage endCursor }" : "";
  return `{ nodes ${nodeSelection}${pageInfo} }`.replace("nodes  ", "nodes ");
 }
 const parts: string[] = isInterfaceType(type) ? ["__typename"] : [];
 for (const field of Object.values(fields)) {
  if (field.deprecationReason || !selectableWithoutArgs(field)) continue;
  const named = getNamedType(field.type);
  if (isScalarType(named) || isEnumType(named)) {
   parts.push(field.name);
   continue;
  }
  if (depth <= 0) continue;
  if (isObjectType(named) || isInterfaceType(named)) {
   if (named.getFields().nodes) continue; // nested connections stay out of the default shape
   const identifying = ["id", "name"].filter((candidate) => named.getFields()[candidate]);
   if (identifying.length) parts.push(`${field.name} { ${identifying.join(" ")} }`);
  }
 }
 if (!parts.length) parts.push("__typename");
 return `{ ${parts.join(" ")} }`;
}

/**
 * Parses a user-supplied selection in isolation.
 *
 * The selection is never interpolated into the document as text: it is parsed on its own and only
 * its SelectionSet is reused, so a selection cannot introduce a sibling root field (the classic
 * `{ success } extra: issueDelete(...)` injection). Named fragment definitions may follow the
 * selection set and are attached to the composed document; anything else is rejected.
 */
function parseSelection(raw: string, label: string): { selectionSet: SelectionSetNode; fragments: FragmentDefinitionNode[] } {
 let parsed: DocumentNode;
 try {
  // Parsed as written first, so `query Other { ... }` is recognised as an operation and rejected
  // below rather than silently becoming two bogus fields; bare `id title` needs the braces.
  parsed = parse(raw);
 } catch {
  try {
   parsed = parse(`{ ${raw} }`);
  } catch (error) {
   throw new Error(`${label}: invalid selection: ${error instanceof Error ? error.message : String(error)}`);
  }
 }
 const operations = parsed.definitions.filter((d): d is OperationDefinitionNode => d.kind === Kind.OPERATION_DEFINITION);
 const fragments = parsed.definitions.filter((d): d is FragmentDefinitionNode => d.kind === Kind.FRAGMENT_DEFINITION);
 if (operations.length + fragments.length !== parsed.definitions.length) {
  throw new Error(`${label}: invalid selection: only a selection set and fragment definitions are allowed`);
 }
 if (operations.length !== 1) {
  throw new Error(`${label}: invalid selection: expected exactly one selection set, found ${operations.length}`);
 }
 const operation = operations[0]!;
 if (operation.operation !== OperationTypeNode.QUERY || operation.name || operation.variableDefinitions?.length || operation.directives?.length) {
  throw new Error(`${label}: invalid selection: expected a bare selection set such as \`{ id title }\``);
 }
 if (!operation.selectionSet.selections.length) throw new Error(`${label}: invalid selection: the selection set is empty`);
 return { selectionSet: operation.selectionSet, fragments };
}

/**
 * Builds and validates an executable document for a descriptor.
 *
 * The document is assembled as an AST with exactly one root field and printed, so no part of the
 * caller's input reaches the document as raw text. Throws with the collected GraphQL validation
 * messages when the result does not match the pinned schema.
 */
export function composeOperation(
 descriptor: OperationDescriptor,
 args: Record<string, unknown>,
 selection?: string,
): { document: string; variables: Record<string, unknown> } {
 const schema = getSchema();
 const field = rootField(schema, descriptor);
 const variables: Record<string, unknown> = {};
 const variableDefinitions: VariableDefinitionNode[] = [];
 const argumentNodes: ArgumentNode[] = [];
 for (const arg of field.args) {
  if (!(arg.name in args) || args[arg.name] === undefined) {
   if (isNonNullType(arg.type) && arg.defaultValue === undefined) {
    throw new Error(`${descriptor.tool}: missing required argument "${arg.name}" of type ${String(arg.type)}`);
   }
   continue;
  }
  variables[arg.name] = args[arg.name];
  const variable: VariableNode = { kind: Kind.VARIABLE, name: { kind: Kind.NAME, value: arg.name } };
  variableDefinitions.push({ kind: Kind.VARIABLE_DEFINITION, variable, type: parseType(String(arg.type)) });
  argumentNodes.push({ kind: Kind.ARGUMENT, name: { kind: Kind.NAME, value: arg.name }, value: variable });
 }

 const named = getNamedType(field.type);
 const composite = isObjectType(named) || isInterfaceType(named) || isUnionType(named);
 const requested = (selection ?? (typeof args.selection === "string" ? args.selection : undefined))?.trim();
 if (requested && !composite) {
  throw new Error(`${descriptor.tool}: ${descriptor.root} returns the leaf type ${named.name}; it takes no selection set`);
 }
 const parsedSelection = composite ? parseSelection(requested || defaultSelection(named, 2), descriptor.tool) : null;

 const rootFieldNode: FieldNode = {
  kind: Kind.FIELD,
  name: { kind: Kind.NAME, value: descriptor.root },
  ...(argumentNodes.length ? { arguments: argumentNodes } : {}),
  ...(parsedSelection ? { selectionSet: parsedSelection.selectionSet } : {}),
 };
 const operation: OperationDefinitionNode = {
  kind: Kind.OPERATION_DEFINITION,
  operation: descriptor.kind === "Query" ? OperationTypeNode.QUERY : OperationTypeNode.MUTATION,
  name: { kind: Kind.NAME, value: descriptor.tool },
  ...(variableDefinitions.length ? { variableDefinitions } : {}),
  selectionSet: { kind: Kind.SELECTION_SET, selections: [rootFieldNode] },
 };
 const document = print({ kind: Kind.DOCUMENT, definitions: [operation, ...(parsedSelection?.fragments ?? [])] });

 composeSelectionValidation(document, descriptor.tool);
 return { document, variables };
}

function describeField(field: GraphQLField<unknown, unknown>, descriptor: OperationDescriptor): string {
 const lines = [`${descriptor.tool} — ${descriptor.kind}.${descriptor.root}: ${String(field.type)}`];
 if (descriptor.deprecated) lines.push(`DEPRECATED: ${descriptor.deprecated}`);
 if (descriptor.description) lines.push(descriptor.description.trim());
 lines.push(field.args.length ? "Arguments:" : "Arguments: none");
 for (const arg of field.args) {
  const parts = [`  ${arg.name}: ${String(arg.type)}`];
  if (arg.defaultValue !== undefined) parts.push(`(default ${JSON.stringify(arg.defaultValue)})`);
  if (arg.description) parts.push(`— ${arg.description.replace(/\s+/g, " ").trim()}`);
  lines.push(parts.join(" "));
 }
 const named = getNamedType(field.type);
 if (isObjectType(named) || isInterfaceType(named)) {
  const fields = Object.values((named as GraphQLObjectType).getFields()).map(
   (f) => `${f.name}: ${String(f.type)}${f.deprecationReason ? " [deprecated]" : ""}`,
  );
  lines.push(`Returns ${named.name} with fields:`);
  lines.push(`  ${fields.join(", ")}`);
 } else if (isUnionType(named)) {
  lines.push(`Returns union ${named.name}: ${named.getTypes().map((t) => t.name).join(" | ")}`);
 } else {
  lines.push(`Returns leaf type ${named.name}; no selection set is used.`);
 }
 lines.push("Selection: optional GraphQL selection set override; omitted means the default scalar-first selection.");
 return lines.join("\n");
}

/** Compact schema help for a tool name (`lq_issue`) or a root field name (`issue`). */
export function describeOperation(toolOrRoot: string): string {
 const schema = getSchema();
 const matches = loadCatalog().filter((d) => d.tool === toolOrRoot || d.root === toolOrRoot);
 if (!matches.length) throw new Error(`unknown Linear operation "${toolOrRoot}"`);
 return matches.map((descriptor) => describeField(rootField(schema, descriptor), descriptor)).join("\n\n");
}

function describeType(type: GraphQLNamedType): string {
 const header = `${type.name}${type.description ? ` — ${type.description.replace(/\s+/g, " ").trim()}` : ""}`;
 if (isEnumType(type)) {
  const values = type.getValues().map((v) => `  ${v.name}${v.deprecationReason ? ` [deprecated: ${v.deprecationReason}]` : ""}`);
  return [`enum ${header}`, ...values].join("\n");
 }
 if (isUnionType(type)) return [`union ${header}`, `  ${type.getTypes().map((t) => t.name).join(" | ")}`].join("\n");
 if (isScalarType(type)) return `scalar ${header}`;
 if (isInputObjectType(type)) {
  const fields = Object.values(type.getFields()).map((f) => {
   const suffix = f.defaultValue !== undefined ? ` (default ${JSON.stringify(f.defaultValue)})` : "";
   return `  ${f.name}: ${String(f.type)}${suffix}${f.deprecationReason ? ` [deprecated: ${f.deprecationReason}]` : ""}`;
  });
  return [`input ${header}`, ...fields].join("\n");
 }
 const kind = isInterfaceType(type) ? "interface" : "type";
 const fields = Object.values((type as GraphQLObjectType).getFields()).map((f) => {
  const args = f.args.length ? `(${f.args.map((a) => `${a.name}: ${String(a.type)}`).join(", ")})` : "";
  return `  ${f.name}${args}: ${String(f.type)}${f.deprecationReason ? ` [deprecated: ${f.deprecationReason}]` : ""}`;
 });
 return [`${kind} ${header}`, ...fields].join("\n");
}

/** Levenshtein distance, used only to suggest close names for an unknown lookup. */
function distance(a: string, b: string): number {
 let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
 for (let i = 1; i <= a.length; i++) {
  const current = [i];
  for (let j = 1; j <= b.length; j++) {
   current[j] = Math.min(previous[j]! + 1, current[j - 1]! + 1, previous[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1));
  }
  previous = current;
 }
 return previous[b.length]!;
}

function suggestions(name: string): string[] {
 const candidates = new Set<string>();
 for (const descriptor of loadCatalog()) {
  candidates.add(descriptor.tool);
  candidates.add(descriptor.root);
 }
 for (const type of Object.values(getSchema().getTypeMap())) if (!type.name.startsWith("__")) candidates.add(type.name);
 const needle = name.toLowerCase();
 return [...candidates]
  .map((candidate) => ({ candidate, score: distance(needle, candidate.toLowerCase()) }))
  .filter((entry) => entry.score <= Math.max(3, Math.floor(needle.length / 2)) || entry.candidate.toLowerCase().includes(needle))
  .sort((a, b) => (a.score !== b.score ? a.score - b.score : a.candidate < b.candidate ? -1 : 1))
  .slice(0, 8)
  .map((entry) => entry.candidate);
}

/**
 * Schema help for any pinned name: a tool name (`lq_issue`), a root field (`issue`), or any schema
 * type (object, input, interface, union, enum, scalar). Unknown names return a suggestion list
 * instead of throwing, so the help tool always has something useful to show.
 */
export function describe(name: string): string {
 const schema = getSchema();
 const matches = loadCatalog().filter((d) => d.tool === name || d.root === name);
 const sections = matches.map((descriptor) => describeField(rootField(schema, descriptor), descriptor));
 const type = schema.getType(name);
 if (type) sections.push(describeType(type));
 if (sections.length) return sections.join("\n\n");
 const close = suggestions(name);
 return `unknown name "${name}"${close.length ? `; did you mean: ${close.join(", ")}` : ""}`;
}
