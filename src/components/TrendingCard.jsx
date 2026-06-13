import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { IconStarFilled, IconVolume, IconVolumeOff } from '@tabler/icons-react';
import { fetchTrailerKey, getTrailerEmbedUrl } from '../lib/tmdb';

const TrendingCard = ({ item, type }) => {
  const title = item.title || item.name;
  const releaseDate = item.release_date || item.first_air_date;
  const year = releaseDate ? releaseDate.split('-')[0] : 'N/A';
  const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
  const displayType = type === 'movie' ? 'Movie' : 'Series';

  const [isHovered, setIsHovered] = useState(false);
  const [trailerKey, setTrailerKey] = useState(null);
  const [trailerChecked, setTrailerChecked] = useState(false);
  const [isTrailerVisible, setIsTrailerVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const hoverTimeoutRef = useRef(null);
  const trailerStartRef = useRef(null);
  const iframeRef = useRef(null);

  const sendPlayerCommand = (func) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func, args: [] }),
      '*'
    );
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (!trailerChecked) {
      hoverTimeoutRef.current = window.setTimeout(async () => {
        const key = await fetchTrailerKey(type, item.id);
        setTrailerKey(key);
        setTrailerChecked(true);
      }, 0);
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    if (trailerStartRef.current) {
      clearTimeout(trailerStartRef.current);
    }
    setIsHovered(false);
    setIsTrailerVisible(false);
    setIsMuted(true);
  };

  const handleIframeLoad = () => {
    sendPlayerCommand('mute');
    sendPlayerCommand('playVideo');

    if (trailerStartRef.current) {
      clearTimeout(trailerStartRef.current);
    }

    trailerStartRef.current = window.setTimeout(() => {
      sendPlayerCommand('mute');
      sendPlayerCommand('playVideo');
      setIsTrailerVisible(true);
    }, 650);
  };

  const handleMuteToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nextMuted = !isMuted;
    sendPlayerCommand(nextMuted ? 'mute' : 'unMute');
    setIsMuted(nextMuted);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (trailerStartRef.current) {
        clearTimeout(trailerStartRef.current);
      }
    };
  }, []);

  const showTrailer = isHovered && trailerKey;
  const trailerSrc = trailerKey ? getTrailerEmbedUrl(trailerKey) : '';

  return (
    <Link
      to={`/${type}/${item.id}`}
      className="block group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex flex-col gap-3">
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-white/5 border border-transparent transition-all duration-300 group-hover:scale-[1.02]">
          <img
            src={item.backdrop_path ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}` : '/No-Poster.png'}
            alt={title}
            className={`w-full h-full object-cover transition-all duration-500 ${
              showTrailer && isTrailerVisible ? 'opacity-0' : 'opacity-100 group-hover:scale-105'
            }`}
          />

          {showTrailer && (
            <div className="absolute inset-0 overflow-hidden">
              <iframe
                ref={iframeRef}
                key={trailerKey}
                src={trailerSrc}
                title={`${title} trailer`}
                className={`pointer-events-none absolute inset-0 h-full w-full border-0 transition-opacity duration-300 ${
                  isTrailerVisible ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={handleIframeLoad}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
              isHovered && !isTrailerVisible ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {showTrailer && isTrailerVisible && (
            <button
              type="button"
              onClick={handleMuteToggle}
              className="absolute top-3 right-3 z-20 flex size-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
              aria-label={isMuted ? 'Unmute trailer' : 'Mute trailer'}
            >
              {isMuted ? <IconVolumeOff className="size-4" /> : <IconVolume className="size-4" />}
            </button>
          )}
        </div>

        <div className="space-y-1">
          <h3 className="text-white font-medium text-sm sm:text-base truncate transition-colors group-hover:text-[#1B4242]">
            {title}
          </h3>
          <div className="flex items-center gap-2 text-[11px] sm:text-xs text-gray-400 font-medium">
            <span className="flex items-center gap-[2px] text-[#45A8A8]">
              <IconStarFilled className="w-3 h-3" />
              {rating}
            </span>
            <span className="text-gray-600">&bull;</span>
            <span>{year}</span>
            <span className="text-gray-600">&bull;</span>
            <span>{displayType}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default React.memo(TrendingCard);
