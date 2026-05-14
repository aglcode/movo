import React from 'react'
import { Link } from 'react-router-dom';
import { IconStarFilled } from '@tabler/icons-react';

const TrendingCard = ({ item, type }) => {
  const title = item.title || item.name;
  const releaseDate = item.release_date || item.first_air_date;
  const year = releaseDate ? releaseDate.split('-')[0] : 'N/A';
  const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
  const displayType = type === 'movie' ? 'Movie' : 'Series';

  return (
    <Link to={`/${type}/${item.id}`} className="block group">
      <div className="flex flex-col gap-3">
        {/* Backdrop Image */}
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-white/5 border border-white/10 transition-all duration-300 group-hover:scale-[1.02] group-hover:border-white/20">
          <img
            src={item.backdrop_path ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}` : '/No-Poster.png'}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Text Details */}
        <div className="space-y-1">
          <h3 className="text-white font-medium text-sm sm:text-base truncate group-hover:text-white/80 transition-colors">
            {title}
          </h3>
          <div className="flex items-center gap-2 text-[11px] sm:text-xs text-gray-400 font-medium">
            <span className="flex items-center gap-[2px] text-[#E50914]">
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
  )
}

export default React.memo(TrendingCard);
