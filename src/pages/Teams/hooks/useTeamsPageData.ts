import { useEffect, useMemo, useState } from "react";
import { getTeam, getTeamRoster, getTeams } from "../../../data";
import { takeFirstRelationValue } from "../../../utils/dataTransforms";
import type {
	TeamMembership,
	TeamOption,
	TeamRecord,
	TeamRosterEntry,
} from "../types";

type UseTeamsPageDataResult = {
	teams: TeamRecord[];
	teamOptions: TeamOption[];
	selectedTeamId: string | null;
	setSelectedTeamId: (nextId: string | null) => void;
	teamDetails: TeamRecord | null;
	roster: TeamRosterEntry[];
	rosterCount: number;
	isLoadingTeams: boolean;
	isLoadingRoster: boolean;
	isLoading: boolean;
	error: string | null;
};

export function useTeamsPageData(
	defaultTeamId?: string
): UseTeamsPageDataResult {
	const [teams, setTeams] = useState<TeamRecord[]>([]);
	const [selectedTeamId, setSelectedTeamId] = useState<string | null>(
		defaultTeamId ?? null
	);
	const [teamDetails, setTeamDetails] = useState<TeamRecord | null>(null);
	const [roster, setRoster] = useState<TeamRosterEntry[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [isLoadingTeams, setIsLoadingTeams] = useState(true);
	const [isLoadingRoster, setIsLoadingRoster] = useState(false);

	useEffect(() => {
		let isMounted = true;

		async function loadTeams() {
			setIsLoadingTeams(true);
			setError(null);

			try {
				const data = await getTeams();
				if (!isMounted) return;

				const sanitizedTeams = (data ?? []).filter((team) =>
					Boolean(team?.id && team?.name)
				);

				setTeams(sanitizedTeams);

				if (sanitizedTeams.length) {
					const fallbackTeamId =
						defaultTeamId ?? String(sanitizedTeams[0].id);

					setSelectedTeamId((prev) => prev ?? fallbackTeamId);
				}
			} catch (err) {
				console.error(err);
				if (isMounted) {
					setError("Unable to load teams. Please try again shortly.");
				}
			} finally {
				if (isMounted) {
					setIsLoadingTeams(false);
				}
			}
		}

		loadTeams();

		return () => {
			isMounted = false;
		};
	}, [defaultTeamId]);

	useEffect(() => {
		if (!selectedTeamId) {
			setTeamDetails(null);
			setRoster([]);
			return;
		}

		let isMounted = true;

		async function loadTeamData(teamId: string) {
			setIsLoadingRoster(true);
			setError(null);

			try {
				const [team, rosterData] = await Promise.all([
					getTeam(teamId),
					getTeamRoster(teamId),
				]);

				if (!isMounted) return;

				setTeamDetails(team ?? null);

				const sanitizedRoster = Array.isArray(rosterData)
					? (rosterData as TeamMembership[])
							.map((entry) => {
								const person = takeFirstRelationValue(
									entry.person
								);

								if (!person) {
									return null;
								}

								return {
									role: entry.role ?? null,
									person,
								};
							})
							.filter(
								(entry): entry is TeamRosterEntry =>
									entry !== null
							)
					: [];

				setRoster(sanitizedRoster);
			} catch (err) {
				console.error(err);
				if (isMounted) {
					setError(
						"Unable to load the selected team's roster. Please try again."
					);
					setRoster([]);
					setTeamDetails(null);
				}
			} finally {
				if (isMounted) {
					setIsLoadingRoster(false);
				}
			}
		}

		loadTeamData(selectedTeamId);

		return () => {
			isMounted = false;
		};
	}, [selectedTeamId]);

	const teamOptions = useMemo<TeamOption[]>(
		() =>
			teams.map((team) => ({
				value: String(team.id),
				label: team.name,
			})),
		[teams]
	);

	return {
		teams,
		teamOptions,
		selectedTeamId,
		setSelectedTeamId,
		teamDetails,
		roster,
		rosterCount: roster.length,
		isLoadingTeams,
		isLoadingRoster,
		isLoading: isLoadingTeams || isLoadingRoster,
		error,
	};
}
