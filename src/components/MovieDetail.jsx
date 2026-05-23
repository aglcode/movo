import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { IconArrowLeft, IconStarFilled, IconClock, IconCalendar, IconMapPin, IconBuildingSkyscraper, IconExternalLink } from '@tabler/icons-react';
import Footer from './Footer';

const API_BASE_URL = 'https://api.themoviedb.org/3'
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [providers, setProviders] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchMovieAndProviders = async () => {
      try {
        const movieResponse = await fetch(`${API_BASE_URL}/movie/${id}?append_to_response=videos`, API_OPTIONS);
        if (!movieResponse.ok) {
          throw new Error('Failed to fetch movie details');
        }
        const movieData = await movieResponse.json();
        setMovie(movieData);

        const providersResponse = await fetch(`${API_BASE_URL}/movie/${id}/watch/providers`, API_OPTIONS);
        if (!providersResponse.ok) {
          throw new Error('Failed to fetch watch providers');
        }
        const providersData = await providersResponse.json();
        setProviders(providersData.results.US);

      } catch (error) {
        console.error(`Error fetching movie or providers: ${error}`);
        setErrorMessage('Error fetching movie details or watch providers. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieAndProviders();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-4xl w-full mx-auto px-4 space-y-6">
          <Skeleton className="w-full aspect-video rounded-2xl" />
          <div className="flex gap-6">
            <Skeleton className="w-[150px] h-[225px] rounded-xl shrink-0" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <p className="text-destructive">{errorMessage}</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link to="/">Go back home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Movie not found.</p>
      </div>
    );
  }

  const trailer = movie.videos?.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');
  const trailerKey = trailer ? trailer.key : null;

  const renderProviders = (providerType, title) => {
    if (!providers) return null;

    // Handle array of provider types
    const allProviders = Array.isArray(providerType)
      ? providerType.flatMap(type => providers[type] && Array.isArray(providers[type]) ? providers[type] : [])
      : (providers[providerType] && Array.isArray(providers[providerType]) ? providers[providerType] : []);

    if (allProviders.length === 0) return null;

    return (
      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="flex flex-wrap gap-2">
          {allProviders.map(provider => (
            <a
              key={provider.provider_id}
              href={providers.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Badge variant="outline" className="gap-2 h-8 px-3 hover:bg-accent transition-colors cursor-pointer">
                {provider.logo_path && (
                  <img
                    src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`}
                    alt={provider.provider_name}
                    className="h-4 w-4 rounded-sm"
                  />
                )}
                <span>{provider.provider_name}</span>
              </Badge>
            </a>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
    <main className="min-h-screen bg-background relative">
      {/* Background */}
      {movie.backdrop_path && (
        <div className="fixed inset-0 z-0">
          <img
            src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" />
        </div>
      )}

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        {/* Back button */}
        <Button variant="ghost" size="sm" className="mb-6 text-muted-foreground hover:text-foreground" asChild>
          <Link to="/">
            <IconArrowLeft className="size-4 mr-1" />
            Back
          </Link>
        </Button>

        <Card className="bg-card/80 backdrop-blur-md border-white/10 overflow-hidden">
          <CardContent className="p-0">
            {/* Trailer / Hero */}
            {trailerKey ? (
              <div className="relative w-full aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${trailerKey}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                  title="Movie Trailer"
                />
              </div>
            ) : movie.backdrop_path ? (
              <div className="relative w-full aspect-video">
                <img
                  src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
              </div>
            ) : (
              <div className="w-full aspect-video bg-muted flex items-center justify-center">
                <p className="text-muted-foreground text-lg font-medium">No Media Available</p>
              </div>
            )}

            {/* Content */}
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Poster */}
                {movie.poster_path && (
                  <div className="shrink-0 mx-auto md:mx-0">
                    <img
                      src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                      alt={movie.title}
                      className="w-[160px] h-[240px] object-cover rounded-xl ring-1 ring-white/10"
                    />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 space-y-4">
                  <h1 className="text-gradient text-2xl sm:text-3xl md:text-4xl font-bold text-left max-w-none mx-0 leading-tight">
                    {movie.title}
                  </h1>

                  {movie.tagline && (
                    <p className="text-muted-foreground italic text-sm">{movie.tagline}</p>
                  )}

                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-3">
                    {movie.vote_average > 0 && (
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 gap-1">
                        <IconStarFilled className="size-3" />
                        {movie.vote_average.toFixed(1)}
                      </Badge>
                    )}
                    {movie.release_date && (
                      <Badge variant="outline" className="gap-1">
                        <IconCalendar className="size-3" />
                        {movie.release_date}
                      </Badge>
                    )}
                    {movie.runtime > 0 && (
                      <Badge variant="outline" className="gap-1">
                        <IconClock className="size-3" />
                        {movie.runtime} min
                      </Badge>
                    )}
                  </div>

                  {/* Genres */}
                  {movie.genres?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {movie.genres.map(genre => (
                        <Badge key={genre.id} variant="secondary">
                          {genre.name}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Details */}
                  <div className="space-y-2 text-sm">
                    {movie.production_countries?.length > 0 && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <IconMapPin className="size-4 shrink-0" />
                        <span>{movie.production_countries.map(c => c.name).join(', ')}</span>
                      </div>
                    )}
                    {movie.production_companies?.length > 0 && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <IconBuildingSkyscraper className="size-4 shrink-0" />
                        <span>{movie.production_companies.map(c => c.name).join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Overview */}
              {movie.overview && (
                <>
                  <Separator className="bg-white/10" />
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Overview</h3>
                    <p className="text-foreground leading-relaxed">{movie.overview}</p>
                  </div>
                </>
              )}

              {/* Watch Providers */}
              {(providers?.flatrate || providers?.buy || providers?.rent) && (
                <>
                  <Separator className="bg-white/10" />
                  <div className="space-y-4">
                    {renderProviders('flatrate', 'Stream On')}
                    {renderProviders(['buy', 'rent'], 'Buy / Rent On')}
                  </div>
                </>
              )}

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {providers && providers.link ? (
                  <Button size="lg" asChild>
                    <a href={providers.link} target="_blank" rel="noopener noreferrer">
                      <IconExternalLink className="size-4 mr-2" />
                      Watch Now
                    </a>
                  </Button>
                ) : (
                  <Button size="lg" disabled className="opacity-50">
                    Watch Now (No providers)
                  </Button>
                )}
                <Button variant="outline" size="lg" asChild>
                  <Link to="/">Back to Browse</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
    <Footer />
    </>
  );
};

export default MovieDetail;