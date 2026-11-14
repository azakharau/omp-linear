# Native OMP–Linear integration: architecture research

Snapshot date: 2026-09-22. The research made no Linear calls, read no user credentials, made no paid model/provider calls, and changed no live OMP profiles. The only durable result is this report; all executable proof is in the isolated `/tmp/omp-linear-research.Top1xG`.

Claim statuses:

- **SOURCE-OBSERVED** — follows directly from the pinned source or official documentation.
- **EXPERIMENT-OBSERVED** — obtained by an executable offline proof.
- **INFERRED** — a design consequence of observations, not an independent measurement.
- **UNKNOWN** — not checked, or requires a forbidden live experiment.

## 1. Decision

**The target architecture is A, with one narrow boundary for restricted task children.** The main shape stays: a private catalog of 550 Query/Mutation, a visible `linear_tool_search`, and one selected native typed operation. A regular agent `tools:` is the initial active set, not a permission ceiling: the actual unrestricted child, as expected, also saw other essential extension tools. In the real restricted child path, by contrast, OMP fail-closed filtered out **all** prepared-extension tools, including the named `linear_probe_identity`, and kept the extension hook. So there is no proven allowlist bypass in the task path; the full product contract lacks selective admission of permitted Linear extension tools into the restricted child.

Why:

1. **EXPERIMENT-OBSERVED:** a real OMP 18.2.7 loop first sent only `linear_tool_search` from Linear. After it executed, the loop included `linear_issue_create` in the very next provider request. The next search replaced create with update and kept search and an unrelated sentinel tool. Disabling activation made this guarantee fail, as it should.
2. **EXPERIMENT-OBSERVED:** the full catalog of the pinned Linear SDL is 173 Query + 377 Mutation = 550. Set equality of `(rootKind, rootField)` was checked mechanically.
3. **EXPERIMENT-OBSERVED:** the exact recursive JSON Schema of `Query.issues`, with nullable/non-null/list/default semantics preserved, passed OMP validation and the OpenAI Responses serializer; the provider received a 199 233 B schema. No core patch for recursion is needed. The working path is to pass the exact JSON Schema directly as `parameters`, not to convert the full graph through `fromJsonSchema`.
4. **EXPERIMENT-OBSERVED:** A initial — 65 446 B / 17 087 `o200k_base`; A with one operation — 66 067 B / 17 231; all-active — 7 098 074 B / 1 661 830; C/xdev — 125 249 B / 30 259.
5. **EXPERIMENT-OBSERVED / INFERRED:** B = 65 765 B, which is 302 B less than the comparable A-one-active but 319 B more than A-initial. A generic executor loses the native typed call and does not meet the product contract. C remains only an opt-in schema/help surface.

Authorization: a shared project OAuth application plus a personal API key; several saved connections, one explicitly selected per OMP session. The OAuth default is `actor=user`. The optional `actor=app` adds `createAsUser` only to the documented issue/comment creation. Main and each specific child get a separate host-derived display name; two instances of one role do not merge.

## 2. OMP evidence

### 2.1 Registration and activation

- **SOURCE-OBSERVED:** extension API v18.2.7 declares `defaultInactive`, `loadMode`, `getActiveTools`, `getAllTools`, `setActiveTools` in [`packages/coding-agent/src/extensibility/extensions/types.ts:606-610,1419-1420`](https://github.com/can1357/oh-my-pi/blob/d716bcf60ab0a2e7ece1fdf382c0d143fef1f307/packages/coding-agent/src/extensibility/extensions/types.ts#L606-L610).
- **SOURCE-OBSERVED:** the actual mutation goes through a serialized registry mutation and `#applyToolPresentation`, [`session-tools.ts:1500-1511`](https://github.com/can1357/oh-my-pi/blob/d716bcf60ab0a2e7ece1fdf382c0d143fef1f307/packages/coding-agent/src/session/session-tools.ts#L1500-L1511); the extension runtime delegates there in [`runtime-init.ts:106-109`](https://github.com/can1357/oh-my-pi/blob/d716bcf60ab0a2e7ece1fdf382c0d143fef1f307/packages/coding-agent/src/modes/runtime-init.ts#L106-L109).
- **EXPERIMENT-OBSERVED:** five consecutive provider requests had these Linear tool sets: `search`; `search+create`; `search+create`; `search+update`; `search+update`. `unrelated_sentinel` was always present.
- **SOURCE-OBSERVED:** the SDK documents `toolNames` as explicitly requested names, and the separate `restrictToolNames` as a session restriction, [`sdk.ts:571-578`](https://github.com/can1357/oh-my-pi/blob/d716bcf60ab0a2e7ece1fdf382c0d143fef1f307/packages/coding-agent/src/sdk.ts#L571-L578). The task executor passes `toolNames` and prepared extensions separately, [`executor.ts:3708-3752`](https://github.com/can1357/oh-my-pi/blob/d716bcf60ab0a2e7ece1fdf382c0d143fef1f307/packages/coding-agent/src/task/executor.ts#L3708-L3752); under restriction, prepared extensions are kept for their hooks, [`sdk.ts:2201-2214`](https://github.com/can1357/oh-my-pi/blob/d716bcf60ab0a2e7ece1fdf382c0d143fef1f307/packages/coding-agent/src/sdk.ts#L2201-L2214), but their registered tools are not admitted, [`sdk.ts:2902-2915`](https://github.com/can1357/oh-my-pi/blob/d716bcf60ab0a2e7ece1fdf382c0d143fef1f307/packages/coding-agent/src/sdk.ts#L2902-L2915). **EXPERIMENT-OBSERVED:** an unrestricted TaskTool child with `tools: linear_probe_identity` received provider tools `linear_probe_identity,yield,hub,linear_forbidden` — this is initial-selection semantics, not a proven permission bypass. The same actual task path in restricted/plan mode received only `read,grep,glob,web_search,yield`: both extension tools were absent, yet `session_start` still saw the registry identity `LinearChildRestricted`. A selective admission API for permitted plugin tools is required; the current restricted path safely refuses all of them.
- **EXPERIMENT-OBSERVED / SCOPE:** a separate SDK-only control with `allowRestrictedCustomTools:true` registered both custom tools that the caller passed; runtime activation enabled the second one, which was absent from the initial `toolNames`. This is the behavior of trusted SDK input, not of the actual prepared-extension TaskTool path, and it is not used here as evidence of a core permission defect.
- **SOURCE-OBSERVED:** the model-visible result is built from `ToolResultMessage.content`, while host/provider adapters use `details` separately; for example, the OpenAI-compatible history collects text from `result.content` in [`packages/ai/src/dialect/history.ts:63-67`](https://github.com/can1357/oh-my-pi/blob/d716bcf60ab0a2e7ece1fdf382c0d143fef1f307/packages/ai/src/dialect/history.ts#L63-L67). So secrets must not go into `content` or into errors; `details` is not a secret store either.

### 2.2 Startup discovery and runtime identity

- **SOURCE-OBSERVED:** `discoverAgents(cwd, home, extensionRoots)` is the standard discovery entry point, [`task/discovery.ts:84-87`](https://github.com/can1357/oh-my-pi/blob/d716bcf60ab0a2e7ece1fdf382c0d143fef1f307/packages/coding-agent/src/task/discovery.ts#L84-L87). The cache key includes cwd and the whole effective extension-root struct; `refreshAgentDiscovery` deletes the cache and rescans, [`task/index.ts:447-475`](https://github.com/can1357/oh-my-pi/blob/d716bcf60ab0a2e7ece1fdf382c0d143fef1f307/packages/coding-agent/src/task/index.ts#L447-L475). The effective task roster also adds session agents, [`task/index.ts:598-602`](https://github.com/can1357/oh-my-pi/blob/d716bcf60ab0a2e7ece1fdf382c0d143fef1f307/packages/coding-agent/src/task/index.ts#L598-L602).
- **EXPERIMENT-OBSERVED:** two separate discovery calls found first `old-role`, then, after the scratch definitions changed, `new-role`; the project definition took precedence over user, and an explicit extension root gave `ext-role`. This proves the primitives/precedence, but not that a future production plugin already wires the scan into every OMP launch.
- **SOURCE-OBSERVED:** `AgentRegistry.global()` stores `AgentRef{id, displayName, kind, parentId, session}` and registered/status/metadata/removed events, [`agent-registry.ts:70-95,119-148,314-357`](https://github.com/can1357/oh-my-pi/blob/d716bcf60ab0a2e7ece1fdf382c0d143fef1f307/packages/coding-agent/src/registry/agent-registry.ts#L70-L95).
- **EXPERIMENT-OBSERVED:** manual mapping of four SDK sessions by session ID told Main apart from same-role workers, rejected unknown, and showed the failure of a global `currentAuthor`. In addition, a real TaskTool spawn through a loopback model created `LinearChild`; the same prepared extension received its host-owned identity in `session_start` and execute. So the runtime instance attribution path is proven end-to-end offline.
- **UNKNOWN / host gap:** the extension API does not export a single read-only merged effective roster (discovered + session agents + disabled definitions). Use host discovery for startup definitions and the registry for live instances; do not copy the parser/precedence.

### 2.3 Session lifecycle

- **EXPERIMENT-OBSERVED:** the custom entry `{connectionId, activeOperation, authorId}` survived resume/branch/switch/compaction/child isolation. Then a persistent SessionManager was actually closed and reopened; before `initializeExtensions` the active set held only search, and the standard `session_start` handler read the entry and restored `linear_restore_target`. Connection `oauth-a` and the operation were observable after the hook.
- **INFERRED:** the production handler must reapply the saved operation only after intersecting it with the permitted child capability set; the OMP restoration lifecycle hook itself is already sufficient and needs no core patch.

### 2.4 Cache consequences

- **EXPERIMENT-OBSERVED:** the provider-visible payload changed from 65 446 to 66 067 B (+621 B) and from 17 087 to 17 231 `o200k_base` proxy tokens (+144) in the last run with one active ergonomic operation.
- **INFERRED:** any cache whose key includes the tools/system payload cannot treat these two requests as the same full prompt. A provider may reuse the unchanged prefix or append session transport, but this is provider-specific.
- **UNKNOWN:** the real cache-hit rate, billed cached tokens, cost, and latency of the remote provider were not measured. Payload size must not be presented as a billing result.

## 3. Linear coverage model

Pinning:

- Linear repo commit `3addb24bdf771700da1c050742e70e645cc7e36a`.
- `packages/sdk/src/schema.graphql` SHA-256 `354098d4acd5859524f0f9a77e5b29691e4b4f186b5334e97125ef8c4a2719da`.
- **SOURCE-OBSERVED:** the official Linear API uses GraphQL and supports OAuth/API keys: [Linear GraphQL API](https://linear.app/developers/graphql).
- **SOURCE-OBSERVED:** the official SDK repo publishes the schema/codegen source: [`linear/linear`](https://github.com/linear/linear/tree/3addb24bdf771700da1c050742e70e645cc7e36a/packages/sdk/src).

Three layers:

1. **Ergonomic:** issue get/create/update/transition/comment/relation; project get/update; milestone create/update. They resolve identifiers, presets, state checks, and verification refetch.
2. **Generated:** native typed root arguments for all 173 Query and 377 Mutation. For object/interface/union output, a `selection: string` is added; a GraphQL parser parses it, and it is validated against the pinned output type. It does not replace typed inputs.
3. **Raw:** `document`, `variables`, `operationName`; the AST determines the selected operation and the approval tier. Raw supplements pinned coverage for new server fields but does not mask codegen gaps.

**Mechanical definition of parity:** the set of catalog keys is strictly equal to the set of root fields `Query ∪ Mutation`; for each descriptor, root kind/name, args, input object graph, enum values, non-null/optional/default distinctions, description, deprecation, and output root type are preserved. In the proof: 550/550, 193 schemas with `$ref`, 72 descriptors with `[Internal]`/`[ALPHA]` in descriptions, 19 deprecated. Internal/alpha stay in the denominator and are marked; presence in the SDL does not promise scope/entitlement.

**EXPERIMENT-OBSERVED:** the JSON Schema generator now preserves GraphQL nullability recursively: a nullable field accepts explicit `null`; non-null rejects it; outer-list and item nullability differ even in `[[String!]!]!`; 9 Linear default args are preserved; synthetic `Boolean! = true` stays `type:boolean`, `default:true`, but does not become required. This closes the earlier wrong `if NonNull then unwrap` approach, which turned nullable into non-null and lost boolean/custom-scalar constraints.

Selection validation must cover aliases, nested field arguments, named/inline fragments, interfaces/unions, and connection `pageInfo`. A scalar root needs no selection. Bundled SDL validation of a raw operation must not reject a syntactically correct new server field only because the pinned SDL is older; the result is marked `validation: syntax-only/schema-unknown`.

Identifiers are resolved in an explicit workspace/team/project context. A UUID is accepted directly. `MNE-940` and project/state/milestone names are looked up first, then: 0 → not found; 1 → UUID; >1 → candidates/ambiguity. No first-match and no auto-creation. Transition accepts `expectedSourceState`, runs the mutation, and refetches; this is an optimistic precondition, not an atomic CAS, because such a guarantee of the Linear API is not proven.

Schema refresh is a development command against an explicitly pinned upstream commit. Diff: added/removed/changed/deprecated/input-breaking. Startup does not download the SDL; agent discovery and schema refresh are different lifecycles.

## 4. Tool-search contract

The proof index contains all 550 generated descriptors plus 6 ergonomic/raw/help entries = 556 documents: tool name, `Query|Mutation.field`, description, args, and curated aliases. A BM25-style lexical ranker is implemented; no embeddings/model/service were used.

Contract:

- an exact tool/root name may activate directly;
- natural-language search returns ranked candidates, a score, and an explanation of the matched terms;
- a BM25/lexical score is not called a probability;
- activation is allowed only at a development-calibrated minimum score and top1/top2 gap;
- an ambiguous or dangerously close query gives candidates-only/abstain;
- raw is offered only for explicit `raw/custom/unsupported GraphQL`, not as a fallback for weak search;
- success changes only the current Linear operation and keeps search and unrelated tools;
- failure reports `activeTool` and does not claim that a switch happened.

**EXPERIMENT-OBSERVED:** a frozen 60-intent corpus was split deterministically and stratified: development 30, evaluation 30; threshold/gap tuning saw only development labels, and the ranking/activation function does not accept a label at all. Development: 19/25 top-1, 22/25 top-3, 0 wrong activations, 0 ambiguous activations, 21 abstentions. Evaluation: 22/25 top-1, 23/25 top-3, but 1 wrong/ambiguous activation, 16 abstentions. So the honest result is **natural-language candidates-only**; autoactivation is allowed only for an exact tool or `Kind.root`. Exact retrieval passed for all 550 roots. This is not a winning proxy on 6 hand-written docs but a failed attempt at safe NL autoactivation on the full catalog.

`find_next_unblocked_issue` must not encode a work-selection policy. Filters and relations are available; the external agent or user decides priority.

## 5. Tool interfaces

Below are the provider-facing JSON Schemas. The standard OMP wrapper adds the `i` field; it holds the short intent of the call.

### `linear_tool_search`

```json
{
  "type": "object",
  "properties": {
    "i": { "type": "string" },
    "query": { "type": "string", "minLength": 1 },
    "activate": { "type": "string", "description": "Exact candidate tool name; omitted for candidates-only" },
    "limit": { "type": "integer", "minimum": 1, "maximum": 10, "default": 5 }
  },
  "required": ["i", "query"],
  "additionalProperties": false
}
```

### `linear_issue_get`

```json
{
  "type": "object",
  "properties": {
    "i": { "type": "string" },
    "issue": { "type": "string", "description": "UUID or identifier such as MNE-940" },
    "workspaceId": { "type": "string" },
    "teamId": { "type": "string" },
    "preset": { "type": "string", "enum": ["concise", "detail"] },
    "selection": { "type": "string" }
  },
  "required": ["i", "issue"],
  "additionalProperties": false,
  "oneOf": [
    { "required": ["preset"], "not": { "required": ["selection"] } },
    { "required": ["selection"], "not": { "required": ["preset"] } }
  ]
}
```

### `linear_issue_transition`

```json
{
  "type": "object",
  "properties": {
    "i": { "type": "string" },
    "issue": { "type": "string" },
    "targetState": { "type": "string" },
    "expectedSourceState": { "type": "string" },
    "workspaceId": { "type": "string" },
    "teamId": { "type": "string" }
  },
  "required": ["i", "issue", "targetState", "expectedSourceState"],
  "additionalProperties": false
}
```

### Generated Query: `lq_issue`

Pinned SDL declares `Query.issue(id: String!): Issue!` at [`schema.graphql:39822-39829`](https://github.com/linear/linear/blob/3addb24bdf771700da1c050742e70e645cc7e36a/packages/sdk/src/schema.graphql#L39822-L39829).

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "i": { "type": "string" },
    "id": { "type": "string" },
    "selection": { "type": "string", "minLength": 1 }
  },
  "required": ["i", "id", "selection"],
  "additionalProperties": false
}
```

### Generated Mutation: `lm_issueArchive`

Pinned SDL declares `issueArchive(id: String!, trash: Boolean): IssueArchivePayload!` at [`schema.graphql:25887-25898`](https://github.com/linear/linear/blob/3addb24bdf771700da1c050742e70e645cc7e36a/packages/sdk/src/schema.graphql#L25887-L25898).

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "i": { "type": "string" },
    "id": { "type": "string" },
    "trash": { "anyOf": [{ "type": "boolean" }, { "type": "null" }] },
    "selection": { "type": "string", "minLength": 1 }
  },
  "required": ["i", "id", "selection"],
  "additionalProperties": false
}
```

### `linear_graphql`

```json
{
  "type": "object",
  "properties": {
    "i": { "type": "string" },
    "document": { "type": "string", "minLength": 1 },
    "variables": { "type": "object", "additionalProperties": true },
    "operationName": { "type": "string" }
  },
  "required": ["i", "document"],
  "additionalProperties": false
}
```

With several operations, `operationName` is required. Subscription is rejected. In `actor=app`, an AST/variables transform adds attribution only to the documented issue/comment create inputs, not a string substitution.

### `linear_schema_help`

```json
{
  "type": "object",
  "properties": {
    "i": { "type": "string" },
    "symbol": { "type": "string", "minLength": 1 },
    "include": {
      "type": "array",
      "items": { "type": "string", "enum": ["args", "inputs", "enums", "output", "description", "deprecation", "scopes"] },
      "uniqueItems": true
    }
  },
  "required": ["i", "symbol"],
  "additionalProperties": false
}
```

Native arguments stay JSON Schema function calls. TOON applies only to the response `content` after execution.

## 6. TOON boundary

Pinned: `@toon-format/toon@4.1.1`, spec commit `d6db4b04303bdea132351ce45aed612311c850b2`, token proxy `js-tiktoken@1.0.21`. **SOURCE-OBSERVED:** TOON spec 4.1 is a Working Draft and has an official fixture corpus: [toon-format/spec](https://github.com/toon-format/spec/tree/d6db4b04303bdea132351ce45aed612311c850b2).

**EXPERIMENT-OBSERVED:** 179 official encode fixtures passed. Separate schema-derived builders built 31 cases for 11 shapes: issues, projects, milestones, comments, search results, activity, connections, warnings+errors, keyed map, nested heterogeneous graph, single object. All gave exact `decode(encode(value)) === value` with cursor/truncation metadata.

Representative results against compact `JSON.stringify` of the same object:

| Population | N | JSON B | TOON B | o200k JSON→TOON | cl100k JSON→TOON |
|---|---:|---:|---:|---:|---:|
| issues (nested state/assignee/labels) | 1 | 283 | 302 | 90→102 (+13.3%) | 87→101 (+16.1%) |
| issues | 100 | 23 170 | 25 666 | 7 244→8 493 (+17.2%) | 7 092→8 592 (+21.2%) |
| projects | 100 | — | — | 6 341→3 859 (-39.1%) | — |
| milestones | 100 | 15 965 | 8 510 | 4 626→3 038 (-34.3%) | 4 774→3 087 (-35.3%) |
| comments | 100 | — | — | 5 984→4 332 (-27.6%) | — |
| activity | 100 | — | — | 6 394→3 650 (-42.9%) | — |
| connections | 100 | 6 023 | 2 837 | 1 947→1 354 (-30.5%) | 1 945→1 353 (-30.4%) |
| warnings+errors | 100 | 12 186 | 12 124 | 3 088→3 487 (+12.9%) | 2 985→3 587 (+20.2%) |
| keyed map | 100 | 8 180 | 3 714 | 2 505→1 912 (-23.7%) | 2 504→1 912 (-23.6%) |
| nested heterogeneous | 100 | 7 723 | 9 616 | 2 196→2 729 (+24.3%) | 2 161→2 729 (+26.3%) |

The specific measured shape sets the policy, not the general word "collection": TOON wins for flat/regular projects, milestones, comments, activity, connections, and keyed maps; JSON is better for truly nested issues, search results, warning/error bundles, and heterogeneous graphs. Small N is checked separately. The runtime does not have to encode/tokenize every response twice: the decision is fixed per known shape. The numbers are proxy encodings, not provider billing.

## 7. Security and approval model

### Credentials and connections

- **SOURCE-OBSERVED:** Linear documents personal API keys and OAuth: [GraphQL API](https://linear.app/developers/graphql), [OAuth 2.0 authentication](https://linear.app/developers/oauth-2-0-authentication). PKCE supports code exchange/refresh; a localhost callback is documented.
- **EXPERIMENT-OBSERVED:** the scratch host auth storage saved `linear:oauth-a` and `linear:key-b`, survived reopen, and deleted both records on logout. Five fake secret sentinels (both access tokens, refresh token, API key, verifier) were absent from all trace files and the summary.
- **INFERRED:** the minimal design is host auth storage `linear:<connection-id>`; the session stores only the selected connection ID. The workspace is not chosen by cwd/project name.
- **EXPERIMENT-OBSERVED:** a loopback issuer checked a real `base64url(SHA256(verifier))`; a wrong state did not call the token endpoint; code exchange and refresh passed. Switching `linear:key-b` → `linear:oauth-a` produced two different actual outbound `Authorization` headers from the selected credential records.

### Actor and display attribution

- **SOURCE-OBSERVED:** OAuth `actor=app`, `createAsUser`, and `displayIconUrl` for issue/comment creation are documented in [OAuth actor authorization](https://linear.app/developers/oauth-actor-authorization). This is the `User (via Application)` display, not the creation of a Linear user identity.
- **SOURCE-OBSERVED:** actor=app installation/admin and the separate app:assignable capability are described in [Linear agents](https://linear.app/developers/agents). `app:assignable` is not needed for display names alone.
- Format (owner decision, 2026-11-14, replaces the original `OMP · <displayName> [<id>]`): the main session does not pass `createAsUser`, and Linear shows the application itself. A subagent passes the display name of its role from `src/identity/names.ts` (`reviewer` → `Code Reviewer`). The source is host identity, not a model argument. The startup scan writes nothing to Linear and sends no prompts/config.
- **UNKNOWN:** the real actor/user display, workspace scopes, and entitlements were not checked without live OAuth/Linear.

### Approval and transport

- **SOURCE-OBSERVED:** OMP `resolveApproval` takes into account the tool tier, mode, and user override; prompt/deny are preserved, [`tools/approval.ts:189-299`](https://github.com/can1357/oh-my-pi/blob/d716bcf60ab0a2e7ece1fdf382c0d143fef1f307/packages/coding-agent/src/tools/approval.ts#L189-L299).
- **EXPERIMENT-OBSERVED:** the raw AST classified query/read and mutation/write; `mutation` inside a string literal stayed read; a multi-operation without `operationName` ended before HTTP. Through the real OMP wrapped-tool gate, explicit deny raised an exception and made **0 HTTP requests**; a write-mode mutation and an always-ask read each made one HTTP request.
- The plugin does not add a forced `policy:"prompt"` on top of OMP. It classifies the parsed selected operation and hands the decision to OMP.
- **EXPERIMENT-OBSERVED:** one loopback GraphQL client actually sent 7 requests and handled HTTP 502, `data+errors`, `success:false`, rate headers, a 125-node response with budget 100/`truncated:true`/`nextCursor:i99`, a mutation, and a separate refetch (`requested=Done`, `observed=In Review`). Separate endpoints proved non-JSON, timeout before sending (0 requests), and timeout after sending (1, outcome unknown, no retry).
- A mutation timeout after a possible send is never blind-retried. Partial data is explicitly marked partial. Arbitrary raw pagination is not automated: one bounded response and explicit cursor traversal.

## 8. Context economics

All sizes are actually serialized OpenAI Responses payloads through an OMP mock/loopback provider, on one full catalog and a baseline core toolset. Token counts are `js-tiktoken@1.0.21`, not provider billing.

| Variant | Direct provider tools | Mounted xdev total | System B | Tool schema B | Total B | o200k | cl100k |
|---|---:|---:|---:|---:|---:|---:|---:|
| A initial | 13 | 2 baseline | 13 088 | 52 046 | 65 446 | 17 087 | 16 907 |
| A + one ergonomic op | 14 | 2 baseline | 13 399 | 52 356 | 66 067 | 17 231 | 17 048 |
| B search + executor | 14 | 2 baseline | 13 124 | 52 329 | 65 765 | 17 157 | 16 974 |
| C real xdev catalog | 13 | 552 (= 2 baseline + 550 Linear) | 72 891 | 52 046 | 125 249 | 30 259 | 29 989 |
| All 550 active | 563 | 0 | 44 399 | 7 053 363 | 7 098 074 | 1 661 830 | 1 618 933 |

**EXPERIMENT-OBSERVED / measurement note:** byte totals are stable for this serialization shape; token counts include fixed-length ephemeral session/cache identifiers, so a rerun may shift the proxy count by a few tokens. The table records the last successful run and does not claim a tokenizer-invariant constant.

C is the corrected baseline: the catalog is actually mounted in xdev and not exposed as 550 direct provider tools. Its system catalog almost doubles A initial, so C is not the main execution design. It stays suitable only for opt-in schema/help browsing.

Cold process experiment: 10 independent baseline + 10 catalog processes, the same cleaned environment.

| | Baseline mean / median / max | Catalog mean / median / max | Mean delta |
|---|---:|---:|---:|
| Startup | 51.00 / 51.38 / 53.40 ms | 53.75 / 53.13 / 57.68 ms | +2.74 ms |
| RSS delta | 12.52 / 12.25 / 13.53 MiB | 15.54 / 15.50 / 16.50 MiB | +3.02 MiB |

The catalog process registered 559 total tools, 2 active; baseline — 6 total, 1 active. These numbers include OMP baseline tools and two ergonomic canaries on top of 550 descriptors.

Activation latency: 10 warmups + 50 measurements; min 0.314 ms, median 0.367 ms, p95 0.495 ms, max 1.540 ms, mean 0.424 ms.

**EXPERIMENT-OBSERVED / provenance:** activation and cold measurements were rerun after the final proof edits with the current `proof.ts`/`cold-driver.ts`; the cold driver created 10+10 separate processes from the same pinned generator version. These are local process measurements, not remote-provider latency.

**UNKNOWN:** real provider cache hit/billing/latency. The payload delta was measured, not cloud economics.

## 9. Prototype evidence

Scratch root: `/tmp/omp-linear-research.Top1xG`.

Main run:

```sh
cd /tmp/omp-linear-research.Top1xG
rtk env -i PATH="$PATH" HOME="$PWD/home" \
  XDG_CACHE_HOME="$PWD/xdg-cache" XDG_CONFIG_HOME="$PWD/xdg-config" \
  XDG_DATA_HOME="$PWD/xdg-data" NO_COLOR=1 \
  rtk proxy bun run proof.ts
```

Result: **PASS**, 15 scenarios, 355 assertions. Separately:

**EXPERIMENT-OBSERVED / independent verification:** the parent reran exactly the command above after the final TaskTool/restoration changes: **PASS, 15 scenarios, 355 assertions**; raw output — [`artifact://149`](artifact://149). Evidence boundary: the run checked local OMP SDK lifecycle, provider serialization, and loopback transports; it did not check live Linear, live OAuth rendering, or remote model/provider acceptance.

```sh
rtk env -i PATH="$PATH" HOME="$PWD/home" XDG_CACHE_HOME="$PWD/xdg-cache" \
  XDG_CONFIG_HOME="$PWD/xdg-config" XDG_DATA_HOME="$PWD/xdg-data" NO_COLOR=1 \
  rtk proxy bun run proof.ts --activation-bench
rtk env -i PATH="$PATH" HOME="$PWD/home" XDG_CACHE_HOME="$PWD/xdg-cache" \
  XDG_CONFIG_HOME="$PWD/xdg-config" XDG_DATA_HOME="$PWD/xdg-data" NO_COLOR=1 \
  rtk proxy bun run cold-driver.ts
```

Covered observations:

- 550-root exact catalog; nullable/non-null/default/nested-list/enum/recursive validation;
- recursive provider serialization;
- real OMP activation loop, negative activation control, 10 concurrent search pairs;
- actual unrestricted and restricted TaskTool children: loopback model, registry/session identity, initial-selection semantics, and fail-closed filtering of prepared-extension tools;
- raw AST matrix and actual OMP deny gate with zero HTTP;
- custom-entry lifecycle and actual close/open + automatic `session_start` restoration;
- discovery primitives/precedence, manual same-role concurrency, and actual task-child identity path;
- independent loopback PKCE/state/token/refresh/selected-credential headers;
- actual GraphQL client: HTTP/partial/success:false/rate/budget/mutation+refetch;
- full 556-document search index, frozen dev/eval, 550 exact-root retrieval;
- 179 TOON fixtures + 31 distinct schema-derived populations;
- A/B/C/all-active provider payloads, 50 latency observations, 20 cold processes.

Local `Bun.serve` handles and SDK sessions were closed; subscriptions were removed; scratch credential records were deleted. No live Linear endpoint was called.

The research subagent attempt was not used as evidence and ended with the exact error `Error: No model selected.` User auth/model settings were not changed.

Artifacts and SHA-256 values after the last run are listed at the end of the report.

## 10. Risks and unknowns

1. **UNKNOWN:** live OAuth installation, scopes/entitlements, refresh edge cases, actor rendering, rate-limit headers of a specific workspace, and real mutation responses.
2. **UNKNOWN:** remote provider acceptance of exact Draft-07 recursive schemas for each supported OMP model/provider family. OMP validation and the OpenAI Responses serializer through loopback are proven, not server-side acceptance by each provider.
3. **UNKNOWN:** provider prompt-cache hit rate, billing, and service latency.
4. **EXPERIMENT-OBSERVED / PRODUCT BLOCKER:** the actual unrestricted child admits essential extension tools beyond the agent `tools:`; this matches initial-selection semantics and is not a core defect. The actual restricted child filtered out both `linear_probe_identity` and `linear_forbidden` and kept the `session_start` hook/identity. Security is not bypassed, but the permitted Linear tool is unavailable. The product contract needs host-supported selective admission of permitted prepared-extension tools into the restricted child, with an immutable ceiling for later activation.
5. **UNKNOWN / host gap:** a single merged effective roster accessor is not exported. The actual spawn identity path through `session_start` + `AgentRegistry` is proven and needs no separate spawn hook.
6. **EXPERIMENT-OBSERVED / residual:** reopen automatically restored the operation through the existing `session_start`; no core lifecycle patch is needed. A separate full provider round-trip after each branch/compaction remains acceptance work for the production plugin, not a proven host blocker.
7. **INFERRED:** pinned parity goes stale on schema drift; mitigated by explicit deterministic refresh/diff, not network-on-startup.
8. **EXPERIMENT-OBSERVED:** NL search did not pass the safety criterion on evaluation: 1 wrong/ambiguous activation. So natural-language candidates-only; exact names may activate.
9. **SOURCE-OBSERVED:** `[Internal]`/`[ALPHA]` fields in the SDL do not mean availability.
10. **INFERRED:** a raw newer server field gets `schemaValidation: unknown`, not a false "verified".
11. **UNKNOWN:** live Linear UI `createAsUser` rendering and identity semantics.

Schema recursion, host secret storage, task identity, and reopen restoration are **not** blockers. The real boundary is selective restricted-child extension-tool admission; the merged effective roster remains a read-only API gap.

## 11. Implementation plan

1. **OMP/product prerequisite:** design selective admission of prepared-extension tool definitions into the restricted child. The host must accept the permitted Linear subset, hold an immutable ceiling, and allow changes only to the active subset inside it. Do not weaken the current fail-closed path; do not redefine the regular `tools:` as a new permission API. Add a read-only effective-roster accessor or another host-owned equivalent.
2. **Pinned generator:** development-only pin/digest/diff; 550 descriptors; recursive nullable/non-null/list/default semantics; equality manifest.
3. **Runtime catalog:** `defaultInactive:true`, exact raw JSON Schema, always-active search; not `fromJsonSchema` for the full graph.
4. **Selection validator:** parse/type validation for aliases/fragments/interfaces/unions/nested args/pageInfo; syntax-only raw path for new fields.
5. **Search:** full 556+ index; natural language candidates-only, exact-name activation; repeat frozen dev/eval until evaluation false activations reach zero before allowing NL autoactivation.
6. **Ergonomics:** issue get/create/update/transition/comment/relation; project get/update; milestone create/update; resolver/refetch.
7. **Transport/errors:** bounded client, partial/success:false/rate/timeout taxonomy, unknown/no blind retry, explicit cursor.
8. **Auth:** host storage, real PKCE/state/refresh/logout, explicit per-session connection.
9. **Session/identity:** run the standard discovery on every launch; use the verified `session_start` + `AgentRegistry` for the specific child identity; restore the custom entry through the existing lifecycle and intersect the operation with the ceiling; reject unknown and dispose the listener.
10. **Approval/output:** AST-selected tiers → OMP permissions; shape-specific JSON/TOON policy.
11. **Acceptance harness:** run §12 with negative controls; live Linear smoke only with separate permission.

This research created no production `src/`, package manifest, OAuth registration, or plugin installation.

## 12. Acceptance criteria

The production plugin counts as ready only if all of the following are observed at the same time:

1. The pinned SDL digest/commit is saved; the manifest contains exactly the root Query+Mutation set, currently 173+377=550, with exact input contracts and a deterministic diff.
2. The first provider request contains no names, descriptions, or schemas of inactive Linear operations; it contains search.
3. Exact activation shows the exact schema in the next request; replacement/concurrency keep unrelated tools. The restricted child gets the permitted Linear subset, not the whole extension catalog and not zero, and activation does not go beyond the immutable ceiling.
4. The generated schema preserves explicit nullable, non-null, nested list item/outer semantics, and defaults; the exact recursive schema passes serializers.
5. The selection validator covers aliases/nested args/fragments/interfaces/unions/pageInfo; raw multi-op requires operationName.
6. Full catalog search publishes frozen dev/eval; NL activation is off on any evaluation false activation; exact 550-root retrieval passes.
7. OMP wrapped deny gives 0 HTTP; allowed read/write make the expected number of requests.
8. Five secret sentinels are absent from all traces/model payloads; the selected connection actually changes the outbound credential header.
9. A real bounded GraphQL client proves partial/success:false/rate/timeout/budget and mutation→refetch.
10. The production startup hook scans definitions on every launch; a real task-spawn hook tells Main apart from two same-role children; unknown is rejected.
11. Resume/branch/switch/compaction integration restores the connection and active operation without going beyond the capability ceiling; child state is independent.
12. 179 fixtures and different schema-derived shapes pass; the encoding policy follows the measured shape, not the general type "list".
13. A/B/C/all-active are measured on the same full catalog; C is actually mounted xdev, not direct tools; cache claims are limited to observed bytes.
14. Live Linear/OAuth acceptance is done separately with explicit permission and checks scopes, actor rendering, workspace selection, rate limits, and real refetch results.

### Matrix of 17 required questions

| # | Answer | Status/evidence |
|---:|---|---|
| 1 | For main/unrestricted — yes. The restricted task path safely filters all prepared-extension tools, so there is no full contract until selective admission of the permitted Linear subset. | SOURCE + EXPERIMENT-OBSERVED + INFERRED |
| 2 | Yes for the provider-visible request: inactive name/schema were absent; the private registry is host-side. | EXPERIMENT-OBSERVED |
| 3 | Yes, search execute changed the immediately next request; the negative control failed. | EXPERIMENT-OBSERVED |
| 4 | +621 B/+144 o200k in the last run; the fluctuation of a few proxy tokens comes from ephemeral metadata; remote cache economics UNKNOWN. | EXPERIMENT-OBSERVED + UNKNOWN |
| 5 | 550: 173 Query + 377 Mutation. | EXPERIMENT-OBSERVED |
| 6 | +2.74 ms mean cold startup and +3.02 MiB mean RSS; final scoped rerun of 10+10 processes. | EXPERIMENT-OBSERVED |
| 7 | Yes, opt-in schema/help: C 125 249 B vs A 65 446 B; not the main executor. | EXPERIMENT-OBSERVED + INFERRED |
| 8 | Root-set equality plus explicit nullability, nested lists, 9 defaults, enums/deprecations; permissions are not promised. | EXPERIMENT-OBSERVED |
| 9 | issue get/create/update/transition/comment/relation; project get/update; milestone create/update. | INFERRED product design |
| 10 | Explicit workspace/team/project; UUID direct; 0=not found, 1=resolve, >1=candidates; no first match/autocreate. | INFERRED safety contract |
| 11 | Pinned development refresh with a deterministic breaking diff; no startup fetch. | INFERRED design |
| 12 | Full index 556; exact retrieval 550/550. Evaluation NL: 22/25 top-1, 23/25 top-3, 1 unsafe activation, so candidates-only. | EXPERIMENT-OBSERVED |
| 13 | Shape-specific: projects/activity/connections win 30–43%; nested issues/search/errors lose 13–24%. | EXPERIMENT-OBSERVED |
| 14 | Yes. Inputs are native JSON Schema; TOON is only output content by measured shape. | Decision + EXPERIMENT-OBSERVED |
| 15 | Host storage; real base64url PKCE/state gate/refresh; selected credential changes the outbound header; wrapped deny = 0 HTTP. | SOURCE + EXPERIMENT-OBSERVED |
| 16 | Custom entries survived the lifecycle; actual close/open triggered automatic `session_start` restoration. The actual TaskTool child was distinguishable by host registry/session identity. | EXPERIMENT-OBSERVED |
| 17 | Selective restricted-child prepared-extension admission with an immutable ceiling and a merged effective-roster accessor are needed. Spawn identity and reopen restoration are already available; remote provider acceptance remains UNKNOWN. | SOURCE + EXPERIMENT-OBSERVED + INFERRED + UNKNOWN |

## Artifact manifest

Filled from the last successful proof; all paths are scratch, not production. `bun.lock` pins exact dependencies.

| Artifact | SHA-256 |
|---|---|
| `proof.ts` | `daaaf88cdd6328c802625402d5e8e43b5e74f7e87fcd2e487513b4f60c79c63a` |
| `cold-driver.ts` | `f53bf4f2d906e8462be7ba1e94069d3a8fd7783e37a3aa0c39989d848b79995f` |
| `bun.lock` | `3fc10bc6a88127dc068cabbbb40d5197cf54d54787c3d0eaf89118e3954a0bc1` |
| `traces/proof-summary.json` | `25961aa14fcca0f20ce41d749109253e684e77e1f382000e1c8400b1ce15dfc8` |
| `traces/provider-activation.json` | `6031d0b99dfa370c8ad270ac2ad57836a719886f6356b3b7ca3e1a2734267db8` |
| `traces/search-results.json` | `77fd5bc767cbdbdd04d4c59ad189bc83aac22ac3f198254542f0676fceb3c56e` |
| `traces/toon-metrics.json` | `1b08aa0ff37b0806247f0e20cd80d6e616cee8bbea2c11e3d5f47f457b01a5da` |
| `traces/context-metrics.json` | `323f6eaabbec97b80e015f28c62673ab504d7c53e2575fda633234857d5456e7` |
| `traces/cold-metrics.json` | `94235d24e6d5e0438c07a97f3d56928609b0505b0b5420b5199c46b1318ba8a3` |
| `traces/activation-latency.json` | `d6967b1a77095c85708b1ce16eab3004a5a3eef6905c046b3a41476d1a4ffa1e` |
| `traces/exact-recursive-provider.json` | `1c18fc798448d69459cf7f802cebf1d873459bba1a68848de39e9dfbc5d5cbf7` |
| `traces/task-child-debug.json` | `26d0280bb269ac4175ade23aeecbdda511c83c4a99d385376974ebb8379de9e1` |
