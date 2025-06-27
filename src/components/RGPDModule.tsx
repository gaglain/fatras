
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { X, Shield, Cookie, Eye } from 'lucide-react';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

interface RGPDModuleProps {
  onAccept?: (preferences: CookiePreferences) => void;
  onDecline?: () => void;
}

export const RGPDModule: React.FC<RGPDModuleProps> = ({ onAccept, onDecline }) => {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true
    };
    
    localStorage.setItem('cookieConsent', JSON.stringify(allAccepted));
    setShowBanner(false);
    setShowPreferences(false);
    onAccept?.(allAccepted);
  };

  const handleDeclineAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false
    };
    
    localStorage.setItem('cookieConsent', JSON.stringify(onlyNecessary));
    setShowBanner(false);
    setShowPreferences(false);
    onDecline?.();
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookieConsent', JSON.stringify(preferences));
    setShowBanner(false);
    setShowPreferences(false);
    onAccept?.(preferences);
  };

  const updatePreference = (key: keyof CookiePreferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Bannière principale */}
      {!showPreferences && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Cookie className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Gestion des cookies</h3>
                  <p className="text-sm text-gray-600">
                    Nous utilisons des cookies pour améliorer votre expérience et analyser l'utilisation de notre site.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowPreferences(true)}>
                  Personnaliser
                </Button>
                <Button variant="outline" size="sm" onClick={handleDeclineAll}>
                  Refuser
                </Button>
                <Button size="sm" onClick={handleAcceptAll}>
                  Accepter tout
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de préférences */}
      {showPreferences && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-semibold">Préférences de cookies</h2>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowPreferences(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Cookies nécessaires */}
                <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">Cookies nécessaires</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Ces cookies sont essentiels au fonctionnement du site et ne peuvent pas être désactivés.
                    </p>
                  </div>
                  <Switch checked={preferences.necessary} disabled />
                </div>

                {/* Cookies analytiques */}
                <div className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">Cookies analytiques</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Ces cookies nous aident à comprendre comment vous utilisez notre site.
                    </p>
                  </div>
                  <Switch 
                    checked={preferences.analytics} 
                    onCheckedChange={(checked) => updatePreference('analytics', checked)}
                  />
                </div>

                {/* Cookies marketing */}
                <div className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">Cookies marketing</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Ces cookies sont utilisés pour vous proposer des publicités pertinentes.
                    </p>
                  </div>
                  <Switch 
                    checked={preferences.marketing} 
                    onCheckedChange={(checked) => updatePreference('marketing', checked)}
                  />
                </div>

                {/* Cookies fonctionnels */}
                <div className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">Cookies fonctionnels</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Ces cookies permettent d'améliorer les fonctionnalités du site.
                    </p>
                  </div>
                  <Switch 
                    checked={preferences.functional} 
                    onCheckedChange={(checked) => updatePreference('functional', checked)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={handleDeclineAll}>
                  Refuser tout
                </Button>
                <Button onClick={handleSavePreferences}>
                  Sauvegarder mes préférences
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};
