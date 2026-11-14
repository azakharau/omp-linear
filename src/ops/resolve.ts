/**
 * Identifier resolution for the ergonomic Linear operations.
 *
 * Every resolver is explicit: zero matches and more than one match are both
 * errors. No first-match heuristics, no implicit creation.
 */
import type { LinearClient } from "../client/graphql.ts";

export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const ISSUE_IDENTIFIER_PATTERN = /^([A-Za-z][A-Za-z0-9_]*)-([0-9]+)$/;

export const TEAM_LOOKUP = `query LinearTeamLookup($ref: String!) {
  teams(filter: { or: [{ key: { eq: $ref } }, { name: { eq: $ref } }] }, first: 10) {
    nodes { id key name }
  }
}`;

export const ISSUE_LOOKUP = `query LinearIssueLookup($teamKey: String!, $number: Float!) {
  issues(filter: { team: { key: { eq: $teamKey } }, number: { eq: $number } }, first: 10) {
    nodes { id identifier title }
  }
}`;

export const STATE_LOOKUP = `query LinearStateLookup($teamId: ID!, $name: String!) {
  workflowStates(filter: { team: { id: { eq: $teamId } }, name: { eq: $name } }, first: 10) {
    nodes { id name type team { id key } }
  }
}`;

export const LABEL_LOOKUP = `query LinearLabelLookup($name: String!) {
  issueLabels(filter: { name: { eq: $name } }, first: 10) {
    nodes { id name team { id key } }
  }
}`;

export const PROJECT_LOOKUP = `query LinearProjectLookup($name: String!) {
  projects(filter: { name: { eq: $name } }, first: 10) {
    nodes { id name }
  }
}`;

export const MILESTONE_LOOKUP = `query LinearMilestoneLookup($projectId: ID!, $name: String!) {
  projectMilestones(filter: { project: { id: { eq: $projectId } }, name: { eq: $name } }, first: 10) {
    nodes { id name }
  }
}`;

export interface LookupNode {
 id: string;
 [key: string]: unknown;
}

/** Runs one request and fails loudly; ergonomic ops never swallow transport errors. */
export async function request(
 client: LinearClient,
 document: string,
 variables?: Record<string, unknown>,
): Promise<Record<string, unknown>> {
 const result = await client.execute(document, variables);
 if (!result.ok) {
  throw new Error(`linear request failed (${result.kind}): ${result.message}`);
 }
 const { data } = result;
 if (typeof data !== "object" || data === null) {
  throw new Error("linear request returned a non-object data payload");
 }
 return data as Record<string, unknown>;
}

function readRecord(value: unknown, field: string): Record<string, unknown> {
 if (typeof value !== "object" || value === null || !(field in value)) {
  throw new Error(`linear response is missing "${field}"`);
 }
 const nested = (value as Record<string, unknown>)[field];
 if (typeof nested !== "object" || nested === null) {
  throw new Error(`linear response field "${field}" is not an object`);
 }
 return nested as Record<string, unknown>;
}

export function connectionNodes(data: Record<string, unknown>, root: string): LookupNode[] {
 const nodes = readRecord(data, root).nodes;
 if (!Array.isArray(nodes)) {
  throw new Error(`linear response field "${root}.nodes" is not a list`);
 }
 return nodes as LookupNode[];
}

/** Picks the single match or reports every candidate; ambiguity is never resolved silently. */
export function exactlyOne(
 nodes: LookupNode[],
 what: string,
 ref: string,
 describe: (node: LookupNode) => string,
): LookupNode {
 if (nodes.length === 0) throw new Error(`${what} not found: ${JSON.stringify(ref)}`);
 if (nodes.length > 1) {
  const candidates = nodes.map(node => `${node.id} (${describe(node)})`).join(", ");
  throw new Error(`ambiguous ${what} ${JSON.stringify(ref)}: ${nodes.length} candidates: ${candidates}`);
 }
 return nodes[0]!;
}

export async function resolveTeamId(client: LinearClient, ref: string): Promise<string> {
 if (UUID_PATTERN.test(ref)) return ref;
 const data = await request(client, TEAM_LOOKUP, { ref });
 return exactlyOne(connectionNodes(data, "teams"), "team", ref, node => `${node.key} ${node.name}`).id;
}

export async function resolveIssueId(client: LinearClient, ref: string): Promise<string> {
 if (UUID_PATTERN.test(ref)) return ref;
 const match = ISSUE_IDENTIFIER_PATTERN.exec(ref);
 if (!match) {
  throw new Error(`issue reference must be a UUID or an identifier like ABC-12, got ${JSON.stringify(ref)}`);
 }
 const data = await request(client, ISSUE_LOOKUP, {
  teamKey: match[1]!.toUpperCase(),
  number: Number(match[2]),
 });
 return exactlyOne(connectionNodes(data, "issues"), "issue", ref, node => String(node.identifier)).id;
}

export async function resolveStateId(
 client: LinearClient,
 teamId: string,
 name: string,
): Promise<string> {
 if (UUID_PATTERN.test(name)) return name;
 const data = await request(client, STATE_LOOKUP, { teamId, name });
 return exactlyOne(
  connectionNodes(data, "workflowStates"),
  "workflow state",
  name,
  node => `${node.name}/${node.type}`,
 ).id;
}

export async function resolveLabelIds(client: LinearClient, names: string[]): Promise<string[]> {
 const ids: string[] = [];
 for (const name of names) {
  if (UUID_PATTERN.test(name)) {
   ids.push(name);
   continue;
  }
  const data = await request(client, LABEL_LOOKUP, { name });
  ids.push(
   exactlyOne(connectionNodes(data, "issueLabels"), "label", name, node => {
    const team = node.team;
    const scope =
     typeof team === "object" && team !== null && "key" in team ? String(team.key) : "workspace";
    return `${node.name} in ${scope}`;
   }).id,
  );
 }
 return ids;
}

export async function resolveProjectId(client: LinearClient, ref: string): Promise<string> {
 if (UUID_PATTERN.test(ref)) return ref;
 const data = await request(client, PROJECT_LOOKUP, { name: ref });
 return exactlyOne(connectionNodes(data, "projects"), "project", ref, node => String(node.name)).id;
}

export async function resolveMilestoneId(
 client: LinearClient,
 projectId: string,
 ref: string,
): Promise<string> {
 if (UUID_PATTERN.test(ref)) return ref;
 const data = await request(client, MILESTONE_LOOKUP, { projectId, name: ref });
 return exactlyOne(
  connectionNodes(data, "projectMilestones"),
  "project milestone",
  ref,
  node => String(node.name),
 ).id;
}
