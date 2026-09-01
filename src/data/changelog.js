/**
 * Changelog data — static entries, newest first.
 *
 * Each entry has: date, title, description, author (name + avatarUrl),
 * and an optional readMoreUrl for linking to a full post.
 */

const changelog = [
  {
    date: '2026-09-01',
    title: 'Upgraded Video Player with Automatic Server Fallback',
    description:
      'We\'ve integrated CineSrc as our new primary video streaming source, paired with automatic fallback to VidSrc to ensure uninterrupted playback if a server becomes unavailable.',
    author: {
      name: 'Dev',
      avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=AA&radius=50&backgroundColor=F4B942&textColor=000000',
    },
  },
  {
    date: '2026-08-29',
    title: 'Stay Informed with New In-App Notices',
    description:
      'We\'ve introduced a sitewide notice banner to keep you seamlessly updated on important announcements and alerts while using the app.',
    author: {
      name: 'Dev',
      avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=AA&radius=50&backgroundColor=F4B942&textColor=000000',
    },
  },
  {
    date: '2026-08-29',
    title: 'Dedicated Search Results View',
    description:
      'Submitting a search now opens a dedicated results page so you can easily browse all matching titles. You can return to general browsing at any time with a single click.',
    author: {
      name: 'Dev',
      avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=AA&radius=50&backgroundColor=F4B942&textColor=000000',
    },
  },
  {
    date: '2026-08-22',
    title: 'Automated AI Changelog Generator',
    description:
      'Added a new CLI tool that uses AI to automatically generate user-friendly changelog entries from git changes. This streamlines the documentation process and keeps release notes effortlessly up to date.',
    author: {
      name: 'Dev',
      avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=AA&radius=50&backgroundColor=F4B942&textColor=000000',
    },
  },
  {
    date: '2026-08-22',
    title: 'Fixed mobile player controls',
    description:
      'Auto-hides top bar on mobile after 3 seconds, allowing access to the player\'s native controls.',
    author: {
      name: 'Dev',
      avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=AA&radius=50&backgroundColor=F4B942&textColor=000000',
    },
  },
  {
    date: '2026-08-18',
    title: 'Migrated Video Player from VidKing to VidSrc',
    description:
      'Replaced the VidKing embed player with VidSrc for faster, more stable movie and TV playback. Resume playback and progress tracking are now re-enabled via VidSrc\'s postMessage events and startAt parameter.',
    author: {
      name: 'Dev',
      avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=AA&radius=50&backgroundColor=F4B942&textColor=000000',
    },
  },
  {
    date: '2026-08-10',
    title: 'Redesigned Movie Details Page',
    description:
      'Completely overhauled the movie details experience with a new trailer hero section, auto-playing YouTube trailers, a refreshed layout for cast and similar titles, and a full-screen play window.',
    author: {
      name: 'Dev',
      avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=AA&radius=50&backgroundColor=F4B942&textColor=000000',
    },
  },
  {
    date: '2026-07-28',
    title: 'TV Show Support with Episode Browser',
    description:
      'Movo now supports TV shows alongside movies. Browse seasons and episodes with an inline episode picker, and jump straight into any episode with a single click.',
    author: {
      name: 'Dev',
      avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=AA&radius=50&backgroundColor=F4B942&textColor=000000',
    },
  },
  {
    date: '2026-07-15',
    title: 'Trending & Top 10 Sections Added',
    description:
      'The home page now features curated Trending Today and Top 10 sections powered by TMDB\'s trending endpoints. Cards include rank badges, rating overlays, and smooth horizontal scrolling.',
    author: {
      name: 'Dev',
      avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=AA&radius=50&backgroundColor=F4B942&textColor=000000',
    },
  },
];

export default changelog;
