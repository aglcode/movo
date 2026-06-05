import { API_BASE_URL, API_OPTIONS } from '../lib/tmdb';

// Internal helper — fetch + parse JSON, throws on non-OK responses
async function apiFetch<T = any>(path: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, API_OPTIONS);
    if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    return response.json();
}

// Search
export async function searchMovies(query: string, page = 1) {
    return apiFetch(`/search/movie?query=${encodeURIComponent(query)}&page=${page}`);
}

// Discover
export async function discoverMovies(page = 1) {
    return apiFetch(`/discover/movie?sort_by=popularity.desc&page=${page}`);
}

// Discover titles from a specific streaming provider.
export async function discoverByProvider(mediaType: 'movie' | 'tv', providerId: number) {
    return apiFetch(
        `/discover/${mediaType}?with_watch_providers=${providerId}&watch_region=US&sort_by=popularity.desc`,
    );
}

// Discover titles by genre.
export async function discoverByGenre(mediaType: 'movie' | 'tv', genreId: number) {
    return apiFetch(
        `/discover/${mediaType}?with_genres=${genreId}&sort_by=popularity.desc`,
    );
}

// Trending
export async function getTrending(
    mediaType: 'movie' | 'tv' = 'movie',
    timeWindow: 'day' | 'week' = 'day',
) {
    return apiFetch(`/trending/${mediaType}/${timeWindow}`);
}

// Genres
export async function getGenres(mediaType: 'movie' | 'tv' = 'movie') {
    return apiFetch(`/genre/${mediaType}/list`);
}

// Details (single title)
export async function getDetails(mediaType: 'movie' | 'tv', id: string | number) {
    return apiFetch(`/${mediaType}/${id}?append_to_response=videos`);
}

// Get watch/streaming providers for a title.
export async function getWatchProviders(mediaType: 'movie' | 'tv', id: string | number) {
    return apiFetch(`/${mediaType}/${id}/watch/providers`);
}

// Get similar titles.
export async function getSimilar(mediaType: 'movie' | 'tv', id: string | number) {
    return apiFetch(`/${mediaType}/${id}/similar`);
}

// Get cast & crew credits.
export async function getCredits(mediaType: 'movie' | 'tv', id: string | number) {
    return apiFetch(`/${mediaType}/${id}/credits`);
}

// TV Seasons / Episodes
export async function getSeasonEpisodes(tvId: string | number, seasonNumber: number) {
    return apiFetch(`/tv/${tvId}/season/${seasonNumber}`);
}
