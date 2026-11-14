import type { ExtensionAgentIdentity } from "@oh-my-pi/pi-coding-agent";
import { agentDisplayName } from "./names";

export interface Author {
	id: string;
	displayName: string;
	/**
	 * `createAsUser` name written into Linear (rendered "<name> by <app>"), e.g. `Code Reviewer`.
	 * Null for the main agent: its writes carry no `createAsUser`, so Linear shows the app itself.
	 */
	label: string | null;
}

/**
 * The identity of the agent that runs the current call, from the host (`ctx.agent`, OMP >= 18.20.0).
 * The main agent has no label. A subagent is labelled with the display name of its definition
 * (`src/identity/names.ts`), never its instance id.
 */
export function resolveAuthor(agent: ExtensionAgentIdentity | undefined): Author {
	if (!agent) throw new Error("linear: host does not expose ctx.agent; OMP >= 18.20.0 is required");
	const displayName = agent.kind === "main" ? "Main" : agent.name;
	return { id: agent.id, displayName, label: authorLabel(agent) };
}

export function authorLabel(agent: Pick<ExtensionAgentIdentity, "kind" | "name">): string | null {
	return agent.kind === "main" ? null : agentDisplayName(agent.name);
}
