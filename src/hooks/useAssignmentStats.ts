import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

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
  const { user } = useAuthContext();

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      setLoading(true);
      
      try {
        // Récupérer toutes les notifications d'assignation
        const { data: notifications, error } = await supabase
          .from('notifications')
          .select('*')
          .in('type', ['task', 'contact', 'opportunity', 'quote'])
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) throw error;

        if (!notifications) {
          setLoading(false);
          return;
        }

        // Calculer les statistiques
        const taskCount = notifications.filter(n => n.type === 'task').length;
        const contactCount = notifications.filter(n => n.type === 'contact').length;
        const opportunityCount = notifications.filter(n => n.type === 'opportunity').length;
        const quoteCount = notifications.filter(n => n.type === 'quote').length;

        // Grouper par assignateur
        const assignerMap = new Map<string, { name: string; count: number }>();
        notifications.forEach(n => {
          const data = n.data as Record<string, any> | null;
          const assignerEmail = data?.assigned_by || 'Unknown';
          const current = assignerMap.get(assignerEmail) || { name: assignerEmail, count: 0 };
          assignerMap.set(assignerEmail, { ...current, count: current.count + 1 });
        });

        // Grouper par assigné - récupérer les emails des utilisateurs
        const assigneeMap = new Map<string, { name: string; count: number }>();
        const userEmails = await Promise.all(
          notifications.map(async (n) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('email')
              .eq('id', n.user_id)
              .single();
            
            return { userId: n.user_id, email: profile?.email || 'Unknown' };
          })
        );

        userEmails.forEach((user, index) => {
          const assigneeEmail = user.email;
          const current = assigneeMap.get(assigneeEmail) || { name: assigneeEmail, count: 0 };
          assigneeMap.set(assigneeEmail, { ...current, count: current.count + 1 });
        });

        // Préparer les assignations récentes
        const recentAssignments = notifications.slice(0, 20).map(n => {
          const data = n.data as Record<string, any> | null;
          return {
            id: n.id,
            type: n.type,
            title: n.title,
            assigned_by: data?.assigned_by || 'Unknown',
            assigned_to: n.user_id,
            created_at: n.created_at
          };
        });

        setStats({
          totalAssignments: notifications.length,
          taskAssignments: taskCount,
          contactAssignments: contactCount,
          opportunityAssignments: opportunityCount,
          quoteAssignments: quoteCount,
          byAssigner: Array.from(assignerMap.entries())
            .map(([email, data]) => ({ email, ...data }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10),
          byAssignee: Array.from(assigneeMap.entries())
            .map(([email, data]) => ({ email, ...data }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10),
          recentAssignments
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
