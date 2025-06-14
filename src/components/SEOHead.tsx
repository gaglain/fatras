
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
  locale?: string;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = "MusiConnect - Plateforme de booking d'artistes",
  description = "Découvrez notre plateforme de booking d'artistes et créons ensemble des expériences musicales exceptionnelles pour vos événements.",
  keywords = "booking, artistes, musique, événements, concerts, spectacles",
  image = "/placeholder.svg",
  url = window.location.href,
  type = "website",
  siteName = "MusiConnect",
  locale = "fr_FR"
}) => {
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;

  return (
    <Helmet>
      {/* Basic meta tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="language" content="fr" />
      <meta name="author" content={siteName} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Additional SEO tags */}
      <meta name="theme-color" content="#1632f4" />
      <link rel="canonical" href={url} />
      
      {/* JSON-LD structured data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": siteName,
          "description": description,
          "url": url,
          "logo": image,
          "sameAs": [
            "https://www.facebook.com/musiconnect",
            "https://www.twitter.com/musiconnect",
            "https://www.instagram.com/musiconnect"
          ]
        })}
      </script>
    </Helmet>
  );
};
