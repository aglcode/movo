import React, { useState, useRef, useEffect } from 'react';
import { IconChevronDown, IconSearch, IconAdjustmentsHorizontal } from '@tabler/icons-react';

const SeasonSelector = ({ seasons, selectedSeason, onSeasonChange, searchQuery, onSearchChange }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentSeason = seasons.find((s) => s.season_number === selectedSeason);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Season Dropdown */}
      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors duration-150 min-w-[120px]"
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className="flex-1 text-left">
            {currentSeason ? `Season ${currentSeason.season_number}` : 'Season'}
          </span>
          <IconChevronDown
            className={`size-4 text-white/50 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {open && (
          <ul
            role="listbox"
            className="absolute left-0 top-full z-50 mt-1.5 max-h-60 w-48 overflow-y-auto rounded-xl border border-white/10 bg-[#1a1a1a] shadow-2xl py-1"
          >
            {seasons.map((season) => (
              <li key={season.season_number}>
                <button
                  type="button"
                  role="option"
                  aria-selected={season.season_number === selectedSeason}
                  onClick={() => {
                    onSeasonChange(season.season_number);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-100 ${
                    season.season_number === selectedSeason
                      ? 'text-[#1B4242] font-semibold bg-white/5'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Season {season.season_number}
                  {season.episode_count != null && (
                    <span className="ml-2 text-white/30 text-xs">({season.episode_count} eps)</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Search */}
      <div className="relative flex-1 min-w-[180px] max-w-xs">
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30 pointer-events-none" />
        <input
          type="text"
          placeholder="Search episode..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-lg border border-white/15 bg-white/5 py-2 pl-9 pr-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30 focus:bg-white/8 transition-colors duration-150"
        />
      </div>

      {/* Sort / filter stub */}
      <button
        type="button"
        aria-label="Filter episodes"
        className="flex items-center justify-center size-[38px] rounded-lg border border-white/15 bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-colors duration-150"
      >
        <IconAdjustmentsHorizontal className="size-4" />
      </button>
    </div>
  );
};

export default SeasonSelector;
