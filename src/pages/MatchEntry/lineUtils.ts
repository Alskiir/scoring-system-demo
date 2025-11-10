import { DEFAULT_GAMES_PER_LINE } from "./constants";
import type { LineFormState } from "./types";

const makeLineId = () =>
	typeof crypto !== "undefined" && "randomUUID" in crypto
		? crypto.randomUUID()
		: Math.random().toString(36).slice(2);

export const createEmptyLine = (position: number): LineFormState => ({
	id: makeLineId(),
	lineNumber: position,
	teamA: { player1Id: "", player2Id: "" },
	teamH: { player1Id: "", player2Id: "" },
	games: Array.from({ length: DEFAULT_GAMES_PER_LINE }, () => ({
		home: "",
		away: "",
	})),
	winnerTeamId: null,
});

export const determineWinner = (
	line: LineFormState,
	homeTeamId?: string,
	awayTeamId?: string
) => {
	if (!homeTeamId || !awayTeamId) return null;

	let homeGamesWon = 0;
	let awayGamesWon = 0;

	for (const game of line.games) {
		const homeScore = game.home === "" ? Number.NaN : Number(game.home);
		const awayScore = game.away === "" ? Number.NaN : Number(game.away);

		if (Number.isNaN(homeScore) || Number.isNaN(awayScore)) {
			return null;
		}

		if (homeScore === awayScore) continue;
		if (homeScore > awayScore) {
			homeGamesWon += 1;
		} else {
			awayGamesWon += 1;
		}
	}

	if (homeGamesWon === awayGamesWon) return null;
	return homeGamesWon > awayGamesWon ? homeTeamId : awayTeamId;
};

export const todayIso = () => new Date().toISOString().split("T")[0];

export const renumberLines = (lines: LineFormState[]) =>
	lines.map((line, idx) => ({ ...line, lineNumber: idx + 1 }));

export const deriveMatchWinner = (
	lines: LineFormState[],
	homeTeamId: string,
	awayTeamId: string
) => {
	let homeLines = 0;
	let awayLines = 0;

	lines.forEach((line) => {
		if (line.winnerTeamId === homeTeamId) {
			homeLines += 1;
		} else if (line.winnerTeamId === awayTeamId) {
			awayLines += 1;
		}
	});

	if (homeLines === awayLines) {
		return null;
	}

	return homeLines > awayLines ? homeTeamId : awayTeamId;
};
