import React from 'react';
import { Monitor, Tablet, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ViewportMode } from './types';

interface ResponsivePreviewProps {
  mode: ViewportMode;
  onModeChange: (mode: ViewportMode) => void;
}

export const ResponsivePreview: React.FC<ResponsivePreviewProps> = ({ mode, onModeChange }) => {
  return (
    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
      <Button
        variant={mode === 'desktop' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => onModeChange('desktop')}
        className={cn('h-8 px-3', mode === 'desktop' && 'bg-background shadow-sm')}
      >
        <Monitor className="h-4 w-4 mr-1.5" />
        <span className="hidden sm:inline">Desktop</span>
      </Button>
      <Button
        variant={mode === 'tablet' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => onModeChange('tablet')}
        className={cn('h-8 px-3', mode === 'tablet' && 'bg-background shadow-sm')}
      >
        <Tablet className="h-4 w-4 mr-1.5" />
        <span className="hidden sm:inline">Tablet</span>
      </Button>
      <Button
        variant={mode === 'mobile' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => onModeChange('mobile')}
        className={cn('h-8 px-3', mode === 'mobile' && 'bg-background shadow-sm')}
      >
        <Smartphone className="h-4 w-4 mr-1.5" />
        <span className="hidden sm:inline">Mobile</span>
      </Button>
    </div>
  );
};

export const getViewportWidth = (mode: ViewportMode): string => {
  switch (mode) {
    case 'mobile': return '375px';
    case 'tablet': return '768px';
    case 'desktop': return '100%';
  }
};
