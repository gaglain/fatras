import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
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
  Command,
} from 'lucide-react';
import { FormField, FormData, FieldType } from './types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FormThemeEditor } from './FormThemeEditor';
import { ConditionalLogicEditor } from './ConditionalLogicEditor';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
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
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const [fieldSearch, setFieldSearch] = useState('');
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selectedFieldId && form.fields.length > 0) {
      setSelectedFieldId(form.fields[0].id);
    }
  }, [selectedFieldId, form.fields]);

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;

      // Don't intercept when typing in inputs
      const tag = (e.target as HTMLElement)?.tagName;
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable;

      if (isMeta && e.key === 's') {
        e.preventDefault();
        onSave(form);
        return;
      }

      if (isMeta && e.key === 'd' && selectedFieldId) {
        e.preventDefault();
        duplicateField(selectedFieldId);
        return;
      }

      if (e.key === '/' && !isInput) {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && !isInput && selectedFieldId) {
        e.preventDefault();
        removeField(selectedFieldId);
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [form, selectedFieldId, onSave]);

  const filteredFieldTypes = useMemo(
    () =>
      FIELD_TYPES.filter((item) =>
        item.label.toLowerCase().includes(fieldSearch.toLowerCase())
      ),
    [fieldSearch]
  );

  const addField = useCallback((type: FieldType, insertAt?: number) => {
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
  }, []);

  const updateField = useCallback((fieldId: string, updates: Partial<FormField>) => {
    setForm((prev) => ({
      ...prev,
      fields: prev.fields.map((field) =>
        field.id === fieldId ? { ...field, ...updates } : field
      ),
    }));
  }, []);

  const removeField = useCallback((fieldId: string) => {
    setForm((prev) => ({
      ...prev,
      fields: prev.fields.filter((field) => field.id !== fieldId),
    }));
    setSelectedFieldId((prev) => (prev === fieldId ? null : prev));
  }, []);

  const duplicateField = useCallback((fieldId: string) => {
    setForm((prev) => {
      const field = prev.fields.find((f) => f.id === fieldId);
      if (!field) return prev;

      const newField = { ...field, id: `field_${Date.now()}`, label: `${field.label} (copie)` };
      const index = prev.fields.findIndex((f) => f.id === fieldId);
      const fields = [...prev.fields.slice(0, index + 1), newField, ...prev.fields.slice(index + 1)];
      setSelectedFieldId(newField.id);
      return { ...prev, fields };
    });
  }, []);

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
    updateField(fieldId, { options: field.options.filter((_, i) => i !== optionIndex) });
  };

  // ── Drag & Drop with visual drop zones ──
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Ghost preview
    const el = e.currentTarget as HTMLElement;
    el.style.opacity = '0.5';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTargetIndex(index);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    setForm((prev) => {
      const newFields = [...prev.fields];
      const [moved] = newFields.splice(draggedIndex, 1);
      newFields.splice(index, 0, moved);
      return { ...prev, fields: newFields };
    });
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).style.opacity = '1';
    setDraggedIndex(null);
    setDropTargetIndex(null);
  };

  const selectedField = form.fields.find((f) => f.id === selectedFieldId);

  // ── Live field rendering (real inputs) ──
  const renderLiveField = (field: FormField) => {
    const inputClass = 'w-full pointer-events-none';

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
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <span key={i} className="text-2xl text-muted-foreground/40 select-none">★</span>
          ))}
        </div>
      );
    }

    if (field.type === 'select') {
      return (
        <Select disabled>
          <SelectTrigger className={inputClass}>
            <SelectValue placeholder={field.placeholder || 'Sélectionnez...'} />
          </SelectTrigger>
        </Select>
      );
    }

    if (field.type === 'radio' && field.options?.length) {
      return (
        <div className="space-y-2 pointer-events-none">
          {field.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full border border-border" />
              <span className="text-sm">{opt}</span>
            </div>
          ))}
        </div>
      );
    }

    if (field.type === 'checkbox' && field.options?.length) {
      return (
        <div className="space-y-2 pointer-events-none">
          {field.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-sm border border-border" />
              <span className="text-sm">{opt}</span>
            </div>
          ))}
        </div>
      );
    }

    if (field.type === 'textarea') {
      return (
        <Textarea
          placeholder={field.placeholder || 'Votre réponse...'}
          rows={3}
          disabled
          className={inputClass}
        />
      );
    }

    if (field.type === 'file') {
      return (
        <div className="rounded-lg border-2 border-dashed border-border bg-muted/20 p-6 text-center pointer-events-none">
          <Upload className="mx-auto h-6 w-6 text-muted-foreground mb-1" />
          <p className="text-xs text-muted-foreground">Cliquez ou glissez un fichier</p>
        </div>
      );
    }

    return (
      <Input
        type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : field.type === 'time' ? 'time' : 'text'}
        placeholder={field.placeholder || 'Votre réponse...'}
        disabled
        className={inputClass}
      />
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 lg:flex-row">
      {/* ── Left: Field palette ── */}
      <aside className="hidden w-64 shrink-0 rounded-xl border bg-card lg:flex lg:flex-col">
        <div className="border-b p-3">
          <h3 className="text-sm font-semibold text-foreground">Questions</h3>
          <div className="relative mt-2">
            <Input
              ref={searchInputRef}
              value={fieldSearch}
              onChange={(e) => setFieldSearch(e.target.value)}
              placeholder="Rechercher... ( / )"
              className="h-8 pr-8 text-xs"
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="grid grid-cols-2 gap-1.5 p-2">
            {filteredFieldTypes.map(({ type, label, icon }) => (
              <button
                key={type}
                onClick={() => addField(type)}
                className="group flex flex-col items-center gap-1 rounded-lg border border-border bg-background p-2.5 text-center transition-all hover:border-primary/50 hover:bg-accent"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded bg-muted text-foreground">
                  {icon}
                </div>
                <p className="text-[11px] font-medium leading-tight text-foreground">{label}</p>
              </button>
            ))}
          </div>
        </ScrollArea>
      </aside>

      {/* ── Center: Canvas ── */}
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card">
        {/* Header */}
        <div className="border-b bg-card px-4 py-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <Input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Nom du formulaire"
              className="h-9 max-w-md border-0 bg-transparent px-0 text-lg font-semibold shadow-none focus-visible:ring-0"
            />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onPreview?.(form)}>
                <Eye className="mr-1.5 h-4 w-4" />
                Aperçu
              </Button>
              <Button size="sm" onClick={() => onSave(form)}>
                <Sparkles className="mr-1.5 h-4 w-4" />
                Sauvegarder
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile field buttons */}
        <div className="border-b p-2 lg:hidden">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-1.5 pb-1">
              {FIELD_TYPES.map(({ type, label, icon }) => (
                <Button key={type} variant="outline" size="sm" className="shrink-0 h-8 text-xs" onClick={() => addField(type)}>
                  {icon}
                  <span className="ml-1">{label}</span>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Canvas area */}
        <ScrollArea className="flex-1">
          <div className="mx-auto w-full max-w-2xl space-y-1 px-4 py-6 md:px-8">
            {/* Description */}
            {form.fields.length === 0 && (
              <Textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Description du formulaire (optionnel)"
                rows={2}
                className="mb-6 resize-none border-dashed"
              />
            )}

            {form.fields.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/20 py-20 text-center">
                <Wand2 className="mx-auto mb-4 h-10 w-10 text-muted-foreground/50" />
                <p className="text-base font-medium text-foreground">Créez votre formulaire</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Cliquez sur un type de question à gauche, ou utilisez <kbd className="mx-1 rounded border bg-muted px-1.5 py-0.5 text-xs font-mono">/</kbd> pour chercher
                </p>
              </div>
            ) : (
              form.fields.map((field, index) => (
                <React.Fragment key={field.id}>
                  {/* Drop zone indicator */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDropTargetIndex(index); }}
                    onDrop={(e) => handleDrop(e, index)}
                    className={cn(
                      'mx-auto h-1 rounded-full transition-all duration-200',
                      dropTargetIndex === index && draggedIndex !== null && draggedIndex !== index
                        ? 'bg-primary h-1.5 my-1'
                        : 'bg-transparent my-0'
                    )}
                  />

                  <article
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    onClick={() => setSelectedFieldId(field.id)}
                    className={cn(
                      'group relative cursor-pointer rounded-xl border p-5 transition-all duration-200',
                      selectedFieldId === field.id
                        ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20'
                        : 'border-border bg-background hover:border-primary/30 hover:shadow-sm',
                      draggedIndex === index && 'opacity-40 scale-[0.98]'
                    )}
                  >
                    {/* Field header */}
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-bold text-muted-foreground">
                            {index + 1}
                          </span>
                          <span className="text-[11px] text-muted-foreground uppercase tracking-wider">
                            {FIELD_TYPES.find((item) => item.type === field.type)?.label}
                          </span>
                          {field.required && (
                            <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">
                              Requis
                            </span>
                          )}
                        </div>

                        {/* Inline-editable label */}
                        {editingLabelId === field.id ? (
                          <Input
                            autoFocus
                            value={field.label}
                            onChange={(e) => updateField(field.id, { label: e.target.value })}
                            onBlur={() => setEditingLabelId(null)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') setEditingLabelId(null);
                            }}
                            className="h-8 border-0 border-b border-primary bg-transparent px-0 text-base font-semibold shadow-none focus-visible:ring-0"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <h4
                            className="cursor-text text-base font-semibold text-foreground hover:text-primary transition-colors"
                            onDoubleClick={(e) => {
                              e.stopPropagation();
                              setEditingLabelId(field.id);
                            }}
                            title="Double-cliquez pour modifier"
                          >
                            {field.label}
                          </h4>
                        )}

                        {field.description && field.type !== 'paragraph' && (
                          <p className="text-xs text-muted-foreground">{field.description}</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          className="cursor-grab active:cursor-grabbing inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-accent transition-colors"
                        >
                          <GripVertical className="h-3.5 w-3.5" />
                        </button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          title="Dupliquer (⌘D)"
                          onClick={(e) => { e.stopPropagation(); duplicateField(field.id); }}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          title="Supprimer (⌫)"
                          onClick={(e) => { e.stopPropagation(); removeField(field.id); }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Live field preview */}
                    <div className="ml-0">
                      {renderLiveField(field)}
                    </div>
                  </article>
                </React.Fragment>
              ))
            )}

            {/* Final drop zone */}
            {form.fields.length > 0 && (
              <div
                onDragOver={(e) => { e.preventDefault(); setDropTargetIndex(form.fields.length); }}
                onDrop={(e) => handleDrop(e, form.fields.length)}
                className={cn(
                  'mx-auto h-1 rounded-full transition-all duration-200',
                  dropTargetIndex === form.fields.length && draggedIndex !== null
                    ? 'bg-primary h-1.5 my-1'
                    : 'bg-transparent my-0'
                )}
              />
            )}

            {/* Add field button at the bottom */}
            {form.fields.length > 0 && (
              <div className="flex justify-center pt-2">
                <Select onValueChange={(value: FieldType) => addField(value)}>
                  <SelectTrigger className="h-9 w-[240px] border-dashed text-xs">
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    <SelectValue placeholder="Ajouter une question" />
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
          </div>
        </ScrollArea>

        {/* Keyboard shortcuts hint */}
        <div className="border-t bg-muted/30 px-4 py-1.5 text-[11px] text-muted-foreground flex items-center gap-4">
          <span><kbd className="rounded border bg-background px-1 font-mono">⌘S</kbd> Sauvegarder</span>
          <span><kbd className="rounded border bg-background px-1 font-mono">⌘D</kbd> Dupliquer</span>
          <span><kbd className="rounded border bg-background px-1 font-mono">/</kbd> Rechercher</span>
          <span><kbd className="rounded border bg-background px-1 font-mono">⌫</kbd> Supprimer</span>
        </div>
      </main>

      {/* ── Right: Settings panel ── */}
      <aside className="min-h-0 w-full shrink-0 overflow-hidden rounded-xl border bg-card lg:w-[340px]">
        <Tabs defaultValue="field" className="flex h-full min-h-0 flex-col">
          <TabsList className="h-auto w-full justify-start gap-0 rounded-none border-b bg-transparent p-0">
            <TabsTrigger value="field" className="rounded-none border-b-2 border-transparent px-3 py-2.5 text-xs data-[state=active]:border-primary">
              Champ
            </TabsTrigger>
            <TabsTrigger value="logic" className="rounded-none border-b-2 border-transparent px-3 py-2.5 text-xs data-[state=active]:border-primary">
              <GitBranch className="mr-1 h-3 w-3" />
              Logique
            </TabsTrigger>
            <TabsTrigger value="theme" className="rounded-none border-b-2 border-transparent px-3 py-2.5 text-xs data-[state=active]:border-primary">
              <Palette className="mr-1 h-3 w-3" />
              Thème
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-none border-b-2 border-transparent px-3 py-2.5 text-xs data-[state=active]:border-primary">
              <Settings2 className="mr-1 h-3 w-3" />
              Params
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            <TabsContent value="field" className="mt-0 space-y-4 p-4">
              {selectedField ? (
                <>
                  <div>
                    <Label className="text-xs">Label</Label>
                    <Input
                      value={selectedField.label}
                      onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                    />
                  </div>

                  {!['heading', 'paragraph'].includes(selectedField.type) && (
                    <>
                      <div>
                        <Label className="text-xs">Placeholder</Label>
                        <Input
                          value={selectedField.placeholder || ''}
                          onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Description (aide)</Label>
                        <Textarea
                          value={selectedField.description || ''}
                          onChange={(e) => updateField(selectedField.id, { description: e.target.value })}
                          rows={2}
                        />
                      </div>

                      <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
                        <Label className="text-xs">Obligatoire</Label>
                        <Switch
                          checked={selectedField.required}
                          onCheckedChange={(checked) => updateField(selectedField.id, { required: checked })}
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Largeur</Label>
                        <Select
                          value={selectedField.width || 'full'}
                          onValueChange={(value: 'full' | 'half') => updateField(selectedField.id, { width: value })}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
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
                      <Label className="text-xs">Contenu</Label>
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
                        <Label className="text-xs">Min</Label>
                        <Input type="number" value={selectedField.min || ''} onChange={(e) => updateField(selectedField.id, { min: Number(e.target.value) })} />
                      </div>
                      <div>
                        <Label className="text-xs">Max</Label>
                        <Input type="number" value={selectedField.max || ''} onChange={(e) => updateField(selectedField.id, { max: Number(e.target.value) })} />
                      </div>
                    </div>
                  )}

                  {['text', 'textarea'].includes(selectedField.type) && (
                    <div>
                      <Label className="text-xs">Longueur max</Label>
                      <Input type="number" value={selectedField.maxLength || ''} onChange={(e) => updateField(selectedField.id, { maxLength: Number(e.target.value) })} />
                    </div>
                  )}

                  {FIELD_WITH_OPTIONS.includes(selectedField.type) && (
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <Label className="text-xs">Options</Label>
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => addOption(selectedField.id)}>
                          <Plus className="h-3 w-3 mr-1" /> Ajouter
                        </Button>
                      </div>
                      <div className="space-y-1.5">
                        {selectedField.options?.map((option, i) => (
                          <div key={i} className="flex gap-1">
                            <Input value={option} onChange={(e) => updateOption(selectedField.id, i, e.target.value)} className="h-8 text-xs" />
                            <Button size="icon" variant="ghost" className="shrink-0 h-8 w-8" onClick={() => removeOption(selectedField.id, i)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                  <p className="text-sm">Sélectionnez une question pour l'éditer</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="logic" className="mt-0 space-y-4 p-4">
              {selectedField && !['heading', 'paragraph'].includes(selectedField.type) ? (
                <ConditionalLogicEditor
                  field={selectedField}
                  allFields={form.fields}
                  onChange={(rules, action) => {
                    updateField(selectedField.id, { conditionalRules: rules, conditionalAction: action });
                  }}
                />
              ) : (
                <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                  <p className="text-sm">
                    {selectedField
                      ? 'Les titres/paragraphes ne supportent pas la logique conditionnelle'
                      : 'Sélectionnez un champ pour configurer sa logique'}
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="theme" className="mt-0 p-4">
              <FormThemeEditor
                theme={form.settings.formTheme || {}}
                onChange={(formTheme) => setForm((prev) => ({ ...prev, settings: { ...prev.settings, formTheme } }))}
              />
            </TabsContent>

            <TabsContent value="settings" className="mt-0 space-y-4 p-4">
              <div>
                <Label className="text-xs">Texte du bouton</Label>
                <Input
                  value={form.settings.submitButtonText}
                  onChange={(e) => setForm((prev) => ({ ...prev, settings: { ...prev.settings, submitButtonText: e.target.value } }))}
                />
              </div>

              <div>
                <Label className="text-xs">Message de succès</Label>
                <Textarea
                  value={form.settings.successMessage}
                  onChange={(e) => setForm((prev) => ({ ...prev, settings: { ...prev.settings, successMessage: e.target.value } }))}
                  rows={2}
                />
              </div>

              <div className="space-y-3 border-t pt-3">
                <div className="text-xs font-semibold">Page de remerciement</div>
                <div>
                  <Label className="text-xs">Titre</Label>
                  <Input
                    value={form.settings.thankYouPage?.title || ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, settings: { ...prev.settings, thankYouPage: { ...prev.settings.thankYouPage, title: e.target.value } } }))}
                    placeholder="Merci !"
                  />
                </div>
                <div>
                  <Label className="text-xs">Image (URL)</Label>
                  <Input
                    value={form.settings.thankYouPage?.imageUrl || ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, settings: { ...prev.settings, thankYouPage: { ...prev.settings.thankYouPage, imageUrl: e.target.value } } }))}
                    placeholder="https://..."
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Confetti 🎉</Label>
                  <Switch
                    checked={form.settings.thankYouPage?.showConfetti || false}
                    onCheckedChange={(checked) => setForm((prev) => ({ ...prev, settings: { ...prev.settings, thankYouPage: { ...prev.settings.thankYouPage, showConfetti: checked } } }))}
                  />
                </div>
                <div>
                  <Label className="text-xs">Texte du CTA</Label>
                  <Input
                    value={form.settings.thankYouPage?.ctaText || ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, settings: { ...prev.settings, thankYouPage: { ...prev.settings.thankYouPage, ctaText: e.target.value } } }))}
                    placeholder="Retour au site"
                  />
                </div>
                <div>
                  <Label className="text-xs">Lien du CTA</Label>
                  <Input
                    value={form.settings.thankYouPage?.ctaUrl || ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, settings: { ...prev.settings, thankYouPage: { ...prev.settings.thankYouPage, ctaUrl: e.target.value } } }))}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label className="text-xs">Délai redirection (sec)</Label>
                  <Input
                    type="number"
                    value={form.settings.thankYouPage?.redirectDelay ?? ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, settings: { ...prev.settings, thankYouPage: { ...prev.settings.thankYouPage, redirectDelay: Number(e.target.value) } } }))}
                    placeholder="3"
                    min={0}
                  />
                </div>
              </div>

              <div className="space-y-3 border-t pt-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Ajouter aux contacts</Label>
                  <Switch checked={form.settings.addToContacts} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, settings: { ...prev.settings, addToContacts: checked } }))} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Notification email</Label>
                  <Switch checked={form.settings.sendNotification} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, settings: { ...prev.settings, sendNotification: checked } }))} />
                </div>
                {form.settings.sendNotification && (
                  <div>
                    <Label className="text-xs">Email de notification</Label>
                    <Input type="email" value={form.settings.notificationEmail} onChange={(e) => setForm((prev) => ({ ...prev, settings: { ...prev.settings, notificationEmail: e.target.value } }))} placeholder="admin@example.com" />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Email de confirmation</Label>
                  <Switch checked={form.settings.confirmationEmail || false} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, settings: { ...prev.settings, confirmationEmail: checked } }))} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Barre de progression</Label>
                  <Switch checked={form.settings.showProgressBar || false} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, settings: { ...prev.settings, showProgressBar: checked } }))} />
                </div>
              </div>

              <div className="border-t pt-3">
                <Label className="text-xs">Mode d'affichage</Label>
                <Select
                  value={form.settings.displayMode || 'classic'}
                  onValueChange={(value: 'classic' | 'stepped') => setForm((prev) => ({ ...prev, settings: { ...prev.settings, displayMode: value } }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="classic">Classique (tous les champs)</SelectItem>
                    <SelectItem value="stepped">Question par question (Tally)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t pt-3">
                <Label className="text-xs">Thème</Label>
                <Select
                  value={form.settings.theme || 'default'}
                  onValueChange={(value: 'default' | 'minimal' | 'modern') => setForm((prev) => ({ ...prev, settings: { ...prev.settings, theme: value } }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
