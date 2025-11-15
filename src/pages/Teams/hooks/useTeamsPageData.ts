import { useEffect, useMemo, useState } from "react";
import { getTeam, getTeamRoster } from "../../../data";
import { useAsyncResource } from "../../../hooks/useAsyncResource";
import { useTeams } from "../../../hooks/useTeams";
import { takeFirstRelationValue } from "../../../utils/dataTransforms";
import type {
	TeamMembership,
	TeamOption,
	TeamRecord,
	TeamRosterEntry,
} from "../types";

const sanitizeRoster = (rows: unknown): TeamRosterEntry[] => {
	if (!Array.isArray(rows)) {
		return [];
	}

	return (rows as TeamMembership[])
		.map((entry) => {
			const person = takeFirstRelationValue(entry.person);

			if (!person) {
				return null;
			}

			return {
				role: entry.role ?? null,
				person,
			};
		})
		.filter((entry): entry is TeamRosterEntry => entry !== null);
};

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
	const {
		teams,
		isLoading: teamsLoading,
		isFetching: teamsFetching,
		error: teamsError,
	} = useTeams();
	const [selectedTeamId, setSelectedTeamId] = useState<string | null>(
		defaultTeamId ?? null
	);

	useEffect(() => {
		if (!teams.length) {
			return;
		}

		setSelectedTeamId((prev) => {
			if (prev) {
				return prev;
			}

			if (defaultTeamId) {
				const hasDefault = teams.some(
					(team) => String(team.id) === defaultTeamId
				);

				if (hasDefault) {
					return defaultTeamId;
				}
			}

			return String(teams[0].id);
		});
	}, [defaultTeamId, teams]);

	const teamDetailsQuery = useAsyncResource<TeamRecord | null>(
		selectedTeamId ? `team:${selectedTeamId}:details` : "team:none:details",
		async () => {
			if (!selectedTeamId) {
				return null;
			}
			const record = await getTeam(selectedTeamId);
			return record ?? null;
		},
		{
			initialData: null,
			enabled: Boolean(selectedTeamId),
			staleTime: 2 * 60_000,
		}
	);

	const rosterQuery = useAsyncResource<TeamRosterEntry[]>(
		selectedTeamId ? `team:${selectedTeamId}:roster` : "team:none:roster",
		async () => {
			if (!selectedTeamId) {
				return [];
			}

			const rosterData = await getTeamRoster(selectedTeamId);
			return sanitizeRoster(rosterData);
		},
		{
			initialData: [],
			enabled: Boolean(selectedTeamId),
			staleTime: 2 * 60_000,
		}
	);

	const teamOptions = useMemo<TeamOption[]>(
		() =>
			teams.map((team) => ({
				value: String(team.id),
				label: team.name,
			})),
		[teams]
	);

	const teamDetails = teamDetailsQuery.data ?? null;
	const roster = rosterQuery.data ?? [];
	const isLoadingTeams = teamsLoading || teamsFetching;
	const isLoadingRoster =
		teamDetailsQuery.isLoading ||
		teamDetailsQuery.isFetching ||
		rosterQuery.isLoading ||
		rosterQuery.isFetching;

	const error =
		teamsError?.message ??
		teamDetailsQuery.error?.message ??
		rosterQuery.error?.message ??
		null;

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
