export interface EmailBlock {
  id: string;
  type: 'text' | 'heading' | 'button' | 'image' | 'video' | 'divider' | 'spacer' | 'social' | 'columns';
  content: any;
}
