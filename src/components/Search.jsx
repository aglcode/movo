import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

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
        setSearchResults(data.results.slice(0, 5)); // Show only top 5 results
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
      <div className='search'>
        <div>
          <img src="/search.svg" alt="search" />
          <input 
            type="text"
            placeholder='Search through thousands of movies'
            value={searchItem}
            onChange={(e) => {
              setSearchItem(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
          />
        </div>
      </div>

      {/* Dropdown Results */}
      {showDropdown && (searchItem.length >= 2 || searchResults.length > 0) && (
        <div className="absolute w-full mt-2 bg-black/95 backdrop-blur-md rounded-xl border border-white/10 shadow-xl z-50 max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-white text-center">Loading...</div>
          ) : searchResults.length > 0 ? (
            <div className="py-2">
              {searchResults.map((movie) => (
                <Link
                  key={movie.id}
                  to={`/movie/${movie.id}`}
                  className="flex items-center gap-4 p-3 hover:bg-white/10 transition-colors duration-200"
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
                    <h3 className="text-white font-medium">{movie.title}</h3>
                    <p className="text-gray-400 text-sm">
                      {new Date(movie.release_date).getFullYear()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : searchItem.length >= 2 ? (
            <div className="p-4 text-white text-center">No results found</div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default Search;