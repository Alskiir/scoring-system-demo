import type { NormalizedPlayerLine, PartnerStats } from "./api.types";

export type LineAggregates = {
	gamesWon: number;
	gamesLost: number;
	linesWon: number;
	linesLost: number;
	totalMatches: number;
	winPercentage: number;
	linesPerMatch: number;
	avgPointDifferential: number;
	trend: { label: string; value: number }[];
	pointDifferential: number;
};

const isChronological = (lines: NormalizedPlayerLine[]): boolean => {
	for (let index = 1; index < lines.length; index += 1) {
		const prevTime = lines[index - 1]?.matchDate?.getTime() ?? 0;
		const currentTime = lines[index]?.matchDate?.getTime() ?? 0;
		if (currentTime < prevTime) {
			return false;
		}
	}
	return true;
};

const ensureChronological = (
	lines: NormalizedPlayerLine[]
): NormalizedPlayerLine[] =>
	isChronological(lines)
		? lines
		: [...lines].sort((a, b) => {
				const aTime = a.matchDate?.getTime() ?? 0;
				const bTime = b.matchDate?.getTime() ?? 0;
				return aTime - bTime;
		  });

const toPercentage = (wins: number, total: number) =>
	total > 0 ? Math.round((wins / total) * 100) : 0;

const toAverage = (sum: number, count: number, precision = 2) =>
	count > 0 ? Number((sum / count).toFixed(precision)) : 0;

const linePointDifferential = (line: NormalizedPlayerLine) =>
	line.games.reduce(
		(total, game) => total + (game.forScore - game.againstScore),
		0
	);

export const computeWinStreaks = (lines: NormalizedPlayerLine[]) => {
	const ordered = ensureChronological(lines);

	let longest = 0;
	let running = 0;

	for (const line of ordered) {
		if (line.lineWin === true) {
			running += 1;
			if (running > longest) {
				longest = running;
			}
		} else {
			running = 0;
		}
	}

	return { current: running, longest };
};

export const buildPartnerStats = (
	lines: NormalizedPlayerLine[]
): PartnerStats | null => {
	const map = new Map<string, PartnerStats & { winPct?: number }>();

	for (const line of lines) {
		const partner = line.partner;
		if (!partner) continue;

		const entry = map.get(partner.id) ?? {
			name: partner.fullName,
			matches: 0,
			wins: 0,
			losses: 0,
			winPct: 0,
		};

		entry.matches += 1;
		if (line.lineWin === true) {
			entry.wins += 1;
		} else if (line.lineWin === false) {
			entry.losses += 1;
		}

		map.set(partner.id, entry);
	}

	let best: PartnerStats | null = null;

	for (const [, value] of map) {
		const candidate: PartnerStats = {
			name: value.name,
			matches: value.matches,
			wins: value.wins,
			losses: value.losses,
			winPct: toPercentage(value.wins, value.matches),
		};

		if (!best) {
			best = candidate;
			continue;
		}

		if (
			candidate.matches > best.matches ||
			(candidate.matches === best.matches &&
				candidate.winPct > best.winPct)
		) {
			best = candidate;
		}
	}

	return best;
};

export const buildLineAggregates = (
	lines: NormalizedPlayerLine[]
): LineAggregates => {
	const totals = lines.reduce(
		(acc, line) => {
			const { games, lineWin } = line;
			if (lineWin === true) acc.linesWon += 1;
			else if (lineWin === false) acc.linesLost += 1;

			for (const game of games) {
				const margin = game.forScore - game.againstScore;
				acc.pointDifferential += margin;
				if (margin > 0) acc.gamesWon += 1;
				else if (margin < 0) acc.gamesLost += 1;
			}

			return acc;
		},
		{
			gamesWon: 0,
			gamesLost: 0,
			linesWon: 0,
			linesLost: 0,
			pointDifferential: 0,
		}
	);

	const totalMatches = lines.length;
	const trend = lines.slice(-8).map((line) => ({
		label: line.matchLabel,
		value: linePointDifferential(line),
	}));

	return {
		gamesWon: totals.gamesWon,
		gamesLost: totals.gamesLost,
		linesWon: totals.linesWon,
		linesLost: totals.linesLost,
		totalMatches,
		winPercentage: toPercentage(totals.linesWon, totalMatches),
		linesPerMatch: toAverage(totals.linesWon, totalMatches),
		avgPointDifferential: toAverage(totals.pointDifferential, totalMatches),
		trend,
		pointDifferential: totals.pointDifferential,
	};
};
