import { supabase } from "../lib/supabaseClient";

// Fetch all teams
export async function getTeams() {
	const { data, error } = await supabase
		.from("team")
		.select("*")
		.order("name", { ascending: true });
	if (error) throw error;
	return data;
}

// Get a single team by ID
export async function getTeam(id: string) {
	const { data, error } = await supabase
		.from("team")
		.select("*")
		.eq("id", id)
		.single();
	if (error) throw error;
	return data;
}

// Get team and all its players
export async function getTeamRoster(teamId: string) {
	const { data, error } = await supabase
		.from("team_membership")
		.select(
			`
			role,
			person:person_id (
				id,
				first_name,
				last_name,
				email,
				phone_mobile,
				birthday
			)
		`
		)
		.eq("team_id", teamId);
	if (error) throw error;
	return data;
}

// Search teams by name (for filters/search)
export async function searchTeams(term: string) {
	const { data, error } = await supabase
		.from("team")
		.select("*")
		.ilike("name", `%${term}%`);
	if (error) throw error;
	return data;
}
