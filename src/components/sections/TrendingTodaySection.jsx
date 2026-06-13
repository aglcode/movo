import React, { useRef, useState, useEffect } from 'react';
import TrendingCard from '../TrendingCard';
import CarouselArrow from './CarouselArrow';
import { getTrending } from '@/api/ENDPOINTS';

const TrendingTodaySection = () => {
  const [trendingType, setTrendingType] = useState('movie');
  const [trendingItems, setTrendingItems] = useState([]);
  const carouselRef = useRef(null);
  const movieBtnRef = useRef(null);
  const tvBtnRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const loadTrendingItems = async () => {
      try {
        const data = await getTrending(trendingType, 'day');
        setTrendingItems(data.results);
      } catch (error) {
        console.error(`Error fetching trending ${trendingType}: ${error}`);
      }
    };

    loadTrendingItems();
  }, [trendingType]);

  useEffect(() => {
    const updateIndicator = () => {
      const activeBtn = trendingType === 'movie' ? movieBtnRef.current : tvBtnRef.current;
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
  }, [trendingType]);

  return (
    <section className="py-20 bg-[#0F0F0F]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-brand rounded-sm"></div>
            <h2 className="text-2xl font-bold text-white tracking-wide">Trending Today</h2>
          </div>

          <div className="relative flex items-center gap-6 border-b border-white/10 pb-2">
            <button
              ref={movieBtnRef}
              onClick={(e) => {
                setTrendingType('movie');
                setIndicatorStyle({ left: e.currentTarget.offsetLeft, width: e.currentTarget.offsetWidth });
              }}
              className={`text-sm md:text-base font-bold transition-colors duration-300 ${
                trendingType === 'movie' ? 'text-white' : 'text-gray-500 hover:text-white'
              }`}
            >
              Movies
            </button>
            <button
              ref={tvBtnRef}
              onClick={(e) => {
                setTrendingType('tv');
                setIndicatorStyle({ left: e.currentTarget.offsetLeft, width: e.currentTarget.offsetWidth });
              }}
              className={`text-sm md:text-base font-bold transition-colors duration-300 ${
                trendingType === 'tv' ? 'text-white' : 'text-gray-500 hover:text-white'
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
            {trendingItems.map((item) => (
              <div key={item.id} className="flex-none w-[240px] sm:w-[280px] md:w-[320px] lg:w-[380px] snap-start">
                <TrendingCard item={item} type={trendingType} />
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

export default TrendingTodaySection;
