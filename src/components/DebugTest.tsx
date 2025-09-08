import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const DebugTest: React.FC = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [testData, setTestData] = useState('');

  const testEventCreation = async () => {
    if (!user) {
      console.error('❌ No user found');
      toast.error('Vous devez être connecté');
      return;
    }

    console.log('🧪 Testing event creation');
    console.log('👤 User:', user.id);
    
    const eventData = {
      user_id: user.id,
      title: title || 'Test Event',
      description: 'Test description',
      status: 'pending'
    };

    console.log('📝 Event data to insert:', eventData);

    try {
      const { data, error } = await supabase
        .from('events')
        .insert([eventData])
        .select();

      console.log('📊 Insert result:', { data, error });

      if (error) {
        console.error('❌ Insert error:', error);
        toast.error(`Erreur: ${error.message}`);
        return;
      }

      console.log('✅ Event created successfully:', data);
      toast.success('Événement de test créé !');
    } catch (error) {
      console.error('❌ Catch error:', error);
      toast.error('Erreur lors du test');
    }
  };

  const testUserProfileUpdate = async () => {
    if (!user) {
      console.error('❌ No user found');
      toast.error('Vous devez être connecté');
      return;
    }

    console.log('🧪 Testing user profile update');
    
    const profileData = {
      entertainment_leave_number: testData || 'TEST123',
      tax_reduction: true,
      updated_at: new Date().toISOString()
    };

    console.log('📝 Profile data to update:', profileData);

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(profileData)
        .eq('user_id', user.id)
        .select();

      console.log('📊 Update result:', { data, error });

      if (error) {
        console.error('❌ Update error:', error);
        toast.error(`Erreur: ${error.message}`);
        return;
      }

      console.log('✅ Profile updated successfully:', data);
      toast.success('Profil mis à jour !');
    } catch (error) {
      console.error('❌ Catch error:', error);
      toast.error('Erreur lors du test');
    }
  };

  const fetchCurrentProfile = async () => {
    if (!user) return;

    console.log('🔍 Fetching current profile');
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      console.log('📊 Profile fetch result:', { data, error });

      if (error) {
        console.error('❌ Fetch error:', error);
        toast.error(`Erreur: ${error.message}`);
        return;
      }

      console.log('✅ Current profile:', data);
      toast.success('Profil récupéré - voir console');
    } catch (error) {
      console.error('❌ Catch error:', error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>🧪 Tests de débogage</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Input
            placeholder="Titre de l'événement test"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        
        <div>
          <Input
            placeholder="Données test (ex: numéro congé)"
            value={testData}
            onChange={(e) => setTestData(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Button onClick={testEventCreation} className="w-full">
            Tester création événement
          </Button>
          
          <Button onClick={testUserProfileUpdate} className="w-full" variant="outline">
            Tester mise à jour profil
          </Button>
          
          <Button onClick={fetchCurrentProfile} className="w-full" variant="secondary">
            Récupérer profil actuel
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          Utilisateur connecté: {user?.email || 'Non connecté'}
        </div>
      </CardContent>
    </Card>
  );
};