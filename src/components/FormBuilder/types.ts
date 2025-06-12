
export interface FormField {
  id: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'radio';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

export interface FormSettings {
  submitButtonText: string;
  successMessage: string;
  sendNotification: boolean;
  notificationEmail: string;
  addToContacts: boolean;
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
}
