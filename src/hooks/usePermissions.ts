import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export type AppRole = 'super_admin' | 'admin' | 'manager' | 'collaborator' | 'artiste' | 'user';

export interface Permission {
  role: AppRole;
  resource: string;
  can_read: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export const usePermissions = () => {
  const { user } = useAuth();
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserRoles = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setUserRoles(data || []);
    } catch (error: unknown) {
      logger.error('Error fetching user roles:', error);
    }
  };

  const fetchPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*');

      if (error) throw error;
      setPermissions(data || []);
    } catch (error: unknown) {
      logger.error('Error fetching permissions:', error);
    }
  };

  const hasRole = (role: AppRole): boolean => {
    return userRoles.some(ur => ur.role === role);
  };

  const hasPermission = (resource: string, action: 'read' | 'create' | 'update' | 'delete'): boolean => {
    const userHasWildcard = userRoles.some(ur => 
      permissions.some(p => 
        p.role === ur.role && 
        p.resource === '*' && 
        p[`can_${action}`]
      )
    );

    if (userHasWildcard) return true;

    return userRoles.some(ur => 
      permissions.some(p => 
        p.role === ur.role && 
        p.resource === resource && 
        p[`can_${action}`]
      )
    );
  };

  const hasAnyRole = (roles: AppRole[]): boolean => {
    return userRoles.some(ur => roles.includes(ur.role));
  };

  const isAdmin = (): boolean => {
    return hasAnyRole(['super_admin', 'admin']);
  };

  const isSuperAdmin = (): boolean => {
    return hasRole('super_admin');
  };

  const canAccessMessaging = (): boolean => {
    return hasPermission('messaging', 'read');
  };

  const canCreateMessages = (): boolean => {
    return hasPermission('messaging', 'create');
  };

  const canDeleteMessages = (): boolean => {
    return hasPermission('messaging', 'delete');
  };

  useEffect(() => {
    const loadPermissions = async () => {
      setLoading(true);
      await Promise.all([fetchUserRoles(), fetchPermissions()]);
      setLoading(false);
    };

    if (user?.id) {
      loadPermissions();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  return {
    userRoles,
    permissions,
    loading,
    hasRole,
    hasPermission,
    hasAnyRole,
    isAdmin,
    isSuperAdmin,
    canAccessMessaging,
    canCreateMessages,
    canDeleteMessages,
    fetchUserRoles,
    fetchPermissions
  };
};