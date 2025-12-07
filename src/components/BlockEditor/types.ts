
export type BlockType = 'text' | 'image' | 'hero' | 'artist-grid' | 'contact-form' | 'gallery' | 'background-image';

export interface Block {
  id: string;
  type: BlockType;
  content: any;
  order: number;
}

export interface TextBlockContent {
  content: string;
  alignment: 'left' | 'center' | 'right';
  fontSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  color?: string;
}

export interface ImageBlockContent {
  src: string;
  alt: string;
  caption?: string;
  alignment: 'left' | 'center' | 'right';
  size?: 'sm' | 'md' | 'lg' | 'full';
}

export interface HeroBlockContent {
  title: string;
  subtitle: string;
  backgroundImage: string;
  buttonText?: string;
  buttonLink?: string;
  showButton?: boolean;
  textColor?: string;
  overlayOpacity?: number;
}

export interface ArtistGridBlockContent {
  title: string;
  subtitle: string;
  showRating: boolean;
  showStats: boolean;
  columns?: 1 | 2 | 3 | 4;
}
