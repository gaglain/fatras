import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ContactEngagementBadge } from '@/components/contacts/ContactEngagementBadge';
import { useContactEngagement, ContactEngagementStats } from '@/hooks/useContactEngagement';
import {
  Mail, Eye, MousePointer, TrendingDown, CheckCircle, Search, Users, ArrowUpDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CampaignContactStatsProps {
  campaignId: string;
  campaignName: string;
}

export const CampaignContactStats: React.FC<CampaignContactStatsProps> = ({
  campaignId,
  campaignName,
}) => {
  const { fetchCampaignContactStats } = useContactEngagement();
  const [contactStats, setContactStats] = useState<ContactEngagementStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'opens'>('score');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const stats = await fetchCampaignContactStats(campaignId);
      setContactStats(stats);
      setLoading(false);
    };
    load();
  }, [campaignId]);

  const filtered = contactStats
    .filter(s =>
      s.contactName.toLowerCase().includes(search.toLowerCase()) ||
      s.contactEmail.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'score') return b.score - a.score;
      if (sortBy === 'name') return a.contactName.localeCompare(b.contactName);
      if (sortBy === 'opens') return b.totalOpened - a.totalOpened;
      return 0;
    });

  const summary = {
    total: contactStats.length,
    delivered: contactStats.filter(s => s.totalDelivered > 0).length,
    opened: contactStats.filter(s => s.totalOpened > 0).length,
    clicked: contactStats.filter(s => s.totalClicked > 0).length,
    bounced: contactStats.filter(s => s.totalBounced > 0).length,
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground mt-3">Chargement des statistiques par contact...</p>
        </CardContent>
      </Card>
    );
  }

  if (contactStats.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Aucune donnée de tracking disponible pour cette campagne.</p>
          <p className="text-xs text-muted-foreground mt-1">Les statistiques apparaîtront après l'envoi via Resend.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <Mail className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
            <p className="text-lg font-bold">{summary.total}</p>
            <p className="text-xs text-muted-foreground">Envoyés</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <CheckCircle className="h-5 w-5 mx-auto text-emerald-500 mb-1" />
            <p className="text-lg font-bold">{summary.delivered}</p>
            <p className="text-xs text-muted-foreground">Livrés</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Eye className="h-5 w-5 mx-auto text-blue-500 mb-1" />
            <p className="text-lg font-bold">{summary.opened}</p>
            <p className="text-xs text-muted-foreground">Ouverts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <MousePointer className="h-5 w-5 mx-auto text-violet-500 mb-1" />
            <p className="text-lg font-bold">{summary.clicked}</p>
            <p className="text-xs text-muted-foreground">Cliqués</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <TrendingDown className="h-5 w-5 mx-auto text-destructive mb-1" />
            <p className="text-lg font-bold">{summary.bounced}</p>
            <p className="text-xs text-muted-foreground">Bounced</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Sort */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un contact..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1">
          {(['score', 'name', 'opens'] as const).map(key => (
            <Button
              key={key}
              variant={sortBy === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy(key)}
            >
              <ArrowUpDown className="h-3 w-3 mr-1" />
              {key === 'score' ? 'Score' : key === 'name' ? 'Nom' : 'Ouvertures'}
            </Button>
          ))}
        </div>
      </div>

      {/* Contact list */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Détail par contact ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[500px]">
            <div className="divide-y divide-border">
              {filtered.map(stat => (
                <div
                  key={stat.contactId}
                  className="flex items-center justify-between p-3 hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/contacts/${stat.contactId}`)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{stat.contactName}</p>
                    <p className="text-xs text-muted-foreground truncate">{stat.contactEmail}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-emerald-500" />
                        {stat.totalDelivered}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3 text-blue-500" />
                        {stat.totalOpened}
                      </span>
                      <span className="flex items-center gap-1">
                        <MousePointer className="h-3 w-3 text-violet-500" />
                        {stat.totalClicked}
                      </span>
                      {stat.totalBounced > 0 && (
                        <span className="flex items-center gap-1 text-destructive">
                          <TrendingDown className="h-3 w-3" />
                          {stat.totalBounced}
                        </span>
                      )}
                    </div>
                    <ContactEngagementBadge
                      score={stat.score}
                      grade={stat.grade}
                      compact
                    />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
