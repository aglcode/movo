import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Search from './Search';
import { Button } from '@/components/ui/button';
import { IconHome, IconUser, IconSearch, IconX } from '@tabler/icons-react';

const Navbar = ({ searchItem, setSearchItem }) => {
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  return (
    <>
      <nav className="absolute top-0 left-0 right-0 z-50 py-4 px-4 sm:px-6 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="Movo Logo" className="w-8 h-8" />
          <span className="text-foreground text-xl font-heading font-bold tracking-wide">Movo</span>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Navigation Links (Hidden on small screens) */}
          <div className="hidden md:flex items-center gap-2 mr-2">
            <Button variant="ghost" className="text-white/80 hover:text-white" asChild>
              <Link to="/">
                <IconHome className="w-4 h-4 mr-2" />
                Home
              </Link>
            </Button>
          </div>

          {/* Search Input (Desktop Mode) */}
          <div className="w-64 hidden sm:block">
            <Search searchItem={searchItem} setSearchItem={setSearchItem} compact={true} />
          </div>

          {/* Mobile Search Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="sm:hidden text-white/80 hover:text-white rounded-full"
            onClick={() => setShowMobileSearch(!showMobileSearch)}
          >
            {showMobileSearch ? <IconX className="w-5 h-5" /> : <IconSearch className="w-5 h-5" />}
          </Button>

          {/* User Profile / Login */}
          <Button variant="ghost" size="icon" className="text-white/80 hover:text-white rounded-full">
            <IconUser className="w-5 h-5" />
          </Button>
        </div>
      </nav>

      {/* Mobile Search Bar (Expandable) */}
      {showMobileSearch && (
        <div className="absolute top-[72px] left-0 right-0 z-40 px-4 sm:hidden animate-in slide-in-from-top-2">
          <Search searchItem={searchItem} setSearchItem={setSearchItem} compact={false} />
        </div>
      )}
    </>
  );
};

export default Navbar;
