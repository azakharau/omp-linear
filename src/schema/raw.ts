/**
 * Raw GraphQL support: classification, approval tier, and the actor attribution transform.
 *
 * Post-pin escape policy. The raw path exists precisely because the Linear API moves faster than
 * the pinned SDL, so a document is NEVER rejected merely for naming something the pin does not
 * know. Validation errors are partitioned:
 *
 *   drift  — unknown fields, unknown arguments, unknown types, unknown input-object fields and
 *            unknown enum values, plus the errors that only follow from them (a variable whose
 *            type is unknown, a required argument on an unknown field). These are reported in
 *            `unpinned`, `validation` becomes "unknown", and the document still runs: the server
 *            is the authority on its own current schema.
 *   hard   — everything the pin can decide on its own: syntax errors, subscriptions, ambiguous or
 *            unknown operation names, undefined or unused variables, duplicate names, unknown
 *            fragments, conflicting field selections. These throw, because no server version
 *            makes them correct.
 */
import {
 Kind,
 parse,
 print,
 validate,
 valueFromASTUntyped,
 visit,
 type ArgumentNode,
 type DocumentNode,
 type FieldNode,
 type FragmentDefinitionNode,
 type ObjectFieldNode,
 type OperationDefinitionNode,
 type SelectionSetNode,
} from "graphql";
import { getSchema } from "./catalog.ts";

export interface MutationRoot {
 /** Response key: the alias when present, otherwise the field name. */
 alias: string;
 field: string;
}

export interface UnpinnedNames {
 /** `Type.field` */
 fields: string[];
 /** `Type.field(argument)` */
 arguments: string[];
 /** `TypeName` */
 types: string[];
 /** `InputType.field` for unknown input fields, `EnumName.VALUE` for unknown enum values. */
 inputFields: string[];
}

export interface RawClassification {
 operation: "query" | "mutation";
 tier: "read" | "write";
 name: string | null;
 document: string;
 /** "unknown" when the document references anything the pinned SDL does not know. */
 validation: "pinned" | "unknown";
 unpinned: UnpinnedNames;
 /** Response keys of every top-level mutation selection, fragments expanded. */
 mutationRoots: MutationRoot[];
}

/**
 * Strict validation for the typed tool path: composed documents are schema-exact, so any
 * validation error — including an unknown field in a user-supplied selection — is a hard failure.
 */
export function composeSelectionValidation(document: string, label: string): DocumentNode {
 let parsed: DocumentNode;
 try {
  parsed = parse(document);
 } catch (error) {
  throw new Error(`${label}: invalid selection: ${error instanceof Error ? error.message : String(error)}`);
 }
 const errors = validate(getSchema(), parsed);
 if (errors.length) throw new Error(`${label}: invalid operation: ${errors.map((e) => e.message).join("; ")}`);
 return parsed;
}

function parseDocument(document: string): DocumentNode {
 try {
  return parse(document);
 } catch (error) {
  throw new Error(`invalid GraphQL document: ${error instanceof Error ? error.message : String(error)}`);
 }
}

/** Picks the operation that would execute, with the same rules the Linear API applies. */
function selectOperation(parsed: DocumentNode, operationName?: string): OperationDefinitionNode {
 const operations = parsed.definitions.filter((d): d is OperationDefinitionNode => d.kind === Kind.OPERATION_DEFINITION);
 if (!operations.length) throw new Error("document contains no operation");
 if (operations.length > 1 && !operationName) {
  const names = operations.map((op) => op.name?.value ?? "<anonymous>").join(", ");
  throw new Error(`document defines ${operations.length} operations (${names}); operationName is required`);
 }
 const selected = operationName ? operations.find((op) => op.name?.value === operationName) : operations[0];
 if (!selected) throw new Error(`unknown operationName "${operationName}"`);
 return selected;
}

function fragmentsOf(parsed: DocumentNode): Map<string, FragmentDefinitionNode> {
 return new Map(
  parsed.definitions
   .filter((d): d is FragmentDefinitionNode => d.kind === Kind.FRAGMENT_DEFINITION)
   .map((definition) => [definition.name.value, definition]),
 );
}

/**
 * Every field reachable at the root of a selection set, looking through inline fragments and named
 * fragment spreads. Cycle-safe: a fragment is expanded at most once per traversal.
 */
function rootFields(
 selectionSet: SelectionSetNode,
 fragments: Map<string, FragmentDefinitionNode>,
 seen: Set<string> = new Set(),
): FieldNode[] {
 const found: FieldNode[] = [];
 for (const selection of selectionSet.selections) {
  if (selection.kind === Kind.FIELD) {
   found.push(selection);
   continue;
  }
  if (selection.kind === Kind.INLINE_FRAGMENT) {
   found.push(...rootFields(selection.selectionSet, fragments, seen));
   continue;
  }
  const name = selection.name.value;
  if (seen.has(name)) continue;
  const fragment = fragments.get(name);
  if (!fragment) throw new Error(`unknown fragment "${name}"`);
  seen.add(name);
  found.push(...rootFields(fragment.selectionSet, fragments, seen));
 }
 return found;
}

function mutationRootsOf(operation: OperationDefinitionNode, fragments: Map<string, FragmentDefinitionNode>): MutationRoot[] {
 if (operation.operation !== "mutation") return [];
 const roots: MutationRoot[] = [];
 for (const field of rootFields(operation.selectionSet, fragments)) {
  const alias = field.alias?.value ?? field.name.value;
  if (!roots.some((root) => root.alias === alias)) roots.push({ alias, field: field.name.value });
 }
 return roots;
}

const DRIFT = {
 field: /^Cannot query field "([^"]+)" on type "([^"]+)"\./,
 argument: /^Unknown argument "([^"]+)" on field "([^"]+)"\./,
 type: /^Unknown type "([^"]+)"\./,
 inputField: /^Field "([^"]+)" is not defined by type "([^"]+)"\./,
 enumValue: /^Value "([^"]+)" does not exist in "([^"]+)" enum\./,
 variablePosition: /^Variable "\$[^"]+" of type "([^"]+)" used in position expecting type/,
 requiredArgument: /^Field "([^"]+)" argument "([^"]+)" of type .* is required, but it was not provided\./,
};

function partitionErrors(messages: string[]): { unpinned: UnpinnedNames; hard: string[] } {
 const unpinned: UnpinnedNames = { fields: [], arguments: [], types: [], inputFields: [] };
 const push = (bucket: string[], value: string) => {
  if (!bucket.includes(value)) bucket.push(value);
 };
 const rest: string[] = [];
 for (const message of messages) {
  const field = DRIFT.field.exec(message);
  if (field) {
   push(unpinned.fields, `${field[2]}.${field[1]}`);
   continue;
  }
  const argument = DRIFT.argument.exec(message);
  if (argument) {
   push(unpinned.arguments, `${argument[2]}(${argument[1]})`);
   continue;
  }
  const type = DRIFT.type.exec(message);
  if (type) {
   push(unpinned.types, type[1]!);
   continue;
  }
  const inputField = DRIFT.inputField.exec(message);
  if (inputField) {
   push(unpinned.inputFields, `${inputField[2]}.${inputField[1]}`);
   continue;
  }
  const enumValue = DRIFT.enumValue.exec(message);
  if (enumValue) {
   push(unpinned.inputFields, `${enumValue[2]}.${enumValue[1]}`);
   continue;
  }
  rest.push(message);
 }

 // Second pass: errors that are only consequences of a name the pin does not know.
 const unknownFieldNames = new Set(unpinned.fields.map((path) => path.slice(path.indexOf(".") + 1)));
 const hard: string[] = [];
 for (const message of rest) {
  const position = DRIFT.variablePosition.exec(message);
  if (position && unpinned.types.includes(position[1]!.replace(/[[\]!]/g, ""))) continue;
  const required = DRIFT.requiredArgument.exec(message);
  if (required && unknownFieldNames.has(required[1]!)) continue;
  hard.push(message);
 }
 return { unpinned, hard };
}

/**
 * Selects the operation a raw document would execute, derives its approval tier from the AST
 * (never from string matching) and reports everything the pinned SDL does not recognise.
 */
export function classifyRawDocument(document: string, operationName?: string): RawClassification {
 const parsed = parseDocument(document);
 const selected = selectOperation(parsed, operationName);
 if (selected.operation === "subscription") throw new Error("subscriptions are not supported");

 const { unpinned, hard } = partitionErrors(validate(getSchema(), parsed).map((error) => error.message));
 if (hard.length) throw new Error(`document does not validate against the pinned Linear schema: ${hard.join("; ")}`);
 const drifted = unpinned.fields.length + unpinned.arguments.length + unpinned.types.length + unpinned.inputFields.length;

 return {
  operation: selected.operation,
  tier: selected.operation === "mutation" ? "write" : "read",
  name: selected.name?.value ?? null,
  document,
  validation: drifted ? "unknown" : "pinned",
  unpinned,
  mutationRoots: mutationRootsOf(selected, fragmentsOf(parsed)),
 };
}

/**
 * Response keys of every top-level mutation selection, so the caller can check `data[key].success`
 * for each payload. Roots reached through inline fragments and named fragment spreads included.
 */
export function mutationPayloadRoots(document: string, operationName?: string): MutationRoot[] {
 const parsed = parseDocument(document);
 return mutationRootsOf(selectOperation(parsed, operationName), fragmentsOf(parsed));
}

export interface AttributionTarget {
 /** Mutation root field name, e.g. `issueCreate` or `commentCreate`. */
 field: string;
 /** Name of the input argument carrying the mutation payload, e.g. `input`. */
 inputArg: string;
}

function withCreateAsUser(value: unknown, author: string, label: string): unknown {
 if (Array.isArray(value)) return value.map((entry) => withCreateAsUser(entry, author, label));
 if (value === null || typeof value !== "object") throw new Error(`${label}: input variable is not an object`);
 return { ...(value as Record<string, unknown>), createAsUser: author };
}

/**
 * Sets `createAsUser` on every matching mutation input of the SELECTED operation, so `actor=app`
 * calls render as "user via application". Inline object literals are rewritten on the AST and
 * variable inputs in the variable values (an object default on the operation's variable definition
 * is materialised when no runtime value was supplied). Inline fragments and fragment spreads at
 * the mutation root are traversed; other operations keep their selections and variables.
 */
export function injectCreateAsUser(
 document: string,
 variables: Record<string, unknown>,
 roots: AttributionTarget[],
 author: string,
 operationName?: string,
): { document: string; variables: Record<string, unknown> } {
 const parsed = parseDocument(document);
 const operation = selectOperation(parsed, operationName);
 const fragments = fragmentsOf(parsed);
 const byField = new Map(roots.map((root) => [root.field, root.inputArg]));

 const targets = new Map<FieldNode, string>();
 if (operation.operation === "mutation") {
  for (const field of rootFields(operation.selectionSet, fragments)) {
   const inputArg = byField.get(field.name.value);
   if (inputArg) targets.set(field, inputArg);
  }
 }
 if (!targets.size) return { document, variables };

 const defaults = new Map(
  (operation.variableDefinitions ?? []).map((definition) => [
   definition.variable.name.value,
   definition.defaultValue ? valueFromASTUntyped(definition.defaultValue) : undefined,
  ]),
 );
 const nextVariables: Record<string, unknown> = { ...variables };

 const transformed = visit(parsed, {
  Field: {
   enter(node: FieldNode) {
    const inputArg = targets.get(node);
    if (!inputArg) return undefined;
    const label = `${node.alias?.value ?? node.name.value} (${node.name.value})`;
    const argument = node.arguments?.find((arg) => arg.name.value === inputArg);
    if (!argument) throw new Error(`${label}: missing "${inputArg}" argument, cannot attribute the author`);

    if (argument.value.kind === Kind.VARIABLE) {
     const name = argument.value.name.value;
     const current = nextVariables[name] ?? defaults.get(name);
     if (current === undefined) throw new Error(`${label}: variable "$${name}" has no value, cannot attribute the author`);
     nextVariables[name] = withCreateAsUser(current, author, label);
     return undefined;
    }
    if (argument.value.kind !== Kind.OBJECT) throw new Error(`${label}: "${inputArg}" is not an object literal or variable`);

    const field: ObjectFieldNode = {
     kind: Kind.OBJECT_FIELD,
     name: { kind: Kind.NAME, value: "createAsUser" },
     value: { kind: Kind.STRING, value: author },
    };
    const fields = [...argument.value.fields.filter((existing) => existing.name.value !== "createAsUser"), field];
    const nextArgument: ArgumentNode = { ...argument, value: { ...argument.value, fields } };
    return { ...node, arguments: node.arguments?.map((arg) => (arg === argument ? nextArgument : arg)) };
   },
  },
 });

 return { document: print(transformed), variables: nextVariables };
}
