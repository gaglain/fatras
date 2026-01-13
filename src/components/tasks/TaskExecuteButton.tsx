import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Calendar, PlayCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useContacts } from '@/hooks/useContacts';
import { useNavigate } from 'react-router-dom';
import { logger } from '@/lib/logger';

interface Task {
  id: string;
  title: string;
  task_type: string;
  contact_id?: string;
}

interface TaskExecuteButtonProps {
  task: Task;
}

export const TaskExecuteButton: React.FC<TaskExecuteButtonProps> = ({ task }) => {
  const { contacts } = useContacts();
  const navigate = useNavigate();
  const [resolvedContact, setResolvedContact] = React.useState<typeof contacts[number] | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    const resolve = async () => {
      if (!task.contact_id) {
        setResolvedContact(null);
        return;
      }

      const found = contacts.find(c => c.id === task.contact_id);
      if (found) {
        setResolvedContact(found);
        return;
      }

      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', task.contact_id)
        .maybeSingle();

      if (!cancelled && data && !error) {
        setResolvedContact(data);
      }
    };

    resolve();

    return () => {
      cancelled = true;
    };
  }, [task.contact_id, contacts]);

  const getContactEmail = () => {
    if (!task.contact_id) return '';
    const contact = resolvedContact || contacts.find(c => c.id === task.contact_id);
    logger.debug('Found contact for task:', contact, 'task contact_id:', task.contact_id);
    return (contact?.email as string) || '';
  };

  const getContactPhone = () => {
    if (!task.contact_id) return '';
    const contact = resolvedContact || contacts.find(c => c.id === task.contact_id);
    return contact?.phone || '';
  };
  const handleExecute = () => {
    const contactEmail = getContactEmail();
    const contactPhone = getContactPhone();

    switch (task.task_type) {
      case 'Email':
        if (task.contact_id) {
          // Navigate to contact page to send email
          navigate(`/contacts/${task.contact_id}?compose=true&subject=${encodeURIComponent(`Re: ${task.title || 'Tâche'}`)}`);
        } else {
          toast.error('Aucun contact lié à cette tâche');
        }
        break;
      
      case 'Telephone':
        if (contactPhone) {
          window.open(`tel:${contactPhone}`);
        } else {
          toast.error('Aucun numéro de téléphone disponible pour cette tâche');
        }
        break;
      
      case 'RDV':
        // Open calendar app or create event
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour later
        
        const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(task.title || 'Rendez-vous')}&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
        
        window.open(googleCalendarUrl, '_blank');
        break;
      
      default:
        toast.info('Tâche marquée comme en cours');
        break;
    }
  };

  const getIcon = () => {
    switch (task.task_type) {
      case 'Email':
        return <Mail className="h-4 w-4" />;
      case 'Telephone':
        return <Phone className="h-4 w-4" />;
      case 'RDV':
        return <Calendar className="h-4 w-4" />;
      default:
        return <PlayCircle className="h-4 w-4" />;
    }
  };

  const getLabel = () => {
    switch (task.task_type) {
      case 'Email':
        return 'Envoyer Email';
      case 'Telephone':
        return 'Appeler';
      case 'RDV':
        return 'Planifier RDV';
      default:
        return 'Exécuter';
    }
  };

  return (
    <Button
      onClick={handleExecute}
      size="sm"
      variant="outline"
      className="flex items-center gap-2"
    >
      {getIcon()}
      {getLabel()}
    </Button>
  );
};