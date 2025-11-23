import { getStandings } from "../../../data-access/standings";
import { useAsyncResource } from "../../../hooks/useAsyncResource";
import {
	coerceIdentifierFromRecord,
	coerceNumber,
	coerceString,
} from "../../../utils/dataTransforms";

type RawStandingRecord = Record<string, unknown>;

export type StandingRecord = {
	team_id: string | number | null;
	team_name: string;
	matches_won: number | null;
	matches_lost: number | null;
	win_percentage: number | null;
	total_points: number | null;
};

type UseStandingsDataResult = {
	standings: StandingRecord[];
	isLoading: boolean;
	error: string | null;
};

const STANDINGS_RESOURCE_KEY = "standings";

const sanitizeStandings = (rows: unknown): StandingRecord[] => {
	if (!Array.isArray(rows)) {
		return [];
	}

	const normalized = (rows as RawStandingRecord[]).map((row) => ({
		team_id: coerceIdentifierFromRecord(row, "team_id", "id"),
		team_name:
			coerceString(row["team_name"]) ??
			coerceString(row["name"]) ??
			"Unknown Team",
		matches_won: coerceNumber(row["matches_won"]),
		matches_lost: coerceNumber(row["matches_lost"]),
		win_percentage: coerceNumber(row["win_percentage"]),
		total_points: coerceNumber(row["total_points"]),
	}));

	return normalized.sort(
		(a, b) =>
			(b.total_points ?? Number.NEGATIVE_INFINITY) -
			(a.total_points ?? Number.NEGATIVE_INFINITY)
	);
};

export function useStandingsData(): UseStandingsDataResult {
	const standingsQuery = useAsyncResource<StandingRecord[]>(
		STANDINGS_RESOURCE_KEY,
		async () => {
			const data = await getStandings();
			return sanitizeStandings(data);
		},
		{
			initialData: [],
		}
	);

	return {
		standings: standingsQuery.data ?? [],
		isLoading: standingsQuery.isLoading || standingsQuery.isFetching,
		error: standingsQuery.error?.message ?? null,
	};
}
