import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Mail, 
  Phone,
  User,
  Save
} from 'lucide-react';
import { toast } from 'sonner';
import { useUser, UserRole } from '@/contexts/UserContext';
import { useEmailSender } from '@/hooks/useEmailSender';
import { useUserManagement } from '@/hooks/useUserManagement';
import { ExtendedUserForm } from '@/components/users/ExtendedUserForm';
import { TestUserCreator } from '@/components/TestUserCreator';

export const UserManagement: React.FC = () => {
  console.log('📊 UserManagement component rendering...');
  
  // Protection contre l'erreur de contexte
  let currentUser = null;
  try {
    const userContext = useUser();
    currentUser = userContext?.currentUser;
  } catch (error) {
    console.warn('⚠️ UserContext not available yet in UserManagement, using fallback');
    currentUser = null;
  }
  
  const { sendUserWelcomeEmail, sending } = useEmailSender();
  const { users, loading, fetchUsers, createUser, updateUserProfile, deactivateUser } = useUserManagement();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const roleLabels = {
    super_admin: 'Super Admin',
    admin: 'Admin', 
    manager: 'Manager / Booker',
    artiste: 'Artiste',
    utilisateur: 'Utilisateur'
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-orange-100 text-orange-800';
      case 'artiste': return 'bg-green-100 text-green-800';
      case 'utilisateur': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const generateTempPassword = () => {
    return Math.random().toString(36).slice(-8);
  };

  const handleSaveUser = async (formData: any) => {
    if (!formData.email || !formData.firstName || !formData.lastName) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Veuillez entrer une adresse email valide');
      return;
    }

    try {
      if (selectedUser) {
        // Modification
        await updateUserProfile(selectedUser.user_id, {
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
        toast.success('Utilisateur modifié avec succès');
      } else {
        // Création avec informations étendues
        const tempPassword = generateTempPassword();
        
        const success = await createUser({
          email: formData.email,
          password: tempPassword,
          first_name: formData.firstName,
          last_name: formData.lastName,
          username: formData.username || formData.email.split('@')[0],
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
          // Envoyer l'email de bienvenue
          try {
            await sendUserWelcomeEmail(
              formData.email,
              `${formData.firstName} ${formData.lastName}`,
              tempPassword
            );
            toast.success('Utilisateur créé et email de bienvenue envoyé !');
          } catch (emailError) {
            console.error('Erreur envoi email:', emailError);
            toast.success('Utilisateur créé (erreur envoi email)');
          }
        }
      }

      resetForm();
      fetchUsers(); // Recharger la liste
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const resetForm = () => {
    setIsFormOpen(false);
    setSelectedUser(null);
  };

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleDelete = async (userId: string) => {
    if (userId === currentUser?.id) {
      toast.error('Vous ne pouvez pas supprimer votre propre compte');
      return;
    }
    
    if (confirm('Êtes-vous sûr de vouloir désactiver cet utilisateur ?')) {
      await deactivateUser(userId);
    }
  };

  const filteredUsers = users.filter(user => 
    user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Charger les utilisateurs au montage du composant - avec protection
  React.useEffect(() => {
    if (fetchUsers && typeof fetchUsers === 'function') {
      fetchUsers();
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center">
            <Users className="h-6 w-6 sm:h-8 sm:w-8 mr-3 text-primary" />
            Gestion des Utilisateurs
          </h1>
          <p className="text-muted-foreground mt-2">
            Gérez les utilisateurs et leurs permissions
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Nouvel </span>Utilisateur
        </Button>
      </div>

      {/* Barre de recherche */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <Input
            placeholder="Rechercher un utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {/* Créateur d'utilisateur test */}
      <div className="mb-6">
        <TestUserCreator />
      </div>

      {/* Liste des utilisateurs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-semibold truncate">
                      {user.first_name} {user.last_name}
                    </h3>
                    <p className="text-muted-foreground text-xs sm:text-sm truncate">@{user.username || user.email?.split('@')[0]}</p>
                  </div>
                </div>
                <Badge className={getRoleColor(user.role)} variant="secondary">
                  <span className="hidden sm:inline">{roleLabels[user.role as UserRole] || user.role}</span>
                  <span className="sm:hidden">{(roleLabels[user.role as UserRole] || user.role).substring(0, 3)}</span>
                </Badge>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                    <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{user.phone}</span>
                  </div>
                )}
                {user.function_title && (
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    <strong>Fonction:</strong> <span className="truncate">{user.function_title}</span>
                  </div>
                )}
                {user.show_name && (
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    <strong>Nom de scène:</strong> <span className="truncate">{user.show_name}</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(user)} className="flex-1">
                  <Edit className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Modifier</span>
                  <span className="sm:hidden">Edit</span>
                </Button>
                {user.user_id !== currentUser?.id && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDelete(user.user_id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog de création/modification avec formulaire étendu */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto mx-2">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {selectedUser ? 'Modifier l\'utilisateur' : 'Créer un nouvel utilisateur'}
            </DialogTitle>
          </DialogHeader>

          <ExtendedUserForm
            initialData={selectedUser ? {
              email: selectedUser.email || '',
              username: selectedUser.username || '',
              firstName: selectedUser.first_name || '',
              lastName: selectedUser.last_name || '',
              phone: selectedUser.phone || '',
              role: selectedUser.role || 'utilisateur',
              address: selectedUser.address || '',
              city: selectedUser.city || '',
              functionTitle: selectedUser.function_title || '',
              showName: selectedUser.show_name || '',
              birthDate: selectedUser.birth_date || '',
              birthPlace: selectedUser.birth_place || '',
              nationality: selectedUser.nationality || 'FR',
              socialSecurityNumber: selectedUser.social_security_number || '',
              bankDetails: selectedUser.bank_details || {
                iban: '',
                bic: '',
                bankName: '',
                accountHolder: ''
              },
              contractsFees: selectedUser.contracts_fees || [],
              availability: selectedUser.availability || {
                timeZone: 'Europe/Paris',
                workingHours: { start: '09:00', end: '18:00' },
                workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
                unavailableDates: []
              },
              skills: selectedUser.skills || [],
              identityDocuments: selectedUser.identity_documents || []
            } : undefined}
            onSave={handleSaveUser}
            onCancel={resetForm}
            isEdit={!!selectedUser}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};