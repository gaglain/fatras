import React from 'react';
import { FormTheme, FormFont, FONT_OPTIONS } from './types';

interface FormThemeWrapperProps {
  theme?: FormTheme;
  children: React.ReactNode;
  className?: string;
}

const getFontFamily = (font?: FormFont): string => {
  const option = FONT_OPTIONS.find(f => f.value === font);
  return option?.family || "'Outfit', sans-serif";
};

const getFontImportUrl = (font?: FormFont): string | null => {
  if (!font || font === 'outfit') return null; // Outfit is already loaded
  const fontMap: Record<string, string> = {
    inter: 'Inter:wght@300;400;500;600;700',
    playfair: 'Playfair+Display:wght@400;500;600;700',
    'space-grotesk': 'Space+Grotesk:wght@300;400;500;600;700',
    'dm-sans': 'DM+Sans:wght@300;400;500;600;700',
    'libre-baskerville': 'Libre+Baskerville:wght@400;700',
  };
  const fontParam = fontMap[font];
  return fontParam ? `https://fonts.googleapis.com/css2?family=${fontParam}&display=swap` : null;
};

const getBorderRadius = (radius?: string): string => {
  switch (radius) {
    case 'none': return '0px';
    case 'sm': return '4px';
    case 'md': return '8px';
    case 'lg': return '16px';
    case 'full': return '9999px';
    default: return '8px';
  }
};

export const FormThemeWrapper: React.FC<FormThemeWrapperProps> = ({ theme, children, className = '' }) => {
  const fontImportUrl = getFontImportUrl(theme?.font);

  const style: React.CSSProperties = {
    fontFamily: getFontFamily(theme?.font),
    backgroundColor: theme?.backgroundColor || undefined,
    color: theme?.textColor || undefined,
    '--form-button-bg': theme?.buttonColor || 'hsl(var(--primary))',
    '--form-button-text': theme?.buttonTextColor || 'hsl(var(--primary-foreground))',
    '--form-accent': theme?.accentColor || 'hsl(var(--primary))',
    '--form-border-radius': getBorderRadius(theme?.borderRadius),
    minHeight: theme?.fullscreen ? '100vh' : undefined,
    position: 'relative',
  } as React.CSSProperties;

  return (
    <>
      {fontImportUrl && (
        <link rel="stylesheet" href={fontImportUrl} />
      )}
      <div
        className={`relative ${theme?.fullscreen ? 'min-h-screen flex items-center justify-center' : ''} ${className}`}
        style={style}
      >
        {/* Background image overlay */}
        {theme?.backgroundImage && (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${theme.backgroundImage})`,
            }}
          >
            <div className="absolute inset-0 bg-black/40" />
          </div>
        )}

        {/* Content */}
        <div className={`relative z-10 w-full ${theme?.fullscreen ? 'max-w-2xl mx-auto px-6' : ''}`}>
          {/* Logo */}
          {theme?.logoUrl && (
            <div className="flex justify-center mb-6">
              <img
                src={theme.logoUrl}
                alt="Logo"
                className="max-h-16 w-auto object-contain"
              />
            </div>
          )}
          {children}
        </div>
      </div>
    </>
  );
};
