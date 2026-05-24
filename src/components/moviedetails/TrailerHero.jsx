import React, { useEffect, useRef, useState } from 'react';
import { IconVolume, IconVolumeOff } from '@tabler/icons-react';
import { getTrailerEmbedUrl } from '../../lib/tmdb';
import TrailerCinematicBars from './TrailerCinematicBars';

const TrailerHero = ({ backdropPath, trailerKey, isMuted, onMuteToggle }) => {
  const iframeRef = useRef(null);
  const bootTimerRef = useRef(null);
  const [isIframeReady, setIsIframeReady] = useState(false);

  useEffect(() => {
    setIsIframeReady(false);
    if (bootTimerRef.current) {
      clearTimeout(bootTimerRef.current);
    }
  }, [trailerKey]);

  useEffect(() => {
    return () => {
      if (bootTimerRef.current) {
        clearTimeout(bootTimerRef.current);
      }
    };
  }, []);

  const sendPlayerCommand = (func) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func, args: [] }),
      '*'
    );
  };

  const handleMuteToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nextMuted = !isMuted;
    sendPlayerCommand(nextMuted ? 'mute' : 'unMute');
    onMuteToggle(nextMuted);
  };

  const handleIframeLoad = () => {
    sendPlayerCommand('mute');
    sendPlayerCommand('playVideo');

    bootTimerRef.current = window.setTimeout(() => {
      sendPlayerCommand('mute');
      sendPlayerCommand('playVideo');
      setIsIframeReady(true);
    }, 900);
  };

  const trailerSrc = trailerKey ? getTrailerEmbedUrl(trailerKey) : '';

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      {backdropPath && (
        <img
          src={`https://image.tmdb.org/t/p/original${backdropPath}`}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
            trailerKey && isIframeReady ? 'opacity-0' : 'opacity-100'
          }`}
        />
      )}

      {trailerKey && (
        <div className="absolute inset-0 overflow-hidden">
          <iframe
            ref={iframeRef}
            src={trailerSrc}
            title={`${trailerKey} trailer`}
            className={`pointer-events-none absolute top-1/2 left-1/2 h-[159%] w-[150%] min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 border-0 transition-opacity duration-300 ${
              isIframeReady ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleIframeLoad}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />

          <TrailerCinematicBars />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-r from-black/58 via-black/18 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/18 via-black/6 to-transparent" />

      {trailerKey && (
        <button
          type="button"
          onClick={handleMuteToggle}
          className="absolute top-6 right-6 z-30 flex size-11 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
          aria-label={isMuted ? 'Unmute trailer' : 'Mute trailer'}
        >
          {isMuted ? <IconVolumeOff className="size-5" /> : <IconVolume className="size-5" />}
        </button>
      )}
    </div>
  );
};

export default TrailerHero;
