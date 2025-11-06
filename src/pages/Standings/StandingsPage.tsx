import { GlassCard, PageShell } from "../../components";

function Standings() {
	return (
		<PageShell
			title="Standings"
			description="Analyze division standings, head-to-head records, and streaks for the current WPPL season."
		>
			<GlassCard description="Division standings visualizations will plug into this space." />
		</PageShell>
	);
}

export default Standings;
