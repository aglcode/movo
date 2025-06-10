import React from 'react'
import { Link } from 'react-router-dom';

const MovieCard = ({ movie: { title, vote_average, poster_path, release_date, original_language, id } }) => {
  return (
    <Link to={`/movie/${id}`} className='movie-card-link'>
      <div className=' movie-card'>
         <img src={poster_path ? `https://image.tmdb.org/t/p/w500${poster_path}` 
         : '/No-Poster.png'}
         alt={title}
         />

         <div className=' mt-4'>
            <h3>{title}</h3>

            <div className='content'>
              <div className='rating'>
                 <img src="/Rating.svg" alt="Star Icon" />
                 <p>{vote_average ? vote_average.toFixed(1) : 'N/A'}</p>
              </div>

              {/* <span>•</span>
              <p className='lang'>{original_language}</p> */}

              <span>|</span>
              <p className='year'>{release_date ? release_date.split('-')[0] : 'N/A'}</p>
            </div>
         </div>
      </div>
    </Link>
  )
}

export default MovieCard