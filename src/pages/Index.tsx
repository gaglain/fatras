
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();
  console.log('🏠 Index - Rendering Index page...');

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-8" 
      style={{
        backgroundColor: 'hsl(210 40% 98%)',
        color: 'hsl(240 10% 3.9%)'
      }}
    >
      <div className="text-center space-y-6 max-w-md">
        <h1 
          className="text-4xl font-bold"
          style={{ color: 'hsl(240 10% 3.9%)' }}
        >
          Fatras Booking
        </h1>
        
        <p 
          className="text-xl"
          style={{ color: 'hsl(240 3.8% 46.1%)' }}
        >
          Système de gestion pour bookers professionnels
        </p>
        
        <div className="space-y-4">
          <Button 
            onClick={() => navigate('/dashboard')}
            className="w-full"
            style={{
              backgroundColor: 'hsl(240 5.9% 10%)',
              color: 'hsl(0 0% 98%)'
            }}
          >
            Accéder au Dashboard
          </Button>
          
          <Button 
            onClick={() => navigate('/front')}
            variant="outline"
            className="w-full"
            style={{
              borderColor: 'hsl(240 5.9% 10%)',
              color: 'hsl(240 5.9% 10%)'
            }}
          >
            Voir le site public
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
