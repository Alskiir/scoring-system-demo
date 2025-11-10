import { useEffect, useMemo, useState } from "react";
import { GlassCard, PageShell, Table } from "../../components";
import { getStandings } from "../../data";

type RawStandingRecord = Record<string, unknown>;

type StandingRecord = {
	team_id: string | number | null;
	team_name: string;
	matches_won: number | null;
	matches_lost: number | null;
	win_percentage: number | null;
	total_points: number | null;
};

const tableHeaders = [
	"Team",
	"Matches Won",
	"Matches Lost",
	"Win %",
	"Total Points",
];

function Standings() {
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

				const sortedStandings = [...sanitizedStandings].sort(
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

	const tableData = useMemo(
		() =>
			standings.map((row) => [
				row.team_name,
				formatNumber(row.matches_won),
				formatNumber(row.matches_lost),
				formatWinPercentage(row.win_percentage),
				formatNumber(row.total_points),
			]),
		[standings]
	);

	let content = null;

	if (error) {
		content = (
			<GlassCard
				title="Standings unavailable"
				description={error}
				footer="Confirm that the Supabase view team_standings exists and that your Vite env variables are set."
			/>
		);
	} else if (isLoading) {
		content = <GlassCard description="Loading the latest standings..." />;
	} else if (!standings.length) {
		content = (
			<GlassCard description="Standings data is not available yet. Check back once match results are posted." />
		);
	} else {
		content = (
			<Table
				headers={tableHeaders}
				data={tableData}
				caption=""
				className="rounded-2xl border border-neutral-800/60 bg-neutral-900/60 shadow-[0_12px_30px_rgba(15,23,42,0.35)] backdrop-blur"
			/>
		);
	}

	return (
		<PageShell
			title="Standings"
			description="View team standings based on match results."
		>
			{content}
		</PageShell>
	);
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

function formatNumber(value: number | null): string {
	if (typeof value !== "number" || Number.isNaN(value)) {
		return "-";
	}

	return String(value);
}

function formatWinPercentage(value: number | null): string {
	if (typeof value !== "number" || Number.isNaN(value)) {
		return "-";
	}

	const normalized = value <= 1 ? value * 100 : value;
	return `${normalized.toFixed(1)}%`;
}

export default Standings;
