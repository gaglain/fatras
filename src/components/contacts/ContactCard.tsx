
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Users, Mail, Phone, MapPin, Edit, Trash2, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { CreateEventFromContact } from './CreateEventFromContact';
import { ContactEventsList } from './ContactEventsList';

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  position?: string;
  address?: string;
  city?: string;
  status: 'prospect' | 'client' | 'inactive';
  source?: string;
  notes?: string;
  tags: string[];
  accepts_marketing_emails: boolean;
  created_at: string;
}

interface ContactCardProps {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (contactId: string) => void;
}

export const ContactCard: React.FC<ContactCardProps> = ({ contact, onEdit, onDelete }) => {
  const [showEvents, setShowEvents] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'client': return 'bg-green-100 text-green-800';
      case 'prospect': return 'bg-blue-100 text-blue-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-lg">
                  {contact.first_name.charAt(0)}{contact.last_name.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {contact.first_name} {contact.last_name}
                </h3>
                <p className="text-gray-600">{contact.position}</p>
              </div>
              <Badge className={getStatusColor(contact.status)}>
                {contact.status}
              </Badge>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              {contact.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{contact.email}</span>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{contact.phone}</span>
                </div>
              )}
              {contact.city && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{contact.city}</span>
                </div>
              )}
            </div>

            {contact.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {contact.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <CreateEventFromContact 
              contactId={contact.id}
              contactName={`${contact.first_name} ${contact.last_name}`}
            />
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onEdit(contact)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onDelete(contact.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Collapsible open={showEvents} onOpenChange={setShowEvents}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="mt-3 w-full justify-between">
              <span>Événements liés</span>
              {showEvents ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <ContactEventsList contactId={contact.id} />
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};
