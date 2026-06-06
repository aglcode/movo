import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { IconSearch, IconX, IconClock, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { searchMovies } from '@/api/ENDPOINTS';

const Search = ({ searchItem, setSearchItem, onClose }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  // Dropdown states
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Movies & TV Shows");
  const categories = ["Movies & TV Shows", "Movies", "TV Shows", "Animes"];
  const dropdownRef = useRef(null);

  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem('recentSearches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    // Focus input on mount
    if (inputRef.current) {
      inputRef.current.focus();
    }
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Handle click outside for dropdown
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const saveRecentSearch = (query) => {
    if (!query.trim()) return;
    setRecentSearches(prev => {
      const updated = [query, ...prev.filter(q => q !== query)].slice(0, 5);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      return updated;
    });
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchItem.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const data = await searchMovies(searchItem, 1);
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

  return (
    <div className="fixed inset-0 z-[100] flex justify-center bg-black/80 backdrop-blur-sm px-4 pt-[15vh]">
      <div 
        className="absolute inset-0" 
        onClick={() => {
          setSearchItem('');
          onClose();
        }}
      />
      <div className="relative w-full max-w-xl flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between relative z-50">
          <h2 className="text-2xl font-bold text-white tracking-wide">Search</h2>
          <div className="flex items-center gap-2">
            
            {/* Category Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 bg-[#121212] border border-white/10 hover:bg-[#1a1a1a] transition-colors text-sm text-gray-300 px-3 py-2 rounded-md"
              >
                {selectedCategory}
                {isDropdownOpen ? (
                  <IconChevronUp size={14} className="text-gray-500" />
                ) : (
                  <IconChevronDown size={14} className="text-gray-500" />
                )}
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#121212] border border-white/10 rounded-md shadow-2xl overflow-hidden z-[60]">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                        selectedCategory === category 
                          ? 'text-white font-medium' 
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Close Button */}
            <button 
              onClick={() => {
                setSearchItem('');
                onClose();
              }}
              className="bg-[#121212] border border-white/10 hover:bg-[#1a1a1a] transition-colors text-gray-400 hover:text-white p-2 rounded-md"
            >
              <IconX size={18} />
            </button>
          </div>
        </div>

        {/* Input */}
        <div className="relative z-40">
          <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type here to search..."
            value={searchItem}
            onChange={(e) => setSearchItem(e.target.value)}
            className="w-full bg-[#121212] border border-white/5 rounded-xl h-14 pl-12 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors"
          />
        </div>

        {/* Results / Recent */}
        <div className="bg-[#0a0a0a] border border-white/5 rounded-xl overflow-hidden min-h-[100px] z-40">
          {searchItem.trim().length >= 2 ? (
            // Search Results
            <div className="max-h-[400px] overflow-y-auto">
              {isLoading ? (
                <div className="px-4 py-3 space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="w-12 h-18 rounded bg-white/5" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4 bg-white/5" />
                        <Skeleton className="h-3 w-1/4 bg-white/5" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchResults.length > 0 ? (
                <div className="py-2">
                  {searchResults.map((movie) => (
                    <Link
                      key={movie.id}
                      to={`/movie/${movie.id}`}
                      className="flex items-center gap-4 px-4 py-3 hover:bg-white/5 transition-colors duration-200"
                      onClick={() => {
                        saveRecentSearch(searchItem);
                        setSearchItem('');
                        onClose();
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
              ) : (
                <div className="px-4 py-8 text-gray-500 text-center text-sm">No results found for "{searchItem}"</div>
              )}
            </div>
          ) : (
            // Recent Searches
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-gray-500 tracking-wider">RECENT</span>
                {recentSearches.length > 0 && (
                  <button 
                    onClick={clearRecent}
                    className="text-xs text-gray-500 hover:text-white transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="space-y-1">
                {recentSearches.length > 0 ? (
                  recentSearches.map((query, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-white/5 px-2 py-2 rounded-md cursor-pointer transition-colors"
                      onClick={() => setSearchItem(query)}
                    >
                      <IconClock size={16} className="text-gray-500" />
                      <span className="text-sm">{query}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-600 py-2">No recent searches</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;