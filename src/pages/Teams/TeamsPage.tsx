import { useMemo, useState } from "react";
import { FilterDropdown, Table } from "../../components";
import {
	divisions,
	players,
	seasons,
	teams,
	type Player,
} from "../../data/mockLeague";

function Teams() {
	const [selectedTeamId, setSelectedTeamId] = useState<number | null>(
		teams.length ? teams[0].id : null
	);

	const teamOptions = useMemo(
		() =>
			teams.map((team) => ({
				value: String(team.id),
				label: team.name,
			})),
		[]
	);

	const selectedTeam = useMemo(() => {
		if (selectedTeamId === null) return undefined;
		return teams.find((team) => team.id === selectedTeamId);
	}, [selectedTeamId]);

	const relatedDivision = useMemo(() => {
		if (!selectedTeam) return undefined;
		return divisions.find(
			(division) => division.id === selectedTeam.divisionId
		);
	}, [selectedTeam]);

	const relatedSeason = useMemo(() => {
		if (!selectedTeam) return undefined;
		return seasons.find((season) => season.id === selectedTeam.seasonId);
	}, [selectedTeam]);

	const captain = useMemo(() => {
		if (!selectedTeam) return undefined;
		return players.find((player) => player.id === selectedTeam.captainId);
	}, [selectedTeam]);

	const teamPlayers = useMemo(() => {
		if (!selectedTeam) return [];
		return selectedTeam.playerIds
			.map((playerId) => players.find((player) => player.id === playerId))
			.filter((player): player is Player => Boolean(player));
	}, [selectedTeam]);

	const tableData = useMemo(
		() =>
			teamPlayers.map((player) => [
				`${player.firstName} ${player.lastName}`,
				player.rating.toFixed(1),
				player.email,
				player.phone,
				player.homeClub,
			]),
		[teamPlayers]
	);

	return (
		<div className="flex min-h-screen flex-col bg-neutral-950/95">
			<main className="flex-1 py-16">
				<div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 md:px-12">
					<div className="flex flex-col gap-3 text-neutral-100">
						<h1 className="text-3xl font-semibold tracking-tight">
							Teams
						</h1>
						<p className="text-sm text-neutral-400">
							Select a roster to explore player profiles and
							coaching insight.
						</p>
					</div>

					<div className="flex flex-wrap items-center gap-4">
						<FilterDropdown
							label="Team"
							placeholder="Select Team"
							value={
								selectedTeamId ? String(selectedTeamId) : null
							}
							onChange={(nextValue) =>
								setSelectedTeamId(
									nextValue ? Number(nextValue) : null
								)
							}
							options={teamOptions}
						/>
					</div>

					{selectedTeam ? (
						<section className="flex flex-col gap-6 text-neutral-200">
							<div className="flex flex-col gap-2 rounded-2xl border border-neutral-800/60 bg-neutral-900/70 p-6 shadow-[0_12px_30px_rgba(15,23,42,0.45)] backdrop-blur">
								<div className="flex flex-wrap items-center justify-between gap-4">
									<div className="flex flex-col gap-1">
										<h2 className="text-2xl font-semibold text-neutral-100">
											{selectedTeam.name}
										</h2>
										<p className="text-sm text-neutral-400">
											{relatedDivision?.name ??
												"Independent"}{" "}
											·{" "}
											{relatedSeason?.name ??
												"Season TBD"}
										</p>
									</div>
									<div className="flex flex-col gap-1 text-sm text-neutral-400">
										<span>
											Captain:{" "}
											{captain
												? `${captain.firstName} ${captain.lastName}`
												: "—"}
										</span>
										<span>
											Home Court: {selectedTeam.homeCourt}
										</span>
									</div>
								</div>
							</div>

							<Table
								headers={[
									"Player",
									"Rating",
									"Email",
									"Phone",
									"Home Club",
								]}
								data={tableData}
							/>
						</section>
					) : (
						<div className="rounded-2xl border border-neutral-800/50 bg-neutral-900/70 p-8 text-center text-neutral-400">
							Choose a team to view roster details.
						</div>
					)}
				</div>
			</main>
		</div>
	);
}

export default Teams;
