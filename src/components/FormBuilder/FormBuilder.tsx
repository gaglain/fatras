import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus, Eye, GripVertical, Copy, Sparkles, Wand2 } from 'lucide-react';
import { FormField, FormData, FieldType } from './types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { FIELD_TYPES, FIELD_WITH_OPTIONS } from './constants';
import { FieldPalette } from './FieldPalette';
import { FieldSettingsPanel } from './FieldSettingsPanel';
import { LiveFieldPreview } from './LiveFieldPreview';

interface FormBuilderProps {
  initialForm?: FormData;
  onSave: (form: FormData) => void;
  onPreview?: (form: FormData) => void;
}

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

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;
      const tag = (e.target as HTMLElement)?.tagName;
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable;

      if (isMeta && e.key === 's') { e.preventDefault(); onSave(form); return; }
      if (isMeta && e.key === 'd' && selectedFieldId) { e.preventDefault(); duplicateField(selectedFieldId); return; }
      if (e.key === '/' && !isInput) { e.preventDefault(); searchInputRef.current?.focus(); return; }
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isInput && selectedFieldId) { e.preventDefault(); removeField(selectedFieldId); return; }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [form, selectedFieldId, onSave]);

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
    setForm((prev) => ({ ...prev, fields: prev.fields.map((f) => f.id === fieldId ? { ...f, ...updates } : f) }));
  }, []);

  const removeField = useCallback((fieldId: string) => {
    setForm((prev) => ({ ...prev, fields: prev.fields.filter((f) => f.id !== fieldId) }));
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
    updateField(fieldId, { options: [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`] });
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

  // Drag & Drop
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    (e.currentTarget as HTMLElement).style.opacity = '0.5';
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

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 lg:flex-row">
      {/* Left: Field palette */}
      <FieldPalette
        fieldSearch={fieldSearch}
        onFieldSearchChange={setFieldSearch}
        onAddField={addField}
        searchInputRef={searchInputRef as React.RefObject<HTMLInputElement>}
      />

      {/* Center: Canvas */}
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
                <Eye className="mr-1.5 h-4 w-4" />Aperçu
              </Button>
              <Button size="sm" onClick={() => onSave(form)}>
                <Sparkles className="mr-1.5 h-4 w-4" />Sauvegarder
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
                  {icon}<span className="ml-1">{label}</span>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Canvas area */}
        <ScrollArea className="flex-1">
          <div className="mx-auto w-full max-w-2xl space-y-1 px-4 py-6 md:px-8">
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
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDropTargetIndex(index); }}
                    onDrop={(e) => handleDrop(e, index)}
                    className={cn(
                      'mx-auto h-1 rounded-full transition-all duration-200',
                      dropTargetIndex === index && draggedIndex !== null && draggedIndex !== index ? 'bg-primary h-1.5 my-1' : 'bg-transparent my-0'
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
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-bold text-muted-foreground">{index + 1}</span>
                          <span className="text-[11px] text-muted-foreground uppercase tracking-wider">
                            {FIELD_TYPES.find((item) => item.type === field.type)?.label}
                          </span>
                          {field.required && (
                            <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">Requis</span>
                          )}
                        </div>
                        {editingLabelId === field.id ? (
                          <Input
                            autoFocus
                            value={field.label}
                            onChange={(e) => updateField(field.id, { label: e.target.value })}
                            onBlur={() => setEditingLabelId(null)}
                            onKeyDown={(e) => { if (e.key === 'Enter') setEditingLabelId(null); }}
                            className="h-8 border-0 border-b border-primary bg-transparent px-0 text-base font-semibold shadow-none focus-visible:ring-0"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <h4
                            className="cursor-text text-base font-semibold text-foreground hover:text-primary transition-colors"
                            onDoubleClick={(e) => { e.stopPropagation(); setEditingLabelId(field.id); }}
                            title="Double-cliquez pour modifier"
                          >
                            {field.label}
                          </h4>
                        )}
                        {field.description && field.type !== 'paragraph' && (
                          <p className="text-xs text-muted-foreground">{field.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button type="button" className="cursor-grab active:cursor-grabbing inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-accent transition-colors">
                          <GripVertical className="h-3.5 w-3.5" />
                        </button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Dupliquer (⌘D)" onClick={(e) => { e.stopPropagation(); duplicateField(field.id); }}>
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" title="Supprimer (⌫)" onClick={(e) => { e.stopPropagation(); removeField(field.id); }}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="ml-0">
                      <LiveFieldPreview field={field} />
                    </div>
                  </article>
                </React.Fragment>
              ))
            )}

            {form.fields.length > 0 && (
              <>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDropTargetIndex(form.fields.length); }}
                  onDrop={(e) => handleDrop(e, form.fields.length)}
                  className={cn(
                    'mx-auto h-1 rounded-full transition-all duration-200',
                    dropTargetIndex === form.fields.length && draggedIndex !== null ? 'bg-primary h-1.5 my-1' : 'bg-transparent my-0'
                  )}
                />
                <div className="flex justify-center pt-2">
                  <Select onValueChange={(value: FieldType) => addField(value)}>
                    <SelectTrigger className="h-9 w-[240px] border-dashed text-xs">
                      <Plus className="mr-1.5 h-3.5 w-3.5" />
                      <SelectValue placeholder="Ajouter une question" />
                    </SelectTrigger>
                    <SelectContent>
                      {FIELD_TYPES.map((item) => (
                        <SelectItem key={item.type} value={item.type}>{item.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <div className="border-t bg-muted/30 px-4 py-1.5 text-[11px] text-muted-foreground flex items-center gap-4">
          <span><kbd className="rounded border bg-background px-1 font-mono">⌘S</kbd> Sauvegarder</span>
          <span><kbd className="rounded border bg-background px-1 font-mono">⌘D</kbd> Dupliquer</span>
          <span><kbd className="rounded border bg-background px-1 font-mono">/</kbd> Rechercher</span>
          <span><kbd className="rounded border bg-background px-1 font-mono">⌫</kbd> Supprimer</span>
        </div>
      </main>

      {/* Right: Settings panel */}
      <FieldSettingsPanel
        form={form}
        setForm={setForm}
        selectedField={selectedField}
        updateField={updateField}
        addOption={addOption}
        updateOption={updateOption}
        removeOption={removeOption}
      />
    </div>
  );
};
