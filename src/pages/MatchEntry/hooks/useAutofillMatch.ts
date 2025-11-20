import { useCallback, useState } from "react";
import type { Dispatch, RefObject, SetStateAction } from "react";
import { MIN_GAMES_PER_LINE } from "../constants";
import { determineWinner, renumberLines, todayIso } from "../lineUtils";
import type {
	LineFormState,
	PlayerOption,
	ToastState,
	TeamOption,
} from "../types";

type UseAutofillMatchOptions = {
	lines: LineFormState[];
	setLines: Dispatch<SetStateAction<LineFormState[]>>;
	teams: TeamOption[];
	ensureTeams: () => Promise<TeamOption[]>;
	setHomeTeamId: (value: string) => void;
	setAwayTeamId: (value: string) => void;
	setHomePlayers: Dispatch<SetStateAction<PlayerOption[]>>;
	setAwayPlayers: Dispatch<SetStateAction<PlayerOption[]>>;
	setMatchDate: (value: string) => void;
	setMatchTime: (value: string) => void;
	setLocation: (value: string) => void;
	setToast: Dispatch<SetStateAction<ToastState>>;
	setValidationErrors: Dispatch<SetStateAction<string[]>>;
	getRosterForTeam: (teamId: string) => Promise<PlayerOption[]>;
	rosterCacheRef: RefObject<Map<string, PlayerOption[]>>;
};

const shuffleArray = <T>(items: T[]) => {
	const copy = [...items];
	for (let i = copy.length - 1; i > 0; i -= 1) {
		const j = Math.floor(Math.random() * (i + 1));
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}
	return copy;
};

const pickPlayersForLine = (
	roster: PlayerOption[],
	usage: Map<string, number>
): [string, string] => {
	if (!roster.length) {
		return ["", ""];
	}
	if (roster.length === 1) {
		usage.set(roster[0].id, (usage.get(roster[0].id) ?? 0) + 1);
		return [roster[0].id, roster[0].id];
	}

	const prioritized = [...roster].sort((a, b) => {
		const useA = usage.get(a.id) ?? 0;
		const useB = usage.get(b.id) ?? 0;
		if (useA !== useB) return useA - useB;
		return Math.random() - 0.5;
	});

	const first = prioritized[0];
	const secondPool =
		prioritized.length > 2
			? shuffleArray(prioritized.slice(1, 3))
			: prioritized.slice(1);
	const second =
		secondPool.find((player) => player.id !== first.id) ?? prioritized[1];

	usage.set(first.id, (usage.get(first.id) ?? 0) + 1);
	usage.set(second.id, (usage.get(second.id) ?? 0) + 1);

	return [first.id, second.id];
};

const pickSetScore = (competitiveness: number): [number, number] => {
	const clamped = Math.min(Math.max(competitiveness, 0), 1);
	const closeChance = 0.35 + clamped * 0.4;
	const steadyChance = 0.45 - clamped * 0.25;
	const roll = Math.random();

	if (roll < closeChance) {
		const closeOptions: Array<[number, number]> = [
			[6, 4],
			[7, 5],
			[7, 6],
			[6, 3],
		];
		return closeOptions[Math.floor(Math.random() * closeOptions.length)];
	}

	if (roll < closeChance + steadyChance) {
		const routineOptions: Array<[number, number]> = [
			[6, 3],
			[6, 2],
			[6, 1],
		];
		return routineOptions[
			Math.floor(Math.random() * routineOptions.length)
		];
	}

	const blowouts: Array<[number, number]> = [
		[6, 0],
		[6, 1],
		[6, 2],
	];
	return blowouts[Math.floor(Math.random() * blowouts.length)];
};

const generateGameScores = (
	gamesCount: number,
	winner: "home" | "away",
	competitiveness: number
) => {
	const count = Math.max(gamesCount, MIN_GAMES_PER_LINE);
	const winsNeeded = Math.floor(count / 2) + 1;
	const losingSide = winner === "home" ? "away" : "home";
	const maxLosingSets = Math.max(0, count - winsNeeded);
	const losingSetsTarget = Math.min(
		maxLosingSets,
		Math.round(competitiveness * maxLosingSets + Math.random() * 0.6)
	);

	const setWinners: Array<"home" | "away"> = [
		...Array(winsNeeded).fill(winner),
		...Array(losingSetsTarget).fill(losingSide),
	];

	while (setWinners.length < count) {
		setWinners.push(winner);
	}

	return shuffleArray(setWinners).map((setWinner) => {
		const [winScore, loseScore] = pickSetScore(competitiveness);
		if (setWinner === "home") {
			return { home: String(winScore), away: String(loseScore) };
		}
		return { home: String(loseScore), away: String(winScore) };
	});
};

export const useAutofillMatch = ({
	lines,
	setLines,
	teams,
	ensureTeams,
	setHomeTeamId,
	setAwayTeamId,
	setHomePlayers,
	setAwayPlayers,
	setMatchDate,
	setMatchTime,
	setLocation,
	setToast,
	setValidationErrors,
	getRosterForTeam,
	rosterCacheRef,
}: UseAutofillMatchOptions) => {
	const [isAutofilling, setIsAutofilling] = useState(false);

	const autofillMatch = useCallback(async () => {
		setValidationErrors([]);
		setToast(null);
		setIsAutofilling(true);

		try {
			let availableTeams = teams;
			if (!availableTeams.length) {
				availableTeams = await ensureTeams();
			}

			if (!availableTeams.length) {
				throw new Error("No teams available to autofill.");
			}

			const shuffledTeams = [...availableTeams].sort(
				() => Math.random() - 0.5
			);

			const eligible: Array<{
				team: TeamOption;
				roster: PlayerOption[];
			}> = [];

			for (const team of shuffledTeams) {
				try {
					const roster = await getRosterForTeam(team.id);
					if (roster.length >= 2) {
						eligible.push({ team, roster });
					}
				} catch (error) {
					console.error(error);
				}

				if (eligible.length === 2) {
					break;
				}
			}

			if (eligible.length < 2) {
				throw new Error(
					"Autofill requires at least two teams with available players."
				);
			}

			const [teamOne, teamTwo] = eligible;
			const coinFlip = Math.random() < 0.5;
			const homeEntry = coinFlip ? teamOne : teamTwo;
			const awayEntry = coinFlip ? teamTwo : teamOne;
			const homeUsage = new Map<string, number>();
			const awayUsage = new Map<string, number>();
			const baseHomeEdge = Math.min(
				0.75,
				Math.max(0.35, 0.55 + (Math.random() - 0.5) * 0.15)
			);

			const nextLines = lines.map((line, idx) => {
				const [awayPlayer1Id, awayPlayer2Id] = pickPlayersForLine(
					awayEntry.roster,
					awayUsage
				);
				const [homePlayer1Id, homePlayer2Id] = pickPlayersForLine(
					homeEntry.roster,
					homeUsage
				);
				const lineNoise = (Math.random() - 0.5) * 0.12 - idx * 0.015;
				const homeWinChance = Math.min(
					0.8,
					Math.max(0.3, baseHomeEdge + lineNoise)
				);
				const winnerSide: "home" | "away" =
					Math.random() < homeWinChance ? "home" : "away";
				const competitiveness = Math.min(
					0.95,
					Math.max(
						0.25,
						0.45 +
							Math.random() * 0.35 -
							idx * 0.02 +
							Math.random() * 0.05
					)
				);
				const games = generateGameScores(
					line.games.length,
					winnerSide,
					competitiveness
				);
				const nextLine = {
					...line,
					teamA: {
						player1Id: awayPlayer1Id,
						player2Id: awayPlayer2Id,
					},
					teamH: {
						player1Id: homePlayer1Id,
						player2Id: homePlayer2Id,
					},
					games,
				};
				const computedWinner =
					determineWinner(
						nextLine,
						homeEntry.team.id,
						awayEntry.team.id
					) ??
					(winnerSide === "home"
						? homeEntry.team.id
						: awayEntry.team.id);
				return {
					...nextLine,
					winnerTeamId: computedWinner,
				};
			});

			const fallbackLocation =
				homeEntry.team.location?.trim() ||
				`${homeEntry.team.name} Courts`;

			setHomeTeamId(homeEntry.team.id);
			setAwayTeamId(awayEntry.team.id);
			setHomePlayers(homeEntry.roster);
			setAwayPlayers(awayEntry.roster);
			rosterCacheRef.current.set(homeEntry.team.id, homeEntry.roster);
			rosterCacheRef.current.set(awayEntry.team.id, awayEntry.roster);
			setMatchDate(todayIso());
			setMatchTime("19:00");
			setLocation(fallbackLocation);
			setLines(renumberLines(nextLines));

			setToast({
				type: "success",
				message: `Autofilled ${awayEntry.team.name} at ${homeEntry.team.name}.`,
			});
		} catch (error) {
			console.error(error);
			setToast({
				type: "error",
				message:
					error instanceof Error
						? error.message
						: "Unable to autofill from the database.",
			});
		} finally {
			setIsAutofilling(false);
		}
	}, [
		ensureTeams,
		getRosterForTeam,
		lines,
		rosterCacheRef,
		setAwayPlayers,
		setAwayTeamId,
		setHomePlayers,
		setHomeTeamId,
		setLines,
		setLocation,
		setMatchDate,
		setMatchTime,
		setToast,
		setValidationErrors,
		teams,
	]);

	return { autofillMatch, isAutofilling };
};
