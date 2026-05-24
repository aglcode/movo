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

export function getTrailerEmbedUrl(trailerKey) {
  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    enablejsapi: '1',
    controls: '0',
    modestbranding: '1',
    rel: '0',
    playsinline: '1',
    loop: '1',
    playlist: trailerKey,
    iv_load_policy: '3',
    disablekb: '1',
    fs: '0',
    cc_load_policy: '0',
    origin: typeof window !== 'undefined' ? window.location.origin : '',
  });

  return `https://www.youtube-nocookie.com/embed/${trailerKey}?${params.toString()}`;
}

export { API_BASE_URL };
