# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-11-20

### Added

- Agent session ops let an omp agent report its work in Linear's agent session panel:
  `linear_agent_session_start` (on an issue or a root comment), `linear_agent_activity_add`
  (thought, action, elicitation, response, error), `linear_agent_session_update` (summary,
  plan, links), `linear_agent_session_get` and `linear_agent_session_list`. The writes need an
  `actor=app` connection. The ops start inactive, and `linear_tool_search` finds and activates
  them, so they add nothing to the start-up context.

## [1.1.1] - 2026-11-19

### Fixed

- Typed tools no longer use the JSON Schema `not` keyword. Codex refused every request after an
  agent activated one of the 43 affected tools, for example `lq_searchDocuments`, with
  `invalid_json_schema`. `Duration`, `DateTimeOrDuration` and `TimelessDateOrDuration` are now
  strings. `JSON` lists the non-null JSON types.

## [1.1.0] - 2026-11-15

### Added

- `linear_team_get` returns a team with its workflow states, team labels and members.
- `linear_issue_get` also returns the 20 newest comments (newest first) and the issue relations in both
  directions.

### Changed

- The ergonomic ops are always visible next to `linear_tool_search`. Agents no longer need a
  search and an activation before each daily operation.
- Activated tools form a working set of up to 6. A new activation removes the oldest tool
  instead of the previous one. The `linear-state` entry stores `activeOperations`, and older
  entries with `activeOperation` still restore.
- `linear_graphql` is the fallback: its description says so, and search ranks it below the
  other candidates unless the query asks for raw GraphQL.

## [1.0.4] - 2026-11-14

### Fixed

- App tokens (`linear.appCredentialsFile`) and new OAuth logins request `initiative:write`.
  Before, Linear refused initiative reads and writes for the app.

## [1.0.3] - 2026-11-14

### Added

- Agent tool calls (`bash`, `eval`, `read`, `grep`, `glob`) that name a configured credentials file
  or the connection store are blocked. An agent without the Linear tools can no longer call Linear
  directly with the app token and an invented `createAsUser` name.
- `CONTRIBUTING.md`: setup, change workflow, checks, rules and release steps.
- `AGENTS.md` with repository rules for coding agents. `CLAUDE.md` imports it.

## [1.0.2] - 2026-11-14

### Changed

- The repository is public. Examples use neutral identifiers (`ENG-123`).
- `smoke:binary` and `measure-context` use the `omp` binary on PATH by default.
- The research assignment is no longer part of the repository.

## [1.0.1] - 2026-11-14

### Changed

- Dependencies on their latest releases: OMP packages 18.20.1, graphql 17.1.0,
  @toon-format/toon 4.4.0, TypeScript 7.0.2. Code adapted to graphql 17: argument and
  input-field defaults, drift detection messages, `print` spacing. Behavior is unchanged.
- Host package peer dependencies accept `>=18.20.0`. `@oh-my-pi/omptype` is no longer a peer:
  the bundle includes it.
- CI uses the latest bun. The stale-bundle check compares a hash of the build inputs
  (`dist/index.js.inputs`), so a new bun version does not fail it.

## [1.0.0] - 2026-11-14

### Added

- Native OMP 18.20 extension: 495 typed GraphQL operations (`lq_*`, `lm_*`) generated from
  the pinned Linear schema, a raw `linear_graphql` tool, `linear_schema_help` and
  `linear_connections`.
- `linear_tool_search`: ranked search over the private catalog; `activate` adds one Linear
  operation at a time to the active tools.
- 17 ergonomic ops for daily work: issues, comments, relations, links, projects, project
  status updates, milestones and documents. References accept team keys, issue identifiers,
  names, emails or `me`.
- `linear_issue_search` filters: team, state, state type, assignee, project, priority,
  labels and `staleDays`.
- Connections: `/linear-login` (OAuth PKCE), `/linear-key`, `/linear-use`, `/linear-logout`,
  plus the `linear.apiKeyFile` and `linear.defaultConnection` settings, so `omp -p` sessions
  and `task` subagents work without `/linear-use`.
- `linear.appCredentialsFile`: `actor=app` access through a `client_credentials` token kept
  in memory, renewed before expiry and dropped on HTTP 401.
- `linear.oauth.redirectHost` for Linear applications registered with `localhost`.
- Attribution for `actor=app`: subagents write under the display name of their agent
  definition (for example `Code Reviewer`); the main session writes as the application.
- `schema:check`: drift report against live Linear introspection, covering root fields,
  arguments, type definitions and deprecated fields in ergonomic documents.
- `smoke` and `smoke:binary`: real-loader and installed-binary smokes for the `-e` and
  `extensions:` load paths.
- Plugin packaging: marketplace catalog `.omp-plugin/marketplace.json`
  (`omp plugin install omp-linear@omp-linear`), a self-contained bundle `dist/index.js` as the
  `omp.extensions` entry, so a marketplace install loads without a dependency install, and
  package metadata (keywords, author, repository, engines).
- `bun run check`: typecheck, stale-bundle check and tests. GitHub Actions CI runs it.

### Changed

- The pinned schema now comes from live Linear introspection (`schema:check --write`),
  not from the SDK schema file.
- `linear_tool_search` is a native function in every model request instead of an `xd://`
  device.
- Text search in `linear_issue_search` uses `searchIssues` instead of the deprecated
  `issueSearch`.
- The author identity comes from `ctx.agent`; the host patch, roster and discovery code
  are removed.

### Fixed

- Credentials are scrubbed from OAuth, auth-header, token-endpoint and revocation error
  messages, from GraphQL `errors[].path` strings and from `schema:check` failures.
- Credential-bearing settings (`endpoint`, key files, OAuth URLs) are rejected in project
  configs.
- A caller-supplied `createAsUser` is rejected on typed, raw and ergonomic paths.
- A late HTTP 401 drops only the cached app token it carried, not its replacement.
- Credential files must be regular files of at most 64 KiB.

[1.2.0]: https://github.com/azakharau/omp-linear/compare/v1.1.1...v1.2.0
[1.1.1]: https://github.com/azakharau/omp-linear/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/azakharau/omp-linear/compare/v1.0.4...v1.1.0
[1.0.4]: https://github.com/azakharau/omp-linear/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/azakharau/omp-linear/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/azakharau/omp-linear/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/azakharau/omp-linear/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/azakharau/omp-linear/releases/tag/v1.0.0
