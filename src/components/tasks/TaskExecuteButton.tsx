import React from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Calendar, PlayCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useContacts } from '@/hooks/useContacts';
import { useNavigate } from 'react-router-dom';

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

  const getContactEmail = () => {
    if (!task.contact_id) return '';
    const contact = contacts.find(c => c.id === task.contact_id);
    console.log('Found contact for task:', contact, 'task contact_id:', task.contact_id);
    return contact?.email || '';
  };

  const getContactPhone = () => {
    if (!task.contact_id) return '';
    const contact = contacts.find(c => c.id === task.contact_id);
    return contact?.phone || '';
  };
  const handleExecute = () => {
    const contactEmail = getContactEmail();
    const contactPhone = getContactPhone();

    switch (task.task_type) {
      case 'Email':
        if (contactEmail && task.contact_id) {
          // Navigate to email page with contact info pre-filled
          navigate(`/email?compose=true&contactId=${task.contact_id}&subject=${encodeURIComponent(`Re: ${task.title || 'Tâche'}`)}`);
        } else {
          toast.error('Aucun email de contact disponible pour cette tâche');
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