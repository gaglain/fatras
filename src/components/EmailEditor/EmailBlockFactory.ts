import { EmailBlock, TextBlockContent, HeadingBlockContent, ButtonBlockContent, DividerBlockContent, SpacerBlockContent, ImageBlockContent, SocialBlockContent, FooterBlockContent } from './types';

export function createDefaultBlockContent(type: EmailBlock['type']): any {
  switch (type) {
    case 'text':
      return { text: 'Votre texte ici...', fontSize: 14, color: '#000000', align: 'left', bold: false, italic: false } as TextBlockContent;
    case 'heading':
      return { text: 'Votre titre ici', level: 1, color: '#000000', align: 'left' } as HeadingBlockContent;
    case 'button':
      return { text: 'Cliquez ici', url: 'https://example.com', backgroundColor: '#007bff', textColor: '#ffffff', align: 'center', borderRadius: 4, padding: { top: 12, bottom: 12, left: 24, right: 24 } } as ButtonBlockContent;
    case 'divider':
      return { color: '#cccccc', thickness: 1, style: 'solid' } as DividerBlockContent;
    case 'spacer':
      return { height: 20 } as SpacerBlockContent;
    case 'image':
      return { src: '', alt: '', width: 100, align: 'center' } as ImageBlockContent;
    case 'social':
      return {
        platforms: [
          { type: 'facebook', url: '', enabled: false, color: '#1877F2' },
          { type: 'instagram', url: '', enabled: false, color: '#E4405F' },
          { type: 'linkedin', url: '', enabled: false, color: '#0A66C2' },
          { type: 'youtube', url: '', enabled: false, color: '#FF0000' }
        ], align: 'center', iconSize: 40, spacing: 12
      } as SocialBlockContent;
    case 'footer':
      return {
        companyName: 'Mon Entreprise', address: '123 Rue Example, 75001 Paris',
        phone: '+33 1 23 45 67 89', email: 'contact@entreprise.com',
        website: 'https://www.entreprise.com', unsubscribeText: 'Se désabonner',
        showUnsubscribe: true, showSocialLinks: false, backgroundColor: '#f8f9fa', textColor: '#666666'
      } as FooterBlockContent;
    default:
      return {};
  }
}
