import { AgentRegistry } from "@oh-my-pi/pi-coding-agent/registry/agent-registry";

export interface Author {
	id: string;
	displayName: string;
	/** Attribution label written into Linear, e.g. `OMP · Main` or `OMP · Reviewer [Build.Reviewer]`. */
	label: string;
}

export const MAIN_AGENT_ID = "Main";

/**
 * Resolves the host-owned identity of the agent that owns `sessionId`.
 * The registry is the only source of truth: an unregistered session has no author and this throws.
 */
export function resolveAuthor(sessionId: string, registry: AgentRegistry = AgentRegistry.global()): Author {
	const ref = registry.list().find(candidate => candidate.session?.sessionManager.getSessionId() === sessionId);
	if (!ref) {
		throw new Error(`linear: session ${sessionId} is not registered in the agent registry; cannot attribute an author`);
	}
	return { id: ref.id, displayName: ref.displayName, label: authorLabel(ref.id, ref.displayName) };
}

export function authorLabel(id: string, displayName: string): string {
	if (id === MAIN_AGENT_ID) return `OMP · ${MAIN_AGENT_ID}`;
	return id === displayName ? `OMP · ${displayName}` : `OMP · ${displayName} [${id}]`;
}
