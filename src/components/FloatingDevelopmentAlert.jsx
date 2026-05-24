import React from 'react';
import { HammerIcon, AlertCircleIcon } from 'lucide-react';

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';

const FloatingDevelopmentAlert = () => {
  return (
    <div className="fixed bottom-5 left-5 z-[100] w-[calc(100%-2.5rem)] max-w-sm sm:bottom-6 sm:left-6">
      <Alert className="border-white/10 bg-black/80 text-white shadow-2xl shadow-black/40 backdrop-blur-md">
        <AlertCircleIcon className="text-yello-500" />
        <AlertTitle><span className='text-yellow-500'>Notice:</span> Website currently under development</AlertTitle>
        <AlertDescription className="text-white/70">
          From Dev: gelo
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default FloatingDevelopmentAlert;
