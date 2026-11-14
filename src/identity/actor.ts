import type { ExtensionAgentIdentity } from "@oh-my-pi/pi-coding-agent";

export interface Author {
	id: string;
	displayName: string;
	/** Attribution label written into Linear, e.g. `OMP · Main` or `OMP · task [3-Review]`. */
	label: string;
}

/**
 * The identity of the agent that runs the current call, from the host (`ctx.agent`, OMP >= 18.20.0).
 * The main agent is `OMP · Main`. A subagent is `OMP · <definition name> [<agent id>]`.
 */
export function resolveAuthor(agent: ExtensionAgentIdentity | undefined): Author {
	if (!agent) throw new Error("linear: host does not expose ctx.agent; OMP >= 18.20.0 is required");
	const displayName = agent.kind === "main" ? "Main" : agent.name;
	return { id: agent.id, displayName, label: authorLabel(agent) };
}

export function authorLabel(agent: Pick<ExtensionAgentIdentity, "kind" | "id" | "name">): string {
	if (agent.kind === "main") return "OMP · Main";
	return agent.id && agent.id !== agent.name ? `OMP · ${agent.name} [${agent.id}]` : `OMP · ${agent.name}`;
}
