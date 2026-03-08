import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageLoaderProps {
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

/**
 * Unified loading component used across all pages.
 * Replaces inconsistent spinner implementations.
 */
export const PageLoader: React.FC<PageLoaderProps> = ({
  message = 'Chargement...',
  className,
  size = 'md',
  fullScreen = false,
}) => {
  const iconSize = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }[size];

  const textSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }[size];

  return (
    <div
      className={cn(
        'flex items-center justify-center',
        fullScreen ? 'min-h-screen' : 'min-h-[16rem]',
        className
      )}
    >
      <div className="text-center space-y-3">
        <Loader2 className={cn(iconSize, 'animate-spin text-primary mx-auto')} />
        {message && (
          <p className={cn(textSize, 'text-muted-foreground')}>{message}</p>
        )}
      </div>
    </div>
  );
};
