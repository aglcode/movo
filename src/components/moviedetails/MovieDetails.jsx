import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  IconArrowLeft,
  IconStarFilled,
  IconPlayerPlayFilled,
  IconPlus,
  IconExternalLink,
  IconSparkles,
  IconCheck,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Footer from '../Footer';
import TrailerHero from './TrailerHero';
import Actors from './actors';
import EpisodeList from './episodes';
import YouMayLike from './similars';
import PlayWindow from '../PlayWindow/PlayWindow';
import { getDetails, getWatchProviders, getSimilar, getCredits } from '@/api/ENDPOINTS';
import { updateClickCount, updatePlayCount } from '@/supabase';

const WATCHLIST_KEY = 'movo-watchlist';

const formatRuntime = (minutes) => {
  if (!minutes) return null;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
};

const getTrailerKey = (videos) =>
  videos?.results?.find((video) => video.type === 'Trailer' && video.site === 'YouTube')?.key ?? null;

const getWatchlist = () => {
  try {
    return JSON.parse(localStorage.getItem(WATCHLIST_KEY) || '[]');
  } catch {
    return [];
  }
};

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const mediaType = location.pathname.startsWith('/tv') ? 'tv' : 'movie';

  const [item, setItem] = useState(null);
  const [providers, setProviders] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [cast, setCast] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isMuted, setIsMuted] = useState(true);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [playerEpisode, setPlayerEpisode] = useState({ season: 1, episode: 1 });
  const playerRef = useRef(null);

  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      setErrorMessage('');
      setCast([]);

      try {
        const [detailsData, providersData, similarData, creditsData] = await Promise.allSettled([
          getDetails(mediaType, id),
          getWatchProviders(mediaType, id),
          getSimilar(mediaType, id),
          getCredits(mediaType, id),
        ]);

        if (detailsData.status === 'rejected') {
          throw new Error('Failed to fetch details');
        }

        // fire and forget on click no awaits 
        const detail = detailsData.value;
        setItem(detail);
        updateClickCount({
          media_type: mediaType,
          tmdb_id: Number(id),
          title: detail.title || detail.name,
          poster_url: detail.poster_path ? `https://image.tmdb.org/t/p/w500${detail.poster_path}` : null,
        });

        if (providersData.status === 'fulfilled') {
          setProviders(providersData.value.results?.US ?? null);
        }

        if (similarData.status === 'fulfilled') {
          setSimilar(similarData.value.results?.slice(0, 16) ?? []);
        }

        if (creditsData.status === 'fulfilled') {
          setCast(creditsData.value.cast?.slice(0, 12) ?? []);
        } else {
          setCast([]);
        }

        const list = getWatchlist();
        setInWatchlist(list.some((entry) => entry.id === Number(id) && entry.type === mediaType));
      } catch (error) {
        console.error(`Error fetching ${mediaType} details:`, error);
        setErrorMessage('Could not load details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
    setIsMuted(true);
    window.scrollTo(0, 0);
  }, [id, mediaType]);

  const toggleWatchlist = () => {
    const list = getWatchlist();
    const entry = { id: Number(id), type: mediaType };

    if (inWatchlist) {
      const updated = list.filter((w) => !(w.id === entry.id && w.type === entry.type));
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
      setInWatchlist(false);
    } else {
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify([...list, entry]));
      setInWatchlist(true);
    }
  };

  const scrollToSimilars = () => {
    document.getElementById('similars')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePlayMovie = useCallback(() => {
    if (mediaType === 'tv') {
      setPlayerEpisode({ season: 1, episode: 1 });
    }
    setShowPlayer(true);
    setTimeout(() => {
      playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    // fire and forget on play no awaits 
    if (item) {
      updatePlayCount({
        media_type: mediaType,
        tmdb_id: Number(id),
        title: item.title || item.name,
        poster_url: item.poster_path
          ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
          : null,
        season_number: mediaType === 'tv' ? 1 : null,
        episode_number: mediaType === 'tv' ? 1 : null,
      });
    }
  }, [mediaType, id, item]);

  const handleEpisodePlay = useCallback((season, episode) => {
    setPlayerEpisode({ season, episode });
    setShowPlayer(true);
    setTimeout(() => {
      playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, []);

  const handleClosePlayer = useCallback(() => {
    setShowPlayer(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <Skeleton className="h-screen w-full rounded-none" />
      </div>
    );
  }

  if (errorMessage || !item) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-white/70">{errorMessage || 'Title not found.'}</p>
        <Button variant="outline" asChild>
          <Link to="/">Go back home</Link>
        </Button>
      </div>
    );
  }

  const title = item.title || item.name;
  const releaseDate = item.release_date || item.first_air_date;
  const year = releaseDate ? releaseDate.split('-')[0] : 'N/A';
  const rating = item.vote_average ? Math.round(item.vote_average) : 'N/A';
  const runtime = formatRuntime(item.runtime || item.episode_run_time?.[0]);
  const primaryGenre = item.genres?.[0]?.name ?? 'N/A';
  const trailerKey = getTrailerKey(item.videos);

  return (
    <>
      <div className="relative min-h-screen overflow-hidden bg-black">
        <TrailerHero
          backdropPath={item.backdrop_path}
          title={title}
          trailerKey={trailerKey}
          isMuted={isMuted}
          onMuteToggle={setIsMuted}
        />

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 z-30 flex size-11 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
          aria-label="Go back"
        >
          <IconArrowLeft className="size-5" />
        </button>

        <div className="relative z-20 flex min-h-screen flex-col justify-end px-6 pb-12 pt-24 sm:px-12 md:px-16 lg:pb-20">
          <div className="max-w-2xl space-y-5">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold uppercase tracking-wide text-white leading-tight">
              {title}
            </h1>

            <div className="flex flex-wrap items-center gap-2 text-sm text-white/80 font-medium">
              <span className="flex items-center gap-1 text-brand-light">
                <IconStarFilled className="size-4" />
                {rating}
              </span>
              <span className="text-white/40">&bull;</span>
              <span>{year}</span>
              {runtime && (
                <>
                  <span className="text-white/40">&bull;</span>
                  <span>{runtime}</span>
                </>
              )}
              <span className="text-white/40">&bull;</span>
              <span>{primaryGenre}</span>
            </div>

            {item.overview && (
              <p className="text-sm sm:text-base text-white/75 leading-relaxed line-clamp-4 sm:line-clamp-5">
                {item.overview}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {/* Primary Play button — opens Vidking player */}
              <Button
                type="button"
                size="lg"
                className="rounded-full bg-white text-black hover:bg-white/90 px-8 font-semibold"
                onClick={handlePlayMovie}
              >
                <IconPlayerPlayFilled className="size-5 mr-2 fill-black" />
                Play
              </Button>

              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={toggleWatchlist}
                className="size-12 rounded-full border-white/20 bg-black/40 text-white hover:bg-white/10 hover:text-white"
                aria-label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
              >
                {inWatchlist ? <IconCheck className="size-5" /> : <IconPlus className="size-5" />}
              </Button>

              {/* Fallback: external watch provider link */}
              {providers?.link && (
                <Button
                  type="button"
                  size="lg"
                  variant="outline"
                  className="rounded-full border-white/20 bg-black/40 text-white hover:bg-white/10 hover:text-white gap-2"
                  asChild
                >
                  <a href={providers.link} target="_blank" rel="noopener noreferrer">
                    <IconExternalLink className="size-5" />
                    Where to Watch
                  </a>
                </Button>
              )}

              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={scrollToSimilars}
                disabled={similar.length === 0}
                className="rounded-full border-white/20 bg-black/40 text-white hover:bg-white/10 hover:text-white gap-2"
              >
                <IconSparkles className="size-5" />
                Similars
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Vidking Player */}
      {showPlayer && (
        <div ref={playerRef}>
          <PlayWindow
            tmdbId={id}
            mediaType={mediaType}
            season={mediaType === 'tv' ? playerEpisode.season : undefined}
            episode={mediaType === 'tv' ? playerEpisode.episode : undefined}
            onClose={handleClosePlayer}
          />
        </div>
      )}

      {mediaType === 'tv' && item.seasons?.length > 0 && (
        <EpisodeList tvId={id} seasons={item.seasons} onEpisodePlay={handleEpisodePlay} />
      )}
      <Actors cast={cast} />
      <YouMayLike items={similar} mediaType={mediaType} />
      <Footer />
    </>
  );
};

export default MovieDetails;
