import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { UniversalSearch, SearchItem } from '@/components/UniversalSearch';

interface Template {
  id: string;
  name: string;
  subject: string;
  content: string;
}

interface ContactList {
  id: string;
  name: string;
  contactCount?: number;
  is_exclusion?: boolean;
}

interface CampaignData {
  name: string;
  subject: string;
  content: any[];
  selectedLists: string[];
  excludedLists?: string[];
  templateId: string;
  artistId: string | null;
  eventId: string | null;
  includeSignature?: boolean;
}

interface CampaignManagerSettingsProps {
  campaignData: CampaignData;
  setCampaignData: React.Dispatch<React.SetStateAction<CampaignData>>;
  templates: Template[];
  contactLists: ContactList[];
  onTemplateSelect: (templateId: string) => void;
}

export const CampaignManagerSettings: React.FC<CampaignManagerSettingsProps> = ({
  campaignData, setCampaignData, templates, contactLists, onTemplateSelect
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Informations de base</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Nom de la campagne</Label>
            <Input id="name" value={campaignData.name}
              onChange={(e) => setCampaignData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Newsletter de janvier" />
          </div>
          <div>
            <Label htmlFor="subject">Sujet de l'email</Label>
            <Input id="subject" value={campaignData.subject}
              onChange={(e) => setCampaignData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Ex: Votre newsletter mensuelle" />
          </div>
          {templates.length > 0 && (
            <div>
              <Label>Template</Label>
              <Select value={campaignData.templateId} onValueChange={onTemplateSelect}>
                <SelectTrigger><SelectValue placeholder="Choisir un template" /></SelectTrigger>
                <SelectContent>
                  {templates.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Artiste (optionnel)</Label>
              <UniversalSearch filterTypes={['artist']} placeholder="Rechercher un artiste..." triggerText="Sélectionner un artiste"
                onSelect={(item: SearchItem) => setCampaignData(prev => ({ ...prev, artistId: item.id }))} />
              {campaignData.artistId && (
                <div className="mt-2 p-2 bg-muted rounded-md flex items-center justify-between">
                  <span className="text-sm">Artiste sélectionné</span>
                  <Button variant="ghost" size="sm" onClick={() => setCampaignData(prev => ({ ...prev, artistId: null }))}><X className="h-4 w-4" /></Button>
                </div>
              )}
            </div>
            <div>
              <Label>Spectacle (optionnel)</Label>
              <UniversalSearch filterTypes={['event']} placeholder="Rechercher un spectacle..." triggerText="Sélectionner un spectacle"
                onSelect={(item: SearchItem) => setCampaignData(prev => ({ ...prev, eventId: item.id }))} />
              {campaignData.eventId && (
                <div className="mt-2 p-2 bg-muted rounded-md flex items-center justify-between">
                  <span className="text-sm">Spectacle sélectionné</span>
                  <Button variant="ghost" size="sm" onClick={() => setCampaignData(prev => ({ ...prev, eventId: null }))}><X className="h-4 w-4" /></Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Listes de contacts</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {contactLists.map(list => (
            <div key={list.id} className="flex items-center space-x-2">
              <Checkbox id={list.id} checked={campaignData.selectedLists.includes(list.id)}
                onCheckedChange={(checked) => {
                  setCampaignData(prev => ({
                    ...prev,
                    selectedLists: checked
                      ? [...prev.selectedLists, list.id]
                      : prev.selectedLists.filter(id => id !== list.id)
                  }));
                }} />
              <div className="flex-1">
                <Label htmlFor={list.id} className="font-medium">{list.name}</Label>
                <p className="text-sm text-muted-foreground">{list.contactCount} contacts</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Signature email</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="campaign-include-signature"
              checked={!!campaignData.includeSignature}
              onCheckedChange={(checked) =>
                setCampaignData(prev => ({ ...prev, includeSignature: !!checked }))
              }
            />
            <div className="flex-1">
              <Label htmlFor="campaign-include-signature" className="font-medium cursor-pointer">
                Inclure ma signature email
              </Label>
              <p className="text-sm text-muted-foreground">
                Votre signature personnelle (définie dans Préférences) sera ajoutée à la fin de chaque email envoyé.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
