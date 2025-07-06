
import React from 'react';
import { GoogleCalendarIntegration } from '@/components/integrations/GoogleCalendarIntegration';

export const GoogleCalendarTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Intégration Google Calendar</h3>
        <p className="text-sm text-muted-foreground">
          Connectez votre compte Google Calendar pour synchroniser automatiquement vos événements
        </p>
      </div>
      
      <GoogleCalendarIntegration />
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Fonctionnalités disponibles</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Synchronisation bidirectionnelle des événements</li>
          <li>• Création automatique d'événements lors de nouveaux contrats</li>
          <li>• Rappels automatiques pour les événements importants</li>
          <li>• Gestion des invitations et participants</li>
        </ul>
      </div>
    </div>
  );
};
