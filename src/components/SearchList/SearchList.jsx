import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import MovieCard from '../MovieCard';
import Pagination from '../Pagination';
import useSearchList from './hooks/useSearchList';
import { IconSearch, IconMovie } from '@tabler/icons-react';

const SearchList = ({ query }) => {
    const {
        results,
        isLoading,
        errorMessage,
        currentPage,
        totalPages,
        totalResults,
        setPage,
    } = useSearchList(query);

    // Don't render if query is too short
    if (!query || query.trim().length < 2) return null;

    return (
        <section className="search-list-section py-16 bg-[#0F0F0F]">
            <div className="container mx-auto px-4">

                {/* Section Header */}
                <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 border border-white/10">
                        <IconSearch size={18} className="text-primary" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
                        Search Results
                    </h2>
                </div>

                {/* Result count subtitle */}
                {!isLoading && results.length > 0 && (
                    <p className="text-sm text-muted-foreground mb-8 ml-12">
                        Found <span className="text-foreground font-medium">{totalResults.toLocaleString()}</span> results for "<span className="text-foreground font-medium">{query}</span>"
                    </p>
                )}
                {isLoading && (
                    <p className="text-sm text-muted-foreground mb-8 ml-12">
                        Searching for "<span className="text-foreground font-medium">{query}</span>"...
                    </p>
                )}

                {/* Content */}
                {isLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="space-y-3 animate-pulse">
                                <Skeleton className="aspect-[2/3] w-full rounded-xl bg-white/5" />
                                <Skeleton className="h-4 w-3/4 bg-white/5" />
                                <Skeleton className="h-3 w-1/4 bg-white/5" />
                            </div>
                        ))}
                    </div>
                ) : errorMessage ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                            <IconMovie size={24} className="text-destructive" />
                        </div>
                        <p className="text-destructive font-medium">{errorMessage}</p>
                    </div>
                ) : results.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                            {results.map((movie) => (
                                <MovieCard key={movie.id} movie={movie} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-12">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setPage}
                                />
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-4">
                            <IconSearch size={24} className="text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground font-medium">No results found for "{query}"</p>
                        <p className="text-sm text-muted-foreground/60 mt-1">Try a different search term</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default SearchList;
