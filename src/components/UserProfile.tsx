
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, User } from 'lucide-react';

interface UserProfileProps {
  onClose: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-96 max-w-[90vw]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Profil utilisateur
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Fonctionnalité en cours de développement.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
