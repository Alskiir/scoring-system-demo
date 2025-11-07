import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
	throw new Error(
		"Supabase env vars missing: check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"
	);
}

// For demo purposes, disable session persistence and URL detection
export const supabase = createClient(url, key, {
	auth: {
		persistSession: false, // skip storing sessions in local storage
		detectSessionInUrl: false, // don't parse URL for auth params
	},
});
