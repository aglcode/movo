import React, { useState, useEffect, useRef } from 'react'
import { getTrendingMovies, updateSearchCount } from './supabase';
import { useDebounce } from 'react-use';
import { Routes, Route, Link } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { IconChevronLeft, IconChevronRight, IconStarFilled } from '@tabler/icons-react';
import Navbar from './components/Navbar';
import HeroCarousel from './components/HeroCarousel';
import Spinner from './components/Spinner'
import MovieCard from './components/MovieCard';
import MovieDetail from './components/MovieDetail';
import Pagination from './components/Pagination';

const API_BASE_URL = 'https://api.themoviedb.org/3'
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

if (!API_KEY) {
  console.error('Missing TMDB API key');
}

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

const App = () => {
  const [searchItem, setSearchItem] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [movieList, setMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [debouncedSearchItem, setDebouncedSearchItem] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [genres, setGenres] = useState([]);
  const [categorizedMovies, setCategorizedMovies] = useState({});

  const carouselRefs = useRef({});

  const scrollCarousel = (genreId, direction) => {
    const carousel = carouselRefs.current[genreId];
    if (carousel) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useDebounce(() => setDebouncedSearchItem(searchItem), 500, [searchItem])

  const fetchMovies = async (query = '', page = 1) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${page}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&page=${page}`;

      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error('Failed to fetch movies');
      }
      const data = await response.json();

      if (data.response === 'false') {
        setErrorMessage(data.error || 'Failed to fetch movies');
        setMovieList([]);
        return;
      }

      setMovieList(data.results || []);
      setTotalPages(Math.min(data.total_pages, 500));

      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }

    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage('Error fetching movies. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchMovies(debouncedSearchItem, newPage);
  };

  const loadTrendingMovies = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/trending/movie/day`, API_OPTIONS);
      if (!response.ok) {
        throw new Error('Failed to fetch trending movies');
      }
      const data = await response.json();
      setTrendingMovies(data.results.slice(0, 10));
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  }

  const fetchGenres = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/genre/movie/list`, API_OPTIONS);
      if (!response.ok) {
        throw new Error('Failed to fetch genres');
      }
      const data = await response.json();
      setGenres(data.genres);
    } catch (error) {
      console.error(`Error fetching genres: ${error}`);
    }
  };

  const fetchMoviesByGenre = async (genreId, page = 1) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/discover/movie?with_genres=${genreId}&page=${page}`,
        API_OPTIONS
      );
      if (!response.ok) {
        throw new Error('Failed to fetch movies by genre');
      }
      const data = await response.json();
      return data.results;
    } catch (error) {
      console.error(`Error fetching movies by genre: ${error}`);
      return [];
    }
  };

  const loadCategorizedMovies = async () => {
    const moviesByGenre = {};
    for (const genre of genres) {
      const movies = await fetchMoviesByGenre(genre.id);
      moviesByGenre[genre.id] = movies;
    }
    setCategorizedMovies(moviesByGenre);
  };

  useEffect(() => {
    fetchMovies(debouncedSearchItem, currentPage);
  }, [debouncedSearchItem, currentPage]);

  useEffect(() => {
    loadTrendingMovies();
  }, [])

  useEffect(() => {
    fetchGenres();
  }, []);

  useEffect(() => {
    if (genres.length > 0) {
      loadCategorizedMovies();
    }
  }, [genres]);

  // Carousel arrow button component
  const CarouselArrow = ({ direction, onClick }) => (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={`absolute ${direction === 'left' ? 'left-0' : 'right-0'} top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm`}
      aria-label={`Scroll ${direction}`}
    >
      {direction === 'left' ? <IconChevronLeft className="size-5" /> : <IconChevronRight className="size-5" />}
    </Button>
  );

  return (
    <TooltipProvider>
      <Routes>
        <Route path="/" element={
          <main className="min-h-screen bg-background">
            <div className="relative">
              <Navbar searchItem={searchItem} setSearchItem={setSearchItem} />
              <HeroCarousel trendingMovies={trendingMovies} genres={genres} />

              {/* Trending Movies Section */}
              {trendingMovies.length > 0 && (
                <section className="py-20 bg-[#0F0F0F]">
                  <div className="container mx-auto px-4">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-1 h-6 bg-[#E50914] rounded-sm"></div>
                      <h2 className="text-2xl font-bold text-white tracking-wide">TOP 10 Today</h2>
                    </div>
                    <div className="relative">
                      <CarouselArrow direction="left" onClick={() => scrollCarousel('trending', 'left')} />

                      {/* Trending Carousel */}
                      <div
                        ref={el => carouselRefs.current['trending'] = el}
                        className="flex overflow-x-auto gap-5 pb-4 scrollbar-hide snap-x snap-mandatory px-1"
                      >
                        {trendingMovies.map((movie, index) => (
                          <div key={movie.id} className="flex-none w-[200px] snap-start group cursor-pointer">
                            <Link to={`/movie/${movie.id}`} className="block">
                              <div className="relative rounded-lg overflow-hidden border border-white/5 bg-white/5 aspect-[2/3] shadow-lg">
                                {/* Red TOP Ribbon */}
                                <div 
                                  className="absolute top-0 left-0 bg-[#E50914] text-white w-9 pb-2 z-10 flex flex-col items-center pt-1 shadow-md" 
                                  style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%)' }}
                                >
                                  <span className="text-[10px] font-bold leading-none tracking-wider mb-[2px]">TOP</span>
                                  <span className="text-sm font-black leading-none">{String(index + 1).padStart(2, '0')}</span>
                                </div>
                                
                                <img
                                  src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/No-Poster.png'}
                                  alt={movie.title}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                              </div>
                              
                              {/* Movie Details Below Poster */}
                              <div className="mt-4 space-y-1">
                                <h3 className="text-white font-medium text-sm truncate group-hover:text-white/80 transition-colors">{movie.title || movie.original_title}</h3>
                                <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium">
                                  <span className="flex items-center gap-[2px] text-[#E50914]">
                                    <IconStarFilled className="w-3 h-3" />
                                    {movie.vote_average?.toFixed(1) || 'N/A'}
                                  </span>
                                  <span className="text-gray-600">&bull;</span>
                                  <span>{movie.release_date?.substring(0, 4) || 'N/A'}</span>
                                  <span className="text-gray-600">&bull;</span>
                                  <span>Movie</span>
                                </div>
                              </div>
                            </Link>
                          </div>
                        ))}
                      </div>

                      <CarouselArrow direction="right" onClick={() => scrollCarousel('trending', 'right')} />

                      <div className="carousel-gradient-left" />
                      <div className="carousel-gradient-right" />
                    </div>
                  </div>
                </section>
              )}

              {/* Genre Categories Section */}
              <section className="py-20 bg-[#0F0F0F]">
                <div className="container mx-auto px-4">
                  <h2 className="text-3xl font-heading font-bold text-foreground mb-12">Browse by Genre</h2>

                  {genres.map((genre) => (
                    <div key={genre.id} className="mb-14">
                      <div className="flex items-center gap-3 mb-6">
                        <h3 className="text-xl font-heading font-bold text-foreground">{genre.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {categorizedMovies[genre.id]?.length || 0} movies
                        </Badge>
                      </div>
                      <div className="relative">
                        <CarouselArrow direction="left" onClick={() => scrollCarousel(genre.id, 'left')} />

                        <div
                          ref={el => carouselRefs.current[genre.id] = el}
                          className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x snap-mandatory px-2"
                        >
                          {categorizedMovies[genre.id]?.map((movie) => (
                            <div key={movie.id} className="flex-none w-[200px] snap-start">
                              <MovieCard movie={movie} />
                            </div>
                          ))}
                        </div>

                        <CarouselArrow direction="right" onClick={() => scrollCarousel(genre.id, 'right')} />

                        <div className="carousel-gradient-left" />
                        <div className="carousel-gradient-right" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* All Movies Section */}
              <section className="py-20 bg-[#0F0F0F]">
                <div className="container mx-auto px-4">
                  <h2 className="text-3xl font-heading font-bold text-foreground mb-12">All Movies</h2>
                  {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="space-y-3">
                          <Skeleton className="aspect-[2/3] w-full rounded-xl" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/4" />
                        </div>
                      ))}
                    </div>
                  ) : errorMessage ? (
                    <p className="text-destructive">{errorMessage}</p>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {movieList.map((movie) => (
                          <MovieCard key={movie.id} movie={movie} />
                        ))}
                      </div>
                      <div className="mt-12">
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={handlePageChange}
                        />
                      </div>
                    </>
                  )}
                </div>
              </section>
            </div>
          </main>
        } />
        <Route path="/movie/:id" element={<MovieDetail />} />
      </Routes>
    </TooltipProvider>
  )
}

export default App