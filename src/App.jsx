import React, { useState, useEffect, useRef } from 'react'
import { getTrendingMovies, updateSearchCount } from './appwrite';
import { useDebounce } from 'react-use';
import { Routes, Route, Link } from 'react-router-dom';
import { HeroUIProvider } from "@heroui/react";
import Search from './components/Search'
import Spinner from './components/Spinner'
import MovieCard from './components/MovieCard';
import MovieDetail from './components/MovieDetail';
import Pagination from './components/Pagination';

const API_BASE_URL = 'https://api.themoviedb.org/3'
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

// Validate TMDB API key
if (!API_KEY) {
    console.error('Missing TMDB API key');
}

// CURL Request
const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

const App = () => {

  // useState for search
  const [searchItem, setSearchItem] = useState('');

  // useState for error messages
  const [errorMessage, setErrorMessage] = useState('');

  // useState for movie list
  const [movieList, setMovieList] = useState([]);

  // useState for loading
  const [isLoading, setIsLoading] = useState(false);

  // useState for Trending movies top ranking
  const [trendingMovies, setTrendingMovies] = useState([]);

  // useState for debounce | used for seacrh optimization | prevent too many API req
  const [debouncedSearchItem, setDebouncedSearchItem] = useState('');

  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Add new state for genres and categorized movies
  const [genres, setGenres] = useState([]);
  const [categorizedMovies, setCategorizedMovies] = useState({});
  const [selectedGenre, setSelectedGenre] = useState(null);

  // Add refs for carousel scrolling
  const carouselRefs = useRef({});

  // Function to scroll carousel
  const scrollCarousel = (genreId, direction) => {
    const carousel = carouselRefs.current[genreId];
    if (carousel) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // implement the debounce hook at the search hook | wait for user to stop typing by 500ms
  useDebounce(() => setDebouncedSearchItem(searchItem), 500, [searchItem])

  // fetch movies from the TMDB
  const fetchMovies = async (query = '', page = 1) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${page}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&page=${page}`;

      const response = await fetch(endpoint, API_OPTIONS);
      
      if(!response.ok) {
        throw new Error('Failed to fetch movies');
      }
      const data = await response.json();
      
      if(data.response === 'false') {
        setErrorMessage(data.error || 'Failed to fetch movies');
        setMovieList([]);
        return;
      }
      
      setMovieList(data.results || []);
      setTotalPages(Math.min(data.total_pages, 500)); // TMDB API limits to 500 pages

      if(query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }

    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage('Error fetching movies. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchMovies(debouncedSearchItem, newPage);
  };

  // function for trending movies
  const loadTrendingMovies = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/trending/movie/day`, API_OPTIONS);
      if (!response.ok) {
        throw new Error('Failed to fetch trending movies');
      }
      const data = await response.json();
      setTrendingMovies(data.results.slice(0, 10)); // Get top 10 trending movies
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  }

  // Fetch genres from TMDB
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

  // Fetch movies by genre
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

  // Load movies for each genre
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
  
  // another useEffect to render trending movies
  useEffect(() => {
    loadTrendingMovies();
  }, [])
  
  // Update useEffect to fetch genres
  useEffect(() => {
    fetchGenres();
  }, []);

  // Update useEffect to load categorized movies when genres are loaded
  useEffect(() => {
    if (genres.length > 0) {
      loadCategorizedMovies();
    }
  }, [genres]);

  return (
    <HeroUIProvider>
      <Routes>
        <Route path="/" element={
          <main className="min-h-screen bg-gradient-to-b from-[#0F0F0F] to-[#1A1A1A]">
            <div className="relative">
              {/* Hero Section */}
              <div className="relative h-screen flex items-center justify-center overflow-hidden">
                {/* Background Video/Image */}
                <div className="absolute inset-0 z-0">
                  <div className="absolute inset-0 bg-black/60 z-10" />
                  <img 
                    src="/bg-purple.png" 
                    alt="Background"  
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black opacity-70"></div>
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
                    <p className="text-white text-center text-xl font-semibold tracking-wide mb-8">Movo</p>

                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
                      Where Great <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">Movies</span> Start
                    </h1>

                    <p className="text-xl text-gray-300 mb-12">
                      Discover and stream your favorite movies with ease
                    </p>
                    <div className="max-w-2xl mx-auto">
                      <Search searchItem={searchItem} setSearchItem={setSearchItem}/>
                    </div>
                  </div>
                </div>

                {/* Bottom Fade to Black Gradient */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-black backdrop-blur-md z-10" />
              </div>

              {/* Trending Movies Section */}
              {trendingMovies.length > 0 && (
                <section className="py-20 bg-[#000000]">
                  <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-white mb-12">Top 10 Trending Movies</h2>
                    <div className="relative">
                      {/* Left Arrow */}
                      <button
                        onClick={() => scrollCarousel('trending', 'left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300"
                        aria-label="Scroll left"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>

                      {/* Trending Movies Carousel */}
                      <div 
                        ref={el => carouselRefs.current['trending'] = el}
                        className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x snap-mandatory"
                      >
                        {trendingMovies.map((movie, index) => (
                          <div key={movie.id} className="flex-none w-[260px] snap-start">
                            <Link 
                              to={`/movie/${movie.id}`}
                              className="block relative group cursor-pointer transform transition-all duration-300 hover:scale-105"
                            >
                              <div className="absolute left-2 top-2 w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg z-10">
                                {index + 1}
                              </div>
                              <div className="relative rounded-xl overflow-hidden mt-6">
                                <img 
                                  src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/No-Poster.png'}
                                  alt={movie.title}
                                  className="w-full h-[300px] object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  <div className="absolute bottom-0 p-4">
                                    <h3 className="text-lg font-bold text-white">{movie.title}</h3>
                                    <p className="text-sm text-gray-300 mt-1">
                                      {new Date(movie.release_date).getFullYear()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </div>
                        ))}
                      </div>

                      {/* Right Arrow */}
                      <button
                        onClick={() => scrollCarousel('trending', 'right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300"
                        aria-label="Scroll right"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>

                      {/* Gradient fades on both sides */}
                      <div className="carousel-gradient-left"></div>
                      <div className="carousel-gradient-right"></div>
                    </div>
                  </div>
                </section>
              )}

              {/* Genre Categories Section */}
              <section className="py-20 bg-[#0F0F0F]">
                <div className="container mx-auto px-4">
                  <h2 className="text-3xl font-bold text-white mb-12">Browse by Genre</h2>
                  
                  {genres.map((genre) => (
                    <div key={genre.id} className="mb-12">
                      <h3 className="text-2xl font-bold text-white mb-6">{genre.name}</h3>
                      <div className="relative">
                        {/* Left Arrow */}
                        <button
                          onClick={() => scrollCarousel(genre.id, 'left')}
                          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300"
                          aria-label="Scroll left"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>

                        {/* Movies Carousel */}
                        <div 
                          ref={el => carouselRefs.current[genre.id] = el}
                          className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x snap-mandatory"
                        >
                          {categorizedMovies[genre.id]?.map((movie) => (
                            <div key={movie.id} className="flex-none w-[200px] snap-start">
                              <Link 
                                to={`/movie/${movie.id}`}
                                className="block relative group transform transition-all duration-300 hover:scale-105"
                              >
                                <div className="relative rounded-xl overflow-hidden">
                                  <img 
                                    src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/No-Poster.png'}
                                    alt={movie.title}
                                    className="w-full h-[300px] object-cover"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="absolute bottom-0 p-4">
                                      <h3 className="text-lg font-bold text-white">{movie.title}</h3>
                                      <p className="text-sm text-gray-300">
                                        {new Date(movie.release_date).getFullYear()}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            </div>
                          ))}
                        </div>

                        {/* Right Arrow */}
                        <button
                          onClick={() => scrollCarousel(genre.id, 'right')}
                          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300"
                          aria-label="Scroll right"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>

                        {/* Gradient fades on both sides */}
                        <div className="carousel-gradient-left"></div>
                        <div className="carousel-gradient-right"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* All Movies Section */}
              <section className="py-20 bg-[#0F0F0F]">
                <div className="container mx-auto px-4">
                  <h2 className="text-3xl font-bold text-white mb-12">All Movies</h2>
                  {isLoading ? (
                    <Spinner />
                  ) : errorMessage ? (
                    <p className="text-red-500">{errorMessage}</p>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {movieList.map((movie) => (
                          <Link 
                            key={movie.id}
                            to={`/movie/${movie.id}`}
                            className="block relative group transform transition-all duration-300 hover:scale-105"
                          >
                            <div className="relative rounded-xl overflow-hidden">
                              <img 
                                src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/No-Poster.png'}
                                alt={movie.title}
                                className="w-full h-[400px] object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="absolute bottom-0 p-4">
                                  <h3 className="text-lg font-bold text-white">{movie.title}</h3>
                                  <p className="text-sm text-gray-300">
                                    {new Date(movie.release_date).getFullYear()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </Link>
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
    </HeroUIProvider>
  )
}

export default App