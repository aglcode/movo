import React from 'react';

const TrailerCinematicBars = () => {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {/* <div className="absolute inset-x-0 top-0 h-[72px] bg-[linear-gradient(to_bottom,rgba(0,0,0,0.96)_0%,rgba(0,0,0,0.9)_34%,rgba(0,0,0,0.5)_68%,rgba(0,0,0,0)_100%)]" /> */}
      <div className="absolute inset-x-0 bottom-0 h-[250px] bg-[linear-gradient(to_top,rgba(0,0,0,0.96)_0%,rgba(0,0,0,0.9)_34%,rgba(0,0,0,0.5)_68%,rgba(0,0,0,0)_100%)]" />
    </div>
  );
};

export default TrailerCinematicBars;
