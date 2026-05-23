import React from 'react';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';

const Footer = () => {
  return (
    <footer className="bg-[#0F0F0F] border-t border-white/10">
      <div className="mx-auto max-w-7xl px-8 sm:px-12 lg:px-16 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-16">
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-2">
              <img src="/logo.svg" alt="Movo Logo" className="w-8 h-8" />
              <span className="text-foreground text-xl font-heading font-bold tracking-wide">Movo</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              Discover trending movies and series. Browse by genre, streaming provider, and more.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Explore</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <a
                  href="#all-movies"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  All Movies
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Data</h3>
            <p className="text-sm text-gray-400 leading-relaxed max-w-md">
              This product uses the{' '}
              <a
                href="https://www.themoviedb.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E50914] hover:underline"
              >
                TMDB
              </a>{' '}
              API but is not endorsed or certified by TMDB.
            </p>
          </div>
        </div>

        <Separator className="my-8 md:my-10 bg-white/10" />

        <p className="text-xs text-gray-500">
          &copy; {new Date().getFullYear()} Movo. We do not host media; content is linked from third-party services.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
