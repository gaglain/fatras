
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, BookOpen, Edit, Eye, Upload, Play, Music, Users, Utensils, Mic, FileText, Image, Film, Volume2, ArrowLeft, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Artist {
  id: string;
  name: string;
  genre: string;
  bio: string;
  photo: string;
  videos: MediaFile[];
  audios: MediaFile[];
  images: MediaFile[];
  documents: MediaFile[];
  setLists: SetList[];
  technicalOrders: TechnicalOrder[];
  cateringOrders: CateringOrder[];
  castings: Casting[];
  lastUpdated: string;
}

interface MediaFile {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'image' | 'document';
  url: string;
  size?: string;
  uploadDate: string;
}

interface SetList {
  id: string;
  name: string;
  songs: string[];
  duration: string;
  notes: string;
}

interface TechnicalOrder {
  id: string;
  category: string;
  items: string[];
  priority: 'high' | 'medium' | 'low';
  notes: string;
}

interface CateringOrder {
  id: string;
  meal: string;
  items: string[];
  allergies: string[];
  notes: string;
}

interface Casting {
  id: string;
  role: string;
  requirements: string[];
  contact: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

const sampleArtists: Artist[] = [
  {
    id: '1',
    name: 'The Midnight Express',
    genre: 'Rock',
    bio: 'The Midnight Express est un groupe de rock haute énergie formé en 2018. Connu pour ses performances électrisantes et ses hits au sommet des charts, ils ont tourné à l\'international et remporté plusieurs prix musicaux.',
    photo: '/placeholder.svg',
    videos: [
      { id: '1', name: 'Concert Highlights', type: 'video', url: '#', uploadDate: '2024-06-01' },
      { id: '2', name: 'Behind the Scenes', type: 'video', url: '#', uploadDate: '2024-06-05' }
    ],
    audios: [
      { id: '1', name: 'Demo Track 1', type: 'audio', url: '#', uploadDate: '2024-05-20' },
      { id: '2', name: 'Live Recording', type: 'audio', url: '#', uploadDate: '2024-05-25' }
    ],
    images: [
      { id: '1', name: 'Promo Photo 1', type: 'image', url: '/placeholder.svg', uploadDate: '2024-05-15' },
      { id: '2', name: 'Band Photo', type: 'image', url: '/placeholder.svg', uploadDate: '2024-05-18' }
    ],
    documents: [
      { id: '1', name: 'Press Kit', type: 'document', url: '#', uploadDate: '2024-05-10' }
    ],
    setLists: [
      {
        id: '1',
        name: 'Set Festival',
        songs: ['Opening Thunder', 'Midnight Train', 'Electric Dreams', 'Final Call'],
        duration: '45 minutes',
        notes: 'Ouverture haute énergie pour festivals'
      }
    ],
    technicalOrders: [
      {
        id: '1',
        category: 'Son',
        items: ['Console 32 canaux', 'Haut-parleurs line array', 'Système de retours'],
        priority: 'high',
        notes: 'Critique pour la qualité de performance'
      }
    ],
    cateringOrders: [
      {
        id: '1',
        meal: 'Dîner pré-spectacle',
        items: ['Poulet grillé', 'Pâtes végétariennes', 'Salades fraîches', 'Boissons énergisantes'],
        allergies: ['Noix', 'Fruits de mer'],
        notes: '2 heures avant le spectacle'
      }
    ],
    castings: [
      {
        id: '1',
        role: 'Choriste',
        requirements: ['Forte tessiture', 'Expérience scénique', 'Disponible pour tournée'],
        contact: 'sarah@example.com',
        status: 'confirmed'
      }
    ],
    lastUpdated: '2024-06-12'
  },
  {
    id: '2',
    name: 'Sarah Mitchell',
    genre: 'Folk/Acoustique',
    bio: 'L\'auteure-compositrice-interprète Sarah Mitchell apporte des paroles sincères et des mélodies acoustiques dans des lieux intimes. Sa musique connecte profondément avec le public à travers la narration personnelle.',
    photo: '/placeholder.svg',
    videos: [
      { id: '1', name: 'Sessions Acoustiques', type: 'video', url: '#', uploadDate: '2024-06-01' }
    ],
    audios: [
      { id: '1', name: 'Album Demo', type: 'audio', url: '#', uploadDate: '2024-05-30' }
    ],
    images: [
      { id: '1', name: 'Portrait Artistique', type: 'image', url: '/placeholder.svg', uploadDate: '2024-05-12' }
    ],
    documents: [],
    setLists: [
      {
        id: '1',
        name: 'Soirée Intime',
        songs: ['Whispered Dreams', 'Mountain Song', 'City Lights', 'Coming Home'],
        duration: '60 minutes',
        notes: 'Parfait pour les lieux acoustiques'
      }
    ],
    technicalOrders: [
      {
        id: '1',
        category: 'Son',
        items: ['Micro guitare acoustique', 'Microphone vocal', 'Petit système de sonorisation'],
        priority: 'medium',
        notes: 'Garder simple et naturel'
      }
    ],
    cateringOrders: [
      {
        id: '1',
        meal: 'Rafraîchissements légers',
        items: ['Tisane', 'Fruits frais', 'Miel'],
        allergies: ['Produits laitiers'],
        notes: 'Options respectueuses de la voix'
      }
    ],
    castings: [],
    lastUpdated: '2024-06-10'
  }
];

export const ShowBible: React.FC = () => {
  const navigate = useNavigate();
  const [artists, setArtists] = useState<Artist[]>(sampleArtists);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState('bio');
  const [uploadType, setUploadType] = useState<'video' | 'audio' | 'image' | 'document' | null>(null);
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);

  const handleFileUpload = (type: 'video' | 'audio' | 'image' | 'document') => {
    setUploadType(type);
    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'image' ? 'image/*' : type === 'video' ? 'video/*' : type === 'audio' ? 'audio/*' : '.pdf,.doc,.docx,.txt';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && selectedArtist) {
        // Simulate file upload
        const newFile: MediaFile = {
          id: Date.now().toString(),
          name: file.name,
          type,
          url: URL.createObjectURL(file),
          uploadDate: new Date().toISOString().split('T')[0]
        };
        
        setArtists(prev => prev.map(artist => 
          artist.id === selectedArtist.id 
            ? { ...artist, [type + 's']: [...artist[type + 's'], newFile] }
            : artist
        ));
        
        if (selectedArtist) {
          setSelectedArtist({ ...selectedArtist, [type + 's']: [...selectedArtist[type + 's'], newFile] });
        }
      }
    };
    input.click();
  };

  const handleDeleteArtist = (artistId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet artiste et sa bible ?')) {
      setArtists(prev => prev.filter(artist => artist.id !== artistId));
      if (selectedArtist?.id === artistId) {
        setSelectedArtist(null);
      }
    }
  };

  const handleEditArtist = (artist: Artist) => {
    setEditingArtist(artist);
    setShowCreateForm(true);
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'video': return <Film className="h-4 w-4" />;
      case 'audio': return <Volume2 className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bible de Spectacle</h1>
          <p className="text-gray-600 mt-2">Profils d'artistes complets avec bio, médias, set lists et exigences de production</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate('/artists')}>
            <Users className="h-4 w-4 mr-2" />
            Gérer les Artistes
          </Button>
          <Button onClick={() => setShowCreateForm(true)} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter Artiste
          </Button>
        </div>
      </div>

      {!selectedArtist ? (
        /* Artists List */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artists.map((artist) => (
            <Card key={artist.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <img 
                    src={artist.photo} 
                    alt={artist.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">{artist.name}</h3>
                    <Badge variant="outline">{artist.genre}</Badge>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{artist.bio}</p>
                
                <div className="space-y-2 text-sm text-gray-500 mb-4">
                  <div className="flex items-center justify-between">
                    <span>Set Lists:</span>
                    <Badge variant="secondary">{artist.setLists.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Vidéos:</span>
                    <Badge variant="secondary">{artist.videos.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Commandes Techniques:</span>
                    <Badge variant="secondary">{artist.technicalOrders.length}</Badge>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setSelectedArtist(artist)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Voir
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditArtist(artist)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Modifier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteArtist(artist.id)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="text-xs text-gray-400 mt-3">
                  Dernière mise à jour: {new Date(artist.lastUpdated).toLocaleDateString('fr-FR')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Artist Detail View */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => setSelectedArtist(null)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux Artistes
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => handleEditArtist(selectedArtist)}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier Profil
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDeleteArtist(selectedArtist.id)}
                className="text-red-600 hover:text-red-800 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <img 
                  src={selectedArtist.photo} 
                  alt={selectedArtist.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div>
                  <CardTitle className="text-2xl">{selectedArtist.name}</CardTitle>
                  <Badge variant="outline" className="mt-2">{selectedArtist.genre}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-7">
                  <TabsTrigger value="bio">Bio</TabsTrigger>
                  <TabsTrigger value="videos">Vidéos</TabsTrigger>
                  <TabsTrigger value="audios">Audios</TabsTrigger>
                  <TabsTrigger value="images">Images</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="setlists">Set Lists</TabsTrigger>
                  <TabsTrigger value="production">Production</TabsTrigger>
                </TabsList>

                <TabsContent value="bio" className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-3">Biographie</h3>
                    <p className="text-gray-700 leading-relaxed">{selectedArtist.bio}</p>
                  </div>
                </TabsContent>

                <TabsContent value="videos" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Vidéos</h3>
                      <Button size="sm" onClick={() => handleFileUpload('video')}>
                        <Upload className="h-4 w-4 mr-2" />
                        Télécharger Vidéo
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedArtist.videos.map((video) => (
                        <Card key={video.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                              <Film className="h-8 w-8 text-purple-600" />
                              <div>
                                <p className="font-medium">{video.name}</p>
                                <p className="text-sm text-gray-500">
                                  Téléchargé le {new Date(video.uploadDate).toLocaleDateString('fr-FR')}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="audios" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Fichiers Audio</h3>
                      <Button size="sm" onClick={() => handleFileUpload('audio')}>
                        <Upload className="h-4 w-4 mr-2" />
                        Télécharger Audio
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedArtist.audios.map((audio) => (
                        <Card key={audio.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                              <Volume2 className="h-8 w-8 text-purple-600" />
                              <div>
                                <p className="font-medium">{audio.name}</p>
                                <p className="text-sm text-gray-500">
                                  Téléchargé le {new Date(audio.uploadDate).toLocaleDateString('fr-FR')}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="images" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Images</h3>
                      <Button size="sm" onClick={() => handleFileUpload('image')}>
                        <Upload className="h-4 w-4 mr-2" />
                        Télécharger Image
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {selectedArtist.images.map((image) => (
                        <Card key={image.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <img 
                              src={image.url} 
                              alt={image.name}
                              className="w-full h-32 object-cover rounded-md mb-2"
                            />
                            <p className="font-medium text-sm">{image.name}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(image.uploadDate).toLocaleDateString('fr-FR')}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="documents" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Documents</h3>
                      <Button size="sm" onClick={() => handleFileUpload('document')}>
                        <Upload className="h-4 w-4 mr-2" />
                        Télécharger Document
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedArtist.documents.map((doc) => (
                        <Card key={doc.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                              <FileText className="h-8 w-8 text-purple-600" />
                              <div>
                                <p className="font-medium">{doc.name}</p>
                                <p className="text-sm text-gray-500">
                                  Téléchargé le {new Date(doc.uploadDate).toLocaleDateString('fr-FR')}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="setlists" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Set Lists</h3>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter Set List
                      </Button>
                    </div>
                    {selectedArtist.setLists.map((setList) => (
                      <Card key={setList.id}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <Music className="h-5 w-5 text-purple-600" />
                              <h4 className="text-lg font-semibold">{setList.name}</h4>
                            </div>
                            <Badge variant="outline">{setList.duration}</Badge>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600 mb-3">{setList.notes}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {setList.songs.map((song, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                  <span className="text-sm font-mono text-gray-500">{index + 1}.</span>
                                  <span className="text-sm">{song}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="production" className="space-y-4">
                  <Tabs defaultValue="technical">
                    <TabsList>
                      <TabsTrigger value="technical">Technique</TabsTrigger>
                      <TabsTrigger value="catering">Catering</TabsTrigger>
                      <TabsTrigger value="castings">Castings</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="technical" className="space-y-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Commandes Techniques</h3>
                          <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Ajouter Commande
                          </Button>
                        </div>
                        {selectedArtist.technicalOrders.map((order) => (
                          <Card key={order.id}>
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-semibold">{order.category}</h4>
                                <Badge className={
                                  order.priority === 'high' ? 'bg-red-100 text-red-800' :
                                  order.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }>
                                  Priorité {order.priority}
                                </Badge>
                              </div>
                              <ul className="space-y-1 mb-3">
                                {order.items.map((item, index) => (
                                  <li key={index} className="text-sm flex items-center space-x-2">
                                    <span>•</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                              <p className="text-sm text-gray-600">{order.notes}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="catering" className="space-y-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Commandes Catering</h3>
                          <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Ajouter Commande
                          </Button>
                        </div>
                        {selectedArtist.cateringOrders.map((order) => (
                          <Card key={order.id}>
                            <CardContent className="p-6">
                              <div className="flex items-center space-x-3 mb-4">
                                <Utensils className="h-5 w-5 text-purple-600" />
                                <h4 className="text-lg font-semibold">{order.meal}</h4>
                              </div>
                              <div className="space-y-3">
                                <div>
                                  <p className="text-sm font-medium text-gray-700 mb-2">Articles:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {order.items.map((item, index) => (
                                      <Badge key={index} variant="secondary">{item}</Badge>
                                    ))}
                                  </div>
                                </div>
                                {order.allergies.length > 0 && (
                                  <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">Allergies/Restrictions:</p>
                                    <div className="flex flex-wrap gap-2">
                                      {order.allergies.map((allergy, index) => (
                                        <Badge key={index} className="bg-red-100 text-red-800">{allergy}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                <p className="text-sm text-gray-600">{order.notes}</p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="castings" className="space-y-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Castings</h3>
                          <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Ajouter Casting
                          </Button>
                        </div>
                        {selectedArtist.castings.length > 0 ? (
                          selectedArtist.castings.map((casting) => (
                            <Card key={casting.id}>
                              <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center space-x-3">
                                    <Users className="h-5 w-5 text-purple-600" />
                                    <h4 className="text-lg font-semibold">{casting.role}</h4>
                                  </div>
                                  <Badge className={
                                    casting.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                    casting.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }>
                                    {casting.status === 'confirmed' ? 'Confirmé' : 
                                     casting.status === 'pending' ? 'En attente' : 'Annulé'}
                                  </Badge>
                                </div>
                                <div className="space-y-3">
                                  <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">Exigences:</p>
                                    <ul className="space-y-1">
                                      {casting.requirements.map((req, index) => (
                                        <li key={index} className="text-sm flex items-center space-x-2">
                                          <span>•</span>
                                          <span>{req}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-700">Contact:</p>
                                    <p className="text-sm text-gray-600">{casting.contact}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        ) : (
                          <Card>
                            <CardContent className="p-6 text-center">
                              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-500">Aucun casting ajouté pour le moment</p>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create/Edit Artist Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{editingArtist ? 'Modifier l\'Artiste' : 'Ajouter Nouvel Artiste'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  placeholder="Nom de l'artiste" 
                  defaultValue={editingArtist?.name || ''} 
                />
                <Input 
                  placeholder="Genre" 
                  defaultValue={editingArtist?.genre || ''} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Photo de profil</label>
                <Input type="file" accept="image/*" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Biographie</label>
                <textarea 
                  className="w-full p-3 border rounded-md min-h-32"
                  placeholder="Biographie de l'artiste..."
                  defaultValue={editingArtist?.bio || ''}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Médias Vidéo</label>
                  <Input type="file" accept="video/*" multiple />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Médias Audio</label>
                  <Input type="file" accept="audio/*" multiple />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Documents</label>
                  <Input type="file" accept=".pdf,.doc,.docx,.txt" multiple />
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button 
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingArtist(null);
                  }} 
                  variant="outline" 
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button 
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingArtist(null);
                  }} 
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {editingArtist ? 'Modifier' : 'Ajouter'} Artiste
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
