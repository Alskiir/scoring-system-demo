import { useEffect, useState } from "react";
import {
	getPlayerComputedStats,
	type PlayerComputedStats,
} from "../../../data-access/players";

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
	const [stats, setStats] = useState<PlayerComputedStats | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;

		if (!playerId) {
			setStats(null);
			setError("Add ?playerId=<person id> to load real player data.");
			setLoading(false);
			return () => {
				cancelled = true;
			};
		}

		if (!isValidUuid(playerId)) {
			setStats(null);
			setError("Player id must be a valid UUID.");
			setLoading(false);
			return () => {
				cancelled = true;
			};
		}

		setLoading(true);
		setStats(null);
		setError(null);

		getPlayerComputedStats(playerId)
			.then((result) => {
				if (!cancelled) {
					setStats(result);
				}
			})
			.catch((err) => {
				if (!cancelled) {
					setError(
						err instanceof Error
							? err.message
							: "Unable to load player data."
					);
					setStats(null);
				}
			})
			.finally(() => {
				if (!cancelled) {
					setLoading(false);
				}
			});

		return () => {
			cancelled = true;
		};
	}, [playerId]);

	return { stats, loading, error };
}
