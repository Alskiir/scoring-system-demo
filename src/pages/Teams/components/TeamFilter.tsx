import { FilterDropdown } from "../../../components";
import type { TeamOption } from "../types";

type TeamFilterProps = {
	options: TeamOption[];
	value: string | null;
	onChange: (nextValue: string | null) => void;
	disabled?: boolean;
};

function TeamFilter({
	options,
	value,
	onChange,
	disabled = false,
}: TeamFilterProps) {
	return (
		<FilterDropdown
			label="Team"
			placeholder="Select Team"
			value={value}
			onChange={onChange}
			options={options}
			disabled={disabled}
			className="md:w-56 md:max-w-none"
		/>
	);
}

export default TeamFilter;
