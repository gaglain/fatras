import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Share2, Settings, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export interface SocialBlockContent {
  platforms: Array<{
    type: 'facebook' | 'instagram' | 'linkedin' | 'youtube';
    url: string;
    enabled: boolean;
    color?: string;
  }>;
  align: 'left' | 'center' | 'right';
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
    instagram: Instagram,
    linkedin: Linkedin,
    youtube: Share2
  };

  const platformColors = {
    facebook: '#1877F2',
    instagram: '#E4405F',
    linkedin: '#0A66C2',
    youtube: '#FF0000'
  };

  const platformTypes: Array<'facebook' | 'instagram' | 'linkedin' | 'youtube'> = ['facebook', 'instagram', 'linkedin', 'youtube'];

  // Initialize platforms if empty
  if (!content.platforms || content.platforms.length === 0) {
    const initialPlatforms = platformTypes.map(type => ({
      type,
      url: '',
      enabled: false,
      color: platformColors[type]
    }));
    onChange({ ...content, platforms: initialPlatforms });
  }

  const updatePlatform = (type: string, updates: Partial<{ url: string; enabled: boolean; color: string }>) => {
    const updatedPlatforms = content.platforms.map(p => 
      p.type === type ? { ...p, ...updates } : p
    );
    onChange({ ...content, platforms: updatedPlatforms });
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
          {content.platforms?.map((platform) => {
            const Icon = platformIcons[platform.type];
            return (
              <div key={platform.type} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <Label className="flex items-center gap-2 capitalize">
                    <Icon className="h-4 w-4" style={{ color: platform.color || platformColors[platform.type] }} />
                    {platform.type}
                  </Label>
                  <Switch
                    checked={platform.enabled}
                    onCheckedChange={(enabled) => updatePlatform(platform.type, { enabled })}
                  />
                </div>
                {platform.enabled && (
                  <Input
                    value={platform.url}
                    onChange={(e) => updatePlatform(platform.type, { url: e.target.value })}
                    placeholder={`URL ${platform.type}`}
                    className="mt-2"
                  />
                )}
              </div>
            );
          })}
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="alignment">Alignement</Label>
              <Select
                value={content.align || 'center'}
                onValueChange={(value: 'left' | 'center' | 'right') => 
                  onChange({ ...content, align: value })
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

  const enabledPlatforms = content.platforms?.filter(p => p.enabled && p.url) || [];

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
        style={{ textAlign: content.align || 'center' }}
        onClick={() => setShowSettings(true)}
        className="p-4 hover:bg-muted/20 rounded transition-colors cursor-pointer"
      >
        {enabledPlatforms.length > 0 ? (
          <div className="flex items-center gap-3" style={{ justifyContent: content.align === 'left' ? 'flex-start' : content.align === 'right' ? 'flex-end' : 'center' }}>
            {enabledPlatforms.map((platform) => {
              const Icon = platformIcons[platform.type];
              return (
                <a
                  key={platform.type}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full hover:opacity-80 transition-opacity"
                  style={{ 
                    width: `${content.iconSize}px`,
                    height: `${content.iconSize}px`,
                    backgroundColor: platform.color || platformColors[platform.type],
                    color: 'white'
                  }}
                >
                  <Icon size={content.iconSize * 0.5} />
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