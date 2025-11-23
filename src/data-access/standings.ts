/**
 * Standings view access. Returns raw standings rows for display.
 */
import { supabase } from "../lib/supabaseClient";
import { resolveSupabase } from "../lib/supabaseQuery";

export async function getStandings() {
	return resolveSupabase(
		supabase
			.from("team_standings")
			.select(
				"team_id,team_name,matches_won,matches_lost,win_percentage,total_points"
			)
			.order("total_points", { ascending: false }),
		{ fallbackValue: [] }
	);
}
