import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Share2, Settings, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export interface SocialBlockContent {
  platforms: {
    facebook?: { url: string; enabled: boolean };
    twitter?: { url: string; enabled: boolean };
    instagram?: { url: string; enabled: boolean };
    linkedin?: { url: string; enabled: boolean };
  };
  alignment: 'left' | 'center' | 'right';
  iconSize: number;
  spacing: number;
}

interface SocialBlockProps {
  content: SocialBlockContent;
  onChange: (content: SocialBlockContent) => void;
}

export const SocialBlock: React.FC<SocialBlockProps> = ({ content, onChange }) => {
  const [showSettings, setShowSettings] = useState(false);

  const platformIcons = {
    facebook: Facebook,
    twitter: Twitter,
    instagram: Instagram,
    linkedin: Linkedin
  };

  const platformColors = {
    facebook: '#1877F2',
    twitter: '#1DA1F2',
    instagram: '#E4405F',
    linkedin: '#0A66C2'
  };

  const updatePlatform = (platform: keyof typeof content.platforms, updates: Partial<NonNullable<typeof content.platforms[typeof platform]>>) => {
    onChange({
      ...content,
      platforms: {
        ...content.platforms,
        [platform]: {
          ...content.platforms[platform],
          ...updates
        }
      }
    });
  };

  if (showSettings) {
    return (
      <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Configuration des réseaux sociaux
          </Label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(false)}
          >
            Fermer
          </Button>
        </div>
        
        <div className="space-y-4">
          {Object.entries(platformIcons).map(([platform, Icon]) => (
            <div key={platform} className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <Label className="flex items-center gap-2 capitalize">
                  <Icon className="h-4 w-4" style={{ color: platformColors[platform as keyof typeof platformColors] }} />
                  {platform}
                </Label>
                <Switch
                  checked={content.platforms[platform as keyof typeof content.platforms]?.enabled || false}
                  onCheckedChange={(enabled) => updatePlatform(platform as keyof typeof content.platforms, { enabled })}
                />
              </div>
              {content.platforms[platform as keyof typeof content.platforms]?.enabled && (
                <Input
                  value={content.platforms[platform as keyof typeof content.platforms]?.url || ''}
                  onChange={(e) => updatePlatform(platform as keyof typeof content.platforms, { url: e.target.value })}
                  placeholder={`URL ${platform}`}
                  className="mt-2"
                />
              )}
            </div>
          ))}
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="alignment">Alignement</Label>
              <Select
                value={content.alignment}
                onValueChange={(value: 'left' | 'center' | 'right') => 
                  onChange({ ...content, alignment: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Gauche</SelectItem>
                  <SelectItem value="center">Centre</SelectItem>
                  <SelectItem value="right">Droite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="iconSize">Taille des icônes</Label>
              <Input
                id="iconSize"
                type="number"
                value={content.iconSize}
                onChange={(e) => onChange({ ...content, iconSize: parseInt(e.target.value) || 24 })}
                min="16"
                max="48"
              />
            </div>
            <div>
              <Label htmlFor="spacing">Espacement</Label>
              <Input
                id="spacing"
                type="number"
                value={content.spacing}
                onChange={(e) => onChange({ ...content, spacing: parseInt(e.target.value) || 12 })}
                min="4"
                max="32"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const enabledPlatforms = Object.entries(content.platforms).filter(([_, config]) => config?.enabled);

  return (
    <div className="group relative">
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => setShowSettings(true)}
      >
        <Settings className="h-4 w-4" />
      </Button>
      <div
        style={{ textAlign: content.alignment }}
        onClick={() => setShowSettings(true)}
        className="p-4 hover:bg-muted/20 rounded transition-colors cursor-pointer"
      >
        {enabledPlatforms.length > 0 ? (
          <div className="flex items-center justify-center gap-4" style={{ gap: `${content.spacing}px` }}>
            {enabledPlatforms.map(([platform, config]) => {
              const Icon = platformIcons[platform as keyof typeof platformIcons];
              return (
                <a
                  key={platform}
                  href={config?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:scale-110 transition-transform"
                >
                  <Icon
                    size={content.iconSize}
                    style={{ color: platformColors[platform as keyof typeof platformColors] }}
                  />
                </a>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-4">
            <Share2 className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>Cliquez pour configurer les réseaux sociaux</p>
          </div>
        )}
      </div>
    </div>
  );
};