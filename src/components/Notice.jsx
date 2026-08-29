import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2Icon, X } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import changelog from '@/data/changelog';

const STORAGE_KEY = 'movo-changelog-notice';
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

const getNoticeKey = (entry) => `${entry.date}::${entry.title}::${entry.description}`;

const getStoredNotice = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const setStoredNotice = (entry) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        entryKey: getNoticeKey(entry),
        shownAt: Date.now(),
      }),
    );
  } catch {
    // ignore storage failures
  }
};

const isPageReload = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  if ('performance' in window && performance.getEntriesByType) {
    const navEntries = performance.getEntriesByType('navigation');
    if (navEntries && navEntries.length > 0) {
      return navEntries[0].type === 'reload';
    }
  }

  return performance.navigation?.type === 1;
};

const Notice = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const latestEntry = changelog[0];
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!latestEntry || location.pathname !== '/') {
      setIsVisible(false);
      return;
    }

    if (!isPageReload()) {
      setIsVisible(false);
      return;
    }

    const stored = getStoredNotice();
    const now = Date.now();
    const currentEntryKey = getNoticeKey(latestEntry);

    const hasNewEntry = !stored || stored.entryKey !== currentEntryKey;
    const sameEntryWithinGracePeriod =
      stored &&
      stored.entryKey === currentEntryKey &&
      now - stored.shownAt < THREE_DAYS_MS;

    const shouldShow = hasNewEntry || sameEntryWithinGracePeriod;

    setIsVisible(shouldShow);

    if (hasNewEntry) {
      setStoredNotice(latestEntry);
    }
  }, [latestEntry, location.pathname]);

  const handleDismiss = (event) => {
    event.stopPropagation();
    if (!latestEntry) return;
    setIsVisible(false);
  };

  if (!isVisible || !latestEntry || location.pathname !== '/') {
    return null;
  }

  return (
    <div className="fixed bottom-5 left-5 z-[100] w-[calc(100%-2.5rem)] max-w-sm sm:bottom-6 sm:left-6">
      <Alert
        className="cursor-pointer border-white/10 bg-black/80 text-white shadow-2xl shadow-black/40 backdrop-blur-md"
        onClick={() => navigate('/changelog')}
      >
        <button
          type="button"
          aria-label="Dismiss changelog notice"
          onClick={handleDismiss}
          className="absolute right-2 top-2 rounded-full p-1 text-white/60 transition-colors hover:bg-white/5 hover:text-white"
        >
          <X className="size-3.5" />
        </button>

        <CheckCircle2Icon className="text-emerald-400" />
        <AlertTitle className="pr-6 text-sm text-white">
          <span className="text-brand">What&apos;s new:</span> {latestEntry.title}
        </AlertTitle>
        <AlertDescription className="pr-6 text-xs text-white/70">
          {latestEntry.description}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default Notice;