import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { IconStarFilled } from '@tabler/icons-react';
import CarouselArrow from './CarouselArrow';

const Top10Section = ({ trendingMovies }) => {
  const carouselRef = useRef(null);

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (trendingMovies.length === 0) return null;

  return (
    <section className="py-20 bg-[#0F0F0F]">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-6 bg-brand rounded-sm"></div>
          <h2 className="text-2xl font-bold text-white tracking-wide">TOP 10 Today</h2>
        </div>

        <div className="relative">
          <CarouselArrow direction="left" onClick={() => scrollCarousel('left')} />

          <div
            ref={carouselRef}
            className="flex overflow-x-auto gap-5 pb-4 scrollbar-hide snap-x snap-mandatory px-1"
          >
            {trendingMovies.map((movie, index) => (
              <div key={movie.id} className="flex-none w-[140px] sm:w-[200px] snap-start group cursor-pointer">
                <Link to={`/movie/${movie.id}`} className="block">
                  <div className="relative rounded-lg overflow-hidden border border-white/5 bg-white/5 aspect-[2/3] shadow-lg">
                    <div
                      className="absolute top-0 left-0 bg-brand text-white w-9 pb-2 z-10 flex flex-col items-center pt-1 shadow-md"
                      style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%)' }}
                    >
                      <span className="text-[10px] font-bold leading-none tracking-wider mb-[2px]">TOP</span>
                      <span className="text-sm font-black leading-none">{String(index + 1).padStart(2, '0')}</span>
                    </div>

                    <img
                      src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/No-Poster.png'}
                      alt={movie.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="mt-4 space-y-1">
                    <h3 className="text-white font-medium text-sm truncate group-hover:text-white/80 transition-colors">{movie.title || movie.original_title}</h3>
                    <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium">
                      <span className="flex items-center gap-[2px] text-brand-light">
                        <IconStarFilled className="w-3 h-3" />
                        {movie.vote_average?.toFixed(1) || 'N/A'}
                      </span>
                      <span className="text-gray-600">&bull;</span>
                      <span>{movie.release_date?.substring(0, 4) || 'N/A'}</span>
                      <span className="text-gray-600">&bull;</span>
                      <span>Movie</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          <CarouselArrow direction="right" onClick={() => scrollCarousel('right')} />

          <div className="carousel-gradient-left" />
          <div className="carousel-gradient-right" />
        </div>
      </div>
    </section>
  );
};

export default Top10Section;
