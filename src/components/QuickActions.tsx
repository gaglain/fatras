import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

export const QuickActions: React.FC = () => {
  const { signOut } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const isMobile = useIsMobile();

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) throw error;
      toast.success('Déconnexion réussie');
    } catch (error: any) {
      console.error('❌ Sign out error:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };

  if (!isMobile) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={handleSignOut}
          variant="outline"
          size="sm"
          className="bg-background shadow-lg border"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Déconnexion
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Bouton flottant mobile */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          size="icon"
          className="rounded-full shadow-lg h-12 w-12"
        >
          {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Menu contextuel mobile */}
      {showMobileMenu && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setShowMobileMenu(false)}
          />
          <div className="fixed bottom-20 right-4 z-50 bg-background border rounded-lg shadow-lg p-3 min-w-[200px]">
            <div className="space-y-2">
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                className="w-full justify-start"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Se déconnecter
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
};