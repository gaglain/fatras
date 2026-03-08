import { useMemo } from 'react';
import { useActiveUsers } from '@/hooks/useActiveUsers';

export interface MentionableUser {
  user_id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string | null;
  displayName: string;
}

export const useMentionableUsers = () => {
  const { users, loading } = useActiveUsers();

  const mentionableUsers = useMemo<MentionableUser[]>(() => 
    users.map(u => ({
      ...u,
      displayName: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username || u.email?.split('@')[0] || 'Utilisateur',
    })),
    [users]
  );

  const filterUsers = (query: string): MentionableUser[] => {
    const q = query.toLowerCase();
    return mentionableUsers.filter(u =>
      u.displayName.toLowerCase().includes(q) ||
      (u.username || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q)
    ).slice(0, 8);
  };

  return { mentionableUsers, filterUsers, loading };
};
