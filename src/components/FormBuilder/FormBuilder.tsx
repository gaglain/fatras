
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Trash2, Plus, Eye, GripVertical, Copy, Settings2, Type, Mail, Phone, FileText, ListOrdered, CheckSquare, Circle, Hash, Calendar, Clock, Link, Star, Upload, Heading, AlignLeft } from 'lucide-react';
import { FormField, FormData, FieldType } from './types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FormBuilderProps {
  initialForm?: FormData;
  onSave: (form: FormData) => void;
  onPreview?: (form: FormData) => void;
}

const FIELD_TYPES: { type: FieldType; label: string; icon: React.ReactNode }[] = [
  { type: 'text', label: 'Texte court', icon: <Type className="h-4 w-4" /> },
  { type: 'textarea', label: 'Texte long', icon: <FileText className="h-4 w-4" /> },
  { type: 'email', label: 'Email', icon: <Mail className="h-4 w-4" /> },
  { type: 'tel', label: 'Téléphone', icon: <Phone className="h-4 w-4" /> },
  { type: 'number', label: 'Nombre', icon: <Hash className="h-4 w-4" /> },
  { type: 'select', label: 'Liste déroulante', icon: <ListOrdered className="h-4 w-4" /> },
  { type: 'radio', label: 'Choix unique', icon: <Circle className="h-4 w-4" /> },
  { type: 'checkbox', label: 'Cases à cocher', icon: <CheckSquare className="h-4 w-4" /> },
  { type: 'date', label: 'Date', icon: <Calendar className="h-4 w-4" /> },
  { type: 'time', label: 'Heure', icon: <Clock className="h-4 w-4" /> },
  { type: 'url', label: 'URL', icon: <Link className="h-4 w-4" /> },
  { type: 'rating', label: 'Évaluation', icon: <Star className="h-4 w-4" /> },
  { type: 'file', label: 'Fichier', icon: <Upload className="h-4 w-4" /> },
  { type: 'heading', label: 'Titre', icon: <Heading className="h-4 w-4" /> },
  { type: 'paragraph', label: 'Paragraphe', icon: <AlignLeft className="h-4 w-4" /> },
];

export const FormBuilder: React.FC<FormBuilderProps> = ({ initialForm, onSave, onPreview }) => {
  const [form, setForm] = useState<FormData>(initialForm || {
    id: '',
    name: '',
    description: '',
    fields: [],
    settings: {
      submitButtonText: 'Envoyer',
      successMessage: 'Merci pour votre soumission !',
      sendNotification: true,
      notificationEmail: '',
      addToContacts: true,
      theme: 'default',
      showProgressBar: false,
      confirmationEmail: false
    }
  });

  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const addField = (type: FieldType) => {
    const fieldTypeInfo = FIELD_TYPES.find(f => f.type === type);
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: fieldTypeInfo?.label || 'Nouveau champ',
      placeholder: '',
      required: false,
      options: ['select', 'radio', 'checkbox'].includes(type) ? ['Option 1', 'Option 2'] : [],
      width: 'full'
    };
    setForm(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
    setSelectedFieldId(newField.id);
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
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
    }
  };

  const duplicateField = (fieldId: string) => {
    const field = form.fields.find(f => f.id === fieldId);
    if (field) {
      const newField = {
        ...field,
        id: `field_${Date.now()}`,
        label: `${field.label} (copie)`
      };
      const index = form.fields.findIndex(f => f.id === fieldId);
      setForm(prev => ({
        ...prev,
        fields: [
          ...prev.fields.slice(0, index + 1),
          newField,
          ...prev.fields.slice(index + 1)
        ]
      }));
    }
  };

  const addOption = (fieldId: string) => {
    const field = form.fields.find(f => f.id === fieldId);
    if (field) {
      updateField(fieldId, {
        options: [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`]
      });
    }
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

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newFields = [...form.fields];
    const draggedField = newFields[draggedIndex];
    newFields.splice(draggedIndex, 1);
    newFields.splice(index, 0, draggedField);
    
    setForm(prev => ({ ...prev, fields: newFields }));
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const selectedField = form.fields.find(f => f.id === selectedFieldId);

  return (
    <div className="flex h-[70vh] gap-4">
      {/* Left Panel - Field Types */}
      <div className="w-64 border rounded-lg bg-card">
        <div className="p-3 border-b">
          <h3 className="font-semibold text-sm">Types de champs</h3>
        </div>
        <ScrollArea className="h-[calc(100%-52px)]">
          <div className="p-2 grid grid-cols-2 gap-2">
            {FIELD_TYPES.map(({ type, label, icon }) => (
              <button
                key={type}
                onClick={() => addField(type)}
                className="flex flex-col items-center gap-1 p-3 rounded-lg border hover:bg-accent hover:border-primary transition-colors text-xs"
              >
                {icon}
                <span className="text-center leading-tight">{label}</span>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Center Panel - Form Preview */}
      <div className="flex-1 border rounded-lg bg-card overflow-hidden">
        <div className="p-3 border-b flex items-center justify-between">
          <Input
            value={form.name}
            onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Nom du formulaire"
            className="text-lg font-semibold border-0 shadow-none focus-visible:ring-0 px-0"
          />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onPreview?.(form)}>
              <Eye className="h-4 w-4 mr-1" />
              Aperçu
            </Button>
            <Button size="sm" onClick={() => onSave(form)}>
              Sauvegarder
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[calc(100%-60px)]">
          <div className="p-4 space-y-3">
            {form.description !== undefined && (
              <Textarea
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description du formulaire (optionnel)"
                className="resize-none border-dashed"
                rows={2}
              />
            )}

            {form.fields.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Cliquez sur un type de champ à gauche pour commencer</p>
              </div>
            ) : (
              <div className="space-y-2">
                {form.fields.map((field, index) => (
                  <div
                    key={field.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    onClick={() => setSelectedFieldId(field.id)}
                    className={`group relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedFieldId === field.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-transparent hover:border-muted-foreground/20 bg-muted/30'
                    } ${draggedIndex === index ? 'opacity-50' : ''}`}
                  >
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 cursor-grab">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <div className="ml-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          {field.label}
                          {field.required && <span className="text-destructive ml-1">*</span>}
                        </span>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          {FIELD_TYPES.find(t => t.type === field.type)?.label}
                        </span>
                      </div>

                      {field.type === 'heading' ? (
                        <h3 className="text-lg font-bold">{field.label}</h3>
                      ) : field.type === 'paragraph' ? (
                        <p className="text-sm text-muted-foreground">{field.description || 'Texte de paragraphe...'}</p>
                      ) : field.type === 'rating' ? (
                        <div className="flex gap-1">
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} className="h-5 w-5 text-muted-foreground/30" />
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          {field.placeholder || 'Placeholder...'}
                        </div>
                      )}
                    </div>

                    <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => { e.stopPropagation(); duplicateField(field.id); }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={(e) => { e.stopPropagation(); removeField(field.id); }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right Panel - Field Settings */}
      <div className="w-72 border rounded-lg bg-card">
        <Tabs defaultValue="field" className="h-full flex flex-col">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0">
            <TabsTrigger value="field" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
              Champ
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
              <Settings2 className="h-4 w-4 mr-1" />
              Paramètres
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            <TabsContent value="field" className="p-4 mt-0 space-y-4">
              {selectedField ? (
                <>
                  <div>
                    <Label>Label</Label>
                    <Input
                      value={selectedField.label}
                      onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                    />
                  </div>

                  {!['heading', 'paragraph'].includes(selectedField.type) && (
                    <>
                      <div>
                        <Label>Placeholder</Label>
                        <Input
                          value={selectedField.placeholder || ''}
                          onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label>Description (aide)</Label>
                        <Textarea
                          value={selectedField.description || ''}
                          onChange={(e) => updateField(selectedField.id, { description: e.target.value })}
                          rows={2}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>Obligatoire</Label>
                        <Switch
                          checked={selectedField.required}
                          onCheckedChange={(checked) => updateField(selectedField.id, { required: checked })}
                        />
                      </div>

                      <div>
                        <Label>Largeur</Label>
                        <Select
                          value={selectedField.width || 'full'}
                          onValueChange={(value: 'full' | 'half') => updateField(selectedField.id, { width: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full">Pleine largeur</SelectItem>
                            <SelectItem value="half">Demi-largeur</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  {selectedField.type === 'paragraph' && (
                    <div>
                      <Label>Contenu</Label>
                      <Textarea
                        value={selectedField.description || ''}
                        onChange={(e) => updateField(selectedField.id, { description: e.target.value })}
                        rows={4}
                      />
                    </div>
                  )}

                  {['number', 'rating'].includes(selectedField.type) && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Min</Label>
                        <Input
                          type="number"
                          value={selectedField.min || ''}
                          onChange={(e) => updateField(selectedField.id, { min: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label>Max</Label>
                        <Input
                          type="number"
                          value={selectedField.max || ''}
                          onChange={(e) => updateField(selectedField.id, { max: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                  )}

                  {['text', 'textarea'].includes(selectedField.type) && (
                    <div>
                      <Label>Longueur max</Label>
                      <Input
                        type="number"
                        value={selectedField.maxLength || ''}
                        onChange={(e) => updateField(selectedField.id, { maxLength: Number(e.target.value) })}
                      />
                    </div>
                  )}

                  {['select', 'radio', 'checkbox'].includes(selectedField.type) && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Options</Label>
                        <Button size="sm" variant="outline" onClick={() => addOption(selectedField.id)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {selectedField.options?.map((option, i) => (
                          <div key={i} className="flex gap-1">
                            <Input
                              value={option}
                              onChange={(e) => updateOption(selectedField.id, i, e.target.value)}
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              className="shrink-0"
                              onClick={() => removeOption(selectedField.id, i)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">Sélectionnez un champ pour le configurer</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="settings" className="p-4 mt-0 space-y-4">
              <div>
                <Label>Texte du bouton</Label>
                <Input
                  value={form.settings.submitButtonText}
                  onChange={(e) => setForm(prev => ({
                    ...prev,
                    settings: { ...prev.settings, submitButtonText: e.target.value }
                  }))}
                />
              </div>

              <div>
                <Label>Message de succès</Label>
                <Textarea
                  value={form.settings.successMessage}
                  onChange={(e) => setForm(prev => ({
                    ...prev,
                    settings: { ...prev.settings, successMessage: e.target.value }
                  }))}
                  rows={2}
                />
              </div>

              <div>
                <Label>URL de redirection (optionnel)</Label>
                <Input
                  value={form.settings.redirectUrl || ''}
                  onChange={(e) => setForm(prev => ({
                    ...prev,
                    settings: { ...prev.settings, redirectUrl: e.target.value }
                  }))}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Ajouter aux contacts</Label>
                  <Switch
                    checked={form.settings.addToContacts}
                    onCheckedChange={(checked) => setForm(prev => ({
                      ...prev,
                      settings: { ...prev.settings, addToContacts: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm">Notification email</Label>
                  <Switch
                    checked={form.settings.sendNotification}
                    onCheckedChange={(checked) => setForm(prev => ({
                      ...prev,
                      settings: { ...prev.settings, sendNotification: checked }
                    }))}
                  />
                </div>

                {form.settings.sendNotification && (
                  <div>
                    <Label>Email de notification</Label>
                    <Input
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

                <div className="flex items-center justify-between">
                  <Label className="text-sm">Email de confirmation</Label>
                  <Switch
                    checked={form.settings.confirmationEmail || false}
                    onCheckedChange={(checked) => setForm(prev => ({
                      ...prev,
                      settings: { ...prev.settings, confirmationEmail: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm">Barre de progression</Label>
                  <Switch
                    checked={form.settings.showProgressBar || false}
                    onCheckedChange={(checked) => setForm(prev => ({
                      ...prev,
                      settings: { ...prev.settings, showProgressBar: checked }
                    }))}
                  />
                </div>
              </div>

              <div className="pt-2 border-t">
                <Label>Mode d'affichage</Label>
                <Select
                  value={form.settings.displayMode || 'classic'}
                  onValueChange={(value: 'classic' | 'stepped') => setForm(prev => ({
                    ...prev,
                    settings: { ...prev.settings, displayMode: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="classic">Classique (tous les champs)</SelectItem>
                    <SelectItem value="stepped">Question par question (Tally)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Le mode "question par question" affiche une seule question à la fois avec des animations.
                </p>
              </div>

              <div className="pt-2 border-t">
                <Label>Thème</Label>
                <Select
                  value={form.settings.theme || 'default'}
                  onValueChange={(value: 'default' | 'minimal' | 'modern') => setForm(prev => ({
                    ...prev,
                    settings: { ...prev.settings, theme: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Par défaut</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="modern">Moderne</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
};
