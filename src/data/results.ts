import { supabase } from "../lib/supabaseClient";

// Get team standings (from the view)
export async function getStandings() {
	const { data, error } = await supabase
		.from("team_standings")
		.select("*")
		.order("total_points", { ascending: false });
	if (error) throw error;
	return data;
}

// Get all match results
export async function getTeamResults(teamId: string) {
	const { data, error } = await supabase
		.from("team_match_result")
		.select(
			`
			id,
			match_id,
			points,
			lines_won,
			lines_lost,
			games_won,
			games_lost,
			result,
			opponent:opponent_id ( id, name )
		`
		)
		.eq("team_id", teamId)
		.order("match_id", { ascending: false });
	if (error) throw error;
	return data;
}
