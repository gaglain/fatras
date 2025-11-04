import React from 'react';
import { RoadshowEntityLinks } from './RoadshowEntityLinks';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface EntityLinksFormProps {
  roadshowStopId?: string;
}

export const EntityLinksForm: React.FC<EntityLinksFormProps> = ({ roadshowStopId }) => {
  if (!roadshowStopId) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Les entités liées seront disponibles après la création de l'étape de tournée.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2">Entités liées</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Associez des contacts, événements, devis et contrats à cette étape de tournée.
        </p>
      </div>
      <RoadshowEntityLinks roadshowStopId={roadshowStopId} />
    </div>
  );
};
