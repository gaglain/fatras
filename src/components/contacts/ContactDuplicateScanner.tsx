import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Merge, Loader2, CheckCircle, AlertTriangle, Wand2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Contact } from '@/types/contact.types';
import { ContactMergeDialog } from './ContactMergeDialog';
import { smartMergeContacts } from './contactMergeUtils';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface DuplicateGroup {
  email: string;
  contacts: Contact[];
}

export const ContactDuplicateScanner: React.FC<{ onMergeComplete: () => void }> = ({ onMergeComplete }) => {
  const [scanning, setScanning] = useState(false);
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const [scanned, setScanned] = useState(false);
  const [mergeTarget, setMergeTarget] = useState<DuplicateGroup | null>(null);
  const [bulkMerging, setBulkMerging] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number; errors: number } | null>(null);

  const scanForDuplicates = async () => {
    setScanning(true);
    try {
      // Fetch all contacts with non-empty email
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .not('email', 'is', null)
        .neq('email', '')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by normalized email
      const emailMap = new Map<string, Contact[]>();
      for (const contact of (data || []) as Contact[]) {
        const normalizedEmail = (contact.email || '').trim().toLowerCase();
        if (!normalizedEmail) continue;
        const existing = emailMap.get(normalizedEmail) || [];
        existing.push(contact);
        emailMap.set(normalizedEmail, existing);
      }

      // Filter groups with 2+ contacts
      const groups: DuplicateGroup[] = [];
      emailMap.forEach((contacts, email) => {
        if (contacts.length >= 2) {
          groups.push({ email, contacts });
        }
      });

      setDuplicateGroups(groups);
      setScanned(true);

      if (groups.length === 0) {
        toast.success('Aucun doublon trouvé !');
      } else {
        toast.info(`${groups.length} groupe(s) de doublons trouvé(s)`);
      }
    } catch {
      toast.error('Erreur lors du scan des doublons');
    } finally {
      setScanning(false);
    }
  };

  const handleMergeComplete = () => {
    setMergeTarget(null);
    // Remove the merged group from list
    setDuplicateGroups(prev => prev.filter(g => g.email !== mergeTarget?.email));
    onMergeComplete();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Détection des doublons</h3>
          <p className="text-sm text-muted-foreground">Scannez vos contacts pour trouver les doublons par email</p>
        </div>
        <Button onClick={scanForDuplicates} disabled={scanning} variant="outline">
          {scanning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
          {scanning ? 'Scan en cours...' : 'Scanner les doublons'}
        </Button>
      </div>

      {scanned && duplicateGroups.length === 0 && (
        <Card>
          <CardContent className="flex items-center gap-3 py-6">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-muted-foreground">Aucun doublon détecté. Vos contacts sont propres !</span>
          </CardContent>
        </Card>
      )}

      {duplicateGroups.length > 0 && (
        <ScrollArea className="max-h-[400px]">
          <div className="space-y-3">
            {duplicateGroups.map((group) => (
              <Card key={group.email} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <span className="font-medium text-foreground">{group.email}</span>
                        <Badge variant="secondary">{group.contacts.length} contacts</Badge>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {group.contacts.map((c) => (
                          <Badge key={c.id} variant="outline" className="text-xs">
                            {c.first_name} {c.last_name}
                            {c.company ? ` — ${c.company}` : ''}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button size="sm" onClick={() => setMergeTarget(group)}>
                      <Merge className="h-4 w-4 mr-2" />
                      Fusionner
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}

      {mergeTarget && (
        <ContactMergeDialog
          isOpen={true}
          contacts={mergeTarget.contacts}
          onClose={() => setMergeTarget(null)}
          onMergeComplete={handleMergeComplete}
        />
      )}
    </div>
  );
};
