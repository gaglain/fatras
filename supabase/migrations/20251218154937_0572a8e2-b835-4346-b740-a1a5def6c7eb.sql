-- Update the homepage with default blocks including hero with background image support
UPDATE website_pages 
SET content = '[
  {
    "id": "hero-1",
    "type": "hero",
    "content": {
      "title": "Fatras",
      "subtitle": "Spectacle de rue & de scène",
      "buttonText": "Découvrir nos Spectacles",
      "buttonLink": "#spectacles",
      "backgroundImage": ""
    }
  },
  {
    "id": "events-section",
    "type": "events",
    "content": {
      "title": "Nos Spectacles à Venir",
      "showAll": false
    }
  },
  {
    "id": "artists-section",
    "type": "artists",
    "content": {
      "title": "Nos Spectacles",
      "showAll": false
    }
  }
]'::jsonb,
updated_at = now()
WHERE id = '716db8b9-4733-4c5c-a09e-fa4e21f0e0b7';