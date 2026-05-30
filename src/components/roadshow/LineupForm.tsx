import React, { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { FormData } from '@/types/roadshow.types';
import { useUser } from '@/contexts/UserContext';

interface LineupUser {
  id: string;
  name: string;
  lastName?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
}

interface LineupFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  users: LineupUser[];
}

const roleLabel = (role?: string) => {
  switch (role) {
    case 'super_admin': return 'Super Admin';
    case 'admin': return 'Admin';
    case 'manager': return 'Manager';
    case 'booker': return 'Booker';
    case 'artist':
    case 'artiste': return 'Artiste';
    default: return 'Utilisateur';
  }
};

const roleOrder = ['artist', 'artiste', 'manager', 'booker', 'admin', 'super_admin', 'user', 'utilisateur'];

export const LineupForm: React.FC<LineupFormProps> = ({ formData, setFormData, users }) => {
  const { refreshUsers } = useUser() as any;
  const [userSearchTerm, setUserSearchTerm] = useState('');

  // Refresh the user list each time the casting tab is opened to pick up
  // newly created artists without a full page reload.
  useEffect(() => {
    if (typeof refreshUsers === 'function') {
      refreshUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleArtistLineup = (userId: string) => {
    const exists = formData.artistLineup.some(a => a.userId === userId);
    setFormData({
      ...formData,
      artistLineup: exists
        ? formData.artistLineup.filter(a => a.userId !== userId)
        : [...formData.artistLineup, { userId, confirmed: false }]
    });
  };

  const toggleArtistConfirmation = (userId: string) => {
    setFormData({
      ...formData,
      artistLineup: formData.artistLineup.map(a =>
        a.userId === userId ? { ...a, confirmed: !a.confirmed } : a
      )
    });
  };

  const fullName = (u: LineupUser) => `${u.name || ''} ${u.lastName || ''}`.trim() || u.email || 'Sans nom';

  const filteredUsers = useMemo(() => {
    const term = userSearchTerm.toLowerCase().trim();
    const list = (users || []).filter(u => u.isActive !== false);
    if (!term) return list;
    return list.filter(u =>
      fullName(u).toLowerCase().includes(term) ||
      (u.email || '').toLowerCase().includes(term)
    );
  }, [users, userSearchTerm]);

  const grouped = useMemo(() => {
    const map: Record<string, LineupUser[]> = {};
    filteredUsers.forEach(u => {
      const r = u.role || 'utilisateur';
      (map[r] ||= []).push(u);
    });
    return Object.entries(map).sort(([a], [b]) => {
      const ia = roleOrder.indexOf(a); const ib = roleOrder.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
  }, [filteredUsers]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Rechercher des artistes ({filteredUsers.length} disponible{filteredUsers.length > 1 ? 's' : ''})
        </label>
        <Input
          value={userSearchTerm}
          onChange={(e) => setUserSearchTerm(e.target.value)}
          placeholder="Nom, prénom ou email..."
          className="mb-2"
        />
        <div className="max-h-80 overflow-y-auto border rounded-md p-2 space-y-3">
          {grouped.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-6">
              Aucun utilisateur trouvé
            </div>
          )}
          {grouped.map(([role, roleUsers]) => (
            <div key={role} className="space-y-1">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground px-1">
                {roleLabel(role)} ({roleUsers.length})
              </div>
              {roleUsers.map((user) => {
                const isSelected = formData.artistLineup.some(a => a.userId === user.id);
                const isConfirmed = formData.artistLineup.find(a => a.userId === user.id)?.confirmed || false;
                return (
                  <div
                    key={user.id}
                    className={`flex items-center justify-between p-2 rounded-md border transition-colors ${
                      isSelected ? 'bg-primary/5 border-primary/30' : 'bg-card border-border hover:bg-muted/50'
                    }`}
                  >
                    <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleArtistLineup(user.id)}
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm truncate">{fullName(user)}</span>
                        {user.email && (
                          <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                        )}
                      </div>
                    </label>
                    {isSelected && (
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={isConfirmed ? 'default' : 'outline'} className="text-xs">
                          {isConfirmed ? 'Confirmé' : 'En attente'}
                        </Badge>
                        <Switch
                          checked={isConfirmed}
                          onCheckedChange={() => toggleArtistConfirmation(user.id)}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
