
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Users, Mail, Phone, MapPin, Edit, Trash2, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { CreateEventFromContact } from './CreateEventFromContact';
import { ContactEventsList } from './ContactEventsList';
import { ContactTagManager } from './ContactTagManager';

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
  availableTags: string[];
  onNewTagAdded: (tag: string) => void;
  viewMode?: 'list' | 'compact';
}

export const ContactCard: React.FC<ContactCardProps> = ({ 
  contact, 
  onEdit, 
  onDelete, 
  availableTags, 
  onNewTagAdded,
  viewMode = 'list'
}) => {
  const [showEvents, setShowEvents] = useState(false);
  const [currentTags, setCurrentTags] = useState(contact.tags);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'client': return 'bg-green-100 text-green-800';
      case 'prospect': return 'bg-blue-100 text-blue-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleTagsUpdated = (newTags: string[]) => {
    setCurrentTags(newTags);
  };

  if (viewMode === 'compact') {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">
                  {contact.first_name.charAt(0)}{contact.last_name.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">
                  {contact.first_name} {contact.last_name}
                </h3>
                <p className="text-xs text-gray-600 truncate">{contact.position}</p>
              </div>
              <Badge className={`${getStatusColor(contact.status)} text-xs`}>
                {contact.status}
              </Badge>
            </div>
            
            <div className="space-y-1 text-xs">
              {contact.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="h-3 w-3 text-gray-400" />
                  <span className="truncate">{contact.email}</span>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-3 w-3 text-gray-400" />
                  <span>{contact.phone}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <ContactTagManager
                contactId={contact.id}
                currentTags={currentTags}
                onTagsUpdated={handleTagsUpdated}
                availableTags={availableTags}
                onNewTagAdded={onNewTagAdded}
              />
              <div className="flex items-center space-x-1">
                <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                  <Edit className="h-3 w-3" />
                </Button>
                <Button variant="outline" size="sm" className="h-7 w-7 p-0 text-red-600">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

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
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm mb-3">
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

            <ContactTagManager
              contactId={contact.id}
              currentTags={currentTags}
              onTagsUpdated={handleTagsUpdated}
              availableTags={availableTags}
              onNewTagAdded={onNewTagAdded}
            />
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
