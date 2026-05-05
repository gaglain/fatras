import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Phone, PhoneCall, Search, UserPlus, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Contact } from '@/types/contact.types';
import { toast } from 'sonner';

interface PhoneLookupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Keep only digits (and a leading +) */
const digits = (s: string) => (s || '').replace(/[^0-9+]/g, '');

/** Normalize a phone number for comparison: strip spaces/dashes/dots/parens, drop leading + and country prefix */
const normalize = (raw: string): string => {
  if (!raw) return '';
  let n = digits(raw);
  if (n.startsWith('+')) n = n.slice(1);
  return n;
};

/** Get a comparable suffix (last 9 digits) for fuzzy matching across formats */
const suffix = (raw: string, len = 9): string => {
  const n = normalize(raw);
  return n.length > len ? n.slice(-len) : n;
};

export const PhoneLookupDialog: React.FC<PhoneLookupDialogProps> = ({ open, onOpenChange }) => {
  const [query, setQuery] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Load all contacts with a phone number once on open
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('contacts')
          .select('id, first_name, last_name, phone, email, company, position, status, role')
          .not('phone', 'is', null)
          .neq('phone', '')
          .limit(5000);
        if (error) throw error;
        if (!cancelled) setContacts((data || []) as Contact[]);
      } catch (e: any) {
        toast.error('Erreur de chargement des contacts');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [open]);

  // Reset query when closing
  useEffect(() => { if (!open) setQuery(''); }, [open]);

  // Try to read clipboard on open (mobile-friendly: only when user has interacted)
  useEffect(() => {
    if (!open) return;
    if (!navigator.clipboard?.readText) return;
    navigator.clipboard.readText().then((text) => {
      if (!text) return;
      const d = digits(text);
      // Only auto-fill if it looks like a phone number (≥ 6 digits)
      if (d.replace(/^\+/, '').length >= 6 && d.replace(/^\+/, '').length <= 16) {
        setQuery(text.trim());
      }
    }).catch(() => { /* user denied or no permission, ignore */ });
  }, [open]);

  const matches = useMemo(() => {
    const q = normalize(query);
    if (q.length < 3) return [];
    const qSuffix = suffix(query);
    return contacts
      .map((c) => {
        const phoneNorm = normalize(c.phone || '');
        const phoneSuffix = suffix(c.phone || '');
        let score = 0;
        if (!phoneNorm) return null;
        // Exact normalized match
        if (phoneNorm === q) score = 100;
        // Suffix match (handles +33 vs 0, spaces, etc.)
        else if (phoneSuffix && qSuffix && (phoneSuffix === qSuffix || phoneSuffix.endsWith(qSuffix) || qSuffix.endsWith(phoneSuffix))) score = 80;
        // Substring match
        else if (phoneNorm.includes(q) || q.includes(phoneNorm)) score = 50;
        else return null;
        return { contact: c, score };
      })
      .filter(Boolean)
      .sort((a, b) => (b!.score - a!.score))
      .slice(0, 10) as { contact: Contact; score: number }[];
  }, [contacts, query]);

  const callNumber = (phone: string) => {
    window.location.href = `tel:${phone.replace(/\s/g, '')}`;
  };

  const openContact = (id?: string) => {
    if (!id) return;
    onOpenChange(false);
    navigate(`/contacts/${id}`);
  };

  const createContactFromNumber = () => {
    onOpenChange(false);
    navigate(`/contacts?prefillPhone=${encodeURIComponent(query.trim())}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PhoneCall className="h-5 w-5" /> Identifier un appel
          </DialogTitle>
          <DialogDescription>
            Collez ou tapez un numéro pour vérifier s'il fait partie de vos contacts.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              autoFocus
              type="tel"
              inputMode="tel"
              placeholder="+33 6 12 34 56 78"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 pr-9 text-base"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                aria-label="Effacer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {loading && (
            <p className="text-sm text-muted-foreground text-center py-4">Chargement…</p>
          )}

          {!loading && query && normalize(query).length < 3 && (
            <p className="text-sm text-muted-foreground text-center py-4">Tapez au moins 3 chiffres…</p>
          )}

          {!loading && normalize(query).length >= 3 && matches.length === 0 && (
            <div className="text-center py-6 space-y-3">
              <p className="text-sm text-muted-foreground">Aucun contact trouvé pour ce numéro.</p>
              <Button onClick={createContactFromNumber} variant="outline" size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Créer un nouveau contact
              </Button>
            </div>
          )}

          {!loading && matches.length > 0 && (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {matches.map(({ contact, score }) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between gap-2 p-3 rounded-lg border-2 border-border hover:border-primary transition-colors"
                >
                  <button
                    onClick={() => openContact(contact.id)}
                    className="flex-1 text-left min-w-0"
                  >
                    <div className="font-medium truncate">
                      {contact.first_name} {contact.last_name}
                      {score === 100 && <span className="ml-2 text-xs text-green-600">match exact</span>}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {contact.phone}
                      {contact.company && ` · ${contact.company}`}
                    </div>
                  </button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => callNumber(contact.phone!)}
                    aria-label="Appeler"
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
