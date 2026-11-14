# Host patch: extension tools in restricted children

`restricted-extension-tools.patch` is a unified diff (`diff -ruN a/src b/src`) against the
pinned OMP host source `@oh-my-pi/pi-coding-agent` **18.2.7** (`node_modules/@oh-my-pi/pi-coding-agent/src`,
identical to commit `d716bcf`). It is applied only to an isolated copy under `.patched-host/`
by `scripts/prepare-patched-host.ts`; the global install (`/usr/bin/omp`, `~/.omp`) and
`node_modules` are never modified.

## What it changes

| File | Change |
| --- | --- |
| `src/config/settings-schema.ts` | New setting `task.restrictedExtensionTools: string[]` (default `[]`). |
| `src/sdk.ts` | Restricted sessions (`restrictToolNames: true`, e.g. plan-mode children) keep extension tools whose names are allowlisted instead of dropping all of them; those names join the explicit `toolNames` to form a `restrictedToolCeiling`. Wires the effective-agents resolver into the extension runner. |
| `src/session/agent-session-types.ts`, `src/session/agent-session.ts`, `src/session/session-tools.ts` | The ceiling is threaded into `SessionTools`; `#applyToolPresentation` rejects any runtime `setActiveTools` selection containing a name outside it. Unrestricted sessions have no ceiling and are unchanged. |
| `src/task/index.ts` | The task tool's roster filtering (`task.disabledAgents`, spawn policy, session-scoped model-mention agents) is extracted into `resolveEffectiveAgents` / `discoverEffectiveAgents`, reused by the tool description and by the extension API below. |
| `src/extensibility/extensions/types.ts`, `src/extensibility/extensions/runner.ts` | `ExtensionContext.getEffectiveAgents(): Promise<AgentDefinition[]>` — exactly the agents the task tool would offer from this session. |

Eight files, 280 diff lines, no behavior change when `task.restrictedExtensionTools` is empty
and the session is not restricted.

## Pinned digests (sha256 of the pristine files)

| File | sha256 |
| --- | --- |
| `src/config/settings-schema.ts` | `277f30e761f891b14827ba38c7b294e7700d652b8834aa6092506ef85591aa3a` |
| `src/extensibility/extensions/runner.ts` | `4c0669c19f3a947fc629c13259e1ed070a977f97424d89ef7a57edf769fb73bb` |
| `src/extensibility/extensions/types.ts` | `5a81d51811007312e77c1a0f25e3ebb1424a3a81a7181280eca9f19b977360f7` |
| `src/sdk.ts` | `ea371761d1a997b5077f984dc9408e1559bc7786aaa10a256934cf93ff261876` |
| `src/session/agent-session-types.ts` | `2fcc7a5bafd406f84aa751c45ec28e8c51fdeae79f7f60be8a87359ae389e653` |
| `src/session/agent-session.ts` | `cc62a8860c30e15aacdfee0a98430ddd3085d434387b99ab7abd82f63c5f5c2a` |
| `src/session/session-tools.ts` | `4d9aeb8450f0b0b4d63a0fad81c1051fe805ddc94c462ff95ab2a8574539101e` |
| `src/task/index.ts` | `6252dc99e7dce761747fad0d29c3de2616bbdfc1fcedb77fb494f4e1a76d6061` |

`scripts/prepare-patched-host.ts` refuses to run when the host version or any digest differs.

## Reproduce

```sh
bun run scripts/prepare-patched-host.ts   # copies src + package.json + CHANGELOG.md, applies the patch
bun test test/host-patch.test.ts          # patched vs pristine behavior, incl. negative controls
```

To regenerate the patch after editing `.patched-host/src` (the host uses tabs; edit with a
tool that preserves them):

```sh
mkdir -p /tmp/omp-patch/a /tmp/omp-patch/b
ln -s "$PWD/node_modules/@oh-my-pi/pi-coding-agent/src" /tmp/omp-patch/a/src
ln -s "$PWD/.patched-host/src" /tmp/omp-patch/b/src
(cd /tmp/omp-patch && diff -ruN a/src b/src | sed -E 's#^(--- |\+\+\+ )([ab]/src/[^\t]*)\t.*#\1\2#') \
  > host-patch/restricted-extension-tools.patch
```

## Applicability caveat

**Compatibility with the installed runtime is UNKNOWN.** The patch is verified against the
18.2.7 TypeScript source only, applied to an isolated copy under `.patched-host/`. The
installed `/usr/bin/omp` reports 18.2.8 and is a compiled binary: the patch was not applied to
it, the binary was not rebuilt, and nothing was installed into the global OMP.
