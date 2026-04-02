import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Edit } from 'lucide-react';
import { Contact } from '@/types/contact.types';
import { ContactListAssignment } from '@/components/contacts/ContactListAssignment';
import { ContactEngagementBadge } from '@/components/contacts/ContactEngagementBadge';

interface Props {
  contact: Contact;
  engagementStats: Array<{ score: number; grade: string }>;
  onEdit: () => void;
}

export const ContactDetailHeader: React.FC<Props> = ({ contact, engagementStats, onEdit }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/contacts')} className="w-fit">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div className="flex items-center space-x-3 min-w-0">
          <Avatar className="h-12 w-12 shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {contact.first_name?.[0]}{contact.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold truncate">
                {contact.first_name} {contact.last_name}
              </h1>
              {engagementStats.length > 0 && (
                <ContactEngagementBadge
                  score={engagementStats[0].score}
                  grade={engagementStats[0].grade}
                />
              )}
            </div>
            <p className="text-muted-foreground truncate">
              {contact.position} {contact.company && `• ${contact.company}`}
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="w-full sm:w-auto">
          <ContactListAssignment 
            contactId={contact.id!}
            contactName={`${contact.first_name} ${contact.last_name}`}
          />
        </div>
        <Button onClick={onEdit} className="w-full sm:w-auto">
          <Edit className="h-4 w-4 mr-2" />
          Modifier
        </Button>
      </div>
    </div>
  );
};
