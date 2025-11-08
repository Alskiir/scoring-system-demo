import { useMemo } from "react";
import { FilterDropdown, GlassCard, PageShell, Table } from "../../components";
import { useTeamsPageData } from "./hooks/useTeamsPageData";
import type { TeamRosterEntry } from "./types";

function TeamsPage() {
	const {
		teams,
		teamOptions,
		selectedTeamId,
		setSelectedTeamId,
		teamDetails,
		roster,
		rosterCount,
		isLoadingTeams,
		isLoading,
		error,
	} = useTeamsPageData();

	const tableData = useMemo(
		() =>
			roster.map((entry: TeamRosterEntry) => {
				const { person } = entry;
				const fullName =
					`${person.first_name ?? ""} ${
						person.last_name ?? ""
					}`.trim() || "Unknown Player";

				return [
					fullName,
					entry.role ?? "-",
					person.email ?? "-",
					person.phone_mobile ?? "-",
				];
			}),
		[roster]
	);

	const hasTeams = teams.length > 0;
	const showRoster =
		!isLoading && !error && selectedTeamId && teamDetails !== null;
	const cardDescription =
		teamDetails?.location ?? "WPPL team roster powered by Supabase";

	return (
		<PageShell
			title="Teams"
			description="Select a roster to explore team members and details."
			actions={
				<FilterDropdown
					label="Team"
					placeholder="Select Team"
					value={selectedTeamId}
					onChange={(nextValue) => setSelectedTeamId(nextValue)}
					options={teamOptions}
					disabled={isLoadingTeams || !hasTeams}
					className="md:w-56 md:max-w-none!"
				/>
			}
		>
			{error ? (
				<GlassCard
					title="Something went wrong"
					description={error}
					footer="Confirm your Supabase credentials are configured in the .env file."
				/>
			) : isLoading ? (
				<GlassCard description="Loading team information..." />
			) : showRoster && teamDetails ? (
				<div className="flex flex-col gap-6">
					<GlassCard
						title={teamDetails.name}
						description={cardDescription}
						details={[
							{
								label: "Location",
								value: teamDetails.location ?? "-",
							},
							{
								label: "Home Court",
								value: teamDetails.home_court ?? "-",
							},
							{
								label: "Players",
								value: rosterCount ? String(rosterCount) : "-",
							},
						]}
					/>

					<Table
						headers={["Player", "Role", "Email", "Phone"]}
						data={tableData}
						className="rounded-2xl border border-neutral-800/60 bg-neutral-900/60 shadow-[0_12px_30px_rgba(15,23,42,0.35)] backdrop-blur"
					/>
				</div>
			) : (
				<GlassCard description="Choose a team to view roster details." />
			)}
		</PageShell>
	);
}

export default TeamsPage;
