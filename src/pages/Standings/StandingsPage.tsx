import { GlassCard, PageShell } from "../../components";

function Standings() {
	return (
		<PageShell
			title="Standings"
			description="Analyze division standings, head-to-head records, and streaks for the current WPPL season."
		>
			<GlassCard className="text-neutral-300">
				<p className="text-sm">
					Division standings visualizations will plug into this space.
				</p>
			</GlassCard>
		</PageShell>
	);
}

export default Standings;
