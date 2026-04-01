import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { MapPin, Calendar, DollarSign, Edit, Trash2, User, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OpportunityCardProps {
  opportunity: any;
  viewMode: 'compact' | 'list';
  onEdit: (opp: any) => void;
  onDelete: (id: string) => void;
  getStatusColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
  getUserDisplayName: (id: string) => string;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity, viewMode, onEdit, onDelete, getStatusColor, getStatusLabel, getUserDisplayName,
}) => {
  const navigate = useNavigate();

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold">{opportunity.title}</h3>
              <Badge className={getStatusColor(opportunity.status)}>{getStatusLabel(opportunity.status)}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{opportunity.description}</p>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center"><MapPin className="h-4 w-4 mr-1" />{opportunity.venue} - {opportunity.location}</div>
              <div className="flex items-center"><Calendar className="h-4 w-4 mr-1" />{new Date(opportunity.date).toLocaleDateString('fr-FR')}</div>
              <div className="flex items-center"><DollarSign className="h-4 w-4 mr-1" />{opportunity.budget}€</div>
              {getUserDisplayName(opportunity.owner_id) && <div className="flex items-center"><User className="h-4 w-4 mr-1" />{getUserDisplayName(opportunity.owner_id)}</div>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onEdit(opportunity)}><Edit className="h-4 w-4 mr-1" />Modifier</Button>
            <DeleteDialog id={opportunity.id} onDelete={onDelete} />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="space-y-3">
          <div>
            <CardTitle className="text-lg mb-2 line-clamp-2">{opportunity.title}</CardTitle>
            <Badge className={getStatusColor(opportunity.status)}>{getStatusLabel(opportunity.status)}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-600 line-clamp-2">{opportunity.description}</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-gray-600"><MapPin className="h-4 w-4 mr-2 flex-shrink-0" /><span className="truncate">{opportunity.venue} - {opportunity.location}</span></div>
          <div className="flex items-center text-gray-600"><Calendar className="h-4 w-4 mr-2 flex-shrink-0" />{opportunity.date ? new Date(opportunity.date).toLocaleDateString('fr-FR') : 'Non définie'}</div>
          <div className="flex items-center text-gray-600"><DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />{opportunity.budget}€</div>
          {getUserDisplayName(opportunity.owner_id) && <div className="flex items-center text-gray-600"><User className="h-4 w-4 mr-2 flex-shrink-0" /><span className="truncate">{getUserDisplayName(opportunity.owner_id)}</span></div>}
        </div>
        <div className="flex flex-wrap gap-1.5 pt-2 border-t">
          <Button size="sm" variant="outline" onClick={() => navigate(`/opportunities/${opportunity.id}`)} className="flex-1 min-w-[70px] text-xs px-2"><Eye className="h-3.5 w-3.5 mr-1" />Aperçu</Button>
          <Button size="sm" variant="outline" onClick={() => onEdit(opportunity)} className="flex-1 min-w-[70px] text-xs px-2"><Edit className="h-3.5 w-3.5 mr-1" />Modifier</Button>
          <DeleteDialog id={opportunity.id} onDelete={onDelete} compact />
        </div>
      </CardContent>
    </Card>
  );
};

const DeleteDialog: React.FC<{ id: string; onDelete: (id: string) => void; compact?: boolean }> = ({ id, onDelete, compact }) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button size="sm" variant="outline" className={compact ? "flex-1 min-w-[70px] text-xs px-2 text-destructive border-destructive/30 hover:bg-destructive/10" : ""}>
        <Trash2 className={compact ? "h-3.5 w-3.5 mr-1" : "h-4 w-4 text-red-500 mr-1"} />
        {compact ? 'Supprimer' : <span className="text-red-500">Supprimer</span>}
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Supprimer l'opportunité</AlertDialogTitle>
        <AlertDialogDescription>Êtes-vous sûr de vouloir supprimer cette opportunité ? Cette action ne peut pas être annulée.</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Annuler</AlertDialogCancel>
        <AlertDialogAction onClick={() => onDelete(id)} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
