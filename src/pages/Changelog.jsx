import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { IconArrowLeft, IconSearch, IconArrowRight } from '@tabler/icons-react';
import Footer from '../components/Footer';
import changelog from '../data/changelog';

/**
 * Format a date string (YYYY-MM-DD) into a display-friendly form like "AUG 18, 2026".
 */
function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return date
    .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    .toUpperCase();
}

const ChangelogPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return changelog;
    const q = searchQuery.toLowerCase();
    return changelog.filter(
      (entry) =>
        entry.title.toLowerCase().includes(q) ||
        entry.description.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  return (
    <main className="min-h-screen bg-background">
      {/* Header bar */}
      <nav className="sticky top-0 z-50 py-4 px-4 sm:px-6 flex items-center justify-between bg-background/80 backdrop-blur-md border-b border-white/5">
        <Link to="/" className="flex items-center gap-2 group">
          <IconArrowLeft className="size-4 text-white/50 group-hover:text-white transition-colors" />
          <img src="/logo.png" alt="Movo Logo" className="w-7 h-7" />
          <span className="text-foreground text-lg font-heading font-bold tracking-wide">Movo</span>
        </Link>
      </nav>

      <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16 py-12 md:py-20">
        {/* Two-column layout: sidebar + timeline */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          {/* Left sidebar */}
          <aside className="lg:sticky lg:top-28 lg:self-start shrink-0 lg:w-56 space-y-6">
            <h1 className="text-4xl sm:text-5xl font-heading font-bold text-foreground tracking-tight">
              Changelog
            </h1>

            {/* Search */}
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/40 pointer-events-none" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/50 transition-all"
              />
            </div>
          </aside>

          {/* Timeline entries */}
          <section className="flex-1 min-w-0">
            {filteredEntries.length === 0 ? (
              <p className="text-white/40 text-sm mt-4">No entries match your search.</p>
            ) : (
              <div className="relative">
                {/* Vertical timeline line */}
                <div
                  className="absolute left-[7px] top-2 bottom-0 w-px bg-white/10"
                  aria-hidden="true"
                />

                <ol className="space-y-16 md:space-y-20">
                  {filteredEntries.map((entry, index) => (
                    <li key={index} className="relative pl-10">
                      {/* Timeline dot */}
                      <span
                        className="absolute left-0 top-[7px] size-[15px] rounded-full border-[3px] border-brand bg-background"
                        aria-hidden="true"
                      />

                      {/* Date + Read more */}
                      <div className="flex items-center gap-3 mb-4">
                        <time
                          dateTime={entry.date}
                          className="text-xs font-semibold tracking-widest text-white/40 uppercase font-heading"
                        >
                          {formatDate(entry.date)}
                        </time>
                        {entry.readMoreUrl && (
                          <>
                            <span className="text-white/20">/</span>
                            <a
                              href={entry.readMoreUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-semibold tracking-wider text-brand hover:text-brand-light transition-colors uppercase"
                            >
                              Read more
                              <IconArrowRight className="size-3" />
                            </a>
                          </>
                        )}
                      </div>

                      {/* Title */}
                      <h2 className="text-xl sm:text-2xl md:text-[1.7rem] font-heading font-bold text-foreground leading-snug mb-3">
                        {entry.title}
                      </h2>

                      {/* Description */}
                      <p className="text-sm sm:text-[0.94rem] text-white/55 leading-relaxed max-w-2xl mb-5">
                        {entry.description}
                      </p>

                      {/* Author */}
                      <div className="flex items-center gap-2.5">
                        <img
                          src={entry.author.avatarUrl}
                          alt={entry.author.name}
                          className="size-7 rounded-full bg-white/10 object-cover"
                        />
                        <span className="text-sm font-medium text-white/60">
                          {entry.author.name}
                        </span>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default ChangelogPage;
