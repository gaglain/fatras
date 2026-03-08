
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
}

export type FormDisplayMode = 'classic' | 'stepped';

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
