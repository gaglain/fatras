
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Calendar, CheckSquare, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const QuickActionsCard: React.FC = () => {
  const navigate = useNavigate();

  const handleQuickAction = (action: string) => {
    console.log(`Action rapide: ${action}`);
    
    switch (action) {
      case 'nouveau-contact':
        navigate('/contacts');
        toast.success('Redirection vers les contacts');
        break;
      case 'planifier-evenement':
        navigate('/events');
        toast.success('Redirection vers les événements');
        break;
      case 'creer-tache':
        navigate('/tasks');
        toast.success('Redirection vers les tâches');
        break;
      case 'envoyer-email':
        navigate('/email');
        toast.success('Redirection vers l\'email');
        break;
      default:
        toast.info(`Action ${action} en cours de développement`);
    }
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
            className="h-20 flex flex-col items-center justify-center border-gray-200 hover:border-[#1632f4] hover:bg-[#1632f4]/5 hover:scale-105 transition-all text-[#1632f4] hover:text-[#1632f4]"
            onClick={() => handleQuickAction('nouveau-contact')}
          >
            <Users className="h-6 w-6 text-[#1632f4] mb-2" />
            <span className="text-[#1632f4]">Nouveau Contact</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex flex-col items-center justify-center border-gray-200 hover:border-[#1632f4] hover:bg-[#1632f4]/5 hover:scale-105 transition-all text-[#1632f4] hover:text-[#1632f4]"
            onClick={() => handleQuickAction('planifier-evenement')}
          >
            <Calendar className="h-6 w-6 text-[#1632f4] mb-2" />
            <span className="text-[#1632f4]">Planifier Événement</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex flex-col items-center justify-center border-gray-200 hover:border-[#1632f4] hover:bg-[#1632f4]/5 hover:scale-105 transition-all text-[#1632f4] hover:text-[#1632f4]"
            onClick={() => handleQuickAction('creer-tache')}
          >
            <CheckSquare className="h-6 w-6 text-[#1632f4] mb-2" />
            <span className="text-[#1632f4]">Créer Tâche</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex flex-col items-center justify-center border-gray-200 hover:border-[#1632f4] hover:bg-[#1632f4]/5 hover:scale-105 transition-all text-[#1632f4] hover:text-[#1632f4]"
            onClick={() => handleQuickAction('envoyer-email')}
          >
            <Mail className="h-6 w-6 text-[#1632f4] mb-2" />
            <span className="text-[#1632f4]">Envoyer Email</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
