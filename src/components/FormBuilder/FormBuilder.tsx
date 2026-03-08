import React, { useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Trash2,
  Plus,
  Eye,
  GripVertical,
  Copy,
  Settings2,
  Type,
  Mail,
  Phone,
  FileText,
  ListOrdered,
  CheckSquare,
  Circle,
  Hash,
  Calendar,
  Clock,
  Link,
  Star,
  Upload,
  Heading,
  AlignLeft,
  Palette,
  GitBranch,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { FormField, FormData, FieldType } from './types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FormThemeEditor } from './FormThemeEditor';
import { ConditionalLogicEditor } from './ConditionalLogicEditor';
import { cn } from '@/lib/utils';

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

const FIELD_WITH_OPTIONS: FieldType[] = ['select', 'radio', 'checkbox'];

export const FormBuilder: React.FC<FormBuilderProps> = ({ initialForm, onSave, onPreview }) => {
  const [form, setForm] = useState<FormData>(
    initialForm || {
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
        confirmationEmail: false,
      },
    }
  );

  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [fieldSearch, setFieldSearch] = useState('');

  useEffect(() => {
    if (!selectedFieldId && form.fields.length > 0) {
      setSelectedFieldId(form.fields[0].id);
    }
  }, [selectedFieldId, form.fields]);

  const filteredFieldTypes = useMemo(
    () =>
      FIELD_TYPES.filter((item) =>
        item.label.toLowerCase().includes(fieldSearch.toLowerCase())
      ),
    [fieldSearch]
  );

  const addField = (type: FieldType, insertAt?: number) => {
    const fieldTypeInfo = FIELD_TYPES.find((f) => f.type === type);
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: fieldTypeInfo?.label || 'Nouveau champ',
      placeholder: '',
      required: false,
      options: FIELD_WITH_OPTIONS.includes(type) ? ['Option 1', 'Option 2'] : [],
      width: 'full',
    };

    setForm((prev) => {
      if (insertAt === undefined || insertAt < 0 || insertAt > prev.fields.length) {
        return { ...prev, fields: [...prev.fields, newField] };
      }

      const nextFields = [...prev.fields];
      nextFields.splice(insertAt, 0, newField);
      return { ...prev, fields: nextFields };
    });

    setSelectedFieldId(newField.id);
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setForm((prev) => ({
      ...prev,
      fields: prev.fields.map((field) =>
        field.id === fieldId ? { ...field, ...updates } : field
      ),
    }));
  };

  const removeField = (fieldId: string) => {
    setForm((prev) => ({
      ...prev,
      fields: prev.fields.filter((field) => field.id !== fieldId),
    }));
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
    }
  };

  const duplicateField = (fieldId: string) => {
    const field = form.fields.find((f) => f.id === fieldId);
    if (!field) return;

    const newField = {
      ...field,
      id: `field_${Date.now()}`,
      label: `${field.label} (copie)`,
    };

    const index = form.fields.findIndex((f) => f.id === fieldId);
    setForm((prev) => ({
      ...prev,
      fields: [
        ...prev.fields.slice(0, index + 1),
        newField,
        ...prev.fields.slice(index + 1),
      ],
    }));
    setSelectedFieldId(newField.id);
  };

  const addOption = (fieldId: string) => {
    const field = form.fields.find((f) => f.id === fieldId);
    if (!field) return;

    updateField(fieldId, {
      options: [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`],
    });
  };

  const updateOption = (fieldId: string, optionIndex: number, value: string) => {
    const field = form.fields.find((f) => f.id === fieldId);
    if (!field?.options) return;

    const newOptions = [...field.options];
    newOptions[optionIndex] = value;
    updateField(fieldId, { options: newOptions });
  };

  const removeOption = (fieldId: string, optionIndex: number) => {
    const field = form.fields.find((f) => f.id === fieldId);
    if (!field?.options) return;

    const newOptions = field.options.filter((_, index) => index !== optionIndex);
    updateField(fieldId, { options: newOptions });
  };

  const moveField = (from: number, to: number) => {
    if (from === to) return;

    setForm((prev) => {
      const newFields = [...prev.fields];
      const [moved] = newFields.splice(from, 1);
      newFields.splice(to, 0, moved);
      return { ...prev, fields: newFields };
    });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    moveField(draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const selectedField = form.fields.find((f) => f.id === selectedFieldId);

  const renderFieldPreview = (field: FormField) => {
    if (field.type === 'heading') {
      return <h3 className="text-xl font-semibold text-foreground">{field.label}</h3>;
    }

    if (field.type === 'paragraph') {
      return (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {field.description || 'Texte de paragraphe...'}
        </p>
      );
    }

    if (field.type === 'rating') {
      return (
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} className="h-5 w-5 text-muted-foreground/40" />
          ))}
        </div>
      );
    }

    if (FIELD_WITH_OPTIONS.includes(field.type) && field.options?.length) {
      return (
        <div className="space-y-2">
          {field.options.slice(0, 3).map((option, index) => (
            <div
              key={option + index}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-muted-foreground"
            >
              {option}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="rounded-md border border-dashed border-border bg-background px-3 py-2 text-sm text-muted-foreground">
        {field.placeholder || 'Votre réponse...'}
      </div>
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 lg:flex-row">
      <aside className="hidden w-72 shrink-0 rounded-xl border bg-card lg:flex lg:flex-col">
        <div className="border-b p-3">
          <h3 className="text-sm font-semibold text-foreground">Ajouter une question</h3>
          <p className="mt-1 text-xs text-muted-foreground">Glissez-déposez ou cliquez pour ajouter</p>
          <Input
            value={fieldSearch}
            onChange={(e) => setFieldSearch(e.target.value)}
            placeholder="Rechercher un champ..."
            className="mt-3 h-9"
          />
        </div>
        <ScrollArea className="flex-1">
          <div className="grid grid-cols-2 gap-2 p-3">
            {filteredFieldTypes.map(({ type, label, icon }) => (
              <button
                key={type}
                onClick={() => addField(type)}
                className="group rounded-lg border border-border bg-background p-3 text-left transition-all hover:border-primary/50 hover:bg-accent"
              >
                <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-md bg-muted text-foreground">
                  {icon}
                </div>
                <p className="text-xs font-medium leading-tight text-foreground">{label}</p>
              </button>
            ))}
          </div>
        </ScrollArea>
      </aside>

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card">
        <div className="border-b bg-card p-3 md:p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex-1 space-y-2">
              <Input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Nom du formulaire"
                className="h-10 border-0 bg-transparent px-0 text-xl font-semibold shadow-none focus-visible:ring-0"
              />
              <Textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Description du formulaire (optionnel)"
                rows={2}
                className="resize-none border-dashed"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => onPreview?.(form)}>
                <Eye className="mr-1.5 h-4 w-4" />
                Aperçu
              </Button>
              <Button onClick={() => onSave(form)}>
                <Sparkles className="mr-1.5 h-4 w-4" />
                Sauvegarder
              </Button>
            </div>
          </div>
        </div>

        <div className="border-b p-3 lg:hidden">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-2 pb-2">
              {FIELD_TYPES.map(({ type, label, icon }) => (
                <Button
                  key={type}
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={() => addField(type)}
                >
                  {icon}
                  <span className="ml-1.5 text-xs">{label}</span>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        <ScrollArea className="flex-1">
          <div className="mx-auto w-full max-w-3xl space-y-4 px-3 py-5 md:px-6">
            {form.fields.length === 0 ? (
              <div className="rounded-xl border border-dashed bg-muted/30 py-16 text-center">
                <Wand2 className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <p className="text-base font-medium text-foreground">Commencez comme sur Tally</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ajoutez votre première question depuis le panneau de gauche.
                </p>
              </div>
            ) : (
              form.fields.map((field, index) => (
                <div key={field.id} className="space-y-4">
                  {index === 0 && (
                    <div className="flex justify-center">
                      <Select onValueChange={(value: FieldType) => addField(value, 0)}>
                        <SelectTrigger className="h-8 w-[220px] border-dashed text-xs">
                          <SelectValue placeholder="+ Ajouter une question au début" />
                        </SelectTrigger>
                        <SelectContent>
                          {FIELD_TYPES.map((item) => (
                            <SelectItem key={item.type} value={item.type}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <article
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    onClick={() => setSelectedFieldId(field.id)}
                    className={cn(
                      'group relative cursor-pointer rounded-xl border p-4 transition-all md:p-5',
                      selectedFieldId === field.id
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border bg-background hover:border-primary/30',
                      draggedIndex === index && 'opacity-60'
                    )}
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">
                            Q{index + 1}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {FIELD_TYPES.find((item) => item.type === field.type)?.label}
                          </span>
                        </div>
                        <h4 className="text-base font-semibold text-foreground">
                          {field.label}
                          {field.required && <span className="ml-1 text-destructive">*</span>}
                        </h4>
                        {field.description && field.type !== 'paragraph' && (
                          <p className="text-sm text-muted-foreground">{field.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:bg-accent"
                        >
                          <GripVertical className="h-4 w-4" />
                        </button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateField(field.id);
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeField(field.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {renderFieldPreview(field)}
                  </article>

                  <div className="flex justify-center">
                    <Select onValueChange={(value: FieldType) => addField(value, index + 1)}>
                      <SelectTrigger className="h-8 w-[220px] border-dashed text-xs">
                        <SelectValue placeholder="+ Ajouter une question ici" />
                      </SelectTrigger>
                      <SelectContent>
                        {FIELD_TYPES.map((item) => (
                          <SelectItem key={item.type} value={item.type}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </main>

      <aside className="min-h-0 w-full shrink-0 overflow-hidden rounded-xl border bg-card lg:w-[360px]">
        <Tabs defaultValue="field" className="flex h-full min-h-0 flex-col">
          <TabsList className="h-auto w-full justify-start gap-0 rounded-none border-b bg-transparent p-0">
            <TabsTrigger value="field" className="rounded-none border-b-2 border-transparent px-3 data-[state=active]:border-primary">
              Champ
            </TabsTrigger>
            <TabsTrigger value="logic" className="rounded-none border-b-2 border-transparent px-3 data-[state=active]:border-primary">
              <GitBranch className="mr-1 h-3.5 w-3.5" />
              Logique
            </TabsTrigger>
            <TabsTrigger value="theme" className="rounded-none border-b-2 border-transparent px-3 data-[state=active]:border-primary">
              <Palette className="mr-1 h-3.5 w-3.5" />
              Thème
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-none border-b-2 border-transparent px-3 data-[state=active]:border-primary">
              <Settings2 className="mr-1 h-3.5 w-3.5" />
              Params
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            <TabsContent value="field" className="mt-0 space-y-4 p-4">
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
                          onChange={(e) =>
                            updateField(selectedField.id, { placeholder: e.target.value })
                          }
                        />
                      </div>

                      <div>
                        <Label>Description (aide)</Label>
                        <Textarea
                          value={selectedField.description || ''}
                          onChange={(e) =>
                            updateField(selectedField.id, { description: e.target.value })
                          }
                          rows={2}
                        />
                      </div>

                      <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
                        <Label>Obligatoire</Label>
                        <Switch
                          checked={selectedField.required}
                          onCheckedChange={(checked) =>
                            updateField(selectedField.id, { required: checked })
                          }
                        />
                      </div>

                      <div>
                        <Label>Largeur</Label>
                        <Select
                          value={selectedField.width || 'full'}
                          onValueChange={(value: 'full' | 'half') =>
                            updateField(selectedField.id, { width: value })
                          }
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
                        onChange={(e) =>
                          updateField(selectedField.id, { description: e.target.value })
                        }
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
                          onChange={(e) =>
                            updateField(selectedField.id, { min: Number(e.target.value) })
                          }
                        />
                      </div>
                      <div>
                        <Label>Max</Label>
                        <Input
                          type="number"
                          value={selectedField.max || ''}
                          onChange={(e) =>
                            updateField(selectedField.id, { max: Number(e.target.value) })
                          }
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
                        onChange={(e) =>
                          updateField(selectedField.id, { maxLength: Number(e.target.value) })
                        }
                      />
                    </div>
                  )}

                  {FIELD_WITH_OPTIONS.includes(selectedField.type) && (
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <Label>Options</Label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addOption(selectedField.id)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {selectedField.options?.map((option, i) => (
                          <div key={i} className="flex gap-1">
                            <Input
                              value={option}
                              onChange={(e) =>
                                updateOption(selectedField.id, i, e.target.value)
                              }
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
                <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
                  <p className="text-sm">Sélectionnez une question pour l’éditer</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="logic" className="mt-0 space-y-4 p-4">
              {selectedField && !['heading', 'paragraph'].includes(selectedField.type) ? (
                <ConditionalLogicEditor
                  field={selectedField}
                  allFields={form.fields}
                  onChange={(rules, action) => {
                    updateField(selectedField.id, {
                      conditionalRules: rules,
                      conditionalAction: action,
                    });
                  }}
                />
              ) : (
                <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
                  <p className="text-sm">
                    {selectedField
                      ? 'Les titres/paragraphe ne supportent pas la logique conditionnelle'
                      : 'Sélectionnez un champ pour configurer sa logique'}
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="theme" className="mt-0 p-4">
              <FormThemeEditor
                theme={form.settings.formTheme || {}}
                onChange={(formTheme) =>
                  setForm((prev) => ({
                    ...prev,
                    settings: { ...prev.settings, formTheme },
                  }))
                }
              />
            </TabsContent>

            <TabsContent value="settings" className="mt-0 space-y-4 p-4">
              <div>
                <Label>Texte du bouton</Label>
                <Input
                  value={form.settings.submitButtonText}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      settings: { ...prev.settings, submitButtonText: e.target.value },
                    }))
                  }
                />
              </div>

              <div>
                <Label>Message de succès</Label>
                <Textarea
                  value={form.settings.successMessage}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      settings: { ...prev.settings, successMessage: e.target.value },
                    }))
                  }
                  rows={2}
                />
              </div>

              <div className="space-y-3 border-t pt-2">
                <div className="text-sm font-semibold">Page de remerciement</div>

                <div>
                  <Label className="text-xs">Titre</Label>
                  <Input
                    value={form.settings.thankYouPage?.title || ''}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          thankYouPage: {
                            ...prev.settings.thankYouPage,
                            title: e.target.value,
                          },
                        },
                      }))
                    }
                    placeholder="Merci !"
                  />
                </div>

                <div>
                  <Label className="text-xs">Image (URL)</Label>
                  <Input
                    value={form.settings.thankYouPage?.imageUrl || ''}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          thankYouPage: {
                            ...prev.settings.thankYouPage,
                            imageUrl: e.target.value,
                          },
                        },
                      }))
                    }
                    placeholder="https://..."
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-xs">Confetti 🎉</Label>
                  <Switch
                    checked={form.settings.thankYouPage?.showConfetti || false}
                    onCheckedChange={(checked) =>
                      setForm((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          thankYouPage: {
                            ...prev.settings.thankYouPage,
                            showConfetti: checked,
                          },
                        },
                      }))
                    }
                  />
                </div>

                <div>
                  <Label className="text-xs">Texte du CTA</Label>
                  <Input
                    value={form.settings.thankYouPage?.ctaText || ''}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          thankYouPage: {
                            ...prev.settings.thankYouPage,
                            ctaText: e.target.value,
                          },
                        },
                      }))
                    }
                    placeholder="Retour au site"
                  />
                </div>

                <div>
                  <Label className="text-xs">Lien du CTA</Label>
                  <Input
                    value={form.settings.thankYouPage?.ctaUrl || ''}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          thankYouPage: {
                            ...prev.settings.thankYouPage,
                            ctaUrl: e.target.value,
                          },
                        },
                      }))
                    }
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <Label className="text-xs">Délai redirection (sec, 0 = pas de redirection auto)</Label>
                  <Input
                    type="number"
                    value={form.settings.thankYouPage?.redirectDelay ?? ''}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          thankYouPage: {
                            ...prev.settings.thankYouPage,
                            redirectDelay: Number(e.target.value),
                          },
                        },
                      }))
                    }
                    placeholder="3"
                    min={0}
                  />
                </div>
              </div>

              <div className="space-y-3 border-t pt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Ajouter aux contacts</Label>
                  <Switch
                    checked={form.settings.addToContacts}
                    onCheckedChange={(checked) =>
                      setForm((prev) => ({
                        ...prev,
                        settings: { ...prev.settings, addToContacts: checked },
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm">Notification email</Label>
                  <Switch
                    checked={form.settings.sendNotification}
                    onCheckedChange={(checked) =>
                      setForm((prev) => ({
                        ...prev,
                        settings: { ...prev.settings, sendNotification: checked },
                      }))
                    }
                  />
                </div>

                {form.settings.sendNotification && (
                  <div>
                    <Label>Email de notification</Label>
                    <Input
                      type="email"
                      value={form.settings.notificationEmail}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          settings: { ...prev.settings, notificationEmail: e.target.value },
                        }))
                      }
                      placeholder="admin@example.com"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Label className="text-sm">Email de confirmation</Label>
                  <Switch
                    checked={form.settings.confirmationEmail || false}
                    onCheckedChange={(checked) =>
                      setForm((prev) => ({
                        ...prev,
                        settings: { ...prev.settings, confirmationEmail: checked },
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm">Barre de progression</Label>
                  <Switch
                    checked={form.settings.showProgressBar || false}
                    onCheckedChange={(checked) =>
                      setForm((prev) => ({
                        ...prev,
                        settings: { ...prev.settings, showProgressBar: checked },
                      }))
                    }
                  />
                </div>
              </div>

              <div className="border-t pt-2">
                <Label>Mode d'affichage</Label>
                <Select
                  value={form.settings.displayMode || 'classic'}
                  onValueChange={(value: 'classic' | 'stepped') =>
                    setForm((prev) => ({
                      ...prev,
                      settings: { ...prev.settings, displayMode: value },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="classic">Classique (tous les champs)</SelectItem>
                    <SelectItem value="stepped">Question par question (Tally)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="mt-1 text-xs text-muted-foreground">
                  Le mode question par question affiche une seule question à la fois.
                </p>
              </div>

              <div className="border-t pt-2">
                <Label>Thème</Label>
                <Select
                  value={form.settings.theme || 'default'}
                  onValueChange={(value: 'default' | 'minimal' | 'modern') =>
                    setForm((prev) => ({
                      ...prev,
                      settings: { ...prev.settings, theme: value },
                    }))
                  }
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
      </aside>
    </div>
  );
};
