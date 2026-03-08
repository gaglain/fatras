import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Mail, 
  Phone,
  User,
  Save,
  FileDown,
  Link2
} from 'lucide-react';
import { toast } from 'sonner';
import { useUser, UserRole } from '@/contexts/UserContext';
import { useEmailSender } from '@/hooks/useEmailSender';
import { useUserManagement } from '@/hooks/useUserManagement';
import { usePermissions } from '@/hooks/usePermissions';
import { ExtendedUserForm } from '@/components/users/ExtendedUserForm';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';


export const UserManagement: React.FC = () => {
  // Protection contre l'erreur de contexte
  let currentUser = null;
  try {
    const userContext = useUser();
    currentUser = userContext?.currentUser;
  } catch {
    currentUser = null;
  }
  
  const { sendUserWelcomeEmail, sending } = useEmailSender();
  const { users, loading, fetchUsers, createUser, updateUserProfile, deactivateUser } = useUserManagement();
  const { hasPermission, isSuperAdmin, loading: permissionsLoading } = usePermissions();
  const confirmAction = useConfirm();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const exportSingleUserToPDF = (user: any) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Fiche Utilisateur', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // User name as subtitle
    doc.setFontSize(14);
    doc.text(`${user.first_name || ''} ${user.last_name || ''}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // Date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Exporté le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // User details
    doc.setFontSize(11);
    const details = [
      { label: 'Email', value: user.email || 'Non renseigné' },
      { label: 'Nom d\'utilisateur', value: user.username || 'Non renseigné' },
      { label: 'Rôle', value: roleLabels[user.role as UserRole] || user.role || 'Non renseigné' },
      { label: 'Téléphone', value: user.phone || 'Non renseigné' },
      { label: 'Fonction', value: user.function_title || 'Non renseigné' },
      { label: 'Nom de scène', value: user.show_name || 'Non renseigné' },
      { label: 'Adresse', value: user.address || 'Non renseigné' },
      { label: 'Ville', value: user.city || 'Non renseigné' },
      { label: 'Date de naissance', value: user.birth_date || 'Non renseigné' },
      { label: 'Lieu de naissance', value: user.birth_place || 'Non renseigné' },
      { label: 'Nationalité', value: user.nationality || 'Non renseigné' },
      { label: 'N° Sécurité Sociale', value: user.social_security_number || 'Non renseigné' },
    ];

    details.forEach(({ label, value }) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, 20, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 80, yPosition);
      yPosition += 8;
    });

    // Bank details if available
    if (user.bank_details) {
      yPosition += 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Coordonnées bancaires', 20, yPosition);
      yPosition += 8;
      doc.setFontSize(11);

      const bankInfo = [
        { label: 'IBAN', value: user.bank_details.iban || 'Non renseigné' },
        { label: 'BIC', value: user.bank_details.bic || 'Non renseigné' },
        { label: 'Banque', value: user.bank_details.bankName || 'Non renseigné' },
        { label: 'Titulaire', value: user.bank_details.accountHolder || 'Non renseigné' },
      ];

      bankInfo.forEach(({ label, value }) => {
        doc.setFont('helvetica', 'bold');
        doc.text(`${label}:`, 25, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(value, 80, yPosition);
        yPosition += 7;
      });
    }

    // Skills if available
    if (user.skills && user.skills.length > 0) {
      yPosition += 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Compétences', 20, yPosition);
      yPosition += 8;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(user.skills.join(', '), 25, yPosition);
    }

    // Footer
    doc.setFontSize(8);
    doc.text('Page 1 / 1', pageWidth / 2, 290, { align: 'center' });

    const fileName = `utilisateur_${(user.first_name || 'user').toLowerCase()}_${(user.last_name || '').toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    toast.success('Fiche utilisateur exportée');
  };

  const exportUsersToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Liste des Utilisateurs', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Exporté le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Users
    filteredUsers.forEach((user, index) => {
      // Check if we need a new page
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      // User header
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${user.first_name || ''} ${user.last_name || ''}`, 15, yPosition);
      yPosition += 6;

      // User details
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const details = [
        `Email: ${user.email || 'Non renseigné'}`,
        `Rôle: ${roleLabels[user.role as UserRole] || user.role || 'Non renseigné'}`,
        `Téléphone: ${user.phone || 'Non renseigné'}`,
        `Fonction: ${user.function_title || 'Non renseigné'}`,
        `Nom de scène: ${user.show_name || 'Non renseigné'}`,
        `Adresse: ${user.address || 'Non renseigné'}`,
        `Ville: ${user.city || 'Non renseigné'}`,
        `Nationalité: ${user.nationality || 'Non renseigné'}`,
      ];

      details.forEach(detail => {
        if (yPosition > 280) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(detail, 20, yPosition);
        yPosition += 5;
      });

      yPosition += 8; // Space between users
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Page ${i} / ${pageCount}`, pageWidth / 2, 290, { align: 'center' });
    }

    doc.save(`utilisateurs_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Export PDF généré avec succès');
  };

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
          } catch {
            toast.success('Utilisateur créé (erreur envoi email)');
          }
        }
      }

      resetForm();
      fetchUsers();
    } catch {
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

  const handleResetPassword = async (email: string) => {
    if (!email) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('send-password-reset', {
        body: { email }
      });

      if (error) throw error;

      if (data?.success === false) {
        toast.error(data.error || 'Utilisateur non trouvé');
        return;
      }

      if (data?.resetLink) {
        await navigator.clipboard.writeText(data.resetLink);
        toast.success('Lien de réinitialisation copié dans le presse-papiers !');
      } else {
        toast.success('Email de réinitialisation envoyé !');
      }
    } catch {
      toast.error('Erreur lors de la réinitialisation du mot de passe');
    }
  };

  const handleSendMagicLink = async (email: string, userName: string) => {
    if (!email) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('send-magic-link', {
        body: { email, userName }
      });

      if (error) throw error;

      if (data?.success === false) {
        toast.error(data.error || 'Utilisateur non trouvé');
        return;
      }

      if (data?.magicLink) {
        await navigator.clipboard.writeText(data.magicLink);
        toast.success('Lien de connexion copié dans le presse-papiers !');
      } else {
        toast.success('Lien de connexion envoyé par email !');
      }
    } catch {
      toast.error('Erreur lors de l\'envoi du lien de connexion');
    }
  };

  const handleDelete = async (userId: string) => {
    if (userId === currentUser?.id) {
      toast.error('Vous ne pouvez pas supprimer votre propre compte');
      return;
    }
    
    const ok = await confirmAction({ title: 'Désactiver l\'utilisateur', description: 'Êtes-vous sûr de vouloir désactiver cet utilisateur ?', variant: 'destructive' });
    if (ok) {
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
        <div className="flex gap-2 w-full sm:w-auto">
          {!permissionsLoading && isSuperAdmin() && (
            <Button variant="outline" onClick={exportUsersToPDF} className="flex-1 sm:flex-none">
              <FileDown className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Export </span>PDF
            </Button>
          )}
          {!permissionsLoading && hasPermission('users', 'create') && (
            <Button onClick={() => setIsFormOpen(true)} className="flex-1 sm:flex-none">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Nouvel </span>Utilisateur
            </Button>
          )}
        </div>
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

      {/* Section supprimée - Créateur d'utilisateur test retiré */}

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
                {!permissionsLoading && isSuperAdmin() && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => exportSingleUserToPDF(user)}
                    title="Exporter en PDF"
                  >
                    <FileDown className="h-3 w-3" />
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleSendMagicLink(user.email, `${user.first_name || ''} ${user.last_name || ''}`)}
                  title="Envoyer un lien de connexion"
                  className="text-primary"
                >
                  <Link2 className="h-3 w-3" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleResetPassword(user.email)}
                  title="Réinitialiser le mot de passe"
                >
                  <Save className="h-3 w-3" />
                </Button>
                {user.user_id !== currentUser?.id && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDelete(user.user_id || user.id)}
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