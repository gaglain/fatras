
import React from 'react';
import { GmailIntegration } from '@/components/integrations/GmailIntegration';
import { GmailSetup } from '@/components/integrations/GmailSetup';

export const GmailTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Intégration Gmail</h3>
        <p className="text-sm text-muted-foreground">
          Connectez votre compte Gmail pour envoyer des emails directement depuis l'application
        </p>
      </div>
      
      <GmailSetup />
      <GmailIntegration />
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Fonctionnalités disponibles</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Envoi d'emails depuis l'application</li>
          <li>• Synchronisation automatique des contacts</li>
          <li>• Signature personnalisée automatique</li>
          <li>• Suivi des ouvertures et clics</li>
          <li>• Templates d'emails personnalisés</li>
        </ul>
      </div>
    </div>
  );
};
