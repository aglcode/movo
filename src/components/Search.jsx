import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { IconSearch } from '@tabler/icons-react';

const Search = ({ searchItem, setSearchItem }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const API_BASE_URL = 'https://api.themoviedb.org/3';
  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  const API_OPTIONS = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${API_KEY}`
    }
  };

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchItem.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/search/movie?query=${encodeURIComponent(searchItem)}&page=1`,
          API_OPTIONS
        );
        const data = await response.json();
        setSearchResults(data.results.slice(0, 5));
      } catch (error) {
        console.error('Error fetching search results:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchSearchResults, 300);
    return () => clearTimeout(timeoutId);
  }, [searchItem]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search through thousands of movies"
          value={searchItem}
          onChange={(e) => {
            setSearchItem(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          className="w-full h-14 pl-12 pr-4 bg-white/5 backdrop-blur-md border-white/10 rounded-2xl text-white placeholder:text-muted-foreground text-base focus-visible:ring-primary/50"
        />
      </div>

      {/* Dropdown Results */}
      {showDropdown && (searchItem.length >= 2 || searchResults.length > 0) && (
        <Card className="absolute w-full mt-2 bg-card/95 backdrop-blur-md border-white/10 shadow-xl z-50 max-h-[400px] overflow-y-auto py-2">
          {isLoading ? (
            <div className="px-4 py-3 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="w-12 h-18 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : searchResults.length > 0 ? (
            <div className="py-1">
              {searchResults.map((movie) => (
                <Link
                  key={movie.id}
                  to={`/movie/${movie.id}`}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-accent/50 transition-colors duration-200"
                  onClick={() => {
                    setShowDropdown(false);
                    setSearchItem('');
                  }}
                >
                  <img
                    src={movie.poster_path
                      ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
                      : '/No-Poster.png'
                    }
                    alt={movie.title}
                    className="w-12 h-18 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="text-foreground font-medium">{movie.title}</h3>
                    <p className="text-muted-foreground text-sm">
                      {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : searchItem.length >= 2 ? (
            <div className="px-4 py-6 text-muted-foreground text-center text-sm">No results found</div>
          ) : null}
        </Card>
      )}
    </div>
  );
};

export default Search;