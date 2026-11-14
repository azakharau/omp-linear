/** Linear display name of a subagent, keyed by its agent definition name (`ctx.agent.name`). */
export const AGENT_DISPLAY_NAMES: Readonly<Record<string, string>> = {
	task: "Task Agent",
	build: "Builder",
	integrator: "Integrator",
	slow: "Senior Engineer",
	sonic: "Quick Helper",
	"python-engineer": "Python Engineer",
	"rust-engineer": "Rust Engineer",
	"typescript-engineer": "TypeScript Engineer",
	"ui-engineer": "UI Engineer",
	"tui-engineer": "TUI Engineer",
	"docs-engineer": "Docs Engineer",
	"data-engineer": "Data Engineer",
	"go-engineer": "Go Engineer",
	reviewer: "Code Reviewer",
	"code-reviewer": "Code Reviewer",
	"architecture-reviewer": "Architecture Reviewer",
	"contract-reviewer": "Contract Reviewer",
	"security-reviewer": "Security Reviewer",
	"performance-reviewer": "Performance Reviewer",
	"tui-reviewer": "TUI Reviewer",
	"ux-ui-reviewer": "UX/UI Reviewer",
	"completion-reviewer": "Completion Reviewer",
	evaluator: "Evaluator",
	scout: "Scout",
	investigate: "Investigator",
	"root-cause-investigator": "Root Cause Investigator",
	researcher: "Researcher",
	seance: "Session Historian",
	brainstorm: "Brainstormer",
	"complex-change-engineer": "Senior Engineer",
	"cross-stack-engineer": "Cross-Stack Engineer",
};

const KNOWN_WORDS: Readonly<Record<string, string>> = {
	ui: "UI",
	tui: "TUI",
	ux: "UX",
	api: "API",
	cli: "CLI",
	sql: "SQL",
	db: "DB",
	qa: "QA",
	mcp: "MCP",
	ai: "AI",
	typescript: "TypeScript",
	javascript: "JavaScript",
	go: "Go",
};

/** Table name, else the definition name split on `-`/`_` in Title Case: `api-reviewer` -> `API Reviewer`. */
export function agentDisplayName(name: string): string {
	const known = Object.hasOwn(AGENT_DISPLAY_NAMES, name) ? AGENT_DISPLAY_NAMES[name] : undefined;
	if (known !== undefined) return known;
	return name
		.split(/[-_]+/)
		.filter(Boolean)
		.map(word => {
			const lower = word.toLowerCase();
			return (Object.hasOwn(KNOWN_WORDS, lower) ? KNOWN_WORDS[lower] : undefined) ?? lower.charAt(0).toUpperCase() + lower.slice(1);
		})
		.join(" ");
}
