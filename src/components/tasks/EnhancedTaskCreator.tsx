import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, User, Calendar, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useTasks } from '@/hooks/useTasks';
import { useAuthContext } from '@/contexts/AuthContext';
import { useEmailSender } from '@/hooks/useEmailSender';

interface EnhancedTaskCreatorProps {
  users: any[];
  artists: any[];
  contacts?: any[];
  events?: any[];
}

export const EnhancedTaskCreator: React.FC<EnhancedTaskCreatorProps> = ({
  users,
  artists,
  contacts = [],
  events = []
}) => {
  const { user } = useAuthContext();
  const { addTask } = useTasks();
  const { sendTaskAssignmentEmail } = useEmailSender();
  
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('none');
  const [artistId, setArtistId] = useState('none');
  const [contactId, setContactId] = useState('none');
  const [eventId, setEventId] = useState('none');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreateTask = async () => {
    if (!user || !title.trim()) {
      toast.error('Titre requis');
      return;
    }

    setCreating(true);
    try {
      const taskData = {
        user_id: user.id,
        assigned_to: assignedTo === 'none' ? undefined : assignedTo,
        contact_id: contactId === 'none' ? undefined : contactId,
        event_id: eventId === 'none' ? undefined : eventId,
        artist_id: artistId === 'none' ? undefined : artistId,
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        status: 'todo' as const,
        task_type: 'Autre' as 'Email' | 'Telephone' | 'RDV' | 'Autre',
        due_date: dueDate || undefined,
        tags: []
      };

      const newTask = await addTask(taskData);
      
      if (newTask && assignedTo && assignedTo !== user.id) {
        // Envoyer un email de notification si la tâche est assignée à quelqu'un d'autre
        const assignee = users.find(u => u.id === assignedTo);
        if (assignee?.email) {
          try {
            await sendTaskAssignmentEmail(
              assignee.email,
              `${assignee.first_name || ''} ${assignee.last_name || ''}`.trim(),
              title,
              `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim(),
              dueDate
            );
          } catch (emailError) {
            console.error('Erreur envoi email:', emailError);
            // Ne pas faire échouer la création de tâche pour un problème d'email
          }
        }
      }

      toast.success('Tâche créée avec succès');
      
      // Reset form
      setTitle('');
      setDescription('');
      setAssignedTo('none');
      setArtistId('none');
      setContactId('none');
      setEventId('none');
      setPriority('medium');
      setDueDate('');
      setIsOpen(false);
    } catch (error) {
      console.error('Erreur création tâche:', error);
      toast.error('Erreur lors de la création de la tâche');
    } finally {
      setCreating(false);
    }
  };

  const getUserName = (userId: string) => {
    const foundUser = users.find(u => u.id === userId);
    return foundUser ? `${foundUser.first_name || ''} ${foundUser.last_name || ''}`.trim() : 'Utilisateur inconnu';
  };

  const getArtistName = (artistId: string) => {
    const artist = artists.find(a => a.id === artistId);
    return artist ? `${artist.first_name} ${artist.last_name}` : 'Artiste inconnu';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Nouvelle Tâche</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Créer une nouvelle tâche</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations de base */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations de base</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Titre de la tâche *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Préparer le contrat pour le concert"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Détails de la tâche..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priorité</Label>
                  <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Faible</SelectItem>
                      <SelectItem value="medium">Moyenne</SelectItem>
                      <SelectItem value="high">Haute</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="dueDate">Date d'échéance</Label>
                  <Input
                    id="dueDate"
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assignation et liens */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assignation et liaisons</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="assignedTo">Assigner à</Label>
                <Select value={assignedTo} onValueChange={setAssignedTo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un utilisateur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucune assignation</SelectItem>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>{getUserName(user.id)}</span>
                          <span className="text-xs text-muted-foreground">({user.role})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="artistId">Lier à un artiste</Label>
                <Select value={artistId} onValueChange={setArtistId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un artiste" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun artiste</SelectItem>
                    {artists.map(artist => (
                      <SelectItem key={artist.id} value={artist.id}>
                        <div className="flex items-center space-x-2">
                          <UserCheck className="h-4 w-4" />
                          <span>{getArtistName(artist.id)}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {contacts.length > 0 && (
                <div>
                  <Label htmlFor="contactId">Lier à un contact</Label>
                  <Select value={contactId} onValueChange={setContactId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un contact" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucun contact</SelectItem>
                      {contacts.slice(0, 50).map(contact => (
                        <SelectItem key={contact.id} value={contact.id}>
                          {contact.first_name} {contact.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {events.length > 0 && (
                <div>
                  <Label htmlFor="eventId">Lier à un événement</Label>
                  <Select value={eventId} onValueChange={setEventId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un événement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucun événement</SelectItem>
                      {events.slice(0, 50).map(event => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleCreateTask}
              disabled={creating || !title.trim()}
            >
              {creating ? 'Création...' : 'Créer la tâche'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};