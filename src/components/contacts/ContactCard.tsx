
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Mail, Phone, MapPin, MoreVertical, Edit, Trash2, User, Eye } from 'lucide-react';
import { Contact } from '@/types/contact.types';

interface ContactCardProps {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  viewMode?: 'grid' | 'list';
}

export const ContactCard: React.FC<ContactCardProps> = ({ 
  contact, 
  onEdit, 
  onDelete,
  isSelected = false,
  onSelect,
  viewMode = 'grid'
}) => {
  const navigate = useNavigate();
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'client': return 'bg-green-100 text-green-800';
      case 'prospect': return 'bg-blue-100 text-blue-800';
      case 'partenaire': return 'bg-purple-100 text-purple-800';
      case 'inactif': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'artiste': return '🎤';
      case 'manager': return '👔';
      case 'venue': return '🏢';
      case 'organisateur': return '📅';
      case 'media': return '📺';
      default: return '👤';
    }
  };

  if (viewMode === 'list') {
    return (
    <Card className={`hover:shadow-md transition-shadow cursor-pointer ${isSelected ? 'ring-2 ring-blue-500' : ''}`} onClick={() => navigate(`/contacts/${contact.id}`)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
               {onSelect && (
                 <input
                   type="checkbox"
                   checked={isSelected}
                   onChange={(e) => onSelect(e.target.checked)}
                   onClick={(e) => e.stopPropagation()}
                   className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                 />
               )}
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-sm">{getRoleIcon(contact.role)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base truncate">
                  {contact.first_name} {contact.last_name}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  {contact.position && <span>{contact.position}</span>}
                  {contact.company && <span>{contact.company}</span>}
                  {contact.city && <span>{contact.city}</span>}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {contact.email && (
                  <Mail className="h-4 w-4 text-muted-foreground" />
                )}
                {contact.phone && (
                  <Phone className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <Badge className={getStatusColor(contact.status)}>
                {contact.status}
              </Badge>
            </div>
             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                   <MoreVertical className="h-4 w-4" />
                 </Button>
               </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(`/contacts/${contact.id}`)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Voir le détail
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(contact)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => contact.id && onDelete(contact.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`hover:shadow-md transition-shadow cursor-pointer ${isSelected ? 'ring-2 ring-blue-500' : ''}`} onClick={() => navigate(`/contacts/${contact.id}`)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
             {onSelect && (
               <input
                 type="checkbox"
                 checked={isSelected}
                 onChange={(e) => onSelect(e.target.checked)}
                 onClick={(e) => e.stopPropagation()}
                 className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
               />
             )}
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-lg">{getRoleIcon(contact.role)}</span>
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {contact.first_name} {contact.last_name}
              </h3>
              {contact.position && (
                <p className="text-sm text-muted-foreground">{contact.position}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(contact.status)}>
              {contact.status}
            </Badge>
             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                   <MoreVertical className="h-4 w-4" />
                 </Button>
               </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(`/contacts/${contact.id}`)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Voir le détail
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(contact)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => contact.id && onDelete(contact.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {contact.email && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Mail className="h-4 w-4 mr-2" />
              <a href={`mailto:${contact.email}`} className="hover:text-primary">
                {contact.email}
              </a>
            </div>
          )}
          {contact.phone && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Phone className="h-4 w-4 mr-2" />
              <a href={`tel:${contact.phone}`} className="hover:text-primary">
                {contact.phone}
              </a>
            </div>
          )}
          {contact.company && (
            <div className="flex items-center text-sm text-muted-foreground">
              <User className="h-4 w-4 mr-2" />
              {contact.company}
            </div>
          )}
          {contact.city && (
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2" />
              {contact.city}
            </div>
          )}
        </div>
        
        {contact.tags && contact.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {contact.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {contact.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{contact.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
