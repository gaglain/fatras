import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { TabsContent } from '@/components/ui/tabs';
import {
  Calendar, Mail, Phone, Users, Target, CheckSquare,
  Building, Clock, Eye, Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'option': return 'bg-blue-100 text-blue-800';
    case 'confirmed': case 'open': return 'bg-green-100 text-green-800';
    case 'cancelled': case 'lost': return 'bg-red-100 text-red-800';
    case 'completed': case 'won': return 'bg-emerald-100 text-emerald-800';
    case 'applied': case 'in_progress': return 'bg-blue-100 text-blue-800';
    case 'todo': case 'done': return status === 'done' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getOpportunityStatusLabel = (status: string) => {
  switch (status) { case 'open': return 'Ouverte'; case 'applied': return 'Candidaturé'; case 'won': return 'Remportée'; case 'lost': return 'Perdue'; default: return status; }
};

const getTaskStatusLabel = (status: string) => {
  switch (status) { case 'todo': return 'À faire'; case 'in_progress': return 'En cours'; case 'done': return 'Terminé'; default: return status; }
};

interface LinkedContact { id: string; first_name: string; last_name: string; email: string | null; phone: string | null; company: string | null; role: string | null; }
interface LinkedOpportunity { id: string; title: string; status: string; venue: string | null; date: string | null; budget: number | null; }
interface LinkedTask { id: string; title: string; status: string; due_date: string | null; priority: string | null; }

interface Props {
  linkedContacts: LinkedContact[];
  linkedOpportunities: LinkedOpportunity[];
  linkedTasks: LinkedTask[];
  onOpenContactManager: () => void;
  onOpenOpportunityManager: () => void;
  onOpenTaskManager: () => void;
}

export const EventLinkedTabs: React.FC<Props> = ({
  linkedContacts, linkedOpportunities, linkedTasks,
  onOpenContactManager, onOpenOpportunityManager, onOpenTaskManager
}) => {
  const navigate = useNavigate();

  return (
    <>
      <TabsContent value="contacts" className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Contacts liés ({linkedContacts.length})</CardTitle>
            <Button onClick={onOpenContactManager} size="sm"><Plus className="h-4 w-4 mr-2" />Ajouter</Button>
          </CardHeader>
          <CardContent>
            {linkedContacts.length === 0 ? (
              <div className="text-center py-8"><Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">Aucun contact lié à cet événement</p></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {linkedContacts.map((contact) => (
                  <Card key={contact.id} className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50" onClick={() => navigate(`/contacts/${contact.id}`)}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10"><AvatarFallback className="bg-primary/10 text-primary">{contact.first_name?.[0]}{contact.last_name?.[0]}</AvatarFallback></Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate">{contact.first_name} {contact.last_name}</h4>
                            {contact.company && <p className="text-xs text-muted-foreground truncate">{contact.company}</p>}
                          </div>
                        </div>
                        {contact.email && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Mail className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{contact.email}</span></div>}
                        {contact.phone && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Phone className="h-3.5 w-3.5 shrink-0" /><span>{contact.phone}</span></div>}
                        {contact.role && <Badge variant="outline" className="text-xs">{contact.role}</Badge>}
                        <Separator />
                        <div className="flex items-center justify-between text-xs text-muted-foreground"><span className="flex items-center gap-1"><Eye className="h-3 w-3" />Voir le profil</span></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="opportunities" className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" />Opportunités liées ({linkedOpportunities.length})</CardTitle>
            <Button onClick={onOpenOpportunityManager} size="sm"><Plus className="h-4 w-4 mr-2" />Ajouter</Button>
          </CardHeader>
          <CardContent>
            {linkedOpportunities.length === 0 ? (
              <div className="text-center py-8"><Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">Aucune opportunité liée</p></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {linkedOpportunities.map((opp) => (
                  <Card key={opp.id} className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50" onClick={() => navigate('/opportunities')}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-sm line-clamp-2">{opp.title}</h4>
                          <Badge className={getStatusColor(opp.status)}>{getOpportunityStatusLabel(opp.status)}</Badge>
                        </div>
                        {opp.venue && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Building className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{opp.venue}</span></div>}
                        {opp.date && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Calendar className="h-3.5 w-3.5 shrink-0" /><span>{format(new Date(opp.date), 'dd/MM/yyyy', { locale: fr })}</span></div>}
                        {opp.budget && opp.budget > 0 && <div className="text-sm font-medium text-foreground">{opp.budget}€</div>}
                        <Separator />
                        <div className="flex items-center justify-between text-xs text-muted-foreground"><span className="flex items-center gap-1"><Eye className="h-3 w-3" />Voir détails</span></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="tasks" className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><CheckSquare className="h-5 w-5" />Tâches liées ({linkedTasks.length})</CardTitle>
            <Button onClick={onOpenTaskManager} size="sm"><Plus className="h-4 w-4 mr-2" />Ajouter</Button>
          </CardHeader>
          <CardContent>
            {linkedTasks.length === 0 ? (
              <div className="text-center py-8"><CheckSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">Aucune tâche liée</p></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {linkedTasks.map((task) => (
                  <Card key={task.id} className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50" onClick={() => navigate('/tasks')}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-sm line-clamp-2">{task.title}</h4>
                          <Badge className={getStatusColor(task.status)}>{getTaskStatusLabel(task.status)}</Badge>
                        </div>
                        {task.due_date && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Clock className="h-3.5 w-3.5 shrink-0" /><span>{format(new Date(task.due_date), 'dd/MM/yyyy', { locale: fr })}</span></div>}
                        {task.priority && <Badge variant="outline" className="text-xs">{task.priority}</Badge>}
                        <Separator />
                        <div className="flex items-center justify-between text-xs text-muted-foreground"><span className="flex items-center gap-1"><Eye className="h-3 w-3" />Voir détails</span></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );
};
