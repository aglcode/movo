# AGENTS.md

## Project overview
movo is a client-side React SPA (Vite + React Router) for browsing and streaming
movie/TV info. It has no custom backend — the browser talks directly to TMDB
(catalog data) and Supabase (analytics counts). Hosted on Vercel as a static build.

## Dev environment tips
- Use `npm run dev` to start the Vite dev server locally.
- Env vars are read via `import.meta.env` (Vite convention) — anything the
  client needs must be prefixed `VITE_` (e.g. `VITE_SUPABASE_URL`,
  `VITE_SUPABASE_ANON_KEY`). Copy `.env.example` to `.env.local` and fill in
  real values; `.env.local` is gitignored and never committed.
- TMDB API calls live in `src/api/ENDPOINTS.ts`, with base URL/headers set in
  `src/lib/tmdb.js`. Add new TMDB queries there rather than calling `fetch`
  directly from components.
- Supabase client and all count-tracking (`search_counts`, `click_counts`,
  `play_counts`) live in `src/supabase.ts`. Keep DB calls there, not scattered
  through components.
- UI primitives (button, card, carousel, tooltip, etc.) are shadcn-style
  components in `src/components/ui/` — reuse these instead of building new
  primitives.
- Homepage sections live in `src/components/sections/`; larger self-contained
  features with their own hooks (search, video player, movie details) live in
  their own folders under `src/components/` (`SearchList/`, `PlayWindow/`,
  `moviedetails/`).
- `scripts/add-changelog.mjs` is a standalone Node script (`npm run
  changelog`) for generating changelog entries — it runs outside the browser
  build and uses `GEMINI_API_KEY`, which is separate from the Vite client env
  vars above and should never be prefixed `VITE_` (that would expose it to
  the browser bundle).

## Testing instructions
- There is currently no automated test suite in this repo.
- Before committing, run `npm run lint` (ESLint) and fix any errors.
- Run `npm run build` to confirm the production build succeeds — this catches
  most TypeScript/import errors since `src/` mixes `.ts`/`.tsx` and `.jsx`.
- Manually verify in `npm run dev` or `npm run preview` that:
  - search, browsing, and pagination still work (`src/App.jsx`)
  - a movie/TV detail page loads (`/movie/:id`, `/tv/:id`)
  - the video player embeds correctly (`PlayWindow`)

## PR instructions
- Keep TMDB logic in `src/api/` and `src/lib/tmdb.js`, and Supabase logic in
  `src/supabase.ts` — don't introduce a third pattern for fetching data.
- Match the existing file split: shared UI in `components/ui/`, page-level
  sections in `components/sections/`, larger features in their own folder
  with a co-located `hooks/` subfolder if needed.
- Never commit real API keys or `.env*` files (other than `.env.example`).
- Run `npm run lint` and `npm run build` before opening a PR.