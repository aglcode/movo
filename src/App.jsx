import React, { useState, useEffect, useRef, useMemo } from 'react'
import { getTrendingMovies, updateSearchCount } from './supabase';
import { useDebounce } from 'react-use';
import { Routes, Route, Link } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { IconChevronLeft, IconChevronRight, IconStarFilled, IconChevronDown } from '@tabler/icons-react';
import Navbar from './components/Navbar';
import HeroCarousel from './components/HeroCarousel';
import Spinner from './components/Spinner'
import MovieCard from './components/MovieCard';
import TrendingCard from './components/TrendingCard';
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
  const [trendingItems, setTrendingItems] = useState([]);
  const [trendingType, setTrendingType] = useState('movie');
  const [debouncedSearchItem, setDebouncedSearchItem] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [genres, setGenres] = useState([]);
  const [categorizedMovies, setCategorizedMovies] = useState({});
  const [selectedProvider, setSelectedProvider] = useState({ id: 8, name: 'Netflix', logo: 'https://image.tmdb.org/t/p/w45/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg' });
  const [providerMovies, setProviderMovies] = useState([]);
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);

  const STREAMING_PROVIDERS = [
    { id: 8, name: 'Netflix', logo: 'https://image.tmdb.org/t/p/w45/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg' },
    { id: 9, name: 'Prime Video', logo: 'https://image.tmdb.org/t/p/w45/pvske1MyAoymrs5bBO8s6DmCo2y.jpg' },
    { id: 1899, name: 'Max', logo: 'https://image.tmdb.org/t/p/w45/6Q3YKUNA4UkZOYSfAoFyjjDHkYk.jpg' },
    { id: 337, name: 'Disney+', logo: 'https://image.tmdb.org/t/p/w45/97yvRBw1GzX7fXprcF80er19ot.jpg' },
    { id: 350, name: 'Apple TV+', logo: 'https://image.tmdb.org/t/p/w45/6uhKBfmtzFqOcLousHwZuzcrScK.jpg' },
    { id: 531, name: 'Paramount+', logo: 'https://image.tmdb.org/t/p/w45/xbhHHa1YgtpwhC8lb1NQ3ACVcZd.jpg' },
    { id: 15, name: 'Hulu', logo: 'https://image.tmdb.org/t/p/w45/zxrVdFjIjLqkfnwyghnfywTn3Lh.jpg' },
  ];

  const carouselRefs = useRef({});
  const movieBtnRef = useRef(null);
  const tvBtnRef = useRef(null);
  const providerDropdownRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

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

  const loadTrendingItems = async (type) => {
    try {
      const response = await fetch(`${API_BASE_URL}/trending/${type}/day`, API_OPTIONS);
      if (!response.ok) {
        throw new Error(`Failed to fetch trending ${type}`);
      }
      const data = await response.json();
      setTrendingItems(data.results);
    } catch (error) {
      console.error(`Error fetching trending ${type}: ${error}`);
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
    loadTrendingItems(trendingType);
  }, [trendingType]);

  useEffect(() => {
    fetchGenres();
  }, []);

  useEffect(() => {
    if (genres.length > 0) {
      loadCategorizedMovies();
    }
  }, [genres]);

  const fetchProviderMovies = async (providerId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/discover/movie?with_watch_providers=${providerId}&watch_region=US&sort_by=popularity.desc`,
        API_OPTIONS
      );
      if (!response.ok) {
        throw new Error('Failed to fetch provider movies');
      }
      const data = await response.json();
      setProviderMovies(data.results || []);
    } catch (error) {
      console.error(`Error fetching provider movies: ${error}`);
      setProviderMovies([]);
    }
  };

  useEffect(() => {
    fetchProviderMovies(selectedProvider.id);
  }, [selectedProvider]);

  // Close provider dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (providerDropdownRef.current && !providerDropdownRef.current.contains(event.target)) {
        setShowProviderDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const updateIndicator = () => {
      const activeBtn = trendingType === 'movie' ? movieBtnRef.current : tvBtnRef.current;
      if (activeBtn) {
        setIndicatorStyle({
          left: activeBtn.offsetLeft,
          width: activeBtn.offsetWidth,
        });
      }
    };

    updateIndicator();
    // Tiny timeout just for initial mount font loading
    const timeoutId = setTimeout(updateIndicator, 100);
    window.addEventListener('resize', updateIndicator);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateIndicator);
    };
  }, [trendingType]);

  // Carousel arrow button component
  const CarouselArrow = React.useCallback(({ direction, onClick }) => (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={`absolute ${direction === 'left' ? 'left-0' : 'right-0'} top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm`}
      aria-label={`Scroll ${direction}`}
    >
      {direction === 'left' ? <IconChevronLeft className="size-5" /> : <IconChevronRight className="size-5" />}
    </Button>
  ), []);

  const top10Section = useMemo(() => {
    if (trendingMovies.length === 0) return null;
    return (
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
                <div key={movie.id} className="flex-none w-[140px] sm:w-[200px] snap-start group cursor-pointer">
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
    );
  }, [trendingMovies, scrollCarousel]);

  const genresSection = useMemo(() => (
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
                  <div key={movie.id} className="flex-none w-[140px] sm:w-[200px] snap-start">
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
  ), [genres, categorizedMovies, scrollCarousel]);

  return (
    <TooltipProvider>
      <Routes>
        <Route path="/" element={
          <main className="min-h-screen bg-background">
            <div className="relative">
              <Navbar searchItem={searchItem} setSearchItem={setSearchItem} />
              <HeroCarousel trendingMovies={trendingMovies} genres={genres} />

              {/* Trending Movies Section */}
              {top10Section}

              {/* Trending Today Section with Toggle */}
              <section className="py-20 bg-[#0F0F0F]">
                <div className="container mx-auto px-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-6 bg-[#E50914] rounded-sm"></div>
                      <h2 className="text-2xl font-bold text-white tracking-wide">Trending Today</h2>
                    </div>

                    {/* Toggle Button Group */}
                    <div className="relative flex items-center gap-6 border-b border-white/10 pb-2">
                      <button
                        ref={movieBtnRef}
                        onClick={(e) => {
                          setTrendingType('movie');
                          setIndicatorStyle({ left: e.currentTarget.offsetLeft, width: e.currentTarget.offsetWidth });
                        }}
                        className={`text-sm md:text-base font-bold transition-colors duration-300 ${trendingType === 'movie' ? 'text-white' : 'text-gray-500 hover:text-white'
                          }`}
                      >
                        Movies
                      </button>
                      <button
                        ref={tvBtnRef}
                        onClick={(e) => {
                          setTrendingType('tv');
                          setIndicatorStyle({ left: e.currentTarget.offsetLeft, width: e.currentTarget.offsetWidth });
                        }}
                        className={`text-sm md:text-base font-bold transition-colors duration-300 ${trendingType === 'tv' ? 'text-white' : 'text-gray-500 hover:text-white'
                          }`}
                      >
                        Series
                      </button>

                      {/* Sliding Indicator */}
                      <div
                        className="absolute left-0 -bottom-[1px] h-[2px] bg-[#E50914] transition-all duration-300 ease-in-out"
                        style={{
                          transform: `translateX(${indicatorStyle.left}px)`,
                          width: `${indicatorStyle.width}px`
                        }}
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <CarouselArrow direction="left" onClick={() => scrollCarousel('trendingItems', 'left')} />

                    <div
                      ref={el => carouselRefs.current['trendingItems'] = el}
                      className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x snap-mandatory px-2"
                    >
                      {trendingItems.map((item) => (
                        <div key={item.id} className="flex-none w-[240px] sm:w-[280px] md:w-[320px] lg:w-[380px] snap-start">
                          <TrendingCard item={item} type={trendingType} />
                        </div>
                      ))}
                    </div>

                    <CarouselArrow direction="right" onClick={() => scrollCarousel('trendingItems', 'right')} />

                    <div className="carousel-gradient-left" />
                    <div className="carousel-gradient-right" />
                  </div>
                </div>
              </section>

              {/* Only on [Provider] Section */}
              <section className="py-20 bg-[#0F0F0F]">
                <div className="container mx-auto px-4">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-1 h-6 bg-[#E50914] rounded-sm"></div>
                    <div className="relative" ref={providerDropdownRef}>
                      <button
                        onClick={() => setShowProviderDropdown(!showProviderDropdown)}
                        className="flex items-center gap-2 text-2xl font-bold text-white tracking-wide hover:text-white/80 transition-colors"
                      >
                        Only on {selectedProvider.name}
                        <IconChevronDown className={`w-5 h-5 transition-transform duration-200 ${showProviderDropdown ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Dropdown */}
                      {showProviderDropdown && (
                        <div className="absolute top-full left-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-50 min-w-[200px] py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                          {STREAMING_PROVIDERS.map((provider) => (
                            <button
                              key={provider.id}
                              onClick={() => {
                                setSelectedProvider(provider);
                                setShowProviderDropdown(false);
                              }}
                              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-white/10 ${
                                selectedProvider.id === provider.id ? 'text-white bg-white/5' : 'text-gray-400'
                              }`}
                            >
                              <img
                                src={provider.logo}
                                alt={provider.name}
                                className="w-6 h-6 rounded"
                              />
                              {provider.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="relative">
                    <CarouselArrow direction="left" onClick={() => scrollCarousel('providerMovies', 'left')} />

                    <div
                      ref={el => carouselRefs.current['providerMovies'] = el}
                      className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x snap-mandatory px-2"
                    >
                      {providerMovies.map((item) => (
                        <div key={item.id} className="flex-none w-[240px] sm:w-[280px] md:w-[320px] lg:w-[380px] snap-start">
                          <TrendingCard item={item} type="movie" />
                        </div>
                      ))}
                    </div>

                    <CarouselArrow direction="right" onClick={() => scrollCarousel('providerMovies', 'right')} />

                    <div className="carousel-gradient-left" />
                    <div className="carousel-gradient-right" />
                  </div>
                </div>
              </section>

              {genresSection}

              {/* All Movies Section */}
              <section className="py-20 bg-[#0F0F0F]">
                <div className="container mx-auto px-4">
                  <h2 className="text-3xl font-heading font-bold text-foreground mb-12">All Movies</h2>
                  {isLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
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
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
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