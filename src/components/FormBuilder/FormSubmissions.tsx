
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Search, Eye, Trash2, Download, Mail, FileText } from 'lucide-react';
import { FormData } from './types';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FormSubmission {
  id: string;
  form_id: string;
  data: Record<string, any>;
  created_at: string;
  ip_address?: string;
  user_agent?: string;
}

interface FormSubmissionsProps {
  forms: FormData[];
}

export const FormSubmissions: React.FC<FormSubmissionsProps> = ({ forms }) => {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFormId, setSelectedFormId] = useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSubmissions();
    }
  }, [user]);

  const fetchSubmissions = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('form_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter submissions that belong to user's forms
      const userFormIds = forms.map(f => f.id);
      const filteredSubmissions = (data || []).filter(s => userFormIds.includes(s.form_id)).map(s => ({
        ...s,
        data: typeof s.data === 'string' ? JSON.parse(s.data) : (s.data as Record<string, any>) || {}
      }));
      
      setSubmissions(filteredSubmissions);
    } catch {
      toast.error('Erreur lors du chargement des soumissions');
    } finally {
      setLoading(false);
    }
  };

  const deleteSubmission = async (id: string) => {
    if (!window.confirm('Supprimer cette soumission ?')) return;

    try {
      const { error } = await supabase
        .from('form_submissions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSubmissions(prev => prev.filter(s => s.id !== id));
      toast.success('Soumission supprimée');
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const exportToCSV = () => {
    const filteredData = getFilteredSubmissions();
    if (filteredData.length === 0) {
      toast.error('Aucune donnée à exporter');
      return;
    }

    // Get all unique field keys
    const allKeys = new Set<string>();
    filteredData.forEach(s => {
      Object.keys(s.data || {}).forEach(key => allKeys.add(key));
    });

    const headers = ['Date', 'Formulaire', ...Array.from(allKeys)];
    const rows = filteredData.map(s => {
      const form = forms.find(f => f.id === s.form_id);
      return [
        format(new Date(s.created_at), 'dd/MM/yyyy HH:mm', { locale: fr }),
        form?.name || 'Inconnu',
        ...Array.from(allKeys).map(key => {
          const value = s.data?.[key];
          if (Array.isArray(value)) return value.join(', ');
          return value?.toString() || '';
        })
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `soumissions_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getFilteredSubmissions = () => {
    return submissions.filter(s => {
      const matchesForm = selectedFormId === 'all' || s.form_id === selectedFormId;
      const matchesSearch = searchTerm === '' || 
        JSON.stringify(s.data).toLowerCase().includes(searchTerm.toLowerCase());
      return matchesForm && matchesSearch;
    });
  };

  const filteredSubmissions = getFilteredSubmissions();

  const getFormName = (formId: string) => {
    return forms.find(f => f.id === formId)?.name || 'Formulaire inconnu';
  };

  const getFieldLabel = (formId: string, fieldId: string) => {
    const form = forms.find(f => f.id === formId);
    const field = form?.fields.find(f => f.id === fieldId);
    return field?.label || fieldId;
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '-';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={selectedFormId}
            onChange={(e) => setSelectedFormId(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">Tous les formulaires</option>
            {forms.map(form => (
              <option key={form.id} value={form.id}>{form.name}</option>
            ))}
          </select>
        </div>
        <Button variant="outline" onClick={exportToCSV}>
          <Download className="h-4 w-4 mr-2" />
          Exporter CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Soumissions
            <Badge variant="secondary">{filteredSubmissions.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune soumission trouvée</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Formulaire</TableHead>
                    <TableHead>Aperçu</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => {
                    const dataEntries = Object.entries(submission.data || {});
                    const previewData = dataEntries.slice(0, 2);
                    
                    return (
                      <TableRow key={submission.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(submission.created_at), 'dd MMM yyyy HH:mm', { locale: fr })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{getFormName(submission.form_id)}</Badge>
                        </TableCell>
                        <TableCell className="max-w-md truncate">
                          {previewData.map(([key, value]) => (
                            <span key={key} className="text-sm">
                              <span className="text-muted-foreground">
                                {getFieldLabel(submission.form_id, key)}:
                              </span>{' '}
                              {formatValue(value)}
                              {previewData.indexOf([key, value]) < previewData.length - 1 ? ' | ' : ''}
                            </span>
                          ))}
                          {dataEntries.length > 2 && (
                            <span className="text-muted-foreground"> +{dataEntries.length - 2}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedSubmission(submission)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => deleteSubmission(submission.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submission Detail Dialog */}
      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Détails de la soumission</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Formulaire</span>
                  <Badge>{getFormName(selectedSubmission.form_id)}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Date</span>
                  <span>
                    {format(new Date(selectedSubmission.created_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                  </span>
                </div>
                
                <div className="border-t pt-4 space-y-3">
                  {Object.entries(selectedSubmission.data || {}).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <Label className="text-muted-foreground text-xs uppercase">
                        {getFieldLabel(selectedSubmission.form_id, key)}
                      </Label>
                      <p className="text-sm">{formatValue(value)}</p>
                    </div>
                  ))}
                </div>

                {(selectedSubmission.ip_address || selectedSubmission.user_agent) && (
                  <div className="border-t pt-4 space-y-2 text-xs text-muted-foreground">
                    {selectedSubmission.ip_address && (
                      <p>IP: {selectedSubmission.ip_address}</p>
                    )}
                    {selectedSubmission.user_agent && (
                      <p className="truncate">User Agent: {selectedSubmission.user_agent}</p>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Label: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <label className={className}>{children}</label>
);
