import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmailBlock } from './types';
import { ArrowLeft, Mail, Megaphone, ShoppingBag, Calendar, Users } from 'lucide-react';

interface EmailTemplatesProps {
  onSelectTemplate: (blocks: EmailBlock[]) => void;
  onBack: () => void;
}

export const EmailTemplates: React.FC<EmailTemplatesProps> = ({ onSelectTemplate, onBack }) => {
  const templates = [
    {
      id: 'newsletter',
      name: 'Newsletter',
      description: 'Modèle classique pour une newsletter mensuelle',
      icon: Mail,
      color: 'bg-blue-500',
      blocks: [
        {
          id: '1',
          type: 'heading' as const,
          content: {
            text: 'Newsletter - Mars 2024',
            level: 1 as const,
            color: '#2563eb',
            align: 'center' as const
          }
        },
        {
          id: '2',
          type: 'image' as const,
          content: {
            src: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=300&fit=crop',
            alt: 'Image d\'en-tête',
            width: 100,
            align: 'center' as const
          }
        },
        {
          id: '3',
          type: 'text' as const,
          content: {
            text: 'Bonjour,\n\nNous sommes ravis de vous présenter les dernières nouveautés de notre entreprise. Ce mois-ci, nous avons le plaisir de partager avec vous nos dernières réalisations et les événements à venir.',
            fontSize: 16,
            color: '#374151',
            align: 'left' as const,
            bold: false,
            italic: false
          }
        },
        {
          id: '4',
          type: 'heading' as const,
          content: {
            text: 'Nos actualités',
            level: 2 as const,
            color: '#1f2937',
            align: 'left' as const
          }
        },
        {
          id: '5',
          type: 'text' as const,
          content: {
            text: '• Lancement de notre nouveau produit\n• Ouverture d\'un nouveau bureau\n• Partenariat stratégique avec une entreprise leader',
            fontSize: 14,
            color: '#374151',
            align: 'left' as const,
            bold: false,
            italic: false
          }
        },
        {
          id: '6',
          type: 'button' as const,
          content: {
            text: 'En savoir plus',
            url: 'https://example.com',
            backgroundColor: '#2563eb',
            textColor: '#ffffff',
            align: 'center' as const,
            borderRadius: 6,
            padding: { top: 12, bottom: 12, left: 24, right: 24 }
          }
        },
        {
          id: '7',
          type: 'footer' as const,
          content: {
            companyName: 'Mon Entreprise',
            address: '123 Rue Example, 75001 Paris',
            phone: '+33 1 23 45 67 89',
            email: 'contact@entreprise.com',
            website: 'https://www.entreprise.com',
            unsubscribeText: 'Se désabonner',
            showUnsubscribe: true,
            showSocialLinks: false,
            backgroundColor: '#f8f9fa',
            textColor: '#666666'
          }
        }
      ]
    },
    {
      id: 'promotion',
      name: 'Promotion',
      description: 'Parfait pour annoncer des offres spéciales',
      icon: Megaphone,
      color: 'bg-red-500',
      blocks: [
        {
          id: '1',
          type: 'heading' as const,
          content: {
            text: '🔥 OFFRE SPÉCIALE 🔥',
            level: 1 as const,
            color: '#dc2626',
            align: 'center' as const
          }
        },
        {
          id: '2',
          type: 'text' as const,
          content: {
            text: 'Profitez de -50% sur tous nos produits pendant 48h seulement !',
            fontSize: 18,
            color: '#1f2937',
            align: 'center' as const,
            bold: true,
            italic: false
          }
        },
        {
          id: '3',
          type: 'image' as const,
          content: {
            src: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop',
            alt: 'Produits en promotion',
            width: 80,
            align: 'center' as const
          }
        },
        {
          id: '4',
          type: 'button' as const,
          content: {
            text: 'PROFITER DE L\'OFFRE',
            url: 'https://example.com/promo',
            backgroundColor: '#dc2626',
            textColor: '#ffffff',
            align: 'center' as const,
            borderRadius: 8,
            padding: { top: 16, bottom: 16, left: 32, right: 32 }
          }
        },
        {
          id: '5',
          type: 'text' as const,
          content: {
            text: '⏰ Offre valable jusqu\'au 31 mars 2024 à minuit\n✨ Code promo : SPECIAL50',
            fontSize: 14,
            color: '#6b7280',
            align: 'center' as const,
            bold: false,
            italic: true
          }
        }
      ]
    },
    {
      id: 'ecommerce',
      name: 'E-commerce',
      description: 'Idéal pour présenter vos produits',
      icon: ShoppingBag,
      color: 'bg-green-500',
      blocks: [
        {
          id: '1',
          type: 'heading' as const,
          content: {
            text: 'Nos nouveaux produits',
            level: 1 as const,
            color: '#059669',
            align: 'center' as const
          }
        },
        {
          id: '2',
          type: 'text' as const,
          content: {
            text: 'Découvrez notre nouvelle collection printemps-été avec des designs innovants et des matériaux de qualité supérieure.',
            fontSize: 16,
            color: '#374151',
            align: 'center' as const,
            bold: false,
            italic: false
          }
        },
        {
          id: '3',
          type: 'image' as const,
          content: {
            src: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop',
            alt: 'Collection produits',
            width: 90,
            align: 'center' as const
          }
        },
        {
          id: '4',
          type: 'heading' as const,
          content: {
            text: 'Produit vedette',
            level: 2 as const,
            color: '#1f2937',
            align: 'left' as const
          }
        },
        {
          id: '5',
          type: 'text' as const,
          content: {
            text: 'Notre bestseller revient avec de nouvelles couleurs et améliorations. Qualité premium, design élégant, prix accessible.',
            fontSize: 14,
            color: '#374151',
            align: 'left' as const,
            bold: false,
            italic: false
          }
        },
        {
          id: '6',
          type: 'button' as const,
          content: {
            text: 'Voir tous les produits',
            url: 'https://example.com/products',
            backgroundColor: '#059669',
            textColor: '#ffffff',
            align: 'center' as const,
            borderRadius: 6,
            padding: { top: 12, bottom: 12, left: 24, right: 24 }
          }
        }
      ]
    },
    {
      id: 'event',
      name: 'Événement',
      description: 'Pour inviter à vos événements',
      icon: Calendar,
      color: 'bg-purple-500',
      blocks: [
        {
          id: '1',
          type: 'heading' as const,
          content: {
            text: 'Vous êtes invité(e) !',
            level: 1 as const,
            color: '#7c3aed',
            align: 'center' as const
          }
        },
        {
          id: '2',
          type: 'text' as const,
          content: {
            text: 'Conférence annuelle 2024\nInnovation et Technologie',
            fontSize: 20,
            color: '#1f2937',
            align: 'center' as const,
            bold: true,
            italic: false
          }
        },
        {
          id: '3',
          type: 'image' as const,
          content: {
            src: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&h=300&fit=crop',
            alt: 'Événement conférence',
            width: 100,
            align: 'center' as const
          }
        },
        {
          id: '4',
          type: 'text' as const,
          content: {
            text: '📅 Date : 15 avril 2024\n🕒 Heure : 14h00 - 18h00\n📍 Lieu : Centre de Conférences, Paris\n👥 Conférenciers experts\n🍽️ Cocktail de networking',
            fontSize: 14,
            color: '#374151',
            align: 'left' as const,
            bold: false,
            italic: false
          }
        },
        {
          id: '5',
          type: 'button' as const,
          content: {
            text: 'Réserver ma place',
            url: 'https://example.com/event',
            backgroundColor: '#7c3aed',
            textColor: '#ffffff',
            align: 'center' as const,
            borderRadius: 8,
            padding: { top: 14, bottom: 14, left: 28, right: 28 }
          }
        }
      ]
    },
    {
      id: 'welcome',
      name: 'Bienvenue',
      description: 'Email d\'accueil pour nouveaux clients',
      icon: Users,
      color: 'bg-orange-500',
      blocks: [
        {
          id: '1',
          type: 'heading' as const,
          content: {
            text: 'Bienvenue dans notre communauté !',
            level: 1 as const,
            color: '#ea580c',
            align: 'center' as const
          }
        },
        {
          id: '2',
          type: 'text' as const,
          content: {
            text: 'Merci de nous avoir fait confiance. Nous sommes ravis de vous accueillir parmi nous !',
            fontSize: 18,
            color: '#1f2937',
            align: 'center' as const,
            bold: false,
            italic: false
          }
        },
        {
          id: '3',
          type: 'image' as const,
          content: {
            src: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop',
            alt: 'Équipe souriante',
            width: 80,
            align: 'center' as const
          }
        },
        {
          id: '4',
          type: 'heading' as const,
          content: {
            text: 'Prochaines étapes',
            level: 2 as const,
            color: '#1f2937',
            align: 'left' as const
          }
        },
        {
          id: '5',
          type: 'text' as const,
          content: {
            text: '1. Explorez votre espace personnel\n2. Configurez vos préférences\n3. Découvrez nos fonctionnalités\n4. Contactez-nous si vous avez des questions',
            fontSize: 14,
            color: '#374151',
            align: 'left' as const,
            bold: false,
            italic: false
          }
        },
        {
          id: '6',
          type: 'button' as const,
          content: {
            text: 'Commencer',
            url: 'https://example.com/onboarding',
            backgroundColor: '#ea580c',
            textColor: '#ffffff',
            align: 'center' as const,
            borderRadius: 6,
            padding: { top: 12, bottom: 12, left: 24, right: 24 }
          }
        },
        {
          id: '7',
          type: 'social' as const,
          content: {
            platforms: [
              { type: 'facebook' as const, url: 'https://facebook.com/entreprise', enabled: true, color: '#1877F2' },
              { type: 'instagram' as const, url: 'https://instagram.com/entreprise', enabled: true, color: '#E4405F' },
              { type: 'linkedin' as const, url: 'https://linkedin.com/company/entreprise', enabled: true, color: '#0A66C2' }
            ],
            align: 'center' as const,
            iconSize: 40,
            spacing: 16
          }
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h2 className="text-2xl font-bold">Modèles d'email</h2>
          <p className="text-gray-600">Choisissez un modèle pour commencer rapidement</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => {
          const Icon = template.icon;
          return (
            <Card
              key={template.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
              onClick={() => onSelectTemplate(template.blocks)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${template.color} text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                <div className="space-y-2">
                  <div className="text-xs text-gray-500">Contient :</div>
                  <div className="flex flex-wrap gap-1">
                    {Array.from(new Set(template.blocks.map(block => block.type))).map(type => (
                      <span
                        key={type}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded capitalize"
                      >
                        {type === 'heading' ? 'Titre' :
                         type === 'text' ? 'Texte' :
                         type === 'image' ? 'Image' :
                         type === 'button' ? 'Bouton' :
                         type === 'social' ? 'Réseaux' :
                         type === 'footer' ? 'Pied de page' :
                         type}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center py-8">
        <Button variant="outline" onClick={onBack}>
          Créer un email vide
        </Button>
      </div>
    </div>
  );
};