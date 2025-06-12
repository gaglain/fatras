
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FormBuilder } from '@/components/FormBuilder/FormBuilder';
import { FormRenderer } from '@/components/FormBuilder/FormRenderer';
import { FormData, FormSubmission } from '@/components/FormBuilder/types';
import { Plus, Edit, Eye, Trash2, FileText, Users } from 'lucide-react';
import { toast } from 'sonner';

const defaultForms: FormData[] = [
  {
    id: '1',
    name: 'Contact',
    description: 'Formulaire de contact principal',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Nom complet',
        placeholder: 'Votre nom',
        required: true,
        options: []
      },
      {
        id: 'email',
        type: 'email',
        label: 'Email',
        placeholder: 'votre@email.com',
        required: true,
        options: []
      },
      {
        id: 'phone',
        type: 'tel',
        label: 'Téléphone',
        placeholder: '+33 6 12 34 56 78',
        required: false,
        options: []
      },
      {
        id: 'subject',
        type: 'select',
        label: 'Sujet',
        placeholder: 'Choisissez un sujet',
        required: true,
        options: ['Demande d\'information', 'Réservation', 'Partenariat', 'Autre']
      },
      {
        id: 'message',
        type: 'textarea',
        label: 'Message',
        placeholder: 'Votre message...',
        required: true,
        options: []
      }
    ],
    settings: {
      submitButtonText: 'Envoyer',
      successMessage: 'Merci pour votre message ! Nous vous répondrons rapidement.',
      sendNotification: true,
      notificationEmail: 'contact@musicrm.com',
      addToContacts: true
    }
  }
];

export const Forms: React.FC = () => {
  const [forms, setForms] = useState<FormData[]>(defaultForms);
  const [selectedForm, setSelectedForm] = useState<FormData | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);

  const handleSaveForm = (formData: FormData) => {
    if (selectedForm) {
      // Update existing form
      setForms(prev => prev.map(form => 
        form.id === selectedForm.id ? formData : form
      ));
      toast.success('Formulaire mis à jour');
    } else {
      // Create new form
      const newForm = {
        ...formData,
        id: `form_${Date.now()}`
      };
      setForms(prev => [...prev, newForm]);
      toast.success('Formulaire créé');
    }
    
    setShowBuilder(false);
    setSelectedForm(null);
  };

  const handleDeleteForm = (formId: string) => {
    setForms(prev => prev.filter(form => form.id !== formId));
    toast.success('Formulaire supprimé');
  };

  const handleFormSubmission = (submission: FormSubmission) => {
    setSubmissions(prev => [...prev, submission]);
    console.log('Nouvelle soumission:', submission);
  };

  const getSubmissionCount = (formId: string) => {
    return submissions.filter(sub => sub.formId === formId).length;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestionnaire de Formulaires</h1>
          <p className="text-gray-600 mt-2">Créez et gérez vos formulaires personnalisés</p>
        </div>
        <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedForm(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Formulaire
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedForm ? 'Modifier le formulaire' : 'Nouveau formulaire'}
              </DialogTitle>
            </DialogHeader>
            <FormBuilder
              initialForm={selectedForm || undefined}
              onSave={handleSaveForm}
              onPreview={(form) => {
                setSelectedForm(form);
                setShowPreview(true);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Formulaires</p>
                <p className="text-2xl font-bold text-gray-900">{forms.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Soumissions Total</p>
                <p className="text-2xl font-bold text-gray-900">{submissions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Nouveaux Contacts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {submissions.filter(sub => {
                    const form = forms.find(f => f.id === sub.formId);
                    return form?.settings.addToContacts;
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forms List */}
      <Card>
        <CardHeader>
          <CardTitle>Vos Formulaires</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {forms.map((form) => (
              <div key={form.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-medium">{form.name}</h3>
                    <Badge variant="secondary">
                      {form.fields.length} champs
                    </Badge>
                    <Badge variant="outline">
                      {getSubmissionCount(form.id)} soumissions
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{form.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>
                      {form.settings.addToContacts ? '✓' : '✗'} Ajouter aux contacts
                    </span>
                    <span>
                      {form.settings.sendNotification ? '✓' : '✗'} Notifications email
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedForm(form);
                      setShowPreview(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedForm(form);
                      setShowBuilder(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteForm(form.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Aperçu du formulaire</DialogTitle>
          </DialogHeader>
          {selectedForm && (
            <FormRenderer
              form={selectedForm}
              onSubmit={handleFormSubmission}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
