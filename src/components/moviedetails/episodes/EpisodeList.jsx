import React, { useState, useEffect, useMemo, useRef } from 'react';
import { API_BASE_URL, API_OPTIONS } from '../../../lib/tmdb';
import SeasonSelector from './SeasonSelector';
import EpisodeCard from './EpisodeCard';

const EpisodeList = ({ tvId, seasons }) => {
  // Filter out "Specials" (season_number 0) and pick the first real season by default
  const availableSeasons = useMemo(
    () => (seasons ?? []).filter((s) => s.season_number > 0),
    [seasons]
  );

  const [selectedSeason, setSelectedSeason] = useState(
    availableSeasons[0]?.season_number ?? 1
  );
  const [episodes, setEpisodes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!tvId || !selectedSeason) return;

    const fetchEpisodes = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/tv/${tvId}/season/${selectedSeason}`,
          API_OPTIONS
        );
        if (res.ok) {
          const data = await res.json();
          setEpisodes(data.episodes ?? []);
        }
      } catch (err) {
        console.error('Error fetching episodes:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEpisodes();
    setSearchQuery('');
    // Scroll the episode list back to top when season changes
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [tvId, selectedSeason]);

  const filteredEpisodes = useMemo(() => {
    if (!searchQuery.trim()) return episodes;
    const q = searchQuery.toLowerCase();
    return episodes.filter(
      (ep) =>
        ep.name?.toLowerCase().includes(q) ||
        ep.overview?.toLowerCase().includes(q)
    );
  }, [episodes, searchQuery]);

  if (!availableSeasons.length) return null;

  return (
    <section id="episodes" className="bg-black py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-8 sm:px-12 lg:px-16">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-6 bg-[#E50914] rounded-sm" />
          <h2 className="text-2xl font-bold text-white tracking-wide">Episodes</h2>
        </div>

        {/* Controls row */}
        <div className="mb-6">
          <SeasonSelector
            seasons={availableSeasons}
            selectedSeason={selectedSeason}
            onSeasonChange={setSelectedSeason}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* Scrollable episode list */}
        <div
          ref={scrollRef}
          className="max-h-[600px] overflow-y-auto pr-1"
        >
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[100px] rounded-xl bg-white/5 animate-pulse"
                />
              ))}
            </div>
          ) : filteredEpisodes.length > 0 ? (
            <div className="space-y-3">
              {filteredEpisodes.map((ep, idx) => (
                <EpisodeCard key={ep.id ?? idx} episode={ep} index={idx} />
              ))}
            </div>
          ) : (
            <p className="text-center py-12 text-white/30 text-sm">
              No episodes found.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default EpisodeList;
