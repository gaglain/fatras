import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EventDialog } from '@/components/events/EventDialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

export const DebugTest: React.FC = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [testData, setTestData] = useState('');
  const [eventDialogOpen, setEventDialogOpen] = useState(false);

  const testEventCreation = async () => {
    if (!user) {
      toast.error('Vous devez être connecté');
      return;
    }

    if (!title.trim()) {
      toast.error('Veuillez entrer un titre');
      return;
    }

    logger.debug('Testing event creation', { userId: user.id, title });

    try {
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

      const { data, error } = await supabase
        .from('events')
        .insert([eventData])
        .select();

      if (error) {
        logger.error('Database error:', error);
        toast.error(`Erreur DB: ${error.message}`);
        return;
      }

      logger.debug('Event created successfully:', data);
      toast.success('Événement créé avec succès !');
      setTitle('');
      setDescription('');
    } catch (error: unknown) {
      logger.error('Event creation error:', error);
      toast.error('Erreur lors de la création');
    }
  };

  const testUserProfileUpdate = async () => {
    if (!user) {
      toast.error('Vous devez être connecté');
      return;
    }

    const profileData = {
      entertainment_leave_number: testData || 'TEST123',
      tax_reduction: true,
      updated_at: new Date().toISOString()
    };

    logger.debug('Testing user profile update', profileData);

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(profileData)
        .eq('user_id', user.id)
        .select();

      if (error) {
        logger.error('Update error:', error);
        toast.error(`Erreur: ${error.message}`);
        return;
      }

      logger.debug('Profile updated successfully:', data);
      toast.success('Profil mis à jour !');
    } catch (error: unknown) {
      logger.error('Profile update error:', error);
      toast.error('Erreur lors du test');
    }
  };

  const fetchCurrentProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        logger.error('Fetch error:', error);
        toast.error(`Erreur: ${error.message}`);
        return;
      }

      logger.debug('Current profile:', data);
      toast.success('Profil récupéré - voir console');
    } catch (error: unknown) {
      logger.error('Profile fetch error:', error);
    }
  };

  const testEventDialog = () => {
    setEventDialogOpen(true);
  };

  const handleEventSave = () => {
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
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        
        <div>
          <Textarea
            placeholder="Description test..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
