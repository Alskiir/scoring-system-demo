import { supabase } from "../lib/supabaseClient";
import { resolveSupabase } from "../lib/supabaseQuery";

// Fetch all teams
export async function getTeams() {
	return resolveSupabase(
		supabase.from("team").select("*").order("name", { ascending: true }),
		{ fallbackValue: [] }
	);
}

// Get a single team by ID
export async function getTeam(id: string) {
	return resolveSupabase(
		supabase.from("team").select("*").eq("id", id).single(),
		{ allowNull: true }
	);
}

// Get team and all its players
export async function getTeamRoster(teamId: string) {
	return resolveSupabase(
		supabase
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
			.eq("team_id", teamId),
		{ fallbackValue: [] }
	);
}

// Search teams by name (for filters/search)
export async function searchTeams(term: string) {
	return resolveSupabase(
		supabase.from("team").select("*").ilike("name", `%${term}%`),
		{ fallbackValue: [] }
	);
}
