import { supabase } from "../lib/supabaseClient";

// Get all matches
export async function getMatches() {
	const { data, error } = await supabase
		.from("match")
		.select(
			`
			id,
			date_time,
			location,
			home_team:home_team_id ( id, name ),
			away_team:away_team_id ( id, name ),
			winner_team:winner_team_id ( id, name )
		`
		)
		.order("date_time", { ascending: false });
	if (error) throw error;
	return data;
}

// Get one match by ID with team info
export async function getMatch(id: string) {
	const { data, error } = await supabase
		.from("match")
		.select(
			`
			id,
			date_time,
			location,
			home_team:home_team_id ( id, name ),
			away_team:away_team_id ( id, name ),
			winner_team:winner_team_id ( id, name )
		`
		)
		.eq("id", id)
		.single();
	if (error) throw error;
	return data;
}

// Get all matches for a specific team
export async function getMatchesByTeam(teamId: string) {
	const { data, error } = await supabase
		.from("match")
		.select(
			`
			id,
			date_time,
			location,
			home_team:home_team_id ( id, name ),
			away_team:away_team_id ( id, name ),
			winner_team:winner_team_id ( id, name )
		`
		)
		.or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
		.order("date_time", { ascending: false });
	if (error) throw error;
	return data;
}
