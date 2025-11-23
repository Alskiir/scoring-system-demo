import { BaseCard, PageShell } from "../../components";
import ProfileHero from "./components/ProfileHero";
import PlayerStatsGraph from "./components/PlayerStatsGraph";
import TeamHistoryCard from "./components/TeamHistoryCard";
import { usePlayerProfile } from "./hooks/usePlayerProfile";

function PlayerProfilePage() {
	const {
		profile,
		socialStats,
		quickStats,
		partner,
		trend,
		statHighlights,
		teamHistory,
		hasStats,
		hasMatches,
		loading,
		error,
	} = usePlayerProfile();

	let content = null;

	if (error) {
		content = (
			<BaseCard
				title="Unable to load player data"
				description={error}
				footer="Confirm the player id is valid and that Supabase credentials are set in .env."
			/>
		);
	} else if (loading) {
		content = <BaseCard description="Loading player data..." />;
	} else if (!hasStats || !profile) {
		content = (
			<BaseCard description="Add ?playerId=<person id> to load player data." />
		);
	} else {
		content = (
			<div className="flex flex-col gap-6">
				<ProfileHero
					profile={profile}
					socialStats={socialStats}
					quickStats={quickStats}
					partner={partner}
				/>
				{hasMatches ? (
					<PlayerStatsGraph
						trend={trend}
						statHighlights={statHighlights}
					/>
				) : (
					<BaseCard description="No match data recorded for this player yet." />
				)}
				<TeamHistoryCard history={teamHistory} />
			</div>
		);
	}

	return (
		<PageShell
			title="Player Profile"
			description="A snapshot showing a player's profile, stats, and performance trends."
			maxWidthClass="max-w-6xl"
		>
			{content}
		</PageShell>
	);
}

export default PlayerProfilePage;
