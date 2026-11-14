# omp-linear

Native Oh My Pi extension for Linear. It gives OMP agents and `task` subagents:

- 495 typed GraphQL operations (`lq_*` queries, `lm_*` mutations), generated from the pinned
  Linear schema;
- 17 ergonomic ops for daily work (`linear_issue_create`, `linear_issue_search`,
  `linear_project_status_post`, `linear_document_create`, ...);
- a raw `linear_graphql` tool, `linear_schema_help` and `linear_connections`.

## How the tools work

At start the model sees one Linear tool, the native function `linear_tool_search`. It returns
ranked candidates from the private catalog. With `activate: <exact name>` it adds one Linear
operation to the active tools and removes the operation that was active before. Every model
request carries `linear_tool_search` plus at most one activated Linear operation; the other
Linear tools stay registered but inactive, so their names and schemas never reach the model.

## Requirements

OMP 18.20.0 or later. The extension reads the call author from `ctx.agent`, which OMP adds in
18.20.0. On an older host every Linear call fails with
`linear: host does not expose ctx.agent; OMP >= 18.20.0 is required`.

The `@oh-my-pi/*` host packages are peer dependencies (`>=18.20.0`). The host rewrites these
imports to its own modules at load time. The extension imports package roots only, with one
exception: `findScopedSettings` from `@oh-my-pi/pi-coding-agent/config/settings`. The package
root does not export it, and the extension needs the settings instance of the session that runs
the call.

## Install

### Marketplace

The repository is its own marketplace (`.omp-plugin/marketplace.json`):

```sh
omp plugin marketplace add azakharau/omp-linear
omp plugin install omp-linear@omp-linear
omp plugin list                 # omp-linear@omp-linear (<version>) (user)
```

`--scope project` installs for the current project only.
`omp plugin marketplace update omp-linear && omp plugin upgrade omp-linear@omp-linear` installs a
newer catalog version. Restart the session after an install so the extension loads.

### From a checkout

```sh
git clone git@github.com:azakharau/omp-linear.git
cd omp-linear
bun install
bun run generate:catalog      # writes generated/catalog.json from schema/linear.schema.graphql
```

Then load the checkout in one of these ways:

- as a linked plugin: `omp plugin link /path/to/omp-linear`;
- in the OMP config (`~/.omp/agent/config.yml` or `.omp/config.yml` of a project):

  ```yaml
  extensions:
    - /path/to/omp-linear
  ```

- for one run: `omp -e /path/to/omp-linear/src/index.ts`;
- from code: `createAgentSession({ extensions: [createLinearExtension(options)] })`.

The package manifest declares `omp.extensions: ["./dist/index.js"]`: a committed bundle with
`graphql`, `@toon-format/toon` and `@oh-my-pi/omptype` inlined, so a marketplace install loads
without `bun install`. `omp -e .../src/index.ts` runs the source and needs `bun install`.

## Configuration

### Connections

A Linear call uses the first connection that applies:

1. the connection that `/linear-use <id>` selected in this session;
2. `linear.defaultConnection`, a stored connection id;
3. `linear.appCredentialsFile`, a file with `LINEAR_CLIENT_ID=...` and `LINEAR_CLIENT_SECRET=...`;
4. `linear.apiKeyFile`, a file with `LINEAR_API_KEY=...`.

If none applies, the call fails before any network request. `linear_connections` shows the
effective connection and its source (`session`, `default`, `app-file` or `file`), never a secret.

The extension reads both files on every call. It does not copy their values into the credential
store, a session entry, a tool result or the model context. A changed value applies on the next
call. Keep the files outside the repository with mode `0600`.

`linear.appCredentialsFile` gives `actor=app` access without a browser login, so it also works in
`omp -p` and in `task` subagents. Turn on "Client credentials" in the Linear OAuth application.
The extension requests one `client_credentials` token with scope `read,write,initiative:write` per
OMP process, keeps it in memory only, renews it one day before it expires (tokens live 30 days)
and requests a new one after Linear answers HTTP 401. Without `initiative:write`, Linear refuses
initiative reads and writes for the app. Linear revokes all app-actor tokens of the application in
the workspace when a process requests a different scope set. Every other process that uses the
same application must request `read,write,initiative:write` too.
A `client_credentials` request also replaces an `/linear-login app` installation of the same
application, so do not use both modes with one application.

Stored connections (`/linear-key`, `/linear-login`) live in
`<agentDir>/linear/connections.json` (directory `0700`, file `0600`).

### Settings

All settings are in the `linear` block of the OMP config. The project config (`.omp/config.yml`)
wins over the user config (`<agent dir>/config.yml`), with one exception. `endpoint`,
`apiKeyFile`, `appCredentialsFile`, `oauth.authorizeUrl`, `oauth.tokenUrl` and `oauth.revokeUrl`
decide where credentials go, so only the user config may set them. A project config that sets one
of them makes every Linear call and `/linear-login` fail with an error that names the key. A cloned
repository or an agent that writes `.omp/config.yml` cannot redirect your key or token.

```yaml
linear:
  apiKeyFile: ~/linear.env          # optional; LINEAR_API_KEY=...
  appCredentialsFile: ~/linear-app.env   # optional; LINEAR_CLIENT_ID=..., LINEAR_CLIENT_SECRET=...
  defaultConnection: key-1a2b3c4d   # optional; a stored connection id
  endpoint: https://api.linear.app/graphql   # optional override (proxies, fakes)
  oauth:                            # /linear-login; tokenUrl also for appCredentialsFile
    clientId: <client id of the Linear OAuth application>
    clientSecret: <optional>
    redirectPort: <port of the registered redirect URI>
    redirectPath: /callback         # optional
    redirectHost: 127.0.0.1         # optional: 127.0.0.1 or localhost
    scopes: [read, write, issues:create, comments:create, initiative:write]   # optional
```

`redirectPort` is required for `/linear-login`. It must be the port of the redirect URI that
the Linear application has (`http://<redirectHost>:<redirectPort><redirectPath>`). Linear
compares the URI exactly, so set `redirectHost: localhost` if the application registers
`localhost`. The callback listener binds `127.0.0.1` in both cases.
`LINEAR_OAUTH_CLIENT_ID` and `LINEAR_OAUTH_CLIENT_SECRET` in the environment override the client
credentials. Without `clientId` and `redirectPort`, `/linear-login` names the missing keys and
does nothing. A malformed `linear` block makes the command name the bad key.

## Usage

### Commands

| Command | Effect |
| --- | --- |
| `/linear-login [user\|app] [label]` | OAuth PKCE login through a loopback callback. Stores and selects the connection. |
| `/linear-key [label]` | Asks for a personal API key in a dialog. Stores and selects it. |
| `/linear-use <id>` | Selects a stored connection for this session (a `linear-state` session entry). |
| `/linear-logout [id]` | Revokes the OAuth token if possible and removes the connection. |

### Ergonomic ops

The ops accept human references: team key, issue identifier (`ABC-12`), state, label, project
and milestone names, user display name, name or email, or `me`. A UUID passes through without
a lookup. A reference that matches zero or many records is an error that lists the candidates.

| Op | Purpose |
| --- | --- |
| `linear_issue_create` | Create an issue with assignee, labels, project, milestone, parent and relations (`blocks`, `blockedBy`, `related`, `duplicate`). |
| `linear_issue_update`, `linear_issue_transition` | Change fields or the workflow state. |
| `linear_issue_get`, `linear_issue_search` | Read one issue. Search by text, or list by team, state, state type, assignee (`me`), project, priority, labels (any of) and `staleDays`. |
| `linear_issue_comment_add`, `linear_issue_relation_add`, `linear_issue_link_add` | Comment, relate issues, attach a URL. |
| `linear_project_create`, `linear_project_update`, `linear_project_get` | Projects, with `lead`. |
| `linear_project_status_post` | Post a project update with health `onTrack`, `atRisk` or `offTrack`. |
| `linear_milestone_create`, `linear_milestone_update` | Project milestones. |
| `linear_document_create`, `linear_document_update`, `linear_document_get` | Documents in a project or an issue. |

A write op sends one mutation and then reads the result once. If issue creation succeeds and a
relation fails, the error names the new issue and the relations that were and were not created.

## Approval and safety

Typed queries are `read` and typed mutations are `write`. Ergonomic ops have their own tier.
`linear_graphql` gets its tier from the document (a mutation or an unparseable document is
`write`). OMP's approval policy (`tools.approval`, mode tiers) decides every call. The
extension never approves a call itself. `tools.approval: { lm_issueCreate: deny }` stops the call
before any network request.

Every failure names its outcome: `not_sent`, `rejected` (the server refused, nothing applied) or
`unknown` (sent, no trustworthy answer). The extension reports an `unknown` mutation as possibly
applied and never retries it.

## Attribution (`actor=app`)

With an `actor=app` connection (`linear.appCredentialsFile`, or OAuth created with
`/linear-login app`), every mutation that accepts `createAsUser`
(typed tools, raw documents, ergonomic ops) is attributed to the agent that makes the call, and
Linear renders it as "<name> by <app>". The author comes from `ctx.agent`. The main agent sends no
`createAsUser`, so Linear shows the application itself. A subagent sends the display name of its
agent definition, for example `Code Reviewer` for `reviewer` or `Task Agent` for `task`; the table
lives in `src/identity/names.ts`. A name missing from the table is split on `-`/`_` and Title
Cased with known forms kept (`api-reviewer` becomes `API Reviewer`). Parallel subagents attribute
independently. A caller-supplied `createAsUser` that differs from the author is rejected; in the
main session any caller-supplied `createAsUser` is rejected. `actor=user` connections and API keys
send no attribution. Linear history still shows the application as the actor of state changes.

Agents cannot bypass attribution through the credentials. The extension blocks `bash`, `eval`,
`read`, `grep` and `glob` calls that name `linear.appCredentialsFile`, `linear.apiKeyFile` or the
connection store: the absolute path, the `~/`, `$HOME/` and `${HOME}/` forms, and the bare file name
of a configured file. The block also applies to subagents.

## Schema drift

`linear_graphql` sends documents that use names the pinned schema does not know. The result has
`validation: unknown` and lists those names. Typed `lq_*`/`lm_*` selections are strict.

`bun run schema:check --key-file ~/linear.env` compares the pinned schema with live Linear
introspection. It lists live-only and pinned-only root fields, changed arguments, every type whose
definition differs, and ergonomic documents that the live schema rejects or that use a field it
marks deprecated. Exit codes: 0 no drift, 1 drift, 2 request failed.

The pinned schema comes from live introspection, not from the SDK file in linear/linear: that file
lags behind the API. To refresh the pin, run `bun run schema:check --key-file ~/linear.env --write`,
then `bun run generate:catalog`. Introspection shows what the key's workspace can see.

## Development

| Script | Effect |
| --- | --- |
| `bun run check` | The offline gate: `typecheck`, `build:check`, then `bun test test`. CI runs it on every push to `main` and every pull request. |
| `bun run build` | Rebuilds the committed bundle `dist/index.js` from `src/` and writes `dist/index.js.inputs`, a hash of `src/`, `bun.lock` and the build command. Run it after source or dependency changes and commit `dist/`. |
| `bun run build:check` | Fails if `dist/index.js.inputs` does not match the current inputs. The check does not depend on the bun version. |
| `bun run typecheck` | `tsc --noEmit` over `src`, `scripts` and `test`. |
| `bun test test` | Unit tests and real OMP sessions (fake model, fake Linear). |
| `bun run smoke` | Real loader in a separate host process: search, activation, API key, OAuth, attribution, deny. |
| `bun run smoke:binary` | The installed omp binary: `-e` and `extensions:` load paths, `apiKeyFile`, `task` children. |
| `bun run schema:check` | Drift report against live Linear (see [Schema drift](#schema-drift)). |
| `bun run generate:catalog` | Regenerates `generated/catalog.json` from the pinned schema. |

Dependencies, bun and OMP stay on their latest releases. Before work on the repository, run
`bun update --latest`, then `bun run build` and `bun run check`. CI uses the latest bun.

`smoke:binary` runs the `omp` binary on PATH by default (`--omp <bin>` or `OMP_BIN`
changes it). It uses a throwaway HOME and agent dir under `.scratch/`, a fake model and a fake
Linear on loopback. It checks that `linear_tool_search` is the only Linear tool at start and is a
native function, that `linear_issue_get` works in the main agent, in a `task` child and in a
child restricted to `read`, that each Linear request carries the key file value, and that the
key never reaches a model request.

Design notes live in [`docs/research-report.md`](docs/research-report.md). Changes are listed in
[`CHANGELOG.md`](CHANGELOG.md). See [`CONTRIBUTING.md`](CONTRIBUTING.md) before you open a pull
request.

## Security notes

- Secrets never enter tool output, session entries or the model context.
- Error messages from Linear, the token endpoint and revocation are scrubbed of the credentials
  in use and capped in length.
- With no connection, tools fail before any network call.
- Project configs cannot set the endpoint, the key file or the OAuth URLs.
- Each typed or raw call is one HTTP request. An ergonomic write is one mutation and one read.
- Agent tool calls that name a credentials file are blocked (see Attribution).

## License

MIT. See [`LICENSE`](LICENSE).
