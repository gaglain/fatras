/**
 * Unified Auth Context
 * Combines Supabase auth state with user profile management in a single provider
 * to reduce re-renders and simplify the auth architecture.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

// ============= Types =============

export type UserRole = 'super_admin' | 'admin' | 'manager' | 'artiste' | 'utilisateur';

export interface UserProfile {
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
  address?: string;
  postal_code?: string;
  city?: string;
  function_title?: string;
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

interface UnifiedAuthContextType {
  // Auth state
  authUser: SupabaseUser | null;
  session: Session | null;
  loading: boolean;
  
  // User profile state
  currentUser: UserProfile | null;
  users: UserProfile[];
  
  // Auth methods
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
  
  // User methods
  setCurrentUser: (user: UserProfile | null) => void;
  getUserById: (id: string) => UserProfile | undefined;
  getUserPermissions: (user: UserProfile | null) => UserPermissions;
  addUser: (user: Omit<UserProfile, 'id'>) => Promise<void>;
  updateUser: (id: string, updates: Partial<UserProfile>) => Promise<void>;
  deactivateUser: (id: string) => void;
  removeUser: (id: string) => void;
  changeOwnership: (itemType: string, itemId: string, newOwnerId: string) => void;
  refreshUsers: () => Promise<void>;
}

// ============= Context =============

const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(undefined);

// ============= Helper Functions =============

const mapProfileToUser = (profile: any): UserProfile => ({
  id: profile.user_id || profile.id,
  name: profile.first_name || '',
  lastName: profile.last_name || '',
  email: profile.email || '',
  role: profile.role as UserRole,
  isActive: profile.is_active !== false,
  username: profile.username || '',
  phone: profile.phone || '',
  avatar: profile.avatar_url || '',
  address: profile.address || '',
  postal_code: profile.postal_code || '',
  city: profile.city || '',
  function_title: profile.function_title || '',
  show_name: profile.show_name || ''
});

const getPermissionsForRole = (role: UserRole | undefined): UserPermissions => {
  const noPermissions: UserPermissions = {
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

  switch (role) {
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
      return noPermissions;
  }
};

// ============= Provider =============

export const UnifiedAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Auth state
  const [authUser, setAuthUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  // User state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);

  // Fetch all users via security definer function (returns only basic non-sensitive fields)
  const refreshUsers = useCallback(async () => {
    try {
      logger.log('🔄 Fetching user profiles via secure function...');
      const { data: profiles, error } = await supabase
        .rpc('get_active_users_basic');
      
      if (error) {
        logger.error('❌ Error fetching user profiles:', error);
        return;
      }
      
      if (profiles) {
        const usersData = (profiles as any[]).map((p: any) => ({
          id: p.user_id || '',
          name: p.first_name || '',
          lastName: p.last_name || '',
          email: p.email || '',
          role: p.role as UserRole,
          isActive: p.is_active !== false,
          username: p.username || '',
          avatar: p.avatar_url || '',
        } as UserProfile));
        setUsers(usersData);
        logger.log('✅ Loaded', usersData.length, 'user profiles');
      }
    } catch (error) {
      logger.error('❌ Critical error fetching users:', error);
      setUsers([]);
    }
  }, []);

  // Fetch current user profile
  const fetchCurrentUserProfile = useCallback(async (userId: string, userEmail?: string | null) => {
    try {
      logger.log('🔄 Fetching profile for user:', userId);
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profile) {
        const userData = mapProfileToUser(profile);
        setCurrentUser(userData);
        logger.log('✅ Current user loaded:', userData.email);
      } else {
        // Create default profile for new user
        logger.log('📝 Creating default profile for new user');
        const { data: newProfile } = await supabase
          .from('user_profiles')
          .insert({
            user_id: userId,
            username: userEmail?.split('@')[0] || 'user',
            email: userEmail,
            first_name: '',
            last_name: '',
            role: 'utilisateur'
          })
          .select()
          .single();

        if (newProfile) {
          const userData = mapProfileToUser(newProfile);
          setCurrentUser(userData);
          logger.log('✅ New user profile created:', userData.email);
        }
      }
    } catch (error) {
      logger.error('❌ Error fetching user profile:', error);
    }
  }, []);

  // Setup auth listener
  useEffect(() => {
    logger.log('🔐 Setting up unified auth...');

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logger.log('🔐 Auth state changed:', event, session?.user?.email || 'No user');
        setSession(session);
        setAuthUser(session?.user ?? null);

        if (session?.user) {
          // Use setTimeout to avoid potential race conditions with Supabase
          setTimeout(() => {
            fetchCurrentUserProfile(session.user.id, session.user.email);
            refreshUsers();
          }, 0);
        } else {
          setCurrentUser(null);
          setUsers([]);
        }

        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      logger.log('🔐 Initial session:', session?.user?.email || 'No session');
      setSession(session);
      setAuthUser(session?.user ?? null);

      if (session?.user) {
        fetchCurrentUserProfile(session.user.id, session.user.email);
        // Load team profiles only for authenticated users (RPC is auth-only)
        refreshUsers();
      }

      setLoading(false);
    });

    return () => {
      logger.log('🔐 Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, [fetchCurrentUserProfile, refreshUsers]);


  // Auth methods
  const signIn = async (email: string, password: string) => {
    logger.log('🔑 Attempting sign in for:', email);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (data.user && !error) {
      logger.log('✅ Sign in successful');
    } else if (error) {
      logger.error('❌ Sign in error:', error);
    }
    
    return { data, error };
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/dashboard`
      },
    });
    return { data, error };
  };

  const signOut = async () => {
    logger.log('👋 Signing out...');
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  // User methods
  const getUserById = (id: string): UserProfile | undefined => {
    return users.find(user => user.id === id);
  };

  const getUserPermissions = (user: UserProfile | null): UserPermissions => {
    return getPermissionsForRole(user?.role);
  };

  const addUser = async (userData: Omit<UserProfile, 'id'>) => {
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
        function_title: userData.function_title || '',
        show_name: userData.show_name || ''
      })
      .select()
      .single();

    if (newProfile && !error) {
      const newUser = mapProfileToUser(newProfile);
      setUsers(prev => [...prev, newUser]);
    }
  };

  const updateUser = async (id: string, updates: Partial<UserProfile>) => {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        first_name: updates.name,
        last_name: updates.lastName,
        email: updates.email,
        phone: updates.phone,
        role: updates.role,
        username: updates.username,
        avatar_url: updates.avatar,
        address: updates.address,
        postal_code: updates.postal_code,
        city: updates.city,
        function_title: updates.function_title,
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
    logger.log(`Changing ownership of ${itemType} ${itemId} to user ${newOwnerId}`);
  };

  return (
    <UnifiedAuthContext.Provider value={{
      // Auth
      authUser,
      session,
      loading,
      signIn,
      signUp,
      signOut,
      
      // Users
      currentUser,
      users,
      setCurrentUser,
      getUserById,
      getUserPermissions,
      addUser,
      updateUser,
      deactivateUser,
      removeUser,
      changeOwnership,
      refreshUsers
    }}>
      {children}
    </UnifiedAuthContext.Provider>
  );
};

// ============= Hooks =============

export const useUnifiedAuth = () => {
  const context = useContext(UnifiedAuthContext);
  if (context === undefined) {
    throw new Error('useUnifiedAuth must be used within an UnifiedAuthProvider');
  }
  return context;
};

// Backward compatibility hooks
export const useAuthContext = () => {
  const { authUser, session, loading, signIn, signUp, signOut } = useUnifiedAuth();
  // Memoized so consumers with `[auth]` style deps don't refetch on every render
  return React.useMemo(() => ({
    user: authUser,
    session,
    loading,
    signIn,
    signUp,
    signOut
  }), [authUser, session, loading, signIn, signUp, signOut]);
};

export const useUser = () => {
  const context = useUnifiedAuth();
  return {
    users: context.users,
    currentUser: context.currentUser,
    setCurrentUser: context.setCurrentUser,
    getUserById: context.getUserById,
    getUserPermissions: context.getUserPermissions,
    addUser: context.addUser,
    updateUser: context.updateUser,
    deactivateUser: context.deactivateUser,
    removeUser: context.removeUser,
    changeOwnership: context.changeOwnership,
    refreshUsers: context.refreshUsers
  };
};


// Re-export types for backward compatibility
export type { UserProfile as User };
