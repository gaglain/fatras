import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Owner {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  email: string | null;
}

interface OpportunityOverviewTabProps {
  opportunity: {
    description: string | null;
    requirements: string | null;
    contact: string | null;
    created_at: string;
    updated_at: string;
  };
  owner: Owner | null;
}

export const OpportunityOverviewTab: React.FC<OpportunityOverviewTabProps> = ({ opportunity, owner }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />Détails
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {opportunity.description && (
            <div><p className="text-sm text-muted-foreground mb-1">Description</p><p className="text-sm">{opportunity.description}</p></div>
          )}
          {opportunity.requirements && (
            <div><p className="text-sm text-muted-foreground mb-1">Exigences</p><p className="text-sm whitespace-pre-wrap">{opportunity.requirements}</p></div>
          )}
          {opportunity.contact && (
            <div><p className="text-sm text-muted-foreground mb-1">Contact</p><p className="text-sm">{opportunity.contact}</p></div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />Propriétaire & Informations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {owner ? (
            <div className="flex items-center gap-3">
              <Avatar><AvatarFallback>{(owner.first_name?.[0] || owner.email?.[0] || 'U').toUpperCase()}</AvatarFallback></Avatar>
              <div>
                <p className="font-medium">{owner.first_name || owner.last_name ? `${owner.first_name || ''} ${owner.last_name || ''}`.trim() : owner.username || owner.email}</p>
                {owner.email && <p className="text-sm text-muted-foreground">{owner.email}</p>}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Aucun propriétaire assigné</p>
          )}
          <Separator />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-muted-foreground">Créé le</p><p>{format(new Date(opportunity.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}</p></div>
            <div><p className="text-muted-foreground">Modifié le</p><p>{format(new Date(opportunity.updated_at), 'dd/MM/yyyy HH:mm', { locale: fr })}</p></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
