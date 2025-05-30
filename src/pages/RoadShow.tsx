
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Route, Edit, Eye, Share, Download, MapPin, Clock, ExternalLink } from 'lucide-react';

interface RoadShow {
  id: string;
  title: string;
  event: string;
  artist: string;
  venue: string;
  address: string;
  date: string;
  showTime: string;
  checkTime: string;
  lastUpdated: string;
  sections: string[];
  collaborators: string[];
}

const sampleRoadShows: RoadShow[] = [
  {
    id: '1',
    title: 'Summer Festival 2024 Production Bible',
    event: 'Summer Music Festival 2024',
    artist: 'The Midnight Express',
    venue: 'Central Park',
    address: 'Central Park, New York, NY 10024, États-Unis',
    date: '2024-07-15',
    showTime: '20:00',
    checkTime: '16:00',
    lastUpdated: '2024-06-12',
    sections: ['Technical Rider', 'Stage Plot', 'Set List', 'Hospitality', 'Security', 'Marketing'],
    collaborators: ['Alice Johnson', 'Bob Miller', 'Sarah Wilson']
  },
  {
    id: '2',
    title: 'Acoustic Night Production Notes',
    event: 'Acoustic Night',
    artist: 'Sarah Mitchell',
    venue: 'Blue Note Jazz Club',
    address: '131 W 3rd St, New York, NY 10012, États-Unis',
    date: '2024-06-20',
    showTime: '21:30',
    checkTime: '18:00',
    lastUpdated: '2024-06-10',
    sections: ['Sound Requirements', 'Set List', 'Lighting', 'Hospitality'],
    collaborators: ['Alice Johnson', 'Mike Rodriguez']
  },
  {
    id: '3',
    title: 'Rock Legends Tour - MSG Show Bible',
    event: 'Rock Legends Tour',
    artist: 'Thunder Road',
    venue: 'Madison Square Garden',
    address: '4 Pennsylvania Plaza, New York, NY 10001, États-Unis',
    date: '2024-08-10',
    showTime: '19:30',
    checkTime: '15:00',
    lastUpdated: '2024-06-11',
    sections: ['Technical Rider', 'Stage Plot', 'Set List', 'Pyrotechnics', 'Security', 'VIP', 'Merchandise'],
    collaborators: ['Bob Miller', 'Sarah Wilson', 'Tom Anderson']
  }
];

export const RoadShow: React.FC = () => {
  const [roadShows, setRoadShows] = useState<RoadShow[]>(sampleRoadShows);
  const [selectedRoadShow, setSelectedRoadShow] = useState<RoadShow | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const getGoogleMapsUrl = (address: string) => {
    return `https://maps.google.com/?q=${encodeURIComponent(address)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tournée</h1>
          <p className="text-gray-600 mt-2">Documentation complète de production pour chaque spectacle</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Créer une Tournée
        </Button>
      </div>

      {!selectedRoadShow ? (
        /* Road Shows List */
        <div className="space-y-4">
          {roadShows.map((roadShow) => (
            <Card key={roadShow.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <Route className="h-5 w-5 text-purple-600" />
                      <h3 className="text-xl font-semibold text-gray-900">{roadShow.title}</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Événement</p>
                        <p className="font-medium">{roadShow.event}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Artiste</p>
                        <p className="font-medium">{roadShow.artist}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Lieu</p>
                        <p className="font-medium">{roadShow.venue}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date du spectacle</p>
                        <p className="font-medium">{new Date(roadShow.date).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Heure de checking</p>
                          <p className="font-medium">{roadShow.checkTime}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Heure du spectacle</p>
                          <p className="font-medium">{roadShow.showTime}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Adresse</p>
                          <a 
                            href={getGoogleMapsUrl(roadShow.address)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                          >
                            <span className="truncate max-w-48">{roadShow.address}</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-2">Sections ({roadShow.sections.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {roadShow.sections.map((section, index) => (
                          <Badge key={index} variant="outline">{section}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Dernière mise à jour: {new Date(roadShow.lastUpdated).toLocaleDateString()}</span>
                      <span>Collaborateurs: {roadShow.collaborators.join(', ')}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedRoadShow(roadShow)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Voir
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-3 w-3 mr-1" />
                      Modifier
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share className="h-3 w-3 mr-1" />
                      Partager
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Road Show Detail View */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => setSelectedRoadShow(null)}>
              ← Retour aux Tournées
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exporter PDF
              </Button>
              <Button variant="outline">
                <Share className="h-4 w-4 mr-2" />
                Partager
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{selectedRoadShow.title}</CardTitle>
              <div className="text-sm text-gray-600 space-y-2">
                <div>{selectedRoadShow.event} • {selectedRoadShow.artist} • {selectedRoadShow.venue}</div>
                <div className="flex items-center space-x-4">
                  <span>Check: {selectedRoadShow.checkTime}</span>
                  <span>Show: {selectedRoadShow.showTime}</span>
                  <a 
                    href={getGoogleMapsUrl(selectedRoadShow.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                  >
                    <MapPin className="h-3 w-3" />
                    <span>Voir sur Maps</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sections Navigation */}
                <div className="lg:col-span-1">
                  <h3 className="font-semibold text-gray-900 mb-3">Sections</h3>
                  <div className="space-y-2">
                    {selectedRoadShow.sections.map((section, index) => (
                      <button
                        key={index}
                        className="w-full text-left p-3 rounded-lg hover:bg-gray-50 text-sm border border-gray-200"
                      >
                        {section}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3">
                  <div className="bg-gray-50 rounded-lg p-6 min-h-96">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Technical Rider</h3>
                    <div className="space-y-4 text-gray-700">
                      <div>
                        <h4 className="font-medium mb-2">Sound Requirements</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>32-channel mixing console (Yamaha CL5 or equivalent)</li>
                          <li>Line array PA system - minimum 100dB SPL at FOH</li>
                          <li>16-channel monitor system with personal IEM capability</li>
                          <li>Drum kit with 8-piece mic setup</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Lighting Requirements</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Full LED wash system with RGBW capability</li>
                          <li>Moving head spots (minimum 12 units)</li>
                          <li>Haze machines for atmospheric effects</li>
                          <li>Follow spots (2 units minimum)</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Stage Requirements</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Stage dimensions: minimum 40' x 28'</li>
                          <li>Load-in height: minimum 16'</li>
                          <li>Power: 400A 3-phase service</li>
                          <li>Barricade: 4' height, minimum 10' from stage</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Road Show Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Créer une Nouvelle Tournée</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Titre de la tournée" />
              <Input placeholder="Nom de l'événement" />
              <Input placeholder="Artiste" />
              <Input placeholder="Lieu" />
              <Input placeholder="Adresse complète" />
              <Input type="date" placeholder="Date du spectacle" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Heure de checking</label>
                  <Input type="time" placeholder="Checking" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Heure du spectacle</label>
                  <Input type="time" placeholder="Spectacle" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Sections initiales</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Technical Rider', 'Stage Plot', 'Set List', 'Hospitality', 'Security', 'Marketing', 'Lighting', 'Transportation'].map((section) => (
                    <label key={section} className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span className="text-sm">{section}</span>
                    </label>
                  ))}
                </div>
              </div>
              <Input placeholder="Collaborateurs (séparés par des virgules)" />
              <div className="flex space-x-3 pt-4">
                <Button onClick={() => setShowCreateForm(false)} variant="outline" className="flex-1">
                  Annuler
                </Button>
                <Button onClick={() => setShowCreateForm(false)} className="flex-1 bg-purple-600 hover:bg-purple-700">
                  Créer la Tournée
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
