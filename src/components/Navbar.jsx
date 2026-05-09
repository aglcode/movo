import React from 'react';
import { Link } from 'react-router-dom';
import Search from './Search';
import { Button } from '@/components/ui/button';
import { IconHome, IconCode, IconLayoutGrid, IconUser } from '@tabler/icons-react';

const Navbar = ({ searchItem, setSearchItem }) => {
  return (
    <nav className="absolute top-0 left-0 right-0 z-50 py-4 px-6 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2">
        <img src="/logo.svg" alt="Movo Logo" className="w-8 h-8" />
        <span className="text-foreground text-xl font-heading font-bold tracking-wide">Movo</span>
      </Link>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Navigation Links (Hidden on small screens) */}
        <div className="hidden md:flex items-center gap-2 mr-2">
          <Button variant="ghost" className="text-white/80 hover:text-white" asChild>
            <Link to="/">
              <IconHome className="w-4 h-4 mr-2" />
              Home
            </Link>
          </Button>
          <Button variant="ghost" className="text-white/80 hover:text-white">
            <IconCode className="w-4 h-4 mr-2" />
            API
          </Button>
          <Button variant="ghost" className="text-white/80 hover:text-white">
            <IconLayoutGrid className="w-4 h-4 mr-2" />
            Browse
          </Button>
        </div>

        {/* Search Input (Compact Mode) */}
        <div className="w-64 hidden sm:block">
          <Search searchItem={searchItem} setSearchItem={setSearchItem} compact={true} />
        </div>

        {/* User Profile / Login */}
        <Button variant="ghost" size="icon" className="text-white/80 hover:text-white rounded-full">
          <IconUser className="w-5 h-5" />
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
