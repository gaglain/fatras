import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Upload, Palette, Type, Monitor, Save, Plus, X, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const Preferences: React.FC = () => {
  const [logo, setLogo] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState('ShowManager Pro');
  const [primaryColor, setPrimaryColor] = useState('#9333ea');
  const [secondaryColor, setSecondaryColor] = useState('#6b7280');
  const [backgroundColor, setBackgroundColor] = useState('#f9fafb');
  const [fontFamily, setFontFamily] = useState('inter');
  const [fontSize, setFontSize] = useState('medium');
  const [darkMode, setDarkMode] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [customTaskTypes, setCustomTaskTypes] = useState(['email', 'phone', 'meeting', 'other']);
  const [newTaskType, setNewTaskType] = useState('');
  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailEmail, setGmailEmail] = useState('');

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogo(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addTaskType = () => {
    if (newTaskType && !customTaskTypes.includes(newTaskType.toLowerCase())) {
      setCustomTaskTypes([...customTaskTypes, newTaskType.toLowerCase()]);
      setNewTaskType('');
    }
  };

  const removeTaskType = (typeToRemove: string) => {
    if (!['email', 'phone', 'meeting', 'other'].includes(typeToRemove)) {
      setCustomTaskTypes(customTaskTypes.filter(type => type !== typeToRemove));
    }
  };

  const connectGmail = () => {
    // Mock Gmail connection
    setGmailConnected(true);
    setGmailEmail('user@gmail.com');
  };

  const colorPresets = [
    { name: 'Violet', primary: '#9333ea', secondary: '#6b7280' },
    { name: 'Bleu', primary: '#2563eb', secondary: '#6b7280' },
    { name: 'Vert', primary: '#16a34a', secondary: '#6b7280' },
    { name: 'Rouge', primary: '#dc2626', secondary: '#6b7280' },
    { name: 'Orange', primary: '#ea580c', secondary: '#6b7280' },
    { name: 'Rose', primary: '#e11d48', secondary: '#6b7280' },
  ];

  const backgroundPresets = [
    { name: 'Gris Clair', color: '#f9fafb' },
    { name: 'Blanc', color: '#ffffff' },
    { name: 'Bleu Clair', color: '#f0f9ff' },
    { name: 'Violet Clair', color: '#faf5ff' },
    { name: 'Vert Clair', color: '#f0fdf4' },
    { name: 'Beige', color: '#fefbf3' },
  ];

  const fontOptions = [
    { value: 'inter', label: 'Inter (Défaut)' },
    { value: 'roboto', label: 'Roboto' },
    { value: 'open-sans', label: 'Open Sans' },
    { value: 'lato', label: 'Lato' },
    { value: 'montserrat', label: 'Montserrat' },
    { value: 'poppins', label: 'Poppins' },
  ];

  const handleSavePreferences = () => {
    const preferences = {
      logo,
      companyName,
      primaryColor,
      secondaryColor,
      backgroundColor,
      fontFamily,
      fontSize,
      darkMode,
      compactMode,
      customTaskTypes,
      gmailConnected,
      gmailEmail,
    };
    
    localStorage.setItem('appPreferences', JSON.stringify(preferences));
    
    // Apply changes to document
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    document.documentElement.style.setProperty('--secondary-color', secondaryColor);
    document.body.style.backgroundColor = backgroundColor;
    document.documentElement.className = darkMode ? 'dark' : '';
    
    // Reload to apply changes
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Préférences</h1>
          <p className="text-gray-600 mt-2">Personnalisez l'apparence et le comportement de votre application</p>
        </div>
        <Button onClick={handleSavePreferences} className="bg-purple-600 hover:bg-purple-700">
          <Save className="h-4 w-4 mr-2" />
          Sauvegarder
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Branding */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Identité Visuelle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="company-name">Nom de l'entreprise</Label>
              <Input
                id="company-name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Nom de votre entreprise"
              />
            </div>
            
            <div>
              <Label htmlFor="logo-upload">Logo de l'application</Label>
              <div className="mt-2">
                {logo ? (
                  <div className="flex items-center space-x-4">
                    <img src={logo} alt="Logo" className="h-16 w-16 object-contain border rounded" />
                    <Button variant="outline" size="sm" onClick={() => setLogo(null)}>
                      Supprimer
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Button variant="outline" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Télécharger un logo
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                  </label>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">Format recommandé: PNG ou SVG, taille maximum 2MB</p>
            </div>
          </CardContent>
        </Card>

        {/* Couleurs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="h-5 w-5 mr-2" />
              Couleurs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Thèmes prédéfinis</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.name}
                    className="p-3 border rounded-lg hover:bg-gray-50 text-center"
                    onClick={() => {
                      setPrimaryColor(preset.primary);
                      setSecondaryColor(preset.secondary);
                    }}
                  >
                    <div className="flex space-x-1 justify-center mb-1">
                      <div 
                        className="w-4 h-4 rounded" 
                        style={{ backgroundColor: preset.primary }}
                      />
                      <div 
                        className="w-4 h-4 rounded" 
                        style={{ backgroundColor: preset.secondary }}
                      />
                    </div>
                    <span className="text-xs">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <Label>Couleurs d'arrière-plan</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {backgroundPresets.map((preset) => (
                  <button
                    key={preset.name}
                    className="p-3 border rounded-lg hover:bg-gray-50 text-center"
                    onClick={() => setBackgroundColor(preset.color)}
                  >
                    <div className="flex justify-center mb-1">
                      <div 
                        className="w-8 h-4 rounded border" 
                        style={{ backgroundColor: preset.color }}
                      />
                    </div>
                    <span className="text-xs">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primary-color">Couleur principale</Label>
                <div className="flex space-x-2 mt-1">
                  <Input
                    id="primary-color"
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    placeholder="#9333ea"
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="background-color">Couleur d'arrière-plan</Label>
                <div className="flex space-x-2 mt-1">
                  <Input
                    id="background-color"
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    placeholder="#f9fafb"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Types */}
        <Card>
          <CardHeader>
            <CardTitle>Types de Tâches Personnalisés</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Types de tâches disponibles</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {customTaskTypes.map((type) => (
                  <Badge key={type} variant="outline" className="flex items-center space-x-1">
                    <span>{type}</span>
                    {!['email', 'phone', 'meeting', 'other'].includes(type) && (
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeTaskType(type)}
                      />
                    )}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex space-x-2">
              <Input
                placeholder="Nouveau type de tâche"
                value={newTaskType}
                onChange={(e) => setNewTaskType(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTaskType()}
              />
              <Button onClick={addTaskType} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Email Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Intégration Email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Connexion Gmail</Label>
                <p className="text-sm text-gray-500">
                  {gmailConnected ? `Connecté à ${gmailEmail}` : 'Connectez votre compte Gmail'}
                </p>
              </div>
              {gmailConnected ? (
                <Button variant="outline" onClick={() => setGmailConnected(false)}>
                  Déconnecter
                </Button>
              ) : (
                <Button onClick={connectGmail} className="bg-red-600 hover:bg-red-700">
                  Connecter Gmail
                </Button>
              )}
            </div>
            {gmailConnected && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                  ✓ Gmail connecté avec succès. Vous pouvez maintenant envoyer des emails directement depuis l'application.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Typographie */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Type className="h-5 w-5 mr-2" />
              Typographie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="font-family">Police de caractères</Label>
              <Select value={fontFamily} onValueChange={setFontFamily}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une police" />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="font-size">Taille de police</Label>
              <Select value={fontSize} onValueChange={setFontSize}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une taille" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Petite</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="large">Grande</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 border rounded-lg bg-gray-50">
              <p className="text-sm text-gray-600 mb-2">Aperçu du texte :</p>
              <div style={{ fontFamily: fontFamily === 'inter' ? 'Inter' : fontFamily }}>
                <h3 className="font-semibold">Titre d'exemple</h3>
                <p className="text-sm">Voici un exemple de texte avec la police sélectionnée.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interface */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Monitor className="h-5 w-5 mr-2" />
              Interface
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dark-mode">Mode sombre</Label>
                <p className="text-sm text-gray-500">Activer le thème sombre</p>
              </div>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="compact-mode">Mode compact</Label>
                <p className="text-sm text-gray-500">Réduire l'espacement entre les éléments</p>
              </div>
              <Switch
                id="compact-mode"
                checked={compactMode}
                onCheckedChange={setCompactMode}
              />
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-2">Aperçu de l'interface</h4>
              <div 
                className="p-4 border rounded-lg"
                style={{ 
                  backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                  color: darkMode ? '#ffffff' : '#000000'
                }}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div 
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <span className="font-medium">{companyName}</span>
                </div>
                <p className="text-sm opacity-75">
                  Exemple d'interface avec vos paramètres
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Aperçu Global */}
      <Card>
        <CardHeader>
          <CardTitle>Aperçu Global</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="p-6 border-2 border-dashed rounded-lg"
            style={{ 
              backgroundColor: darkMode ? '#111827' : '#f9fafb',
              borderColor: primaryColor + '40'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {logo && (
                  <img src={logo} alt="Logo" className="h-8 w-8 object-contain" />
                )}
                <h2 
                  className="text-xl font-bold"
                  style={{ 
                    color: darkMode ? '#ffffff' : '#000000',
                    fontFamily: fontFamily === 'inter' ? 'Inter' : fontFamily
                  }}
                >
                  {companyName}
                </h2>
              </div>
              <Button 
                style={{ backgroundColor: primaryColor }}
                className="text-white"
              >
                Bouton d'exemple
              </Button>
            </div>
            <p 
              className="mb-4"
              style={{ 
                color: darkMode ? '#d1d5db' : '#6b7280',
                fontFamily: fontFamily === 'inter' ? 'Inter' : fontFamily
              }}
            >
              Ceci est un aperçu de votre interface personnalisée avec les paramètres choisis.
            </p>
            <div className="flex space-x-2">
              <div 
                className="w-4 h-4 rounded"
                style={{ backgroundColor: primaryColor }}
              />
              <div 
                className="w-4 h-4 rounded"
                style={{ backgroundColor: secondaryColor }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
