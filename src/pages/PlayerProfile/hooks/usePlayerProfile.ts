import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { DEFAULT_PLAYER_ID, DEFAULT_PROFILE_COPY } from "../constants";
import type { PartnerStats } from "../../../data-access/players";
import {
	type PlayerProfile,
	type PlayerProfileViewModel,
	type Stat,
	type StatHighlight,
	type TeamHistoryItem,
	type TrendPoint,
} from "../types";
import { usePlayerStats } from "./usePlayerStats";

const formatSigned = (value: number, suffix = "") => {
	const rounded = Number(value.toFixed(2));
	const prefix = rounded > 0 ? "+" : "";
	return `${prefix}${rounded}${suffix}`;
};

const monthYearFormatter = new Intl.DateTimeFormat("en", {
	month: "short",
	year: "numeric",
});

const formatMonthYear = (value: string | null): string | null => {
	if (!value) return null;
	const parsed = new Date(value);
	return Number.isNaN(parsed.valueOf())
		? null
		: monthYearFormatter.format(parsed);
};

const formatDuration = (start: string | null, end: string | null): string => {
	if (!start) return "Tenure unknown";

	const startDate = new Date(start);
	const endDate = end ? new Date(end) : new Date();

	if (Number.isNaN(startDate.valueOf()) || Number.isNaN(endDate.valueOf())) {
		return "Tenure unknown";
	}

	const months =
		endDate.getFullYear() * 12 +
		endDate.getMonth() -
		(startDate.getFullYear() * 12 + startDate.getMonth());

	const safeMonths = Math.max(months, 0);
	const yearsPortion = Math.floor(safeMonths / 12);
	const remainingMonths = safeMonths % 12;

	const parts: string[] = [];
	if (yearsPortion) {
		parts.push(`${yearsPortion} yr${yearsPortion === 1 ? "" : "s"}`);
	}
	if (remainingMonths) {
		parts.push(`${remainingMonths} mo${remainingMonths === 1 ? "" : "s"}`);
	}

	return parts.length ? parts.join(" ") : "Less than 1 mo";
};

export function usePlayerProfile(): PlayerProfileViewModel {
	const [searchParams] = useSearchParams();
	const playerId = searchParams.get("playerId") ?? DEFAULT_PLAYER_ID;

	const { stats, loading, error } = usePlayerStats(playerId);

	const profile: PlayerProfile | null = useMemo(() => {
		if (!stats) return null;

		return {
			name: stats.basics.fullName,
			handle: stats.basics.handle,
			role: DEFAULT_PROFILE_COPY.role,
			team: stats.basics.teamName,
			location: stats.basics.teamLocation,
			joined: stats.basics.joinedLabel,
			bio: stats.basics.bio,
			coverImage:
				stats.basics.coverUrl ?? DEFAULT_PROFILE_COPY.coverImage,
			avatarImage:
				stats.basics.avatarUrl ?? DEFAULT_PROFILE_COPY.avatarImage,
		};
	}, [stats]);

	const quickStats: Stat[] = useMemo(() => {
		if (!stats) return [];
		return [
			{ label: "Win percentage", value: `${stats.winPercentage}%` },
			{
				label: "Current win streak",
				value: `${stats.winStreak} match${
					stats.winStreak === 1 ? "" : "es"
				}`,
			},
			{
				label: "Highest win streak",
				value: `${stats.highestWinStreak} match${
					stats.highestWinStreak === 1 ? "" : "es"
				}`,
			},
			{ label: "Total matches", value: `${stats.totalMatches} played` },
		];
	}, [stats]);

	const socialStats: Stat[] = useMemo(() => {
		if (!stats) return [];
		return [
			{ label: "Games won", value: `${stats.gamesWon}` },
			{ label: "Games lost", value: `${stats.gamesLost}` },
			{
				label: "Lines won / match",
				value: `${stats.linesPerMatch.toFixed(2)} avg`,
			},
		];
	}, [stats]);

	const trend: TrendPoint[] = useMemo(() => stats?.trend ?? [], [stats]);

	const statHighlights: StatHighlight[] = useMemo(() => {
		if (!stats) return [];
		return [
			{
				label: "Average point differential",
				value: `${formatSigned(stats.avgPointDifferential, " pts")}`,
				change: stats.trend.length
					? `Across the last ${stats.trend.length} matches`
					: "Across recorded matches",
				trend: stats.avgPointDifferential >= 0 ? "up" : "down",
			},
			{
				label: "Games won vs lost",
				value: `${stats.gamesWon} / ${stats.gamesLost}`,
				change: `${stats.gamesWon + stats.gamesLost} total games`,
				trend: stats.winStreak > 0 ? "up" : "down",
			},
			{
				label: "Lines won per match",
				value: `${stats.linesPerMatch.toFixed(2)} avg`,
				change: formatSigned(
					stats.linesPerMatch - 1,
					" vs league average"
				),
				trend: stats.linesPerMatch >= 1 ? "up" : "down",
			},
		];
	}, [stats]);

	const partner: PartnerStats | null = stats?.partner ?? null;

	const teamHistory: TeamHistoryItem[] = useMemo(() => {
		if (!stats) return [];

		return stats.basics.memberships.map((membership) => {
			const startLabel = formatMonthYear(membership.startDate);
			const endLabel = membership.endDate
				? formatMonthYear(membership.endDate)
				: "Present";

			const hasDates = Boolean(startLabel || endLabel);
			const rangeLabel = hasDates
				? `${startLabel ?? "Unknown start"} \u2013 ${
						endLabel ?? "Unknown end"
				  }`
				: "Dates unavailable";

			return {
				id: membership.id,
				teamName: membership.teamName,
				location: membership.teamLocation ?? "Location unknown",
				rangeLabel,
				durationLabel: formatDuration(
					membership.startDate,
					membership.endDate
				),
				isCurrent: !membership.endDate,
			};
		});
	}, [stats]);

	const hasStats = Boolean(stats);
	const hasMatches = Boolean(stats && stats.totalMatches > 0);

	return {
		profile,
		quickStats,
		socialStats,
		trend,
		statHighlights,
		partner,
		teamHistory,
		hasStats,
		hasMatches,
		loading,
		error,
	};
}
