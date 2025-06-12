
import React from 'react';
import { Button } from '@/components/ui/button';
import { List, Grid } from 'lucide-react';

interface ViewToggleProps {
  view: 'list' | 'compact';
  onViewChange: (view: 'list' | 'compact') => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ view, onViewChange }) => {
  return (
    <div className="flex items-center space-x-1 border border-border rounded-md p-1">
      <Button
        variant={view === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('list')}
        className="h-8 px-3"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant={view === 'compact' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('compact')}
        className="h-8 px-3"
      >
        <Grid className="h-4 w-4" />
      </Button>
    </div>
  );
};
