import { COLUMN_WIDTH_CLASS } from "../constants";
import type { LineFormState, PlayerOption, TeamOption } from "../types";
import LineRow from "./LineRow";

type LinesTableProps = {
	lines: LineFormState[];
	maxGames: number;
	homeTeamId: string;
	awayTeamId: string;
	homeTeam?: TeamOption;
	awayTeam?: TeamOption;
	homePlayers: PlayerOption[];
	awayPlayers: PlayerOption[];
	onAddLine: () => void;
	onRemoveLine: () => void;
	onAddGameToLine: (lineId: string) => void;
	onRemoveGameFromLine: (lineId: string) => void;
	onPlayerChange: (
		lineId: string,
		side: "teamA" | "teamH",
		slot: "player1Id" | "player2Id",
		value: string
	) => void;
	onGameScoreChange: (
		lineId: string,
		gameIndex: number,
		field: "home" | "away",
		value: string
	) => void;
	onWinnerChange: (lineId: string, value: string) => void;
};

const LinesTable = ({
	lines,
	maxGames,
	homeTeamId,
	awayTeamId,
	homeTeam,
	awayTeam,
	homePlayers,
	awayPlayers,
	onAddLine,
	onRemoveLine,
	onAddGameToLine,
	onRemoveGameFromLine,
	onPlayerChange,
	onGameScoreChange,
	onWinnerChange,
}: LinesTableProps) => (
	<section className="rounded-3xl border border-white/10 bg-white/5 p-4 md:p-6">
		<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
			<div>
				<p className="text-lg font-semibold text-white">Lines</p>
				<p className="text-sm text-white/60">
					Default view shows five lines - adjust lines or the number
					of games per line as needed.
				</p>
			</div>
			<div className="flex gap-3">
				<button
					type="button"
					onClick={onRemoveLine}
					className="rounded-2xl border border-white/15 px-4 py-2 text-sm text-white hover:border-red-400 hover:text-red-100 disabled:opacity-40"
					disabled={lines.length === 1}
				>
					Remove Line
				</button>
				<button
					type="button"
					onClick={onAddLine}
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
						<th className={COLUMN_WIDTH_CLASS}>Line</th>
						<th className={COLUMN_WIDTH_CLASS}>Player 1 (A)</th>
						<th className={COLUMN_WIDTH_CLASS}>Player 2 (A)</th>
						<th className={COLUMN_WIDTH_CLASS}>Player 1 (H)</th>
						<th className={COLUMN_WIDTH_CLASS}>Player 2 (H)</th>
						{Array.from({ length: maxGames }, (_, idx) => (
							<th
								key={`game-head-${idx}`}
								className={COLUMN_WIDTH_CLASS}
							>
								Game {idx + 1}
							</th>
						))}
						<th className={COLUMN_WIDTH_CLASS}>Winner</th>
					</tr>
				</thead>
				<tbody>
					{lines.map((line) => (
						<LineRow
							key={line.id}
							line={line}
							maxGames={maxGames}
							homeTeamId={homeTeamId}
							awayTeamId={awayTeamId}
							homeTeam={homeTeam}
							awayTeam={awayTeam}
							homePlayers={homePlayers}
							awayPlayers={awayPlayers}
							onPlayerChange={onPlayerChange}
							onGameScoreChange={onGameScoreChange}
							onWinnerChange={onWinnerChange}
							onAddGame={onAddGameToLine}
							onRemoveGame={onRemoveGameFromLine}
						/>
					))}
				</tbody>
			</table>
		</div>
	</section>
);

export default LinesTable;
