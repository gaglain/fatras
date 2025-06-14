
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
      background: 'var(--custom-cardBg, #ffffff)',
      color: 'var(--custom-cardText, #18181b)',
      border: '1px solid rgba(0,0,0,0.1)'
    }}>
      <CardHeader>
        <CardTitle style={{
          color: 'var(--custom-cardText, #18181b)'
        }}>
          Actions Rapides
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button 
            variant="outline" 
            className="h-20 flex flex-col items-center justify-center hover:scale-105 transition-all"
            style={{
              border: '1px solid rgba(0,0,0,0.1)',
              color: 'var(--custom-buttonBg, #1632f4)',
              background: 'transparent'
            }}
            onClick={() => handleQuickAction('nouveau-contact')}
          >
            <Users className="h-6 w-6 mb-2" style={{
              color: 'var(--custom-buttonBg, #1632f4)'
            }} />
            <span style={{
              color: 'var(--custom-buttonBg, #1632f4)'
            }}>
              Nouveau Contact
            </span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex flex-col items-center justify-center hover:scale-105 transition-all"
            style={{
              border: '1px solid rgba(0,0,0,0.1)',
              color: 'var(--custom-buttonBg, #1632f4)',
              background: 'transparent'
            }}
            onClick={() => handleQuickAction('planifier-evenement')}
          >
            <Calendar className="h-6 w-6 mb-2" style={{
              color: 'var(--custom-buttonBg, #1632f4)'
            }} />
            <span style={{
              color: 'var(--custom-buttonBg, #1632f4)'
            }}>
              Planifier Événement
            </span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex flex-col items-center justify-center hover:scale-105 transition-all"
            style={{
              border: '1px solid rgba(0,0,0,0.1)',
              color: 'var(--custom-buttonBg, #1632f4)',
              background: 'transparent'
            }}
            onClick={() => handleQuickAction('creer-tache')}
          >
            <CheckSquare className="h-6 w-6 mb-2" style={{
              color: 'var(--custom-buttonBg, #1632f4)'
            }} />
            <span style={{
              color: 'var(--custom-buttonBg, #1632f4)'
            }}>
              Créer Tâche
            </span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex flex-col items-center justify-center hover:scale-105 transition-all"
            style={{
              border: '1px solid rgba(0,0,0,0.1)',
              color: 'var(--custom-buttonBg, #1632f4)',
              background: 'transparent'
            }}
            onClick={() => handleQuickAction('envoyer-email')}
          >
            <Mail className="h-6 w-6 mb-2" style={{
              color: 'var(--custom-buttonBg, #1632f4)'
            }} />
            <span style={{
              color: 'var(--custom-buttonBg, #1632f4)'
            }}>
              Envoyer Email
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
