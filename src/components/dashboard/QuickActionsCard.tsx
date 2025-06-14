
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Calendar, CheckSquare, Mail } from 'lucide-react';

export const QuickActionsCard: React.FC = () => {
  const handleQuickAction = (action: string) => {
    console.log(`Action rapide: ${action}`);
    // Logique à implémenter selon l'action
  };

  return (
    <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-gray-900">Actions Rapides</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button 
            variant="outline" 
            className="h-20 flex flex-col items-center justify-center border-gray-200 hover:border-brand-primary hover:bg-brand-primary/5 hover:scale-105 transition-all"
            onClick={() => handleQuickAction('nouveau-contact')}
          >
            <Users className="h-6 w-6 text-brand-primary mb-2" />
            <span className="text-gray-900">Nouveau Contact</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex flex-col items-center justify-center border-gray-200 hover:border-brand-primary hover:bg-brand-primary/5 hover:scale-105 transition-all"
            onClick={() => handleQuickAction('planifier-evenement')}
          >
            <Calendar className="h-6 w-6 text-brand-primary mb-2" />
            <span className="text-gray-900">Planifier Événement</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex flex-col items-center justify-center border-gray-200 hover:border-brand-primary hover:bg-brand-primary/5 hover:scale-105 transition-all"
            onClick={() => handleQuickAction('creer-tache')}
          >
            <CheckSquare className="h-6 w-6 text-brand-primary mb-2" />
            <span className="text-gray-900">Créer Tâche</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex flex-col items-center justify-center border-gray-200 hover:border-brand-primary hover:bg-brand-primary/5 hover:scale-105 transition-all"
            onClick={() => handleQuickAction('envoyer-email')}
          >
            <Mail className="h-6 w-6 text-brand-primary mb-2" />
            <span className="text-gray-900">Envoyer Email</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
