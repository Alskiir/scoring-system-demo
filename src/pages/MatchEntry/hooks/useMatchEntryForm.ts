import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";

import { getPlayersForTeam, saveMatch } from "../../../data-access/matches";
import { determineWinner, deriveMatchWinner, todayIso } from "../lineUtils";
import type { PlayerOption, ToastState } from "../types";
import { useTeams } from "../../../hooks/useTeams";
import { useAutofillMatch } from "./useAutofillMatch";
import { useLinesState } from "./useLinesState";
import { useTeamRoster } from "./useTeamRoster";
import { validateMatchEntryForm } from "./validateMatchEntryForm";

export const useMatchEntryForm = () => {
	const rosterCacheRef = useRef<Map<string, PlayerOption[]>>(new Map());
	const {
		teams,
		isLoading: teamsInitialLoading,
		isFetching: teamsFetching,
		error: teamsError,
		refetch: refetchTeams,
	} = useTeams({
		staleTime: 10 * 60_000,
	});
	const teamsLoading =
		teamsInitialLoading || (!teams.length && teamsFetching);
	const [homeTeamId, setHomeTeamId] = useState("");
	const [awayTeamId, setAwayTeamId] = useState("");
	const [homePlayers, setHomePlayers] = useState<PlayerOption[]>([]);
	const [awayPlayers, setAwayPlayers] = useState<PlayerOption[]>([]);
	const {
		lines,
		setLines,
		maxGames,
		resetLines,
		handlePlayerChange,
		handleGameScoreChange,
		handleWinnerChange,
		addGameToLine,
		removeGameFromLine,
		addLine,
		removeLine,
	} = useLinesState(homeTeamId, awayTeamId);
	const [matchDate, setMatchDate] = useState(todayIso());
	const [matchTime, setMatchTime] = useState("");
	const [location, setLocation] = useState("");
	const [toast, setToast] = useState<ToastState>(null);
	const [validationErrors, setValidationErrors] = useState<string[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (!teamsError) {
			return;
		}

		setToast({
			type: "error",
			message: teamsError.message ?? "Unable to load teams.",
		});
	}, [teamsError]);

	const ensureTeamsAvailable = useCallback(async () => {
		if (teams.length) {
			return teams;
		}

		return refetchTeams();
	}, [refetchTeams, teams]);

	const homeRosterQuery = useTeamRoster(homeTeamId, {
		initialData: rosterCacheRef.current.get(homeTeamId) ?? undefined,
		staleTime: 10 * 60_000,
	});
	const awayRosterQuery = useTeamRoster(awayTeamId, {
		initialData: rosterCacheRef.current.get(awayTeamId) ?? undefined,
		staleTime: 10 * 60_000,
	});

	useEffect(() => {
		if (homeTeamId && homeRosterQuery.data !== null) {
			setHomePlayers(homeRosterQuery.roster);
			rosterCacheRef.current.set(homeTeamId, homeRosterQuery.roster);
		} else if (!homeTeamId) {
			setHomePlayers([]);
		}
	}, [homeRosterQuery.data, homeRosterQuery.roster, homeTeamId]);

	useEffect(() => {
		if (homeRosterQuery.error) {
			setToast({
				type: "error",
				message: "Unable to load players for the selected home team.",
			});
		}
	}, [homeRosterQuery.error]);

	useEffect(() => {
		if (awayTeamId && awayRosterQuery.data !== null) {
			setAwayPlayers(awayRosterQuery.roster);
			rosterCacheRef.current.set(awayTeamId, awayRosterQuery.roster);
		} else if (!awayTeamId) {
			setAwayPlayers([]);
		}
	}, [awayRosterQuery.data, awayRosterQuery.roster, awayTeamId]);

	useEffect(() => {
		if (awayRosterQuery.error) {
			setToast({
				type: "error",
				message: "Unable to load players for the selected away team.",
			});
		}
	}, [awayRosterQuery.error]);

	const getRosterForTeam = useCallback(
		async (teamId: string) => {
			if (!teamId) {
				return [];
			}

			const cached = rosterCacheRef.current.get(teamId);
			if (cached) {
				return cached;
			}

			const roster =
				teamId === homeTeamId && homeRosterQuery.data !== null
					? homeRosterQuery.roster
					: teamId === awayTeamId && awayRosterQuery.data !== null
					? awayRosterQuery.roster
					: await getPlayersForTeam(teamId);

			rosterCacheRef.current.set(teamId, roster);
			return roster;
		},
		[
			awayRosterQuery.data,
			awayRosterQuery.roster,
			awayTeamId,
			homeRosterQuery.data,
			homeRosterQuery.roster,
			homeTeamId,
		]
	);

	const { autofillMatch, isAutofilling } = useAutofillMatch({
		lines,
		setLines,
		teams,
		ensureTeams: ensureTeamsAvailable,
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
	});

	const homeTeam = useMemo(
		() => teams.find((team) => team.id === homeTeamId),
		[homeTeamId, teams]
	);
	const awayTeam = useMemo(
		() => teams.find((team) => team.id === awayTeamId),
		[awayTeamId, teams]
	);

	const matchTitle = "Match Entry";

	const resetLinesForTeamChange = useCallback(
		(
			nextTeamId: string,
			opponentTeamId: string,
			homeOrAway: "teamH" | "teamA"
		) => {
			setLines((prev) =>
				prev.map((line) => {
					const clearedLine = {
						...line,
						[homeOrAway]: { player1Id: "", player2Id: "" },
					};
					return {
						...clearedLine,
						winnerTeamId: determineWinner(
							clearedLine,
							homeOrAway === "teamH"
								? nextTeamId
								: opponentTeamId,
							homeOrAway === "teamH" ? opponentTeamId : nextTeamId
						),
					};
				})
			);
		},
		[setLines]
	);

	const handleHomeTeamChange = useCallback(
		(value: string) => {
			setHomeTeamId(value);
			resetLinesForTeamChange(value, awayTeamId, "teamH");
		},
		[awayTeamId, resetLinesForTeamChange]
	);

	const handleAwayTeamChange = useCallback(
		(value: string) => {
			setAwayTeamId(value);
			resetLinesForTeamChange(value, homeTeamId, "teamA");
		},
		[homeTeamId, resetLinesForTeamChange]
	);

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

		const errors = validateMatchEntryForm({
			lines,
			homeTeamId,
			awayTeamId,
			matchDate,
			matchTime,
			location,
		});
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
		autofillMatch,
		isAutofilling,
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
