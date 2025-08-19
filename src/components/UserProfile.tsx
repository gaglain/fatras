import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, User, Edit2 } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useAuth } from '@/hooks/useAuth';
import { useUserManagement } from '@/hooks/useUserManagement';
import { ExtendedUserForm } from '@/components/users/ExtendedUserForm';
import { toast } from 'sonner';

interface UserProfileProps {
  onClose: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
  const { currentUser } = useUser();
  const { user: authUser } = useAuth();
  const { updateUserProfile, loading, fetchUsers } = useUserManagement();
  const [isEditing, setIsEditing] = useState(false);

  // Utiliser currentUser comme source principale, avec authUser comme fallback
  const displayUser = currentUser || {
    id: authUser?.id || '',
    name: authUser?.user_metadata?.first_name || '',
    lastName: authUser?.user_metadata?.last_name || '',
    email: authUser?.email || '',
    role: 'utilisateur' as const,
    isActive: true,
    avatar: authUser?.user_metadata?.avatar_url || ''
  };

  const handleSaveProfile = async (formData: any) => {
    try {
      if (authUser?.id) {
        const success = await updateUserProfile(authUser.id, {
          first_name: formData.firstName,
          last_name: formData.lastName,
          username: formData.username,
          phone: formData.phone,
          role: formData.role,
          address: formData.address,
          city: formData.city,
          function_title: formData.functionTitle,
          show_name: formData.showName,
          birth_date: formData.birthDate,
          birth_place: formData.birthPlace,
          nationality: formData.nationality,
          social_security_number: formData.socialSecurityNumber,
          bank_details: formData.bankDetails,
          contracts_fees: formData.contractsFees,
          availability: formData.availability,
          skills: formData.skills,
          identity_documents: formData.identityDocuments
        });

        if (success) {
          setIsEditing(false);
          toast.success('Profil mis à jour avec succès');
          if (fetchUsers) {
            fetchUsers();
          }
        }
      } else {
        toast.error('Impossible de sauvegarder : utilisateur non connecté');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde du profil');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (!isEditing) {
  return (
    <div 
      className="fixed inset-0 flex items-start justify-center p-4 pt-8 overflow-y-auto bg-black/50 z-[99999] backdrop-blur-sm"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
        <Card className="w-full max-w-md max-h-[calc(100vh-4rem)] overflow-y-auto bg-background border shadow-2xl my-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="flex items-center text-lg">
              <User className="h-5 w-5 mr-2" />
              Profil utilisateur
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            {/* Informations de base */}
            <div className="text-center space-y-4">
              <div className="text-lg font-bold">
                {displayUser.name} {displayUser.lastName}
              </div>
              <div className="text-sm text-muted-foreground">
                {displayUser.email}
              </div>
              {displayUser.role && (
                <div className="text-sm bg-primary/10 text-primary px-2 py-1 rounded inline-block">
                  {displayUser.role}
                </div>
              )}
            </div>

            <div className="space-y-2">
              {currentUser?.phone && (
                <div className="text-sm">
                  <strong>Téléphone:</strong> {currentUser.phone}
                </div>
              )}
              {(currentUser as any)?.address && (
                <div className="text-sm">
                  <strong>Adresse:</strong> {(currentUser as any).address}
                </div>
              )}
              {(currentUser as any)?.city && (
                <div className="text-sm">
                  <strong>Ville:</strong> {(currentUser as any).city}
                </div>
              )}
              {(currentUser as any)?.function_title && (
                <div className="text-sm">
                  <strong>Fonction:</strong> {(currentUser as any).function_title}
                </div>
              )}
              {(currentUser as any)?.show_name && (
                <div className="text-sm">
                  <strong>Nom de scène:</strong> {(currentUser as any).show_name}
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="pt-4 space-y-2">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setIsEditing(true)}
                disabled={loading}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Modifier le profil
              </Button>
              {currentUser?.role === 'super_admin' || currentUser?.role === 'admin' ? (
                <Button 
                  variant="ghost" 
                  className="w-full text-muted-foreground"
                  onClick={() => {
                    onClose();
                    window.location.href = '/user-management';
                  }}
                >
                  Aller à la gestion des utilisateurs
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 flex items-start justify-center p-4 pt-2 overflow-y-auto bg-black/50 z-[99999] backdrop-blur-sm"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <Card className="w-full max-w-6xl max-h-[calc(100vh-2rem)] overflow-y-auto bg-background border shadow-2xl my-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center text-lg">
            <User className="h-5 w-5 mr-2" />
            Modifier mon profil
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <ExtendedUserForm
            initialData={{
              email: displayUser.email || '',
              username: (currentUser as any)?.username || '',
              firstName: displayUser.name || '',
              lastName: displayUser.lastName || '',
              phone: currentUser?.phone || '',
              role: displayUser.role || 'utilisateur',
              address: (currentUser as any)?.address || '',
              city: (currentUser as any)?.city || '',
              functionTitle: (currentUser as any)?.function_title || '',
              showName: (currentUser as any)?.show_name || '',
              birthDate: (currentUser as any)?.birth_date || '',
              birthPlace: (currentUser as any)?.birth_place || '',
              nationality: (currentUser as any)?.nationality || 'FR',
              socialSecurityNumber: (currentUser as any)?.social_security_number || '',
              bankDetails: (currentUser as any)?.bank_details || {
                iban: '',
                bic: '',
                bankName: '',
                accountHolder: ''
              },
              contractsFees: (currentUser as any)?.contracts_fees || [],
              availability: (currentUser as any)?.availability || {
                timeZone: 'Europe/Paris',
                workingHours: { start: '09:00', end: '18:00' },
                workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
                unavailableDates: []
              },
              skills: (currentUser as any)?.skills || [],
              identityDocuments: (currentUser as any)?.identity_documents || []
            }}
            onSave={handleSaveProfile}
            onCancel={handleCancel}
            isEdit={true}
          />
        </CardContent>
      </Card>
    </div>
  );
};