
import React from 'react';
import { Button } from '@/components/ui/button';

const Index = () => {
  console.log('🏠 Index - Loading...');

  const handleLogin = () => {
    console.log('🔄 Redirecting to auth...');
    window.location.href = '/auth';
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-50">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-4xl font-bold text-slate-900">
          Fatras Booking
        </h1>
        
        <p className="text-xl text-slate-600">
          Système de gestion pour bookers professionnels
        </p>
        
        <div className="space-y-4">
          <Button 
            onClick={handleLogin}
            className="w-full"
          >
            Se connecter
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
