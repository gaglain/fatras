import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ActiveUser {
  user_id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string | null;
}

export const useActiveUsers = () => {
  const [users, setUsers] = useState<ActiveUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .rpc('get_active_users_basic');

        if (error) throw error;
        setUsers(data || []);
      } catch {
        // Fallback: try direct query if RPC not available
        try {
          const { data } = await supabase
            .from('user_profiles')
            .select('user_id, username, first_name, last_name, email, avatar_url')
            .eq('is_active', true)
            .order('first_name');
          setUsers(data || []);
        } catch {
          setUsers([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const getUserDisplayName = (userId: string | null | undefined) => {
    if (!userId) return null;
    const user = users.find(u => u.user_id === userId);
    if (!user) return null;
    if (user.first_name || user.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    return user.username || user.email;
  };

  return { users, loading, getUserDisplayName };
};
