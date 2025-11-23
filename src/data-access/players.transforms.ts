import { coerceNumber, formatFullName } from "../utils/dataTransforms";
import {
	normalizeRelation,
	normalizeRelationArray,
	parseSupabaseDateTime,
} from "./supabaseHelpers";
import type { NormalizedPlayerLine, RawPlayerLineRow } from "./players.types";

const dedupeLinesByMatch = (
	lines: NormalizedPlayerLine[]
): NormalizedPlayerLine[] => {
	const byMatch = new Map<string, NormalizedPlayerLine>();

	for (const line of lines) {
		const existing = byMatch.get(line.matchId);
		if (!existing) {
			byMatch.set(line.matchId, line);
			continue;
		}

		// Prefer the earliest/primary line number for that match, and keep
		// whichever entry has a usable matchDate if one is missing.
		const existingLine = existing.lineNumber ?? Number.POSITIVE_INFINITY;
		const currentLine = line.lineNumber ?? Number.POSITIVE_INFINITY;

		if (!existing.matchDate && line.matchDate) {
			byMatch.set(line.matchId, line);
		} else if (currentLine < existingLine) {
			byMatch.set(line.matchId, line);
		}
	}

	return Array.from(byMatch.values());
};

const matchLabelFormatter = new Intl.DateTimeFormat("en", {
	month: "short",
	day: "numeric",
});

const formatMatchLabel = (matchDate: Date | null): string => {
	if (!matchDate) return "Recent";
	return matchLabelFormatter.format(matchDate);
};

const mapLineRow = (
	row: RawPlayerLineRow,
	index: number,
	playerId: string
): NormalizedPlayerLine | null => {
	const match = normalizeRelation(row.match);
	if (!match) return null;

	const matchDate = parseSupabaseDateTime(match.match_date, match.match_time);
	const matchLabel = formatMatchLabel(matchDate);
	const lineNumber =
		typeof row.line_number === "number" && Number.isFinite(row.line_number)
			? row.line_number
			: index + 1;

	const home1 = normalizeRelation(row.home_player1);
	const home2 = normalizeRelation(row.home_player2);
	const away1 = normalizeRelation(row.away_player1);
	const away2 = normalizeRelation(row.away_player2);

	const isHome = home1?.id === playerId || home2?.id === playerId;
	const hasAway = away1?.id === playerId || away2?.id === playerId;

	if (!isHome && !hasAway) {
		return null;
	}

	const playerTeamId = isHome ? match.home_team_id : match.away_team_id;
	const opponentTeamId = isHome ? match.away_team_id : match.home_team_id;

	const partner = isHome
		? home1?.id === playerId
			? home2
			: home1
		: away1?.id === playerId
		? away2
		: away1;
	const partnerIdentity =
		partner && partner.id
			? {
					id: String(partner.id),
					fullName: formatFullName(
						partner.first_name,
						partner.last_name
					),
			  }
			: undefined;

	const gamesArray = normalizeRelationArray(row.line_game);

	const games = gamesArray
		.map((game) => {
			const homeScore = coerceNumber(game.home_score);
			const awayScore = coerceNumber(game.away_score);

			if (homeScore === null || awayScore === null) {
				return null;
			}

			return {
				forScore: isHome ? homeScore : awayScore,
				againstScore: isHome ? awayScore : homeScore,
			};
		})
		.filter(
			(
				game
			): game is {
				forScore: number;
				againstScore: number;
			} => Boolean(game)
		);

	return {
		id: row.id,
		matchId: row.match_id,
		matchDate,
		matchLabel,
		matchLocation: match.location ?? null,
		playerTeamId: String(playerTeamId),
		opponentTeamId: String(opponentTeamId),
		lineNumber,
		isHome,
		lineWin: row.winner_team_id
			? String(row.winner_team_id) === String(playerTeamId)
			: null,
		games,
		partner: partnerIdentity,
	};
};

export const normalizePlayerLines = (
	rows: RawPlayerLineRow[],
	playerId: string
): NormalizedPlayerLine[] => {
	const normalizedLines = rows.flatMap((row, index) => {
		const normalized = mapLineRow(row, index, playerId);
		return normalized ? [normalized] : [];
	});

	const uniqueMatches = dedupeLinesByMatch(normalizedLines).sort((a, b) => {
		const aTime = a.matchDate?.getTime() ?? 0;
		const bTime = b.matchDate?.getTime() ?? 0;
		return aTime - bTime;
	});

	return uniqueMatches;
};
