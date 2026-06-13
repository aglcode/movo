import React from 'react';
import TrendingCard from '../../TrendingCard';

const YouMayLike = ({ items, mediaType }) => {
  if (!items?.length) return null;

  return (
    <section id="similars" className="bg-black py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-8 sm:px-12 lg:px-16">
        <div className="flex items-center gap-3 mb-8 md:mb-10">
          <div className="w-1 h-6 bg-[#1B4242] rounded-sm" />
          <h2 className="text-2xl font-bold text-white tracking-wide">You may like</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {items.map((item) => (
            <TrendingCard key={item.id} item={item} type={mediaType} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default YouMayLike;
