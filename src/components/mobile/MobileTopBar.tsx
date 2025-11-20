import React, { useState } from 'react';
import { Menu, X, LogOut, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { navigationData } from '@/data/navigationData';
import { cn } from '@/lib/utils';

export const MobileTopBar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
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

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionName)
        ? prev.filter(name => name !== sectionName)
        : [...prev, sectionName]
    );
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMenuOpen(false);
  };

  return (
    <>
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-background border-b z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <img 
            src="/lovable-uploads/0dc85f93-e1c6-4afe-9b81-8b29ee2a3dcf.png" 
            alt="Logo" 
            className="h-6 w-6"
            onError={(e) => e.currentTarget.style.display = 'none'}
          />
          <h1 className="font-semibold text-sm">Fatras</h1>
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
          
          <div className="fixed top-14 right-0 w-80 h-[calc(100vh-3.5rem)] bg-background border-l z-50 animate-slide-in-right overflow-y-auto">
            <div className="p-4">
              <div className="space-y-1">
                {navigationData.filter(item => item.visible !== false).map((item) => (
                  <div key={item.name}>
                    {item.children && item.children.length > 0 ? (
                      <>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-between",
                            isActive(item.href) && "bg-accent"
                          )}
                          onClick={() => toggleSection(item.name)}
                        >
                          <div className="flex items-center">
                            <item.icon className="mr-2 h-4 w-4" />
                            {item.name}
                          </div>
                          <ChevronRight 
                            className={cn(
                              "h-4 w-4 transition-transform",
                              expandedSections.includes(item.name) && "rotate-90"
                            )} 
                          />
                        </Button>
                        {expandedSections.includes(item.name) && (
                          <div className="ml-6 mt-1 space-y-1">
                            {item.children.map((child) => (
                              <Button
                                key={child.href}
                                variant="ghost"
                                size="sm"
                                className={cn(
                                  "w-full justify-start",
                                  isActive(child.href) && "bg-accent"
                                )}
                                onClick={() => handleNavigation(child.href)}
                              >
                                <child.icon className="mr-2 h-3 w-3" />
                                {child.name}
                              </Button>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start",
                          isActive(item.href) && "bg-accent"
                        )}
                        onClick={() => handleNavigation(item.href)}
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.name}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="pt-4 border-t mt-4">
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
