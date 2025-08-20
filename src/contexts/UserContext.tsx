
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
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deactivateUser: (id: string) => void;
  removeUser: (id: string) => void;
  changeOwnership: (itemType: string, itemId: string, newOwnerId: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  console.log('👤 UserProvider - Initializing...');
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  console.log('👤 UserProvider - About to call useAuth...');
  let authUser, loading;
  try {
    const authResult = useAuth();
    authUser = authResult.user;
    loading = authResult.loading;
    console.log('👤 UserProvider - useAuth result:', { user: authUser?.email, loading });
  } catch (error) {
    console.error('❌ UserProvider - Error in useAuth:', error);
    throw error;
  }

  // Charger tous les utilisateurs depuis Supabase - OPTIMISÉ
  useEffect(() => {
    let isMounted = true;
    
    const fetchUsers = async () => {
      try {
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('*');
        
        if (profiles && isMounted) {
          const usersData: User[] = profiles.map(profile => ({
            id: profile.user_id,
            name: profile.first_name || '',
            lastName: profile.last_name || '',
            email: profile.email || '',
            role: profile.role as UserRole,
            isActive: true,
            username: profile.username || '',
            phone: profile.phone || '',
            address: profile.address || '',
            postal_code: profile.postal_code || '',
            city: profile.city || '',
            birth_date: profile.birth_date || '',
            birth_place: profile.birth_place || '',
            social_security_number: profile.social_security_number || '',
            guso_id: profile.guso_id || '',
            function_title: profile.function_title || '',
            nationality: profile.nationality || '',
            show_name: profile.show_name || ''
          }));
          setUsers(usersData);
        }
      } catch (error) {
        console.warn('⚠️ Error fetching users:', error);
      }
    };

    fetchUsers();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Synchroniser l'utilisateur authentifié avec le contexte utilisateur - OPTIMISÉ
  useEffect(() => {
    if (loading) {
      console.log('🔄 Still loading auth...');
      return; // Attendre que l'auth soit chargée
    }

    console.log('🔐 Auth user changed:', authUser?.email || 'No user');
    
    if (authUser) {
      // Éviter les appels multiples - vérifier si on a déjà cet utilisateur
      if (currentUser?.id === authUser.id) {
        console.log('✅ Same user already loaded, skipping fetch');
        return;
      }

      console.log('🔄 Fetching profile for user:', authUser.id);
      const fetchCurrentUserProfile = async () => {
        try {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', authUser.id)
            .single();

          if (profile) {
            const userData: User = {
              id: profile.user_id,
              name: profile.first_name || '',
              lastName: profile.last_name || '',
              email: profile.email || '',
              role: profile.role as UserRole,
              isActive: true,
              username: profile.username || '',
              phone: profile.phone || '',
              address: profile.address || '',
              postal_code: profile.postal_code || '',
              city: profile.city || '',
              birth_date: profile.birth_date || '',
              birth_place: profile.birth_place || '',
              social_security_number: profile.social_security_number || '',
              guso_id: profile.guso_id || '',
              function_title: profile.function_title || '',
              nationality: profile.nationality || '',
              show_name: profile.show_name || ''
            };
            setCurrentUser(userData);
            console.log('✅ Current user set to:', userData.email);
          } else {
            console.log('📝 Creating default profile for new user');
            // Créer un profil par défaut si il n'existe pas
            const { data: newProfile } = await supabase
              .from('user_profiles')
              .insert({
                user_id: authUser.id,
                username: authUser.email?.split('@')[0] || 'user',
                email: authUser.email,
                first_name: authUser.user_metadata?.first_name || '',
                last_name: authUser.user_metadata?.last_name || '',
                role: 'admin'
              })
              .select()
              .single();

            if (newProfile) {
              const userData: User = {
                id: newProfile.user_id,
                name: newProfile.first_name || '',
                lastName: newProfile.last_name || '',
                email: newProfile.email || '',
                role: newProfile.role as UserRole,
                isActive: true,
                username: newProfile.username || ''
              };
              setCurrentUser(userData);
              console.log('✅ New user profile created:', userData.email);
            }
          }
        } catch (error) {
          console.error('❌ Error fetching user profile:', error);
        }
      };

      fetchCurrentUserProfile();
    } else {
      // User déconnecté
      if (currentUser !== null) {
        setCurrentUser(null);
        console.log('👋 User logged out, current user set to null');
      }
    }
  }, [authUser?.id, loading]); // Dépendances optimisées

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

  const addUser = async (userData: Omit<User, 'id'>) => {
    // Générer un UUID temporaire pour les nouveaux utilisateurs non-authentifiés
    const tempUserId = crypto.randomUUID();
    
    const { data: newProfile, error } = await supabase
      .from('user_profiles')
      .insert({
        user_id: tempUserId,
        username: userData.username || userData.email?.split('@')[0] || 'user',
        first_name: userData.name,
        last_name: userData.lastName,
        email: userData.email,
        phone: userData.phone || '',
        role: userData.role,
        address: userData.address || '',
        postal_code: userData.postal_code || '',
        city: userData.city || '',
        birth_date: userData.birth_date || '',
        birth_place: userData.birth_place || '',
        social_security_number: userData.social_security_number || '',
        guso_id: userData.guso_id || '',
        function_title: userData.function_title || '',
        nationality: userData.nationality || '',
        show_name: userData.show_name || ''
      })
      .select()
      .single();

    if (newProfile && !error) {
      const newUser: User = {
        id: newProfile.user_id,
        name: newProfile.first_name || '',
        lastName: newProfile.last_name || '',
        email: newProfile.email || '',
        role: newProfile.role as UserRole,
        isActive: true,
        username: newProfile.username || '',
        phone: newProfile.phone || '',
        address: newProfile.address || '',
        postal_code: newProfile.postal_code || '',
        city: newProfile.city || '',
        birth_date: newProfile.birth_date || '',
        birth_place: newProfile.birth_place || '',
        social_security_number: newProfile.social_security_number || '',
        guso_id: newProfile.guso_id || '',
        function_title: newProfile.function_title || '',
        nationality: newProfile.nationality || '',
        show_name: newProfile.show_name || ''
      };
      setUsers(prev => [...prev, newUser]);
    }
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        first_name: updates.name,
        last_name: updates.lastName,
        email: updates.email,
        phone: updates.phone,
        role: updates.role,
        username: updates.username,
        address: updates.address,
        postal_code: updates.postal_code,
        city: updates.city,
        birth_date: updates.birth_date,
        birth_place: updates.birth_place,
        social_security_number: updates.social_security_number,
        guso_id: updates.guso_id,
        function_title: updates.function_title,
        nationality: updates.nationality,
        show_name: updates.show_name
      })
      .eq('user_id', id);

    if (!error) {
      setUsers(prev => prev.map(user => 
        user.id === id ? { ...user, ...updates } : user
      ));
      if (currentUser?.id === id) {
        setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
      }
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
