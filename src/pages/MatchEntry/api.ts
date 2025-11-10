import { supabase } from "../../lib/supabaseClient";
import type { LineFormState, PlayerOption, TeamOption } from "./types";

type TeamMembershipRow = {
	person: {
		id: string;
		first_name: string;
		last_name: string;
	} | null;
};

export const fetchTeams = async (): Promise<TeamOption[]> => {
	const { data, error } = await supabase
		.from("team")
		.select("id, name, location")
		.order("name", { ascending: true });

	if (error) {
		throw error;
	}

	return data ?? [];
};

export const fetchPlayersForTeam = async (
	teamId: string
): Promise<PlayerOption[]> => {
	const { data, error } = await supabase
		.from("team_membership")
		.select(
			`
				person:person_id (
					id,
					first_name,
					last_name
				)
			`
		)
		.eq("team_id", teamId)
		.order("person_id", { ascending: true });

	if (error) {
		throw error;
	}

	const typedRows = (data ?? []) as unknown as TeamMembershipRow[];
	return typedRows
		.map((row) => {
			if (!row.person) return null;
			return {
				id: row.person.id,
				fullName: `${row.person.first_name} ${row.person.last_name}`,
			};
		})
		.filter((player): player is PlayerOption => Boolean(player));
};

type SaveMatchArgs = {
	homeTeamId: string;
	awayTeamId: string;
	matchDate: string;
	matchTime: string;
	location: string;
	lines: LineFormState[];
	matchWinnerTeamId: string | null;
};

export const saveMatch = async ({
	homeTeamId,
	awayTeamId,
	matchDate,
	matchTime,
	location,
	lines,
	matchWinnerTeamId,
}: SaveMatchArgs) => {
	const { data: matchRecord, error: matchError } = await supabase
		.from("match")
		.insert([
			{
				home_team_id: homeTeamId,
				away_team_id: awayTeamId,
				match_date: matchDate,
				match_time: matchTime,
				location,
				winner_team_id: matchWinnerTeamId,
			},
		])
		.select()
		.single();

	if (matchError || !matchRecord) {
		throw matchError ?? new Error("Match insert failed.");
	}

	const lineInsertPayload = lines.map((line, idx) => ({
		match_id: matchRecord.id,
		line_number: idx + 1,
		away_player1: line.teamA.player1Id,
		away_player2: line.teamA.player2Id,
		home_player1: line.teamH.player1Id,
		home_player2: line.teamH.player2Id,
		winner_team_id: line.winnerTeamId,
	}));

	const { data: insertedLines, error: linesError } = await supabase
		.from("match_line")
		.insert(lineInsertPayload)
		.select("id, line_number");

	if (linesError || !insertedLines?.length) {
		throw linesError ?? new Error("Unable to create line rows.");
	}

	const lineIdMap = insertedLines.reduce<Record<number, string>>(
		(acc, row) => {
			acc[row.line_number] = row.id;
			return acc;
		},
		{}
	);

	const missingLineId = lines.some((_, idx) => !lineIdMap[idx + 1]);
	if (missingLineId) {
		throw new Error("Line mapping mismatch. Please retry.");
	}

	const gameRows = lines.flatMap((line, idx) => {
		const lineId = lineIdMap[idx + 1];
		return line.games.map((game, gameIdx) => ({
			line_id: lineId,
			game_number: gameIdx + 1,
			home_score: Number(game.home),
			away_score: Number(game.away),
		}));
	});

	const { error: gamesError } = await supabase
		.from("line_game")
		.insert(gameRows);
	if (gamesError) {
		throw gamesError;
	}

	return matchRecord;
};
