import type { ReadonlySessionManager } from "@oh-my-pi/pi-coding-agent";

export const STATE_ENTRY_TYPE = "linear-state";

/** Per-session Linear state. Persisted as a custom session entry, never sent to the model. */
export interface LinearSessionState {
	/** Selected credential id from the connection store, null when nothing is selected. */
	connectionId: string | null;
	/** Currently activated typed/ergonomic tool name, null when only the always-on tools are active. */
	activeOperation: string | null;
	/** Host-provided author of this session (`ctx.agent`), null when the host gives no identity. */
	actor: { id: string; displayName: string; label: string } | null;
}

export function emptyState(): LinearSessionState {
	return { connectionId: null, activeOperation: null, actor: null };
}

interface AppendEntry {
	appendEntry<T>(customType: string, data?: T): void;
}

export function persistState(pi: AppendEntry, state: LinearSessionState): void {
	pi.appendEntry(STATE_ENTRY_TYPE, state);
}

/** Latest `linear-state` entry on the active branch, or an empty state for fresh sessions. */
export function restoreState(sessionManager: Pick<ReadonlySessionManager, "getBranch">): LinearSessionState {
	const branch = sessionManager.getBranch();
	for (let index = branch.length - 1; index >= 0; index--) {
		const entry = branch[index];
		if (entry?.type !== "custom" || entry.customType !== STATE_ENTRY_TYPE) continue;
		return normalize(entry.data);
	}
	return emptyState();
}

function normalize(data: unknown): LinearSessionState {
	const state = emptyState();
	if (!data || typeof data !== "object") return state;
	const raw = data as Record<string, unknown>;
	if (typeof raw.connectionId === "string") state.connectionId = raw.connectionId;
	if (typeof raw.activeOperation === "string") state.activeOperation = raw.activeOperation;
	const actor = raw.actor;
	if (
		actor &&
		typeof actor === "object" &&
		typeof (actor as Record<string, unknown>).id === "string" &&
		typeof (actor as Record<string, unknown>).displayName === "string" &&
		typeof (actor as Record<string, unknown>).label === "string"
	) {
		const a = actor as { id: string; displayName: string; label: string };
		state.actor = { id: a.id, displayName: a.displayName, label: a.label };
	}
	return state;
}
