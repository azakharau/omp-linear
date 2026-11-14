import {
	execute,
	type GraphQLFieldResolver,
	type GraphQLInputType,
	type GraphQLOutputType,
	type GraphQLTypeResolver,
	isEnumType,
	isInputObjectType,
	isListType,
	isNonNullType,
	isScalarType,
	parse,
} from "graphql";
import { composeOperation, getSchema, loadCatalog, type OperationDescriptor } from "../../src/schema/catalog.ts";

/**
 * Schema-derived response population.
 *
 * Composes each catalog operation with its default selection and executes it against the pinned
 * schema with a synthesising resolver, so the resulting payload has exactly the shape the real API
 * would return for that selection — without any network access.
 */
export const schema = getSchema();
export const catalog = loadCatalog();
/** Default rows per list in a populated response: the smallest realistic page. */
export const LIST_ROWS = 3;

/** Deterministic synthetic value for an output type; lists get `listRows` entries. */
function synthesise(type: GraphQLOutputType, seed: string, listRows: number): unknown {
	if (isNonNullType(type)) return synthesise(type.ofType, seed, listRows);
	if (isListType(type)) return Array.from({ length: listRows }, (_, i) => synthesise(type.ofType, `${seed}.${i}`, listRows));
	if (isEnumType(type)) return type.getValues()[0]!.name;
	if (isScalarType(type)) {
		switch (type.name) {
			case "Int":
				return seed.length * 7;
			case "Float":
				return seed.length / 2;
			case "Boolean":
				return seed.length % 2 === 0;
			case "DateTime":
				return `2026-01-${String(1 + (seed.length % 28)).padStart(2, "0")}T09:00:00.000Z`;
			case "JSON":
			case "JSONObject":
				return { key: seed };
			default:
				return `${seed}-value`;
		}
	}
	// Composite: execution keeps walking into the selection set.
	return {};
}

/** Deterministic synthetic value for an input type; only required input fields are populated. */
function synthesiseInput(type: GraphQLInputType, seed: string): unknown {
	if (isNonNullType(type)) return synthesiseInput(type.ofType, seed);
	if (isListType(type)) return [synthesiseInput(type.ofType, `${seed}.0`)];
	if (isEnumType(type)) return type.getValues()[0]!.name;
	if (isInputObjectType(type)) {
		const value: Record<string, unknown> = {};
		for (const field of Object.values(type.getFields())) {
			// Required fields only: keeps recursive input types finite and mirrors a caller sending
			// the smallest legal payload.
			if (!isNonNullType(field.type) || field.defaultValue !== undefined) continue;
			value[field.name] = synthesiseInput(field.type, `${seed}.${field.name}`);
		}
		return value;
	}
	switch (type.name) {
		case "Int":
			return seed.length;
		case "Float":
			return seed.length / 2;
		case "Boolean":
			return true;
		case "DateTime":
			return "2026-01-01T09:00:00.000Z";
		case "JSON":
		case "JSONObject":
			return { key: seed };
		default:
			return `${seed}-value`;
	}
}

const fieldResolverFor = (listRows: number): GraphQLFieldResolver<unknown, unknown> => (_source, _args, _ctx, info) =>
	synthesise(info.returnType, String(info.path.key), listRows);
const typeResolver: GraphQLTypeResolver<unknown, unknown> = (_v, _c, _i, abstractType) => schema.getPossibleTypes(abstractType)[0]!.name;

/** Minimal arguments that let a descriptor compose and execute: every required argument is filled. */
export function minimalArgs(d: OperationDescriptor): Record<string, unknown> {
	const rootType = d.kind === "Query" ? schema.getQueryType()! : schema.getMutationType()!;
	const args: Record<string, unknown> = { i: "population check" };
	for (const arg of rootType.getFields()[d.root]!.args) {
		if (!isNonNullType(arg.type) || arg.defaultValue !== undefined) continue;
		args[arg.name] = synthesiseInput(arg.type, `${d.root}.${arg.name}`);
	}
	return args;
}

/** Executes one descriptor and returns the payload under its root field. */
export async function populateOne(d: OperationDescriptor, listRows: number = LIST_ROWS): Promise<unknown> {
	const { document, variables } = composeOperation(d, minimalArgs(d));
	const result = await execute({
		schema,
		document: parse(document),
		rootValue: {},
		variableValues: variables,
		fieldResolver: fieldResolverFor(listRows),
		typeResolver,
	});
	if (result.errors?.length) throw new Error(`${d.tool}: synthetic execution failed: ${result.errors.map((e) => e.message).join("; ")}`);
	return (result.data as Record<string, unknown>)[d.root];
}
