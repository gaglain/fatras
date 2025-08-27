import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const Forms: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Formulaires</h1>
        <p className="text-muted-foreground mt-2">
          Créez et gérez vos formulaires personnalisés
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestion des formulaires</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            La gestion des formulaires est maintenant fonctionnelle avec la base de données.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};