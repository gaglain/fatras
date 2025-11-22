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
        console.log('📊 Fetching assignment stats...');
        
        // Récupérer uniquement les tâches assignées (seul type avec assigned_to)
        const { data: tasks, error: tasksError } = await supabase
          .from('tasks')
          .select(`
            id,
            title,
            assigned_to,
            user_id,
            created_at,
            assigned_user:profiles!tasks_assigned_to_fkey(id, email, first_name, last_name),
            creator:profiles!tasks_user_id_fkey(id, email, first_name, last_name)
          `)
          .not('assigned_to', 'is', null)
          .order('created_at', { ascending: false });

        if (tasksError) {
          console.error('❌ Error fetching tasks:', tasksError);
          throw tasksError;
        }

        console.log('✅ Tasks fetched:', tasks?.length || 0);

        // Mapper uniquement les tâches assignées
        const allAssignments = (tasks || []).map((t: any) => ({
          id: t.id,
          type: 'task' as const,
          title: t.title,
          assigned_by: t.creator?.email || 'Système',
          assigned_by_name: t.creator ? `${t.creator.first_name || ''} ${t.creator.last_name || ''}`.trim() || t.creator.email : 'Système',
          assigned_to: t.assigned_user?.email || 'Inconnu',
          assigned_to_name: t.assigned_user ? `${t.assigned_user.first_name || ''} ${t.assigned_user.last_name || ''}`.trim() || t.assigned_user.email : 'Inconnu',
          created_at: t.created_at
        }));

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
          contactAssignments: 0,
          opportunityAssignments: 0,
          quoteAssignments: 0,
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
        
        console.log('✅ Assignment stats updated:', {
          total: allAssignments.length,
          assigners: assignerMap.size,
          assignees: assigneeMap.size
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
