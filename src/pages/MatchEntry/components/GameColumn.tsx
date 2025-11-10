import { COLUMN_WIDTH_CLASS } from "../constants";
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
};

const GameColumn = ({
	lineId,
	gameIndex,
	game,
	onScoreChange,
}: GameColumnProps) => (
	<td className={`${COLUMN_WIDTH_CLASS} align-top`}>
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
						onScoreChange(
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
						onScoreChange(
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

export default GameColumn;
