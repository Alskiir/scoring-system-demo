import { GlassCard } from "../../../components";
import type { TeamRecord } from "../types";

type TeamDetailsCardProps = {
	team: TeamRecord;
	rosterCount: number;
};

function TeamDetailsCard({ team, rosterCount }: TeamDetailsCardProps) {
	const description = team.location ?? "WPPL team roster powered by Supabase";

	return (
		<GlassCard
			title={team.name}
			description={description}
			details={[
				{
					label: "Location",
					value: team.location ?? "-",
				},
				{
					label: "Home Court",
					value: team.home_court ?? "-",
				},
				{
					label: "Players",
					value: rosterCount ? String(rosterCount) : "-",
				},
			]}
		/>
	);
}

export default TeamDetailsCard;
