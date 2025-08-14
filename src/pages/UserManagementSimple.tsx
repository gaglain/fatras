import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

export const UserManagementSimple: React.FC = () => {
  console.log('📊 UserManagementSimple - Rendering...');
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center">
            <Users className="h-6 w-6 sm:h-8 sm:w-8 mr-3 text-primary" />
            Gestion des Utilisateurs (Mode Simple)
          </h1>
          <p className="text-muted-foreground mt-2">
            Version simplifiée pour débogage
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>État de débogage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>✅ Page chargée sans erreur</p>
            <p>🔄 Pas d'appels API problématiques</p>
            <p>📝 Contextes non utilisés</p>
            <p className="text-sm text-muted-foreground mt-4">
              Si cette page fonctionne, le problème vient des hooks ou contextes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { UserManagementSimple as UserManagement };