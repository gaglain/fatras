
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  console.log('🔐 ProtectedRoute - Checking authentication...');
  
  const { user, loading } = useAuth();

  if (loading) {
    console.log('⏳ ProtectedRoute - Loading authentication state...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    console.log('❌ ProtectedRoute - No user found, redirecting to home...');
    return <Navigate to="/" replace />;
  }

  console.log('✅ ProtectedRoute - User authenticated, rendering children...');
  return <>{children}</>;
};
