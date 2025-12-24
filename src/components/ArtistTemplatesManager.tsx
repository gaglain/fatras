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
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <FileText className="h-4 w-4 md:h-5 md:w-5" />
            Modèle de devis par défaut
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Select value={selectedQuoteTemplate || undefined} onValueChange={setSelectedQuoteTemplate}>
              <SelectTrigger className="w-full sm:flex-1">
                <SelectValue placeholder="Sélectionner un modèle de devis" />
              </SelectTrigger>
              <SelectContent>
                {quoteTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              {selectedQuoteTemplate && (
                <Button variant="outline" size="sm" className="flex-1 sm:flex-initial" onClick={() => setSelectedQuoteTemplate('')}>
                  Retirer
                </Button>
              )}
              <Button size="sm" className="flex-1 sm:flex-initial" onClick={handleSaveQuoteTemplate}>Enregistrer</Button>
            </div>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground mt-2">
            Ce modèle sera utilisé par défaut pour les nouveaux devis de ce spectacle
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Mail className="h-4 w-4 md:h-5 md:w-5" />
            Modèle d'email par défaut
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Select value={selectedEmailTemplate || undefined} onValueChange={setSelectedEmailTemplate}>
              <SelectTrigger className="w-full sm:flex-1">
                <SelectValue placeholder="Sélectionner un modèle d'email" />
              </SelectTrigger>
              <SelectContent>
                {emailTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              {selectedEmailTemplate && (
                <Button variant="outline" size="sm" className="flex-1 sm:flex-initial" onClick={() => setSelectedEmailTemplate('')}>
                  Retirer
                </Button>
              )}
              <Button size="sm" className="flex-1 sm:flex-initial" onClick={handleSaveEmailTemplate}>Enregistrer</Button>
            </div>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground mt-2">
            Ce modèle sera utilisé par défaut pour les nouveaux emails concernant ce spectacle
          </p>
        </CardContent>
      </Card>
    </div>
  );
};