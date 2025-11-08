import { useEffect, useMemo, useState } from "react";
import { FilterDropdown, GlassCard, PageShell, Table } from "../../components";
import { getTeam, getTeamRoster, getTeams } from "../../data";

type TeamRecord = {
	id: string;
	name: string;
	location?: string | null;
	home_court?: string | null;
};

type PersonRecord = {
	id: string;
	first_name: string;
	last_name: string;
	email: string | null;
	phone_mobile: string | null;
	birthday?: string | null;
};

type TeamMembership = {
	role: string | null;
	person: PersonRecord;
};

type TeamRosterRow = {
	role: string | null;
	person: PersonRecord | null;
};

function Teams() {
	const [teams, setTeams] = useState<TeamRecord[]>([]);
	const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
	const [teamDetails, setTeamDetails] = useState<TeamRecord | null>(null);
	const [roster, setRoster] = useState<TeamMembership[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [isLoadingTeams, setIsLoadingTeams] = useState(true);
	const [isLoadingRoster, setIsLoadingRoster] = useState(false);

	useEffect(() => {
		let isSubscribed = true;

		async function loadTeams() {
			setIsLoadingTeams(true);
			setError(null);
			try {
				const data = await getTeams();
				if (!isSubscribed) return;
				const sanitizedTeams = (data ?? []).filter(
					(team): team is TeamRecord =>
						Boolean(team?.id && team?.name)
				);
				setTeams(sanitizedTeams);
				if (sanitizedTeams.length) {
					setSelectedTeamId(
						(prev) => prev ?? String(sanitizedTeams[0].id)
					);
				}
			} catch (err) {
				console.error(err);
				if (isSubscribed) {
					setError("Unable to load teams. Please try again shortly.");
				}
			} finally {
				if (isSubscribed) {
					setIsLoadingTeams(false);
				}
			}
		}

		loadTeams();

		return () => {
			isSubscribed = false;
		};
	}, []);

	useEffect(() => {
		if (!selectedTeamId) {
			setTeamDetails(null);
			setRoster([]);
			return;
		}

		const teamId = selectedTeamId;
		let isSubscribed = true;

		async function loadTeamData() {
			setIsLoadingRoster(true);
			setError(null);
			try {
				const [team, rosterData] = await Promise.all([
					getTeam(teamId),
					getTeamRoster(teamId),
				]);
				if (!isSubscribed) return;
				setTeamDetails(team ?? null);
				const rosterRows = Array.isArray(rosterData)
					? (rosterData as unknown as TeamRosterRow[])
					: [];
				const sanitizedRoster = rosterRows
					.filter((entry): entry is TeamMembership =>
						Boolean(entry?.person)
					)
					.map((entry) => ({
						role: entry.role,
						person: entry.person,
					}));
				setRoster(sanitizedRoster);
			} catch (err) {
				console.error(err);
				if (isSubscribed) {
					setError(
						"Unable to load the selected team's roster. Please try again."
					);
					setRoster([]);
					setTeamDetails(null);
				}
			} finally {
				if (isSubscribed) {
					setIsLoadingRoster(false);
				}
			}
		}

		loadTeamData();

		return () => {
			isSubscribed = false;
		};
	}, [selectedTeamId]);

	const teamOptions = useMemo(
		() =>
			teams.map((team) => ({
				value: String(team.id),
				label: team.name,
			})),
		[teams]
	);

	const tableData = useMemo(
		() =>
			roster.map((entry) => {
				const person = entry.person;
				const fullName = person
					? `${person.first_name ?? ""} ${
							person.last_name ?? ""
					  }`.trim() || "Unknown Player"
					: "Unknown Player";

				return [
					fullName,
					entry.role ?? "—",
					person?.email ?? "—",
					person?.phone_mobile ?? "—",
				];
			}),
		[roster]
	);

	const isLoading = isLoadingTeams || isLoadingRoster;
	const hasTeams = teams.length > 0;
	const showRoster =
		!isLoading && !error && selectedTeamId && teamDetails !== null;
	const rosterCount = roster.length;
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
								value: teamDetails.location ?? "—",
							},
							{
								label: "Home Court",
								value: teamDetails.home_court ?? "—",
							},
							{
								label: "Players",
								value: rosterCount ? String(rosterCount) : "—",
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

export default Teams;
