import { GlassCard, PageShell } from "../../components";

function Home() {
	return (
		<PageShell
			title="Home"
			description="Welcome to the WPPL scoring system demo. Track league progress, team rosters, and upcoming matches from a single place."
		>
			<GlassCard className="text-neutral-200" paddingClass="p-8">
				<h2 className="text-xl font-semibold text-neutral-100">
					Get started
				</h2>
				<p className="mt-3 text-sm text-neutral-300">
					Use the navigation to explore standings, scores, and teams
					for the Women's Power Pickleball League.
				</p>
			</GlassCard>
		</PageShell>
	);
}

export default Home;
