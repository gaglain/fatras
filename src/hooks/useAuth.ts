/**
 * useAuth Hook
 * Re-exports auth functionality from UnifiedAuthContext for backward compatibility
 */

import { useAuthContext } from '@/contexts/UnifiedAuthContext';

export const useAuth = () => {
  const { user, session, loading, signIn, signUp, signOut } = useAuthContext();
  
  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user
  };
};
