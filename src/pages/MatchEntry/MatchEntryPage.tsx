import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { PageShell } from "../../components";
import { supabase } from "../../lib/supabaseClient";

type TeamOption = {
	id: string;
	name: string;
	location?: string | null;
};

type PlayerOption = {
	id: string;
	fullName: string;
};

type TeamMembershipRow = {
	person: {
		id: string;
		first_name: string;
		last_name: string;
	} | null;
};

type GameScore = {
	home: string;
	away: string;
};

type LineFormState = {
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

type ToastState = {
	type: "success" | "error";
	message: string;
} | null;

const DEFAULT_LINE_COUNT = 5;
const GAME_COUNT = 3;

const makeLineId = () =>
	typeof crypto !== "undefined" && "randomUUID" in crypto
		? crypto.randomUUID()
		: Math.random().toString(36).slice(2);

const createEmptyLine = (position: number): LineFormState => ({
	id: makeLineId(),
	lineNumber: position,
	teamA: { player1Id: "", player2Id: "" },
	teamH: { player1Id: "", player2Id: "" },
	games: Array.from({ length: GAME_COUNT }, () => ({ home: "", away: "" })),
	winnerTeamId: null,
});

const determineWinner = (
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

const todayIso = () => new Date().toISOString().split("T")[0];

const renumberLines = (lines: LineFormState[]) =>
	lines.map((line, idx) => ({ ...line, lineNumber: idx + 1 }));

const deriveMatchWinner = (
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

const MatchEntryPage = () => {
	const [teams, setTeams] = useState<TeamOption[]>([]);
	const [teamsLoading, setTeamsLoading] = useState(false);
	const [homeTeamId, setHomeTeamId] = useState("");
	const [awayTeamId, setAwayTeamId] = useState("");
	const [homePlayers, setHomePlayers] = useState<PlayerOption[]>([]);
	const [awayPlayers, setAwayPlayers] = useState<PlayerOption[]>([]);
	const [lines, setLines] = useState<LineFormState[]>(() =>
		Array.from({ length: DEFAULT_LINE_COUNT }, (_, idx) =>
			createEmptyLine(idx + 1)
		)
	);
	const [matchDate, setMatchDate] = useState(todayIso());
	const [matchTime, setMatchTime] = useState("");
	const [location, setLocation] = useState("");
	const [toast, setToast] = useState<ToastState>(null);
	const [validationErrors, setValidationErrors] = useState<string[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);

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
		const fetchTeams = async () => {
			try {
				setTeamsLoading(true);
				const { data, error } = await supabase
					.from("team")
					.select("id, name, location")
					.order("name", { ascending: true });

				if (!isMounted) return;

				if (error) {
					console.error(error);
					setToast({
						type: "error",
						message: "Unable to load teams from Supabase.",
					});
					return;
				}

				setTeams(data ?? []);
			} finally {
				if (isMounted) {
					setTeamsLoading(false);
				}
			}
		};

		fetchTeams();

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

			if (!isActive) return;

			if (error) {
				console.error(error);
				setToast({
					type: "error",
					message: "Unable to load players for the selected team.",
				});
				setPlayers([]);
				return;
			}

			const typedRows = (data ?? []) as unknown as TeamMembershipRow[];
			const roster = typedRows
				.map((row) => {
					if (!row.person) return null;
					return {
						id: row.person.id,
						fullName: `${row.person.first_name} ${row.person.last_name}`,
					};
				})
				.filter((player): player is PlayerOption => Boolean(player));

			setPlayers(roster);
		};

		loadPlayers(homeTeamId, setHomePlayers);
		loadPlayers(awayTeamId, setAwayPlayers);

		return () => {
			isActive = false;
		};
	}, [homeTeamId, awayTeamId]);

	const resetLines = () =>
		setLines(
			Array.from({ length: DEFAULT_LINE_COUNT }, (_, idx) =>
				createEmptyLine(idx + 1)
			)
		);

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
			if (gamesError) throw gamesError;

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

	const renderPlayerSelect = (
		lineId: string,
		side: "teamA" | "teamH",
		slot: "player1Id" | "player2Id",
		value: string,
		options: PlayerOption[],
		placeholder: string,
		disabled: boolean
	) => (
		<select
			className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
			value={value}
			onChange={(event) =>
				handlePlayerChange(lineId, side, slot, event.target.value)
			}
			disabled={disabled}
		>
			<option value="">
				{disabled ? "Select team first" : placeholder}
			</option>
			{options.map((player) => (
				<option key={player.id} value={player.id}>
					{player.fullName}
				</option>
			))}
		</select>
	);

	const renderGameColumn = (
		lineId: string,
		gameIndex: number,
		game: GameScore
	) => (
		<td key={`${lineId}-game-${gameIndex}`} className="px-3 py-4 align-top">
			<div className="flex flex-col gap-2">
				<label className="text-[11px] uppercase tracking-wide text-cyan-200">
					Game {gameIndex + 1}
				</label>
				<div className="flex items-center gap-2 text-xs text-white/70">
					<span className="w-4 text-right">A</span>
					<input
						type="number"
						min={0}
						value={game.away}
						onChange={(event) =>
							handleGameScoreChange(
								lineId,
								gameIndex,
								"away",
								event.target.value
							)
						}
						className="w-20 rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-sm text-white outline-none focus:border-cyan-400"
					/>
				</div>
				<div className="flex items-center gap-2 text-xs text-white/70">
					<span className="w-4 text-right">H</span>
					<input
						type="number"
						min={0}
						value={game.home}
						onChange={(event) =>
							handleGameScoreChange(
								lineId,
								gameIndex,
								"home",
								event.target.value
							)
						}
						className="w-20 rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-sm text-white outline-none focus:border-cyan-400"
					/>
				</div>
			</div>
		</td>
	);

	return (
		<PageShell
			title={matchTitle}
			description="Enter WPPL match results, lineups, and per-game scores. Winners auto-calculate but stay editable."
			maxWidthClass="max-w-7xl"
		>
			<form className="space-y-10" onSubmit={handleSubmit}>
				{toast ? (
					<div
						className={`rounded-2xl border px-4 py-3 text-sm ${
							toast.type === "success"
								? "border-emerald-400/70 text-emerald-100"
								: "border-red-500/70 text-red-100"
						}`}
					>
						{toast.message}
					</div>
				) : null}

				{validationErrors.length ? (
					<div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-100">
						<ul className="list-disc space-y-1 pl-5">
							{validationErrors.map((error) => (
								<li key={error}>{error}</li>
							))}
						</ul>
					</div>
				) : null}

				<section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
					<div className="grid gap-6 md:grid-cols-2">
						<div className="space-y-2">
							<label className="text-sm text-white/70">
								Home Team (H)
							</label>
							<select
								className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:border-cyan-400"
								value={homeTeamId}
								onChange={(event) =>
									handleHomeTeamChange(event.target.value)
								}
							>
								<option value="">
									{teamsLoading ? "Loading..." : "Select"}
								</option>
								{teams.map((team) => (
									<option
										key={team.id}
										value={team.id}
										disabled={team.id === awayTeamId}
									>
										{team.name}
									</option>
								))}
							</select>
						</div>
						<div className="space-y-2">
							<label className="text-sm text-white/70">
								Away Team (A)
							</label>
							<select
								className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:border-cyan-400"
								value={awayTeamId}
								onChange={(event) =>
									handleAwayTeamChange(event.target.value)
								}
							>
								<option value="">
									{teamsLoading ? "Loading..." : "Select"}
								</option>
								{teams.map((team) => (
									<option
										key={team.id}
										value={team.id}
										disabled={team.id === homeTeamId}
									>
										{team.name}
									</option>
								))}
							</select>
						</div>
					</div>

					<div className="mt-6 grid gap-6 md:grid-cols-3">
						<div className="space-y-2">
							<label className="text-sm text-white/70">
								Match Date
							</label>
							<input
								type="date"
								className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:border-cyan-400"
								value={matchDate}
								onChange={(event) =>
									setMatchDate(event.target.value)
								}
							/>
						</div>
						<div className="space-y-2">
							<label className="text-sm text-white/70">
								Match Time
							</label>
							<input
								type="time"
								className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:border-cyan-400"
								value={matchTime}
								onChange={(event) =>
									setMatchTime(event.target.value)
								}
							/>
						</div>
						<div className="space-y-2 md:col-span-1">
							<label className="text-sm text-white/70">
								Location
							</label>
							<input
								type="text"
								placeholder="Clubhouse courts"
								className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:border-cyan-400"
								value={location}
								onChange={(event) =>
									setLocation(event.target.value)
								}
							/>
						</div>
					</div>
				</section>

				<section className="rounded-3xl border border-white/10 bg-white/5 p-4 md:p-6">
					<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
						<div>
							<p className="text-lg font-semibold text-white">
								Lines
							</p>
							<p className="text-sm text-white/60">
								Default view shows five lines — add or remove as
								needed.
							</p>
						</div>
						<div className="flex gap-3">
							<button
								type="button"
								onClick={removeLine}
								className="rounded-2xl border border-white/15 px-4 py-2 text-sm text-white hover:border-red-400 hover:text-red-100 disabled:opacity-40"
								disabled={lines.length === 1}
							>
								Remove Line
							</button>
							<button
								type="button"
								onClick={addLine}
								className="rounded-2xl border border-cyan-400/50 px-4 py-2 text-sm text-cyan-100 hover:border-cyan-300"
							>
								Add Line
							</button>
						</div>
					</div>

					<div className="overflow-x-auto">
						<table className="w-full min-w-[960px] text-left text-sm text-white/80">
							<thead>
								<tr className="text-xs uppercase tracking-wide text-white/50">
									<th className="px-3 py-3">Line</th>
									<th className="px-3 py-3">Player 1 (A)</th>
									<th className="px-3 py-3">Player 2 (A)</th>
									<th className="px-3 py-3">Player 1 (H)</th>
									<th className="px-3 py-3">Player 2 (H)</th>
									{Array.from(
										{ length: GAME_COUNT },
										(_, idx) => (
											<th
												key={`game-head-${idx}`}
												className="px-3 py-3"
											>
												Game {idx + 1}
											</th>
										)
									)}
									<th className="px-3 py-3">Winner</th>
								</tr>
							</thead>
							<tbody>
								{lines.map((line) => (
									<tr
										key={line.id}
										className="border-t border-white/5 text-sm text-white/80"
									>
										<td className="px-3 py-4 font-semibold text-white">
											Line {line.lineNumber}
										</td>
										<td className="px-3 py-4">
											{renderPlayerSelect(
												line.id,
												"teamA",
												"player1Id",
												line.teamA.player1Id,
												awayPlayers,
												"Player 1",
												!awayTeamId
											)}
										</td>
										<td className="px-3 py-4">
											{renderPlayerSelect(
												line.id,
												"teamA",
												"player2Id",
												line.teamA.player2Id,
												awayPlayers,
												"Player 2",
												!awayTeamId
											)}
										</td>
										<td className="px-3 py-4">
											{renderPlayerSelect(
												line.id,
												"teamH",
												"player1Id",
												line.teamH.player1Id,
												homePlayers,
												"Player 1",
												!homeTeamId
											)}
										</td>
										<td className="px-3 py-4">
											{renderPlayerSelect(
												line.id,
												"teamH",
												"player2Id",
												line.teamH.player2Id,
												homePlayers,
												"Player 2",
												!homeTeamId
											)}
										</td>
										{line.games.map((game, idx) =>
											renderGameColumn(line.id, idx, game)
										)}
										<td className="px-3 py-4">
											<select
												className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:border-cyan-400 disabled:opacity-50"
												value={line.winnerTeamId ?? ""}
												onChange={(event) =>
													handleWinnerChange(
														line.id,
														event.target.value
													)
												}
												disabled={
													!homeTeamId || !awayTeamId
												}
											>
												<option value="">
													Select winner
												</option>
												{awayTeamId ? (
													<option value={awayTeamId}>
														Team A &mdash;{" "}
														{awayTeam?.name ??
															"Away"}
													</option>
												) : null}
												{homeTeamId ? (
													<option value={homeTeamId}>
														Team H &mdash;{" "}
														{homeTeam?.name ??
															"Home"}
													</option>
												) : null}
											</select>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</section>

				<div className="flex justify-end">
					<button
						type="submit"
						disabled={isSubmitting}
						className="rounded-2xl border border-cyan-400/70 bg-linear-to-r from-cyan-500/30 to-blue-600/30 px-8 py-3 text-sm font-semibold text-white transition hover:from-cyan-500/40 hover:to-blue-600/40 disabled:cursor-not-allowed disabled:opacity-60"
					>
						{isSubmitting ? "Saving..." : "Submit Match"}
					</button>
				</div>
			</form>
		</PageShell>
	);
};

export default MatchEntryPage;
