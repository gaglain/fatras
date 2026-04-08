import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import {
  BasicInfoSection,
  AvatarSection,
  PersonalInfoSection,
  AddressSection,
  ProfessionalSection,
  BankDetailsSection,
  AvailabilitySection,
  SkillsSection,
  IdentityDocumentsSection,
} from './UserFormSections';

interface ExtendedUserFormData {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  avatarUrl: string;
  birthDate: string;
  birthPlace: string;
  nationality: string;
  socialSecurityNumber: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  functionTitle: string;
  showName: string;
  gusoId: string;
  entertainmentLeaveNumber: string;
  taxReduction: boolean;
  bankDetails: { iban: string; bic: string; bankName: string; accountHolder: string };
  contractsFees: Array<{ id: string; contractType: string; amount: number; currency: string; description: string; date: string }>;
  availability: { timeZone: string; workingHours: { start: string; end: string }; workingDays: string[]; unavailableDates: string[] };
  skills: string[];
  identityDocuments: Array<{ id: string; type: string; number: string; issueDate: string; expiryDate: string; issuer: string }>;
}

interface ExtendedUserFormProps {
  initialData?: Partial<ExtendedUserFormData>;
  onSave: (data: ExtendedUserFormData) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
}

export const ExtendedUserForm: React.FC<ExtendedUserFormProps> = ({
  initialData = {},
  onSave,
  onCancel,
  isEdit = false
}) => {
  const [formData, setFormData] = useState<ExtendedUserFormData>({
    email: '', username: '', firstName: '', lastName: '', phone: '', role: 'utilisateur', avatarUrl: '',
    birthDate: '', birthPlace: '', nationality: 'FR', socialSecurityNumber: '',
    address: '', city: '', postalCode: '', country: 'France',
    functionTitle: '', showName: '', gusoId: '', entertainmentLeaveNumber: '', taxReduction: false,
    bankDetails: { iban: '', bic: '', bankName: '', accountHolder: '' },
    contractsFees: [],
    availability: { timeZone: 'Europe/Paris', workingHours: { start: '09:00', end: '18:00' }, workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], unavailableDates: [] },
    skills: [],
    identityDocuments: [],
    ...initialData
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.firstName || !formData.lastName) return;
    setLoading(true);
    try {
      await onSave(formData);
    } catch (error: unknown) {
      console.error('Erreur sauvegarde formulaire:', error);
      const errorMessage = error instanceof Error ? error.message : '';
      if (errorMessage.includes('foreign key constraint')) {
        throw new Error('Erreur de création utilisateur. Veuillez réessayer ou contacter l\'administrateur.');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof ExtendedUserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const sectionProps = { formData, updateFormData, setFormData, isEdit };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <BasicInfoSection {...sectionProps} />
      <AvatarSection {...sectionProps} />
      <PersonalInfoSection {...sectionProps} />
      <AddressSection {...sectionProps} />
      <ProfessionalSection {...sectionProps} />
      <BankDetailsSection {...sectionProps} />
      <AvailabilitySection {...sectionProps} />
      <SkillsSection {...sectionProps} />
      <IdentityDocumentsSection />

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
        <Button type="submit" disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      </div>
    </form>
  );
};
