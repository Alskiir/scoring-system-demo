import { GlassCard, PageShell } from "../../components";

function Scores() {
	return (
		<PageShell
			title="Scores"
			description="Review recent match results and plan for upcoming fixtures in the WPPL season."
		>
			<GlassCard className="text-neutral-300">
				<p className="text-sm">
					Score tracking widgets will live here.
				</p>
			</GlassCard>
		</PageShell>
	);
}

export default Scores;
