
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from '@/components/auth/LoginForm';

const Index = () => {
  console.log('🏠 Index - Rendering Index page...');
  const navigate = useNavigate();

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
            <div className="space-y-4">
              <p className="text-center text-gray-600">
                Connectez-vous pour accéder à votre espace de travail
              </p>
              <Button 
                variant="default" 
                onClick={() => {
                  console.log('🔄 Navigating to dashboard...');
                  navigate('/dashboard');
                }}
                className="w-full"
                size="lg"
              >
                Accéder au Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
