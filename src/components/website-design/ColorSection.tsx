
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Palette } from 'lucide-react';

interface SiteDesign {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  linkColor: string;
  headerBg: string;
  footerBg: string;
}

interface ColorSectionProps {
  design: SiteDesign;
  onInputChange: (field: keyof SiteDesign, value: string) => void;
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
                value={design.primaryColor}
                onChange={(e) => onInputChange('primaryColor', e.target.value)}
                className="w-16 h-10 p-1 border rounded"
              />
              <Input
                type="text"
                value={design.primaryColor}
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
                value={design.secondaryColor}
                onChange={(e) => onInputChange('secondaryColor', e.target.value)}
                className="w-16 h-10 p-1 border rounded"
              />
              <Input
                type="text"
                value={design.secondaryColor}
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
                value={design.textColor}
                onChange={(e) => onInputChange('textColor', e.target.value)}
                className="w-16 h-10 p-1 border rounded"
              />
              <Input
                type="text"
                value={design.textColor}
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
                value={design.linkColor}
                onChange={(e) => onInputChange('linkColor', e.target.value)}
                className="w-16 h-10 p-1 border rounded"
              />
              <Input
                type="text"
                value={design.linkColor}
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
