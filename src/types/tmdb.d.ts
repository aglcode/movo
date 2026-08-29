

/** A single movie returned by the TMDB API. */
export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  original_language: string;
  adult: boolean;
  video: boolean;
  media_type?: 'movie' | 'tv';
}

/** A single TV show returned by the TMDB API. */
export interface TMDBTVShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  original_language: string;
  adult: boolean;
  origin_country: string[];
  media_type?: 'movie' | 'tv';
}

/** Union of all media items the API can return. */
export type TMDBMediaItem = TMDBMovie | TMDBTVShow;

/** A genre object from the /genre/{type}/list endpoint. */
export interface TMDBGenre {
  id: number;
  name: string;
}

/** Standard paginated response from TMDB list endpoints. */
export interface TMDBPaginatedResponse<T = TMDBMovie> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

// ─── Hook Return Types ─────────────────────────────────────────

/** Return type for the useSearchList hook. */
export interface UseSearchListReturn {
  results: TMDBMovie[];
  isLoading: boolean;
  errorMessage: string;
  currentPage: number;
  totalPages: number;
  totalResults: number;
  setPage: (page: number) => void;
  reset: () => void;
}

// ─── Component Prop Types ──────────────────────────────────────

/** Props for the SearchList component. */
export interface SearchListProps {
  query: string;
}

/** Props for the MovieCard component. */
export interface MovieCardProps {
  movie: TMDBMovie;
}

/** Props for the Pagination component. */
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/** Props for the Search modal component. */
export interface SearchProps {
  searchItem: string;
  setSearchItem: (value: string) => void;
  onClose: () => void;
  onSubmit?: (query: string) => void;
}

/** Props for the AllMoviesSection component. */
export interface AllMoviesSectionProps {
  isLoading: boolean;
  errorMessage: string;
  movieList: TMDBMovie[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/** Props for the Navbar component. */
export interface NavbarProps {
  searchItem: string;
  setSearchItem: (value: string) => void;
  onSearchSubmit?: (query: string) => void;
}
