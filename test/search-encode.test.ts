import { describe, expect, test } from "bun:test";
import { decode } from "@toon-format/toon";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { loadCatalog } from "../src/schema/catalog.ts";
import { createSearchIndex, search, tokenize, type SearchDoc } from "../src/catalog/search.ts";
import { analyzeShape, encodeOutput, MIN_ROWS, POLICY } from "../src/output/encode.ts";

const ROOT = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const FIXTURES = path.join(ROOT, "test", "fixtures");

/** Curated alias texts for the hand-written tools, mirroring what the extension registers. */
const ERGONOMIC: Record<string, string> = {
	linear_issue_create: "Create new issue task ticket work item.",
	linear_issue_update: "Update edit change issue task ticket title description.",
	linear_issue_transition: "Transition move workflow status state done issue task, update status.",
	linear_issue_get: "Get show read issue by identifier ENG-123 or UUID.",
	linear_issue_comment_add: "Comment reply post add to issue task ticket.",
	linear_issue_relation_add: "Relation link blocks related duplicate between issues.",
	linear_issue_search: "Search find issues with filters and cursor pagination.",
	linear_project_create: "Create new project.",
	linear_project_update: "Update edit project name state dates.",
	linear_milestone_create: "Create new project milestone.",
	linear_milestone_update: "Update edit project milestone.",
	linear_graphql: "Raw custom unsupported arbitrary GraphQL document execute.",
	linear_schema_help: "Schema help API arguments inspect field reference.",
	linear_tool_search: "Search the Linear tool catalog for candidate operations.",
};

const docs: SearchDoc[] = [
	...loadCatalog().map((d) => ({ tool: d.tool, kind: d.kind, root: d.root, text: `${d.description} ${d.argNames.join(" ")}` })),
	...Object.entries(ERGONOMIC).map(([tool, text]) => ({ tool, kind: "Ergonomic", root: tool.replace(/^linear_/, ""), text })),
];
const index = createSearchIndex(docs);

describe("tokenizer", () => {
	test("splits camelCase and maps synonyms onto one canonical token", () => {
		expect(tokenize("issueCreate")).toEqual(["issue", "create"]);
		expect(tokenize("new ticket")).toEqual(["create", "issue"]);
		expect(tokenize("lm_projectMilestoneUpdate")).toEqual(["lm", "project", "milestone", "update"]);
	});
});

describe("search", () => {
	test("indexes the full catalog plus the hand-written tools", () => {
		expect(docs.length).toBe(495 + Object.keys(ERGONOMIC).length);
	});

	test("'create issue' and 'new ticket' both rank linear_issue_create first", () => {
		expect(search(index, "create issue")[0]!.tool).toBe("linear_issue_create");
		expect(search(index, "new ticket")[0]!.tool).toBe("linear_issue_create");
	});

	test("intent-specific queries reach the matching tool", () => {
		expect(search(index, "raw graphql")[0]!.tool).toBe("linear_graphql");
		expect(search(index, "move issue to status done")[0]!.tool).toBe("linear_issue_transition");
		expect(search(index, "add a comment to the task").slice(0, 3).map((h) => h.tool)).toContain("linear_issue_comment_add");
	});

	test("is deterministic and bounded by limit", () => {
		const first = search(index, "update project milestone", 5);
		const second = search(index, "update project milestone", 5);
		expect(JSON.stringify(first)).toBe(JSON.stringify(second));
		expect(first.length).toBe(5);
		expect(first[0]!.score).toBeGreaterThan(0);
		expect(first[0]!.summary).toContain("matched:");
	});

	test("ties are broken by tool name, and unmatched queries return nothing", () => {
		expect(search(index, "zzzznomatchtoken")).toEqual([]);
		const many = search(index, "issue", 50);
		for (let i = 1; i < many.length; i++) {
			const previous = many[i - 1]!;
			const current = many[i]!;
			expect(previous.score > current.score || (previous.score === current.score && previous.tool < current.tool)).toBe(true);
		}
	});
});

describe("frozen intent corpus", () => {
	const corpus = JSON.parse(fs.readFileSync(path.join(FIXTURES, "search-corpus.json"), "utf8")) as {
		counts: Record<string, number>;
		intents: { intent: string; expected: string | null; group: string }[];
	};
	const baseline = JSON.parse(fs.readFileSync(path.join(FIXTURES, "search-baseline.json"), "utf8")) as {
		measured: { top1: number; top3: number };
	};

	test("the frozen corpus is the research corpus", () => {
		expect(corpus.counts).toEqual({ en: 20, ambiguous: 10, raw: 5, "schema-help": 5, total: 40 });
		expect(corpus.intents.length).toBe(40);
		expect(corpus.intents.filter((entry) => entry.expected === null).length).toBe(10);
	});

	test("every labeled intent has its expected tool in the top 3, and top-1 does not regress", () => {
		let top1 = 0;
		let top3 = 0;
		let labeled = 0;
		const misses: string[] = [];
		for (const entry of corpus.intents) {
			const hits = search(index, entry.intent, 3).map((hit) => hit.tool);
			if (entry.expected === null) {
				// Ambiguous intents are candidates-only: they must still produce candidates, never an answer.
				expect(hits.length).toBeGreaterThan(0);
				continue;
			}
			labeled++;
			if (hits[0] === entry.expected) top1++;
			if (hits.includes(entry.expected)) top3++;
			else misses.push(`${entry.group}: "${entry.intent}" expected ${entry.expected}, got ${hits.join(" | ")}`);
		}
		expect(labeled).toBe(30);
		expect(misses).toEqual([]);
		expect(top3).toBe(30);
		expect(top1).toBeGreaterThanOrEqual(baseline.measured.top1);
		expect(top3).toBeGreaterThanOrEqual(baseline.measured.top3);
	});
});

describe("encodeOutput", () => {
	test("classifies the shape classes the policy was measured over", () => {
		expect(analyzeShape("ENG-123")).toBe("scalar");
		expect(analyzeShape(null)).toBe("scalar");
		expect(analyzeShape([{ a: 1 }, { a: 2 }, { a: 3 }])).toBe("table");
		expect(analyzeShape([{ a: 1 }])).toBe("table"); // row count is a policy threshold, not a class
		expect(analyzeShape([])).toBe("nested"); // an empty array has no row shape to speak of
		expect(analyzeShape([{ a: 1 }, { b: 2 }, { a: 3 }])).toBe("nested"); // key sets differ
		expect(analyzeShape({ ok: true, id: "x" })).toBe("object"); // flat primitives
		expect(analyzeShape({ ok: true, rows: [{ a: 1 }, { a: 2 }, { a: 3 }] })).toBe("keyed-table");
		expect(analyzeShape({ issue: { id: "x" } })).toBe("nested");
		expect(analyzeShape({ rows: [{ a: 1 }, { a: { b: 2 } }, { a: 3 }] })).toBe("nested"); // cells not primitive
	});

	test("the runtime follows the frozen policy table", () => {
		expect(POLICY).toEqual(JSON.parse(fs.readFileSync(path.join(ROOT, "src", "output", "policy.json"), "utf8")).decisions);
		const rows = Array.from({ length: 50 }, (_, i) => ({
			id: `issue-${i}`,
			identifier: `ENG-${i}`,
			title: `Row ${i}`,
			priority: i % 4,
			completed: i % 2 === 0,
		}));
		const table = encodeOutput(rows);
		expect(table.shape).toBe("table");
		expect(table.format).toBe(POLICY.table);
		expect(decode(table.text)).toEqual(rows);

		const keyed = { nodes: rows, hasNextPage: true, endCursor: "c-50" };
		const keyedEncoded = encodeOutput(keyed);
		expect(keyedEncoded.shape).toBe("keyed-table");
		expect(keyedEncoded.format).toBe(POLICY["keyed-table"]);

		// Nested: measured as a token loss, so it stays JSON however large it is.
		const nested = {
			nodes: Array.from({ length: 30 }, (_, i) => ({ id: `issue-${i}`, state: { name: "Todo" } })),
		};
		const nestedEncoded = encodeOutput(nested);
		expect(nestedEncoded.shape).toBe("nested");
		expect(nestedEncoded.format).toBe("json");
		expect(JSON.parse(nestedEncoded.text)).toEqual(nested);
	});

	test("the measured row threshold decides, and it never serialises to find out", () => {
		const policyFile = JSON.parse(fs.readFileSync(path.join(ROOT, "src", "output", "policy.json"), "utf8"));
		expect(MIN_ROWS).toEqual(policyFile.minRows);
		expect(MIN_ROWS.table).toBe(3);
		expect(MIN_ROWS["keyed-table"]).toBe(25);

		// One row is below the measured break-even even though the payload is huge.
		const oneRow = [{ id: "x", note: "y".repeat(4000) }];
		expect(analyzeShape(oneRow)).toBe("table");
		expect(encodeOutput(oneRow).format).toBe("json");
		// Three tiny rows are above it: the decision is structural, not size-based.
		const tinyRows = (count: number) => Array.from({ length: count }, (_, i) => ({ id: i, n: `r${i}` }));
		expect(encodeOutput(tinyRows(2)).format).toBe("json");
		expect(encodeOutput(tinyRows(3)).format).toBe("toon");

		// keyed-table wins only from 25 rows up.
		const keyedRows = (count: number) => ({ nodes: Array.from({ length: count }, (_, i) => ({ id: i, n: `r${i}` })), hasNextPage: false });
		expect(encodeOutput(keyedRows(24)).format).toBe("json");
		expect(encodeOutput(keyedRows(25)).format).toBe("toon");
	});

	test("reports the bytes of the format actually chosen, including non-ASCII", () => {
		const value = { title: "Café résumé", tags: ["naïve", "über"] };
		const encoded = encodeOutput(value);
		expect(encoded.format).toBe("json");
		expect(encoded.text).toBe(JSON.stringify(value));
		expect(encoded.bytes).toBe(Buffer.byteLength(encoded.text, "utf8"));
		const scalar = encodeOutput("ENG-123");
		expect(scalar.text).toBe('"ENG-123"');
		expect(scalar.bytes).toBe(9);
	});
});
