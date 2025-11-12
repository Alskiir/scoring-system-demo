import type { ReactNode } from "react";
import type { TeamOption } from "../types";

type MatchMetaFieldsProps = {
	teams: TeamOption[];
	teamsLoading: boolean;
	homeTeamId: string;
	awayTeamId: string;
	matchDate: string;
	matchTime: string;
	location: string;
	onHomeTeamChange: (teamId: string) => void;
	onAwayTeamChange: (teamId: string) => void;
	onMatchDateChange: (value: string) => void;
	onMatchTimeChange: (value: string) => void;
	onLocationChange: (value: string) => void;
};

const MatchMetaFields = ({
	teams,
	teamsLoading,
	homeTeamId,
	awayTeamId,
	matchDate,
	matchTime,
	location,
	onHomeTeamChange,
	onAwayTeamChange,
	onMatchDateChange,
	onMatchTimeChange,
	onLocationChange,
}: MatchMetaFieldsProps) => {
	const teamSelects: TeamSelectConfig[] = [
		{
			id: "match-home-team",
			label: "Home Team (H)",
			value: homeTeamId,
			disabledTeamId: awayTeamId,
			onChange: onHomeTeamChange,
		},
		{
			id: "match-away-team",
			label: "Away Team (A)",
			value: awayTeamId,
			disabledTeamId: homeTeamId,
			onChange: onAwayTeamChange,
		},
	];

	const scheduleFields: ScheduleFieldConfig[] = [
		{
			id: "match-date",
			label: "Match Date",
			type: "date",
			value: matchDate,
			onChange: onMatchDateChange,
		},
		{
			id: "match-time",
			label: "Match Time",
			type: "time",
			value: matchTime,
			onChange: onMatchTimeChange,
		},
		{
			id: "match-location",
			label: "Location",
			type: "text",
			value: location,
			onChange: onLocationChange,
			placeholder: "Clubhouse courts",
		},
	];

	return (
		<section className="md-card p-6">
			<div className="grid gap-6 md:grid-cols-2">
				{teamSelects.map((config) => (
					<FieldGroup
						key={config.id}
						id={config.id}
						label={config.label}
					>
						<select
							id={config.id}
							className="md-input md-select"
							value={config.value}
							onChange={(event) =>
								config.onChange(event.target.value)
							}
						>
							<option value="">
								{teamsLoading ? "Loading..." : "Select"}
							</option>
							{teams.map((team) => (
								<option
									key={team.id}
									value={team.id}
									disabled={team.id === config.disabledTeamId}
								>
									{team.name}
								</option>
							))}
						</select>
					</FieldGroup>
				))}
			</div>

			<div className="mt-6 grid gap-6 md:grid-cols-3">
				{scheduleFields.map((field) => (
					<FieldGroup
						key={field.id}
						id={field.id}
						label={field.label}
					>
						<input
							id={field.id}
							type={field.type}
							className="md-input"
							value={field.value}
							placeholder={field.placeholder}
							onChange={(event) =>
								field.onChange(event.target.value)
							}
						/>
					</FieldGroup>
				))}
			</div>
		</section>
	);
};

type FieldGroupProps = {
	id: string;
	label: string;
	children: ReactNode;
};

const FieldGroup = ({ id, label, children }: FieldGroupProps) => (
	<div className="flex flex-col gap-2">
		<label className="md-field-label" htmlFor={id}>
			{label}
		</label>
		{children}
	</div>
);

type TeamSelectConfig = {
	id: string;
	label: string;
	value: string;
	disabledTeamId: string;
	onChange: (value: string) => void;
};

type ScheduleFieldConfig = {
	id: string;
	label: string;
	type: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
};

export default MatchMetaFields;
