
export interface EmailBlock {
  id: string;
  type: 'text' | 'image' | 'button' | 'spacer' | 'divider' | 'heading';
  order: number;
  content: Record<string, any>;
}

export interface TextBlockContent {
  text: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  textAlign: 'left' | 'center' | 'right';
  color: string;
}

export interface ImageBlockContent {
  src: string;
  alt: string;
  width: number;
  height?: number;
  alignment: 'left' | 'center' | 'right';
  link?: string;
}

export interface ButtonBlockContent {
  text: string;
  link: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: number;
  padding: string;
  alignment: 'left' | 'center' | 'right';
}

export interface HeadingBlockContent {
  text: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  textAlign: 'left' | 'center' | 'right';
  color: string;
}

export interface SpacerBlockContent {
  height: number;
}

export interface DividerBlockContent {
  color: string;
  thickness: number;
  style: 'solid' | 'dashed' | 'dotted';
}
