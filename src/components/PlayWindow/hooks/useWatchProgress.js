/**
 * useWatchProgress — Watch progress persistence for the VidSrc Player.
 *
 * Currently uses localStorage.  When you're ready to migrate to Supabase,
 * swap the storage adapter functions at the bottom of this file.
 */

import { STORAGE_KEY } from '@/lib/player';

// Key helpers

// Build a unique storage key for a piece of content.
// Movies:  "movie-1078605"
// TV:      "tv-119051-1-8"
function buildKey(mediaType, tmdbId, season, episode) {
  if (mediaType === 'tv' && season != null && episode != null) {
    return `tv-${tmdbId}-${season}-${episode}`;
  }
  return `movie-${tmdbId}`;
}

// localStorage adapter
function readStore() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Retrieve saved progress for a given content item.
 * @returns {{ currentTime: number, duration: number, progress: number } | null}
 */
export function getProgress(mediaType, tmdbId, season, episode) {
  const store = readStore();
  const key = buildKey(mediaType, tmdbId, season, episode);
  return store[key] ?? null;
}

/**
 * Persist watch progress from a VidSrc PLAYER_EVENT data payload.
 *
 * Expected shape (from VidSrc postMessage):
 * {
 *   player_info: {
 *     imdb: "tt1300854" | null,
 *     tmdb: "1078605" | null,
 *     mediaType: "movie" | "tv",
 *     season: number | null,
 *     episode: number | null,
 *   },
 *   player_status: "playing" | "paused" | "completed" | "seeked",
 *   player_progress: number,   // current time in seconds
 *   player_duration: number,   // total duration in seconds
 * }
 */
export function saveProgress(eventData) {
  if (!eventData || !eventData.player_info) return;

  const { player_info, player_status, player_progress, player_duration } = eventData;

  // Resolve the content ID — prefer TMDB, fall back to IMDB
  const id = player_info.tmdb || player_info.imdb;
  if (!id) return;

  const { mediaType, season, episode } = player_info;

  // On 'completed', clear the entry so the user starts fresh next time.
  if (player_status === 'completed') {
    clearProgress(mediaType, id, season, episode);
    return;
  }

  // Only persist on 'playing' or 'seeked' (meaningful progress updates)
  if (player_status !== 'playing' && player_status !== 'seeked') return;

  const store = readStore();
  const key = buildKey(mediaType, id, season, episode);

  const currentTime = Math.floor(player_progress ?? 0);
  const duration = Math.floor(player_duration ?? 0);

  store[key] = {
    currentTime,
    duration,
    progress: duration > 0 ? parseFloat((currentTime / duration).toFixed(4)) : 0,
    updatedAt: Date.now(),
  };

  writeStore(store);
}

/*
 * ---------------------------------------------------------------------------
 * VidKing payload shape (kept for reference during rollback)
 * ---------------------------------------------------------------------------
 *
 * {
 *   event: 'timeupdate' | 'play' | 'pause' | 'ended' | 'seeked',
 *   currentTime: number,
 *   duration: number,
 *   progress: number,
 *   id: string,         // TMDB ID
 *   mediaType: 'movie' | 'tv',
 *   season: number,
 *   episode: number,
 *   timestamp: number,
 * }
 *
 * ---------------------------------------------------------------------------
 */

// Remove a saved progress entry (e.g. when the video finishes).
export function clearProgress(mediaType, tmdbId, season, episode) {
  const store = readStore();
  const key = buildKey(mediaType, tmdbId, season, episode);
  delete store[key];
  writeStore(store);
}

// Get all saved progress entries (useful for a "Continue Watching" section).
export function getAllProgress() {
  return readStore();
}

// ---------------------------------------------------------------------------
// Supabase adapter (ready to use — uncomment & wire up when migrating)
// ---------------------------------------------------------------------------
/*
import { supabase } from '@/supabase';

// Table: watch_progress
// Columns: user_id, content_key, current_time, duration, progress, updated_at

async function readStoreSupabase(userId) {
  const { data, error } = await supabase
    .from('watch_progress')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error reading watch progress from Supabase:', error);
    return {};
  }

  return (data ?? []).reduce((acc, row) => {
    acc[row.content_key] = {
      currentTime: row.current_time,
      duration: row.duration,
      progress: row.progress,
      updatedAt: new Date(row.updated_at).getTime(),
    };
    return acc;
  }, {});
}

async function writeStoreSupabase(userId, key, entry) {
  const { error } = await supabase
    .from('watch_progress')
    .upsert({
      user_id: userId,
      content_key: key,
      current_time: entry.currentTime,
      duration: entry.duration,
      progress: entry.progress,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,content_key' });

  if (error) {
    console.error('Error saving watch progress to Supabase:', error);
  }
}

async function clearStoreSupabase(userId, key) {
  const { error } = await supabase
    .from('watch_progress')
    .delete()
    .eq('user_id', userId)
    .eq('content_key', key);

  if (error) {
    console.error('Error clearing watch progress from Supabase:', error);
  }
}
*/
