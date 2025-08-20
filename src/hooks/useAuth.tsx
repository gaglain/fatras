
import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';

export const useAuth = () => {
  console.log('🔐 useAuth - Hook called...');
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  console.log('🔐 useAuth - About to call useNavigate...');
  const navigate = useNavigate();
  console.log('🔐 useAuth - About to call useLocation...');
  const location = useLocation();
  
  console.log('🔐 useAuth - Hooks initialized, setting up effects...');

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('📱 Initial session:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Redirection automatique SEULEMENT depuis la page d'accueil ou admin
      if (session?.user && (location.pathname === '/' || location.pathname === '/admin')) {
        console.log('🔄 Auto-redirect to dashboard from:', location.pathname);
        navigate('/dashboard');
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Redirection après connexion SEULEMENT depuis certaines pages
        if (event === 'SIGNED_IN' && session?.user) {
          const currentPath = window.location.pathname;
          if (currentPath === '/' || currentPath === '/admin') {
            console.log('✅ User signed in, redirecting to dashboard from:', currentPath);
            navigate('/dashboard');
          }
        }
        
        // Redirection après déconnexion
        if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out, redirecting to login');
          navigate('/');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  const signIn = async (email: string, password: string) => {
    console.log('🔑 Attempting sign in for:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (data.user && !error) {
      console.log('✅ Sign in successful');
    } else if (error) {
      console.error('❌ Sign in error:', error);
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
    console.log('👋 Signing out...');
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
