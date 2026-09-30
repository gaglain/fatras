import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CalendarCheck, Loader2 } from 'lucide-react';

interface ShowBookingRequestDialogProps {
  artistId?: string;
  artistName: string;
  trigger?: React.ReactNode;
}

const emptyForm = {
  organization: '',
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  desired_date: '',
  period: '',
  city: '',
  postal_code: '',
  capacity: '',
  message: '',
};

export const ShowBookingRequestDialog: React.FC<ShowBookingRequestDialogProps> = ({ artistId, artistName, trigger }) => {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const set = (key: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.last_name.trim() || !form.organization.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      toast.error('Merci d\'indiquer votre nom, votre structure et un email valide.');
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('show-booking-request', {
        body: { ...form, artist_id: artistId, artist_name: artistName },
      });
      if (error) throw error;
      if (data && data.success === false) throw new Error(data.error || 'Envoi impossible');
      toast.success('Demande envoyée ! Nous revenons vers vous très vite.');
      setForm(emptyForm);
      setOpen(false);
    } catch (err: any) {
      toast.error(err?.message || 'Impossible d\'envoyer la demande pour le moment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="lg">
            <CalendarCheck className="h-4 w-4 mr-2" />
            Demander une disponibilité / un devis
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Demander une date — {artistName}</DialogTitle>
          <DialogDescription>
            Quelques informations et nous vous répondons avec nos disponibilités et un devis.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="organization">Structure, festival ou commune *</Label>
            <Input id="organization" value={form.organization} onChange={set('organization')} required />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="first_name">Prénom</Label>
              <Input id="first_name" value={form.first_name} onChange={set('first_name')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Nom *</Label>
              <Input id="last_name" value={form.last_name} onChange={set('last_name')} required />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" value={form.email} onChange={set('email')} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" type="tel" value={form.phone} onChange={set('phone')} />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="desired_date">Date envisagée</Label>
              <Input id="desired_date" type="date" value={form.desired_date} onChange={set('desired_date')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="period">ou période</Label>
              <Input id="period" placeholder="Été 2027, juin, week-end…" value={form.period} onChange={set('period')} />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="city">Ville</Label>
              <Input id="city" value={form.city} onChange={set('city')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postal_code">Code postal</Label>
              <Input id="postal_code" value={form.postal_code} onChange={set('postal_code')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Jauge / contexte</Label>
            <Input id="capacity" placeholder="300 personnes, place du village…" value={form.capacity} onChange={set('capacity')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Précisions</Label>
            <Textarea id="message" rows={4} value={form.message} onChange={set('message')} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={submitting}>Annuler</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CalendarCheck className="h-4 w-4 mr-2" />}
              Envoyer ma demande
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
