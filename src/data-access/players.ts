/**
 * Player-focused Supabase queries and derived stats. Returns normalized data
 * ready for hooks/components; no UI formatting here.
 */
import { supabase } from "../lib/supabaseClient";
import { resolveSupabase } from "../lib/supabaseQuery";
import { formatFullName } from "../utils/dataTransforms";
import {
	buildLineAggregates,
	buildPartnerStats,
	computeWinStreaks,
} from "./players.stats";
import {
	type NormalizedPlayerLine,
	type PersonRow,
	type PlayerBasics,
	type PlayerComputedStats,
	type PlayerProfileRow,
	type RawPlayerLineRow,
	type TeamMembershipRow,
} from "./players.types";
import { normalizePlayerLines } from "./players.transforms";
import { normalizeRelation } from "./supabaseHelpers";

export type { PartnerStats, PlayerComputedStats } from "./players.types";

const PLAYER_LINE_SELECTION = `
	id,
	match_id,
	line_number,
	winner_team_id,
	match:match_id (
		id,
		match_date,
		match_time,
		location,
		home_team_id,
		away_team_id,
		winner_team_id
	),
	line_game (
		id,
		game_number,
		home_score,
		away_score
	),
	home_player1:home_player1 ( id, first_name, last_name, preferred_name ),
	home_player2:home_player2 ( id, first_name, last_name, preferred_name ),
	away_player1:away_player1 ( id, first_name, last_name, preferred_name ),
	away_player2:away_player2 ( id, first_name, last_name, preferred_name )
`;

const PLAYER_BASICS_SELECTION = `
	id,
	first_name,
	last_name,
	preferred_name
`;

const MEMBERSHIP_SELECTION = `
	id,
	team_id,
	start_date,
	end_date,
	team:team_id (
		id,
		name,
		location
	)
`;

export async function getPlayerBasics(playerId: string): Promise<PlayerBasics> {
	const [person, profile] = await Promise.all([
		resolveSupabase<PersonRow>(
			supabase
				.from("person")
				.select(PLAYER_BASICS_SELECTION)
				.eq("id", playerId)
				.single(),
			{ errorMessage: "Unable to load player details." }
		),
		resolveSupabase<PlayerProfileRow | null>(
			supabase
				.from("player_profile")
				.select("handle,bio,avatar_url,cover_url")
				.eq("person_id", playerId)
				.maybeSingle(),
			{ allowNull: true, errorMessage: "Unable to load player profile." }
		),
	]);

	const memberships = await resolveSupabase<TeamMembershipRow[]>(
		supabase
			.from("team_membership")
			.select(MEMBERSHIP_SELECTION)
			.eq("person_id", playerId)
			.order("start_date", { ascending: false })
			.limit(1),
		{ fallbackValue: [], errorMessage: "Unable to load team membership." }
	);

	const membership = memberships[0];
	const team = membership ? normalizeRelation(membership.team) : null;
	const fullName = formatFullName(person.first_name, person.last_name);
	const preferred = person.preferred_name?.trim();
	const profileHandle = profile?.handle?.trim();
	const normalizedHandle = profileHandle
		? profileHandle.startsWith("@")
			? profileHandle
			: `@${profileHandle}`
		: preferred
		? `@${preferred.toLowerCase()}`
		: `@${person.id}`;

	return {
		playerId,
		fullName,
		handle: normalizedHandle,
		teamName: team?.name ?? "Independent player",
		teamLocation: team?.location ?? "Location unknown",
		joinedLabel: membership?.start_date
			? `Joined ${membership.start_date.split("-")[0]}`
			: "Active",
		bio: profile?.bio?.trim() || null,
		avatarUrl: profile?.avatar_url || null,
		coverUrl: profile?.cover_url || null,
	};
}

export async function getPlayerLines(
	playerId: string
): Promise<NormalizedPlayerLine[]> {
	const rows = await resolveSupabase<RawPlayerLineRow[]>(
		supabase
			.from("match_line")
			.select(PLAYER_LINE_SELECTION)
			.or(
				[
					`home_player1.eq.${playerId}`,
					`home_player2.eq.${playerId}`,
					`away_player1.eq.${playerId}`,
					`away_player2.eq.${playerId}`,
				].join(",")
			)
			.order("match_id", { ascending: true })
			.returns<RawPlayerLineRow[]>(),
		{
			fallbackValue: [],
			errorMessage: "Unable to load player match lines.",
		}
	);

	return normalizePlayerLines(rows, String(playerId));
}

export async function getPlayerComputedStats(
	playerId: string
): Promise<PlayerComputedStats> {
	const [basics, lines] = await Promise.all([
		getPlayerBasics(playerId),
		getPlayerLines(playerId),
	]);

	if (!lines.length) {
		return {
			basics,
			winPercentage: 0,
			winStreak: 0,
			highestWinStreak: 0,
			totalMatches: 0,
			gamesWon: 0,
			gamesLost: 0,
			linesWon: 0,
			linesLost: 0,
			linesPerMatch: 0,
			avgPointDifferential: 0,
			trend: [],
			partner: null,
		};
	}

	const aggregates = buildLineAggregates(lines);
	const partner = buildPartnerStats(lines);
	const { current: winStreak, longest: highestWinStreak } =
		computeWinStreaks(lines);

	return {
		basics,
		winPercentage: aggregates.winPercentage,
		winStreak,
		highestWinStreak,
		totalMatches: aggregates.totalMatches,
		gamesWon: aggregates.gamesWon,
		gamesLost: aggregates.gamesLost,
		linesWon: aggregates.linesWon,
		linesLost: aggregates.linesLost,
		linesPerMatch: aggregates.linesPerMatch,
		avgPointDifferential: aggregates.avgPointDifferential,
		trend: aggregates.trend,
		partner,
	};
}
