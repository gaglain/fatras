
import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, X } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface BulkContactActionsProps {
  selectedContacts: string[];
  totalContacts: number;
  onSelectAll: (selected: boolean) => void;
  onClearSelection: () => void;
  onBulkDelete: () => void;
  isDeleting?: boolean;
}

export const BulkContactActions: React.FC<BulkContactActionsProps> = ({
  selectedContacts,
  totalContacts,
  onSelectAll,
  onClearSelection,
  onBulkDelete,
  isDeleting = false
}) => {
  const isAllSelected = selectedContacts.length === totalContacts && totalContacts > 0;
  const isPartiallySelected = selectedContacts.length > 0 && selectedContacts.length < totalContacts;

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 border rounded-lg">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={isAllSelected}
            ref={(el) => {
              if (el) {
                el.indeterminate = isPartiallySelected;
              }
            }}
            onCheckedChange={(checked) => onSelectAll(!!checked)}
          />
          <span className="text-sm font-medium">
            {selectedContacts.length === 0 ? (
              "Sélectionner tout"
            ) : (
              `${selectedContacts.length} contact${selectedContacts.length > 1 ? 's' : ''} sélectionné${selectedContacts.length > 1 ? 's' : ''}`
            )}
          </span>
        </div>
        
        {selectedContacts.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4 mr-1" />
            Désélectionner
          </Button>
        )}
      </div>

      {selectedContacts.length > 0 && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="sm"
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? 'Suppression...' : `Supprimer (${selectedContacts.length})`}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer les contacts sélectionnés</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer {selectedContacts.length} contact{selectedContacts.length > 1 ? 's' : ''} ?
                Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={onBulkDelete} className="bg-red-600 hover:bg-red-700">
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};
