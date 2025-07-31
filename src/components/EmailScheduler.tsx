import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, Send } from 'lucide-react';
import { toast } from 'sonner';

interface EmailSchedulerProps {
  campaignId: string;
  onSchedule: (scheduledFor: Date, autoSend: boolean) => void;
  onSendNow: () => void;
  currentSchedule?: {
    scheduled_for?: string;
    auto_send?: boolean;
  };
}

export const EmailScheduler: React.FC<EmailSchedulerProps> = ({
  campaignId,
  onSchedule,
  onSendNow,
  currentSchedule
}) => {
  const [scheduledDate, setScheduledDate] = useState(
    currentSchedule?.scheduled_for 
      ? new Date(currentSchedule.scheduled_for).toISOString().slice(0, 16)
      : ''
  );
  const [autoSend, setAutoSend] = useState(currentSchedule?.auto_send || false);
  const [isScheduling, setIsScheduling] = useState(false);

  const handleSchedule = async () => {
    if (!scheduledDate) {
      toast.error('Veuillez sélectionner une date et heure');
      return;
    }

    const scheduleDate = new Date(scheduledDate);
    if (scheduleDate <= new Date()) {
      toast.error('La date programmée doit être dans le futur');
      return;
    }

    setIsScheduling(true);
    try {
      await onSchedule(scheduleDate, autoSend);
      toast.success(
        autoSend 
          ? 'Campagne programmée pour envoi automatique'
          : 'Campagne programmée'
      );
    } catch (error) {
      toast.error('Erreur lors de la programmation');
    } finally {
      setIsScheduling(false);
    }
  };

  const handleSendNow = async () => {
    try {
      await onSendNow();
      toast.success('Campagne envoyée immédiatement');
    } catch (error) {
      toast.error('Erreur lors de l\'envoi');
    }
  };

  const isScheduled = currentSchedule?.scheduled_for;
  const scheduleDate = isScheduled ? new Date(currentSchedule.scheduled_for) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Programmation d'envoi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isScheduled && (
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              <span>
                Programmé pour le {scheduleDate?.toLocaleDateString('fr-FR')} à{' '}
                {scheduleDate?.toLocaleTimeString('fr-FR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
            {currentSchedule?.auto_send && (
              <div className="text-sm text-muted-foreground mt-1">
                Envoi automatique activé
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="scheduled-date">Date et heure d'envoi</Label>
            <Input
              id="scheduled-date"
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Envoi automatique</Label>
              <div className="text-sm text-muted-foreground">
                Envoyer automatiquement à l'heure programmée
              </div>
            </div>
            <Switch
              checked={autoSend}
              onCheckedChange={setAutoSend}
            />
          </div>
        </div>

        <Separator />

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleSchedule}
            disabled={isScheduling || !scheduledDate}
            className="flex-1"
            variant="outline"
          >
            <Calendar className="h-4 w-4 mr-2" />
            {isScheduling ? 'Programmation...' : 'Programmer'}
          </Button>

          <Button
            onClick={handleSendNow}
            className="flex-1"
          >
            <Send className="h-4 w-4 mr-2" />
            Envoyer maintenant
          </Button>
        </div>

        {autoSend && scheduledDate && (
          <div className="text-xs text-muted-foreground p-3 bg-muted rounded">
            <strong>Note:</strong> Avec l'envoi automatique activé, cette campagne sera 
            envoyée automatiquement à la date et heure programmées sans intervention de votre part.
          </div>
        )}
      </CardContent>
    </Card>
  );
};