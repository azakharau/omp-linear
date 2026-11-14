# AGENTS.md

omp-linear is an Oh My Pi (omp) extension for Linear. omp loads the committed bundle
`dist/index.js` (see `omp.extensions` in `package.json`).

Follow [`CONTRIBUTING.md`](CONTRIBUTING.md) for setup, the change workflow, which checks each change
needs, and release steps. `package.json` scripts and [`README.md`](README.md) describe each command.
This file lists only the rules that the code and config do not show.

## Bundle

- A marketplace install copies the repository as it is and installs no dependencies. The host
  provides only `@oh-my-pi/pi-*`. The build keeps those external and bundles everything else,
  `@oh-my-pi/omptype` included.
- After a change in `src/` or `bun.lock`, run `bun run build` and commit `dist/index.js` and
  `dist/index.js.inputs`. `build:check` (part of `bun run check`) fails on a stale bundle.
- `dist/` and `generated/` are build output. Change their sources: `src/`, or
  `schema/linear.schema.graphql` plus `bun run generate:catalog`.

## Schema

- The pinned schema comes from live introspection (`bun run schema:check --write`). The SDK schema
  file in linear/linear lags behind the API, so do not copy it.
- `schema:check` needs a real Linear key. CI and `bun run check` stay offline.

## Secrets

- Tests and smoke scripts use fake keys and a fake Linear on loopback. Keep every real key, token
  and OAuth secret out of the repository, test fixtures and logs.
- Secrets never reach tool output, session entries or the model context. Error text from Linear
  and the token endpoint passes through credential scrubbing. Keep that path for new errors.
- Project configs cannot set the endpoint, the key file or the OAuth URLs. Keep these settings
  user-level only.

## Tool surface

- At session start the only Linear tool is `linear_tool_search`. Other tools activate through
  search. Add a new Linear operation to the catalog or to `src/ops/`, never as an always-on tool.
- Each typed or raw call is one HTTP request. An ergonomic write is one mutation and one read.

## Conventions

- Use neutral examples such as `ENG-123`. Keep real workspace names, issue identifiers and local
  paths out of code, tests and docs: the repository is public.
- A release changes the version in `package.json` and in both `version` fields of
  `.omp-plugin/marketplace.json`. Installed plugins update only when that version changes.
- `smoke:binary` runs `omp` from PATH. If that `omp` is a wrapper script, set `OMP_BIN` to the real
  binary.
- Put temporary files in `.scratch/`. Git ignores it.
