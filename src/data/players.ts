import { supabase } from "../lib/supabaseClient";

// Get all players
export async function getPlayers() {
	const { data, error } = await supabase
		.from("person")
		.select("*")
		.order("last_name", { ascending: true });
	if (error) throw error;
	return data;
}

// Get player by ID
export async function getPlayer(id: string) {
	const { data, error } = await supabase
		.from("person")
		.select("*")
		.eq("id", id)
		.single();
	if (error) throw error;
	return data;
}

// Get teams a player belongs to
export async function getPlayerTeams(personId: string) {
	const { data, error } = await supabase
		.from("team_membership")
		.select(
			`
			role,
			team:team_id ( id, name, location )
		`
		)
		.eq("person_id", personId);
	if (error) throw error;
	return data;
}

// Search players by name
export async function searchPlayers(term: string) {
	const { data, error } = await supabase
		.from("person")
		.select("*")
		.or(`first_name.ilike.%${term}%,last_name.ilike.%${term}%`);
	if (error) throw error;
	return data;
}
