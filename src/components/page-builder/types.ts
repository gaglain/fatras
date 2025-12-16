export interface BlockStyle {
  backgroundColor?: string;
  textColor?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  margin?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  textAlign?: 'left' | 'center' | 'right';
  fontSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
}

export interface Block {
  id: string;
  type: BlockType;
  order: number;
  content: any;
  style?: BlockStyle;
}

export type BlockType = 
  | 'hero'
  | 'text'
  | 'image'
  | 'gallery'
  | 'columns'
  | 'testimonials'
  | 'faq'
  | 'pricing'
  | 'team'
  | 'counter'
  | 'cta'
  | 'contact-form'
  | 'spacer'
  | 'divider';

export interface WebPage {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft' | 'archived';
  blocks: Block[];
  metaDescription: string;
}

export type ViewportMode = 'desktop' | 'tablet' | 'mobile';

export interface BlockConfig {
  type: BlockType;
  label: string;
  icon: string;
  category: 'layout' | 'content' | 'media' | 'interactive';
  defaultContent: any;
  defaultStyle?: BlockStyle;
}

export const BLOCK_CONFIGS: BlockConfig[] = [
  {
    type: 'hero',
    label: 'Hero',
    icon: 'Layout',
    category: 'layout',
    defaultContent: {
      title: 'Titre Principal',
      subtitle: 'Sous-titre descriptif',
      backgroundImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200',
      buttonText: 'En savoir plus',
      buttonLink: '#',
      overlay: true,
      overlayOpacity: 50
    },
    defaultStyle: { padding: 'lg', textAlign: 'center' }
  },
  {
    type: 'text',
    label: 'Texte',
    icon: 'Type',
    category: 'content',
    defaultContent: { content: 'Votre texte ici...' },
    defaultStyle: { padding: 'md', textAlign: 'left', fontSize: 'base' }
  },
  {
    type: 'image',
    label: 'Image',
    icon: 'Image',
    category: 'media',
    defaultContent: { src: '/placeholder.svg', alt: 'Image', size: 'md' },
    defaultStyle: { padding: 'md', textAlign: 'center' }
  },
  {
    type: 'columns',
    label: 'Colonnes',
    icon: 'Columns',
    category: 'layout',
    defaultContent: {
      columns: 2,
      gap: 'md',
      items: [
        { title: 'Colonne 1', content: 'Contenu de la colonne 1' },
        { title: 'Colonne 2', content: 'Contenu de la colonne 2' }
      ]
    },
    defaultStyle: { padding: 'md' }
  },
  {
    type: 'gallery',
    label: 'Galerie',
    icon: 'Grid',
    category: 'media',
    defaultContent: {
      title: 'Galerie Photos',
      images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
      columns: 3
    },
    defaultStyle: { padding: 'md' }
  },
  {
    type: 'testimonials',
    label: 'Témoignages',
    icon: 'Quote',
    category: 'content',
    defaultContent: {
      title: 'Ce que disent nos clients',
      items: [
        { name: 'Jean Dupont', role: 'Client', content: 'Excellent service !', avatar: '' },
        { name: 'Marie Martin', role: 'Partenaire', content: 'Une équipe professionnelle.', avatar: '' }
      ]
    },
    defaultStyle: { padding: 'lg', backgroundColor: '#f9fafb' }
  },
  {
    type: 'faq',
    label: 'FAQ',
    icon: 'HelpCircle',
    category: 'content',
    defaultContent: {
      title: 'Questions fréquentes',
      items: [
        { question: 'Question 1 ?', answer: 'Réponse à la question 1.' },
        { question: 'Question 2 ?', answer: 'Réponse à la question 2.' }
      ]
    },
    defaultStyle: { padding: 'lg' }
  },
  {
    type: 'pricing',
    label: 'Tarifs',
    icon: 'CreditCard',
    category: 'content',
    defaultContent: {
      title: 'Nos Tarifs',
      items: [
        { name: 'Basic', price: '99€', features: ['Feature 1', 'Feature 2'], highlighted: false },
        { name: 'Pro', price: '199€', features: ['Feature 1', 'Feature 2', 'Feature 3'], highlighted: true },
        { name: 'Enterprise', price: 'Sur devis', features: ['Tout inclus'], highlighted: false }
      ]
    },
    defaultStyle: { padding: 'xl' }
  },
  {
    type: 'team',
    label: 'Équipe',
    icon: 'Users',
    category: 'content',
    defaultContent: {
      title: 'Notre Équipe',
      items: [
        { name: 'Nom Prénom', role: 'Fonction', image: '/placeholder.svg', bio: '' }
      ]
    },
    defaultStyle: { padding: 'lg' }
  },
  {
    type: 'counter',
    label: 'Compteurs',
    icon: 'TrendingUp',
    category: 'content',
    defaultContent: {
      items: [
        { value: '100+', label: 'Clients' },
        { value: '50+', label: 'Projets' },
        { value: '10+', label: 'Années' }
      ]
    },
    defaultStyle: { padding: 'lg', textAlign: 'center', backgroundColor: '#1f2937', textColor: '#ffffff' }
  },
  {
    type: 'cta',
    label: 'Call to Action',
    icon: 'MousePointer',
    category: 'interactive',
    defaultContent: {
      title: 'Prêt à commencer ?',
      subtitle: 'Contactez-nous dès aujourd\'hui',
      buttonText: 'Nous contacter',
      buttonLink: '/contact'
    },
    defaultStyle: { padding: 'xl', textAlign: 'center', backgroundColor: '#3b82f6', textColor: '#ffffff' }
  },
  {
    type: 'contact-form',
    label: 'Formulaire',
    icon: 'Mail',
    category: 'interactive',
    defaultContent: {
      title: 'Nous Contacter',
      fields: ['name', 'email', 'message']
    },
    defaultStyle: { padding: 'lg' }
  },
  {
    type: 'spacer',
    label: 'Espaceur',
    icon: 'Maximize2',
    category: 'layout',
    defaultContent: { height: 'md' },
    defaultStyle: {}
  },
  {
    type: 'divider',
    label: 'Séparateur',
    icon: 'Minus',
    category: 'layout',
    defaultContent: { style: 'solid', width: 'full' },
    defaultStyle: { padding: 'md' }
  }
];
