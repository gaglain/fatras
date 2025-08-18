
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from '@/components/auth/LoginForm';

const Index = () => {
  console.log('🏠 Index - Rendering Index page...');

  return (
    <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'hsl(210 40% 98%)'}}>
      <div className="w-full max-w-md p-4">
        <Card className="shadow-xl border-border" style={{backgroundColor: 'hsl(0 0% 100%)'}}>
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl font-bold mb-2" style={{color: 'hsl(240 10% 3.9%)'}}>
              Fatras Booking
            </CardTitle>
            <CardDescription className="text-lg" style={{color: 'hsl(240 3.8% 46.1%)'}}>
              Système de gestion pour bookers professionnels
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
