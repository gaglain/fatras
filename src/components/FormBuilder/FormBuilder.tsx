
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Trash2, Plus, Eye } from 'lucide-react';
import { FormField, FormData } from './types';

interface FormBuilderProps {
  initialForm?: FormData;
  onSave: (form: FormData) => void;
  onPreview?: (form: FormData) => void;
}

export const FormBuilder: React.FC<FormBuilderProps> = ({ initialForm, onSave, onPreview }) => {
  const [form, setForm] = useState<FormData>(initialForm || {
    id: '',
    name: '',
    description: '',
    fields: [],
    settings: {
      submitButtonText: 'Envoyer',
      successMessage: 'Merci pour votre message !',
      sendNotification: true,
      notificationEmail: '',
      addToContacts: true
    }
  });

  const addField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type: 'text',
      label: 'Nouveau champ',
      placeholder: '',
      required: false,
      options: []
    };
    setForm(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setForm(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }));
  };

  const removeField = (fieldId: string) => {
    setForm(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    }));
  };

  const addOption = (fieldId: string) => {
    const newOption = `Option ${Date.now()}`;
    updateField(fieldId, {
      options: [...(form.fields.find(f => f.id === fieldId)?.options || []), newOption]
    });
  };

  const updateOption = (fieldId: string, optionIndex: number, value: string) => {
    const field = form.fields.find(f => f.id === fieldId);
    if (field && field.options) {
      const newOptions = [...field.options];
      newOptions[optionIndex] = value;
      updateField(fieldId, { options: newOptions });
    }
  };

  const removeOption = (fieldId: string, optionIndex: number) => {
    const field = form.fields.find(f => f.id === fieldId);
    if (field && field.options) {
      const newOptions = field.options.filter((_, index) => index !== optionIndex);
      updateField(fieldId, { options: newOptions });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Form Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration du formulaire</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="form-name">Nom du formulaire</Label>
            <Input
              id="form-name"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Mon formulaire de contact"
            />
          </div>
          <div>
            <Label htmlFor="form-description">Description</Label>
            <Textarea
              id="form-description"
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description du formulaire..."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="submit-button">Texte du bouton</Label>
              <Input
                id="submit-button"
                value={form.settings.submitButtonText}
                onChange={(e) => setForm(prev => ({
                  ...prev,
                  settings: { ...prev.settings, submitButtonText: e.target.value }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="success-message">Message de succès</Label>
              <Input
                id="success-message"
                value={form.settings.successMessage}
                onChange={(e) => setForm(prev => ({
                  ...prev,
                  settings: { ...prev.settings, successMessage: e.target.value }
                }))}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="add-to-contacts"
              checked={form.settings.addToContacts}
              onCheckedChange={(checked) => setForm(prev => ({
                ...prev,
                settings: { ...prev.settings, addToContacts: checked }
              }))}
            />
            <Label htmlFor="add-to-contacts">Ajouter les soumissions aux contacts</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="send-notification"
              checked={form.settings.sendNotification}
              onCheckedChange={(checked) => setForm(prev => ({
                ...prev,
                settings: { ...prev.settings, sendNotification: checked }
              }))}
            />
            <Label htmlFor="send-notification">Envoyer une notification email</Label>
          </div>

          {form.settings.sendNotification && (
            <div>
              <Label htmlFor="notification-email">Email de notification</Label>
              <Input
                id="notification-email"
                type="email"
                value={form.settings.notificationEmail}
                onChange={(e) => setForm(prev => ({
                  ...prev,
                  settings: { ...prev.settings, notificationEmail: e.target.value }
                }))}
                placeholder="admin@example.com"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Fields */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Champs du formulaire</CardTitle>
            <Button onClick={addField}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un champ
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {form.fields.map((field, index) => (
            <Card key={field.id} className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Champ #{index + 1}</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeField(field.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type de champ</Label>
                    <Select
                      value={field.type}
                      onValueChange={(value) => updateField(field.id, { type: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Texte</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="tel">Téléphone</SelectItem>
                        <SelectItem value="textarea">Zone de texte</SelectItem>
                        <SelectItem value="select">Liste déroulante</SelectItem>
                        <SelectItem value="checkbox">Case à cocher</SelectItem>
                        <SelectItem value="radio">Boutons radio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Label</Label>
                    <Input
                      value={field.label}
                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                      placeholder="Nom du champ"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Placeholder</Label>
                    <Input
                      value={field.placeholder}
                      onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                      placeholder="Texte d'aide..."
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={field.required}
                      onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                    />
                    <Label>Champ obligatoire</Label>
                  </div>
                </div>

                {['select', 'radio', 'checkbox'].includes(field.type) && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Options</Label>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addOption(field.id)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Ajouter
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {field.options?.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center space-x-2">
                          <Input
                            value={option}
                            onChange={(e) => updateOption(field.id, optionIndex, e.target.value)}
                            placeholder={`Option ${optionIndex + 1}`}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeOption(field.id, optionIndex)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => onPreview?.(form)}>
          <Eye className="h-4 w-4 mr-2" />
          Aperçu
        </Button>
        <Button onClick={() => onSave(form)}>
          Sauvegarder le formulaire
        </Button>
      </div>
    </div>
  );
};
