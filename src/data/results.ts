import { supabase } from "../lib/supabaseClient";
import { resolveSupabase } from "../lib/supabaseQuery";

export async function getStandings() {
	return resolveSupabase(
		supabase
			.from("team_standings")
			.select("*")
			.order("total_points", { ascending: false }),
		{ fallbackValue: [] }
	);
}
