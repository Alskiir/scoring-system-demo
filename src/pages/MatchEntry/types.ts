export type TeamOption = {
	id: string;
	name: string;
	location?: string | null;
};

export type PlayerOption = {
	id: string;
	fullName: string;
};

export type GameScore = {
	home: string;
	away: string;
};

export type LineFormState = {
	id: string;
	lineNumber: number;
	teamA: {
		player1Id: string;
		player2Id: string;
	};
	teamH: {
		player1Id: string;
		player2Id: string;
	};
	games: GameScore[];
	winnerTeamId: string | null;
};

export type ToastState = {
	type: "success" | "error";
	message: string;
} | null;
