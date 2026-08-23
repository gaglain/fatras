
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
  // For artist/event pages
  artistData?: {
    name: string;
    description?: string;
    image?: string;
    genre?: string;
    sameAs?: string[];
  };
  eventData?: {
    name: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    location?: string;
    image?: string;
    performer?: string;
  };
}

// Structured data for the organization (Fatras as PerformingArtsOrganization)
const getOrganizationSchema = (siteName: string, description: string, url: string, image: string) => ({
  "@context": "https://schema.org",
  "@type": "PerformingArtsOrganization",
  "name": siteName,
  "alternateName": "Fatras - Spectacle de rue & de scène",
  "description": description,
  "url": url,
  "logo": image,
  "foundingDate": "2024",
  "areaServed": "France",
  "performerIn": {
    "@type": "EventSeries",
    "name": "Spectacles Fatras"
  },
  "sameAs": [
    "https://www.facebook.com/fatras",
    "https://www.instagram.com/fatras"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "booking",
    "availableLanguage": ["French"]
  }
});

// Structured data for a music group / performing group
const getMusicGroupSchema = (artistData: SEOHeadProps['artistData']) => {
  if (!artistData) return null;
  
  return {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    "name": artistData.name,
    "description": artistData.description || "",
    "image": artistData.image,
    "genre": artistData.genre || "Spectacle de rue",
    "sameAs": artistData.sameAs || []
  };
};

// Structured data for an event
const getEventSchema = (eventData: SEOHeadProps['eventData']) => {
  if (!eventData) return null;
  
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": eventData.name,
    "description": eventData.description,
    "startDate": eventData.startDate,
    "endDate": eventData.endDate,
    "location": {
      "@type": "Place",
      "name": eventData.location
    },
    "image": eventData.image,
    "performer": eventData.performer ? {
      "@type": "PerformingGroup",
      "name": eventData.performer
    } : undefined,
    "organizer": {
      "@type": "Organization",
      "name": "Fatras"
    },
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode"
  };
};

// BreadcrumbList schema
const getBreadcrumbSchema = (items: { name: string; url: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});

// Construit une URL canonique propre : pas de query string (?_r=...),
// pas de slash final, et suppression du préfixe technique /front
export const buildCanonicalUrl = (pathname?: string) => {
  const base = "https://fatras.net";
  let path = pathname;
  if (path === undefined) {
    path = typeof window !== 'undefined' ? window.location.pathname : '/';
  }
  path = (path || '/').split('?')[0].split('#')[0];
  if (!path.startsWith('/')) path = `/${path}`;
  // /front, /front/ -> /   |   /front/cgv -> /cgv
  path = path.replace(/^\/front(?=\/|$)/, '');
  path = path.replace(/\/+$/, '');
  return `${base}${path || '/'}`;
};

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = "Fatras - Spectacle de rue & de scène",
  description = "Fatras, compagnie de spectacle de rue et de scène. Découvrez nos créations artistiques uniques et réservez nos spectacles pour vos événements.",
  keywords = "spectacle de rue, spectacle de scène, compagnie artistique, Fatras, événements, festivals, arts de la rue",
  image: imageProp,
  url: urlProp,
  type = "website",
  siteName = "Fatras",
  locale = "fr_FR",
  artistData,
  eventData
}) => {
  const url = buildCanonicalUrl(
    urlProp ? urlProp.replace(/^https?:\/\/[^/]+/, '') : undefined
  );
  const ensureAbsoluteUrl = (imgUrl: string) => {
    if (!imgUrl) return "https://fatras.net/og-image.jpg";
    if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) return imgUrl;
    if (imgUrl.startsWith('/')) return `https://fatras.net${imgUrl}`;
    return `https://fatras.net/${imgUrl}`;
  };

  
  const image = ensureAbsoluteUrl(imageProp || "https://fatras.net/og-image.jpg");
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
  const baseUrl = "https://fatras.net";

  const structuredDataItems: Record<string, unknown>[] = [
    getOrganizationSchema(siteName, description, baseUrl, image)
  ];

  if (artistData) {
    const musicGroupSchema = getMusicGroupSchema(artistData);
    if (musicGroupSchema) structuredDataItems.push(musicGroupSchema);
  }

  if (eventData) {
    const eventSchema = getEventSchema(eventData);
    if (eventSchema) structuredDataItems.push(eventSchema);
  }

  return (
    <Helmet>
      {/* Basic meta tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="language" content="fr" />
      <meta name="author" content={siteName} />
      <meta name="geo.region" content="FR" />
      <meta name="geo.placename" content="France" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Additional SEO tags */}
      <meta name="theme-color" content="#b45309" />
      <link rel="canonical" href={url} />
      
      {/* JSON-LD structured data */}
      {structuredDataItems.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

// Specialized component for artist pages
export const ArtistSEOHead: React.FC<{
  artist: {
    name: string;
    bio?: string;
    image?: string;
    genre?: string;
    slug?: string;
  };
}> = ({ artist }) => {
  return (
    <SEOHead
      title={`${artist.name} - Spectacle`}
      description={artist.bio || `Découvrez ${artist.name}, spectacle de la compagnie Fatras.`}
      keywords={`${artist.name}, spectacle, ${artist.genre || 'arts de la rue'}, Fatras, compagnie`}
      image={artist.image}
      url={`https://fatras.net/artistes/${artist.slug || artist.name.toLowerCase().replace(/\s+/g, '-')}`}
      type="profile"
      artistData={{
        name: artist.name,
        description: artist.bio,
        image: artist.image,
        genre: artist.genre
      }}
    />
  );
};

// Specialized component for event pages
export const EventSEOHead: React.FC<{
  event: {
    title: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    venue?: string;
    city?: string;
    image?: string;
    artistName?: string;
  };
}> = ({ event }) => {
  const location = [event.venue, event.city].filter(Boolean).join(', ');
  
  return (
    <SEOHead
      title={event.title}
      description={event.description || `${event.title} - Spectacle Fatras${location ? ` à ${location}` : ''}`}
      keywords={`${event.title}, spectacle, événement, ${event.city || ''}, Fatras`}
      image={event.image}
      type="event"
      eventData={{
        name: event.title,
        description: event.description,
        startDate: event.start_date,
        endDate: event.end_date,
        location: location,
        image: event.image,
        performer: event.artistName
      }}
    />
  );
};
