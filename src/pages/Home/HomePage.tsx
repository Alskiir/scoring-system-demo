import { GlassCard, PageShell } from "../../components";

function Home() {
	return (
		<PageShell
			title="Home"
			description="Welcome to the WPPL scoring system demo. Track league progress, team rosters, and upcoming matches from a single place."
		>
			<GlassCard
				title="Get started"
				description="Use the navigation to explore standings, scores, and teams for the Women's Power Pickleball League."
			/>
		</PageShell>
	);
}

export default Home;
