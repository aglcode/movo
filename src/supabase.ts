import { createClient } from "@supabase/supabase-js";
import type { MediaCountParams } from "./types/supabase";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const updateSearchCount = async (searchItem: string, movie: { id: number; poster_path: string }) => {
    try {
        // check if search term already exists
        const { data: existing } = await supabase
            .from("search_counts")
            .select("*")
            .eq("search_item", searchItem)
            .single();

        if (existing) {
            await supabase
                .from("search_counts")
                .update({ count: existing.count + 1 })
                .eq("id", existing.id);
        } else {
            // if not - insert new record
            await supabase.from("search_counts").insert({
                search_item: searchItem,
                count: 1,
                movie_id: movie.id,
                poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            });
        }
    } catch (err) {
        console.error("Error in updateSearchCount:", err);
    }
};

// fetch trending movies from the database
export const getTrendingMovies = async () => {
    try {
        const { data, error } = await supabase
            .from("search_counts")
            .select("*")
            .order("count", { ascending: false })
            .limit(5);

        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error("Error in getTrendingMovies:", err);
        return [];
    }
};


// helper: use .eq() for real values, .is() for null
const applyFilter = (query: any, column: string, value: any) =>
    value === null ? query.is(column, null) : query.eq(column, value);

// counts for clicked & plays movies/tv shows
export const updateClickCount = async ({
    media_type,
    tmdb_id,
    title,
    poster_url = null,
    season_number = null,
    episode_number = null,
}: MediaCountParams) => {
    try {
        let query = supabase
            .from("click_counts")
            .select("*")
            .eq("media_type", media_type)
            .eq("tmdb_id", tmdb_id);
        query = applyFilter(query, "season_number", season_number);
        query = applyFilter(query, "episode_number", episode_number);
        const { data: existing } = await query.maybeSingle();

        if (existing) {
            await supabase
                .from("click_counts")
                .update({ count: existing.count + 1, updated_at: new Date().toISOString() })
                .eq("id", existing.id);
        } else {
            await supabase.from("click_counts").insert({
                media_type,
                tmdb_id,
                title,
                poster_url,
                season_number,
                episode_number,
                count: 1,
            });
        }
    } catch (err) {
        console.error("Error in updateClickCount:", err);
    }
};

export const updatePlayCount = async ({
    media_type,
    tmdb_id,
    title,
    poster_url = null,
    season_number = null,
    episode_number = null,
}: MediaCountParams) => {
    try {
        let query = supabase
            .from("play_counts")
            .select("*")
            .eq("media_type", media_type)
            .eq("tmdb_id", tmdb_id);
        query = applyFilter(query, "season_number", season_number);
        query = applyFilter(query, "episode_number", episode_number);
        const { data: existing } = await query.maybeSingle();

        if (existing) {
            await supabase
                .from("play_counts")
                .update({ count: existing.count + 1, updated_at: new Date().toISOString() })
                .eq("id", existing.id);
        } else {
            await supabase.from("play_counts").insert({
                media_type,
                tmdb_id,
                title,
                poster_url,
                season_number,
                episode_number,
                count: 1,
            });
        }
    } catch (err) {
        console.error("Error in updatePlayCount:", err);
    }
};
