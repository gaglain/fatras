
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from '@/components/auth/LoginForm';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md p-6">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800">
              Fatras Booking
            </CardTitle>
            <CardDescription className="text-gray-600">
              Système de gestion pour bookers professionnels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
            <div className="mt-6 text-center">
              <Button 
                variant="outline" 
                onClick={() => navigate('/front')}
                className="w-full"
              >
                Voir le site public
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export { Index };
export default Index;
