
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Mail, Eye, MousePointer, Users, TrendingUp, Filter } from 'lucide-react';

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  status: 'draft' | 'sent' | 'scheduled';
  createdAt: string;
  sentAt?: string;
  recipients: number;
  opened: number;
  clicked: number;
  filters: {
    eventTypes: string[];
    artists: string[];
    postalCodePrefix: string;
  };
}

interface EmailTracking {
  id: string;
  campaignId: string;
  contactId: string;
  contactEmail: string;
  contactName: string;
  sentAt: string;
  openedAt?: string;
  clickedAt?: string;
  status: 'sent' | 'opened' | 'clicked' | 'bounced';
}

const sampleCampaigns: EmailCampaign[] = [
  {
    id: '1',
    name: 'Promotion Festival Été 2024',
    subject: 'Découvrez nos spectacles pour l\'été !',
    content: 'Bonjour,\n\nNous avons le plaisir de vous présenter...',
    status: 'sent',
    createdAt: '2024-05-20T10:00:00',
    sentAt: '2024-05-21T14:00:00',
    recipients: 150,
    opened: 98,
    clicked: 23,
    filters: {
      eventTypes: ['festival'],
      artists: ['artist-1'],
      postalCodePrefix: '75'
    }
  },
  {
    id: '2',
    name: 'Campagne Mariages 2024',
    subject: 'Votre mariage avec nos artistes',
    content: 'Chers futurs mariés...',
    status: 'draft',
    createdAt: '2024-05-25T09:00:00',
    recipients: 0,
    opened: 0,
    clicked: 0,
    filters: {
      eventTypes: ['mariage'],
      artists: [],
      postalCodePrefix: ''
    }
  }
];

const sampleTrackingData: EmailTracking[] = [
  {
    id: '1',
    campaignId: '1',
    contactId: 'contact-1',
    contactEmail: 'john.smith@venue.com',
    contactName: 'John Smith',
    sentAt: '2024-05-21T14:00:00',
    openedAt: '2024-05-21T15:30:00',
    clickedAt: '2024-05-21T15:35:00',
    status: 'clicked'
  },
  {
    id: '2',
    campaignId: '1',
    contactId: 'contact-2',
    contactEmail: 'sarah@festivalprods.com',
    contactName: 'Sarah Wilson',
    sentAt: '2024-05-21T14:00:00',
    openedAt: '2024-05-21T16:20:00',
    status: 'opened'
  }
];

export const EmailCampaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>(sampleCampaigns);
  const [trackingData, setTrackingData] = useState<EmailTracking[]>(sampleTrackingData);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateOpenRate = (campaign: EmailCampaign) => {
    if (campaign.recipients === 0) return 0;
    return Math.round((campaign.opened / campaign.recipients) * 100);
  };

  const calculateClickRate = (campaign: EmailCampaign) => {
    if (campaign.recipients === 0) return 0;
    return Math.round((campaign.clicked / campaign.recipients) * 100);
  };

  const getCampaignTracking = (campaignId: string) => {
    return trackingData.filter(track => track.campaignId === campaignId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campagnes Email</h1>
          <p className="text-gray-600 mt-2">Gérer les campagnes promotionnelles et suivre les statistiques</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Campagne
        </Button>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {campaigns.map((campaign) => (
          <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold">{campaign.name}</h3>
                    <Badge className={getStatusColor(campaign.status)}>
                      {campaign.status === 'sent' ? 'Envoyée' : campaign.status === 'draft' ? 'Brouillon' : 'Programmée'}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-2">Objet: {campaign.subject}</p>
                  <p className="text-sm text-gray-500">
                    Créée le {new Date(campaign.createdAt).toLocaleDateString('fr-FR')}
                    {campaign.sentAt && ` • Envoyée le ${new Date(campaign.sentAt).toLocaleDateString('fr-FR')}`}
                  </p>
                </div>
              </div>

              {campaign.status === 'sent' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Envoyés</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{campaign.recipients}</p>
                  </div>

                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <Eye className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Ouverts</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">{campaign.opened}</p>
                    <p className="text-xs text-green-600">{calculateOpenRate(campaign)}%</p>
                  </div>

                  <div className="bg-orange-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <MousePointer className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-800">Clics</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-600">{campaign.clicked}</p>
                    <p className="text-xs text-orange-600">{calculateClickRate(campaign)}%</p>
                  </div>

                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">Taux de clic</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">
                      {campaign.opened > 0 ? Math.round((campaign.clicked / campaign.opened) * 100) : 0}%
                    </p>
                  </div>
                </div>
              )}

              {/* Filters Applied */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Filtres appliqués:</h4>
                <div className="flex flex-wrap gap-2">
                  {campaign.filters.eventTypes.map(type => (
                    <Badge key={type} variant="outline" className="text-xs">
                      Type: {type}
                    </Badge>
                  ))}
                  {campaign.filters.artists.map(artist => (
                    <Badge key={artist} variant="outline" className="text-xs">
                      Artiste: {artist}
                    </Badge>
                  ))}
                  {campaign.filters.postalCodePrefix && (
                    <Badge variant="outline" className="text-xs">
                      Code postal: {campaign.filters.postalCodePrefix}*
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex space-x-2">
                {campaign.status === 'draft' && (
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                    Envoyer
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => setSelectedCampaign(campaign)}>
                  Voir Détails
                </Button>
                {campaign.status === 'sent' && (
                  <Button size="sm" variant="outline">
                    Tracking Détaillé
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Campaign Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Créer une Nouvelle Campagne</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nom de la campagne *</label>
                  <Input placeholder="Nom de la campagne" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Objet de l'email *</label>
                  <Input placeholder="Objet de l'email" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Contenu de l'email *</label>
                <Textarea 
                  placeholder="Contenu de votre email..."
                  className="min-h-[200px]"
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Filtres des Destinataires
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Types d'événements</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="festival">Festival</SelectItem>
                        <SelectItem value="concert">Concert</SelectItem>
                        <SelectItem value="mariage">Mariage</SelectItem>
                        <SelectItem value="entreprise">Événement d'entreprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Artistes liés</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner artistes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="artist-1">The Midnight Express</SelectItem>
                        <SelectItem value="artist-2">Sarah Mitchell</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Code postal (début)</label>
                    <Input placeholder="ex: 75 pour Paris" />
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button onClick={() => setShowCreateForm(false)} variant="outline" className="flex-1">
                  Annuler
                </Button>
                <Button variant="outline" className="flex-1">
                  Sauvegarder Brouillon
                </Button>
                <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
                  Envoyer Maintenant
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Campaign Details Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedCampaign.name}</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setSelectedCampaign(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Détails de la campagne</h4>
                  <p><strong>Objet:</strong> {selectedCampaign.subject}</p>
                  <p><strong>Statut:</strong> {selectedCampaign.status}</p>
                  <p><strong>Créée le:</strong> {new Date(selectedCampaign.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>
                {selectedCampaign.status === 'sent' && (
                  <div>
                    <h4 className="font-medium mb-2">Statistiques</h4>
                    <p><strong>Destinataires:</strong> {selectedCampaign.recipients}</p>
                    <p><strong>Taux d'ouverture:</strong> {calculateOpenRate(selectedCampaign)}%</p>
                    <p><strong>Taux de clic:</strong> {calculateClickRate(selectedCampaign)}%</p>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-medium mb-2">Contenu</h4>
                <div className="bg-gray-50 p-4 rounded border">
                  <p className="whitespace-pre-wrap">{selectedCampaign.content}</p>
                </div>
              </div>

              {selectedCampaign.status === 'sent' && (
                <div>
                  <h4 className="font-medium mb-2">Tracking Détaillé</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {getCampaignTracking(selectedCampaign.id).map((track) => (
                      <div key={track.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{track.contactName}</p>
                          <p className="text-sm text-gray-600">{track.contactEmail}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={
                            track.status === 'clicked' ? 'bg-green-100 text-green-800' :
                            track.status === 'opened' ? 'bg-blue-100 text-blue-800' :
                            track.status === 'sent' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {track.status === 'clicked' ? 'Cliqué' :
                             track.status === 'opened' ? 'Ouvert' :
                             track.status === 'sent' ? 'Envoyé' : 'Erreur'}
                          </Badge>
                          {track.openedAt && (
                            <p className="text-xs text-gray-500 mt-1">
                              Ouvert: {new Date(track.openedAt).toLocaleDateString('fr-FR')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
