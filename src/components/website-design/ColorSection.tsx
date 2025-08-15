import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Palette } from 'lucide-react';

interface SiteDesign {
  site_name?: string;
  logo?: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  text_color: string;
  link_color: string;
  header_bg: string;
  footer_bg: string;
}

interface ColorSectionProps {
  design: SiteDesign;
  onInputChange: (field: string, value: string) => void;
}

export const ColorSection: React.FC<ColorSectionProps> = ({ design, onInputChange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Palette className="h-5 w-5 mr-2" />
          Couleurs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="primaryColor">Couleur principale</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="primaryColor"
                type="color"
                value={design.primary_color}
                onChange={(e) => onInputChange('primaryColor', e.target.value)}
                className="w-16 h-10 p-1 border rounded"
              />
              <Input
                type="text"
                value={design.primary_color}
                onChange={(e) => onInputChange('primaryColor', e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="secondaryColor">Couleur secondaire</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="secondaryColor"
                type="color"
                value={design.secondary_color}
                onChange={(e) => onInputChange('secondaryColor', e.target.value)}
                className="w-16 h-10 p-1 border rounded"
              />
              <Input
                type="text"
                value={design.secondary_color}
                onChange={(e) => onInputChange('secondaryColor', e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="textColor">Couleur du texte</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="textColor"
                type="color"
                value={design.text_color}
                onChange={(e) => onInputChange('textColor', e.target.value)}
                className="w-16 h-10 p-1 border rounded"
              />
              <Input
                type="text"
                value={design.text_color}
                onChange={(e) => onInputChange('textColor', e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="linkColor">Couleur des liens</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="linkColor"
                type="color"
                value={design.link_color}
                onChange={(e) => onInputChange('linkColor', e.target.value)}
                className="w-16 h-10 p-1 border rounded"
              />
              <Input
                type="text"
                value={design.link_color}
                onChange={(e) => onInputChange('linkColor', e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};