import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  pullProgress: number;
  isRefreshing: boolean;
}

export const PullToRefreshIndicator: React.FC<PullToRefreshIndicatorProps> = ({
  pullDistance,
  pullProgress,
  isRefreshing,
}) => {
  if (pullDistance <= 0 && !isRefreshing) return null;

  return (
    <div
      className="flex items-center justify-center overflow-hidden transition-all"
      style={{ height: pullDistance }}
    >
      <div className={cn(
        "flex items-center gap-2 text-muted-foreground text-sm",
        pullProgress >= 1 && "text-primary"
      )}>
        <Loader2
          className={cn(
            "h-5 w-5 transition-transform",
            isRefreshing && "animate-spin",
          )}
          style={{
            transform: isRefreshing ? undefined : `rotate(${pullProgress * 360}deg)`,
            opacity: Math.max(pullProgress, 0.3),
          }}
        />
        <span className="text-xs">
          {isRefreshing
            ? 'Actualisation...'
            : pullProgress >= 1
              ? 'Relâchez pour actualiser'
              : 'Tirez pour actualiser'}
        </span>
      </div>
    </div>
  );
};
