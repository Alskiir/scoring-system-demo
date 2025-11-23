import type { SupabaseRelation } from "../../types/league";

export type PersonRow = {
	id: string;
	first_name: string;
	last_name: string;
	preferred_name: string | null;
};

export type TeamRow = {
	id: string;
	name: string;
	location: string | null;
};

export type TeamMembershipRow = {
	team_id: string;
	start_date: string | null;
	end_date: string | null;
	team: SupabaseRelation<TeamRow>;
};

export type MatchRow = {
	id: string;
	match_date: string | null;
	match_time: string | null;
	location: string | null;
	home_team_id: string;
	away_team_id: string;
	winner_team_id: string | null;
};

export type LineGameRow = {
	id: string;
	game_number: number | null;
	home_score: number | null;
	away_score: number | null;
};

type PersonRelation = SupabaseRelation<PersonRow>;

export type RawPlayerLineRow = {
	id: string;
	match_id: string;
	line_number: number | null;
	winner_team_id: string | null;
	match: SupabaseRelation<MatchRow>;
	line_game: SupabaseRelation<LineGameRow>;
	home_player1: PersonRelation;
	home_player2: PersonRelation;
	away_player1: PersonRelation;
	away_player2: PersonRelation;
};

export type NormalizedPlayerLine = {
	id: string;
	matchId: string;
	matchDate: Date | null;
	matchLabel: string;
	matchLocation: string | null;
	playerTeamId: string;
	opponentTeamId: string;
	lineNumber: number;
	isHome: boolean;
	lineWin: boolean | null;
	games: {
		forScore: number;
		againstScore: number;
	}[];
	partner?: {
		id: string;
		fullName: string;
	};
};

export type PlayerBasics = {
	playerId: string;
	fullName: string;
	handle: string;
	teamName: string;
	teamLocation: string;
	joinedLabel: string;
	bio: string | null;
	avatarUrl: string | null;
	coverUrl: string | null;
};

export type PartnerStats = {
	name: string;
	matches: number;
	wins: number;
	losses: number;
	winPct: number;
};

export type PlayerProfileRow = {
	handle: string | null;
	bio: string | null;
	avatar_url: string | null;
	cover_url: string | null;
};

export type PlayerComputedStats = {
	basics: PlayerBasics;
	winPercentage: number;
	winStreak: number;
	highestWinStreak: number;
	totalMatches: number;
	gamesWon: number;
	gamesLost: number;
	linesWon: number;
	linesLost: number;
	linesPerMatch: number;
	avgPointDifferential: number;
	trend: { label: string; value: number }[];
	partner: PartnerStats | null;
};
