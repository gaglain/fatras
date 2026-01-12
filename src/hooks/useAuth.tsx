import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    logger.log('🔐 useAuth - Setting up auth state listener...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        logger.log('🔐 Auth state changed:', event, session?.user?.email || 'No user');
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      logger.log('🔐 Initial session:', session?.user?.email || 'No session');
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      logger.log('🔐 Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    logger.log('🔑 Attempting sign in for:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (data.user && !error) {
      logger.log('✅ Sign in successful');
    } else if (error) {
      logger.error('❌ Sign in error:', error);
    }
    
    return { data, error };
  };

  const signUp = async (email: string, password: string, metadata?: Record<string, unknown>) => {
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

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };
};
