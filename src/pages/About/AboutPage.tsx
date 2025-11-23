import { BaseCard, PageShell } from "../../components";

const pageSummaries = [
	{
		title: "Standings",
		description:
			"Leaderboard with team records such as wins, losses, and total points.",
	},
	{
		title: "Match Entry",
		description:
			"Enter in details for each match, including teams, players, and scores.",
	},
	{
		title: "Match History",
		description:
			"Filter by team to review every recorded match, including line scores and points earned." +
			"Use the View Line Breakdown button to view more detailed stats.",
	},
	{
		title: "Teams",
		description:
			"Pick a roster to see team details, roles, and the team's currently registered players.",
	},
	{
		title: "Player Profile",
		description:
			"A deep dive into a player's stats, including matches played, win percentage, and total points earned, as well as their past team memberships.",
	},
	{
		title: "All Tables",
		description:
			"A completely raw Admin-style snapshot of the database tables and views.",
	},
];

const matchEntryHighlights = [
	"Autofill grabs two teams with available rosters, sets a date/time/location, and generates plausible scores for demos.",
	"Line numbers stay tidy as you add or remove rows, and winners recompute automatically whenever scores change.",
	"Validation blocks submits without teams, players, scores, or winners and shows a banner listing what to fix.",
	"Submit writes the match, lines, and each game's scores in sequence to keep related rows in sync.",
];

const setupNotes = [
	{
		title: "Database first",
		description:
			"Reads and writes go straight to Supabase Postgres database via @supabase/supabase-js. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.",
	},
	{
		title: "Player defaults",
		description:
			"Set VITE_DEFAULT_PLAYER_ID to preload the Player Profile. Override anytime with ?playerId=<person uuid> in the URL.",
	},
	{
		title: "Schema at a glance",
		description:
			"Core tables: team, person, team_membership, match, match_line, line_game. Views: team_standings and player_profile.",
	},
	{
		title: "Data-access guardrails",
		description:
			"All Supabase calls live in src/data-access with relation normalization and typed transforms before the UI touches the data.",
	},
];

const reliabilityNotes = [
	"Data stays in Postgres; there are no mock JSON sources or local fallbacks that drift from the database.",
	"useAsyncResource caches per-key responses for a few minutes (teams/rosters up to 10m; All Tables 2m) so revisits are instant but still refresh on demand.",
	"Helpers coerce null/undefined values and trim strings so components render cleanly even when optional fields are missing.",
	"Error copy points directly to missing env vars or Supabase tables/views, making it clear how to fix blocked requests.",
];

function AboutPage() {
	return (
		<PageShell
			title="About the Pickleball League Demo"
			description={
				<>
					This web application serves as a complete hub for a
					database-driven pickleball league, bringing together
					essential features such as up-to-date standings, detailed
					rosters, and in-depth player statistics. Users can easily
					enter match results and access a range of other
					functionalities, all designed to enhance the pickleball
					experience, without ever needing to step outside the
					application. It's a one-stop destination for everything
					related to your league, making it easier than ever to stay
					connected and informed.
					<hr className="my-3 h-px w-150 border-0 bg-(--border-subtle) not-md:w-75" />
					Use the notes below to see what each page covers, which
					environment values it expects, and how data is kept
					resilient for this demo.
				</>
			}
			descriptionAs="div"
			maxWidthClass="max-w-5xl"
			paddingClass="px-6 md:px-10"
		>
			<div className="grid gap-6 md:grid-cols-2">
				<BaseCard
					title="Pages at a glance"
					listItems={pageSummaries.map((section) => ({
						title: section.title,
						description: section.description,
					}))}
				/>
				<BaseCard
					title="Match Entry guardrails"
					description="The busiest workflow lives on Match Entry. These checks keep the flow tight:"
					listItems={matchEntryHighlights.map((item) => ({
						description: item,
					}))}
					listVariant="bullet"
				/>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				<BaseCard
					title="Data & configuration"
					description="Where the data lives and what the app expects when you spin it up:"
					listItems={setupNotes.map((item) => ({
						title: item.title,
						description: item.description,
					}))}
					listColumns={1}
				/>

				<BaseCard
					title="Reliability & caching"
					description="How the UI stays responsive while keeping Supabase as the source of truth:"
					listItems={reliabilityNotes.map((item) => ({
						description: item,
					}))}
					listVariant="bullet"
				/>
			</div>
		</PageShell>
	);
}

export default AboutPage;
