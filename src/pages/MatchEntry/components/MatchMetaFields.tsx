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
}: MatchMetaFieldsProps) => (
	<section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
		<div className="grid gap-6 md:grid-cols-2">
			<div className="space-y-2">
				<label className="text-sm text-white/70">Home Team (H)</label>
				<select
					className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:border-cyan-400"
					value={homeTeamId}
					onChange={(event) => onHomeTeamChange(event.target.value)}
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
				<label className="text-sm text-white/70">Away Team (A)</label>
				<select
					className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:border-cyan-400"
					value={awayTeamId}
					onChange={(event) => onAwayTeamChange(event.target.value)}
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
				<label className="text-sm text-white/70">Match Date</label>
				<input
					type="date"
					className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:border-cyan-400"
					value={matchDate}
					onChange={(event) => onMatchDateChange(event.target.value)}
				/>
			</div>
			<div className="space-y-2">
				<label className="text-sm text-white/70">Match Time</label>
				<input
					type="time"
					className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:border-cyan-400"
					value={matchTime}
					onChange={(event) => onMatchTimeChange(event.target.value)}
				/>
			</div>
			<div className="space-y-2 md:col-span-1">
				<label className="text-sm text-white/70">Location</label>
				<input
					type="text"
					placeholder="Clubhouse courts"
					className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:border-cyan-400"
					value={location}
					onChange={(event) => onLocationChange(event.target.value)}
				/>
			</div>
		</div>
	</section>
);

export default MatchMetaFields;
