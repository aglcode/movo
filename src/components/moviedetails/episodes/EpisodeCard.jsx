import React from 'react';
import { IconPlayerPlayFilled, IconDownload } from '@tabler/icons-react';
import { getProgress } from '../../PlayWindow/hooks/useWatchProgress';

const IMAGE_BASE = 'https://image.tmdb.org/t/p/w300';

const EpisodeCard = ({ episode, index, seasonNumber, onPlay }) => {
  const { name, still_path, runtime, overview, episode_number } = episode;
  const epNum = episode_number ?? index + 1;

  // Check for saved watch progress (Temporarily disabled)
  // const progress = getProgress('tv', episode.show_id, seasonNumber, epNum);
  // const progressPercent = progress?.progress ?? 0;
  const progressPercent = 0;

  const handlePlay = () => {
    if (onPlay) {
      onPlay(seasonNumber, epNum);
    }
  };

  return (
    <div
      className="episode-card group relative flex items-stretch gap-0 rounded-xl overflow-hidden border border-white/[0.06] bg-[#141414] hover:bg-[#1e1e1e] transition-colors duration-200 cursor-pointer"
      onClick={handlePlay}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handlePlay();
        }
      }}
      aria-label={`Play Episode ${epNum}: ${name}`}
    >
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

        {/* Play overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/50 transition-all duration-300">
          <div className="opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300">
            <div className="flex items-center justify-center size-10 rounded-full bg-white/90 shadow-lg">
              <IconPlayerPlayFilled className="size-5 text-black ml-0.5" />
            </div>
          </div>
        </div>

        {/* Watch progress bar (Temporarily disabled) */}
        {/* {progressPercent > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10">
            <div
              className="h-full bg-[#1B4242] transition-all duration-300"
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
        )} */}
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
            onClick={(e) => e.stopPropagation()}
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
