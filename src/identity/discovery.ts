import { AgentRegistry } from "@oh-my-pi/pi-coding-agent/registry/agent-registry";
import { discoverAgents } from "@oh-my-pi/pi-coding-agent/task/discovery";
import type { AgentDefinition } from "@oh-my-pi/pi-coding-agent/task/types";

export interface RosterAgent {
	name: string;
	description: string;
	source: string;
	tools: string[] | null;
}

export interface RosterPeer {
	id: string;
	displayName: string;
	kind: string;
	status: string;
	parentId: string | null;
}

/**
 * `host`: the patched host's `ctx.getEffectiveAgents()` (the task tool's own roster: effective
 * extension roots, session agents, `task.disabledAgents`, spawn policy).
 * `discovery`: pristine host fallback, a bare `discoverAgents(cwd)` without those filters.
 */
export type RosterSource = "host" | "discovery";

export interface Roster {
	cwd: string;
	source: RosterSource;
	agents: RosterAgent[];
	/** Live registry peers at the time of the last refresh or registry change. */
	peers: RosterPeer[];
	discoveredAt: string;
}

/** The slice of `ExtensionContext` the tracker reads; `getEffectiveAgents` exists only on patched hosts. */
export interface RosterContext {
	cwd: string;
	getEffectiveAgents?: () => Promise<AgentDefinition[]>;
}

export interface RosterTracker {
	/** Resolves the roster for `ctx` and replaces the stored one. */
	refresh(ctx: RosterContext): Promise<Roster>;
	current(): Roster | null;
	/** Unsubscribes from the registry; safe to call twice. */
	dispose(): void;
}

async function resolveAgents(ctx: RosterContext): Promise<{ source: RosterSource; agents: AgentDefinition[] }> {
	if (typeof ctx.getEffectiveAgents === "function") {
		return { source: "host", agents: await ctx.getEffectiveAgents() };
	}
	return { source: "discovery", agents: (await discoverAgents(ctx.cwd)).agents };
}

/** Resolves agents on every `refresh` and mirrors registry changes into `peers`. */
export function createRosterTracker(registry: AgentRegistry = AgentRegistry.global()): RosterTracker {
	let roster: Roster | null = null;
	const unsubscribe = registry.onChange(() => {
		if (roster) roster = { ...roster, peers: snapshotPeers(registry) };
	});
	return {
		async refresh(ctx: RosterContext): Promise<Roster> {
			const { source, agents } = await resolveAgents(ctx);
			roster = {
				cwd: ctx.cwd,
				source,
				agents: agents.map(agent => ({
					name: agent.name,
					description: agent.description,
					source: agent.source,
					tools: agent.tools ? [...agent.tools] : null,
				})),
				peers: snapshotPeers(registry),
				discoveredAt: new Date().toISOString(),
			};
			return roster;
		},
		current(): Roster | null {
			return roster;
		},
		dispose(): void {
			unsubscribe();
			roster = null;
		},
	};
}

export async function discoverRoster(ctx: RosterContext, registry?: AgentRegistry): Promise<Roster> {
	const tracker = createRosterTracker(registry);
	try {
		return await tracker.refresh(ctx);
	} finally {
		tracker.dispose();
	}
}

function snapshotPeers(registry: AgentRegistry): RosterPeer[] {
	return registry.list().map(ref => ({
		id: ref.id,
		displayName: ref.displayName,
		kind: ref.kind,
		status: ref.status,
		parentId: ref.parentId ?? null,
	}));
}
