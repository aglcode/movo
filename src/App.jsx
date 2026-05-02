import React, { useState, useEffect, useRef } from 'react'
import { getTrendingMovies, updateSearchCount } from './supabase';
import { useDebounce } from 'react-use';
import { Routes, Route, Link } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { IconChevronLeft, IconChevronRight, IconStarFilled } from '@tabler/icons-react';
import Search from './components/Search'
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
              {/* Hero Section */}
              <div className="relative h-screen flex items-center justify-center overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 z-0">
                  <div className="absolute inset-0 bg-black/60 z-10" />
                  <img
                    src="/bg-purple.png"
                    alt="Background"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black opacity-70" />
                </div>

                {/* Hero Content */}
                <div className="container mx-auto px-4 z-20 relative">
                  <div className="max-w-4xl mx-auto text-center">
                    <div className="w-32 h-32 mb-8 mx-auto">
                      <img
                        src="/logo.svg"
                        alt="Logo"
                        className="w-full h-full"
                      />
                    </div>
                    <p className="text-foreground text-center text-xl font-heading font-semibold tracking-wide mb-8">Movo</p>

                    <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-8 leading-tight max-w-none">
                      Where Great <span className="text-gradient">Movies</span> Start
                    </h1>

                    <p className="text-xl text-muted-foreground mb-12">
                      Discover and stream your favorite movies with ease
                    </p>
                    <div className="max-w-2xl mx-auto">
                      <Search searchItem={searchItem} setSearchItem={setSearchItem} />
                    </div>
                  </div>
                </div>

                {/* Bottom Fade */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-[#0F0F0F] z-10" />
              </div>

              {/* Trending Movies Section */}
              {trendingMovies.length > 0 && (
                <section className="py-20 bg-[#0F0F0F]">
                  <div className="container mx-auto px-4">
                    <div className="flex items-center gap-3 mb-12">
                      <h2 className="text-3xl font-heading font-bold text-foreground">Top 10 Trending</h2>
                      <Badge className="bg-primary/20 text-primary border-primary/30">Today</Badge>
                    </div>
                    <div className="relative">
                      <CarouselArrow direction="left" onClick={() => scrollCarousel('trending', 'left')} />

                      {/* Trending Carousel */}
                      <div
                        ref={el => carouselRefs.current['trending'] = el}
                        className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x snap-mandatory px-2"
                      >
                        {trendingMovies.map((movie, index) => (
                          <div key={movie.id} className="flex-none w-[260px] snap-start">
                            <Link
                              to={`/movie/${movie.id}`}
                              className="block relative group cursor-pointer transform transition-all duration-300 hover:scale-105"
                            >
                              <div className="absolute left-2 top-2 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg z-10 ring-2 ring-primary/30">
                                {index + 1}
                              </div>
                              <Badge className="absolute right-2 top-2 bg-black/60 backdrop-blur-sm text-yellow-400 border-white/10 gap-1 z-10">
                                <IconStarFilled className="size-3" />
                                {movie.vote_average?.toFixed(1)}
                              </Badge>
                              <div className="relative rounded-xl overflow-hidden mt-6 transform-gpu [backface-visibility:hidden]">
                                <img
                                  src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/No-Poster.png'}
                                  alt={movie.title}
                                  className="w-full h-[340px] object-cover transition-transform duration-500 group-hover:scale-110 transform-gpu [backface-visibility:hidden]"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  <div className="absolute bottom-0 p-4">
                                    <h3 className="text-lg font-bold text-foreground">{movie.title}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                                    </p>
                                  </div>
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