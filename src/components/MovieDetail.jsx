import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Spinner from './Spinner';

const API_BASE_URL = 'https://api.themoviedb.org/3'
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

// CURL Request
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
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        width: '100%'
      }}>
        <Spinner />
      </div>
    );
  }

  if (errorMessage) {
    return <p className='text-red-500'>{errorMessage}</p>;
  }

  if (!movie) {
    return <p>Movie not found.</p>;
  }

  const trailer = movie.videos?.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');
  const trailerKey = trailer ? trailer.key : null;

  const backgroundStyle = {
    backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
    minHeight: '100vh',
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: -1,
  };

  const renderProviders = (providerType, title) => {
    if (!providers) return null;

    // Handle array of provider types
    if (Array.isArray(providerType)) {
      const allProviders = providerType.flatMap(type => 
        providers[type] && Array.isArray(providers[type]) ? providers[type] : []
      );
      
      if (allProviders.length === 0) return null;

      return (
        <div className='text-white' style={{ 
          marginBottom: '15px', 
          display: 'flex', 
          flexDirection: 'column',
          gap: '10px'
        }}>
          <strong className='text-white' style={{ color: 'white', lineHeight: '1.2em' }}>{title}:</strong> 
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {allProviders.map(provider => (
              <a 
                key={provider.provider_id} 
                href={providers.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className='text-white'
                style={{
                  padding: '5px 10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  borderRadius: '5px',
                  textDecoration: 'none',
                  color: 'white',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  lineHeight: '1.2em'
                }}
              >
                {provider.logo_path && (
                  <img 
                    src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`}
                    alt={provider.provider_name}
                    style={{ height: '20px', width: '20px', borderRadius: '3px' }}
                  />
                )}
                <span>{provider.provider_name}</span>
              </a>
            ))}
          </div>
        </div>
      );
    }

    // Handle single provider type
    if (!providers[providerType] || !Array.isArray(providers[providerType]) || providers[providerType].length === 0) {
      return null;
    }

    return (
      <div className='text-white' style={{ 
        marginBottom: '15px', 
        display: 'flex', 
        flexDirection: 'column',
        gap: '10px'
      }}>
        <strong className='text-white' style={{ color: 'white', lineHeight: '1.2em' }}>{title}:</strong> 
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {providers[providerType].map(provider => (
            <a 
              key={provider.provider_id} 
              href={providers.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className='text-white'
              style={{
                padding: '5px 10px',
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                borderRadius: '5px',
                textDecoration: 'none',
                color: 'white',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                lineHeight: '1.2em'
              }}
            >
              {provider.logo_path && (
                <img 
                  src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`}
                  alt={provider.provider_name}
                  style={{ height: '20px', width: '20px', borderRadius: '3px' }}
                />
              )}
              <span>{provider.provider_name}</span>
            </a>
          ))}
        </div>
      </div>
    );
  };

  return (
    <main>
      <div style={backgroundStyle} />
      <div className='pattern' />
      <div className='wrapper' style={{ position: 'relative', zIndex: 1, padding: '0 20px' }}>
        <header style={{ textAlign: 'center', marginBottom: '20px', paddingTop: '20px' }}>
          <img src="/logo.svg" alt="Logo" style={{ width: '80px', marginBottom: '10px' }} />
        </header>

        <section className='movie-card' style={{ padding: '20px' }}>
          <div style={{ display: 'flex', gap: '20px', flexDirection: 'column' }}>
            {trailerKey ? (
              <div style={{ position: 'relative', paddingTop: '56.25%', marginBottom: '20px' }}>
                <iframe
                  src={`https://www.youtube.com/embed/${trailerKey}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '8px' }}
                  title="Movie Trailer"
                ></iframe>
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                marginBottom: '20px',
                width: '100%',
                height: '400px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#343A40',
                borderRadius: '8px',
                color: 'white',
                fontSize: '1.5em',
                fontWeight: 'bold'
              }}>
                Poster Not Available
              </div>
            )}

            <div style={{ 
              display: 'flex', 
              gap: '20px', 
              alignItems: 'flex-start',
              flexDirection: window.innerWidth <= 768 ? 'column' : 'row'
            }}>
              {movie.poster_path && (
                <img
                  src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                  alt={movie.title}
                  style={{ 
                    borderRadius: '8px', 
                    flexShrink: 0, 
                    width: window.innerWidth <= 768 ? '100%' : '150px', 
                    height: window.innerWidth <= 768 ? 'auto' : '225px', 
                    objectFit: 'cover',
                    maxWidth: window.innerWidth <= 768 ? '200px' : '150px',
                    margin: window.innerWidth <= 768 ? '0 auto' : '0'
                  }}
                />
              )}
              <div style={{ flexGrow: 1 }}>
                <h1 className='text-gradient' style={{ 
                  fontSize: window.innerWidth <= 768 ? '1.8em' : '2.5em', 
                  marginBottom: '10px', 
                  color: 'white', 
                  textAlign: 'left', 
                  margin: '0 0 10px 0', 
                  padding: '0' 
                }}>{movie.title}</h1>

                {movie.tagline && (
                  <p style={{ 
                    color: 'white', 
                    marginBottom: '15px', 
                    fontStyle: 'italic', 
                    textAlign: 'left', 
                    margin: '0 0 15px 0', 
                    padding: '0',
                    fontSize: window.innerWidth <= 768 ? '0.9em' : '1em'
                  }}>
                    {movie.tagline}
                  </p>
                )}

                <div style={{ 
                  marginBottom: '15px', 
                  textAlign: 'left', 
                  color: 'white',
                  fontSize: window.innerWidth <= 768 ? '0.9em' : '1em'
                }}>
                  <strong>Released:</strong> {movie.release_date || 'Not available'}
                </div>
                <div style={{ 
                  marginBottom: '15px', 
                  textAlign: 'left', 
                  color: 'white',
                  fontSize: window.innerWidth <= 768 ? '0.9em' : '1em'
                }}>
                  <strong>Duration:</strong> {movie.runtime ? `${movie.runtime} min` : 'Not available'}
                </div>
                <div style={{ 
                  marginBottom: '15px', 
                  textAlign: 'left', 
                  color: 'white',
                  fontSize: window.innerWidth <= 768 ? '0.9em' : '1em'
                }}>
                  <strong>Genre:</strong> {movie.genres?.length > 0 ? movie.genres.map(genre => genre.name).join(', ') : 'Not available'}
                </div>
                <div style={{ 
                  marginBottom: '15px', 
                  textAlign: 'left', 
                  color: 'white',
                  fontSize: window.innerWidth <= 768 ? '0.9em' : '1em'
                }}>
                  <strong>Country:</strong> {movie.production_countries?.length > 0 ? movie.production_countries.map(country => country.name).join(', ') : 'Not available'}
                </div>
                <div style={{ 
                  marginBottom: '15px', 
                  textAlign: 'left', 
                  color: 'white',
                  fontSize: window.innerWidth <= 768 ? '0.9em' : '1em'
                }}>
                  <strong>Production:</strong> {movie.production_companies?.length > 0 ? movie.production_companies.map(company => company.name).join(', ') : 'Not available'}
                </div>

                {movie.overview && (
                  <p style={{ 
                    lineHeight: '1.6', 
                    color: 'white', 
                    marginBottom: '20px', 
                    textAlign: 'left', 
                    margin: '0 0 20px 0', 
                    padding: '0',
                    fontSize: window.innerWidth <= 768 ? '0.9em' : '1em'
                  }}>
                    {movie.overview}
                  </p>
                )}

                {/* Render Watch Providers */}
                {renderProviders('flatrate', 'Stream On')}
                {renderProviders(['buy', 'rent'], 'Buy/Rent On')}

                <div style={{ 
                  marginTop: '20px', 
                  display: 'flex', 
                  gap: '10px', 
                  justifyContent: 'flex-start',
                  flexDirection: window.innerWidth <= 768 ? 'column' : 'row'
                }}>
                  {providers && providers.link ? (
                    <a 
                      href={providers.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        textDecoration: 'none',
                        display: 'inline-block',
                        textAlign: 'center',
                        width: window.innerWidth <= 768 ? '100%' : 'auto'
                      }}
                    >
                      Watch now
                    </a>
                  ) : (
                    <button 
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'not-allowed',
                        opacity: 0.6,
                        width: window.innerWidth <= 768 ? '100%' : 'auto'
                      }}
                      disabled
                    >
                      Watch now (No providers)
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default MovieDetail;