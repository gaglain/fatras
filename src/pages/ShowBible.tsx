
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, BookOpen, Edit, Eye, Upload, Play, Music, Users, Utensils, Mic } from 'lucide-react';

interface Artist {
  id: string;
  name: string;
  genre: string;
  bio: string;
  photo: string;
  videos: string[];
  setLists: SetList[];
  technicalOrders: TechnicalOrder[];
  cateringOrders: CateringOrder[];
  castings: Casting[];
  lastUpdated: string;
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
    bio: 'The Midnight Express is a high-energy rock band formed in 2018. Known for their electrifying performances and chart-topping hits, they have toured internationally and won multiple music awards.',
    photo: '/placeholder.svg',
    videos: ['Concert Highlights', 'Behind the Scenes', 'Music Video - Latest Hit'],
    setLists: [
      {
        id: '1',
        name: 'Festival Set',
        songs: ['Opening Thunder', 'Midnight Train', 'Electric Dreams', 'Final Call'],
        duration: '45 minutes',
        notes: 'High energy opener for festivals'
      }
    ],
    technicalOrders: [
      {
        id: '1',
        category: 'Sound',
        items: ['32-channel mixer', 'Line array speakers', 'Monitor system'],
        priority: 'high',
        notes: 'Critical for performance quality'
      }
    ],
    cateringOrders: [
      {
        id: '1',
        meal: 'Pre-show dinner',
        items: ['Grilled chicken', 'Vegetarian pasta', 'Fresh salads', 'Energy drinks'],
        allergies: ['Nuts', 'Shellfish'],
        notes: '2 hours before show time'
      }
    ],
    castings: [
      {
        id: '1',
        role: 'Backup Vocalist',
        requirements: ['Strong vocal range', 'Stage experience', 'Available for tour'],
        contact: 'sarah@example.com',
        status: 'confirmed'
      }
    ],
    lastUpdated: '2024-06-12'
  },
  {
    id: '2',
    name: 'Sarah Mitchell',
    genre: 'Folk/Acoustic',
    bio: 'Singer-songwriter Sarah Mitchell brings heartfelt lyrics and acoustic melodies to intimate venues. Her music connects deeply with audiences through personal storytelling.',
    photo: '/placeholder.svg',
    videos: ['Acoustic Sessions', 'Live at Blue Note'],
    setLists: [
      {
        id: '1',
        name: 'Intimate Evening',
        songs: ['Whispered Dreams', 'Mountain Song', 'City Lights', 'Coming Home'],
        duration: '60 minutes',
        notes: 'Perfect for acoustic venues'
      }
    ],
    technicalOrders: [
      {
        id: '1',
        category: 'Sound',
        items: ['Acoustic guitar pickup', 'Vocal microphone', 'Small PA system'],
        priority: 'medium',
        notes: 'Keep it simple and natural'
      }
    ],
    cateringOrders: [
      {
        id: '1',
        meal: 'Light refreshments',
        items: ['Herbal tea', 'Fresh fruit', 'Honey'],
        allergies: ['Dairy'],
        notes: 'Voice-friendly options'
      }
    ],
    castings: [],
    lastUpdated: '2024-06-10'
  }
];

export const ShowBible: React.FC = () => {
  const [artists, setArtists] = useState<Artist[]>(sampleArtists);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState('bio');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Show Bible</h1>
          <p className="text-gray-600 mt-2">Comprehensive artist profiles with bio, media, set lists, and production requirements</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Artist
        </Button>
      </div>

      {!selectedArtist ? (
        /* Artists List */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artists.map((artist) => (
            <Card key={artist.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <img 
                    src={artist.photo} 
                    alt={artist.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
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
                    <span>Videos:</span>
                    <Badge variant="secondary">{artist.videos.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Technical Orders:</span>
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
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </div>
                
                <div className="text-xs text-gray-400 mt-3">
                  Last updated: {new Date(artist.lastUpdated).toLocaleDateString()}
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
              ← Back to Artists
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Upload Media
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
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="bio">Bio</TabsTrigger>
                  <TabsTrigger value="media">Media</TabsTrigger>
                  <TabsTrigger value="setlists">Set Lists</TabsTrigger>
                  <TabsTrigger value="technical">Technical</TabsTrigger>
                  <TabsTrigger value="catering">Catering</TabsTrigger>
                  <TabsTrigger value="castings">Castings</TabsTrigger>
                </TabsList>

                <TabsContent value="bio" className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-3">Biography</h3>
                    <p className="text-gray-700 leading-relaxed">{selectedArtist.bio}</p>
                  </div>
                </TabsContent>

                <TabsContent value="media" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Videos & Media</h3>
                      <Button size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedArtist.videos.map((video, index) => (
                        <Card key={index} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                              <Play className="h-8 w-8 text-purple-600" />
                              <div>
                                <p className="font-medium">{video}</p>
                                <p className="text-sm text-gray-500">Video</p>
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
                        Add Set List
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

                <TabsContent value="technical" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Technical Orders</h3>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Order
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
                              {order.priority} priority
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
                      <h3 className="text-lg font-semibold">Catering Orders</h3>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Order
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
                              <p className="text-sm font-medium text-gray-700 mb-2">Items:</p>
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
                        Add Casting
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
                                {casting.status}
                              </Badge>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Requirements:</p>
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
                          <p className="text-gray-500">No castings added yet</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Artist Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader>
              <CardTitle>Add New Artist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Artist Name" />
              <Input placeholder="Genre" />
              <textarea 
                placeholder="Biography" 
                className="w-full p-3 border rounded-md resize-none h-24"
              />
              <Input placeholder="Photo URL" />
              <div className="flex space-x-3 pt-4">
                <Button onClick={() => setShowCreateForm(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button onClick={() => setShowCreateForm(false)} className="flex-1 bg-purple-600 hover:bg-purple-700">
                  Add Artist
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
