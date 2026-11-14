/**
 * Loads exactly one host (argv[2]) and this package through that host's own extension loader:
 * `additionalExtensionPaths` -> `package.json` `omp.extensions` -> `./src/index.ts`, with the
 * extension's `@oh-my-pi/*` imports rewritten by the host to its own module tree.
 *
 * The host gives the session the top-level `ctx.agent` identity (`Main`), so the reported author
 * label is `OMP · Main` only when the loaded extension reads it through the host's own runner.
 * Prints one JSON line (`LoaderPathProof`) on stdout; spawned by `runLoaderPathProof`.
 */
import { getAgentDir } from "@oh-my-pi/pi-coding-agent";
import { ROOT, fakeModelServer, loadHost, openSession } from "./harness";

const hostRoot = process.argv[2];
if (!hostRoot) throw new Error("usage: loader-path.child.ts <hostRoot>");

const host = await loadHost(hostRoot);
const model = fakeModelServer([
 ["linear_tool_search", { i: "Activating", activate: "linear_connections" }],
 ["linear_connections", { i: "Listing" }],
]);
const session = await openSession({
 host,
 agentDir: getAgentDir(),
 sessionManager: host.SessionManager.inMemory(),
 modelUrl: model.url,
 toolNames: ["read"],
 agentId: "Main",
 extras: { additionalExtensionPaths: [ROOT] },
});
try {
 await session.prompt("connections");
 const output = (model.requests[2]?.input ?? [])
  .filter((item): item is { type: string; output: string } => (item as { type?: string }).type === "function_call_output")
  .map(item => item.output)
  .find(o => o.includes('"selected"'));
 if (!output) throw new Error(`linear_connections produced no output: ${JSON.stringify(model.requests.map(r => r.input))}`);
 const parsed = JSON.parse(output) as { author: { label: string } | null; storePath: string };
 console.log(
  JSON.stringify({
   toolNames: session.getAllToolNames(),
   authorLabel: parsed.author?.label ?? null,
   storePath: parsed.storePath,
  }),
 );
} finally {
 await session.dispose();
 model.stop();
}
