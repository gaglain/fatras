import React from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Calendar, PlayCircle } from 'lucide-react';
import { toast } from 'sonner';

interface TaskExecuteButtonProps {
  taskType: string;
  contactEmail?: string;
  contactPhone?: string;
  taskTitle?: string;
}

export const TaskExecuteButton: React.FC<TaskExecuteButtonProps> = ({
  taskType,
  contactEmail,
  contactPhone,
  taskTitle
}) => {
  const handleExecute = () => {
    switch (taskType) {
      case 'Email':
        if (contactEmail) {
          const subject = encodeURIComponent(`Re: ${taskTitle || 'Tâche'}`);
          const body = encodeURIComponent(`Bonjour,\n\nSuite à notre tâche "${taskTitle}", je vous contacte...\n\nCordialement`);
          window.open(`mailto:${contactEmail}?subject=${subject}&body=${body}`);
        } else {
          toast.error('Aucun email de contact disponible');
        }
        break;
      
      case 'Telephone':
        if (contactPhone) {
          window.open(`tel:${contactPhone}`);
        } else {
          toast.error('Aucun numéro de téléphone disponible');
        }
        break;
      
      case 'RDV':
        // Open calendar app or create event
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour later
        
        const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(taskTitle || 'Rendez-vous')}&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
        
        window.open(googleCalendarUrl, '_blank');
        break;
      
      default:
        toast.info('Tâche marquée comme en cours');
        break;
    }
  };

  const getIcon = () => {
    switch (taskType) {
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
    switch (taskType) {
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