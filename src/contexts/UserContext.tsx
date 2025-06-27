import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'super_admin' | 'admin' | 'manager' | 'artiste' | 'utilisateur';

export interface User {
  id: string;
  name: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  username?: string;
  avatar?: string;
  phone?: string;
  department?: string;
  bio?: string;
  googleCalendarConnected?: boolean;
  gmailConnected?: boolean;
  // Nouvelles propriétés étendues
  address?: string;
  postal_code?: string;
  city?: string;
  birth_date?: string;
  birth_place?: string;
  social_security_number?: string;
  guso_id?: string;
  function_title?: string;
  nationality?: string;
  show_name?: string;
}

export interface UserPermissions {
  canCreateContacts: boolean;
  canEditAllContacts: boolean;
  canDeleteContacts: boolean;
  canViewAllTasks: boolean;
  canAssignTasks: boolean;
  canManageUsers: boolean;
  canManageWebsite: boolean;
  canManageArtists: boolean;
  canViewFinancials: boolean;
}

interface UserContextType {
  users: User[];
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  getUserById: (id: string) => User | undefined;
  getUserPermissions: (user: User) => UserPermissions;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deactivateUser: (id: string) => void;
  removeUser: (id: string) => void;
  changeOwnership: (itemType: string, itemId: string, newOwnerId: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { user: authUser, loading } = useAuth();

  // Synchroniser l'utilisateur authentifié avec le contexte utilisateur
  useEffect(() => {
    console.log('Auth user changed:', authUser);
    if (authUser && !loading) {
      loadUserProfile(authUser.id);
    } else if (!authUser && !loading) {
      setCurrentUser(null);
      console.log('User logged out, current user set to null');
    }
  }, [authUser, loading]);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      let user: User;
      
      if (profile) {
        // Utilisateur avec profil existant
        user = {
          id: profile.user_id,
          name: profile.first_name || 'Utilisateur',
          lastName: profile.last_name || '',
          email: profile.email || authUser?.email || '',
          role: profile.role as UserRole,
          isActive: true,
          username: profile.username || authUser?.email?.split('@')[0] || '', // Utiliser le nouveau pseudonyme
          avatar: authUser?.user_metadata?.avatar_url || '',
          phone: profile.phone || '',
          department: profile.function_title || 'Non défini',
          bio: `${roleLabels[profile.role as UserRole]} connecté via Supabase`,
          googleCalendarConnected: false,
          gmailConnected: false,
          // Propriétés étendues
          address: profile.address,
          postal_code: profile.postal_code,
          city: profile.city,
          birth_date: profile.birth_date,
          birth_place: profile.birth_place,
          social_security_number: profile.social_security_number,
          guso_id: profile.guso_id,
          function_title: profile.function_title,
          nationality: profile.nationality,
          show_name: profile.show_name
        };
      } else {
        // Créer un profil par défaut pour les utilisateurs sans profil
        const defaultUsername = authUser?.email?.split('@')[0] || 'user';
        user = {
          id: authUser?.id || '',
          name: authUser?.user_metadata?.first_name || 'Utilisateur',
          lastName: authUser?.user_metadata?.last_name || '',
          email: authUser?.email || '',
          role: 'utilisateur',
          isActive: true,
          username: defaultUsername,
          avatar: authUser?.user_metadata?.avatar_url || '',
          phone: authUser?.phone || '',
          department: 'Non défini',
          bio: 'Utilisateur connecté via Supabase',
          googleCalendarConnected: false,
          gmailConnected: false
        };
      }

      setCurrentUser(user);
      console.log('Current user set to:', user);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const roleLabels = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    manager: 'Manager / Booker',
    artiste: 'Artiste',
    utilisateur: 'Utilisateur'
  };

  const getUserById = (id: string): User | undefined => {
    return users.find(user => user.id === id);
  };

  const getUserPermissions = (user: User | null): UserPermissions => {
    if (!user) {
      return {
        canCreateContacts: false,
        canEditAllContacts: false,
        canDeleteContacts: false,
        canViewAllTasks: false,
        canAssignTasks: false,
        canManageUsers: false,
        canManageWebsite: false,
        canManageArtists: false,
        canViewFinancials: false
      };
    }

    switch (user.role) {
      case 'super_admin':
        return {
          canCreateContacts: true,
          canEditAllContacts: true,
          canDeleteContacts: true,
          canViewAllTasks: true,
          canAssignTasks: true,
          canManageUsers: true,
          canManageWebsite: true,
          canManageArtists: true,
          canViewFinancials: true
        };
      case 'admin':
        return {
          canCreateContacts: true,
          canEditAllContacts: true,
          canDeleteContacts: true,
          canViewAllTasks: true,
          canAssignTasks: true,
          canManageUsers: true,
          canManageWebsite: true,
          canManageArtists: true,
          canViewFinancials: true
        };
      case 'manager':
        return {
          canCreateContacts: true,
          canEditAllContacts: true,
          canDeleteContacts: false,
          canViewAllTasks: true,
          canAssignTasks: true,
          canManageUsers: false,
          canManageWebsite: false,
          canManageArtists: true,
          canViewFinancials: false
        };
      case 'artiste':
        return {
          canCreateContacts: false,
          canEditAllContacts: false,
          canDeleteContacts: false,
          canViewAllTasks: false,
          canAssignTasks: false,
          canManageUsers: false,
          canManageWebsite: false,
          canManageArtists: false,
          canViewFinancials: false
        };
      case 'utilisateur':
        return {
          canCreateContacts: false,
          canEditAllContacts: false,
          canDeleteContacts: false,
          canViewAllTasks: false,
          canAssignTasks: false,
          canManageUsers: false,
          canManageWebsite: false,
          canManageArtists: false,
          canViewFinancials: false
        };
      default:
        return {
          canCreateContacts: false,
          canEditAllContacts: false,
          canDeleteContacts: false,
          canViewAllTasks: false,
          canAssignTasks: false,
          canManageUsers: false,
          canManageWebsite: false,
          canManageArtists: false,
          canViewFinancials: false
        };
    }
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(user => 
      user.id === id ? { ...user, ...updates } : user
    ));
    if (currentUser?.id === id) {
      setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const deactivateUser = (id: string) => {
    setUsers(prev => prev.map(user => 
      user.id === id ? { ...user, isActive: false } : user
    ));
  };

  const removeUser = (id: string) => {
    setUsers(prev => prev.filter(user => user.id !== id));
  };

  const changeOwnership = (itemType: string, itemId: string, newOwnerId: string) => {
    console.log(`Changing ownership of ${itemType} ${itemId} to user ${newOwnerId}`);
  };

  return (
    <UserContext.Provider value={{
      users,
      currentUser,
      setCurrentUser,
      getUserById,
      getUserPermissions,
      addUser,
      updateUser,
      deactivateUser,
      removeUser,
      changeOwnership
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
