
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
    <Card className="hover:shadow-md transition-shadow" style={{
      background: `rgb(var(--custom-cardBg))`,
      color: `rgb(var(--custom-cardText))`,
      border: `1px solid rgba(var(--custom-buttonBg), 0.2)`
    }}>
      <CardHeader>
        <CardTitle style={{
          color: `rgb(var(--custom-cardText))`
        }}>
          Actions Rapides
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button 
            variant="outline" 
            className="h-20 flex flex-col items-center justify-center hover:scale-105 transition-all cursor-pointer"
            style={{
              border: `1px solid rgb(var(--custom-buttonBg))`,
              color: `rgb(var(--custom-buttonBg))`,
              background: 'transparent'
            }}
            onClick={() => handleQuickAction('nouveau-contact')}
          >
            <Users className="h-6 w-6 mb-2" style={{
              color: `rgb(var(--custom-buttonBg))`
            }} />
            <span style={{
              color: `rgb(var(--custom-buttonBg))`
            }}>
              Nouveau Contact
            </span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex flex-col items-center justify-center hover:scale-105 transition-all cursor-pointer"
            style={{
              border: `1px solid rgb(var(--custom-buttonBg))`,
              color: `rgb(var(--custom-buttonBg))`,
              background: 'transparent'
            }}
            onClick={() => handleQuickAction('planifier-evenement')}
          >
            <Calendar className="h-6 w-6 mb-2" style={{
              color: `rgb(var(--custom-buttonBg))`
            }} />
            <span style={{
              color: `rgb(var(--custom-buttonBg))`
            }}>
              Planifier Événement
            </span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex flex-col items-center justify-center hover:scale-105 transition-all cursor-pointer"
            style={{
              border: `1px solid rgb(var(--custom-buttonBg))`,
              color: `rgb(var(--custom-buttonBg))`,
              background: 'transparent'
            }}
            onClick={() => handleQuickAction('creer-tache')}
          >
            <CheckSquare className="h-6 w-6 mb-2" style={{
              color: `rgb(var(--custom-buttonBg))`
            }} />
            <span style={{
              color: `rgb(var(--custom-buttonBg))`
            }}>
              Créer Tâche
            </span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex flex-col items-center justify-center hover:scale-105 transition-all cursor-pointer"
            style={{
              border: `1px solid rgb(var(--custom-buttonBg))`,
              color: `rgb(var(--custom-buttonBg))`,
              background: 'transparent'
            }}
            onClick={() => handleQuickAction('envoyer-email')}
          >
            <Mail className="h-6 w-6 mb-2" style={{
              color: `rgb(var(--custom-buttonBg))`
            }} />
            <span style={{
              color: `rgb(var(--custom-buttonBg))`
            }}>
              Envoyer Email
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
