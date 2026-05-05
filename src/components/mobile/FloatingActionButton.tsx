import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Calendar, 
  ContactRound, 
  Plus,
  X,
  PhoneCall,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PhoneLookupDialog } from './PhoneLookupDialog';

interface FABAction {
  icon: React.ElementType;
  label: string;
  action: 'navigate' | 'phone-lookup';
  path?: string;
  color: string;
}

const actions: FABAction[] = [
  { icon: PhoneCall, label: 'Identifier appel', action: 'phone-lookup', color: 'bg-primary' },
  { icon: Home, label: 'Dashboard', action: 'navigate', path: '/dashboard', color: 'bg-secondary' },
  { icon: Calendar, label: 'Événements', action: 'navigate', path: '/events', color: 'bg-accent' },
  { icon: ContactRound, label: 'Contacts', action: 'navigate', path: '/contacts', color: 'bg-muted' },
];

export const FloatingActionButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [phoneLookupOpen, setPhoneLookupOpen] = useState(false);
  const navigate = useNavigate();

  const handleActionClick = (action: FABAction) => {
    if (action.action === 'phone-lookup') {
      setPhoneLookupOpen(true);
    } else if (action.path) {
      navigate(action.path);
    }
    setIsOpen(false);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Radial Menu Items */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          {actions.map((action, index) => {
            const angle = (index * 360) / actions.length - 90;
            const radius = 120;
            const x = Math.cos((angle * Math.PI) / 180) * radius;
            const y = Math.sin((angle * Math.PI) / 180) * radius;
            
            return (
              <button
                key={action.path}
                onClick={() => handleActionClick(action.path)}
                className={cn(
                  "absolute pointer-events-auto",
                  "w-14 h-14 rounded-full shadow-lg",
                  "flex flex-col items-center justify-center",
                  "text-primary-foreground transition-all duration-300",
                  "hover:scale-110 active:scale-95",
                  action.color,
                  "animate-scale-in"
                )}
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <action.icon className="h-5 w-5" />
                <span className="text-[10px] mt-1 font-medium">{action.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main FAB Button */}
      <button
        onClick={toggleMenu}
        className={cn(
          "fixed bottom-6 right-6 z-50",
          "w-16 h-16 rounded-full",
          "bg-primary text-primary-foreground",
          "shadow-lg hover:shadow-xl",
          "flex items-center justify-center",
          "transition-all duration-300",
          "hover:scale-110 active:scale-95",
          isOpen && "rotate-45"
        )}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Plus className="h-6 w-6" />
        )}
      </button>
    </>
  );
};
