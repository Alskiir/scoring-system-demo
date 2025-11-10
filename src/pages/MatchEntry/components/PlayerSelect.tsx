import type { PlayerOption } from "../types";

type PlayerSelectProps = {
	value: string;
	options: PlayerOption[];
	placeholder: string;
	disabled: boolean;
	onChange: (value: string) => void;
};

const PlayerSelect = ({
	value,
	options,
	placeholder,
	disabled,
	onChange,
}: PlayerSelectProps) => (
	<select
		className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
		value={value}
		onChange={(event) => onChange(event.target.value)}
		disabled={disabled}
	>
		<option value="">{disabled ? "Select team first" : placeholder}</option>
		{options.map((player) => (
			<option key={player.id} value={player.id}>
				{player.fullName}
			</option>
		))}
	</select>
);

export default PlayerSelect;
