
import React from 'react';
import { AppIconUploader } from '@/components/AppIconUploader';

export const AppIconTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Icône de l'Application</h3>
        <p className="text-sm text-muted-foreground">
          Personnalisez l'icône qui apparaît dans l'onglet du navigateur et lors de l'ajout à l'écran d'accueil
        </p>
      </div>
      
      <AppIconUploader />
      
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h4 className="font-medium text-yellow-900 mb-2">💡 Conseils</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Utilisez une image carrée (ex: 512x512 pixels)</li>
          <li>• Format recommandé: PNG avec fond transparent</li>
          <li>• L'icône sera automatiquement redimensionnée</li>
          <li>• Pour les applications mobiles, l'icône sera utilisée lors de la compilation APK/IPA</li>
        </ul>
      </div>
    </div>
  );
};
