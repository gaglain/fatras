import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Settings, MapPin, Phone, Mail, Globe } from 'lucide-react';

export interface FooterBlockContent {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  unsubscribeText: string;
  showUnsubscribe: boolean;
  showSocialLinks: boolean;
  backgroundColor: string;
  textColor: string;
}

interface FooterBlockProps {
  content: FooterBlockContent;
  onChange: (content: FooterBlockContent) => void;
}

export const FooterBlock: React.FC<FooterBlockProps> = ({ content, onChange }) => {
  const [showSettings, setShowSettings] = useState(false);

  if (showSettings) {
    return (
      <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuration du pied de page
          </Label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(false)}
          >
            Fermer
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <Label htmlFor="companyName">Nom de l'entreprise</Label>
              <Input
                id="companyName"
                value={content.companyName}
                onChange={(e) => onChange({ ...content, companyName: e.target.value })}
                placeholder="Mon Entreprise"
              />
            </div>
            <div>
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={content.address}
                onChange={(e) => onChange({ ...content, address: e.target.value })}
                placeholder="123 Rue Example, 75001 Paris"
              />
            </div>
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={content.phone}
                onChange={(e) => onChange({ ...content, phone: e.target.value })}
                placeholder="+33 1 23 45 67 89"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={content.email}
                onChange={(e) => onChange({ ...content, email: e.target.value })}
                placeholder="contact@entreprise.com"
              />
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <Label htmlFor="website">Site web</Label>
              <Input
                id="website"
                value={content.website}
                onChange={(e) => onChange({ ...content, website: e.target.value })}
                placeholder="https://www.entreprise.com"
              />
            </div>
            <div>
              <Label htmlFor="unsubscribeText">Texte de désabonnement</Label>
              <Input
                id="unsubscribeText"
                value={content.unsubscribeText}
                onChange={(e) => onChange({ ...content, unsubscribeText: e.target.value })}
                placeholder="Se désabonner"
              />
            </div>
            <div>
              <Label htmlFor="backgroundColor">Couleur de fond</Label>
              <Input
                id="backgroundColor"
                type="color"
                value={content.backgroundColor}
                onChange={(e) => onChange({ ...content, backgroundColor: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="textColor">Couleur du texte</Label>
              <Input
                id="textColor"
                type="color"
                value={content.textColor}
                onChange={(e) => onChange({ ...content, textColor: e.target.value })}
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="showUnsubscribe"
              checked={content.showUnsubscribe}
              onCheckedChange={(checked) => onChange({ ...content, showUnsubscribe: checked })}
            />
            <Label htmlFor="showUnsubscribe">Afficher le désabonnement</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="showSocialLinks"
              checked={content.showSocialLinks}
              onCheckedChange={(checked) => onChange({ ...content, showSocialLinks: checked })}
            />
            <Label htmlFor="showSocialLinks">Afficher les réseaux sociaux</Label>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative">
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        onClick={() => setShowSettings(true)}
      >
        <Settings className="h-4 w-4" />
      </Button>
      <div
        style={{
          backgroundColor: content.backgroundColor,
          color: content.textColor,
          padding: '24px',
          fontSize: '14px',
          lineHeight: '1.6'
        }}
        onClick={() => setShowSettings(true)}
        className="cursor-pointer rounded transition-opacity hover:opacity-90"
      >
        <div className="text-center">
          {content.companyName && (
            <div className="font-bold text-lg mb-4">{content.companyName}</div>
          )}
          
          <div className="space-y-2 mb-4">
            {content.address && (
              <div className="flex items-center justify-center gap-2">
                <MapPin className="h-4 w-4" />
                {content.address}
              </div>
            )}
            {content.phone && (
              <div className="flex items-center justify-center gap-2">
                <Phone className="h-4 w-4" />
                {content.phone}
              </div>
            )}
            {content.email && (
              <div className="flex items-center justify-center gap-2">
                <Mail className="h-4 w-4" />
                {content.email}
              </div>
            )}
            {content.website && (
              <div className="flex items-center justify-center gap-2">
                <Globe className="h-4 w-4" />
                {content.website}
              </div>
            )}
          </div>
          
          {content.showUnsubscribe && (
            <div className="border-t pt-4 mt-4" style={{ borderColor: content.textColor + '40' }}>
              <a
                href="#unsubscribe"
                style={{ color: content.textColor, textDecoration: 'underline' }}
              >
                {content.unsubscribeText}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};