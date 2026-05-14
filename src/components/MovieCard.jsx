import React from 'react'
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IconStarFilled } from '@tabler/icons-react';

const MovieCard = ({ movie: { title, vote_average, poster_path, release_date, id } }) => {
  return (
    <Link to={`/movie/${id}`} className="block group">
      <Card className="overflow-hidden border-white/5 bg-card/50 backdrop-blur-sm transition-all duration-300 group-hover:scale-[1.03] group-hover:ring-2 group-hover:ring-primary/30 py-0 gap-0 transform-gpu [backface-visibility:hidden]">
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={poster_path ? `https://image.tmdb.org/t/p/w500${poster_path}` : '/No-Poster.png'}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 transform-gpu [backface-visibility:hidden]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Rating badge - top right */}
          <Badge className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-yellow-400 border-white/10 gap-1">
            <IconStarFilled className="size-3" />
            {vote_average ? vote_average.toFixed(1) : 'N/A'}
          </Badge>
        </div>

        <CardContent className="p-4">
          <h3 className="text-foreground font-medium text-sm line-clamp-1">{title}</h3>
          <p className="text-muted-foreground text-xs mt-1">
            {release_date ? release_date.split('-')[0] : 'N/A'}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}

export default React.memo(MovieCard);