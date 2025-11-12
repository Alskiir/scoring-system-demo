import { GAME_COLUMN_WIDTH_CLASS } from "../constants";
import type { GameScore } from "../types";

type GameColumnProps = {
	lineId: string;
	gameIndex: number;
	game: GameScore;
	onScoreChange: (
		lineId: string,
		gameIndex: number,
		field: "home" | "away",
		value: string
	) => void;
	columnWidth: number;
};

const GameColumn = ({
	lineId,
	gameIndex,
	game,
	onScoreChange,
	columnWidth,
}: GameColumnProps) => {
	const inputClass =
		"w-full rounded-2xl border border-(--border-subtle) bg-(--surface-input) px-3 py-2 text-sm text-(--text-primary) transition-colors duration-200 focus:border-(--border-highlight) focus:outline-none";

	return (
		<td
			className={`${GAME_COLUMN_WIDTH_CLASS} align-top`}
			style={{
				width: `${columnWidth}px`,
				minWidth: `${columnWidth}px`,
			}}
		>
			<div className="flex flex-col gap-3">
				<label className="text-[11px] uppercase tracking-wide text-(--text-muted)">
					Game {gameIndex + 1}
				</label>
				<div className="space-y-3">
					<div className="space-y-1 text-xs">
						<span className="font-semibold text-(--text-subtle)">
							Team A
						</span>
						<input
							type="number"
							min={0}
							inputMode="numeric"
							value={game.away}
							onChange={(event) =>
								onScoreChange(
									lineId,
									gameIndex,
									"away",
									event.target.value
								)
							}
							className={inputClass}
						/>
					</div>
					<div className="space-y-1 text-xs">
						<span className="font-semibold text-(--text-subtle)">
							Team H
						</span>
						<input
							type="number"
							min={0}
							inputMode="numeric"
							value={game.home}
							onChange={(event) =>
								onScoreChange(
									lineId,
									gameIndex,
									"home",
									event.target.value
								)
							}
							className={inputClass}
						/>
					</div>
				</div>
			</div>
		</td>
	);
};

export default GameColumn;
