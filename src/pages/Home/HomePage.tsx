import { Link } from "react-router-dom";
import { BaseCard, PageShell } from "../../components";

const PAGE_DESCRIPTIONS: Record<string, string> = {
	standings:
		"View the live table with wins, losses, and point differentials.",
	teams: "Browse team details, rosters, and seed placements.",
	"match-history":
		"Review every recorded match with line scores and outcomes.",
	"match-entry":
		"Enter a new match with lineups, per-game scores, and winners.",
	"player-profile":
		"A player card with statistics, performance trends, and team history.",
	"all-tables": "Inspect the raw PostgreSQL tables that power the demo data.",
	about: "See setup notes, environment assumptions, and data sources.",
};

const linkedPages = [
	{ key: "standings", label: "Standings", path: "/standings" },
	{ key: "teams", label: "Teams", path: "/teams" },
	{ key: "match-history", label: "Match History", path: "/match-history" },
	{ key: "match-entry", label: "Match Entry", path: "/match-entry" },
	{ key: "player-profile", label: "Player Profile", path: "/player-profile" },
	{ key: "all-tables", label: "All Tables", path: "/all-tables" },
	{ key: "about", label: "About", path: "/about" },
].map((link) => ({
	...link,
	description: PAGE_DESCRIPTIONS[link.key] ?? "Open this page.",
}));

function Home() {
	return (
		<PageShell
			title="Pickleball League System Demo"
			description="Record matches, track standings, review rosters, and explore all league data in one place."
		>
			<BaseCard
				title="Pick a page to explore"
				description="Click any link below (or use the navigation bar at the top) to get started!"
			>
				<div className="mt-6 grid gap-3 md:grid-cols-2">
					{linkedPages.map((page) => (
						<Link
							key={page.key}
							to={page.path}
							className="group flex items-start justify-between gap-3 rounded-2xl border border-(--border-subtle) bg-(--surface-panel) px-5 py-4 transition-colors duration-200 hover:border-(--border-highlight) hover:bg-(--surface-hover)"
						>
							<div className="flex flex-col gap-1">
								<span className="text-sm font-semibold text-(--text-primary) transition-colors duration-200 group-hover:text-(--accent)">
									{page.label}
								</span>
								<span className="text-sm text-(--text-muted)">
									{page.description}
								</span>
							</div>
							<span className="text-sm font-semibold text-(--text-muted) transition-colors duration-200 group-hover:text-(--accent)">
								{"\u203A"}
							</span>
						</Link>
					))}
				</div>
			</BaseCard>
		</PageShell>
	);
}

export default Home;
