
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Globe, 
  Edit3, 
  Settings, 
  LayoutTemplate,
  Blocks,
  FileText,
  Eye,
  Users,
  Calendar
} from 'lucide-react';

export const Website: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Éditeur de Pages',
      description: 'Créez et modifiez vos pages avec l\'éditeur de blocs visuel',
      icon: <Blocks className="h-8 w-8 text-blue-600" />,
      action: () => navigate('/website/editor'),
      buttonText: 'Ouvrir l\'Éditeur',
      color: 'blue'
    },
    {
      title: 'Gestion des Pages',
      description: 'Gérez le contenu, les méta-données et la structure de votre site',
      icon: <FileText className="h-8 w-8 text-green-600" />,
      action: () => navigate('/website/backoffice'),
      buttonText: 'Gérer les Pages',
      color: 'green'
    },
    {
      title: 'Types d\'Événements',
      description: 'Configurez les types d\'événements et les artistes recommandés',
      icon: <Calendar className="h-8 w-8 text-purple-600" />,
      action: () => navigate('/event-types'),
      buttonText: 'Gérer les Types',
      color: 'purple'
    },
    {
      title: 'Aperçu du Site',
      description: 'Visualisez votre site tel que le verront vos visiteurs',
      icon: <Eye className="h-8 w-8 text-orange-600" />,
      action: () => navigate('/front'),
      buttonText: 'Voir le Site',
      color: 'orange'
    }
  ];

  const stats = [
    { label: 'Pages Publiées', value: '8', icon: <Globe className="h-5 w-5" /> },
    { label: 'Brouillons', value: '3', icon: <Edit3 className="h-5 w-5" /> },
    { label: 'Vues/mois', value: '12.4k', icon: <Users className="h-5 w-5" /> },
    { label: 'Types d\'Événements', value: '5', icon: <Calendar className="h-5 w-5" /> }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion du Site Web</h1>
          <p className="text-gray-600 mt-2">Créez, modifiez et gérez votre site web et son contenu</p>
        </div>
        <Button onClick={() => navigate('/front')} className="bg-purple-600 hover:bg-purple-700">
          <Eye className="h-4 w-4 mr-2" />
          Aperçu du Site
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-gray-100 rounded-lg">
                  {stat.icon}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Fonctionnalités principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className={`p-3 bg-${feature.color}-100 rounded-lg`}>
                  {feature.icon}
                </div>
                <div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{feature.description}</p>
              <Button onClick={feature.action} className="w-full">
                {feature.buttonText}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Section d'aide */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <LayoutTemplate className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Comment utiliser l'éditeur ?</h3>
              <div className="text-gray-600 space-y-2">
                <p>• <strong>Éditeur de Pages :</strong> Interface visuelle avec système de blocs pour créer vos pages</p>
                <p>• <strong>Gestion des Pages :</strong> Administration du contenu, SEO et statuts de publication</p>
                <p>• <strong>Types d'Événements :</strong> Configuration des catégories d'événements pour votre site</p>
                <p>• <strong>Aperçu :</strong> Visualisation en temps réel de votre site web</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
