
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

export type UserRole = 'admin' | 'manager' | 'user';

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
}

export interface UserPermissions {
  canCreateContacts: boolean;
  canEditAllContacts: boolean;
  canDeleteContacts: boolean;
  canViewAllTasks: boolean;
  canAssignTasks: boolean;
  canManageUsers: boolean;
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

const defaultUsers: User[] = [
  { 
    id: 'user-1', 
    name: 'Admin', 
    lastName: 'Principal',
    email: 'admin@showmanager.fr', 
    role: 'admin', 
    isActive: true,
    username: 'admin',
    phone: '06 12 34 56 78',
    department: 'Direction',
    bio: 'Administrateur principal du système',
    googleCalendarConnected: true,
    gmailConnected: true
  },
  { 
    id: 'user-2', 
    name: 'Manager', 
    lastName: 'Événements',
    email: 'manager@showmanager.fr', 
    role: 'manager', 
    isActive: true,
    username: 'manager_events',
    phone: '06 23 45 67 89',
    department: 'Événements',
    bio: 'Gestionnaire des événements',
    googleCalendarConnected: false,
    gmailConnected: true
  },
  { 
    id: 'user-3', 
    name: 'Assistant', 
    lastName: 'Production',
    email: 'assistant@showmanager.fr', 
    role: 'user', 
    isActive: true,
    username: 'assistant',
    phone: '06 34 56 78 90',
    department: 'Production',
    bio: 'Assistant de production',
    googleCalendarConnected: false,
    gmailConnected: false
  }
];

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(defaultUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { user: authUser, loading } = useAuth();

  // Synchroniser l'utilisateur authentifié avec le contexte utilisateur
  useEffect(() => {
    console.log('Auth user changed:', authUser);
    if (authUser && !loading) {
      // Créer ou mettre à jour l'utilisateur basé sur les données Supabase
      const supabaseUser: User = {
        id: authUser.id,
        name: authUser.user_metadata?.first_name || 'Utilisateur',
        lastName: authUser.user_metadata?.last_name || '',
        email: authUser.email || '',
        role: 'admin', // Vous pouvez ajuster selon votre logique
        isActive: true,
        username: authUser.email?.split('@')[0] || '',
        avatar: authUser.user_metadata?.avatar_url || '',
        phone: authUser.phone || '',
        department: 'Direction',
        bio: 'Utilisateur connecté via Supabase',
        googleCalendarConnected: false,
        gmailConnected: false
      };

      // Vérifier si l'utilisateur existe déjà dans la liste
      const existingUserIndex = users.findIndex(u => u.id === authUser.id);
      if (existingUserIndex >= 0) {
        // Mettre à jour l'utilisateur existant
        setUsers(prev => prev.map(u => u.id === authUser.id ? supabaseUser : u));
      } else {
        // Ajouter le nouvel utilisateur
        setUsers(prev => [...prev, supabaseUser]);
      }

      setCurrentUser(supabaseUser);
      console.log('Current user set to:', supabaseUser);
    } else if (!authUser && !loading) {
      // Utilisateur déconnecté
      setCurrentUser(null);
      console.log('User logged out, current user set to null');
    }
  }, [authUser, loading]);

  const getUserById = (id: string): User | undefined => {
    return users.find(user => user.id === id);
  };

  const getUserPermissions = (user: User): UserPermissions => {
    switch (user.role) {
      case 'admin':
        return {
          canCreateContacts: true,
          canEditAllContacts: true,
          canDeleteContacts: true,
          canViewAllTasks: true,
          canAssignTasks: true,
          canManageUsers: true
        };
      case 'manager':
        return {
          canCreateContacts: true,
          canEditAllContacts: true,
          canDeleteContacts: false,
          canViewAllTasks: true,
          canAssignTasks: true,
          canManageUsers: false
        };
      case 'user':
        return {
          canCreateContacts: true,
          canEditAllContacts: false,
          canDeleteContacts: false,
          canViewAllTasks: false,
          canAssignTasks: false,
          canManageUsers: false
        };
      default:
        return {
          canCreateContacts: false,
          canEditAllContacts: false,
          canDeleteContacts: false,
          canViewAllTasks: false,
          canAssignTasks: false,
          canManageUsers: false
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
