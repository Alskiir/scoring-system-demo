import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

import { fetchPlayersForTeam, fetchTeams, saveMatch } from "../api";
import { DEFAULT_LINE_COUNT, MIN_GAMES_PER_LINE } from "../constants";
import {
	createEmptyLine,
	determineWinner,
	deriveMatchWinner,
	renumberLines,
	todayIso,
} from "../lineUtils";
import type {
	LineFormState,
	PlayerOption,
	ToastState,
	TeamOption,
} from "../types";

const initialLines = () =>
	Array.from({ length: DEFAULT_LINE_COUNT }, (_, idx) =>
		createEmptyLine(idx + 1)
	);

export const useMatchEntryForm = () => {
	const [teams, setTeams] = useState<TeamOption[]>([]);
	const [teamsLoading, setTeamsLoading] = useState(false);
	const [homeTeamId, setHomeTeamId] = useState("");
	const [awayTeamId, setAwayTeamId] = useState("");
	const [homePlayers, setHomePlayers] = useState<PlayerOption[]>([]);
	const [awayPlayers, setAwayPlayers] = useState<PlayerOption[]>([]);
	const [lines, setLines] = useState<LineFormState[]>(initialLines);
	const [matchDate, setMatchDate] = useState(todayIso());
	const [matchTime, setMatchTime] = useState("");
	const [location, setLocation] = useState("");
	const [toast, setToast] = useState<ToastState>(null);
	const [validationErrors, setValidationErrors] = useState<string[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const maxGames = useMemo(
		() =>
			lines.reduce(
				(max, line) => Math.max(max, line.games.length),
				MIN_GAMES_PER_LINE
			),
		[lines]
	);

	const homeTeam = useMemo(
		() => teams.find((team) => team.id === homeTeamId),
		[homeTeamId, teams]
	);
	const awayTeam = useMemo(
		() => teams.find((team) => team.id === awayTeamId),
		[awayTeamId, teams]
	);

	const matchTitle = useMemo(() => {
		if (homeTeam && awayTeam) {
			return `${awayTeam.name} (A) vs ${homeTeam.name} (H)`;
		}
		if (homeTeam) return `${homeTeam.name} (H)`;
		if (awayTeam) return `${awayTeam.name} (A)`;
		return "Match Entry";
	}, [awayTeam, homeTeam]);

	useEffect(() => {
		let isMounted = true;
		const loadTeams = async () => {
			try {
				setTeamsLoading(true);
				const data = await fetchTeams();
				if (!isMounted) return;
				setTeams(data);
			} catch (error) {
				if (!isMounted) return;
				console.error(error);
				setToast({
					type: "error",
					message: "Unable to load teams from Supabase.",
				});
			} finally {
				if (isMounted) {
					setTeamsLoading(false);
				}
			}
		};

		loadTeams();

		return () => {
			isMounted = false;
		};
	}, []);

	useEffect(() => {
		let isActive = true;
		const loadPlayers = async (
			teamId: string,
			setPlayers: typeof setHomePlayers
		) => {
			if (!teamId) {
				setPlayers([]);
				return;
			}

			try {
				const roster = await fetchPlayersForTeam(teamId);
				if (!isActive) return;
				setPlayers(roster);
			} catch (error) {
				if (!isActive) return;
				console.error(error);
				setToast({
					type: "error",
					message: "Unable to load players for the selected team.",
				});
				setPlayers([]);
			}
		};

		loadPlayers(homeTeamId, setHomePlayers);
		loadPlayers(awayTeamId, setAwayPlayers);

		return () => {
			isActive = false;
		};
	}, [homeTeamId, awayTeamId]);

	const resetLines = () => setLines(initialLines());

	const handleHomeTeamChange = (value: string) => {
		setHomeTeamId(value);
		setLines((prev) =>
			prev.map((line) => {
				const next = {
					...line,
					teamH: { player1Id: "", player2Id: "" },
				};
				return {
					...next,
					winnerTeamId: determineWinner(next, value, awayTeamId),
				};
			})
		);
	};

	const handleAwayTeamChange = (value: string) => {
		setAwayTeamId(value);
		setLines((prev) =>
			prev.map((line) => {
				const next = {
					...line,
					teamA: { player1Id: "", player2Id: "" },
				};
				return {
					...next,
					winnerTeamId: determineWinner(next, homeTeamId, value),
				};
			})
		);
	};

	const handlePlayerChange = (
		lineId: string,
		side: "teamA" | "teamH",
		slot: "player1Id" | "player2Id",
		value: string
	) => {
		setLines((prev) =>
			prev.map((line) => {
				if (line.id !== lineId) return line;
				if (side === "teamA") {
					return {
						...line,
						teamA: { ...line.teamA, [slot]: value },
					};
				}
				return {
					...line,
					teamH: { ...line.teamH, [slot]: value },
				};
			})
		);
	};

	const handleGameScoreChange = (
		lineId: string,
		gameIndex: number,
		field: "home" | "away",
		value: string
	) => {
		setLines((prev) =>
			prev.map((line) => {
				if (line.id !== lineId) return line;

				const games = line.games.map((game, idx) =>
					idx === gameIndex ? { ...game, [field]: value } : game
				);

				const nextLine = { ...line, games };
				return {
					...nextLine,
					winnerTeamId: determineWinner(
						nextLine,
						homeTeamId,
						awayTeamId
					),
				};
			})
		);
	};

	const handleWinnerChange = (lineId: string, value: string) => {
		setLines((prev) =>
			prev.map((line) =>
				line.id === lineId
					? { ...line, winnerTeamId: value || null }
					: line
			)
		);
	};

	const addGameToLine = (lineId: string) => {
		setLines((prev) =>
			prev.map((line) => {
				if (line.id !== lineId) return line;
				const games = [
					...line.games,
					{
						home: "",
						away: "",
					},
				];
				const nextLine = { ...line, games };
				return {
					...nextLine,
					winnerTeamId: determineWinner(
						nextLine,
						homeTeamId,
						awayTeamId
					),
				};
			})
		);
	};

	const removeGameFromLine = (lineId: string) => {
		setLines((prev) =>
			prev.map((line) => {
				if (line.id !== lineId) return line;
				if (line.games.length <= MIN_GAMES_PER_LINE) return line;
				const games = line.games.slice(0, -1);
				const nextLine = { ...line, games };
				return {
					...nextLine,
					winnerTeamId: determineWinner(
						nextLine,
						homeTeamId,
						awayTeamId
					),
				};
			})
		);
	};

	const addLine = () => {
		setLines((prev) => [...prev, createEmptyLine(prev.length + 1)]);
	};

	const removeLine = () => {
		setLines((prev) => {
			if (prev.length === 1) return prev;
			return renumberLines(prev.slice(0, -1));
		});
	};

	const validateForm = () => {
		const errors: string[] = [];
		if (!homeTeamId) errors.push("Select a home team.");
		if (!awayTeamId) errors.push("Select an away team.");
		if (homeTeamId && awayTeamId && homeTeamId === awayTeamId) {
			errors.push("Home and away teams must be different.");
		}
		if (!matchDate) errors.push("Provide a match date.");
		if (!matchTime) errors.push("Provide a start time.");
		if (!location.trim()) errors.push("Enter the match location.");

		lines.forEach((line) => {
			if (!line.teamA.player1Id || !line.teamA.player2Id) {
				errors.push(
					`Line ${line.lineNumber}: select both away players.`
				);
			}
			if (!line.teamH.player1Id || !line.teamH.player2Id) {
				errors.push(
					`Line ${line.lineNumber}: select both home players.`
				);
			}

			line.games.forEach((game, idx) => {
				if (game.away === "" || game.home === "") {
					errors.push(
						`Line ${line.lineNumber}: enter scores for Game ${
							idx + 1
						}.`
					);
				}
			});

			if (!line.winnerTeamId) {
				errors.push(
					`Line ${line.lineNumber}: winner missing or tie detected.`
				);
			}
		});

		return errors;
	};

	const resetForm = () => {
		setHomeTeamId("");
		setAwayTeamId("");
		setHomePlayers([]);
		setAwayPlayers([]);
		setMatchDate(todayIso());
		setMatchTime("");
		setLocation("");
		resetLines();
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setValidationErrors([]);
		setToast(null);

		const errors = validateForm();
		if (errors.length) {
			setValidationErrors(errors);
			setToast({
				type: "error",
				message: "Fix the highlighted issues before submitting.",
			});
			return;
		}

		try {
			setIsSubmitting(true);

			const matchWinnerTeamId = deriveMatchWinner(
				lines,
				homeTeamId,
				awayTeamId
			);

			await saveMatch({
				homeTeamId,
				awayTeamId,
				matchDate,
				matchTime,
				location,
				lines,
				matchWinnerTeamId,
			});

			setToast({
				type: "success",
				message: "Match and lines saved successfully.",
			});
			resetForm();
		} catch (error) {
			console.error(error);
			setToast({
				type: "error",
				message:
					error instanceof Error
						? error.message
						: "Submission failed.",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return {
		teams,
		teamsLoading,
		homeTeamId,
		awayTeamId,
		homePlayers,
		awayPlayers,
		lines,
		matchDate,
		matchTime,
		location,
		toast,
		validationErrors,
		isSubmitting,
		maxGames,
		homeTeam,
		awayTeam,
		matchTitle,
		handleHomeTeamChange,
		handleAwayTeamChange,
		handlePlayerChange,
		handleGameScoreChange,
		handleWinnerChange,
		addGameToLine,
		removeGameFromLine,
		addLine,
		removeLine,
		setMatchDate,
		setMatchTime,
		setLocation,
		handleSubmit,
	};
};
