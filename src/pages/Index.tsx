
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from '@/components/auth/LoginForm';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center transition-colors duration-300" style={{
      background: 'var(--custom-background, #ffffff)',
      color: 'var(--custom-text, #18181b)'
    }}>
      <div className="w-full max-w-md p-6">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              Fatras Booking
            </CardTitle>
            <CardDescription>
              Système de gestion pour bookers professionnels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
            <div className="mt-6 text-center">
              <Button 
                variant="outline" 
                onClick={() => navigate('/front')}
                className="w-full back-office-button"
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
