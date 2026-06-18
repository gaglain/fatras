import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Edit, Trash2, Eye, Users, MousePointer, TrendingDown, Copy, Workflow } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  subject?: string;
  status: string;
  created_at: string;
  updated_at: string;
  content?: string;
  sent_count?: number;
  open_rate?: number | null;
  click_rate?: number | null;
  bounced_count?: number;
  sent_at?: string;
}

interface CampaignListCardProps {
  campaign: Campaign;
  onEdit: (campaign: Campaign) => void;
  onDelete: (id: string) => void;
  onDuplicate: (campaign: Campaign) => void;
  onViewContactStats: (campaign: Campaign) => void;
  onViewAnalytics: (campaign: Campaign) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'draft': return 'bg-gray-100 text-gray-800';
    case 'scheduled': return 'bg-blue-100 text-blue-800';
    case 'sending': return 'bg-yellow-100 text-yellow-800';
    case 'sent': return 'bg-green-100 text-green-800';
    case 'failed': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'draft': return 'Brouillon';
    case 'scheduled': return 'Programmée';
    case 'sending': return 'En cours d\'envoi';
    case 'sent': return 'Envoyée';
    case 'failed': return 'Échec';
    default: return status;
  }
};

export const CampaignListCard: React.FC<CampaignListCardProps> = ({
  campaign, onEdit, onDelete, onDuplicate, onViewContactStats, onViewAnalytics
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center flex-wrap gap-2 mb-1">
                <h3 className="text-base md:text-lg font-semibold truncate">{campaign.name}</h3>
                <Badge className={`${getStatusColor(campaign.status)} shrink-0 text-xs`}>
                  {getStatusLabel(campaign.status)}
                </Badge>
              </div>
              {campaign.subject && (
                <p className="text-muted-foreground text-sm truncate">
                  Sujet: {campaign.subject}
                </p>
              )}
            </div>
            <div className="flex gap-1 shrink-0">
              {campaign.status === 'sent' && (
                <>
                  <Button variant="outline" size="icon" className="h-8 w-8" title="Stats par contact"
                    onClick={() => onViewContactStats(campaign)}>
                    <Users className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" title="Analytics"
                    onClick={() => onViewAnalytics(campaign)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </>
              )}
              <Button variant="outline" size="icon" className="h-8 w-8" title="Dupliquer"
                onClick={() => onDuplicate(campaign)}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onEdit(campaign)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => onDelete(campaign.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {campaign.status === 'sent' && (
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                <Mail className="h-3 w-3" />
                {campaign.sent_count || 0} envoyés
              </Badge>
              {campaign.open_rate !== null && (
                <Badge variant="outline" className="flex items-center gap-1 text-xs">
                  <Eye className="h-3 w-3" />
                  {campaign.open_rate?.toFixed(1) || 0}%
                </Badge>
              )}
              {campaign.click_rate !== null && (
                <Badge variant="outline" className="flex items-center gap-1 text-xs">
                  <MousePointer className="h-3 w-3" />
                  {campaign.click_rate?.toFixed(1) || 0}%
                </Badge>
              )}
              {(campaign.bounced_count ?? 0) > 0 && (
                <Badge variant="destructive" className="flex items-center gap-1 text-xs">
                  <TrendingDown className="h-3 w-3" />
                  {campaign.bounced_count}
                </Badge>
              )}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Créée le {new Date(campaign.created_at).toLocaleDateString('fr-FR')}
            {campaign.sent_at && ` • Envoyée le ${new Date(campaign.sent_at).toLocaleDateString('fr-FR')}`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
