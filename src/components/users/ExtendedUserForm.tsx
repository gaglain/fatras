import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Save, User, CreditCard, MapPin, Briefcase, Banknote, FileText, Calendar, Award, IdCard } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface ExtendedUserFormData {
  // Informations personnelles de base
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  
  // Informations personnelles étendues
  birthDate: string;
  birthPlace: string;
  nationality: string;
  socialSecurityNumber: string;
  
  // Informations d'adresse
  address: string;
  city: string;
  postalCode: string;
  country: string;
  
  // Informations professionnelles
  functionTitle: string;
  showName: string;
  gusoId: string;
  
  // Nouvelles informations
  bankDetails: {
    iban: string;
    bic: string;
    bankName: string;
    accountHolder: string;
  };
  contractsFees: Array<{
    id: string;
    contractType: string;
    amount: number;
    currency: string;
    description: string;
    date: string;
  }>;
  availability: {
    timeZone: string;
    workingHours: { start: string; end: string };
    workingDays: string[];
    unavailableDates: string[];
  };
  skills: string[];
  identityDocuments: Array<{
    id: string;
    type: string;
    number: string;
    issueDate: string;
    expiryDate: string;
    issuer: string;
  }>;
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
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'utilisateur',
    birthDate: '',
    birthPlace: '',
    nationality: 'FR',
    socialSecurityNumber: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France',
    functionTitle: '',
    showName: '',
    gusoId: '',
    bankDetails: {
      iban: '',
      bic: '',
      bankName: '',
      accountHolder: ''
    },
    contractsFees: [],
    availability: {
      timeZone: 'Europe/Paris',
      workingHours: { start: '09:00', end: '18:00' },
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      unavailableDates: []
    },
    skills: [],
    identityDocuments: [],
    ...initialData
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation basique
    if (!formData.email || !formData.firstName || !formData.lastName) {
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof ExtendedUserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informations de base */}
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
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => updateFormData('firstName', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Nom *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => updateFormData('lastName', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                required
                disabled={isEdit}
              />
            </div>
            <div>
              <Label htmlFor="username">Nom d'utilisateur</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => updateFormData('username', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => updateFormData('phone', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="role">Rôle</Label>
              <Select value={formData.role} onValueChange={(value) => updateFormData('role', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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

      {/* Informations personnelles étendues */}
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
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => updateFormData('birthDate', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="birthPlace">Lieu de naissance</Label>
              <Input
                id="birthPlace"
                value={formData.birthPlace}
                onChange={(e) => updateFormData('birthPlace', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="nationality">Nationalité</Label>
              <Select value={formData.nationality} onValueChange={(value) => updateFormData('nationality', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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
              <Input
                id="socialSecurityNumber"
                value={formData.socialSecurityNumber}
                onChange={(e) => updateFormData('socialSecurityNumber', e.target.value)}
                placeholder="1 23 45 67 890 123 45"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Adresse */}
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
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => updateFormData('address', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">Ville</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => updateFormData('city', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="postalCode">Code postal</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => updateFormData('postalCode', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="country">Pays</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => updateFormData('country', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informations professionnelles */}
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
              <Input
                id="functionTitle"
                value={formData.functionTitle}
                onChange={(e) => updateFormData('functionTitle', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="showName">Nom de scène</Label>
              <Input
                id="showName"
                value={formData.showName}
                onChange={(e) => updateFormData('showName', e.target.value)}
                placeholder="Pour les artistes"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="gusoId">Identifiant GUSO</Label>
              <Input
                id="gusoId"
                value={formData.gusoId}
                onChange={(e) => updateFormData('gusoId', e.target.value)}
                placeholder="Identifiant pour la gestion des droits"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coordonnées bancaires */}
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
              <Input
                id="iban"
                value={formData.bankDetails.iban}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  bankDetails: { ...prev.bankDetails, iban: e.target.value } 
                }))}
                placeholder="FR76 1234 5678 9012 3456 7890 123"
              />
            </div>
            <div>
              <Label htmlFor="bic">BIC/SWIFT</Label>
              <Input
                id="bic"
                value={formData.bankDetails.bic}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  bankDetails: { ...prev.bankDetails, bic: e.target.value } 
                }))}
                placeholder="BNPAFRPP"
              />
            </div>
            <div>
              <Label htmlFor="bankName">Nom de la banque</Label>
              <Input
                id="bankName"
                value={formData.bankDetails.bankName}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  bankDetails: { ...prev.bankDetails, bankName: e.target.value } 
                }))}
                placeholder="BNP Paribas"
              />
            </div>
            <div>
              <Label htmlFor="accountHolder">Titulaire du compte</Label>
              <Input
                id="accountHolder"
                value={formData.bankDetails.accountHolder}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  bankDetails: { ...prev.bankDetails, accountHolder: e.target.value } 
                }))}
                placeholder="Nom du titulaire"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disponibilités */}
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
              <Input
                id="startTime"
                type="time"
                value={formData.availability.workingHours.start}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  availability: { 
                    ...prev.availability, 
                    workingHours: { ...prev.availability.workingHours, start: e.target.value } 
                  } 
                }))}
              />
            </div>
            <div>
              <Label htmlFor="endTime">Heure de fin</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.availability.workingHours.end}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  availability: { 
                    ...prev.availability, 
                    workingHours: { ...prev.availability.workingHours, end: e.target.value } 
                  } 
                }))}
              />
            </div>
            <div>
              <Label htmlFor="timeZone">Fuseau horaire</Label>
              <Select 
                value={formData.availability.timeZone} 
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  availability: { ...prev.availability, timeZone: value } 
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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

      {/* Compétences */}
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
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                skills: e.target.value.split(',').map(s => s.trim()).filter(s => s.length > 0)
              }))}
              placeholder="Guitare, Chant, Production musicale, Animation, ..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Documents d'identité */}
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
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
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

      {/* Actions */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      </div>
    </form>
  );
};