import React, { useRef, useState, useEffect } from 'react';
import { IconChevronDown } from '@tabler/icons-react';
import TrendingCard from '../TrendingCard';
import CarouselArrow from './CarouselArrow';
import { discoverByProvider } from '@/api/ENDPOINTS';

const STREAMING_PROVIDERS = [
  { id: 8, name: 'Netflix', logo: 'https://image.tmdb.org/t/p/w45/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg' },
  { id: 9, name: 'Prime Video', logo: 'https://image.tmdb.org/t/p/w45/pvske1MyAoymrs5bBO8s6DmCo2y.jpg' },
  { id: 1899, name: 'Max', logo: 'https://image.tmdb.org/t/p/w45/6Q3YKUNA4UkZOYSfAoFyjjDHkYk.jpg' },
  { id: 337, name: 'Disney+', logo: 'https://image.tmdb.org/t/p/w45/97yvRBw1GzX7fXprcF80er19ot.jpg' },
  { id: 350, name: 'Apple TV+', logo: 'https://image.tmdb.org/t/p/w45/6uhKBfmtzFqOcLousHwZuzcrScK.jpg' },
  { id: 531, name: 'Paramount+', logo: 'https://image.tmdb.org/t/p/w45/xbhHHa1YgtpwhC8lb1NQ3ACVcZd.jpg' },
  { id: 15, name: 'Hulu', logo: 'https://image.tmdb.org/t/p/w45/zxrVdFjIjLqkfnwyghnfywTn3Lh.jpg' },
];

const ProviderSection = () => {
  const carouselRef = useRef(null);
  const providerDropdownRef = useRef(null);
  const movieBtnRef = useRef(null);
  const tvBtnRef = useRef(null);

  const [mediaType, setMediaType] = useState('movie');
  const [selectedProvider, setSelectedProvider] = useState(STREAMING_PROVIDERS[0]);
  const [providerItems, setProviderItems] = useState([]);
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const fetchProviderContent = async () => {
      try {
        const data = await discoverByProvider(mediaType, selectedProvider.id);
        setProviderItems(data.results || []);
      } catch (error) {
        console.error(`Error fetching provider ${mediaType}: ${error}`);
        setProviderItems([]);
      }
    };

    fetchProviderContent();
  }, [selectedProvider, mediaType]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (providerDropdownRef.current && !providerDropdownRef.current.contains(event.target)) {
        setShowProviderDropdown(false);
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

  return (
    <section className="py-20 bg-[#0F0F0F]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-brand rounded-sm"></div>
            <div className="relative" ref={providerDropdownRef}>
              <button
                onClick={() => setShowProviderDropdown(!showProviderDropdown)}
                className="flex items-center gap-2 text-2xl font-bold text-white tracking-wide hover:text-white/80 transition-colors"
              >
                Only on {selectedProvider.name}
                <IconChevronDown className={`w-5 h-5 transition-transform duration-200 ${showProviderDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showProviderDropdown && (
                <div className="absolute top-full left-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-50 min-w-[200px] py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  {STREAMING_PROVIDERS.map((provider) => (
                    <button
                      key={provider.id}
                      onClick={() => {
                        setSelectedProvider(provider);
                        setShowProviderDropdown(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-white/10 ${
                        selectedProvider.id === provider.id ? 'text-white bg-white/5' : 'text-gray-400'
                      }`}
                    >
                      <img src={provider.logo} alt={provider.name} className="w-6 h-6 rounded" />
                      {provider.name}
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
              className="absolute left-0 -bottom-[1px] h-[2px] bg-brand transition-all duration-300 ease-in-out"
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
            className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x snap-mandatory px-2"
          >
            {providerItems.map((item) => (
              <div key={item.id} className="flex-none w-[240px] sm:w-[280px] md:w-[320px] lg:w-[380px] snap-start">
                <TrendingCard item={item} type={mediaType} />
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

export default ProviderSection;
