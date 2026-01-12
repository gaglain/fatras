import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/lib/logger';

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
        logger.debug('Fetching assignment stats...');
        
        // Récupérer uniquement les tâches assignées (seul type avec assigned_to)
        const { data: tasks, error: tasksError } = await supabase
          .from('tasks')
          .select(`
            id,
            title,
            assigned_to,
            user_id,
            created_at
          `)
          .not('assigned_to', 'is', null)
          .order('created_at', { ascending: false });

        if (tasksError) {
          logger.error('Error fetching tasks:', tasksError);
          throw tasksError;
        }

        logger.debug('Tasks fetched:', tasks?.length || 0);

        // Récupérer tous les profiles nécessaires
        const userIds = new Set<string>();
        tasks?.forEach(t => {
          if (t.assigned_to) userIds.add(t.assigned_to);
          if (t.user_id) userIds.add(t.user_id);
        });

        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email, first_name, last_name')
          .in('id', Array.from(userIds));

        if (profilesError) {
          logger.error('Error fetching profiles:', profilesError);
        }

        const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

        // Mapper uniquement les tâches assignées
        const allAssignments = (tasks || []).map((t) => {
          const assignedUser = profilesMap.get(t.assigned_to);
          const creator = profilesMap.get(t.user_id);
          
          return {
            id: t.id,
            type: 'task' as const,
            title: t.title,
            assigned_by: creator?.email || 'Système',
            assigned_by_name: creator ? `${creator.first_name || ''} ${creator.last_name || ''}`.trim() || creator.email : 'Système',
            assigned_to: assignedUser?.email || 'Inconnu',
            assigned_to_name: assignedUser ? `${assignedUser.first_name || ''} ${assignedUser.last_name || ''}`.trim() || assignedUser.email : 'Inconnu',
            created_at: t.created_at
          };
        });

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
        
        logger.debug('Assignment stats updated:', {
          total: allAssignments.length,
          assigners: assignerMap.size,
          assignees: assigneeMap.size
        });
      } catch (error) {
        logger.error('Error fetching assignment stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  return { stats, loading };
};
