import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDomainRouting } from '@/hooks/useDomainRouting';
import { FrontHome } from './FrontHome';

const Index = () => {
  const { user, loading } = useAuth();
  const { type: domainType, isPublicSite, isBookingSite } = useDomainRouting();

  console.log('🏠 Index - Domain type:', domainType, 'User:', user?.email || 'none');

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  // fatras.net → Show public site directly at /
  if (isPublicSite) {
    console.log('🌍 Rendering public site at root');
    return <FrontHome />;
  }

  // booking.fatras.net → Redirect to auth or dashboard
  if (isBookingSite) {
    if (user) {
      console.log('🎫 Booking domain with user → dashboard');
      return <Navigate to="/dashboard" replace />;
    }
    console.log('🎫 Booking domain without user → auth');
    return <Navigate to="/auth" replace />;
  }

  // Preview mode (lovable.app, localhost) → current behavior
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/front" replace />;
};

export default Index;
