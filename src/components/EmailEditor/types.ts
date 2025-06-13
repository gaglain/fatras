
export interface EmailBlock {
  id: string;
  type: 'text' | 'heading' | 'button' | 'divider' | 'spacer' | 'image';
  content: TextBlockContent | HeadingBlockContent | ButtonBlockContent | DividerBlockContent | SpacerBlockContent | ImageBlockContent;
}

export interface TextBlockContent {
  text: string;
  fontSize: number;
  color: string;
  alignment: 'left' | 'center' | 'right';
  bold: boolean;
  italic: boolean;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
}

export interface HeadingBlockContent {
  text: string;
  level: 1 | 2 | 3;
  color: string;
  alignment: 'left' | 'center' | 'right';
  textAlign?: 'left' | 'center' | 'right';
}

export interface ButtonBlockContent {
  text: string;
  url: string;
  link?: string;
  backgroundColor: string;
  textColor: string;
  alignment: 'left' | 'center' | 'right';
  borderRadius: number;
  padding: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  } | string;
}

export interface DividerBlockContent {
  color: string;
  thickness: number;
  style: 'solid' | 'dashed' | 'dotted';
}

export interface SpacerBlockContent {
  height: number;
}

export interface ImageBlockContent {
  src: string;
  alt: string;
  width: number;
  height?: string;
  alignment: 'left' | 'center' | 'right';
  borderRadius?: number;
}
