import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Users, 
  Calendar,
  MessageSquare,
  Briefcase,
  FileText,
  ShoppingCart,
  Settings,
  Mail,
  BarChart3,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { usePermissions, AppRole } from '@/hooks/usePermissions';
import { supabase } from '@/integrations/supabase/client';

const roleLabels = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  manager: 'Manager',
  collaborator: 'Collaborateur',
  artiste: 'Artiste',
  user: 'Utilisateur'
};

const resourceLabels = {
  contacts: 'Contacts',
  events: 'Événements',
  opportunities: 'Opportunités',
  quotes: 'Devis',
  tasks: 'Tâches',
  messaging: 'Messagerie',
  users: 'Utilisateurs',
  products: 'Produits',
  campaigns: 'Campagnes Email',
  analytics: 'Analytics',
  settings: 'Paramètres',
  '*': 'Tous les accès'
};

const resourceIcons = {
  contacts: Users,
  events: Calendar,
  opportunities: Briefcase,
  quotes: FileText,
  tasks: BarChart3,
  messaging: MessageSquare,
  users: Shield,
  products: ShoppingCart,
  campaigns: Mail,
  analytics: BarChart3,
  settings: Settings,
  '*': Shield
};

export const RolePermissions: React.FC = () => {
  const navigate = useNavigate();
  const { permissions, loading, fetchPermissions } = usePermissions();
  const [permissionsState, setPermissionsState] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (permissions.length > 0) {
      const state: Record<string, any> = {};
      permissions.forEach(perm => {
        const key = `${perm.role}-${perm.resource}`;
        state[key] = {
          can_read: perm.can_read,
          can_create: perm.can_create,
          can_update: perm.can_update,
          can_delete: perm.can_delete
        };
      });
      setPermissionsState(state);
    }
  }, [permissions]);

  const updatePermission = (role: AppRole, resource: string, action: string, value: boolean) => {
    const key = `${role}-${resource}`;
    setPermissionsState(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [`can_${action}`]: value
      }
    }));
  };

  const savePermissions = async () => {
    setSaving(true);
    try {
      // Supprimer toutes les permissions existantes et les recréer (utilise un filtre valide)
      await supabase.from('role_permissions').delete().not('id', 'is', null);
      
      // Insérer les nouvelles permissions
      const newPermissions = [] as any[];
      Object.entries(permissionsState).forEach(([key, perms]) => {
        const [role, resource] = key.split('-');
        newPermissions.push({
          role,
          resource,
          can_read: perms.can_read || false,
          can_create: perms.can_create || false,
          can_update: perms.can_update || false,
          can_delete: perms.can_delete || false
        });
      });

      const { error } = await supabase
        .from('role_permissions')
        .insert(newPermissions);

      if (error) throw error;

      toast.success('Permissions mises à jour avec succès');
      fetchPermissions();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde des permissions');
    } finally {
      setSaving(false);
    }
  };

  const getRoleColor = (role: AppRole) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-orange-100 text-orange-800';
      case 'collaborator': return 'bg-blue-100 text-blue-800';
      case 'artiste': return 'bg-green-100 text-green-800';
      case 'user': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const roles: AppRole[] = ['super_admin', 'admin', 'manager', 'collaborator', 'artiste', 'user'];
  const resources = Object.keys(resourceLabels);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 mr-3 text-primary" />
              Gestion des Permissions
            </h1>
            <p className="text-muted-foreground mt-2">
              Configurez les permissions pour chaque rôle utilisateur
            </p>
          </div>
        </div>
        <Button onClick={savePermissions} disabled={saving}>
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      </div>

      <div className="space-y-6">
        {roles.map(role => (
          <Card key={role}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Badge className={getRoleColor(role)} variant="secondary">
                  {roleLabels[role]}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {resources.map(resource => {
                  const key = `${role}-${resource}`;
                  const perms = permissionsState[key] || {
                    can_read: false,
                    can_create: false,
                    can_update: false,
                    can_delete: false
                  };
                  const IconComponent = resourceIcons[resource as keyof typeof resourceIcons];

                  return (
                    <Card key={resource} className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <IconComponent className="h-4 w-4" />
                        <span className="font-medium text-sm">
                          {resourceLabels[resource as keyof typeof resourceLabels]}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`${key}-read`} className="text-xs">Lire</Label>
                          <Switch
                            id={`${key}-read`}
                            checked={perms.can_read}
                            onCheckedChange={(checked) => 
                              updatePermission(role, resource, 'read', checked)
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`${key}-create`} className="text-xs">Créer</Label>
                          <Switch
                            id={`${key}-create`}
                            checked={perms.can_create}
                            onCheckedChange={(checked) => 
                              updatePermission(role, resource, 'create', checked)
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`${key}-update`} className="text-xs">Modifier</Label>
                          <Switch
                            id={`${key}-update`}
                            checked={perms.can_update}
                            onCheckedChange={(checked) => 
                              updatePermission(role, resource, 'update', checked)
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`${key}-delete`} className="text-xs">Supprimer</Label>
                          <Switch
                            id={`${key}-delete`}
                            checked={perms.can_delete}
                            onCheckedChange={(checked) => 
                              updatePermission(role, resource, 'delete', checked)
                            }
                          />
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};