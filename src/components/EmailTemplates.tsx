import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Calendar, ShoppingBag, Users, Zap, Heart } from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  subject: string;
  content: string;
  icon: React.ReactNode;
  color: string;
}

interface EmailTemplatesProps {
  onSelectTemplate: (template: EmailTemplate) => void;
  onBack: () => void;
}

const EmailTemplates: React.FC<EmailTemplatesProps> = ({ onSelectTemplate, onBack }) => {
  const templates: EmailTemplate[] = [
    {
      id: 'welcome',
      name: 'Email de bienvenue',
      description: 'Accueillez vos nouveaux utilisateurs avec style',
      category: 'Onboarding',
      subject: 'Bienvenue chez {{company_name}} !',
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; border-radius: 12px;">
          <h1 style="text-align: center; margin-bottom: 30px; font-size: 32px;">Bienvenue chez {{company_name}} !</h1>
          <p style="font-size: 18px; line-height: 1.6; margin-bottom: 20px;">Bonjour {{user_name}},</p>
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px;">Nous sommes ravis de vous accueillir dans notre communauté ! Votre aventure commence maintenant.</p>
          <div style="text-align: center; margin: 40px 0;">
            <a href="{{action_url}}" style="background: white; color: #667eea; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Commencer</a>
          </div>
          <p style="font-size: 14px; text-align: center; opacity: 0.8;">Merci de nous faire confiance !</p>
        </div>
      `,
      icon: <Heart className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'newsletter',
      name: 'Newsletter',
      description: 'Partagez vos dernières actualités',
      category: 'Communication',
      subject: 'Nos dernières actualités - {{month}} {{year}}',
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">{{newsletter_title}}</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">{{month}} {{year}}</p>
          </div>
          <div style="padding: 30px 20px;">
            <h2 style="color: #1f2937; margin-bottom: 15px;">À la une</h2>
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 25px;">{{main_content}}</p>
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <h3 style="color: #1f2937; margin-bottom: 10px;">Le saviez-vous ?</h3>
              <p style="color: #4b5563; margin: 0;">{{tip_content}}</p>
            </div>
            <div style="text-align: center;">
              <a href="{{read_more_url}}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Lire la suite</a>
            </div>
          </div>
        </div>
      `,
      icon: <Mail className="w-6 h-6" />,
      color: 'from-blue-500 to-indigo-500'
    },
    {
      id: 'event',
      name: 'Invitation événement',
      description: 'Invitez à vos événements et concerts',
      category: 'Événements',
      subject: 'Vous êtes invité(e) : {{event_name}}',
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; border-radius: 12px; overflow: hidden;">
          <div style="padding: 40px 20px; text-align: center;">
            <h1 style="margin: 0 0 20px 0; font-size: 32px;">{{event_name}}</h1>
            <div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-size: 18px;"><strong>📅 Date :</strong> {{event_date}}</p>
              <p style="margin: 10px 0 0 0; font-size: 18px;"><strong>📍 Lieu :</strong> {{event_location}}</p>
            </div>
            <p style="font-size: 16px; line-height: 1.6; margin: 20px 0;">{{event_description}}</p>
            <div style="margin: 30px 0;">
              <a href="{{rsvp_url}}" style="background: white; color: #d97706; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 0 10px;">Réserver ma place</a>
            </div>
            <p style="font-size: 14px; opacity: 0.8;">Places limitées - Réservez vite !</p>
          </div>
        </div>
      `,
      icon: <Calendar className="w-6 h-6" />,
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'promo',
      name: 'Promotion commerciale',
      description: 'Boostez vos ventes avec des offres attractives',
      category: 'Marketing',
      subject: '🔥 Offre limitée : {{discount}}% de réduction !',
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #10b981 0%, #047857 100%); color: white; border-radius: 12px; overflow: hidden;">
          <div style="padding: 40px 20px; text-align: center;">
            <div style="background: rgba(255,255,255,0.2); display: inline-block; padding: 10px 20px; border-radius: 50px; margin-bottom: 20px;">
              <span style="font-size: 14px; font-weight: bold;">OFFRE LIMITÉE</span>
            </div>
            <h1 style="margin: 0 0 20px 0; font-size: 36px;">{{discount}}% DE RÉDUCTION</h1>
            <p style="font-size: 18px; margin-bottom: 30px;">{{promo_description}}</p>
            <div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-size: 16px;">Code promo :</p>
              <p style="margin: 10px 0 0 0; font-size: 24px; font-weight: bold; letter-spacing: 2px;">{{promo_code}}</p>
            </div>
            <div style="margin: 30px 0;">
              <a href="{{shop_url}}" style="background: white; color: #047857; padding: 18px 36px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 18px;">Profiter de l'offre</a>
            </div>
            <p style="font-size: 14px; opacity: 0.8;">Offre valable jusqu'au {{expiry_date}}</p>
          </div>
        </div>
      `,
      icon: <ShoppingBag className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'team',
      name: 'Communication équipe',
      description: 'Communiquez avec votre équipe efficacement',
      category: 'Interne',
      subject: 'Mise à jour équipe - {{date}}',
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Mise à jour équipe</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">{{date}}</p>
          </div>
          <div style="padding: 30px 20px;">
            <h2 style="color: #1f2937; margin-bottom: 15px;">Points importants</h2>
            <ul style="color: #4b5563; line-height: 1.6; margin-bottom: 25px;">
              <li style="margin-bottom: 8px;">{{point_1}}</li>
              <li style="margin-bottom: 8px;">{{point_2}}</li>
              <li style="margin-bottom: 8px;">{{point_3}}</li>
            </ul>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <h3 style="color: #1f2937; margin-bottom: 10px;">Prochaines échéances</h3>
              <p style="color: #4b5563; margin: 0;">{{upcoming_deadlines}}</p>
            </div>
            <p style="color: #4b5563; margin-bottom: 20px;">{{additional_notes}}</p>
            <div style="text-align: center;">
              <a href="{{team_link}}" style="background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Accéder à l'espace équipe</a>
            </div>
          </div>
        </div>
      `,
      icon: <Users className="w-6 h-6" />,
      color: 'from-purple-500 to-violet-600'
    },
    {
      id: 'announcement',
      name: 'Annonce importante',
      description: 'Communiquez des informations cruciales',
      category: 'Communication',
      subject: '📢 Annonce importante : {{announcement_title}}',
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; border-radius: 12px; overflow: hidden;">
          <div style="padding: 40px 20px; text-align: center;">
            <div style="background: rgba(255,255,255,0.2); display: inline-block; padding: 10px 20px; border-radius: 50px; margin-bottom: 20px;">
              <span style="font-size: 14px; font-weight: bold;">📢 ANNONCE IMPORTANTE</span>
            </div>
            <h1 style="margin: 0 0 30px 0; font-size: 32px;">{{announcement_title}}</h1>
            <div style="background: rgba(255,255,255,0.2); padding: 25px; border-radius: 8px; margin: 20px 0; text-align: left;">
              <p style="margin: 0; font-size: 16px; line-height: 1.6;">{{announcement_content}}</p>
            </div>
            <p style="font-size: 16px; margin: 20px 0;">{{call_to_action_text}}</p>
            <div style="margin: 30px 0;">
              <a href="{{action_url}}" style="background: white; color: #dc2626; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">{{action_button_text}}</a>
            </div>
            <p style="font-size: 14px; opacity: 0.8;">Pour plus d'informations, n'hésitez pas à nous contacter</p>
          </div>
        </div>
      `,
      icon: <Zap className="w-6 h-6" />,
      color: 'from-red-500 to-red-600'
    }
  ];

  const categories = [...new Set(templates.map(t => t.category))];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Templates d'emails</h1>
          <p className="text-muted-foreground">Choisissez un template pour commencer rapidement</p>
        </div>
      </div>

      {categories.map(category => (
        <div key={category} className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground border-b pb-2">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.filter(t => t.category === category).map(template => (
              <Card 
                key={template.id} 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-border/50 bg-card/50 backdrop-blur-sm"
                onClick={() => onSelectTemplate(template)}
              >
                <CardHeader className="pb-3">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${template.color} flex items-center justify-center text-white mb-3`}>
                    {template.icon}
                  </div>
                  <CardTitle className="text-lg text-foreground">{template.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{template.description}</p>
                  <div className="mt-4 pt-3 border-t border-border/30">
                    <p className="text-xs text-muted-foreground/80">Cliquez pour utiliser ce template</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      <div className="mt-8 p-6 bg-muted/30 rounded-lg border border-border/50">
        <h3 className="font-semibold text-foreground mb-2">💡 Astuce</h3>
        <p className="text-sm text-muted-foreground">
          Les templates utilisent des variables comme <code className="bg-muted px-1 py-0.5 rounded text-xs">{'{{variable}}'}</code> que vous pouvez personnaliser.
          Vous pourrez les modifier après avoir sélectionné un template.
        </p>
      </div>
    </div>
  );
};

export default EmailTemplates;