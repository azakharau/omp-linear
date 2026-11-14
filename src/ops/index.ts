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
 resolveIssueId,
 resolveLabelIds,
 resolveMilestoneId,
 resolveProjectId,
 resolveStateId,
 resolveTeamId,
 UUID_PATTERN,
} from "./resolve.ts";

/**
 * Who the mutation is attributed to. With an `actor=app` connection Linear
 * attributes writes to the OAuth application unless `createAsUser` names the
 * human (or agent) behind them, so the caller supplies that label once.
 */
export interface ActorContext {
 actor: "user" | "app";
 authorLabel: string;
}

export interface ErgonomicOp {
 name: string;
 description: string;
 tier: "read" | "write";
 parameters: Record<string, unknown>;
 run(
  client: LinearClient,
  args: Record<string, unknown>,
  actorCtx: ActorContext,
 ): Promise<unknown>;
}

/**
 * Only these two inputs accept `createAsUser` in the pinned SDL
 * (`IssueCreateInput`, `CommentCreateInput`); project and milestone creation
 * cannot be attributed this way, so those ops stay app-attributed.
 */
function applyActorAttribution(input: Record<string, unknown>, actorCtx: ActorContext): void {
 if (actorCtx.actor === "app") input.createAsUser = actorCtx.authorLabel;
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

export const ISSUE_WITH_RELATIONS_GET = `query LinearIssueRelationsGet($id: String!) {
  issue(id: $id) {
    id identifier updatedAt
    relations(first: 50) { nodes { id type relatedIssue { id identifier title } } }
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

export const ISSUE_SEARCH = `query LinearIssueSearch($query: String, $filter: IssueFilter, $first: Int, $after: String, $includeArchived: Boolean) {
  issueSearch(query: $query, filter: $filter, first: $first, after: $after, includeArchived: $includeArchived) {
    nodes {
      id identifier title url priority updatedAt
      state { name type }
      team { key }
      assignee { displayName }
      project { id name }
    }
    pageInfo { hasNextPage endCursor }
  }
}`;

/** Every hand-written document in this module, for schema validation in tests. */
export const OP_DOCUMENTS: Record<string, string> = {
 ISSUE_GET,
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

const issueCreate: ErgonomicOp = {
 name: "linear_issue_create",
 description: "Create an issue in a team, resolving team, state, labels, project and milestone by name.",
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
   assigneeId: { type: "string" },
   parentIssue: ISSUE_REF,
   priority: { type: "integer", minimum: 0, maximum: 4 },
   dueDate: { type: "string", description: "ISO date (YYYY-MM-DD)" },
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
  const assigneeId = optionalString(args, "assigneeId");
  if (assigneeId !== undefined) input.assigneeId = assigneeId;
  const parentIssue = optionalString(args, "parentIssue");
  if (parentIssue !== undefined) input.parentId = await resolveIssueId(client, parentIssue);
  const priority = optionalNumber(args, "priority");
  if (priority !== undefined) input.priority = priority;
  const dueDate = optionalString(args, "dueDate");
  if (dueDate !== undefined) input.dueDate = dueDate;
  applyActorAttribution(input, actorCtx);

  const id = await mutateForId(client, ISSUE_CREATE, { input }, "issueCreate", "issue");
  return { issue: record(await request(client, ISSUE_GET, { id }), "issue", "issueGet") };
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
   assigneeId: { type: "string" },
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
  const assigneeId = optionalString(args, "assigneeId");
  if (assigneeId !== undefined) input.assigneeId = assigneeId;
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
 description: "Fetch one issue with its state, team, assignee, project, milestone and labels.",
 tier: "read",
 parameters: {
  type: "object",
  properties: { issue: ISSUE_REF },
  required: ["issue"],
  additionalProperties: false,
 },
 async run(client, args) {
  const id = await resolveIssueId(client, requiredString(args, "issue"));
  return { issue: record(await request(client, ISSUE_GET, { id }), "issue", "issueGet") };
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
   leadId: { type: "string" },
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
  const leadId = optionalString(args, "leadId");
  if (leadId !== undefined) input.leadId = leadId;
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
   leadId: { type: "string" },
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
  const leadId = optionalString(args, "leadId");
  if (leadId !== undefined) input.leadId = leadId;
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

const issueSearch: ErgonomicOp = {
 name: "linear_issue_search",
 description:
  "Search issues in one bounded request; team key and state name are passed to the server filter verbatim.",
 tier: "read",
 parameters: {
  type: "object",
  properties: {
   query: { type: "string", description: "Full-text query" },
   teamKey: { type: "string", description: "Team key such as ABC" },
   stateName: { type: "string", description: "Workflow state name such as In Progress" },
   first: { type: "integer", minimum: 1, maximum: 100, default: 25 },
   after: { type: "string", description: "Cursor from a previous pageInfo.endCursor" },
   includeArchived: { type: "boolean" },
  },
  additionalProperties: false,
 },
 async run(client, args) {
  const filter: Record<string, unknown> = {};
  const teamKey = optionalString(args, "teamKey");
  if (teamKey !== undefined) filter.team = { key: { eq: teamKey } };
  const stateName = optionalString(args, "stateName");
  if (stateName !== undefined) filter.state = { name: { eq: stateName } };
  const data = await request(client, ISSUE_SEARCH, {
   query: optionalString(args, "query") ?? null,
   filter: Object.keys(filter).length === 0 ? null : filter,
   // A model may ask for more than Linear will ever return in one page.
   first: Math.min(optionalNumber(args, "first") ?? 25, 100),
   after: optionalString(args, "after") ?? null,
   includeArchived: args.includeArchived === true,
  });
  const connection = record(data, "issueSearch", "issueSearch");
  return {
   nodes: connectionNodes(data, "issueSearch"),
   pageInfo: record(connection, "pageInfo", "issueSearch"),
  };
 },
};

export const ergonomicOps: ErgonomicOp[] = [
 issueCreate,
 issueUpdate,
 issueTransition,
 issueGet,
 issueCommentAdd,
 issueRelationAdd,
 projectCreate,
 projectUpdate,
 projectGet,
 milestoneCreate,
 milestoneUpdate,
 issueSearch,
];
