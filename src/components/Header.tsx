import React, { useState } from 'react';
import { Bell, Search, Plus, Edit, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { NotificationPopup } from './NotificationPopup';
import { UserProfile } from './UserProfile';
import { useUser } from '@/contexts/UserContext';

interface HeaderProps {
  logo?: string | null;
  companyName?: string;
  notificationCount?: number;
}

// Sample notifications
const sampleNotifications = [
  {
    id: '1',
    type: 'email' as const,
    title: 'Nouveau contrat reçu',
    message: 'Un nouveau contrat pour le Festival d\'Été a été reçu et nécessite votre attention.',
    timestamp: '2024-06-15T10:30:00Z',
    isRead: false,
    priority: 'high' as const
  },
  {
    id: '2',
    type: 'task' as const,
    title: 'Tâche en retard',
    message: 'La tâche "Préparer le matériel son" était due hier.',
    timestamp: '2024-06-14T16:00:00Z',
    isRead: false,
    priority: 'medium' as const
  },
  {
    id: '3',
    type: 'message' as const,
    title: 'Nouveau message dans #général',
    message: 'Alice Johnson a posté un message dans le canal général.',
    timestamp: '2024-06-15T09:15:00Z',
    isRead: true,
    priority: 'low' as const
  }
];

export const Header: React.FC<HeaderProps> = ({ 
  logo, 
  companyName = 'ShowManager Pro'
}) => {
  const { currentUser } = useUser();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState(sampleNotifications);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedCompanyName, setEditedCompanyName] = useState(companyName);
  const [currentLogo, setCurrentLogo] = useState(logo);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoUrl = e.target?.result as string;
        setCurrentLogo(logoUrl);
        console.log('Logo mis à jour avec succès');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCompanyName = () => {
    setIsEditingName(false);
    console.log('Nom de l\'entreprise mis à jour:', editedCompanyName);
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 group">
              {currentLogo ? (
                <div className="relative">
                  <img src={currentLogo} alt="Logo" className="h-8 w-8 object-contain rounded" />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      id="logo-upload"
                    />
                    <Upload className="h-3 w-3 text-white" />
                  </div>
                </div>
              ) : (
                <div className="relative group">
                  <div className="h-8 w-8 bg-purple-100 border-2 border-dashed border-purple-300 rounded flex items-center justify-center cursor-pointer hover:bg-purple-200 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      id="logo-upload-empty"
                    />
                    <Upload className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
              )}
              
              {isEditingName ? (
                <div className="flex items-center space-x-2">
                  <Input
                    value={editedCompanyName}
                    onChange={(e) => setEditedCompanyName(e.target.value)}
                    className="h-8 text-lg font-bold"
                    onKeyPress={(e) => e.key === 'Enter' && handleSaveCompanyName()}
                  />
                  <Button
                    size="sm"
                    onClick={handleSaveCompanyName}
                    className="h-8 bg-purple-600 hover:bg-purple-700"
                  >
                    Sauvegarder
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2 group cursor-pointer" onClick={() => setIsEditingName(true)}>
                  <h1 className="text-xl font-bold text-gray-900">{editedCompanyName}</h1>
                  <Edit className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )}
            </div>
            
            <div className="relative max-w-md ml-8">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher contacts, événements, tâches..."
                className="pl-10 w-96"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Ajout Rapide
            </Button>
            
            <div className="relative">
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <>
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                    <div className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
                  </>
                )}
              </Button>
              
              <NotificationPopup
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
                notifications={notifications}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
              />
            </div>
            
            <div 
              className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-700 transition-colors"
              onClick={() => setShowProfile(true)}
            >
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt="Avatar" className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <span className="text-white text-sm font-medium">
                  {currentUser?.name.charAt(0) || 'U'}{currentUser?.lastName.charAt(0) || 'U'}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {showProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowProfile(false)}>
          <div className="bg-white rounded-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-semibold">Profil Utilisateur</h2>
              <Button variant="ghost" onClick={() => setShowProfile(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <UserProfile />
          </div>
        </div>
      )}
    </>
  );
};
