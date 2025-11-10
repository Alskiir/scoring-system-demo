import { useEffect, useState } from "react";
import { getStandings } from "../../../data";

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

export function useStandingsData(): UseStandingsDataResult {
	const [standings, setStandings] = useState<StandingRecord[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;

		async function loadStandings() {
			setIsLoading(true);
			setError(null);

			try {
				const data = await getStandings();
				if (!isMounted) return;

				const sanitizedStandings: StandingRecord[] = Array.isArray(data)
					? (data as RawStandingRecord[]).map((row) => ({
							team_id: getIdentifier(row),
							team_name:
								getString(row["team_name"]) ??
								getString(row["name"]) ??
								"Unknown Team",
							matches_won: getNumber(row["matches_won"]),
							matches_lost: getNumber(row["matches_lost"]),
							win_percentage: getNumber(row["win_percentage"]),
							total_points: getNumber(row["total_points"]),
					  }))
					: [];

				const sortedStandings = sanitizedStandings.sort(
					(a, b) =>
						(b.total_points ?? Number.NEGATIVE_INFINITY) -
						(a.total_points ?? Number.NEGATIVE_INFINITY)
				);

				setStandings(sortedStandings);
			} catch (err) {
				console.error(err);
				if (isMounted) {
					setError(
						"Unable to load standings. Please confirm your Supabase credentials and try again."
					);
					setStandings([]);
				}
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		}

		loadStandings();

		return () => {
			isMounted = false;
		};
	}, []);

	return { standings, isLoading, error };
}

function getString(value: unknown): string | null {
	if (typeof value === "string") {
		const trimmedValue = value.trim();
		return trimmedValue.length ? trimmedValue : null;
	}
	return null;
}

function getNumber(value: unknown): number | null {
	if (typeof value === "number" && Number.isFinite(value)) {
		return value;
	}

	if (typeof value === "string") {
		const parsed = Number(value);
		return Number.isFinite(parsed) ? parsed : null;
	}

	return null;
}

function getIdentifier(row: RawStandingRecord): string | number | null {
	const candidate = row["team_id"] ?? row["id"];

	if (typeof candidate === "string" || typeof candidate === "number") {
		return candidate;
	}

	return null;
}
