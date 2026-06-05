import React from 'react';
import { IconDownload } from '@tabler/icons-react';

const IMAGE_BASE = 'https://image.tmdb.org/t/p/w300';

const EpisodeCard = ({ episode, index }) => {
  const { name, still_path, runtime, overview, episode_number } = episode;
  const epNum = episode_number ?? index + 1;

  return (
    <div className="episode-card group relative flex items-stretch gap-0 rounded-xl overflow-hidden border border-white/[0.06] bg-[#141414] hover:bg-[#1e1e1e] transition-colors duration-200">
      {/* Thumbnail */}
      <div className="relative shrink-0 w-[155px] min-h-[100px] sm:w-[170px] overflow-hidden">
        {/* Episode number badge */}
        <span className="absolute bottom-2 left-2 z-10 text-sm font-bold text-white/80 drop-shadow-lg select-none">
          {epNum}
        </span>

        <img
          src={still_path ? `${IMAGE_BASE}${still_path}` : '/No-Poster.png'}
          alt={`Episode ${epNum}: ${name}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />


      </div>

      {/* Content */}
      <div className="flex flex-1 min-w-0 flex-col justify-center gap-1 px-5 py-4">
        <div className="flex items-start gap-2 justify-between">
          <div className="min-w-0">
            <p className="font-semibold text-white truncate text-sm sm:text-base leading-snug">
              {name}
            </p>
            {runtime && (
              <p className="text-xs text-white/40 mt-0.5">{runtime} min</p>
            )}
          </div>
          {/* Download icon */}
          <button
            type="button"
            aria-label={`Download episode ${epNum}`}
            className="shrink-0 size-8 flex items-center justify-center rounded-full text-white/30 hover:text-white hover:bg-white/10 transition-all duration-150 ml-2"
          >
            <IconDownload className="size-4" />
          </button>
        </div>

        {overview && (
          <p className="text-xs sm:text-sm text-white/45 leading-relaxed line-clamp-2">
            {overview}
          </p>
        )}
      </div>
    </div>
  );
};

export default EpisodeCard;
