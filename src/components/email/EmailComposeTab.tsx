import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send } from 'lucide-react';

interface EmailDraft {
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  body: string;
  fromName: string;
  isHtml: boolean;
}

interface EmailComposeTabProps {
  draft: EmailDraft;
  onDraftChange: (draft: EmailDraft) => void;
  providers: any[];
  selectedProvider: string;
  onProviderChange: (id: string) => void;
  sending: boolean;
  onSend: () => void;
}

export const EmailComposeTab: React.FC<EmailComposeTabProps> = ({
  draft, onDraftChange, providers, selectedProvider, onProviderChange, sending, onSend
}) => {
  const update = (field: keyof EmailDraft, value: string | boolean) => {
    onDraftChange({ ...draft, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Composer un email
        </CardTitle>
        <CardDescription>
          Rédigez et envoyez un email via votre fournisseur préféré
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="to">Destinataire(s) *</Label>
          <Input id="to" type="email" value={draft.to}
            onChange={(e) => update('to', e.target.value)}
            placeholder="email@exemple.com, autre@exemple.com" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fromName">Nom d'expéditeur (alias)</Label>
            <Input id="fromName" value={draft.fromName}
              onChange={(e) => update('fromName', e.target.value)}
              placeholder="Votre nom ou alias" />
          </div>
          <div>
            <Label htmlFor="provider">Fournisseur d'envoi</Label>
            <Select value={selectedProvider} onValueChange={onProviderChange}>
              <SelectTrigger><SelectValue placeholder="Choisir le fournisseur" /></SelectTrigger>
              <SelectContent>
                {providers.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="cc">CC</Label>
            <Input id="cc" type="email" value={draft.cc}
              onChange={(e) => update('cc', e.target.value)} placeholder="Copie conforme" />
          </div>
          <div>
            <Label htmlFor="bcc">BCC</Label>
            <Input id="bcc" type="email" value={draft.bcc}
              onChange={(e) => update('bcc', e.target.value)} placeholder="Copie cachée" />
          </div>
        </div>

        <div>
          <Label htmlFor="subject">Sujet *</Label>
          <Input id="subject" value={draft.subject}
            onChange={(e) => update('subject', e.target.value)} placeholder="Sujet de l'email" />
        </div>

        <div>
          <Label htmlFor="body">Message</Label>
          <Textarea id="body" value={draft.body}
            onChange={(e) => update('body', e.target.value)}
            placeholder="Contenu de votre email..." rows={12} />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isHtml" checked={draft.isHtml}
              onChange={(e) => update('isHtml', e.target.checked)} />
            <Label htmlFor="isHtml">Format HTML</Label>
          </div>
          <Button onClick={onSend}
            disabled={sending || !draft.to || !draft.subject || providers.length === 0}
            className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            {sending ? 'Envoi...' : 'Envoyer'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
