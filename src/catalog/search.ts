/**
 * Deterministic lexical search over the Linear tool catalog.
 *
 * BM25 only: no embeddings, no model calls, no side effects. Searching never activates anything —
 * it returns ranked candidates the caller may choose to act on.
 */

export interface SearchDoc {
 tool: string;
 kind: string;
 root: string;
 text: string;
}

export interface SearchHit {
 tool: string;
 kind: string;
 root: string;
 score: number;
 summary: string;
}

interface IndexedDoc {
 doc: SearchDoc;
 length: number;
 frequencies: Map<string, number>;
}

export interface SearchIndex {
 docs: IndexedDoc[];
 documentFrequency: Map<string, number>;
 averageLength: number;
}

const K1 = 1.2;
const B = 0.75;

/** Curated aliases collapsed onto a single canonical token before scoring. */
const SYNONYM_GROUPS: Record<string, string[]> = {
 create: ["create", "creates", "created", "add", "new"],
 update: ["update", "updates", "edit", "modify", "rename"],
 delete: ["delete", "remove", "archive"],
 comment: ["comment", "comments", "reply"],
 transition: ["transition", "status", "state", "workflow", "done"],
 issue: ["issue", "issues", "ticket", "task"],
 project: ["project", "projects"],
 milestone: ["milestone", "milestones"],
 team: ["team", "teams"],
 raw: ["raw", "graphql", "custom", "gql"],
 help: ["help", "schema", "docs", "reference"],
 search: ["search", "find", "query", "lookup"],
 assign: ["assign", "assignee", "owner"],
 label: ["label", "labels", "tag"],
 relation: ["relation", "relations", "link", "blocks"],
 user: ["user", "users", "member"],
 cycle: ["cycle", "cycles", "sprint"],
 list: ["list", "get", "fetch", "read", "show"],
};

const CANONICAL: Record<string, string> = {};
for (const [canonical, aliases] of Object.entries(SYNONYM_GROUPS)) {
 for (const alias of aliases) CANONICAL[alias] = canonical;
}

/** Lowercased, camelCase-split, unicode-aware tokens mapped onto their canonical synonym. */
export function tokenize(text: string): string[] {
 const out: string[] = [];
 for (const chunk of text.split(/[^\p{L}\p{N}]+/u)) {
  if (!chunk) continue;
  for (const part of chunk.replace(/([\p{Ll}\p{N}])([\p{Lu}])/gu, "$1 $2").split(" ")) {
   const token = part.toLowerCase();
   if (!token) continue;
   out.push(CANONICAL[token] ?? token);
  }
 }
 return out;
}

export function createSearchIndex(docs: SearchDoc[]): SearchIndex {
 const documentFrequency = new Map<string, number>();
 const indexed: IndexedDoc[] = docs.map((doc) => {
  const tokens = tokenize(`${doc.tool} ${doc.kind} ${doc.root} ${doc.text}`);
  const frequencies = new Map<string, number>();
  for (const token of tokens) frequencies.set(token, (frequencies.get(token) ?? 0) + 1);
  for (const token of frequencies.keys()) documentFrequency.set(token, (documentFrequency.get(token) ?? 0) + 1);
  return { doc, length: tokens.length, frequencies };
 });
 const totalLength = indexed.reduce((sum, entry) => sum + entry.length, 0);
 return { docs: indexed, documentFrequency, averageLength: indexed.length ? totalLength / indexed.length : 0 };
}

/** Ranked BM25 candidates, highest score first, ties broken by tool name for stable output. */
export function search(index: SearchIndex, query: string, limit = 5): SearchHit[] {
 const terms = [...new Set(tokenize(query))];
 if (!terms.length || !index.docs.length) return [];
 const total = index.docs.length;
 const hits: SearchHit[] = [];
 for (const entry of index.docs) {
  let score = 0;
  const matched: string[] = [];
  for (const term of terms) {
   const frequency = entry.frequencies.get(term);
   if (!frequency) continue;
   const df = index.documentFrequency.get(term) ?? 0;
   const idf = Math.log(1 + (total - df + 0.5) / (df + 0.5));
   const norm = frequency * (K1 + 1);
   const denominator = frequency + K1 * (1 - B + (B * entry.length) / (index.averageLength || 1));
   score += idf * (norm / denominator);
   matched.push(term);
  }
  if (score <= 0) continue;
  hits.push({
   tool: entry.doc.tool,
   kind: entry.doc.kind,
   root: entry.doc.root,
   score,
   summary: `${entry.doc.kind}.${entry.doc.root} — matched: ${matched.sort().join(", ")}`,
  });
 }
 hits.sort((a, b) => (b.score !== a.score ? b.score - a.score : a.tool < b.tool ? -1 : a.tool > b.tool ? 1 : 0));
 return hits.slice(0, Math.max(0, limit));
}
