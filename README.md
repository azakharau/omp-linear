# omp-linear

Native Oh My Pi extension for Linear: 550 typed GraphQL operations (`lq_*` queries, `lm_*`
mutations) generated from the pinned Linear schema, 12 ergonomic ops (`linear_issue_create`,
`linear_issue_transition`, ...), a raw `linear_graphql` tool, schema help and connection listing.

Exactly one Linear tool is visible to the model at any time by default: `linear_tool_search`.
It returns ranked candidates from the private catalog and, with `activate: <exact name>`, swaps
a single Linear operation into the active set (replacing the previously activated one).

## Install

```sh
bun install
bun run generate:catalog      # writes generated/catalog.json from schema/linear.schema.graphql
```

The package manifest declares `omp.extensions: ["./src/index.ts"]`, so pointing an OMP
extension root at this directory loads it. Programmatically:
`createAgentSession({ extensions: [createLinearExtension(options)] })`.

The `@oh-my-pi/*` packages are peer dependencies pinned to the host version (18.2.7); the
extension resolves host modules through them at runtime.

**Compatibility with the installed runtime is UNKNOWN.** Everything here is verified against the
18.2.7 TypeScript host source in `node_modules` only. The installed `/usr/bin/omp` reports
18.2.8 (a compiled binary); the extension has not been installed into it and has not been run
against it.

## Settings and environment

- OAuth for `/linear-login` is configured in the OMP settings (`.omp/config.yml` of the project
  or the global config; project wins), block `linear.oauth`:

  ```yaml
  linear:
    oauth:
      clientId: <client id of the Linear OAuth application>
      clientSecret: <optional>
      redirectPort: <port of the registered redirect URI>
      redirectPath: /callback     # optional, default /callback
      scopes: [read, write, issues:create, comments:create]   # optional defaults
      authorizeUrl / tokenUrl / revokeUrl: optional overrides
  ```

  `redirectPort` is REQUIRED and must be the port of the redirect URI registered with the
  application (`http://127.0.0.1:<redirectPort><redirectPath>`); the extension never falls back
  to an ephemeral port because Linear would reject such a redirect URI. `LINEAR_OAUTH_CLIENT_ID`
  / `LINEAR_OAUTH_CLIENT_SECRET` in the environment override the client credentials only.
  **Registering a Linear OAuth application is an unresolved user prerequisite**: no client id
  exists in this repository or its tests. Without `clientId` and `redirectPort`, `/linear-login`
  reports exactly what is missing and does nothing; it never fabricates credentials. Use
  `/linear-key` instead.
- `linear.endpoint` (same settings block) overrides the GraphQL endpoint
  (`https://api.linear.app/graphql`); used by the smoke to point at a loopback fake. A malformed
  `linear.*` block makes `/linear-login` report the offending key (`linear.oauth.redirectPort`, ...)
  and store nothing.
- Credentials are stored at `<agentDir>/linear/connections.json` (dir `0700`, file `0600`),
  never under the project directory. `linear_connections` lists them without secrets.
- Host-patch only: `task.restrictedExtensionTools` (see `host-patch/README.md`).

## Commands

| Command | Effect |
| --- | --- |
| `/linear-login [user\|app] [label]` | OAuth PKCE login via loopback callback; stores and selects the connection. |
| `/linear-key [label]` | Prompts for a personal API key in a dialog; stores and selects it. |
| `/linear-use <id>` | Selects a stored connection for this session (persisted as a `linear-state` entry). |
| `/linear-logout [id]` | Revokes (OAuth) and removes a connection. |

## Approval

Typed queries are `read`, typed mutations are `write`; ergonomic ops carry their own tier;
`linear_graphql` is classified per document against the pinned schema (mutations → `write`,
unparseable → `write`). Every tier flows through OMP's native approval policy (`tools.approval`,
mode tiers); the extension never auto-approves. A `tools.approval: { lm_issueCreate: "deny" }`
entry blocks the call before any network request.

## Schema drift and outcomes

`linear_graphql` documents that use names the pinned schema does not know (post-pin fields,
arguments, types, input fields, enum values) are still sent: the result carries
`validation: unknown` and lists the unpinned names; the server decides. Typed `lq_*`/`lm_*`
selections are strict and cannot introduce a sibling root field. `linear_schema_help` describes
any pinned name (operation, object, input, enum, ...).

Every failure names its outcome: `not_sent`, `rejected` (server refused; nothing applied) or
`unknown` (sent, no trustworthy answer: timeout, 5xx, malformed body). An unknown-outcome
mutation is reported as possibly applied and is never retried or refetched automatically.

## Attribution (`actor=app`)

With an OAuth connection created as `actor=app`, every mutation whose input accepts
`createAsUser` (typed tools, raw documents, ergonomic ops) is attributed to the calling OMP
session: `OMP · Main`, `OMP · <name> [<id>]`. The author is resolved per call from the host
agent registry, so parallel child sessions attribute independently. A caller-supplied
`createAsUser` that differs from the session author is rejected. `actor=user` connections send
no attribution.

## Verify

```sh
bun test test/extension.test.ts                                   # end-to-end in a real OMP session, fake model + fake Linear
bun run scripts/prepare-patched-host.ts && bun test test/host-patch.test.ts
bunx tsc --noEmit -p tsconfig.json
bun run smoke                                                     # prepares the patched host, then scripts/smoke.ts
```

`bun run smoke` drives real sessions through the real loader (one process per host,
`scripts/smoke-host.ts`) against a fake Linear GraphQL server and a fake OAuth issuer on
loopback: tool search, activation, an api_key call, PKCE login and an `actor=app` raw mutation
attributed to `OMP · Main`, a `tools.approval` deny (zero requests), and a restricted child on the
patched host. It prints a JSON PASS/FAIL summary per step and exits non-zero on any FAIL.

Both suites also load the package the way a real host does — `additionalExtensionPaths` →
`package.json` `omp.extensions` → `src/index.ts` — in a separate process per host
(`test/loader-path.child.ts`), proving the host rewrites the extension's `@oh-my-pi/*` imports
onto its own module instances (one `AgentRegistry`) and that credentials land under the host
agent dir. One host per process matters: the host's specifier shim is a process-global `Bun.plugin`.

## Host patch

Restricted child sessions (plan mode) drop every extension tool. `host-patch/` adds an allowlist
setting, a per-child tool ceiling and `ctx.getEffectiveAgents()`; it is applied only to an
isolated copy of the 18.2.7 host source. Whether it applies to the installed 18.2.8 binary is
UNKNOWN: not verified, not installed.

## Security notes

- Secrets never enter tool output, session entries, or the model context.
- No connection selected → tools fail before any network call.
- Each typed/raw call is one HTTP request; ergonomic mutations are one mutation plus one refetch.
