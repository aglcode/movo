import React from 'react';
import { Button } from '@/components/ui/button';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

const CarouselArrow = ({ direction, onClick }) => (
  <Button
    variant="ghost"
    size="icon"
    onClick={onClick}
    className={`absolute ${direction === 'left' ? 'left-0' : 'right-0'} top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm`}
    aria-label={`Scroll ${direction}`}
  >
    {direction === 'left' ? <IconChevronLeft className="size-5" /> : <IconChevronRight className="size-5" />}
  </Button>
);

export default CarouselArrow;
