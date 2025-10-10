
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Send, Eye, Paperclip, X } from 'lucide-react';
import { EmailEditor } from '@/components/EmailEditor/EmailEditor';
import { EmailBlock } from '@/components/EmailEditor/types';
import { toast } from 'sonner';
import { useFileUpload } from '@/hooks/useFileUpload';
import { supabase } from '@/integrations/supabase/client';

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  contactListIds: string[];
  blocks: EmailBlock[];
  status: 'draft' | 'scheduled' | 'sent';
  scheduledDate?: string;
  attachments?: Array<{name: string; url: string}>;
}

interface ContactList {
  id: string;
  name: string;
  contactCount: number;
}

interface EmailCampaignEditorProps {
  campaign: EmailCampaign;
  contactLists: ContactList[];
  onSave: (campaign: EmailCampaign) => void;
  onBack: () => void;
}

export const EmailCampaignEditor: React.FC<EmailCampaignEditorProps> = ({
  campaign,
  contactLists,
  onSave,
  onBack
}) => {
  const [editedCampaign, setEditedCampaign] = useState<EmailCampaign>(campaign);
  const [attachments, setAttachments] = useState<File[]>([]);
  const { isUploading } = useFileUpload();
  const [uploading, setUploading] = useState(false);

  const handleSave = () => {
    if (!editedCampaign.name.trim() || !editedCampaign.subject.trim()) {
      toast.error('Veuillez remplir le nom et l\'objet de la campagne');
      return;
    }
    
    if (editedCampaign.contactListIds.length === 0) {
      toast.error('Veuillez sélectionner au moins une liste de contacts');
      return;
    }

    onSave(editedCampaign);
    toast.success('Campagne sauvegardée');
  };

  const handleSend = () => {
    if (!editedCampaign.name.trim() || !editedCampaign.subject.trim()) {
      toast.error('Veuillez remplir le nom et l\'objet de la campagne');
      return;
    }
    
    if (editedCampaign.contactListIds.length === 0) {
      toast.error('Veuillez sélectionner au moins une liste de contacts');
      return;
    }

    // Save first, then send
    const campaignToSend = { ...editedCampaign, status: 'draft' as const };
    onSave(campaignToSend);
  };

  const handleBlocksChange = (blocks: EmailBlock[]) => {
    setEditedCampaign({ ...editedCampaign, blocks });
  };

  const getTotalContacts = () => {
    return editedCampaign.contactListIds.reduce((total, listId) => {
      const list = contactLists.find(l => l.id === listId);
      return total + (list ? list.contactCount : 0);
    }, 0);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files);
    setAttachments(prev => [...prev, ...newFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveWithAttachments = async () => {
    if (!editedCampaign.name.trim() || !editedCampaign.subject.trim()) {
      toast.error('Veuillez remplir le nom et l\'objet de la campagne');
      return;
    }
    
    if (editedCampaign.contactListIds.length === 0) {
      toast.error('Veuillez sélectionner au moins une liste de contacts');
      return;
    }

    try {
      setUploading(true);
      const attachmentUrls: Array<{name: string; url: string}> = [];
      
      if (attachments.length > 0) {
        for (const file of attachments) {
          const fileName = `campaign-attachments/${Date.now()}-${file.name}`;
          const { data, error } = await supabase.storage
            .from('app-files')
            .upload(fileName, file);

          if (error) throw error;

          const { data: { publicUrl } } = supabase.storage
            .from('app-files')
            .getPublicUrl(fileName);

          attachmentUrls.push({ name: file.name, url: publicUrl });
        }
      }

      const campaignWithAttachments = {
        ...editedCampaign,
        attachments: attachmentUrls.length > 0 ? attachmentUrls : editedCampaign.attachments
      };

      onSave(campaignWithAttachments);
      toast.success('Campagne sauvegardée');
      setAttachments([]);
    } catch (error: any) {
      console.error('Error uploading attachments:', error);
      toast.error('Erreur lors de l\'upload des pièces jointes');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-xl font-bold">{editedCampaign.name}</h1>
              <p className="text-sm text-gray-600">
                {getTotalContacts()} destinataires sélectionnés
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleSaveWithAttachments} disabled={uploading}>
              <Save className="h-4 w-4 mr-2" />
              {uploading ? 'Upload...' : 'Sauvegarder'}
            </Button>
            <Button onClick={handleSend} className="bg-purple-600 hover:bg-purple-700">
              <Send className="h-4 w-4 mr-2" />
              Envoyer
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Paramètres de la campagne</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom de la campagne</label>
                <Input
                  value={editedCampaign.name}
                  onChange={(e) => setEditedCampaign({ ...editedCampaign, name: e.target.value })}
                  placeholder="ex: Newsletter Juillet 2024"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Objet de l'email</label>
                <Input
                  value={editedCampaign.subject}
                  onChange={(e) => setEditedCampaign({ ...editedCampaign, subject: e.target.value })}
                  placeholder="ex: Nos nouveautés du mois"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Listes de contacts</label>
              <Select
                value=""
                onValueChange={(value) => {
                  if (value && !editedCampaign.contactListIds.includes(value)) {
                    setEditedCampaign({
                      ...editedCampaign,
                      contactListIds: [...editedCampaign.contactListIds, value]
                    });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ajouter une liste" />
                </SelectTrigger>
                <SelectContent>
                  {contactLists
                    .filter(list => !editedCampaign.contactListIds.includes(list.id))
                    .map((list) => (
                      <SelectItem key={list.id} value={list.id}>
                        {list.name} ({list.contactCount} contacts)
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              {editedCampaign.contactListIds.length > 0 && (
                <div className="mt-2 space-y-1">
                  {editedCampaign.contactListIds.map((listId) => {
                    const list = contactLists.find(l => l.id === listId);
                    return list ? (
                      <div key={listId} className="flex items-center justify-between bg-gray-100 rounded px-3 py-2">
                        <span className="text-sm">{list.name} ({list.contactCount} contacts)</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditedCampaign({
                            ...editedCampaign,
                            contactListIds: editedCampaign.contactListIds.filter(id => id !== listId)
                          })}
                        >
                          ×
                        </Button>
                      </div>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Pièces jointes</label>
              <input
                id="campaign-attachments"
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('campaign-attachments')?.click()}
                className="w-full"
              >
                <Paperclip className="h-4 w-4 mr-2" />
                Ajouter des pièces jointes
              </Button>
              
              {attachments.length > 0 && (
                <div className="mt-2 space-y-1">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-accent/50 rounded-md">
                      <span className="text-sm truncate flex-1">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex-1">
          <EmailEditor
            initialBlocks={editedCampaign.blocks}
            onSave={handleBlocksChange}
            onPreview={(blocks) => console.log('Preview blocks:', blocks)}
          />
        </div>
      </div>
    </div>
  );
};
