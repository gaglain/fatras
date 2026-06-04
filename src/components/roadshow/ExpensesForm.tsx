import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Info, Upload, FileText, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useRoadshowExpenses, RoadshowExpense } from '@/hooks/useRoadshowExpenses';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { ExpenseFileLink } from './ExpenseFileLink';

interface ExpensesFormProps {
  roadshowStopId?: string;
}

export const ExpensesForm: React.FC<ExpensesFormProps> = ({ roadshowStopId }) => {
  const { expenses, loading, fetchExpenses, createExpense, deleteExpense } = useRoadshowExpenses(roadshowStopId);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [taxRate, setTaxRate] = useState('20');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isImage = file.type.startsWith('image/');
      const isPdf = file.type === 'application/pdf';
      
      if (isImage || isPdf) {
        setSelectedFile(file);
      } else {
        alert('Seuls les images et PDF sont acceptés');
      }
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!roadshowStopId || !selectedFile || !title) {
      console.log('Validation échouée:', { roadshowStopId, selectedFile: !!selectedFile, title });
      return;
    }

    const success = await createExpense(
      roadshowStopId,
      title,
      selectedFile,
      description,
      amount ? parseFloat(amount) : undefined,
      taxRate ? parseFloat(taxRate) : 20
    );

    if (success) {
      setShowDialog(false);
      setSelectedFile(null);
      setTitle('');
      setDescription('');
      setAmount('');
      setTaxRate('20');
      fetchExpenses();
    }
  };

  const confirmAction = useConfirm();
  const handleDelete = async (expense: RoadshowExpense) => {
    const ok = await confirmAction({ title: 'Supprimer', description: 'Supprimer cette note de frais ?', variant: 'destructive' });
    if (ok) {
      const success = await deleteExpense(expense.id, expense.file_url);
      if (success) {
        fetchExpenses();
      }
    }
  };

  if (!roadshowStopId) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Les notes de frais seront disponibles après la création de l'étape de tournée.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4 w-full max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-medium">Notes de frais</h3>
          <p className="text-sm text-muted-foreground">
            Ajoutez vos notes de frais avec photos ou PDF
          </p>
        </div>
        <Button onClick={() => setShowDialog(true)} className="w-full sm:w-auto shrink-0">
          <Upload className="h-4 w-4 mr-2" />
          Ajouter
        </Button>
      </div>

      <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
        {expenses.map((expense) => (
          <Card key={expense.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {expense.file_type === 'image' ? (
                    <ImageIcon className="h-5 w-5 text-muted-foreground mt-1" />
                  ) : (
                    <FileText className="h-5 w-5 text-muted-foreground mt-1" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{expense.title}</h4>
                    {expense.description && (
                      <p className="text-sm text-muted-foreground mt-1">{expense.description}</p>
                    )}
                    {expense.amount != null && (
                      <div className="mt-2 text-sm">
                        <p className="font-semibold">{expense.amount.toFixed(2)} € TTC</p>
                        <p className="text-xs text-muted-foreground">
                          {(expense.amount / (1 + (expense.tax_rate ?? 20) / 100)).toFixed(2)} € HT
                          {' · '}TVA {expense.tax_rate ?? 20}%
                        </p>
                      </div>
                    )}
                    <ExpenseFileLink
                      fileUrl={expense.file_url}
                      className="text-sm text-primary hover:underline mt-2 inline-block"
                    >
                      Voir le fichier
                    </ExpenseFileLink>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(expense)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {expenses.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Aucune note de frais pour le moment</p>
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter une note de frais</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Repas équipe"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Détails supplémentaires..."
              />
            </div>
            <div>
              <Label htmlFor="amount">Montant (€)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="file">Fichier (Image ou PDF) *</Label>
              <Input
                id="file"
                type="file"
                accept="image/*,application/pdf,.pdf"
                onChange={handleFileSelect}
                required
                className="block w-full text-sm file:mr-2 file:py-1 file:px-2 file:rounded file:border file:bg-muted file:text-foreground"
              />
              {selectedFile && (
                <p className="text-sm text-muted-foreground mt-1 break-all">
                  ✓ {selectedFile.name}
                </p>
              )}
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowDialog(false)}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                Annuler
              </Button>
              <Button 
                type="submit"
                disabled={!title || !selectedFile || loading}
                className="w-full sm:w-auto"
              >
                {loading ? 'Ajout...' : 'Ajouter'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
