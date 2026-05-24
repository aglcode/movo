const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

if (!API_KEY) {
  console.error('Missing TMDB API key');
}

export const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`,
  },
};

const trailerCache = new Map();

export async function fetchTrailerKey(mediaType, id) {
  const cacheKey = `${mediaType}-${id}`;
  if (trailerCache.has(cacheKey)) {
    return trailerCache.get(cacheKey);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/${mediaType}/${id}/videos`, API_OPTIONS);
    if (!response.ok) {
      trailerCache.set(cacheKey, null);
      return null;
    }
    const data = await response.json();
    const trailer = data.results?.find(
      (video) => video.type === 'Trailer' && video.site === 'YouTube'
    );
    const key = trailer?.key ?? null;
    trailerCache.set(cacheKey, key);
    return key;
  } catch (error) {
    console.error(`Error fetching trailer for ${mediaType} ${id}:`, error);
    trailerCache.set(cacheKey, null);
    return null;
  }
}

export { API_BASE_URL };
