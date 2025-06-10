import React, { useState, useEffect } from 'react'
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
      const movies = await getTrendingMovies();

      setTrendingMovies(movies);
    } catch (error) {
      console.log(`Error fetching trending movies: ${error}`);
    }
  }

  useEffect(() => {
    fetchMovies(debouncedSearchItem, currentPage);
  }, [debouncedSearchItem, currentPage]);
  
  // another useEffect to render trending movies
  useEffect(() => {
     loadTrendingMovies();
  }, [])
  

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
                      <svg
                        viewBox="0 0 200 200"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-full h-full"
                      >
                        <g clipPath="url(#clip0_238_1284)">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M50 0H0V100C0 155.228 44.7715 200 100 200C155.228 200 200 155.228 200 100V0H150C122.386 0 100 22.3858 100 50C100 22.3858 77.6142 0 50 0Z"
                            fill="url(#paint0_linear_238_1284)"
                          />
                        </g>
                        <defs>
                          <linearGradient
                            id="paint0_linear_238_1284"
                            x1="100"
                            y1="0"
                            x2="100"
                            y2="200"
                            gradientUnits="userSpaceOnUse"
                          >
                            <stop stopColor="#A7B5FF" />
                            <stop offset="1" stopColor="#F3ACFF" />
                          </linearGradient>
                          <clipPath id="clip0_238_1284">
                            <rect width="200" height="200" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
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
                    <h2 className="text-3xl font-bold text-white mb-12">Top 5 Trending Movies</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {trendingMovies.map((movie, index) => (
                        <Link 
                          to={`/movie/${movie.movie_id}`}
                          key={movie.$id}
                          className="block relative group cursor-pointer transform transition-all duration-300 hover:scale-105"
                        >
                          <div className="absolute -left-2 -top-2 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base md:text-xl z-10">
                            {index + 1}
                          </div>
                          <div className="relative rounded-xl overflow-hidden">
                            <img 
                              src={movie.poster_url} 
                              alt={movie.title}
                              className="w-full h-[200px] sm:h-[250px] md:h-[300px] object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="absolute bottom-0 p-6">
                                <h3 className="text-xl font-bold text-white">{movie.title}</h3>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </section>
              )}

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
    </HeroUIProvider>
  )
}

export default App