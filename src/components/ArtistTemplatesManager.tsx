import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FileText, Mail } from 'lucide-react';

interface ArtistTemplatesManagerProps {
  artistId: string;
  currentQuoteTemplateId?: string;
  currentEmailTemplateId?: string;
  onUpdate: (updates: { quote_template_id?: string; email_template_id?: string }) => void;
}

export const ArtistTemplatesManager: React.FC<ArtistTemplatesManagerProps> = ({
  artistId,
  currentQuoteTemplateId,
  currentEmailTemplateId,
  onUpdate
}) => {
  const [quoteTemplates, setQuoteTemplates] = useState<any[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<any[]>([]);
  const [selectedQuoteTemplate, setSelectedQuoteTemplate] = useState(currentQuoteTemplateId || '');
  const [selectedEmailTemplate, setSelectedEmailTemplate] = useState(currentEmailTemplateId || '');

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    setSelectedQuoteTemplate(currentQuoteTemplateId || '');
    setSelectedEmailTemplate(currentEmailTemplateId || '');
  }, [currentQuoteTemplateId, currentEmailTemplateId]);

  const fetchTemplates = async () => {
    try {
      // Fetch quote templates
      const { data: quotesData, error: quotesError } = await supabase
        .from('quote_templates')
        .select('id, name')
        .order('name');

      if (quotesError) throw quotesError;

      // Fetch email templates
      const { data: emailsData, error: emailsError } = await supabase
        .from('email_templates')
        .select('id, name')
        .order('name');

      if (emailsError) throw emailsError;

      setQuoteTemplates(quotesData || []);
      setEmailTemplates(emailsData || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Erreur lors du chargement des modèles');
    }
  };

  const handleSaveQuoteTemplate = () => {
    onUpdate({ quote_template_id: selectedQuoteTemplate || undefined });
    toast.success('Modèle de devis enregistré');
  };

  const handleSaveEmailTemplate = () => {
    onUpdate({ email_template_id: selectedEmailTemplate || undefined });
    toast.success('Modèle d\'email enregistré');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Modèle de devis par défaut
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Select value={selectedQuoteTemplate} onValueChange={setSelectedQuoteTemplate}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Sélectionner un modèle de devis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Aucun modèle</SelectItem>
                {quoteTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSaveQuoteTemplate}>Enregistrer</Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Ce modèle sera utilisé par défaut pour les nouveaux devis de ce spectacle
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Modèle d'email par défaut
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Select value={selectedEmailTemplate} onValueChange={setSelectedEmailTemplate}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Sélectionner un modèle d'email" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Aucun modèle</SelectItem>
                {emailTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSaveEmailTemplate}>Enregistrer</Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Ce modèle sera utilisé par défaut pour les nouveaux emails concernant ce spectacle
          </p>
        </CardContent>
      </Card>
    </div>
  );
};