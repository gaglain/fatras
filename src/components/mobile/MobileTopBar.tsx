import React, { useState } from 'react';
import { Menu, X, Settings, Bell, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const MobileTopBar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Déconnexion réussie');
      navigate('/auth');
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const secondaryItems = [
    { icon: Settings, label: 'Préférences', path: '/preferences' },
    { icon: Bell, label: 'Notifications', action: () => console.log('Notifications') },
  ];

  return (
    <>
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-background border-b z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <img 
            src="/logo.svg" 
            alt="Logo" 
            className="h-6 w-6"
            onError={(e) => e.currentTarget.style.display = 'none'}
          />
          <h1 className="font-semibold text-sm">Fatras Booking</h1>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      {/* Slide-in Menu */}
      {menuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 mt-14 animate-fade-in"
            onClick={() => setMenuOpen(false)}
          />
          
          <div className="fixed top-14 right-0 w-64 h-[calc(100vh-3.5rem)] bg-background border-l z-50 animate-slide-in-right">
            <div className="p-4 space-y-2">
              {secondaryItems.map((item) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    if (item.path) navigate(item.path);
                    if (item.action) item.action();
                    setMenuOpen(false);
                  }}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              ))}
              
              <div className="pt-4 border-t">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
