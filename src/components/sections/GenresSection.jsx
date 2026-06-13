import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  IconChevronDown,
  IconStarFilled,
  IconBolt,
  IconMasksTheater,
  IconGhost,
  IconHeart,
  IconCompass,
  IconRocket,
  IconWand,
  IconCategory,
  IconMoodSmile,
  IconSkull,
  IconMusic,
} from '@tabler/icons-react';
import CarouselArrow from './CarouselArrow';
import { getGenres, discoverByGenre } from '@/api/ENDPOINTS';

const GENRE_ICONS = {
  Action: IconBolt,
  Adventure: IconCompass,
  Animation: IconWand,
  Comedy: IconMoodSmile,
  Crime: IconSkull,
  Documentary: IconCategory,
  Drama: IconMasksTheater,
  Family: IconHeart,
  Fantasy: IconWand,
  History: IconCategory,
  Horror: IconGhost,
  Music: IconMusic,
  Mystery: IconGhost,
  Romance: IconHeart,
  'Science Fiction': IconRocket,
  'TV Movie': IconCategory,
  Thriller: IconBolt,
  War: IconCategory,
  Western: IconCompass,
};

const getGenreIcon = (name) => {
  const Icon = GENRE_ICONS[name] || IconCategory;
  return <Icon className="w-5 h-5 shrink-0" />;
};

const GenresSection = () => {
  const carouselRef = useRef(null);
  const genreDropdownRef = useRef(null);
  const movieBtnRef = useRef(null);
  const tvBtnRef = useRef(null);

  const [mediaType, setMediaType] = useState('movie');
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [genreItems, setGenreItems] = useState([]);
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const data = await getGenres(mediaType);
        const list = data.genres || [];
        setGenres(list);
        setSelectedGenre((prev) => {
          if (prev) {
            const match = list.find((g) => g.id === prev.id);
            if (match) return match;
          }
          return list.find((g) => g.name === 'Comedy') || list[0] || null;
        });
      } catch (error) {
        console.error(`Error fetching genres: ${error}`);
        setGenres([]);
        setSelectedGenre(null);
      }
    };

    fetchGenres();
  }, [mediaType]);

  useEffect(() => {
    if (!selectedGenre) {
      setGenreItems([]);
      return;
    }

    const fetchByGenre = async () => {
      try {
        const data = await discoverByGenre(mediaType, selectedGenre.id);
        setGenreItems(data.results || []);
      } catch (error) {
        console.error(`Error fetching ${mediaType} by genre: ${error}`);
        setGenreItems([]);
      }
    };

    fetchByGenre();
  }, [selectedGenre, mediaType]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (genreDropdownRef.current && !genreDropdownRef.current.contains(event.target)) {
        setShowGenreDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const updateIndicator = () => {
      const activeBtn = mediaType === 'movie' ? movieBtnRef.current : tvBtnRef.current;
      if (activeBtn) {
        setIndicatorStyle({
          left: activeBtn.offsetLeft,
          width: activeBtn.offsetWidth,
        });
      }
    };

    updateIndicator();
    const timeoutId = setTimeout(updateIndicator, 100);
    window.addEventListener('resize', updateIndicator);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateIndicator);
    };
  }, [mediaType]);

  if (!selectedGenre) return null;

  const displayType = mediaType === 'movie' ? 'Movie' : 'Series';

  return (
    <section className="py-20 bg-[#0F0F0F]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-[#1B4242] rounded-sm"></div>
            <div className="relative" ref={genreDropdownRef}>
              <button
                onClick={() => setShowGenreDropdown(!showGenreDropdown)}
                className="flex items-center gap-2 text-2xl font-bold text-white tracking-wide hover:text-white/80 transition-colors"
              >
                {selectedGenre.name}
                <IconChevronDown
                  className={`w-5 h-5 text-[#1B4242] transition-transform duration-200 ${showGenreDropdown ? 'rotate-180' : ''}`}
                />
              </button>

              {showGenreDropdown && (
                <div className="absolute top-full left-0 mt-2 bg-[#1a1a1a]/95 border border-white/10 rounded-xl shadow-2xl z-50 min-w-[220px] max-h-[360px] overflow-y-auto py-2 animate-in fade-in slide-in-from-top-2 duration-200 scrollbar-thin">
                  {genres.map((genre) => (
                    <button
                      key={genre.id}
                      onClick={() => {
                        setSelectedGenre(genre);
                        setShowGenreDropdown(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-white/10 ${
                        selectedGenre.id === genre.id ? 'text-[#1B4242]' : 'text-gray-400'
                      }`}
                    >
                      {getGenreIcon(genre.name)}
                      {genre.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="relative flex items-center gap-6 border-b border-white/10 pb-2">
            <button
              ref={movieBtnRef}
              onClick={(e) => {
                setMediaType('movie');
                setIndicatorStyle({ left: e.currentTarget.offsetLeft, width: e.currentTarget.offsetWidth });
              }}
              className={`text-sm md:text-base font-bold transition-colors duration-300 ${
                mediaType === 'movie' ? 'text-white' : 'text-gray-500 hover:text-white'
              }`}
            >
              Movies
            </button>
            <button
              ref={tvBtnRef}
              onClick={(e) => {
                setMediaType('tv');
                setIndicatorStyle({ left: e.currentTarget.offsetLeft, width: e.currentTarget.offsetWidth });
              }}
              className={`text-sm md:text-base font-bold transition-colors duration-300 ${
                mediaType === 'tv' ? 'text-white' : 'text-gray-500 hover:text-white'
              }`}
            >
              Series
            </button>

            <div
              className="absolute left-0 -bottom-[1px] h-[2px] bg-[#1B4242] transition-all duration-300 ease-in-out"
              style={{
                transform: `translateX(${indicatorStyle.left}px)`,
                width: `${indicatorStyle.width}px`,
              }}
            />
          </div>
        </div>

        <div className="relative">
          <CarouselArrow direction="left" onClick={() => scrollCarousel('left')} />

          <div
            ref={carouselRef}
            className="flex overflow-x-auto gap-5 pb-4 scrollbar-hide snap-x snap-mandatory px-1"
          >
            {genreItems.map((item) => {
              const title = item.title || item.name;
              const releaseDate = item.release_date || item.first_air_date;

              return (
                <div key={item.id} className="flex-none w-[140px] sm:w-[200px] snap-start group cursor-pointer">
                  <Link to={`/${mediaType}/${item.id}`} className="block">
                    <div className="relative rounded-lg overflow-hidden border border-white/5 bg-white/5 aspect-[2/3] shadow-lg">
                      <img
                        src={item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '/No-Poster.png'}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>

                    <div className="mt-4 space-y-1">
                      <h3 className="text-white font-medium text-sm truncate group-hover:text-white/80 transition-colors">
                        {title}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium">
                        <span className="flex items-center gap-[2px] text-[#45A8A8]">
                          <IconStarFilled className="w-3 h-3" />
                          {item.vote_average?.toFixed(1) || 'N/A'}
                        </span>
                        <span className="text-gray-600">&bull;</span>
                        <span>{releaseDate?.substring(0, 4) || 'N/A'}</span>
                        <span className="text-gray-600">&bull;</span>
                        <span>{displayType}</span>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>

          <CarouselArrow direction="right" onClick={() => scrollCarousel('right')} />

          <div className="carousel-gradient-left" />
          <div className="carousel-gradient-right" />
        </div>
      </div>
    </section>
  );
};

export default GenresSection;
