import { useCallback } from "react";
import {
	getPlayerComputedStats,
	type PlayerComputedStats,
} from "../../../data-access/players";
import { useAsyncResource } from "../../../hooks/useAsyncResource";

type UsePlayerStatsResult = {
	stats: PlayerComputedStats | null;
	loading: boolean;
	error: string | null;
};

const isValidUuid = (value: string) =>
	/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
		value.trim()
	);

export function usePlayerStats(playerId: string): UsePlayerStatsResult {
	const normalizedPlayerId = playerId?.trim() ?? "";
	const isValidId = normalizedPlayerId
		? isValidUuid(normalizedPlayerId)
		: false;

	const fetchPlayerStats = useCallback(
		() => getPlayerComputedStats(normalizedPlayerId),
		[normalizedPlayerId]
	);

	const statsQuery = useAsyncResource<PlayerComputedStats>(
		`playerStats:${normalizedPlayerId || "none"}`,
		fetchPlayerStats,
		{
			enabled: isValidId,
			staleTime: 5 * 60_000,
		}
	);

	const error = !normalizedPlayerId
		? "Add ?playerId=<person id> to load real player data."
		: !isValidId
		? "Player id must be a valid UUID."
		: statsQuery.error?.message ?? null;

	const loading = isValidId
		? statsQuery.isLoading || statsQuery.isFetching
		: false;

	return {
		stats: isValidId ? statsQuery.data : null,
		loading,
		error,
	};
}
