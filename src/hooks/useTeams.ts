import { getTeams } from "../data";
import type { TeamRecord } from "../types/league";
import { invalidateResource, useAsyncResource } from "./useAsyncResource";

const TEAMS_RESOURCE_KEY = "teams";

type UseTeamsOptions = {
	staleTime?: number;
};

export const useTeams = (options?: UseTeamsOptions) => {
	const result = useAsyncResource<TeamRecord[]>(
		TEAMS_RESOURCE_KEY,
		getTeams,
		{
			initialData: [],
			staleTime: options?.staleTime,
		}
	);

	return {
		...result,
		teams: result.data ?? [],
	};
};

export const invalidateTeamsCache = () =>
	invalidateResource(TEAMS_RESOURCE_KEY);
