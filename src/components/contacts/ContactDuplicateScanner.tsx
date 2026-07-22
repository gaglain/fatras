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
      // Fetch all contacts with non-empty email — paginated to bypass 1000-row cap
      const PAGE = 1000;
      let from = 0;
      let all: Contact[] = [];
      while (true) {
        const { data, error } = await supabase
          .from('contacts')
          .select('*')
          .not('email', 'is', null)
          .neq('email', '')
          .order('created_at', { ascending: true })
          .range(from, from + PAGE - 1);
        if (error) throw error;
        const rows = (data || []) as Contact[];
        all = all.concat(rows);
        if (rows.length < PAGE) break;
        from += PAGE;
      }
      const data = all;

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

  const bulkMergeAll = async () => {
    if (duplicateGroups.length === 0) return;
    setBulkMerging(true);
    setBulkProgress({ done: 0, total: duplicateGroups.length, errors: 0 });
    let done = 0;
    let errors = 0;
    const remaining: DuplicateGroup[] = [];
    for (const group of duplicateGroups) {
      try {
        await smartMergeContacts(group.contacts);
      } catch (e: any) {
        console.error('[BulkMerge] error on', group.email, e);
        errors++;
        remaining.push(group);
      }
      done++;
      setBulkProgress({ done, total: duplicateGroups.length, errors });
    }
    setDuplicateGroups(remaining);
    setBulkMerging(false);
    setBulkProgress(null);
    if (errors === 0) {
      toast.success(`${done} groupe(s) de doublons fusionné(s)`);
    } else {
      toast.warning(`${done - errors} fusionné(s), ${errors} en erreur`);
    }
    onMergeComplete();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Détection des doublons</h3>
          <p className="text-sm text-muted-foreground">Scannez vos contacts pour trouver les doublons par email</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={scanForDuplicates} disabled={scanning || bulkMerging} variant="outline">
            {scanning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
            {scanning ? 'Scan en cours...' : 'Scanner les doublons'}
          </Button>
          {duplicateGroups.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={bulkMerging}>
                  {bulkMerging ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
                  {bulkMerging && bulkProgress
                    ? `Fusion ${bulkProgress.done}/${bulkProgress.total}...`
                    : `Tout fusionner (${duplicateGroups.length})`}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Fusionner tous les doublons ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {duplicateGroups.length} groupe(s) seront fusionnés automatiquement. Pour chaque groupe,
                    le contact le plus récent est conservé, les valeurs non-vides des autres sont récupérées,
                    les tags sont combinés, et les relations (événements, devis, tâches, listes…) sont réassignées.
                    Cette action est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={bulkMergeAll}>Tout fusionner</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {bulkMerging && bulkProgress && (
        <div className="text-sm text-muted-foreground">
          Fusion en cours : {bulkProgress.done}/{bulkProgress.total}
          {bulkProgress.errors > 0 && ` — ${bulkProgress.errors} erreur(s)`}
        </div>
      )}

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
