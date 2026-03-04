import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { ContactEngagementBadge } from '@/components/contacts/ContactEngagementBadge';
import { useContactEngagement, ContactEngagementStats } from '@/hooks/useContactEngagement';
import {
  Users, TrendingUp, TrendingDown, Mail, Eye, MousePointer,
  Search, ArrowUpDown, BarChart3, CheckCircle, AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const EmailEngagementDashboard: React.FC = () => {
  const { stats, loading, fetchAllContactStats } = useContactEngagement();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'opens' | 'bounces'>('score');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllContactStats();
  }, [fetchAllContactStats]);

  const filtered = stats
    .filter(s => {
      const matchSearch = s.contactName.toLowerCase().includes(search.toLowerCase()) ||
        s.contactEmail.toLowerCase().includes(search.toLowerCase());
      const matchGrade = gradeFilter === 'all' || s.grade === gradeFilter;
      return matchSearch && matchGrade;
    })
    .sort((a, b) => {
      if (sortBy === 'score') return b.score - a.score;
      if (sortBy === 'name') return a.contactName.localeCompare(b.contactName);
      if (sortBy === 'opens') return b.totalOpened - a.totalOpened;
      if (sortBy === 'bounces') return b.totalBounced - a.totalBounced;
      return 0;
    });

  const gradeDistribution = {
    A: stats.filter(s => s.grade === 'A').length,
    B: stats.filter(s => s.grade === 'B').length,
    C: stats.filter(s => s.grade === 'C').length,
    D: stats.filter(s => s.grade === 'D').length,
  };

  const avgScore = stats.length > 0
    ? Math.round(stats.reduce((sum, s) => sum + s.score, 0) / stats.length)
    : 0;

  const avgOpenRate = stats.length > 0
    ? (stats.reduce((sum, s) => sum + s.openRate, 0) / stats.length).toFixed(1)
    : '0';

  const avgClickRate = stats.length > 0
    ? (stats.reduce((sum, s) => sum + s.clickRate, 0) / stats.length).toFixed(1)
    : '0';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.length}</p>
                <p className="text-xs text-muted-foreground">Contacts trackés</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-emerald-500/10">
                <BarChart3 className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgScore}</p>
                <p className="text-xs text-muted-foreground">Score moyen /100</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-500/10">
                <Eye className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgOpenRate}%</p>
                <p className="text-xs text-muted-foreground">Taux d'ouverture moy.</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-violet-500/10">
                <MousePointer className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgClickRate}%</p>
                <p className="text-xs text-muted-foreground">Taux de clic moy.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grade distribution */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Répartition des grades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            {(['A', 'B', 'C', 'D'] as const).map(grade => {
              const count = gradeDistribution[grade];
              const pct = stats.length > 0 ? (count / stats.length) * 100 : 0;
              const isActive = gradeFilter === grade;
              return (
                <button
                  key={grade}
                  onClick={() => setGradeFilter(isActive ? 'all' : grade)}
                  className={`p-3 rounded-lg border text-center transition-colors ${
                    isActive ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent/50'
                  }`}
                >
                  <ContactEngagementBadge score={0} grade={grade} compact showScore={false} />
                  <p className="text-xl font-bold mt-2">{count}</p>
                  <Progress value={pct} className="h-1 mt-1" />
                  <p className="text-xs text-muted-foreground mt-1">{pct.toFixed(0)}%</p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

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
        <div className="flex gap-1 flex-wrap">
          {([
            { key: 'score' as const, label: 'Score' },
            { key: 'name' as const, label: 'Nom' },
            { key: 'opens' as const, label: 'Ouvertures' },
            { key: 'bounces' as const, label: 'Bounces' },
          ]).map(({ key, label }) => (
            <Button
              key={key}
              variant={sortBy === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy(key)}
            >
              <ArrowUpDown className="h-3 w-3 mr-1" />
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Contact ranking */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Classement des contacts ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-8 text-center">
              <AlertTriangle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Aucun contact avec des données de tracking.</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[600px]">
              <div className="divide-y divide-border">
                {filtered.map((stat, idx) => (
                  <div
                    key={stat.contactId}
                    className="flex items-center gap-3 p-3 hover:bg-accent/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/contacts/${stat.contactId}`)}
                  >
                    <span className="text-xs font-mono text-muted-foreground w-6 text-right">
                      #{idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{stat.contactName}</p>
                      <p className="text-xs text-muted-foreground truncate">{stat.contactEmail}</p>
                    </div>
                    <div className="hidden md:flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {stat.totalSent}
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-emerald-500" /> {stat.deliveryRate.toFixed(0)}%
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3 text-blue-500" /> {stat.openRate.toFixed(0)}%
                      </span>
                      <span className="flex items-center gap-1">
                        <MousePointer className="h-3 w-3 text-violet-500" /> {stat.clickRate.toFixed(0)}%
                      </span>
                      {stat.totalBounced > 0 && (
                        <span className="flex items-center gap-1 text-destructive">
                          <TrendingDown className="h-3 w-3" /> {stat.totalBounced}
                        </span>
                      )}
                    </div>
                    <ContactEngagementBadge score={stat.score} grade={stat.grade} compact />
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
