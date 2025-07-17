
import React from 'react';
import { useWebsiteConfig } from '@/contexts/WebsiteConfigContext';
import { useSimpleWebsiteSync } from '@/hooks/useSimpleWebsiteSync';

export const SimpleFrontFooter: React.FC = () => {
  const { config } = useWebsiteConfig();
  useSimpleWebsiteSync();

  return (
    <footer 
      className="py-8 px-6 mt-auto"
      style={{
        background: config.footerBg,
        color: config.textColor
      }}
    >
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold mb-4 text-lg">Contact</h3>
            <div className="space-y-2 text-sm">
              <p>{config.contactEmail}</p>
              <p>{config.contactPhone}</p>
              <p>{config.address}</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-lg">Suivez-nous</h3>
            <div className="flex space-x-4">
              {config.socialLinks.facebook && (
                <a href={config.socialLinks.facebook} style={{ color: config.linkColor }}>Facebook</a>
              )}
              {config.socialLinks.instagram && (
                <a href={config.socialLinks.instagram} style={{ color: config.linkColor }}>Instagram</a>
              )}
              {config.socialLinks.twitter && (
                <a href={config.socialLinks.twitter} style={{ color: config.linkColor }}>Twitter</a>
              )}
              {config.socialLinks.linkedin && (
                <a href={config.socialLinks.linkedin} style={{ color: config.linkColor }}>LinkedIn</a>
              )}
              {config.socialLinks.youtube && (
                <a href={config.socialLinks.youtube} style={{ color: config.linkColor }}>YouTube</a>
              )}
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-lg">Informations légales</h3>
            <div className="space-y-2 text-sm">
              <a href="/mentions-legales" style={{ color: config.linkColor }}>Mentions légales</a>
              <a href="/cgv" style={{ color: config.linkColor }}>CGV</a>
              <a href="/politique-confidentialite" style={{ color: config.linkColor }}>Politique de confidentialité</a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-600 mt-8 pt-8 text-center text-sm">
          <p>© 2024 {config.siteName}. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};
