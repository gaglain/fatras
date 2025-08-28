import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

export const TestUserCreator: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: 'test123456',
    first_name: '',
    last_name: '',
    role: 'utilisateur'
  });

  const generateRandomUser = () => {
    const firstNames = ['Jean', 'Marie', 'Pierre', 'Sophie', 'Thomas', 'Julie', 'Lucas', 'Emma', 'Alex', 'Clara'];
    const lastNames = ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon'];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@test.com`;
    
    setFormData({
      email,
      password: 'test123456',
      first_name: firstName,
      last_name: lastName,
      role: 'utilisateur'
    });
  };

  const createTestUser = async () => {
    if (!formData.email || !formData.first_name || !formData.last_name) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsLoading(true);

    try {
      // Créer l'utilisateur avec auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: formData.first_name,
            last_name: formData.last_name,
            role: formData.role
          }
        }
      });

      if (authError) {
        if (authError.message.includes('User already registered')) {
          toast.error('Un compte existe déjà avec cet email');
        } else {
          toast.error(authError.message);
        }
        return;
      }

      if (authData.user) {
        // Créer le profil utilisateur
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: authData.user.id,
            username: formData.email.split('@')[0],
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            role: formData.role,
            is_active: true
          });

        if (profileError) {
          console.error('Erreur création profil:', profileError);
          toast.error('Erreur lors de la création du profil');
          return;
        }

        toast.success(`Utilisateur test créé : ${formData.email} (mot de passe: ${formData.password})`);
        
        // Réinitialiser le formulaire
        setFormData({
          email: '',
          password: 'test123456',
          first_name: '',
          last_name: '',
          role: 'utilisateur'
        });
      }
    } catch (error: any) {
      console.error('Erreur création utilisateur test:', error);
      toast.error('Erreur lors de la création de l\'utilisateur test');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Créer un utilisateur test
        </CardTitle>
        <CardDescription>
          Créez rapidement des utilisateurs pour tester la messagerie et les fonctionnalités
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Button 
          onClick={generateRandomUser}
          variant="outline" 
          className="w-full"
          type="button"
        >
          Générer un utilisateur aléatoire
        </Button>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstname">Prénom *</Label>
            <Input
              id="firstname"
              value={formData.first_name}
              onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
              placeholder="Prénom"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastname">Nom *</Label>
            <Input
              id="lastname"
              value={formData.last_name}
              onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
              placeholder="Nom"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="utilisateur@test.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="text"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            placeholder="Mot de passe"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Rôle</Label>
          <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="utilisateur">Utilisateur</SelectItem>
              <SelectItem value="admin">Administrateur</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={createTestUser} 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? 'Création...' : 'Créer l\'utilisateur test'}
        </Button>

        <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
          <strong>Note :</strong> Les utilisateurs tests peuvent se connecter immédiatement avec l'email et le mot de passe fournis.
        </div>
      </CardContent>
    </Card>
  );
};