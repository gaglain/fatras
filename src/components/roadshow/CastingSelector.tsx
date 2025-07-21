import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Users } from 'lucide-react';

interface CastingSelectorProps {
  users: any[];
  selectedUsers: string[];
  onChange: (selectedUsers: string[]) => void;
}

export const CastingSelector: React.FC<CastingSelectorProps> = ({
  users,
  selectedUsers,
  onChange
}) => {
  const handleUserToggle = (userId: string) => {
    const newSelection = selectedUsers.includes(userId)
      ? selectedUsers.filter(id => id !== userId)
      : [...selectedUsers, userId];
    
    onChange(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      onChange([]);
    } else {
      onChange(users.map(user => user.id));
    }
  };

  const getUserName = (user: any) => {
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Utilisateur sans nom';
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Admin';
      case 'booker': return 'Booker';
      case 'artist': return 'Artiste';
      default: return 'Utilisateur';
    }
  };

  const groupedUsers = users.reduce((acc, user) => {
    const role = user.role || 'utilisateur';
    if (!acc[role]) {
      acc[role] = [];
    }
    acc[role].push(user);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Sélection du Casting</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {selectedUsers.length} / {users.length} sélectionné(s)
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sélectionner tout */}
        <div className="flex items-center space-x-2 pb-2 border-b">
          <Checkbox
            id="select-all"
            checked={selectedUsers.length === users.length}
            onCheckedChange={handleSelectAll}
          />
          <Label htmlFor="select-all" className="font-medium">
            Sélectionner tout le monde
          </Label>
        </div>

        {/* Groupes par rôle */}
        <div className="space-y-4">
          {Object.entries(groupedUsers).map(([role, roleUsers]) => (
            <div key={role} className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                {getRoleLabel(role)} ({roleUsers.length})
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {roleUsers.map(user => (
                  <div
                    key={user.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                      selectedUsers.includes(user.id)
                        ? 'bg-primary/5 border-primary/20'
                        : 'bg-card border-border hover:bg-muted/50'
                    }`}
                  >
                    <Checkbox
                      id={user.id}
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => handleUserToggle(user.id)}
                    />
                    
                    <div className="flex items-center space-x-2 flex-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <Label 
                          htmlFor={user.id} 
                          className="text-sm font-medium cursor-pointer"
                        >
                          {getUserName(user)}
                        </Label>
                        {user.email && (
                          <div className="text-xs text-muted-foreground">
                            {user.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {users.length === 0 && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">Aucun utilisateur disponible</h3>
            <p className="text-muted-foreground text-sm">
              Aucun utilisateur n'est disponible pour le casting
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};