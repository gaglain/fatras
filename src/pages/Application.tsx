
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Smartphone, 
  Download, 
  Settings, 
  Palette, 
  Bell, 
  Shield,
  PlayCircle,
  Package,
  Zap,
  Users,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

export const Application: React.FC = () => {
  const [buildInProgress, setBuildInProgress] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);
  const [lastBuildDate, setLastBuildDate] = useState<Date | null>(null);

  const handleBuildApp = async (platform: 'android' | 'ios' | 'both') => {
    setBuildInProgress(true);
    setBuildProgress(0);
    
    toast.info(`Début de la compilation ${platform === 'both' ? 'Android et iOS' : platform}...`);
    
    // Simulation du processus de build
    const progressInterval = setInterval(() => {
      setBuildProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 1000);

    try {
      // Simulation d'appel API pour lancer le build
      await new Promise(resolve => setTimeout(resolve, 8000));
      
      clearInterval(progressInterval);
      setBuildProgress(100);
      
      setTimeout(() => {
        setBuildInProgress(false);
        setBuildProgress(0);
        setLastBuildDate(new Date());
        
        if (platform === 'android' || platform === 'both') {
          // Simuler le téléchargement de l'APK
          const apkBlob = new Blob(['APK file content'], { type: 'application/vnd.android.package-archive' });
          const apkUrl = URL.createObjectURL(apkBlob);
          const apkLink = document.createElement('a');
          apkLink.href = apkUrl;
          apkLink.download = `monapp-${Date.now()}.apk`;
          apkLink.click();
          URL.revokeObjectURL(apkUrl);
        }
        
        if (platform === 'ios' || platform === 'both') {
          // Simuler le téléchargement de l'IPA
          const ipaBlob = new Blob(['IPA file content'], { type: 'application/octet-stream' });
          const ipaUrl = URL.createObjectURL(ipaBlob);
          const ipaLink = document.createElement('a');
          ipaLink.href = ipaUrl;
          ipaLink.download = `monapp-${Date.now()}.ipa`;
          ipaLink.click();
          URL.revokeObjectURL(ipaUrl);
        }
        
        toast.success(`Application ${platform} compilée et téléchargée avec succès !`);
      }, 1000);
      
    } catch (error) {
      clearInterval(progressInterval);
      setBuildInProgress(false);
      setBuildProgress(0);
      toast.error('Erreur lors de la compilation de l\'application');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Smartphone className="h-8 w-8 mr-3 text-blue-600" />
            Application Mobile
          </h1>
          <p className="text-muted-foreground mt-2">
            Gérez et déployez votre application mobile
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <PlayCircle className="h-3 w-3 mr-1" />
            Prête à compiler
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="build" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="build" className="flex items-center space-x-2">
            <Package className="h-4 w-4" />
            <span>Compilation</span>
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Configuration</span>
          </TabsTrigger>
          <TabsTrigger value="design" className="flex items-center space-x-2">
            <Palette className="h-4 w-4" />
            <span>Design</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Analytiques</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="build">
          <div className="space-y-6">
            {/* Status de compilation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                  État de la compilation
                </CardTitle>
              </CardHeader>
              <CardContent>
                {buildInProgress ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Compilation en cours...</span>
                      <span className="text-sm text-muted-foreground">{Math.round(buildProgress)}%</span>
                    </div>
                    <Progress value={buildProgress} className="w-full" />
                    <p className="text-sm text-muted-foreground">
                      {buildProgress < 30 && "Préparation de l'environnement..."}
                      {buildProgress >= 30 && buildProgress < 60 && "Compilation du code..."}
                      {buildProgress >= 60 && buildProgress < 90 && "Génération des fichiers..."}
                      {buildProgress >= 90 && "Finalisation..."}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">Prêt pour la compilation</h3>
                    <p className="text-muted-foreground mb-4">
                      {lastBuildDate 
                        ? `Dernière compilation: ${lastBuildDate.toLocaleDateString()} à ${lastBuildDate.toLocaleTimeString()}`
                        : "Aucune compilation récente"
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Options de compilation */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Smartphone className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle>Android APK</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Compilation pour appareils Android
                  </p>
                </CardHeader>
                <CardContent className="text-center">
                  <Button 
                    onClick={() => handleBuildApp('android')}
                    disabled={buildInProgress}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Compiler APK
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Format: .apk • Compatible Android 5.0+
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Smartphone className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle>iOS IPA</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Compilation pour appareils iOS
                  </p>
                </CardHeader>
                <CardContent className="text-center">
                  <Button 
                    onClick={() => handleBuildApp('ios')}
                    disabled={buildInProgress}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Compiler IPA
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Format: .ipa • Compatible iOS 12.0+
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow border-2 border-purple-200">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <Package className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle>Compilation Complète</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Android APK + iOS IPA
                  </p>
                </CardHeader>
                <CardContent className="text-center">
                  <Button 
                    onClick={() => handleBuildApp('both')}
                    disabled={buildInProgress}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Compiler Tout
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Compilation simultanée des deux plateformes
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Informations sur la compilation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-blue-500" />
                  Informations importantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                    <p><strong>Mises à jour automatiques:</strong> L'application se synchronise automatiquement avec vos modifications</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                    <p><strong>Testing:</strong> Testez votre application sur des appareils réels avant publication</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5"></div>
                    <p><strong>Distribution:</strong> Les fichiers générés peuvent être installés directement ou distribués</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Configuration de l'application</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nom de l'application</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Mon Application"
                      defaultValue="Mon Application"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Identifiant du package</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="com.monentreprise.monapp"
                      defaultValue="com.monentreprise.monapp"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Version</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="1.0.0"
                      defaultValue="1.0.0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Code de version</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="1"
                      defaultValue="1"
                    />
                  </div>
                </div>
                
                <Button className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Sauvegarder la configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="design">
          <Card>
            <CardHeader>
              <CardTitle>Personnalisation de l'apparence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Couleur principale</label>
                    <input
                      type="color"
                      className="w-full h-10 rounded-lg border"
                      defaultValue="#3B82F6"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Couleur secondaire</label>
                    <input
                      type="color"
                      className="w-full h-10 rounded-lg border"
                      defaultValue="#10B981"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Icône de l'application</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-sm text-gray-500">Glissez votre icône ici ou cliquez pour sélectionner</p>
                    <p className="text-xs text-gray-400 mt-2">Format recommandé: 1024x1024 PNG</p>
                  </div>
                </div>
                
                <Button className="w-full">
                  <Palette className="h-4 w-4 mr-2" />
                  Appliquer les modifications
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytiques d'utilisation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Users className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <div className="text-2xl font-bold text-blue-600">0</div>
                  <div className="text-sm text-gray-600">Utilisateurs actifs</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Download className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <div className="text-sm text-gray-600">Téléchargements</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <BarChart3 className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                  <div className="text-2xl font-bold text-purple-600">0</div>
                  <div className="text-sm text-gray-600">Sessions</div>
                </div>
              </div>
              
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Les analytiques seront disponibles après la première utilisation</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
