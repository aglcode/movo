import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { IconPlayerPlayFilled, IconInfoCircle, IconStarFilled } from '@tabler/icons-react';

const HeroCarousel = ({ trendingMovies, genres }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!trendingMovies || trendingMovies.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % trendingMovies.length);
    }, 8000); // Rotate every 8 seconds

    return () => clearInterval(interval);
  }, [trendingMovies]);

  if (!trendingMovies || trendingMovies.length === 0) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const activeMovie = trendingMovies[currentIndex];

  // Map genre IDs to names
  const movieGenres = activeMovie.genre_ids
    ?.map(id => genres.find(g => g.id === id)?.name)
    .filter(Boolean) || [];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Background Images with Crossfade */}
      {trendingMovies.map((movie, index) => (
        <div
          key={movie.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <img
            src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Gradients to ensure text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent z-20" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-20" />

      {/* Content Overlay */}
      <div className="absolute inset-0 z-30 container mx-auto px-6 md:px-12 flex flex-col justify-center">
        <div className="max-w-3xl space-y-6 mt-16">
          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tight leading-tight">
            {activeMovie.title || activeMovie.original_title}
          </h1>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm md:text-base text-gray-300 font-medium">
            {activeMovie.vote_average > 0 && (
              <div className="flex items-center gap-1 text-red-500">
                <IconStarFilled className="w-4 h-4" />
                <span>{activeMovie.vote_average.toFixed(1)}</span>
              </div>
            )}
            <span>&bull;</span>
            <span>{activeMovie.release_date?.substring(0, 4)}</span>
            
            {movieGenres.length > 0 && (
              <>
                <span>&bull;</span>
                <span className="flex items-center gap-2">
                  {movieGenres.slice(0, 3).map((genre, i) => (
                    <span key={i}>
                      {genre}
                      {i < Math.min(movieGenres.length, 3) - 1 ? <span className="ml-2 text-gray-500">&bull;</span> : null}
                    </span>
                  ))}
                </span>
              </>
            )}
          </div>

          {/* Overview */}
          <p className="text-gray-300 text-lg md:text-xl leading-relaxed line-clamp-3 md:line-clamp-4 max-w-2xl">
            {activeMovie.overview}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4">
            <Button size="lg" className="bg-white text-black hover:bg-white/90 rounded-full px-8 py-6 font-bold text-lg" asChild>
              <Link to={`/movie/${activeMovie.id}`}>
                <IconPlayerPlayFilled className="w-6 h-6 mr-2" />
                Play
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-black/40 backdrop-blur-md border-white/20 text-white hover:bg-black/60 rounded-full px-8 py-6 font-bold text-lg" asChild>
              <Link to={`/movie/${activeMovie.id}`}>
                <IconInfoCircle className="w-6 h-6 mr-2" />
                See More
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Carousel Indicators (Optional, for better UX) */}
      <div className="absolute bottom-12 right-12 z-30 hidden md:flex items-center gap-2">
        {trendingMovies.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'bg-white w-8' : 'bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
