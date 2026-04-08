import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AvatarUploader } from '@/components/AvatarUploader';
import { User, Camera, CreditCard, MapPin, Briefcase, Banknote, Calendar, Award, IdCard } from 'lucide-react';

interface SectionProps {
  formData: any;
  updateFormData: (field: string, value: string) => void;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  isEdit?: boolean;
}

export const BasicInfoSection: React.FC<SectionProps> = ({ formData, updateFormData, isEdit }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <User className="h-5 w-5" />
        <span>Informations de base</span>
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">Prénom *</Label>
          <Input id="firstName" value={formData.firstName} onChange={(e) => updateFormData('firstName', e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="lastName">Nom *</Label>
          <Input id="lastName" value={formData.lastName} onChange={(e) => updateFormData('lastName', e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input id="email" type="email" value={formData.email} onChange={(e) => updateFormData('email', e.target.value)} required disabled={isEdit} />
        </div>
        <div>
          <Label htmlFor="username">Nom d'utilisateur</Label>
          <Input id="username" value={formData.username} onChange={(e) => updateFormData('username', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="phone">Téléphone</Label>
          <Input id="phone" value={formData.phone} onChange={(e) => updateFormData('phone', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="role">Rôle</Label>
          <Select value={formData.role} onValueChange={(value) => updateFormData('role', value)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="super_admin">Super Admin</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Manager / Booker</SelectItem>
              <SelectItem value="artiste">Artiste</SelectItem>
              <SelectItem value="utilisateur">Utilisateur</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const AvatarSection: React.FC<SectionProps> = ({ formData, updateFormData }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <Camera className="h-5 w-5" />
        <span>Photo de profil</span>
      </CardTitle>
    </CardHeader>
    <CardContent className="flex justify-center py-6">
      <AvatarUploader
        currentAvatarUrl={formData.avatarUrl}
        userInitials={`${formData.firstName?.charAt(0) || 'U'}${formData.lastName?.charAt(0) || ''}`}
        onAvatarChange={(url) => updateFormData('avatarUrl', url)}
        size="xl"
      />
    </CardContent>
  </Card>
);

export const PersonalInfoSection: React.FC<SectionProps> = ({ formData, updateFormData }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <CreditCard className="h-5 w-5" />
        <span>Informations personnelles</span>
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="birthDate">Date de naissance</Label>
          <Input id="birthDate" type="date" value={formData.birthDate} onChange={(e) => updateFormData('birthDate', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="birthPlace">Lieu de naissance</Label>
          <Input id="birthPlace" value={formData.birthPlace} onChange={(e) => updateFormData('birthPlace', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="nationality">Nationalité</Label>
          <Select value={formData.nationality} onValueChange={(value) => updateFormData('nationality', value)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="FR">Française</SelectItem>
              <SelectItem value="BE">Belge</SelectItem>
              <SelectItem value="CH">Suisse</SelectItem>
              <SelectItem value="CA">Canadienne</SelectItem>
              <SelectItem value="OTHER">Autre</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="socialSecurityNumber">Numéro de sécurité sociale</Label>
          <Input id="socialSecurityNumber" value={formData.socialSecurityNumber} onChange={(e) => updateFormData('socialSecurityNumber', e.target.value)} placeholder="1 23 45 67 890 123 45" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export const AddressSection: React.FC<SectionProps> = ({ formData, updateFormData }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <MapPin className="h-5 w-5" />
        <span>Adresse</span>
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <Label htmlFor="address">Adresse</Label>
        <Input id="address" value={formData.address} onChange={(e) => updateFormData('address', e.target.value)} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="city">Ville</Label>
          <Input id="city" value={formData.city} onChange={(e) => updateFormData('city', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="postalCode">Code postal</Label>
          <Input id="postalCode" value={formData.postalCode} onChange={(e) => updateFormData('postalCode', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="country">Pays</Label>
          <Input id="country" value={formData.country} onChange={(e) => updateFormData('country', e.target.value)} />
        </div>
      </div>
    </CardContent>
  </Card>
);

export const ProfessionalSection: React.FC<SectionProps> = ({ formData, updateFormData, setFormData }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <Briefcase className="h-5 w-5" />
        <span>Informations professionnelles</span>
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="functionTitle">Fonction/Titre</Label>
          <Input id="functionTitle" value={formData.functionTitle} onChange={(e) => updateFormData('functionTitle', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="showName">Nom de scène</Label>
          <Input id="showName" value={formData.showName} onChange={(e) => updateFormData('showName', e.target.value)} placeholder="Pour les artistes" />
        </div>
        <div>
          <Label htmlFor="gusoId">Identifiant GUSO</Label>
          <Input id="gusoId" value={formData.gusoId} onChange={(e) => updateFormData('gusoId', e.target.value)} placeholder="Identifiant pour la gestion des droits" />
        </div>
        <div>
          <Label htmlFor="entertainmentLeaveNumber">Numéro congé spectacle</Label>
          <Input id="entertainmentLeaveNumber" value={formData.entertainmentLeaveNumber || ''} onChange={(e) => updateFormData('entertainmentLeaveNumber', e.target.value)} placeholder="Numéro de congé spectacle" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="flex items-center space-x-2">
            <input type="checkbox" checked={formData.taxReduction || false} onChange={(e) => setFormData((prev: any) => ({ ...prev, taxReduction: e.target.checked }))} className="rounded border-gray-300" />
            <span>Abattement fiscal</span>
          </Label>
          <p className="text-sm text-muted-foreground mt-1">Cochez si vous bénéficiez d'un abattement fiscal</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const BankDetailsSection: React.FC<SectionProps> = ({ formData, setFormData }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <Banknote className="h-5 w-5" />
        <span>Coordonnées bancaires</span>
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="iban">IBAN</Label>
          <Input id="iban" value={formData.bankDetails.iban} onChange={(e) => setFormData((prev: any) => ({ ...prev, bankDetails: { ...prev.bankDetails, iban: e.target.value } }))} placeholder="FR76 1234 5678 9012 3456 7890 123" />
        </div>
        <div>
          <Label htmlFor="bic">BIC/SWIFT</Label>
          <Input id="bic" value={formData.bankDetails.bic} onChange={(e) => setFormData((prev: any) => ({ ...prev, bankDetails: { ...prev.bankDetails, bic: e.target.value } }))} placeholder="BNPAFRPP" />
        </div>
        <div>
          <Label htmlFor="bankName">Nom de la banque</Label>
          <Input id="bankName" value={formData.bankDetails.bankName} onChange={(e) => setFormData((prev: any) => ({ ...prev, bankDetails: { ...prev.bankDetails, bankName: e.target.value } }))} placeholder="BNP Paribas" />
        </div>
        <div>
          <Label htmlFor="accountHolder">Titulaire du compte</Label>
          <Input id="accountHolder" value={formData.bankDetails.accountHolder} onChange={(e) => setFormData((prev: any) => ({ ...prev, bankDetails: { ...prev.bankDetails, accountHolder: e.target.value } }))} placeholder="Nom du titulaire" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export const AvailabilitySection: React.FC<SectionProps> = ({ formData, setFormData }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <Calendar className="h-5 w-5" />
        <span>Disponibilités</span>
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="startTime">Heure de début</Label>
          <Input id="startTime" type="time" value={formData.availability.workingHours.start} onChange={(e) => setFormData((prev: any) => ({ ...prev, availability: { ...prev.availability, workingHours: { ...prev.availability.workingHours, start: e.target.value } } }))} />
        </div>
        <div>
          <Label htmlFor="endTime">Heure de fin</Label>
          <Input id="endTime" type="time" value={formData.availability.workingHours.end} onChange={(e) => setFormData((prev: any) => ({ ...prev, availability: { ...prev.availability, workingHours: { ...prev.availability.workingHours, end: e.target.value } } }))} />
        </div>
        <div>
          <Label htmlFor="timeZone">Fuseau horaire</Label>
          <Select value={formData.availability.timeZone} onValueChange={(value) => setFormData((prev: any) => ({ ...prev, availability: { ...prev.availability, timeZone: value } }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
              <SelectItem value="Europe/London">Europe/London</SelectItem>
              <SelectItem value="America/New_York">America/New_York</SelectItem>
              <SelectItem value="America/Los_Angeles">America/Los_Angeles</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const SkillsSection: React.FC<SectionProps> = ({ formData, setFormData }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <Award className="h-5 w-5" />
        <span>Compétences</span>
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <Label htmlFor="skills">Compétences (séparées par des virgules)</Label>
        <Textarea
          id="skills"
          value={formData.skills.join(', ')}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, skills: e.target.value.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0) }))}
          placeholder="Guitare, Chant, Production musicale, Animation, ..."
          rows={3}
        />
      </div>
    </CardContent>
  </Card>
);

export const IdentityDocumentsSection: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <IdCard className="h-5 w-5" />
        <span>Documents d'identité</span>
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="text-sm text-muted-foreground mb-2">
        Informations sur les documents d'identité (à compléter manuellement)
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Type de document principal</Label>
          <Select>
            <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="passport">Passeport</SelectItem>
              <SelectItem value="id_card">Carte d'identité</SelectItem>
              <SelectItem value="driving_license">Permis de conduire</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Numéro du document</Label>
          <Input placeholder="Numéro du document" />
        </div>
      </div>
    </CardContent>
  </Card>
);
