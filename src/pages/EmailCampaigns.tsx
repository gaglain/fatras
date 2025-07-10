
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Mail, Search, Send, Users, BarChart3, Edit, Trash2, Eye, Clock } from 'lucide-react';
import { GlobalFileUpload } from '@/components/GlobalFileUpload';
import { toast } from 'sonner';

interface Campaign {
  id: string;
  name: string;
  subject: string;
  type: 'newsletter' | 'promotional' | 'event' | 'follow-up';
  status: 'draft' | 'scheduled' | 'sent' | 'paused';
  recipientsCount: number;
  openRate?: number;
  clickRate?: number;
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
  content?: string;
  targetAudience?: string[];
}

export const EmailCampaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);

  console.log('📧 EmailCampaigns - Page loaded with', campaigns.length, 'campaigns');

  // Simulation de données
  useEffect(() => {
    const mockCampaigns: Campaign[] = [
      {
        id: '1',
        name: 'Newsletter Janvier 2024',
        subject: 'Nouveautés et événements du mois',
        type: 'newsletter',
        status: 'sent',
        recipientsCount: 245,
        openRate: 68.5,
        clickRate: 12.3,
        sentAt: '2024-01-15T10:00:00',
        createdAt: '2024-01-10',
        content: 'Newsletter mensuelle avec les dernières actualités...',
        targetAudience: ['clients', 'prospects']
      },
      {
        id: '2',
        name: 'Promotion Saint-Valentin',
        subject: '💕 Offre spéciale Saint-Valentin - 20% de réduction',
        type: 'promotional',
        status: 'scheduled',
        recipientsCount: 180,
        scheduledAt: '2024-02-10T09:00:00',
        createdAt: '2024-01-25',
        content: 'Campagne promotionnelle pour la Saint-Valentin...',
        targetAudience: ['clients']
      },
      {
        id: '3',
        name: 'Invitation Concert Jazz',
        subject: 'Vous êtes invité à notre concert jazz exclusif',
        type: 'event',
        status: 'draft',
        recipientsCount: 120,
        createdAt: '2024-01-28',
        content: 'Invitation personnalisée pour le concert jazz...',
        targetAudience: ['VIP', 'jazz-lovers']
      }
    ];

    setTimeout(() => {
      setCampaigns(mockCampaigns);
      setLoading(false);
    }, 500);
  }, []);

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCampaign = () => {
    console.log('➕ Creating new campaign');
    setShowCreateForm(true);
    toast.info('Éditeur de campagne email (à implémenter)');
  };

  const handleEditCampaign = (campaignId: string) => {
    console.log('✏️ Editing campaign:', campaignId);
    toast.info('Édition de campagne (à implémenter)');
  };

  const handleDeleteCampaign = (campaignId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette campagne ?')) {
      console.log('🗑️ Deleting campaign:', campaignId);
      setCampaigns(prev => prev.filter(c => c.id !== campaignId));
      toast.success('Campagne supprimée');
    }
  };

  const handleSendCampaign = (campaignId: string) => {
    console.log('📤 Sending campaign:', campaignId);
    toast.success('Campagne envoyée avec succès !');
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId 
        ? { ...c, status: 'sent' as const, sentAt: new Date().toISOString() }
        : c
    ));
  };

  const handleFileUploaded = (file: { url: string; name: string; type: string }) => {
    console.log('📎 File uploaded for campaigns:', file);
    toast.success(`Template "${file.name}" ajouté aux campagnes`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'paused': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'newsletter': return 'bg-purple-100 text-purple-800';
      case 'promotional': return 'bg-red-100 text-red-800';
      case 'event': return 'bg-blue-100 text-blue-800';
      case 'follow-up': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Chargement des campagnes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6" style={{
      background: 'var(--custom-background, #ffffff)',
      color: 'var(--custom-text, #18181b)',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Mail className="h-8 w-8 mr-3 text-blue-600" />
            Campagnes Email
          </h1>
          <p className="mt-2 text-gray-600">
            {campaigns.length} campagne{campaigns.length !== 1 ? 's' : ''} • {
              campaigns.reduce((sum, c) => sum + c.recipientsCount, 0)
            } destinataires au total
          </p>
        </div>
        <Button onClick={handleCreateCampaign} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Campagne
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Envoyées</p>
                <p className="text-2xl font-bold">
                  {campaigns.filter(c => c.status === 'sent').length}
                </p>
              </div>
              <Send className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taux d'ouverture moyen</p>
                <p className="text-2xl font-bold">
                  {campaigns.filter(c => c.openRate).length > 0 
                    ? Math.round(campaigns.reduce((sum, c) => sum + (c.openRate || 0), 0) / campaigns.filter(c => c.openRate).length)
                    : 0}%
                </p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taux de clic moyen</p>
                <p className="text-2xl font-bold">
                  {campaigns.filter(c => c.clickRate).length > 0 
                    ? Math.round(campaigns.reduce((sum, c) => sum + (c.clickRate || 0), 0) / campaigns.filter(c => c.clickRate).length * 10) / 10
                    : 0}%
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Programmées</p>
                <p className="text-2xl font-bold">
                  {campaigns.filter(c => c.status === 'scheduled').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher par nom, sujet ou type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Upload de templates */}
      <Card>
        <CardHeader>
          <CardTitle>Templates Email</CardTitle>
        </CardHeader>
        <CardContent>
          <GlobalFileUpload
            onFileUploaded={handleFileUploaded}
            acceptedTypes=".html,.png,.jpg,.jpeg"
            label="Télécharger des templates HTML ou images"
            maxSize={5}
            multiple={true}
          />
        </CardContent>
      </Card>

      {/* Campaigns List */}
      <div className="grid gap-6">
        {filteredCampaigns.map((campaign) => (
          <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold">{campaign.name}</h3>
                    <Badge className={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                    <Badge className={getTypeColor(campaign.type)}>
                      {campaign.type}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-2 font-medium">{campaign.subject}</p>
                  {campaign.content && (
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{campaign.content}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  {campaign.status === 'draft' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSendCampaign(campaign.id)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditCampaign(campaign.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteCampaign(campaign.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center space-x-2 text-sm">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span>{campaign.recipientsCount} destinataires</span>
                </div>
                
                {campaign.openRate && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Eye className="h-4 w-4 text-blue-500" />
                    <span>{campaign.openRate}% d'ouverture</span>
                  </div>
                )}

                {campaign.clickRate && (
                  <div className="flex items-center space-x-2 text-sm">
                    <BarChart3 className="h-4 w-4 text-purple-500" />
                    <span>{campaign.clickRate}% de clic</span>
                  </div>
                )}

                <div className="text-sm text-gray-500">
                  {campaign.sentAt && `Envoyée le ${formatDate(campaign.sentAt)}`}
                  {campaign.scheduledAt && `Programmée pour le ${formatDate(campaign.scheduledAt)}`}
                  {!campaign.sentAt && !campaign.scheduledAt && `Créée le ${formatDate(campaign.createdAt)}`}
                </div>
              </div>

              {campaign.targetAudience && campaign.targetAudience.length > 0 && (
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-medium">Audience:</span>
                  <div className="flex flex-wrap gap-1">
                    {campaign.targetAudience.map((audience, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {audience}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCampaigns.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucune campagne trouvée</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Aucune campagne ne correspond à votre recherche.' : 'Commencez par créer votre première campagne email.'}
            </p>
            {!searchTerm && (
              <Button onClick={handleCreateCampaign}>
                <Plus className="h-4 w-4 mr-2" />
                Créer une campagne
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
