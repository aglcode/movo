import React, { useEffect, useRef, useCallback } from 'react';
import { IconX } from '@tabler/icons-react';
import { getProgress, saveProgress } from './hooks/useWatchProgress';
import { VIDSRC_BASE } from '@/lib/player';

/**
 * PlayWindow — Full-width VidSrc iframe player.
 *
 * Props:
 *   tmdbId       - TMDB ID of the movie or show
 *   mediaType    - 'movie' | 'tv'
 *   season       - season number (TV only)
 *   episode      - episode number (TV only)
 *   onClose      - callback to unmount the player
 *   autoPlay     - default true
 */
const PlayWindow = ({ tmdbId, mediaType, season, episode, onClose, autoPlay = true }) => {
  const iframeRef = useRef(null);

  // Build the VidSrc embed URL
  const buildSrc = useCallback(() => {
    const params = new URLSearchParams();
    if (autoPlay) params.set('autoplay', '1');

    // Resume from saved progress
    const saved = getProgress(mediaType, tmdbId, season, episode);
    if (saved?.currentTime && saved.currentTime > 5) {
      params.set('startAt', String(Math.floor(saved.currentTime)));
    }

    if (mediaType === 'tv' && season != null && episode != null) {
      params.set('autonext', '1');
      const qs = params.toString();
      return `${VIDSRC_BASE}/tv/${tmdbId}/${season}/${episode}${qs ? `?${qs}` : ''}`;
    }

    const qs = params.toString();
    return `${VIDSRC_BASE}/movie/${tmdbId}${qs ? `?${qs}` : ''}`;
  }, [tmdbId, mediaType, season, episode, autoPlay]);

  // Listen for VidSrc postMessage events
  useEffect(() => {
    const handleMessage = (event) => {
      // VidSrc sends data as an object with { type, data }
      const msg = event.data;
      if (!msg || msg.type !== 'PLAYER_EVENT' || !msg.data) return;

      saveProgress(msg.data);
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Lock body scroll when fullscreen player is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const src = buildSrc();

  return (
    <section
      id="play-window"
      className="fixed inset-0 z-[100] bg-black w-screen h-screen flex flex-col animate-in fade-in zoom-in-95 duration-300"
    >
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <span className="text-xs text-white/50 font-medium tracking-wide uppercase select-none pointer-events-none">
          Now Playing
        </span>
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center size-10 rounded-full bg-white/10 text-white hover:bg-red-500/90 hover:scale-105 backdrop-blur-sm transition-all duration-200 shadow-lg"
            aria-label="Close player"
          >
            <IconX className="size-5" />
          </button>
        </div>
      </div>

      {/* Player iframe */}
      <div className="flex-1 w-full h-full relative">
        <iframe
          ref={iframeRef}
          key={src}
          src={src}
          title="VidSrc Player"
          className="absolute inset-0 w-full h-full border-0"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
        />
      </div>
    </section>
  );
};

/*
 * ---------------------------------------------------------------------------
 * VidKing fallback (kept for rollback — restore imports from @/lib/vidking)
 * ---------------------------------------------------------------------------
 *
 * import { VIDKING_BASE, BRAND_COLOR } from '@/lib/vidking';
 *
 * const buildSrc = useCallback(() => {
 *   const params = new URLSearchParams();
 *   params.set('color', BRAND_COLOR);
 *   if (autoPlay) params.set('autoPlay', 'true');
 *   params.set('info', '0');
 *   params.set('title', '0');
 *
 *   if (mediaType === 'tv' && season != null && episode != null) {
 *     params.set('nextEpisode', 'true');
 *     params.set('episodeSelector', 'true');
 *     return `${VIDKING_BASE}/tv/${tmdbId}/${season}/${episode}?${params.toString()}`;
 *   }
 *
 *   return `${VIDKING_BASE}/movie/${tmdbId}?${params.toString()}`;
 * }, [tmdbId, mediaType, season, episode, autoPlay]);
 *
 * ---------------------------------------------------------------------------
 */

export default PlayWindow;
