import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown, Users, Tag, Trash2 } from 'lucide-react';

interface SimpleBulkActionsProps {
  selectedContactIds: string[];
  onAction: (action: string) => void;
}

export const SimpleBulkActions: React.FC<SimpleBulkActionsProps> = ({
  selectedContactIds,
  onAction
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          Actions
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onAction('assign-list')}>
          <Users className="h-4 w-4 mr-2" />
          Ajouter à une liste
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAction('add-tags')}>
          <Tag className="h-4 w-4 mr-2" />
          Ajouter des tags
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onAction('delete')}
          className="text-red-600"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};