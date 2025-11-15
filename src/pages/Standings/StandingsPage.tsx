import { BaseCard, PageShell } from "../../components";
import StandingsTable from "./components/StandingsTable";
import { useStandingsData } from "./hooks/useStandingsData";

function Standings() {
	const { standings, isLoading, error } = useStandingsData();

	let content = null;

	if (error) {
		content = (
			<BaseCard
				title="Standings unavailable"
				description={error}
				footer="Confirm that the view team_standings exists and that .env variables are set."
			/>
		);
	} else if (isLoading) {
		content = <BaseCard description="Loading the latest standings..." />;
	} else if (!standings.length) {
		content = (
			<BaseCard description="Standings data is not available yet. Check back once match results are posted." />
		);
	} else {
		content = <StandingsTable standings={standings} />;
	}

	return (
		<PageShell
			title="Standings"
			description="View team standings based on match results."
		>
			{content}
		</PageShell>
	);
}

export default Standings;
