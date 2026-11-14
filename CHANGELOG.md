# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Marketplace catalog `.omp-plugin/marketplace.json`, so the repository installs with
  `omp plugin marketplace add` and `omp plugin install omp-linear@omp-linear`.
- `bun run check` script that runs the offline gate (typecheck and tests).
- GitHub Actions CI workflow that runs `bun run check`.
- Package metadata: keywords, author, repository, homepage, bugs and engines.

### Changed

- The package `files` list no longer ships `scripts/`; it adds `CHANGELOG.md`.
- The research assignment and report moved to `docs/`.
- README reordered with an install section for marketplace, `omp plugin link`, `extensions:`
  and `omp -e`.

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

[Unreleased]: https://github.com/azakharau/omp-linear/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/azakharau/omp-linear/releases/tag/v1.0.0
