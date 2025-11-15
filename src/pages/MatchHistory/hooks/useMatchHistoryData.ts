import { useEffect, useMemo, useState } from "react";
import { getMatchHistoryForTeam } from "../../../data";
import { useAsyncResource } from "../../../hooks/useAsyncResource";
import { useTeams } from "../../../hooks/useTeams";
import type { MatchHistoryEntry, TeamOption } from "../types";
import type { TeamRecord } from "../../../types/league";
import { normalizeMatchHistoryRows } from "./matchHistoryNormalizer";

type UseMatchHistoryDataResult = {
	selectedTeamId: string | null;
	setSelectedTeamId: (nextValue: string | null) => void;
	teamOptions: TeamOption[];
	matches: MatchHistoryEntry[];
	selectedTeam: TeamRecord | null;
	isLoadingTeams: boolean;
	isLoadingMatches: boolean;
	isLoading: boolean;
	error: string | null;
};

export function useMatchHistoryData(
	defaultTeamId?: string
): UseMatchHistoryDataResult {
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

	const matchHistoryKey = selectedTeamId
		? `matchHistory:${selectedTeamId}`
		: "matchHistory:none";

	const matchesQuery = useAsyncResource<MatchHistoryEntry[]>(
		matchHistoryKey,
		async () => {
			if (!selectedTeamId) {
				return [];
			}

			const rows = await getMatchHistoryForTeam(selectedTeamId);
			return normalizeMatchHistoryRows(rows ?? [], selectedTeamId);
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

	const selectedTeam = useMemo<TeamRecord | null>(
		() =>
			selectedTeamId
				? teams.find((team) => String(team.id) === selectedTeamId) ??
				  null
				: null,
		[teams, selectedTeamId]
	);

	const matches =
		selectedTeamId && matchesQuery.data ? matchesQuery.data : [];

	const isLoadingTeams = teamsLoading || teamsFetching;
	const isLoadingMatches = matchesQuery.isLoading || matchesQuery.isFetching;

	const error = teamsError?.message ?? matchesQuery.error?.message ?? null;

	return {
		selectedTeamId,
		setSelectedTeamId,
		teamOptions,
		matches,
		selectedTeam,
		isLoadingTeams,
		isLoadingMatches,
		isLoading: isLoadingTeams || isLoadingMatches,
		error,
	};
}
