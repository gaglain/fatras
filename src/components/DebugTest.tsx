import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EventDialog } from '@/components/events/EventDialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const DebugTest: React.FC = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [testData, setTestData] = useState('');
  const [eventDialogOpen, setEventDialogOpen] = useState(false);

  const testEventCreation = async () => {
    if (!user) {
      console.error('❌ No user found');
      toast.error('Vous devez être connecté');
      return;
    }

    if (!title.trim()) {
      console.error('❌ No title provided');
      toast.error('Veuillez entrer un titre');
      return;
    }

    console.log('🎯 Testing event creation');
    console.log('👤 User:', user.id, user.email);
    console.log('📝 Title:', title);
    console.log('🔍 Title length:', title.length);
    console.log('🔍 Title chars:', title.split('').map(c => c.charCodeAt(0)));

    try {
      console.log('📤 Inserting event into database...');
      
      const eventData = {
        user_id: user.id,
        title: title.trim(),
        description: description || 'Test event description',
        event_type: 'Concert',
        venue: 'Test Venue',
        city: 'Paris',
        country: 'France',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('📊 Event data to insert:', eventData);

      const { data, error } = await supabase
        .from('events')
        .insert([eventData])
        .select();

      if (error) {
        console.error('❌ Database error:', error);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
        toast.error(`Erreur DB: ${error.message}`);
        return;
      }

      console.log('✅ Event created successfully:', data);
      toast.success('Événement créé avec succès !');
      setTitle('');
      setDescription('');
    } catch (error) {
      console.error('❌ Catch error:', error);
      console.error('❌ Error stack:', error.stack);
      toast.error(`Erreur: ${error.message}`);
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

  const testEventDialog = () => {
    console.log('🎯 Opening EventDialog for testing');
    setEventDialogOpen(true);
  };

  const handleEventSave = () => {
    console.log('✅ Event saved successfully');
    setEventDialogOpen(false);
    toast.success('Événement sauvegardé !');
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
            onChange={(e) => {
              console.log('📝 Title input change:', e.target.value);
              setTitle(e.target.value);
            }}
          />
        </div>
        
        <div>
          <Textarea
            placeholder="Description test..."
            value={description}
            onChange={(e) => {
              console.log('📝 Description change:', e.target.value);
              setDescription(e.target.value);
            }}
            rows={3}
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
          
          <Button onClick={testEventDialog} className="w-full" variant="destructive">
            🎯 Tester EventDialog (Bug titre)
          </Button>
          
          <Button onClick={fetchCurrentProfile} className="w-full" variant="secondary">
            Récupérer profil actuel
          </Button>
        </div>

        {/* Event Dialog pour test */}
        <EventDialog
          open={eventDialogOpen}
          onOpenChange={setEventDialogOpen}
          event={null}
          onSave={handleEventSave}
        />

        <div className="text-sm text-muted-foreground">
          Utilisateur connecté: {user?.email || 'Non connecté'}
        </div>
      </CardContent>
    </Card>
  );
};