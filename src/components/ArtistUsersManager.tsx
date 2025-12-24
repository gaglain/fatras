import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Users, X, Plus } from 'lucide-react';

interface ArtistUsersManagerProps {
  artistId: string;
}

interface ArtistUser {
  id: string;
  user_id: string;
  role: 'artist' | 'booker' | 'admin' | 'super_admin';
  created_at: string;
  user_profile?: {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

const roleLabels = {
  artist: 'Artiste',
  booker: 'Booker',
  admin: 'Admin',
  super_admin: 'Super Admin'
};

const roleColors = {
  artist: 'bg-purple-100 text-purple-800',
  booker: 'bg-blue-100 text-blue-800',
  admin: 'bg-orange-100 text-orange-800',
  super_admin: 'bg-red-100 text-red-800'
};

export const ArtistUsersManager: React.FC<ArtistUsersManagerProps> = ({ artistId }) => {
  const [artistUsers, setArtistUsers] = useState<ArtistUser[]>([]);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<'artist' | 'booker' | 'admin' | 'super_admin'>('artist');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArtistUsers();
    fetchAvailableUsers();
  }, [artistId]);

  const fetchArtistUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('artist_users')
        .select(`
          id,
          artist_id,
          user_id,
          role,
          created_at
        `)
        .eq('artist_id', artistId);

      if (error) throw error;

      // Fetch user profiles separately
      if (data && data.length > 0) {
        const userIds = data.map(au => au.user_id);
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('user_id, username, email, first_name, last_name')
          .in('user_id', userIds);

        const enrichedData = data.map(au => ({
          ...au,
          role: au.role as 'artist' | 'booker' | 'admin' | 'super_admin',
          user_profile: profiles?.find(p => p.user_id === au.user_id)
        }));

        setArtistUsers(enrichedData);
      } else {
        setArtistUsers([]);
      }
    } catch (error) {
      console.error('Error fetching artist users:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('user_id, username, email, first_name, last_name')
        .eq('is_active', true);

      if (error) throw error;
      setAvailableUsers(data || []);
    } catch (error) {
      console.error('Error fetching available users:', error);
    }
  };

  const handleAddUser = async () => {
    if (!selectedUserId) {
      toast.error('Veuillez sélectionner un utilisateur');
      return;
    }

    try {
      const { error } = await supabase
        .from('artist_users')
        .insert({
          artist_id: artistId,
          user_id: selectedUserId,
          role: selectedRole
        });

      if (error) throw error;

      toast.success('Utilisateur ajouté avec succès');
      setSelectedUserId('');
      fetchArtistUsers();
    } catch (error: any) {
      console.error('Error adding user:', error);
      if (error.code === '23505') {
        toast.error('Cet utilisateur a déjà ce rôle pour ce spectacle');
      } else {
        toast.error('Erreur lors de l\'ajout de l\'utilisateur');
      }
    }
  };

  const handleRemoveUser = async (artistUserId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer cet utilisateur ?')) return;

    try {
      const { error } = await supabase
        .from('artist_users')
        .delete()
        .eq('id', artistUserId);

      if (error) throw error;

      toast.success('Utilisateur retiré avec succès');
      fetchArtistUsers();
    } catch (error) {
      console.error('Error removing user:', error);
      toast.error('Erreur lors de la suppression de l\'utilisateur');
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <Card>
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
          <Users className="h-4 w-4 md:h-5 md:w-5" />
          Utilisateurs liés au spectacle
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
        <div className="space-y-4 md:space-y-6">
          {/* Add new user */}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="w-full sm:flex-1">
                <SelectValue placeholder="Sélectionner un utilisateur" />
              </SelectTrigger>
              <SelectContent>
                {availableUsers.map((user) => (
                  <SelectItem key={user.user_id} value={user.user_id}>
                    {user.first_name} {user.last_name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Select value={selectedRole} onValueChange={(value: any) => setSelectedRole(value)}>
                <SelectTrigger className="flex-1 sm:w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="artist">Artiste</SelectItem>
                  <SelectItem value="booker">Booker</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={handleAddUser} size="sm" className="flex-shrink-0">
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Ajouter</span>
              </Button>
            </div>
          </div>

          {/* List of users */}
          <div className="space-y-2">
            {artistUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun utilisateur lié à ce spectacle</p>
            ) : (
              artistUsers.map((artistUser) => (
                <div
                  key={artistUser.id}
                  className="flex items-center justify-between gap-2 p-2 md:p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm md:text-base font-medium truncate">
                        {artistUser.user_profile?.first_name} {artistUser.user_profile?.last_name}
                      </p>
                      <p className="text-xs md:text-sm text-muted-foreground truncate">
                        {artistUser.user_profile?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                    <Badge className={`${roleColors[artistUser.role]} text-xs`}>
                      {roleLabels[artistUser.role]}
                    </Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 md:h-8 md:w-8"
                      onClick={() => handleRemoveUser(artistUser.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};