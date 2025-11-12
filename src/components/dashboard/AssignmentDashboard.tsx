import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAssignmentStats } from '@/hooks/useAssignmentStats';
import { CheckSquare, Users, Target, FileText, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export const AssignmentDashboard = () => {
  const { stats, loading } = useAssignmentStats();

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const typeIcons: Record<string, any> = {
    task: CheckSquare,
    contact: Users,
    opportunity: Target,
    quote: FileText
  };

  const typeColors: Record<string, string> = {
    task: 'bg-blue-500/10 text-blue-500',
    contact: 'bg-green-500/10 text-green-500',
    opportunity: 'bg-purple-500/10 text-purple-500',
    quote: 'bg-orange-500/10 text-orange-500'
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord des assignations</h1>
          <p className="text-muted-foreground">Suivez toutes les assignations de votre équipe</p>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignations</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssignments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tâches</CardTitle>
            <CheckSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.taskAssignments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contacts</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.contactAssignments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opportunités</CardTitle>
            <Target className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.opportunityAssignments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Devis</CardTitle>
            <FileText className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.quoteAssignments}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Assignateurs */}
        <Card>
          <CardHeader>
            <CardTitle>Top Assignateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.byAssigner.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune assignation pour le moment</p>
              ) : (
                stats.byAssigner.map((assigner, index) => (
                  <div key={assigner.email} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{assigner.name}</p>
                        <p className="text-xs text-muted-foreground">{assigner.email}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">{assigner.count} assignations</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Assignés */}
        <Card>
          <CardHeader>
            <CardTitle>Top Assignés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.byAssignee.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune assignation pour le moment</p>
              ) : (
                stats.byAssignee.map((assignee, index) => (
                  <div key={assignee.email} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{assignee.name}</p>
                        <p className="text-xs text-muted-foreground">{assignee.email}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">{assignee.count} assignations</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignations récentes */}
      <Card>
        <CardHeader>
          <CardTitle>Assignations récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentAssignments.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune assignation récente</p>
            ) : (
              stats.recentAssignments.map((assignment) => {
                const Icon = typeIcons[assignment.type] || UserPlus;
                return (
                  <div key={assignment.id} className="flex items-start gap-4 rounded-lg border p-4">
                    <div className={`rounded-lg p-2 ${typeColors[assignment.type] || 'bg-gray-500/10 text-gray-500'}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">{assignment.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Assigné par <span className="font-medium">{assignment.assigned_by}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(assignment.created_at), 'PPp', { locale: fr })}
                      </p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {assignment.type}
                    </Badge>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
