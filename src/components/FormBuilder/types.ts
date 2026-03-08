
export type FieldType = 
  | 'text' 
  | 'email' 
  | 'tel' 
  | 'textarea' 
  | 'select' 
  | 'checkbox' 
  | 'radio'
  | 'number'
  | 'date'
  | 'time'
  | 'url'
  | 'rating'
  | 'file'
  | 'heading'
  | 'paragraph';

export interface ConditionalRule {
  fieldId: string;       // The field that triggers the condition
  operator: 'equals' | 'not_equals' | 'contains' | 'not_empty' | 'is_empty';
  value?: string;        // The value to compare against
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  description?: string;
  min?: number;
  max?: number;
  maxLength?: number;
  acceptedFileTypes?: string[];
  width?: 'full' | 'half';
  conditionalRules?: ConditionalRule[];
  conditionalAction?: 'show' | 'hide';
}

export type FormDisplayMode = 'classic' | 'stepped';

export type FormFont = 'outfit' | 'inter' | 'playfair' | 'space-grotesk' | 'dm-sans' | 'libre-baskerville';

export interface FormTheme {
  backgroundColor?: string;
  textColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  accentColor?: string;
  backgroundImage?: string;
  logoUrl?: string;
  font?: FormFont;
  fullscreen?: boolean;
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

export interface ThankYouPage {
  title?: string;
  message?: string;
  imageUrl?: string;
  showConfetti?: boolean;
  ctaText?: string;
  ctaUrl?: string;
  redirectDelay?: number; // seconds before redirect, 0 = no auto redirect
}

export interface FormSettings {
  submitButtonText: string;
  successMessage: string;
  sendNotification: boolean;
  notificationEmail: string;
  addToContacts: boolean;
  redirectUrl?: string;
  theme?: 'default' | 'minimal' | 'modern';
  showProgressBar?: boolean;
  confirmationEmail?: boolean;
  displayMode?: FormDisplayMode;
  formTheme?: FormTheme;
  thankYouPage?: ThankYouPage;
}

export interface FormData {
  id: string;
  name: string;
  description: string;
  fields: FormField[];
  settings: FormSettings;
}

export interface FormSubmission {
  id: string;
  formId: string;
  data: Record<string, any>;
  submittedAt: string;
  contactId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export const FONT_OPTIONS: { value: FormFont; label: string; family: string }[] = [
  { value: 'outfit', label: 'Outfit', family: "'Outfit', sans-serif" },
  { value: 'inter', label: 'Inter', family: "'Inter', sans-serif" },
  { value: 'playfair', label: 'Playfair Display', family: "'Playfair Display', serif" },
  { value: 'space-grotesk', label: 'Space Grotesk', family: "'Space Grotesk', sans-serif" },
  { value: 'dm-sans', label: 'DM Sans', family: "'DM Sans', sans-serif" },
  { value: 'libre-baskerville', label: 'Libre Baskerville', family: "'Libre Baskerville', serif" },
];
