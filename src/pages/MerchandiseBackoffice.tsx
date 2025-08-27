import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const MerchandiseBackoffice: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gestion Merchandise</h1>
        <p className="text-muted-foreground mt-2">
          Gérez votre catalogue de produits et vos commandes
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Catalogue produits</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            La gestion des produits est maintenant fonctionnelle avec la base de données.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};