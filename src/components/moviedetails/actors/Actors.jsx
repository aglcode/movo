import React from 'react';

const Actors = ({ cast }) => {
  if (!cast?.length) return null;

  return (
    <section id="actors" className="bg-black py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-8 sm:px-12 lg:px-16">
        <div className="flex items-center gap-3 mb-8 md:mb-10">
          <div className="w-1 h-6 bg-[#E50914] rounded-sm" />
          <h2 className="text-2xl font-bold text-white tracking-wide">Actors</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cast.map((actor) => (
            <div
              key={actor.id}
              className="flex items-center gap-4 rounded-xl bg-[#1a1a1a] border border-white/5 p-4"
            >
              <img
                src={
                  actor.profile_path
                    ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                    : '/No-Poster.png'
                }
                alt={actor.name}
                className="size-14 shrink-0 rounded-full object-cover bg-white/10"
              />
              <div className="min-w-0">
                <p className="font-bold text-white truncate">{actor.name}</p>
                <p className="text-sm text-gray-400 truncate">{actor.character}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Actors;
