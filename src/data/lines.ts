import { supabase } from "../lib/supabaseClient";

// Get all lines for a given match
export async function getMatchLines(matchId: string) {
	const { data, error } = await supabase
		.from("match_line")
		.select(
			`
			id,
			line_number,
			winner_team:winner_team_id ( id, name ),
			home_player1:home_player1 ( id, first_name, last_name ),
			home_player2:home_player2 ( id, first_name, last_name ),
			away_player1:away_player1 ( id, first_name, last_name ),
			away_player2:away_player2 ( id, first_name, last_name )
		`
		)
		.eq("match_id", matchId)
		.order("line_number");
	if (error) throw error;
	return data;
}

// Get games for a specific line
export async function getLineGames(lineId: string) {
	const { data, error } = await supabase
		.from("line_game")
		.select("*")
		.eq("line_id", lineId)
		.order("game_number");
	if (error) throw error;
	return data;
}
