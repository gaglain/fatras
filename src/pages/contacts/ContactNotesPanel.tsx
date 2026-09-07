import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RichTextEditor } from '@/components/RichTextEditor';
import { Button } from '@/components/ui/button';
import { StickyNote, Check, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Props {
  contactId: string;
  initialNotes?: string | null;
  onSaved?: (notes: string) => void;
}

export const ContactNotesPanel: React.FC<Props> = ({ contactId, initialNotes, onSaved }) => {
  const [value, setValue] = useState(initialNotes || '');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [collapsed, setCollapsed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const lastSaved = useRef(initialNotes || '');

  // Ne réinitialise l'éditeur que lors du changement de contact.
  // Les mises à jour renvoyées par le parent après sauvegarde ne doivent jamais
  // écraser ce que l'utilisateur est en train de taper.
  const loadedContactId = useRef<string | null>(null);
  useEffect(() => {
    if (loadedContactId.current === contactId) return;
    loadedContactId.current = contactId;
    setValue(initialNotes || '');
    lastSaved.current = initialNotes || '';
  }, [contactId, initialNotes]);


  const save = async (next: string) => {
    if (next === lastSaved.current) return;
    setStatus('saving');
    const { error } = await supabase.from('contacts').update({ notes: next }).eq('id', contactId);
    if (error) {
      setStatus('idle');
      toast.error("Impossible d'enregistrer la note");
      return;
    }
    lastSaved.current = next;
    setStatus('saved');
    onSaved?.(next);
    setTimeout(() => setStatus((s) => (s === 'saved' ? 'idle' : s)), 1500);
  };

  const handleChange = (next: string) => {
    setValue(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => save(next), 900);
  };

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return (
    <Card className="lg:sticky lg:top-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <StickyNote className="h-4 w-4" />
            Notes
          </CardTitle>
          <div className="flex items-center gap-2">
            {status === 'saving' && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            {status === 'saved' && <Check className="h-4 w-4 text-muted-foreground" />}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 lg:hidden"
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? 'Ouvrir les notes' : 'Réduire les notes'}
            >
              {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      {!collapsed && (
        <CardContent className="space-y-2">
          <div onBlur={() => save(value)}>
            <RichTextEditor
              value={value}
              onChange={handleChange}
              placeholder="Prenez vos notes ici… mise en page, listes, images."
              className="[&_.richtext-content]:min-h-[260px] lg:[&_.richtext-content]:min-h-[420px]"
            />
          </div>
          <p className="text-xs text-muted-foreground">Enregistrement automatique</p>
        </CardContent>
      )}
    </Card>
  );
};
