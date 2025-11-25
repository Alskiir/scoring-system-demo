import type { RawMatchHistoryRow } from "../../data-access/matchHistory";
import type { TeamSelectOption } from "../../types/league";

export type TeamOption = TeamSelectOption;

export type MatchResult = "win" | "loss" | "tie";

export type MatchLinePlayer = {
	id: string;
	fullName: string;
};

export type MatchLineGame = {
	id: string;
	homeScore: number | null;
	awayScore: number | null;
};

export type MatchLineTotals = {
	home: number | null;
	away: number | null;
};

export type MatchLineDetail = {
	id: string;
	lineNumber: number;
	winnerTeamId: string | null;
	result: MatchResult;
	games: MatchLineGame[];
	homePlayers: MatchLinePlayer[];
	awayPlayers: MatchLinePlayer[];
	totalPoints: MatchLineTotals;
};

export type MatchHistoryEntry = {
	id: string;
	teamId: string;
	matchDate: string;
	matchTime: string | null;
	location: string | null;
	opponentName: string;
	opponentId: string;
	isHomeMatch: boolean;
	teamScore: number;
	opponentScore: number;
	result: MatchResult;
	pointsEarned: number;
	gamesWon: number;
	gamesLost: number;
	lines: MatchLineDetail[];
};

export type RawMatchHistory = RawMatchHistoryRow;
