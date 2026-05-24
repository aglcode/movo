import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import MovieCard from '../MovieCard';
import Pagination from '../Pagination';

const AllMoviesSection = ({
  isLoading,
  errorMessage,
  movieList,
  currentPage,
  totalPages,
  onPageChange,
}) => (
  <section id="all-movies" className="py-20 bg-[#0F0F0F]">
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-heading font-bold text-foreground mb-12">All Movies</h2>
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[2/3] w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          ))}
        </div>
      ) : errorMessage ? (
        <p className="text-destructive">{errorMessage}</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {movieList.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
          <div className="mt-12">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>
        </>
      )}
    </div>
  </section>
);

export default AllMoviesSection;
