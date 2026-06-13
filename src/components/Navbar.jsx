import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Search from './Search';
import { Button } from '@/components/ui/button';
import { IconHome, IconUser, IconSearch } from '@tabler/icons-react';

const Navbar = ({ searchItem, setSearchItem }) => {
  const [showSearchModal, setShowSearchModal] = useState(false);

  return (
    <>
      <nav className="absolute top-0 left-0 right-0 z-50 py-4 px-4 sm:px-6 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Movo Logo" className="w-8 h-8" />
          <span className="text-foreground text-xl font-heading font-bold tracking-wide">Movo</span>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Search Toggle (Dummy Input) */}
          <div 
            onClick={() => setShowSearchModal(true)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors border border-white/10 rounded-full px-4 py-2 cursor-text w-48 sm:w-64"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setShowSearchModal(true);
              }
            }}
          >
            <IconSearch className="w-4 h-4 text-white/50" />
            <span className="text-white/50 text-sm font-medium tracking-wide">Search...</span>
          </div>
        </div>
      </nav>

      {/* Search Modal */}
      {showSearchModal && (
        <Search
          searchItem={searchItem}
          setSearchItem={setSearchItem}
          onClose={() => setShowSearchModal(false)}
        />
      )}
    </>
  );
};

export default Navbar;
