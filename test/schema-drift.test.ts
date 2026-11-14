import { describe, expect, test } from "bun:test";
import { buildSchema } from "graphql";
import { compareSchemas } from "../scripts/check-schema-drift";

const PINNED = buildSchema(`
  type Issue { id: ID! title: String! }
  type Query { issue(id: String!): Issue  oldRoot: Issue }
  type Mutation { issueArchive(id: String!, trash: Boolean): Boolean }
`);

describe("schema drift comparison", () => {
	test("reports roots on one side only, required/optional/removed arguments and documents the live schema rejects", () => {
		const live = buildSchema(`
      type Issue { id: ID! }
      type Query { issue(id: String!, includeArchived: Boolean): Issue  newRoot: Issue }
      type Mutation { issueArchive(id: String!, reason: String!): Boolean }
    `);
		const report = compareSchemas(PINNED, live, {
			ok: "query Ok { issue(id: \"1\") { id } }",
			stale: "query Stale { issue(id: \"1\") { id title } }",
		});
		expect(report.query).toEqual({ liveOnly: ["newRoot"], pinnedOnly: ["oldRoot"], changedArgs: { issue: ["+includeArchived"] } });
		expect(report.mutation.changedArgs).toEqual({ issueArchive: ["+reason!", "-trash"] });
		expect(Object.keys(report.invalidDocuments)).toEqual(["stale"]);
		expect(report.drift).toBe(true);
	});

	test("a changed input type is drift even when every root and argument matches", () => {
		const withInput = (fields: string) =>
			buildSchema(`input IssueCreateInput { ${fields} } type Query { ok: Boolean } type Mutation { issueCreate(input: IssueCreateInput!): Boolean }`);
		const report = compareSchemas(withInput("title: String!"), withInput("title: String! priority: Int"), {});
		expect(report.changedTypes).toEqual(["IssueCreateInput"]);
		expect(report.drift).toBe(true);
	});

	test("identical schemas with valid documents report no drift", () => {
		const report = compareSchemas(PINNED, PINNED, { ok: "query Ok { issue(id: \"1\") { id title } }" });
		expect(report.drift).toBe(false);
	});
});
