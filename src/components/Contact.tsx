
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, Mail, MapPin, Send } from 'lucide-react';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventType: '',
    eventDate: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Formulaire soumis:', formData);
    // Ici vous pourriez envoyer les données à votre backend
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Contactez-nous
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Prêt à créer un événement inoubliable ? Contactez-nous pour discuter de votre projet
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulaire de contact */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-6">Envoyez-nous un message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom complet *
                    </label>
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="Votre nom"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <Input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="votre.email@exemple.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="+33 1 23 45 67 89"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type d'événement
                    </label>
                    <Select value={formData.eventType} onValueChange={(value) => handleChange('eventType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="festival">Festival</SelectItem>
                        <SelectItem value="concert">Concert</SelectItem>
                        <SelectItem value="corporate">Événement d'entreprise</SelectItem>
                        <SelectItem value="private">Événement privé</SelectItem>
                        <SelectItem value="wedding">Mariage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date souhaitée
                  </label>
                  <Input
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => handleChange('eventDate', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message *
                  </label>
                  <Textarea
                    required
                    value={formData.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    placeholder="Décrivez votre projet, vos besoins, le lieu de l'événement..."
                    className="min-h-[120px]"
                  />
                </div>

                <Button type="submit" className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer le message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Informations de contact */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Nos coordonnées</h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Téléphone</p>
                      <p className="text-gray-600">+33 1 23 45 67 89</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-gray-600">contact@showmanager.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Adresse</p>
                      <p className="text-gray-600">123 Rue de la Musique<br />75001 Paris, France</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Horaires d'ouverture</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Lundi - Vendredi</span>
                    <span className="font-medium">9h00 - 18h00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Samedi</span>
                    <span className="font-medium">10h00 - 16h00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dimanche</span>
                    <span className="font-medium">Fermé</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Réponse rapide</h2>
                <p className="text-gray-600 text-sm mb-4">
                  Nous nous engageons à répondre à toutes les demandes dans les 24 heures. 
                  Pour les urgences, n'hésitez pas à nous appeler directement.
                </p>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-blue-800 text-xs font-medium">
                    💡 Conseil : Plus votre demande est détaillée, plus nous pourrons vous proposer 
                    des solutions adaptées à votre événement.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
