import React, { useState, useEffect } from 'react'
import { updateSearchCount } from './supabase';
import { useDebounce } from 'react-use';
import { Routes, Route } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import FloatingDevelopmentAlert from './components/FloatingDevelopmentAlert';
import Navbar from './components/Navbar';
import HeroCarousel from './components/HeroCarousel';
import MovieDetails from './components/moviedetails';
import Top10Section from './components/sections/Top10Section';
import TrendingTodaySection from './components/sections/TrendingTodaySection';
import ProviderSection from './components/sections/ProviderSection';
import GenresSection from './components/sections/GenresSection';
import AllMoviesSection from './components/sections/AllMoviesSection';
import Footer from './components/Footer';
import { searchMovies, discoverMovies, getTrending, getGenres } from '@/api/ENDPOINTS';

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

  useDebounce(() => setDebouncedSearchItem(searchItem), 500, [searchItem])

  const fetchMovies = async (query = '', page = 1) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const data = query
        ? await searchMovies(query, page)
        : await discoverMovies(page);

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
  };

  const loadTrendingMovies = async () => {
    try {
      const data = await getTrending('movie', 'day');
      setTrendingMovies(data.results.slice(0, 10));
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  }

  const fetchGenres = async () => {
    try {
      const data = await getGenres('movie');
      setGenres(data.genres);
    } catch (error) {
      console.error(`Error fetching genres: ${error}`);
    }
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

  return (
    <TooltipProvider>
      {/* <FloatingDevelopmentAlert /> */}
      <Routes>
        <Route path="/" element={
          <main className="min-h-screen bg-background">
            <div className="relative">
              <Navbar searchItem={searchItem} setSearchItem={setSearchItem} />
              <HeroCarousel trendingMovies={trendingMovies} genres={genres} />

              <Top10Section trendingMovies={trendingMovies} />
              <TrendingTodaySection />
              <ProviderSection />
              <GenresSection />
              <AllMoviesSection
                isLoading={isLoading}
                errorMessage={errorMessage}
                movieList={movieList}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
              <Footer />
            </div>
          </main>
        } />
        <Route path="/movie/:id" element={<MovieDetails />} />
        <Route path="/tv/:id" element={<MovieDetails />} />
      </Routes>
    </TooltipProvider>
  )
}

export default App
