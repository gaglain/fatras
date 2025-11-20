import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface AssignmentStats {
  totalAssignments: number;
  taskAssignments: number;
  contactAssignments: number;
  opportunityAssignments: number;
  quoteAssignments: number;
  byAssigner: { name: string; count: number; email: string }[];
  byAssignee: { name: string; count: number; email: string }[];
  recentAssignments: {
    id: string;
    type: string;
    title: string;
    assigned_by: string;
    assigned_to: string;
    created_at: string;
  }[];
}

export const useAssignmentStats = () => {
  const [stats, setStats] = useState<AssignmentStats>({
    totalAssignments: 0,
    taskAssignments: 0,
    contactAssignments: 0,
    opportunityAssignments: 0,
    quoteAssignments: 0,
    byAssigner: [],
    byAssignee: [],
    recentAssignments: []
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      setLoading(true);
      
      try {
        // Récupérer les tâches assignées
        const { data: tasks, error: tasksError } = await supabase
          .from('tasks')
          .select('*, assigned_user:profiles!tasks_assigned_to_fkey(email, first_name, last_name), creator:profiles!tasks_user_id_fkey(email, first_name, last_name)')
          .not('assigned_to', 'is', null)
          .order('created_at', { ascending: false });

        if (tasksError) throw tasksError;

        // Récupérer les contacts avec assigned_to
        const { data: contacts, error: contactsError } = await supabase
          .from('contacts')
          .select('*, assigned_user:profiles(email, first_name, last_name)')
          .not('user_id', 'is', null)
          .order('created_at', { ascending: false });

        if (contactsError) throw contactsError;

        // Récupérer les opportunités
        const { data: opportunities, error: oppsError } = await supabase
          .from('opportunities')
          .select('*, assigned_user:profiles!opportunities_assigned_to_fkey(email, first_name, last_name), creator:profiles!opportunities_user_id_fkey(email, first_name, last_name)')
          .not('assigned_to', 'is', null)
          .order('created_at', { ascending: false });

        if (oppsError) throw oppsError;

        // Récupérer les devis
        const { data: quotes, error: quotesError } = await supabase
          .from('quotes')
          .select('*, assigned_user:profiles!quotes_assigned_to_fkey(email, first_name, last_name), creator:profiles!quotes_user_id_fkey(email, first_name, last_name)')
          .not('assigned_to', 'is', null)
          .order('created_at', { ascending: false });

        if (quotesError) throw quotesError;

        // Mapper les assignations
        const allAssignments = [
          ...(tasks || []).map((t: any) => ({
            id: t.id,
            type: 'task' as const,
            title: t.title,
            assigned_by: t.creator?.email || 'Système',
            assigned_by_name: t.creator ? `${t.creator.first_name || ''} ${t.creator.last_name || ''}`.trim() : 'Système',
            assigned_to: t.assigned_user?.email || 'Inconnu',
            assigned_to_name: t.assigned_user ? `${t.assigned_user.first_name || ''} ${t.assigned_user.last_name || ''}`.trim() : 'Inconnu',
            created_at: t.created_at
          })),
          ...(contacts || []).map((c: any) => ({
            id: c.id,
            type: 'contact' as const,
            title: `${c.first_name} ${c.last_name}`,
            assigned_by: 'Système',
            assigned_by_name: 'Système',
            assigned_to: c.assigned_user?.email || 'Inconnu',
            assigned_to_name: c.assigned_user ? `${c.assigned_user.first_name || ''} ${c.assigned_user.last_name || ''}`.trim() : 'Inconnu',
            created_at: c.created_at
          })),
          ...(opportunities || []).map((o: any) => ({
            id: o.id,
            type: 'opportunity' as const,
            title: o.title,
            assigned_by: o.creator?.email || 'Système',
            assigned_by_name: o.creator ? `${o.creator.first_name || ''} ${o.creator.last_name || ''}`.trim() : 'Système',
            assigned_to: o.assigned_user?.email || 'Inconnu',
            assigned_to_name: o.assigned_user ? `${o.assigned_user.first_name || ''} ${o.assigned_user.last_name || ''}`.trim() : 'Inconnu',
            created_at: o.created_at
          })),
          ...(quotes || []).map((q: any) => ({
            id: q.id,
            type: 'quote' as const,
            title: q.quote_number || `Devis ${q.id.slice(0, 8)}`,
            assigned_by: q.creator?.email || 'Système',
            assigned_by_name: q.creator ? `${q.creator.first_name || ''} ${q.creator.last_name || ''}`.trim() : 'Système',
            assigned_to: q.assigned_user?.email || 'Inconnu',
            assigned_to_name: q.assigned_user ? `${q.assigned_user.first_name || ''} ${q.assigned_user.last_name || ''}`.trim() : 'Inconnu',
            created_at: q.created_at
          }))
        ];

        // Trier par date
        allAssignments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        // Grouper par assignateur
        const assignerMap = new Map<string, { name: string; count: number }>();
        allAssignments.forEach(a => {
          const current = assignerMap.get(a.assigned_by) || { name: a.assigned_by_name, count: 0 };
          assignerMap.set(a.assigned_by, { ...current, count: current.count + 1 });
        });

        // Grouper par assigné
        const assigneeMap = new Map<string, { name: string; count: number }>();
        allAssignments.forEach(a => {
          const current = assigneeMap.get(a.assigned_to) || { name: a.assigned_to_name, count: 0 };
          assigneeMap.set(a.assigned_to, { ...current, count: current.count + 1 });
        });

        setStats({
          totalAssignments: allAssignments.length,
          taskAssignments: tasks?.length || 0,
          contactAssignments: contacts?.length || 0,
          opportunityAssignments: opportunities?.length || 0,
          quoteAssignments: quotes?.length || 0,
          byAssigner: Array.from(assignerMap.entries())
            .map(([email, data]) => ({ email, ...data }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10),
          byAssignee: Array.from(assigneeMap.entries())
            .map(([email, data]) => ({ email, ...data }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10),
          recentAssignments: allAssignments.slice(0, 20)
        });
      } catch (error) {
        console.error('Error fetching assignment stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  return { stats, loading };
};
