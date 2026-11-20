/**
 * Ergonomic Linear operations.
 *
 * Each write resolves human references to UUIDs, optionally checks an expected
 * state, then performs exactly one mutation followed by exactly one refetch of
 * the affected entity. A `success: false` payload is an error, never a result.
 */
import type { LinearClient } from "../client/graphql.ts";
import {
 connectionNodes,
 request,
 resolveAgentSessionId,
 resolveDocumentId,
 resolveIssueId,
 resolveLabelIds,
 resolveMilestoneId,
 resolveProjectId,
 resolveStateId,
 resolveTeamId,
 resolveUserId,
 UUID_PATTERN,
} from "./resolve.ts";

/**
 * Who the mutation is attributed to. With an `actor=app` connection Linear
 * attributes writes to the OAuth application unless `createAsUser` names the
 * agent behind them, so the caller supplies that label once; a null label (the
 * main session) leaves the write attributed to the application itself.
 */
export interface ActorContext {
 actor: "user" | "app";
 authorLabel: string | null;
}

export interface ErgonomicOp {
 name: string;
 description: string;
 tier: "read" | "write";
 /** Hidden at session start; `linear_tool_search` activates it like a catalog tool. */
 onDemand?: boolean;
 parameters: Record<string, unknown>;
 run(
  client: LinearClient,
  args: Record<string, unknown>,
  actorCtx: ActorContext,
 ): Promise<unknown>;
}

/**
 * Only `IssueCreateInput`, `CommentCreateInput` and the `attachmentLink*`
 * mutations accept `createAsUser` in the pinned SDL; project, milestone and
 * document writes cannot be attributed this way, so those ops stay app-attributed.
 */
function applyActorAttribution(input: Record<string, unknown>, actorCtx: ActorContext): void {
 if (actorCtx.actor === "app" && actorCtx.authorLabel !== null) input.createAsUser = actorCtx.authorLabel;
}

const ISSUE_FIELDS = `id identifier title description url priority createdAt updatedAt
    state { id name type }
    team { id key name }
    assignee { id displayName }
    project { id name }
    projectMilestone { id name }
    labels(first: 50) { nodes { id name } }`;

export const ISSUE_GET = `query LinearIssueGet($id: String!) {
  issue(id: $id) { ${ISSUE_FIELDS} }
}`;

/** `linear_issue_get` only: the issue with its newest comments and relations in both directions. */
export const ISSUE_DETAIL_GET = `query LinearIssueDetailGet($id: String!) {
  issue(id: $id) {
    ${ISSUE_FIELDS}
    comments(first: 20) {
      nodes { id body createdAt user { id displayName } botActor { name } }
      pageInfo { hasNextPage }
    }
    relations(first: 50) { nodes { id type relatedIssue { id identifier title state { name } } } }
    inverseRelations(first: 50) { nodes { id type issue { id identifier title state { name } } } }
  }
}`;

export const ISSUE_WITH_RELATIONS_GET = `query LinearIssueRelationsGet($id: String!) {
  issue(id: $id) {
    id identifier updatedAt
    relations(first: 50) { nodes { id type relatedIssue { id identifier title } } }
  }
}`;

/** Created issues report both directions: a `blockedBy` relation is stored on the other issue. */
export const ISSUE_CREATED_GET = `query LinearIssueCreatedGet($id: String!) {
  issue(id: $id) {
    ${ISSUE_FIELDS}
    relations(first: 50) { nodes { id type relatedIssue { id identifier title } } }
    inverseRelations(first: 50) { nodes { id type issue { id identifier title } } }
  }
}`;

export const COMMENT_GET = `query LinearCommentGet($id: String!) {
  comment(id: $id) {
    id body url createdAt
    user { id displayName }
    issue { id identifier }
  }
}`;

export const PROJECT_GET = `query LinearProjectGet($id: String!) {
  project(id: $id) {
    id name description url startDate targetDate createdAt updatedAt
    status { id name type }
    lead { id name displayName }
    teams { nodes { id key name } }
    projectMilestones { nodes { id name targetDate } }
  }
}`;

export const MILESTONE_GET = `query LinearMilestoneGet($id: String!) {
  projectMilestone(id: $id) {
    id name description targetDate createdAt updatedAt
    project { id name }
  }
}`;

export const ISSUE_CREATE = `mutation LinearIssueCreate($input: IssueCreateInput!) {
  issueCreate(input: $input) { success issue { id } }
}`;

export const ISSUE_UPDATE = `mutation LinearIssueUpdate($id: String!, $input: IssueUpdateInput!) {
  issueUpdate(id: $id, input: $input) { success issue { id } }
}`;

export const COMMENT_CREATE = `mutation LinearCommentCreate($input: CommentCreateInput!) {
  commentCreate(input: $input) { success comment { id } }
}`;

export const RELATION_CREATE = `mutation LinearIssueRelationCreate($input: IssueRelationCreateInput!) {
  issueRelationCreate(input: $input) { success issueRelation { id issue { id } } }
}`;

export const PROJECT_CREATE = `mutation LinearProjectCreate($input: ProjectCreateInput!) {
  projectCreate(input: $input) { success project { id } }
}`;

export const PROJECT_UPDATE = `mutation LinearProjectUpdate($id: String!, $input: ProjectUpdateInput!) {
  projectUpdate(id: $id, input: $input) { success project { id } }
}`;

export const MILESTONE_CREATE = `mutation LinearMilestoneCreate($input: ProjectMilestoneCreateInput!) {
  projectMilestoneCreate(input: $input) { success projectMilestone { id } }
}`;

export const MILESTONE_UPDATE = `mutation LinearMilestoneUpdate($id: String!, $input: ProjectMilestoneUpdateInput!) {
  projectMilestoneUpdate(id: $id, input: $input) { success projectMilestone { id } }
}`;

const ISSUE_PAGE = `nodes {
      id identifier title url priority updatedAt
      state { name type }
      team { key }
      assignee { displayName }
      project { id name }
    }
    pageInfo { hasNextPage endCursor }`;

export const ISSUE_SEARCH = `query LinearIssueSearch($term: String!, $filter: IssueFilter, $first: Int, $after: String, $includeArchived: Boolean) {
  searchIssues(term: $term, filter: $filter, first: $first, after: $after, includeArchived: $includeArchived) {
    ${ISSUE_PAGE}
  }
}`;

export const ISSUE_LIST = `query LinearIssueList($filter: IssueFilter, $first: Int, $after: String, $includeArchived: Boolean) {
  issues(filter: $filter, first: $first, after: $after, includeArchived: $includeArchived) {
    ${ISSUE_PAGE}
  }
}`;

export const PROJECT_STATUS_POST = `mutation LinearProjectStatusPost($input: ProjectUpdateCreateInput!) {
  projectUpdateCreate(input: $input) { success projectUpdate { id } }
}`;

export const PROJECT_STATUS_GET = `query LinearProjectStatusGet($id: String!) {
  projectUpdate(id: $id) {
    id body health url createdAt
    project { id name }
    user { displayName }
  }
}`;

export const ISSUE_LINK_ADD = `mutation LinearIssueLinkAdd($issueId: String!, $url: String!, $title: String, $createAsUser: String) {
  attachmentLinkURL(issueId: $issueId, url: $url, title: $title, createAsUser: $createAsUser) {
    success attachment { id }
  }
}`;

export const ATTACHMENT_GET = `query LinearAttachmentGet($id: String!) {
  attachment(id: $id) { id title url issue { identifier } }
}`;

export const DOCUMENT_CREATE = `mutation LinearDocumentCreate($input: DocumentCreateInput!) {
  documentCreate(input: $input) { success document { id } }
}`;

export const DOCUMENT_UPDATE = `mutation LinearDocumentUpdate($id: String!, $input: DocumentUpdateInput!) {
  documentUpdate(id: $id, input: $input) { success document { id } }
}`;

export const DOCUMENT_GET = `query LinearDocumentGet($id: String!) {
  document(id: $id) {
    id title slugId url content updatedAt
    project { id name }
    issue { identifier }
  }
}`;

export const TEAM_GET = `query LinearTeamGet($id: String!) {
  team(id: $id) {
    id key name
    states(first: 100) { nodes { id name type position } }
    labels(first: 250) { nodes { id name } }
    members(first: 250) { nodes { id name displayName active } }
  }
}`;

const AGENT_SESSION_FIELDS = `id slugId url status summary createdAt updatedAt startedAt endedAt
    creator { id displayName }
    appUser { id displayName }
    issue { id identifier title url }
    externalLinks { label url }`;

const AGENT_ACTIVITY_CONTENT = `content {
      __typename
      ... on AgentActivityThoughtContent { body }
      ... on AgentActivityActionContent { action parameter result }
      ... on AgentActivityResponseContent { body }
      ... on AgentActivityElicitationContent { body }
      ... on AgentActivityErrorContent { body reasonCode }
      ... on AgentActivityPromptContent { body title }
    }`;

export const AGENT_SESSION_GET = `query LinearAgentSessionGet($id: String!) {
  agentSession(id: $id) {
    ${AGENT_SESSION_FIELDS}
    plan context
    comment { id body }
    activities(first: 20) {
      nodes { id createdAt ephemeral signal user { displayName } ${AGENT_ACTIVITY_CONTENT} }
      pageInfo { hasNextPage endCursor }
    }
  }
}`;

export const AGENT_SESSION_LIST = `query LinearAgentSessionList($first: Int, $after: String, $includeArchived: Boolean) {
  agentSessions(first: $first, after: $after, includeArchived: $includeArchived) {
    nodes { ${AGENT_SESSION_FIELDS} }
    pageInfo { hasNextPage endCursor }
  }
}`;

export const AGENT_SESSION_CREATE_ON_ISSUE = `mutation LinearAgentSessionCreateOnIssue($input: AgentSessionCreateOnIssue!) {
  agentSessionCreateOnIssue(input: $input) { success agentSession { id } }
}`;

export const AGENT_SESSION_CREATE_ON_COMMENT = `mutation LinearAgentSessionCreateOnComment($input: AgentSessionCreateOnComment!) {
  agentSessionCreateOnComment(input: $input) { success agentSession { id } }
}`;

export const AGENT_SESSION_UPDATE = `mutation LinearAgentSessionUpdate($id: String!, $input: AgentSessionUpdateInput!) {
  agentSessionUpdate(id: $id, input: $input) { success agentSession { id } }
}`;

export const AGENT_ACTIVITY_CREATE = `mutation LinearAgentActivityCreate($input: AgentActivityCreateInput!) {
  agentActivityCreate(input: $input) { success agentActivity { id } }
}`;

export const AGENT_ACTIVITY_GET = `query LinearAgentActivityGet($id: String!) {
  agentActivity(id: $id) {
    id createdAt ephemeral signal
    ${AGENT_ACTIVITY_CONTENT}
    agentSession { id slugId url status }
  }
}`;

/** Every hand-written document in this module, for schema validation in tests. */
export const OP_DOCUMENTS: Record<string, string> = {
 ISSUE_GET,
 ISSUE_DETAIL_GET,
 TEAM_GET,
 ISSUE_WITH_RELATIONS_GET,
 COMMENT_GET,
 PROJECT_GET,
 MILESTONE_GET,
 ISSUE_CREATE,
 ISSUE_UPDATE,
 COMMENT_CREATE,
 RELATION_CREATE,
 PROJECT_CREATE,
 PROJECT_UPDATE,
 MILESTONE_CREATE,
 MILESTONE_UPDATE,
 ISSUE_SEARCH,
 ISSUE_CREATED_GET,
 ISSUE_LIST,
 PROJECT_STATUS_POST,
 PROJECT_STATUS_GET,
 ISSUE_LINK_ADD,
 ATTACHMENT_GET,
 DOCUMENT_CREATE,
 DOCUMENT_UPDATE,
 DOCUMENT_GET,
 AGENT_SESSION_GET,
 AGENT_SESSION_LIST,
 AGENT_SESSION_CREATE_ON_ISSUE,
 AGENT_SESSION_CREATE_ON_COMMENT,
 AGENT_SESSION_UPDATE,
 AGENT_ACTIVITY_CREATE,
 AGENT_ACTIVITY_GET,
};

function record(value: unknown, field: string, context: string): Record<string, unknown> {
 if (typeof value !== "object" || value === null || !(field in value)) {
  throw new Error(`${context}: linear response is missing "${field}"`);
 }
 const nested = (value as Record<string, unknown>)[field];
 if (typeof nested !== "object" || nested === null) {
  throw new Error(`${context}: linear response field "${field}" is not an object`);
 }
 return nested as Record<string, unknown>;
}

function text(value: unknown, field: string, context: string): string {
 const nested =
  typeof value === "object" && value !== null && field in value
   ? (value as Record<string, unknown>)[field]
   : undefined;
 if (typeof nested !== "string") throw new Error(`${context}: expected string "${field}"`);
 return nested;
}

/**
 * Runs one mutation and returns the id of the entity it produced.
 *
 * Two failure modes must never be confused: a rejected mutation changed
 * nothing, while a mutation whose response never arrived may already have been
 * applied. In the second case we refuse to refetch or retry and say so, because
 * a blind refetch would report "nothing changed" for a write that did land.
 */
async function mutateForId(
 client: LinearClient,
 document: string,
 variables: Record<string, unknown>,
 payloadField: string,
 entityField: string,
): Promise<string> {
 const result = await client.execute(document, variables);
 if (!result.ok) {
  if (result.outcome === "unknown") {
   throw new Error(
    `${payloadField}: outcome unknown — the mutation was sent and no trustworthy response arrived (${result.kind}: ${result.message}); it may or may not have been applied, so it was neither retried nor refetched — check Linear`,
   );
  }
  throw new Error(`${payloadField} failed (${result.kind}): ${result.message}`);
 }
 const data = result.data;
 if (typeof data !== "object" || data === null) {
  throw new Error(`${payloadField}: mutation returned a non-object data payload`);
 }
 // Every payload root is checked, not just the one we read the id from:
 // a multi-root mutation can fail partially.
 for (const [root, value] of Object.entries(data)) {
  if (typeof value === "object" && value !== null && "success" in value && value.success === false) {
   throw new Error(`${root} reported success: false`);
  }
 }
 const payload = record(data, payloadField, payloadField);
 return text(record(payload, entityField, payloadField), "id", payloadField);
}

function optionalString(args: Record<string, unknown>, key: string): string | undefined {
 const value = args[key];
 if (value === undefined || value === null) return undefined;
 if (typeof value !== "string") throw new Error(`argument "${key}" must be a string`);
 return value;
}

function requiredString(args: Record<string, unknown>, key: string): string {
 const value = optionalString(args, key);
 if (value === undefined) throw new Error(`argument "${key}" is required`);
 return value;
}

function stringList(args: Record<string, unknown>, key: string): string[] | undefined {
 const value = args[key];
 if (value === undefined || value === null) return undefined;
 if (!Array.isArray(value) || value.some(entry => typeof entry !== "string")) {
  throw new Error(`argument "${key}" must be a list of strings`);
 }
 return value as string[];
}

function optionalNumber(args: Record<string, unknown>, key: string): number | undefined {
 const value = args[key];
 if (value === undefined || value === null) return undefined;
 if (typeof value !== "number") throw new Error(`argument "${key}" must be a number`);
 return value;
}

function optionalBoolean(args: Record<string, unknown>, key: string): boolean | undefined {
 const value = args[key];
 if (value === undefined || value === null) return undefined;
 if (typeof value !== "boolean") throw new Error(`argument "${key}" must be a boolean`);
 return value;
}

/** Optimistic precondition; Linear offers no compare-and-set, so this races by design. */
function assertExpected(
 issue: Record<string, unknown>,
 args: Record<string, unknown>,
 reference: string,
): void {
 const expectedState = optionalString(args, "expectedStateName");
 if (expectedState !== undefined) {
  const observed = text(record(issue, "state", "issue"), "name", "issue.state");
  if (observed !== expectedState) {
   throw new Error(
    `expected ${reference} to be in state ${JSON.stringify(expectedState)}, observed ${JSON.stringify(observed)}`,
   );
  }
 }
 const expectedUpdatedAt = optionalString(args, "expectedUpdatedAt");
 if (expectedUpdatedAt !== undefined) {
  const observed = text(issue, "updatedAt", "issue");
  if (observed !== expectedUpdatedAt) {
   throw new Error(
    `expected ${reference} updatedAt ${JSON.stringify(expectedUpdatedAt)}, observed ${JSON.stringify(observed)}`,
   );
  }
 }
}

const ISSUE_REF = {
 type: "string",
 description: "Issue UUID or identifier such as ABC-12",
} as const;

const EXPECTED_ARGS = {
 expectedStateName: {
  type: "string",
  description: "Fail before mutating unless the issue is currently in this workflow state",
 },
 expectedUpdatedAt: {
  type: "string",
  description: "Fail before mutating unless the issue updatedAt matches this ISO timestamp exactly",
 },
} as const;

const USER_REF = {
 type: "string",
 minLength: 1,
 description: 'User: "me", display name, name, email or UUID',
} as const;

const RELATION_TYPES = ["blocks", "blockedBy", "related", "duplicate"];

interface RelationRequest {
 type: string;
 issue: string;
}

function relationList(args: Record<string, unknown>): RelationRequest[] {
 const value = args.relations;
 if (value === undefined || value === null) return [];
 if (!Array.isArray(value)) throw new Error('argument "relations" must be a list');
 return value.map((entry: unknown) => {
  if (typeof entry !== "object" || entry === null) {
   throw new Error('each relation must be an object with "type" and "issue"');
  }
  const relation = entry as Record<string, unknown>;
  const type = requiredString(relation, "type");
  if (!RELATION_TYPES.includes(type)) {
   throw new Error(`relation type must be one of ${RELATION_TYPES.join(", ")}, got ${JSON.stringify(type)}`);
  }
  return { type, issue: requiredString(relation, "issue") };
 });
}

/**
 * Creates relations of an already created issue one by one. A failure stops the
 * rest and reports what exists, because the issue itself is not rolled back.
 */
async function createRelations(
 client: LinearClient,
 issueId: string,
 relations: (RelationRequest & { otherId: string })[],
): Promise<void> {
 const label = (relation: RelationRequest) => `${relation.type} ${relation.issue}`;
 for (const [index, relation] of relations.entries()) {
  // Linear has no blockedBy type: the other issue blocks the new one.
  const input =
   relation.type === "blockedBy"
    ? { issueId: relation.otherId, relatedIssueId: issueId, type: "blocks" }
    : { issueId, relatedIssueId: relation.otherId, type: relation.type };
  try {
   await mutateForId(client, RELATION_CREATE, { input }, "issueRelationCreate", "issueRelation");
  } catch (error) {
   const created = relations.slice(0, index).map(label);
   const notCreated = relations.slice(index).map(label);
   throw new Error(
    `issue ${issueId} was created, but relation "${label(relation)}" failed: ${(error as Error).message}; relations created: [${created.join(", ")}]; not created: [${notCreated.join(", ")}]`,
   );
  }
 }
}

const issueCreate: ErgonomicOp = {
 name: "linear_issue_create",
 description:
  "Create an issue in a team, resolving team, state, labels, project, milestone, assignee and related issues by key, name or identifier.",
 tier: "write",
 parameters: {
  type: "object",
  properties: {
   team: { type: "string", description: "Team key, name or UUID" },
   title: { type: "string", minLength: 1 },
   description: { type: "string" },
   state: { type: "string", description: "Workflow state name or UUID" },
   labels: { type: "array", items: { type: "string" } },
   project: { type: "string", description: "Project name or UUID" },
   milestone: { type: "string", description: "Project milestone name or UUID; requires project" },
   assignee: USER_REF,
   parentIssue: ISSUE_REF,
   priority: { type: "integer", minimum: 0, maximum: 4 },
   dueDate: { type: "string", description: "ISO date (YYYY-MM-DD)" },
   relations: {
    type: "array",
    description: "Relations created after the issue; blockedBy means the other issue blocks the new one",
    items: {
     type: "object",
     properties: { type: { type: "string", enum: RELATION_TYPES }, issue: ISSUE_REF },
     required: ["type", "issue"],
     additionalProperties: false,
    },
   },
  },
  required: ["team", "title"],
  additionalProperties: false,
 },
 async run(client, args, actorCtx) {
  const teamId = await resolveTeamId(client, requiredString(args, "team"));
  const input: Record<string, unknown> = { teamId, title: requiredString(args, "title") };
  const description = optionalString(args, "description");
  if (description !== undefined) input.description = description;
  const state = optionalString(args, "state");
  if (state !== undefined) input.stateId = await resolveStateId(client, teamId, state);
  const labels = stringList(args, "labels");
  if (labels !== undefined) input.labelIds = await resolveLabelIds(client, labels);
  const project = optionalString(args, "project");
  let projectId: string | undefined;
  if (project !== undefined) {
   projectId = await resolveProjectId(client, project);
   input.projectId = projectId;
  }
  const milestone = optionalString(args, "milestone");
  if (milestone !== undefined) {
   if (projectId === undefined) throw new Error('argument "milestone" requires "project"');
   input.projectMilestoneId = await resolveMilestoneId(client, projectId, milestone);
  }
  const assignee = optionalString(args, "assignee");
  if (assignee !== undefined) input.assigneeId = await resolveUserId(client, assignee);
  const parentIssue = optionalString(args, "parentIssue");
  if (parentIssue !== undefined) input.parentId = await resolveIssueId(client, parentIssue);
  const priority = optionalNumber(args, "priority");
  if (priority !== undefined) input.priority = priority;
  const dueDate = optionalString(args, "dueDate");
  if (dueDate !== undefined) input.dueDate = dueDate;
  // Every relation reference is resolved before the first write.
  const relations = [];
  for (const relation of relationList(args)) {
   relations.push({ ...relation, otherId: await resolveIssueId(client, relation.issue) });
  }
  applyActorAttribution(input, actorCtx);

  const id = await mutateForId(client, ISSUE_CREATE, { input }, "issueCreate", "issue");
  await createRelations(client, id, relations);
  const refetch = relations.length > 0 ? ISSUE_CREATED_GET : ISSUE_GET;
  return { issue: record(await request(client, refetch, { id }), "issue", "issueGet") };
 },
};

const issueUpdate: ErgonomicOp = {
 name: "linear_issue_update",
 description: "Update issue fields, optionally guarded by the expected current state or updatedAt.",
 tier: "write",
 parameters: {
  type: "object",
  properties: {
   issue: ISSUE_REF,
   title: { type: "string" },
   description: { type: "string" },
   state: { type: "string" },
   labels: { type: "array", items: { type: "string" } },
   project: { type: "string" },
   milestone: { type: "string" },
   assignee: USER_REF,
   priority: { type: "integer", minimum: 0, maximum: 4 },
   dueDate: { type: "string" },
   ...EXPECTED_ARGS,
  },
  required: ["issue"],
  additionalProperties: false,
 },
 async run(client, args) {
  const reference = requiredString(args, "issue");
  const id = await resolveIssueId(client, reference);
  const state = optionalString(args, "state");
  const needsCurrent =
   state !== undefined ||
   args.expectedStateName !== undefined ||
   args.expectedUpdatedAt !== undefined;
  let stateId: string | undefined;
  if (needsCurrent) {
   const current = record(await request(client, ISSUE_GET, { id }), "issue", "issueGet");
   assertExpected(current, args, reference);
   if (state !== undefined) {
    const teamId = text(record(current, "team", "issue"), "id", "issue.team");
    stateId = await resolveStateId(client, teamId, state);
   }
  }

  const input: Record<string, unknown> = {};
  const title = optionalString(args, "title");
  if (title !== undefined) input.title = title;
  const description = optionalString(args, "description");
  if (description !== undefined) input.description = description;
  if (stateId !== undefined) input.stateId = stateId;
  const labels = stringList(args, "labels");
  if (labels !== undefined) input.labelIds = await resolveLabelIds(client, labels);
  const project = optionalString(args, "project");
  let projectId: string | undefined;
  if (project !== undefined) {
   projectId = await resolveProjectId(client, project);
   input.projectId = projectId;
  }
  const milestone = optionalString(args, "milestone");
  if (milestone !== undefined) {
   if (projectId === undefined) throw new Error('argument "milestone" requires "project"');
   input.projectMilestoneId = await resolveMilestoneId(client, projectId, milestone);
  }
  const assignee = optionalString(args, "assignee");
  if (assignee !== undefined) input.assigneeId = await resolveUserId(client, assignee);
  const priority = optionalNumber(args, "priority");
  if (priority !== undefined) input.priority = priority;
  const dueDate = optionalString(args, "dueDate");
  if (dueDate !== undefined) input.dueDate = dueDate;
  if (Object.keys(input).length === 0) throw new Error("no issue fields to update");

  await mutateForId(client, ISSUE_UPDATE, { id, input }, "issueUpdate", "issue");
  return { issue: record(await request(client, ISSUE_GET, { id }), "issue", "issueGet") };
 },
};

const issueTransition: ErgonomicOp = {
 name: "linear_issue_transition",
 description: "Move an issue to another workflow state, guarded by the expected current state.",
 tier: "write",
 parameters: {
  type: "object",
  properties: {
   issue: ISSUE_REF,
   targetState: { type: "string", description: "Workflow state name or UUID" },
   expectedStateName: EXPECTED_ARGS.expectedStateName,
   expectedUpdatedAt: EXPECTED_ARGS.expectedUpdatedAt,
  },
  required: ["issue", "targetState"],
  additionalProperties: false,
 },
 async run(client, args) {
  const reference = requiredString(args, "issue");
  const id = await resolveIssueId(client, reference);
  const current = record(await request(client, ISSUE_GET, { id }), "issue", "issueGet");
  assertExpected(current, args, reference);
  const teamId = text(record(current, "team", "issue"), "id", "issue.team");
  const stateId = await resolveStateId(client, teamId, requiredString(args, "targetState"));
  await mutateForId(client, ISSUE_UPDATE, { id, input: { stateId } }, "issueUpdate", "issue");
  const refetched = record(await request(client, ISSUE_GET, { id }), "issue", "issueGet");
  return {
   issue: refetched,
   requestedState: args.targetState,
   observedState: record(refetched, "state", "issue").name,
  };
 },
};

const issueGet: ErgonomicOp = {
 name: "linear_issue_get",
 description:
  "Fetch one issue with its state, team, assignee, project, milestone, labels, the 20 newest comments (newest first) and its relations in both directions (relations: this issue → other; inverseRelations: other → this issue).",
 tier: "read",
 parameters: {
  type: "object",
  properties: { issue: ISSUE_REF },
  required: ["issue"],
  additionalProperties: false,
 },
 async run(client, args) {
  const id = await resolveIssueId(client, requiredString(args, "issue"));
  return { issue: record(await request(client, ISSUE_DETAIL_GET, { id }), "issue", "issueGet") };
 },
};

const issueCommentAdd: ErgonomicOp = {
 name: "linear_issue_comment_add",
 description: "Add a comment to an issue and return the stored comment.",
 tier: "write",
 parameters: {
  type: "object",
  properties: {
   issue: ISSUE_REF,
   body: { type: "string", minLength: 1 },
  },
  required: ["issue", "body"],
  additionalProperties: false,
 },
 async run(client, args, actorCtx) {
  const issueId = await resolveIssueId(client, requiredString(args, "issue"));
  const input: Record<string, unknown> = { issueId, body: requiredString(args, "body") };
  applyActorAttribution(input, actorCtx);
  const id = await mutateForId(client, COMMENT_CREATE, { input }, "commentCreate", "comment");
  return { comment: record(await request(client, COMMENT_GET, { id }), "comment", "commentGet") };
 },
};

const issueRelationAdd: ErgonomicOp = {
 name: "linear_issue_relation_add",
 description: "Relate two issues (blocks, duplicate, related, similar) and return the updated issue.",
 tier: "write",
 parameters: {
  type: "object",
  properties: {
   issue: ISSUE_REF,
   relatedIssue: ISSUE_REF,
   type: { type: "string", enum: ["blocks", "duplicate", "related", "similar"] },
  },
  required: ["issue", "relatedIssue", "type"],
  additionalProperties: false,
 },
 async run(client, args) {
  const issueId = await resolveIssueId(client, requiredString(args, "issue"));
  const relatedIssueId = await resolveIssueId(client, requiredString(args, "relatedIssue"));
  const type = requiredString(args, "type");
  await mutateForId(
   client,
   RELATION_CREATE,
   { input: { issueId, relatedIssueId, type } },
   "issueRelationCreate",
   "issueRelation",
  );
  return {
   issue: record(
    await request(client, ISSUE_WITH_RELATIONS_GET, { id: issueId }),
    "issue",
    "issueGet",
   ),
  };
 },
};

const projectCreate: ErgonomicOp = {
 name: "linear_project_create",
 description: "Create a project for one or more teams, resolving team keys or names.",
 tier: "write",
 parameters: {
  type: "object",
  properties: {
   name: { type: "string", minLength: 1 },
   teams: { type: "array", items: { type: "string" }, minItems: 1 },
   description: { type: "string" },
   lead: USER_REF,
   startDate: { type: "string" },
   targetDate: { type: "string" },
  },
  required: ["name", "teams"],
  additionalProperties: false,
 },
 async run(client, args) {
  const teams = stringList(args, "teams");
  if (teams === undefined || teams.length === 0) throw new Error('argument "teams" is required');
  const teamIds: string[] = [];
  for (const team of teams) teamIds.push(await resolveTeamId(client, team));
  const input: Record<string, unknown> = { name: requiredString(args, "name"), teamIds };
  const description = optionalString(args, "description");
  if (description !== undefined) input.description = description;
  const lead = optionalString(args, "lead");
  if (lead !== undefined) input.leadId = await resolveUserId(client, lead);
  const startDate = optionalString(args, "startDate");
  if (startDate !== undefined) input.startDate = startDate;
  const targetDate = optionalString(args, "targetDate");
  if (targetDate !== undefined) input.targetDate = targetDate;
  const id = await mutateForId(client, PROJECT_CREATE, { input }, "projectCreate", "project");
  return { project: record(await request(client, PROJECT_GET, { id }), "project", "projectGet") };
 },
};

const projectUpdate: ErgonomicOp = {
 name: "linear_project_update",
 description: "Update project fields, optionally guarded by the expected updatedAt.",
 tier: "write",
 parameters: {
  type: "object",
  properties: {
   project: { type: "string", description: "Project name or UUID" },
   name: { type: "string" },
   description: { type: "string" },
   lead: USER_REF,
   startDate: { type: "string" },
   targetDate: { type: "string" },
   expectedUpdatedAt: EXPECTED_ARGS.expectedUpdatedAt,
  },
  required: ["project"],
  additionalProperties: false,
 },
 async run(client, args) {
  const reference = requiredString(args, "project");
  const id = await resolveProjectId(client, reference);
  const expectedUpdatedAt = optionalString(args, "expectedUpdatedAt");
  if (expectedUpdatedAt !== undefined) {
   const current = record(await request(client, PROJECT_GET, { id }), "project", "projectGet");
   const observed = text(current, "updatedAt", "project");
   if (observed !== expectedUpdatedAt) {
    throw new Error(
     `expected ${reference} updatedAt ${JSON.stringify(expectedUpdatedAt)}, observed ${JSON.stringify(observed)}`,
    );
   }
  }
  const input: Record<string, unknown> = {};
  const name = optionalString(args, "name");
  if (name !== undefined) input.name = name;
  const description = optionalString(args, "description");
  if (description !== undefined) input.description = description;
  const lead = optionalString(args, "lead");
  if (lead !== undefined) input.leadId = await resolveUserId(client, lead);
  const startDate = optionalString(args, "startDate");
  if (startDate !== undefined) input.startDate = startDate;
  const targetDate = optionalString(args, "targetDate");
  if (targetDate !== undefined) input.targetDate = targetDate;
  if (Object.keys(input).length === 0) throw new Error("no project fields to update");
  await mutateForId(client, PROJECT_UPDATE, { id, input }, "projectUpdate", "project");
  return { project: record(await request(client, PROJECT_GET, { id }), "project", "projectGet") };
 },
};

const projectGet: ErgonomicOp = {
 name: "linear_project_get",
 description: "Fetch one project with its status, lead, teams and milestones.",
 tier: "read",
 parameters: {
  type: "object",
  properties: { project: { type: "string", description: "Project name or UUID" } },
  required: ["project"],
  additionalProperties: false,
 },
 async run(client, args) {
  const id = await resolveProjectId(client, requiredString(args, "project"));
  return { project: record(await request(client, PROJECT_GET, { id }), "project", "projectGet") };
 },
};

const milestoneCreate: ErgonomicOp = {
 name: "linear_milestone_create",
 description: "Create a milestone inside a project.",
 tier: "write",
 parameters: {
  type: "object",
  properties: {
   project: { type: "string", description: "Project name or UUID" },
   name: { type: "string", minLength: 1 },
   description: { type: "string" },
   targetDate: { type: "string" },
  },
  required: ["project", "name"],
  additionalProperties: false,
 },
 async run(client, args) {
  const projectId = await resolveProjectId(client, requiredString(args, "project"));
  const input: Record<string, unknown> = { projectId, name: requiredString(args, "name") };
  const description = optionalString(args, "description");
  if (description !== undefined) input.description = description;
  const targetDate = optionalString(args, "targetDate");
  if (targetDate !== undefined) input.targetDate = targetDate;
  const id = await mutateForId(
   client,
   MILESTONE_CREATE,
   { input },
   "projectMilestoneCreate",
   "projectMilestone",
  );
  return {
   milestone: record(await request(client, MILESTONE_GET, { id }), "projectMilestone", "milestoneGet"),
  };
 },
};

const milestoneUpdate: ErgonomicOp = {
 name: "linear_milestone_update",
 description: "Update a project milestone; the milestone is resolved by name inside its project.",
 tier: "write",
 parameters: {
  type: "object",
  properties: {
   project: { type: "string", description: "Project name or UUID; required unless milestone is a UUID" },
   milestone: { type: "string", description: "Milestone name or UUID" },
   name: { type: "string" },
   description: { type: "string" },
   targetDate: { type: "string" },
  },
  required: ["milestone"],
  additionalProperties: false,
 },
 async run(client, args) {
  const milestone = requiredString(args, "milestone");
  const project = optionalString(args, "project");
  let id: string;
  if (UUID_PATTERN.test(milestone)) {
   id = milestone;
  } else {
   if (project === undefined) {
    throw new Error('argument "project" is required unless "milestone" is a UUID');
   }
   id = await resolveMilestoneId(client, await resolveProjectId(client, project), milestone);
  }
  const input: Record<string, unknown> = {};
  const name = optionalString(args, "name");
  if (name !== undefined) input.name = name;
  const description = optionalString(args, "description");
  if (description !== undefined) input.description = description;
  const targetDate = optionalString(args, "targetDate");
  if (targetDate !== undefined) input.targetDate = targetDate;
  if (Object.keys(input).length === 0) throw new Error("no milestone fields to update");
  await mutateForId(
   client,
   MILESTONE_UPDATE,
   { id, input },
   "projectMilestoneUpdate",
   "projectMilestone",
  );
  return {
   milestone: record(await request(client, MILESTONE_GET, { id }), "projectMilestone", "milestoneGet"),
  };
 },
};

const STATE_TYPES = ["triage", "backlog", "unstarted", "started", "completed", "canceled"];

async function issueFilter(
 client: LinearClient,
 args: Record<string, unknown>,
): Promise<Record<string, unknown> | null> {
 const filter: Record<string, unknown> = {};
 const teamKey = optionalString(args, "teamKey");
 if (teamKey !== undefined) filter.team = { key: { eq: teamKey } };
 const state: Record<string, unknown> = {};
 const stateName = optionalString(args, "stateName");
 if (stateName !== undefined) state.name = { eq: stateName };
 const stateTypes = stringList(args, "stateTypes");
 if (stateTypes !== undefined) state.type = { in: stateTypes };
 if (Object.keys(state).length > 0) filter.state = state;
 const assignee = optionalString(args, "assignee");
 if (assignee !== undefined) {
  filter.assignee =
   assignee.toLowerCase() === "me"
    ? { isMe: { eq: true } }
    : { id: { eq: await resolveUserId(client, assignee) } };
 }
 const project = optionalString(args, "project");
 if (project !== undefined) filter.project = { id: { eq: await resolveProjectId(client, project) } };
 const priority = optionalNumber(args, "priority");
 if (priority !== undefined) {
  if (!Number.isInteger(priority) || priority < 0 || priority > 4) {
   throw new Error('argument "priority" must be an integer from 0 to 4');
  }
  filter.priority = { eq: priority };
 }
 const labels = stringList(args, "labels");
 if (labels !== undefined && labels.length > 0) {
  filter.labels = { some: { or: labels.map(name => ({ name: { eqIgnoreCase: name } })) } };
 }
 const staleDays = optionalNumber(args, "staleDays");
 if (staleDays !== undefined) {
  if (!Number.isInteger(staleDays) || staleDays < 1) {
   throw new Error('argument "staleDays" must be an integer >= 1');
  }
  filter.updatedAt = { lt: `-P${staleDays}D` };
 }
 return Object.keys(filter).length === 0 ? null : filter;
}

const searchIssues: ErgonomicOp = {
 name: "linear_issue_search",
 description:
  'Search or list issues in one bounded page, filtered by team key, state, assignee ("me", name or UUID), project (name or UUID), priority, labels and staleness.',
 tier: "read",
 parameters: {
  type: "object",
  properties: {
   query: { type: "string", description: "Full-text query; omit to list issues by filter only" },
   teamKey: { type: "string", description: "Team key such as ABC" },
   stateName: { type: "string", description: "Workflow state name such as In Progress" },
   stateTypes: { type: "array", items: { type: "string", enum: STATE_TYPES } },
   assignee: USER_REF,
   project: { type: "string", description: "Project name or UUID" },
   priority: { type: "integer", minimum: 0, maximum: 4, description: "Exact priority: 0 none, 1 urgent, 2 high, 3 medium, 4 low" },
   labels: { type: "array", items: { type: "string" }, description: "Label names; an issue matches when it has any of them (case-insensitive)" },
   staleDays: { type: "integer", minimum: 1, description: "Only issues not updated in this many days" },
   first: { type: "integer", minimum: 1, maximum: 100, default: 25 },
   after: { type: "string", description: "Cursor from a previous pageInfo.endCursor" },
   includeArchived: { type: "boolean" },
  },
  additionalProperties: false,
 },
 async run(client, args) {
  const query = optionalString(args, "query");
  const variables = {
   filter: await issueFilter(client, args),
   // A model may ask for more than Linear will ever return in one page.
   first: Math.min(optionalNumber(args, "first") ?? 25, 100),
   after: optionalString(args, "after") ?? null,
   includeArchived: args.includeArchived === true,
  };
  const root = query === undefined ? "issues" : "searchIssues";
  const data =
   query === undefined
    ? await request(client, ISSUE_LIST, variables)
    : await request(client, ISSUE_SEARCH, { term: query, ...variables });
  return {
   nodes: connectionNodes(data, root),
   pageInfo: record(record(data, root, root), "pageInfo", root),
  };
 },
};

const projectStatusPost: ErgonomicOp = {
 name: "linear_project_status_post",
 description: "Post a project status update with a health of onTrack, atRisk or offTrack; the project is a name or UUID.",
 tier: "write",
 parameters: {
  type: "object",
  properties: {
   project: { type: "string", description: "Project name or UUID" },
   body: { type: "string", minLength: 1, description: "Markdown body of the update" },
   health: { type: "string", enum: ["onTrack", "atRisk", "offTrack"] },
  },
  required: ["project", "body", "health"],
  additionalProperties: false,
 },
 async run(client, args) {
  const projectId = await resolveProjectId(client, requiredString(args, "project"));
  const input = { projectId, body: requiredString(args, "body"), health: requiredString(args, "health") };
  const id = await mutateForId(client, PROJECT_STATUS_POST, { input }, "projectUpdateCreate", "projectUpdate");
  return {
   projectUpdate: record(await request(client, PROJECT_STATUS_GET, { id }), "projectUpdate", "projectUpdateGet"),
  };
 },
};

const issueLinkAdd: ErgonomicOp = {
 name: "linear_issue_link_add",
 description: "Attach a URL such as a pull request or commit link to an issue given by UUID or identifier like ABC-12.",
 tier: "write",
 parameters: {
  type: "object",
  properties: {
   issue: ISSUE_REF,
   url: { type: "string", minLength: 1 },
   title: { type: "string", description: "Link title; Linear derives one from the URL when omitted" },
  },
  required: ["issue", "url"],
  additionalProperties: false,
 },
 async run(client, args, actorCtx) {
  const issueId = await resolveIssueId(client, requiredString(args, "issue"));
  const variables: Record<string, unknown> = { issueId, url: requiredString(args, "url") };
  const title = optionalString(args, "title");
  if (title !== undefined) variables.title = title;
  applyActorAttribution(variables, actorCtx);
  const id = await mutateForId(client, ISSUE_LINK_ADD, variables, "attachmentLinkURL", "attachment");
  return { attachment: record(await request(client, ATTACHMENT_GET, { id }), "attachment", "attachmentGet") };
 },
};

const DOCUMENT_REF = { type: "string", description: "Document UUID, slug ID or exact title" } as const;

async function documentResult(client: LinearClient, id: string) {
 return { document: record(await request(client, DOCUMENT_GET, { id }), "document", "documentGet") };
}

const documentCreate: ErgonomicOp = {
 name: "linear_document_create",
 description: "Create a markdown document, optionally attached to a project (name or UUID) or an issue (UUID or identifier).",
 tier: "write",
 parameters: {
  type: "object",
  properties: {
   title: { type: "string", minLength: 1 },
   content: { type: "string", description: "Markdown content" },
   project: { type: "string", description: "Project name or UUID" },
   issue: ISSUE_REF,
  },
  required: ["title"],
  additionalProperties: false,
 },
 async run(client, args) {
  const input: Record<string, unknown> = { title: requiredString(args, "title") };
  const content = optionalString(args, "content");
  if (content !== undefined) input.content = content;
  const project = optionalString(args, "project");
  if (project !== undefined) input.projectId = await resolveProjectId(client, project);
  const issue = optionalString(args, "issue");
  if (issue !== undefined) input.issueId = await resolveIssueId(client, issue);
  const id = await mutateForId(client, DOCUMENT_CREATE, { input }, "documentCreate", "document");
  return documentResult(client, id);
 },
};

const documentUpdate: ErgonomicOp = {
 name: "linear_document_update",
 description: "Change the title or markdown content of a document given by UUID, slug ID or exact title.",
 tier: "write",
 parameters: {
  type: "object",
  properties: {
   document: DOCUMENT_REF,
   title: { type: "string", minLength: 1 },
   content: { type: "string", description: "Markdown content; replaces the whole document body" },
  },
  required: ["document"],
  additionalProperties: false,
 },
 async run(client, args) {
  const input: Record<string, unknown> = {};
  const title = optionalString(args, "title");
  if (title !== undefined) input.title = title;
  const content = optionalString(args, "content");
  if (content !== undefined) input.content = content;
  if (Object.keys(input).length === 0) throw new Error('argument "title" or "content" is required');
  const id = await resolveDocumentId(client, requiredString(args, "document"));
  await mutateForId(client, DOCUMENT_UPDATE, { id, input }, "documentUpdate", "document");
  return documentResult(client, id);
 },
};

const documentGet: ErgonomicOp = {
 name: "linear_document_get",
 description: "Fetch one document with its markdown content, given by UUID, slug ID or exact title.",
 tier: "read",
 parameters: {
  type: "object",
  properties: { document: DOCUMENT_REF },
  required: ["document"],
  additionalProperties: false,
 },
 async run(client, args) {
  return documentResult(client, await resolveDocumentId(client, requiredString(args, "document")));
 },
};

const teamGet: ErgonomicOp = {
 name: "linear_team_get",
 description:
  "Fetch one team with its workflow states (name, type, position), team labels and members. Use the names it returns for issue states, labels and assignees.",
 tier: "read",
 parameters: {
  type: "object",
  properties: { team: { type: "string", description: "Team key (ENG), name or UUID" } },
  required: ["team"],
  additionalProperties: false,
 },
 async run(client, args) {
  const id = await resolveTeamId(client, requiredString(args, "team"));
  return { team: record(await request(client, TEAM_GET, { id }), "team", "teamGet") };
 },
};

const APP_ONLY =
 " Needs an actor=app connection (OAuth app login): Linear rejects agent session writes from a personal API key.";

const AGENT_SESSION_REF = {
 type: "string",
 minLength: 1,
 description: "Agent session UUID or the slug from its URL",
} as const;

const EXTERNAL_LINKS = {
 type: "array",
 items: {
  type: "object",
  properties: {
   url: { type: "string", minLength: 1 },
   label: { type: "string", minLength: 1 },
  },
  required: ["url", "label"],
  additionalProperties: false,
 },
} as const;

const PLAN_STATUSES = ["pending", "inProgress", "completed", "canceled"] as const;
const ACTIVITY_TYPES = ["thought", "action", "response", "elicitation", "error"] as const;

function externalLinks(args: Record<string, unknown>, key: string): { url: string; label: string }[] | undefined {
 const value = args[key];
 if (value === undefined || value === null) return undefined;
 const message = `argument "${key}" must be a list of {url, label} objects`;
 if (!Array.isArray(value)) throw new Error(message);
 return value.map(entry => {
  if (typeof entry !== "object" || entry === null) throw new Error(message);
  const { url, label } = entry as Record<string, unknown>;
  if (typeof url !== "string" || typeof label !== "string") throw new Error(message);
  return { url, label };
 });
}

function agentPlan(args: Record<string, unknown>): { content: string; status: string }[] | undefined {
 const value = args.plan;
 if (value === undefined || value === null) return undefined;
 const message = `argument "plan" must be a list of {content, status} with status one of ${PLAN_STATUSES.join(", ")}`;
 if (!Array.isArray(value) || value.length === 0) throw new Error(message);
 return value.map(entry => {
  if (typeof entry !== "object" || entry === null) throw new Error(message);
  const { content, status } = entry as Record<string, unknown>;
  if (typeof content !== "string" || !PLAN_STATUSES.includes(status as (typeof PLAN_STATUSES)[number])) {
   throw new Error(message);
  }
  return { content, status: status as string };
 });
}

async function agentSessionResult(client: LinearClient, id: string): Promise<unknown> {
 return {
  agentSession: record(await request(client, AGENT_SESSION_GET, { id }), "agentSession", "agentSessionGet"),
 };
}

const agentSessionStart: ErgonomicOp = {
 name: "linear_agent_session_start",
 description:
  "Start a Linear agent session on an issue or on a root comment, so Linear shows the agent's work there; report progress with linear_agent_activity_add." +
  APP_ONLY,
 tier: "write",
 onDemand: true,
 parameters: {
  type: "object",
  properties: {
   issue: ISSUE_REF,
   comment: { type: "string", minLength: 1, description: "Root comment UUID; pass this or issue, not both" },
   externalLinks: { ...EXTERNAL_LINKS, description: "Links shown on the session, such as a dashboard or a pull request" },
  },
  additionalProperties: false,
 },
 async run(client, args) {
  const issue = optionalString(args, "issue");
  const comment = optionalString(args, "comment");
  if ((issue === undefined) === (comment === undefined)) throw new Error('pass exactly one of "issue" or "comment"');
  const links = externalLinks(args, "externalLinks");
  // agentSessionCreateOnIssue accepts an identifier such as ENG-123 directly.
  const input: Record<string, unknown> = issue !== undefined ? { issueId: issue } : { commentId: comment };
  if (links !== undefined) input.externalUrls = links;
  const id =
   issue !== undefined
    ? await mutateForId(client, AGENT_SESSION_CREATE_ON_ISSUE, { input }, "agentSessionCreateOnIssue", "agentSession")
    : await mutateForId(client, AGENT_SESSION_CREATE_ON_COMMENT, { input }, "agentSessionCreateOnComment", "agentSession");
  return agentSessionResult(client, id);
 },
};

const agentSessionGet: ErgonomicOp = {
 name: "linear_agent_session_get",
 description:
  "Fetch one agent session: status, summary, plan, issue, comment, links, context and the 20 newest activities (newest first).",
 tier: "read",
 onDemand: true,
 parameters: {
  type: "object",
  properties: { session: AGENT_SESSION_REF },
  required: ["session"],
  additionalProperties: false,
 },
 async run(client, args) {
  return agentSessionResult(client, requiredString(args, "session"));
 },
};

const agentSessionList: ErgonomicOp = {
 name: "linear_agent_session_list",
 description:
  "List agent sessions visible to this connection in one bounded page, with status, summary and issue. Linear offers no filter for this list.",
 tier: "read",
 onDemand: true,
 parameters: {
  type: "object",
  properties: {
   first: { type: "integer", minimum: 1, maximum: 50, default: 25 },
   after: { type: "string", description: "Cursor from a previous pageInfo.endCursor" },
   includeArchived: { type: "boolean" },
  },
  additionalProperties: false,
 },
 async run(client, args) {
  const data = await request(client, AGENT_SESSION_LIST, {
   first: Math.min(optionalNumber(args, "first") ?? 25, 50),
   after: optionalString(args, "after") ?? null,
   includeArchived: optionalBoolean(args, "includeArchived") === true,
  });
  const connection = record(data, "agentSessions", "agentSessionList");
  return { agentSessions: connection.nodes, pageInfo: connection.pageInfo };
 },
};

const agentActivityAdd: ErgonomicOp = {
 name: "linear_agent_activity_add",
 description:
  "Post an activity to an agent session; Linear derives the session status from the latest one. thought: progress note. action: a tool step (action, parameter, optional result). elicitation: ask the user, the session waits for input. response: final answer, ends the turn unless continueTurn. error: the turn failed." +
  APP_ONLY,
 tier: "write",
 onDemand: true,
 parameters: {
  type: "object",
  properties: {
   session: AGENT_SESSION_REF,
   type: { type: "string", enum: [...ACTIVITY_TYPES] },
   body: { type: "string", minLength: 1, description: "Markdown; required for every type except action" },
   action: { type: "string", minLength: 1, description: "Action label such as Searching; action type only" },
   parameter: { type: "string", description: "What the action works on; action type only" },
   result: { type: "string", description: "Markdown result of a finished action; action type only" },
   ephemeral: { type: "boolean", description: "Replace this activity with the next one; thought and action only" },
   continueTurn: { type: "boolean", description: "Keep the turn active after a response; response only" },
  },
  required: ["session", "type"],
  additionalProperties: false,
 },
 async run(client, args) {
  const type = requiredString(args, "type");
  if (!ACTIVITY_TYPES.includes(type as (typeof ACTIVITY_TYPES)[number])) {
   throw new Error(`argument "type" must be one of ${ACTIVITY_TYPES.join(", ")}`);
  }
  const body = optionalString(args, "body");
  const actionFields = ["action", "parameter", "result"].filter(key => args[key] !== undefined && args[key] !== null);
  let content: Record<string, unknown>;
  if (type === "action") {
   if (body !== undefined) throw new Error('an action takes "action", "parameter" and "result", not "body"');
   content = { type, action: requiredString(args, "action"), parameter: requiredString(args, "parameter") };
   const result = optionalString(args, "result");
   if (result !== undefined) content.result = result;
  } else {
   if (actionFields.length > 0) throw new Error(`"${actionFields.join('", "')}" apply only to an action`);
   if (body === undefined) throw new Error(`a ${type} needs "body"`);
   content = { type, body };
  }
  const ephemeral = optionalBoolean(args, "ephemeral");
  if (ephemeral === true && type !== "thought" && type !== "action") {
   throw new Error('"ephemeral" applies only to a thought or an action');
  }
  const continueTurn = optionalBoolean(args, "continueTurn");
  if (continueTurn === true && type !== "response") throw new Error('"continueTurn" applies only to a response');
  const input: Record<string, unknown> = {
   agentSessionId: await resolveAgentSessionId(client, requiredString(args, "session")),
   content,
  };
  if (ephemeral === true) input.ephemeral = true;
  if (continueTurn === true) input.signal = "continue";
  const id = await mutateForId(client, AGENT_ACTIVITY_CREATE, { input }, "agentActivityCreate", "agentActivity");
  return {
   agentActivity: record(await request(client, AGENT_ACTIVITY_GET, { id }), "agentActivity", "agentActivityGet"),
  };
 },
};

const agentSessionUpdate: ErgonomicOp = {
 name: "linear_agent_session_update",
 description:
  "Update an agent session: summary, the whole plan checklist (it replaces the previous plan), and links to add or remove. Status follows activities, not this tool." +
  APP_ONLY,
 tier: "write",
 onDemand: true,
 parameters: {
  type: "object",
  properties: {
   session: AGENT_SESSION_REF,
   summary: { type: "string" },
   plan: {
    type: "array",
    minItems: 1,
    maxItems: 100,
    description: "The full plan; replaces the previous one",
    items: {
     type: "object",
     properties: {
      content: { type: "string", minLength: 1 },
      status: { type: "string", enum: [...PLAN_STATUSES] },
     },
     required: ["content", "status"],
     additionalProperties: false,
    },
   },
   addExternalLinks: { ...EXTERNAL_LINKS, description: "Links to add, such as a pull request" },
   removeExternalLinks: { type: "array", items: { type: "string" }, description: "URLs of links to remove" },
  },
  required: ["session"],
  additionalProperties: false,
 },
 async run(client, args) {
  const input: Record<string, unknown> = {};
  const summary = optionalString(args, "summary");
  if (summary !== undefined) input.summary = summary;
  const plan = agentPlan(args);
  if (plan !== undefined) input.plan = plan;
  const added = externalLinks(args, "addExternalLinks");
  if (added !== undefined) input.addedExternalUrls = added;
  const removed = stringList(args, "removeExternalLinks");
  if (removed !== undefined) input.removedExternalUrls = removed;
  if (Object.keys(input).length === 0) {
   throw new Error('pass at least one of "summary", "plan", "addExternalLinks" or "removeExternalLinks"');
  }
  const id = await resolveAgentSessionId(client, requiredString(args, "session"));
  await mutateForId(client, AGENT_SESSION_UPDATE, { id, input }, "agentSessionUpdate", "agentSession");
  return agentSessionResult(client, id);
 },
};

export const ergonomicOps: ErgonomicOp[] = [
 issueCreate,
 issueUpdate,
 issueTransition,
 issueGet,
 issueCommentAdd,
 issueRelationAdd,
 issueLinkAdd,
 projectCreate,
 projectUpdate,
 projectGet,
 projectStatusPost,
 milestoneCreate,
 milestoneUpdate,
 searchIssues,
 documentCreate,
 documentUpdate,
 documentGet,
 teamGet,
 agentSessionStart,
 agentSessionGet,
 agentSessionList,
 agentActivityAdd,
 agentSessionUpdate,
];
