
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Mail, Send, Users, Calendar, Edit, Trash2, Eye } from 'lucide-react';
import { EmailEditor } from '@/components/EmailEditor/EmailEditor';
import { EmailBlock } from '@/components/EmailEditor/types';
import { toast } from 'sonner';

interface ContactList {
  id: string;
  name: string;
  contactCount: number;
}

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  contactListIds: string[];
  blocks: EmailBlock[];
  status: 'draft' | 'scheduled' | 'sent';
  scheduledDate?: string;
  sentDate?: string;
  createdAt: string;
  stats?: {
    sent: number;
    opened: number;
    clicked: number;
  };
}

const sampleContactLists: ContactList[] = [
  { id: '1', name: 'Organisateurs de festivals', contactCount: 45 },
  { id: '2', name: 'Salles de concert Paris', contactCount: 23 },
  { id: '3', name: 'Médias spécialisés', contactCount: 67 },
  { id: '4', name: 'Clients VIP', contactCount: 12 },
];

const sampleCampaigns: EmailCampaign[] = [
  {
    id: '1',
    name: 'Newsletter Juin 2024',
    subject: 'Nos nouveautés du mois de juin',
    contactListIds: ['1', '3'],
    blocks: [],
    status: 'sent',
    sentDate: '2024-06-01',
    createdAt: '2024-05-25',
    stats: { sent: 112, opened: 89, clicked: 23 }
  },
  {
    id: '2',
    name: 'Promo Summer Festival',
    subject: 'Réductions exclusives pour vos événements d\'été',
    contactListIds: ['1', '2'],
    blocks: [],
    status: 'scheduled',
    scheduledDate: '2024-06-15',
    createdAt: '2024-06-10'
  },
  {
    id: '3',
    name: 'Nouveau spectacle Thunder Road',
    subject: 'Découvrez le nouveau spectacle de Thunder Road',
    contactListIds: ['1', '2', '3'],
    blocks: [],
    status: 'draft',
    createdAt: '2024-06-12'
  }
];

export const EmailCampaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>(sampleCampaigns);
  const [contactLists] = useState<ContactList[]>(sampleContactLists);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<EmailCampaign | null>(null);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    subject: '',
    contactListIds: [] as string[]
  });

  const handleCreateCampaign = () => {
    if (!newCampaign.name.trim() || !newCampaign.subject.trim() || newCampaign.contactListIds.length === 0) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const campaign: EmailCampaign = {
      id: Date.now().toString(),
      name: newCampaign.name,
      subject: newCampaign.subject,
      contactListIds: newCampaign.contactListIds,
      blocks: [],
      status: 'draft',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setCampaigns(prev => [...prev, campaign]);
    setNewCampaign({ name: '', subject: '', contactListIds: [] });
    setShowCreateDialog(false);
    toast.success('Campagne créée');
  };

  const handleEditCampaign = (campaign: EmailCampaign) => {
    setEditingCampaign(campaign);
    setShowEditor(true);
  };

  const handleSaveDesign = (blocks: EmailBlock[]) => {
    if (editingCampaign) {
      setCampaigns(prev => prev.map(campaign =>
        campaign.id === editingCampaign.id
          ? { ...campaign, blocks }
          : campaign
      ));
      setShowEditor(false);
      setEditingCampaign(null);
      toast.success('Design sauvegardé');
    }
  };

  const handleDeleteCampaign = (id: string) => {
    setCampaigns(prev => prev.filter(campaign => campaign.id !== id));
    toast.success('Campagne supprimée');
  };

  const getContactListNames = (listIds: string[]) => {
    return listIds.map(id => {
      const list = contactLists.find(l => l.id === id);
      return list ? list.name : 'Liste inconnue';
    }).join(', ');
  };

  const getTotalContacts = (listIds: string[]) => {
    return listIds.reduce((total, id) => {
      const list = contactLists.find(l => l.id === id);
      return total + (list ? list.contactCount : 0);
    }, 0);
  };

  const getStatusBadge = (status: EmailCampaign['status']) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Brouillon</Badge>;
      case 'scheduled':
        return <Badge className="bg-yellow-100 text-yellow-800">Programmée</Badge>;
      case 'sent':
        return <Badge className="bg-green-100 text-green-800">Envoyée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (showEditor && editingCampaign) {
    return (
      <EmailEditor
        initialBlocks={editingCampaign.blocks}
        onSave={handleSaveDesign}
        onPreview={(blocks) => console.log('Preview:', blocks)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campagnes Email</h1>
          <p className="text-gray-600 mt-2">Créez et gérez vos campagnes email marketing</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Campagne
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une nouvelle campagne</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la campagne</label>
                <Input
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  placeholder="ex: Newsletter Juillet 2024"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Objet de l'email</label>
                <Input
                  value={newCampaign.subject}
                  onChange={(e) => setNewCampaign({ ...newCampaign, subject: e.target.value })}
                  placeholder="ex: Nos nouveautés du mois"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Listes de contacts</label>
                <Select
                  value=""
                  onValueChange={(value) => {
                    if (value && !newCampaign.contactListIds.includes(value)) {
                      setNewCampaign({
                        ...newCampaign,
                        contactListIds: [...newCampaign.contactListIds, value]
                      });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une liste" />
                  </SelectTrigger>
                  <SelectContent>
                    {contactLists
                      .filter(list => !newCampaign.contactListIds.includes(list.id))
                      .map((list) => (
                        <SelectItem key={list.id} value={list.id}>
                          {list.name} ({list.contactCount} contacts)
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {newCampaign.contactListIds.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {newCampaign.contactListIds.map((listId) => {
                      const list = contactLists.find(l => l.id === listId);
                      return list ? (
                        <div key={listId} className="flex items-center justify-between bg-gray-100 rounded px-2 py-1">
                          <span className="text-sm">{list.name} ({list.contactCount} contacts)</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setNewCampaign({
                              ...newCampaign,
                              contactListIds: newCampaign.contactListIds.filter(id => id !== listId)
                            })}
                          >
                            ×
                          </Button>
                        </div>
                      ) : null;
                    })}
                    <p className="text-sm text-gray-600 mt-2">
                      Total: {getTotalContacts(newCampaign.contactListIds)} contacts
                    </p>
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1">
                  Annuler
                </Button>
                <Button onClick={handleCreateCampaign} className="flex-1">
                  Créer la campagne
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Mail className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total campagnes</p>
                <p className="text-2xl font-bold text-gray-900">{campaigns.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Send className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Emails envoyés</p>
                <p className="text-2xl font-bold text-gray-900">
                  {campaigns.reduce((total, c) => total + (c.stats?.sent || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Taux d'ouverture moyen</p>
                <p className="text-2xl font-bold text-gray-900">79%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total contacts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {contactLists.reduce((total, list) => total + list.contactCount, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <Card>
        <CardHeader>
          <CardTitle>Vos campagnes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                      {getStatusBadge(campaign.status)}
                    </div>
                    <p className="text-gray-600 mb-2">{campaign.subject}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>
                        <Users className="h-4 w-4 inline mr-1" />
                        {getTotalContacts(campaign.contactListIds)} contacts
                      </span>
                      <span>
                        <Calendar className="h-4 w-4 inline mr-1" />
                        Créée le {new Date(campaign.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                      {campaign.stats && (
                        <span>
                          Ouvertures: {Math.round((campaign.stats.opened / campaign.stats.sent) * 100)}%
                        </span>
                      )}
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">
                        Listes: {getContactListNames(campaign.contactListIds)}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditCampaign(campaign)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteCampaign(campaign.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
