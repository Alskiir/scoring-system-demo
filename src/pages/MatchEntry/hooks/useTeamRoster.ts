import { useAsyncResource } from "../../../hooks/useAsyncResource";
import { getPlayersForTeam } from "../../../data-access/matches";
import type { PlayerOption } from "../types";

type UseTeamRosterOptions = {
	staleTime?: number;
	initialData?: PlayerOption[];
};

const rosterKey = (teamId: string) =>
	teamId ? `teamRoster:${teamId}` : "teamRoster:none";

export const useTeamRoster = (
	teamId: string,
	options?: UseTeamRosterOptions
) => {
	const normalizedTeamId = teamId?.trim() ?? "";
	const rosterQuery = useAsyncResource<PlayerOption[]>(
		rosterKey(normalizedTeamId),
		() => getPlayersForTeam(normalizedTeamId),
		{
			enabled: Boolean(normalizedTeamId),
			initialData: options?.initialData,
			staleTime: options?.staleTime ?? 10 * 60_000,
		}
	);

	return {
		...rosterQuery,
		roster: rosterQuery.data ?? [],
	};
};
