import { type GraphQLSchema, getNamedType, isInputObjectType } from "graphql";
import type { AttributionTarget } from "../schema/raw";

/**
 * Mutation roots that accept `createAsUser`, keyed by root field name: either on an input
 * object (`issueCreate(input:)`) or as a direct argument (`attachmentLinkURL(createAsUser:)`).
 * Computed once from the pinned schema; Linear renders such mutations as "<author> via <app>".
 */
export function attributionTargets(schema: GraphQLSchema): Map<string, AttributionTarget> {
 const targets = new Map<string, AttributionTarget>();
 const mutation = schema.getMutationType();
 if (!mutation) return targets;
 for (const field of Object.values(mutation.getFields())) {
  if (field.args.some(arg => arg.name === "createAsUser")) {
   targets.set(field.name, { field: field.name, inputArg: "createAsUser", kind: "argument" });
   continue;
  }
  for (const arg of field.args) {
   const named = getNamedType(arg.type);
   if (isInputObjectType(named) && "createAsUser" in named.getFields()) {
    targets.set(field.name, { field: field.name, inputArg: arg.name });
    break;
   }
  }
 }
 return targets;
}

function rejectForeignAuthor(field: string, supplied: unknown, author: string): void {
 if (supplied !== undefined && supplied !== author) {
  throw new Error(`${field}: createAsUser "${String(supplied)}" conflicts with the session author "${author}"; omit it`);
 }
}

/**
 * Returns typed-tool arguments with `createAsUser` set to `author`, on the attributed input or
 * as the direct argument. A caller-supplied `createAsUser` that differs from the session author
 * is rejected: an `actor=app` connection may never impersonate someone else.
 */
export function attributeTypedArgs(
 args: Record<string, unknown>,
 target: AttributionTarget,
 author: string,
): Record<string, unknown> {
 if (target.kind === "argument") {
  rejectForeignAuthor(target.field, args.createAsUser, author);
  return { ...args, createAsUser: author };
 }
 const input = args[target.inputArg];
 if (input === undefined) {
  throw new Error(`${target.field}: argument "${target.inputArg}" is required for actor=app attribution`);
 }
 if (input === null || typeof input !== "object" || Array.isArray(input)) {
  throw new Error(`${target.field}: argument "${target.inputArg}" must be an object`);
 }
 rejectForeignAuthor(target.field, (input as Record<string, unknown>).createAsUser, author);
 return { ...args, [target.inputArg]: { ...(input as Record<string, unknown>), createAsUser: author } };
}
