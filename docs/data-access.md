# Data-access pattern

We keep all Supabase interaction inside `src/data-access`. Pages, hooks, and components call these domain-level functions instead of importing `supabase` directly.

Principles:

- `supabaseClient` / `resolveSupabase` are the only low-level exports; everything else is domain methods returning typed data.
- Modules normalize Supabase relations and timestamps so callers receive plain values.
- Helpers that parse relations or dates live in `supabaseHelpers`.

Locations:

- Players: `src/data-access/players.ts`
- Matches (save + roster lookups): `src/data-access/matches.ts`
- Standings: `src/data-access/standings.ts`
- Teams: `src/data-access/teams.ts`
- Match history: `src/data-access/matchHistory.ts`
- Tables explorer: `src/data-access/tables.ts`

When adding Supabase queries, add a domain function in `src/data-access` and import it from your hook/page. Avoid new direct Supabase usage outside this folder.\*\*\*
