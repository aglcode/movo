
export interface MediaCountParams {
  media_type: 'movie' | 'tv' | 'episode';
  tmdb_id: number;
  title: string;
  poster_url?: string | null;
  season_number?: number | null;
  episode_number?: number | null;
}
