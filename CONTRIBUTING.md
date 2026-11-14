# Contributing

Thank you for your interest in omp-linear. This guide tells you how to set up the repository, make
a change and open a pull request.

## Before you start

- For a bug, open an issue. Give the omp version (`omp --version`), the plugin version
  (`omp plugin list`), the tool call, and the error text. Remove keys, tokens and private
  workspace data from logs before you paste them.
- For a new feature or a change in tool behavior, open an issue first. Agree on the scope before
  you write code.
- Do not report a security problem in a public issue. Use
  [private vulnerability reporting](https://github.com/azakharau/omp-linear/security/advisories/new).

## Setup

You need the latest [bun](https://bun.sh) and [omp](https://github.com/can1357/oh-my-pi) 18.20.0 or
later. Dependencies, bun and omp stay on their latest releases.

```sh
git clone https://github.com/azakharau/omp-linear.git
cd omp-linear
bun install
bun run check
```

`bun run check` is offline. It needs no Linear key and no model account.

## Repository layout

| Path | Content |
| --- | --- |
| `src/index.ts` | Extension entry: tool registration, `linear_tool_search`, settings. |
| `src/ops/` | Ergonomic tools (`linear_issue_*`, `linear_project_*` and others) and name resolution. |
| `src/auth/`, `src/identity/` | Connections (API key, OAuth, app credentials) and author attribution. |
| `src/schema/`, `src/client/` | Typed catalog, raw GraphQL validation, HTTP client. |
| `src/output/` | Output encoding (JSON or TOON) and its policy. |
| `schema/linear.schema.graphql` | Pinned Linear schema. |
| `generated/` | Catalog generated from the pinned schema. Do not edit by hand. |
| `dist/` | Committed bundle that omp loads. Do not edit by hand. |
| `test/`, `scripts/` | Tests, smoke drivers, build and schema tools. |

## Make a change

1. Create a branch from `main`.
2. Run `bun update --latest`. Commit `package.json` and `bun.lock` if they change.
3. Make the change. Add a test only when the change adds a contract that no test covers, or fixes
   a bug that no test catches.
4. Run `bun run build`. Commit `dist/index.js` and `dist/index.js.inputs`. The marketplace install
   loads `dist/` as it is, so a stale bundle ships old code.
5. Run `bun run check`. It must pass.
6. Run the extra checks that the change needs (see the table below).
7. Add a line for each change that a user can see to [`CHANGELOG.md`](CHANGELOG.md), under the
   section of the next version. Create the section if it does not exist.
8. Open a pull request. Describe the change and list the checks that you ran.

| You change | Also run |
| --- | --- |
| `schema/` or catalog generation | `bun run generate:catalog`, then commit `generated/` |
| Extension loading, tool registration, settings or connections | `bun run smoke` and `bun run smoke:binary` |
| Ergonomic GraphQL documents | `bun run schema:check --key-file <key file>` (needs a real Linear key) |

CI runs `bun run check` on each pull request. It does not run the smoke scripts or the schema
check, so report their results in the pull request.

## Rules

- Never commit keys, tokens or OAuth client secrets. Tests and smoke scripts use fake values and a
  fake Linear on loopback. Keep it that way.
- Never let a secret reach tool output, session entries or the model context. Credentials in error
  text must stay scrubbed.
- Keep the default tool surface small. New Linear operations go to the catalog behind
  `linear_tool_search`, not to new always-on tools.
- Use neutral examples, for example `ENG-123`. Do not put real workspace names, issue identifiers
  or local paths in code, tests or docs.
- Keep `.scratch/` for temporary files. Git ignores it.

## Releases

Maintainers make releases:

1. Set the same version in `package.json` and in both `version` fields of
   `.omp-plugin/marketplace.json`. Installed plugins update only when this version changes.
2. Check the version section in `CHANGELOG.md`: version, date, entries and compare link.
3. Merge the pull request. Then tag the merge commit: `git tag -a vX.Y.Z -m "omp-linear X.Y.Z"` and
   `git push origin vX.Y.Z`.

## License

By contributing, you agree that your contribution is licensed under the [MIT License](LICENSE).
