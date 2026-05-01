import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const updateSearchCount = async (searchItem, movie) => {
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