
export interface EmailBlock {
  id: string;
  type: 'text' | 'heading' | 'button' | 'divider' | 'spacer' | 'image' | 'video' | 'social' | 'footer' | 'columns';
  content: TextBlockContent | HeadingBlockContent | ButtonBlockContent | DividerBlockContent | SpacerBlockContent | ImageBlockContent | VideoBlockContent | SocialBlockContent | FooterBlockContent | ColumnBlockContent;
}

export interface ColumnBlockContent {
  columns: Array<{ html: string }>;
}

export interface VideoBlockContent {
  url: string;
  width: string;
  align: 'left' | 'center' | 'right';
}

export interface SocialBlockContent {
  platforms: {
    facebook?: { url: string; enabled: boolean };
    twitter?: { url: string; enabled: boolean };
    instagram?: { url: string; enabled: boolean };
    linkedin?: { url: string; enabled: boolean };
  };
  alignment: 'left' | 'center' | 'right';
  iconSize: number;
  spacing: number;
}

export interface FooterBlockContent {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  unsubscribeText: string;
  showUnsubscribe: boolean;
  showSocialLinks: boolean;
  backgroundColor: string;
  textColor: string;
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
