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

export const computeWinStreaks = (lines: NormalizedPlayerLine[]) => {
	const ordered = [...lines].sort((a, b) => {
		const aTime = a.matchDate?.getTime() ?? 0;
		const bTime = b.matchDate?.getTime() ?? 0;
		return aTime - bTime;
	});

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

	let current = 0;
	for (let index = ordered.length - 1; index >= 0; index -= 1) {
		const result = ordered[index]?.lineWin;
		if (result === true) {
			current += 1;
		} else {
			break;
		}
	}

	return { current, longest };
};

export const buildPartnerStats = (
	lines: NormalizedPlayerLine[]
): PartnerStats | null => {
	const map = new Map<
		string,
		{ name: string; matches: number; wins: number; losses: number }
	>();

	lines.forEach((line) => {
		if (!line.partner) return;
		const entry = map.get(line.partner.id) ?? {
			name: line.partner.fullName,
			matches: 0,
			wins: 0,
			losses: 0,
		};

		entry.matches += 1;
		if (line.lineWin) {
			entry.wins += 1;
		} else if (line.lineWin === false) {
			entry.losses += 1;
		}
		map.set(line.partner.id, entry);
	});

	let best: PartnerStats | null = null;

	for (const [, value] of map) {
		const winPct =
			value.matches > 0
				? Math.round((value.wins / value.matches) * 100)
				: 0;
		const candidate: PartnerStats = {
			name: value.name,
			matches: value.matches,
			wins: value.wins,
			losses: value.losses,
			winPct,
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
	let gamesWon = 0;
	let gamesLost = 0;
	let linesWon = 0;
	let linesLost = 0;
	let pointDifferential = 0;

	lines.forEach((line) => {
		const { games, lineWin } = line;
		if (lineWin === true) linesWon += 1;
		else if (lineWin === false) linesLost += 1;

		games.forEach((game) => {
			const margin = game.forScore - game.againstScore;
			pointDifferential += margin;
			if (margin > 0) gamesWon += 1;
			if (margin < 0) gamesLost += 1;
		});
	});

	const totalMatches = lines.length;
	const winPercentage =
		totalMatches > 0 ? Math.round((linesWon / totalMatches) * 100) : 0;
	const linesPerMatch =
		totalMatches > 0 ? Number((linesWon / totalMatches).toFixed(2)) : 0;
	const avgPointDifferential =
		totalMatches > 0
			? Number((pointDifferential / totalMatches).toFixed(2))
			: 0;

	const trend = lines.slice(-8).map((line) => {
		const diff = line.games.reduce(
			(total, game) => total + (game.forScore - game.againstScore),
			0
		);
		return { label: line.matchLabel, value: diff };
	});

	return {
		gamesWon,
		gamesLost,
		linesWon,
		linesLost,
		totalMatches,
		winPercentage,
		linesPerMatch,
		avgPointDifferential,
		trend,
		pointDifferential,
	};
};
