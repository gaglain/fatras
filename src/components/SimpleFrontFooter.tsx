
import React from 'react';
import { useWebsiteConfig } from '@/contexts/WebsiteConfigContext';

export const SimpleFrontFooter: React.FC = () => {
  const { config } = useWebsiteConfig();

  return (
    <footer 
      className="mt-auto py-8 px-4"
      style={{
        background: config.footerBg,
        color: config.textColor
      }}
    >
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4 text-lg" style={{ color: config.textColor }}>
              Contact
            </h3>
            <div className="space-y-2 text-sm">
              <p style={{ color: config.textColor }}>{config.contactEmail}</p>
              <p style={{ color: config.textColor }}>{config.contactPhone}</p>
              <p style={{ color: config.textColor }}>{config.address}</p>
            </div>
          </div>

          {/* Réseaux sociaux */}
          <div>
            <h3 className="font-semibold mb-4 text-lg" style={{ color: config.textColor }}>
              Suivez-nous
            </h3>
            <div className="flex space-x-4">
              {config.socialLinks.facebook && (
                <a 
                  href={config.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                  style={{ color: config.linkColor }}
                >
                  Facebook
                </a>
              )}
              {config.socialLinks.instagram && (
                <a 
                  href={config.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                  style={{ color: config.linkColor }}
                >
                  Instagram
                </a>
              )}
              {config.socialLinks.twitter && (
                <a 
                  href={config.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                  style={{ color: config.linkColor }}
                >
                  Twitter
                </a>
              )}
              {config.socialLinks.youtube && (
                <a 
                  href={config.socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                  style={{ color: config.linkColor }}
                >
                  YouTube
                </a>
              )}
              {config.socialLinks.linkedin && (
                <a 
                  href={config.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                  style={{ color: config.linkColor }}
                >
                  LinkedIn
                </a>
              )}
            </div>
          </div>

          {/* Informations légales */}
          <div>
            <h3 className="font-semibold mb-4 text-lg" style={{ color: config.textColor }}>
              Informations légales
            </h3>
            <div className="space-y-2 text-sm">
              <a 
                href="/mentions-legales"
                className="block hover:opacity-80 transition-opacity"
                style={{ color: config.linkColor }}
              >
                Mentions légales
              </a>
              <a 
                href="/cgv"
                className="block hover:opacity-80 transition-opacity"
                style={{ color: config.linkColor }}
              >
                CGV
              </a>
              <a 
                href="/politique-confidentialite"
                className="block hover:opacity-80 transition-opacity"
                style={{ color: config.linkColor }}
              >
                Politique de confidentialité
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-600 mt-8 pt-8 text-center text-sm">
          <p style={{ color: config.textColor }}>
            © 2024 {config.siteName}. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};
