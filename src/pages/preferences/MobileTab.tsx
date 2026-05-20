
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Download, QrCode, ExternalLink, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const MobileTab: React.FC = () => {
  const navigate = useNavigate();

  const handleReplayTour = () => {
    toast.success("Lancement du tour guidé…");
    navigate("/dashboard");
    // Let the route change settle before triggering
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("fatras:start-onboarding"));
    }, 400);
  };

  return (
    <Card className="mb-24 md:mb-0">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Smartphone className="h-5 w-5 mr-2" />
          Applications mobiles
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <QrCode className="h-4 w-4" />
          <AlertDescription>
            <strong>Application PWA disponible!</strong><br />
            Cette application est installable sur votre appareil mobile en tant qu'app Progressive Web App (PWA).
          </AlertDescription>
        </Alert>
        
        <div className="text-center">
          <Button 
            onClick={() => navigate('/install')}
            size="lg"
            className="w-full"
          >
            <Download className="h-5 w-5 mr-2" />
            Voir les instructions d'installation
          </Button>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Installation rapide sur iOS (Safari):</h3>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Ouvrez cette page dans Safari</li>
              <li>Appuyez sur l'icône de partage (carré avec flèche vers le haut)</li>
              <li>Sélectionnez "Sur l'écran d'accueil"</li>
              <li>Confirmez l'installation</li>
            </ol>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Installation rapide sur Android (Chrome):</h3>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Ouvrez cette page dans Chrome</li>
              <li>Appuyez sur le menu (trois points verticaux)</li>
              <li>Sélectionnez "Ajouter à l'écran d'accueil"</li>
              <li>Confirmez l'installation</li>
            </ol>
          </div>
        </div>
        
        <div className="text-center space-y-4 pt-4 border-t">
          <p className="text-muted-foreground">
            Applications natives iOS et Android en développement
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" disabled className="flex items-center">
              <Download className="h-4 w-4 mr-2" />
              App Store (Bientôt)
            </Button>
            <Button variant="outline" disabled className="flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Google Play (Bientôt)
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <PlayCircle className="h-4 w-4" /> Tour guidé de l'application
          </h3>
          <p className="text-sm text-muted-foreground">
            Revoyez le tour de bienvenue pour redécouvrir les fonctionnalités principales selon votre rôle.
          </p>
          <Button onClick={handleReplayTour} variant="outline" className="w-full">
            <PlayCircle className="h-4 w-4 mr-2" />
            Relancer le tour guidé
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
