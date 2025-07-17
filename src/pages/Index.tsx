
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from '@/components/auth/LoginForm';

const Index = () => {
  console.log('🏠 Index - Rendering Index page...');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              Fatras Booking
            </CardTitle>
            <CardDescription className="text-gray-600 text-lg">
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
