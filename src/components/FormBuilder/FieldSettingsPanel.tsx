import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, GitBranch, Palette, Settings2 } from 'lucide-react';
import { FormField, FormData } from './types';
import { FormThemeEditor } from './FormThemeEditor';
import { ConditionalLogicEditor } from './ConditionalLogicEditor';
import { FIELD_WITH_OPTIONS } from './constants';

interface FieldSettingsPanelProps {
  form: FormData;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
  selectedField: FormField | undefined;
  updateField: (fieldId: string, updates: Partial<FormField>) => void;
  addOption: (fieldId: string) => void;
  updateOption: (fieldId: string, optionIndex: number, value: string) => void;
  removeOption: (fieldId: string, optionIndex: number) => void;
}

export const FieldSettingsPanel: React.FC<FieldSettingsPanelProps> = ({
  form, setForm, selectedField, updateField, addOption, updateOption, removeOption,
}) => {
  return (
    <aside className="min-h-0 w-full shrink-0 overflow-hidden rounded-xl border bg-card lg:w-[340px]">
      <Tabs defaultValue="field" className="flex h-full min-h-0 flex-col">
        <TabsList className="h-auto w-full justify-start gap-0 rounded-none border-b bg-transparent p-0">
          <TabsTrigger value="field" className="rounded-none border-b-2 border-transparent px-3 py-2.5 text-xs data-[state=active]:border-primary">Champ</TabsTrigger>
          <TabsTrigger value="logic" className="rounded-none border-b-2 border-transparent px-3 py-2.5 text-xs data-[state=active]:border-primary">
            <GitBranch className="mr-1 h-3 w-3" />Logique
          </TabsTrigger>
          <TabsTrigger value="theme" className="rounded-none border-b-2 border-transparent px-3 py-2.5 text-xs data-[state=active]:border-primary">
            <Palette className="mr-1 h-3 w-3" />Thème
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-none border-b-2 border-transparent px-3 py-2.5 text-xs data-[state=active]:border-primary">
            <Settings2 className="mr-1 h-3 w-3" />Params
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          {/* Field tab */}
          <TabsContent value="field" className="mt-0 space-y-4 p-4">
            {selectedField ? (
              <>
                <div>
                  <Label className="text-xs">Label</Label>
                  <Input value={selectedField.label} onChange={(e) => updateField(selectedField.id, { label: e.target.value })} />
                </div>

                {!['heading', 'paragraph'].includes(selectedField.type) && (
                  <>
                    <div>
                      <Label className="text-xs">Placeholder</Label>
                      <Input value={selectedField.placeholder || ''} onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })} />
                    </div>
                    <div>
                      <Label className="text-xs">Description (aide)</Label>
                      <Textarea value={selectedField.description || ''} onChange={(e) => updateField(selectedField.id, { description: e.target.value })} rows={2} />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
                      <Label className="text-xs">Obligatoire</Label>
                      <Switch checked={selectedField.required} onCheckedChange={(checked) => updateField(selectedField.id, { required: checked })} />
                    </div>
                    <div>
                      <Label className="text-xs">Largeur</Label>
                      <Select value={selectedField.width || 'full'} onValueChange={(value: 'full' | 'half') => updateField(selectedField.id, { width: value })}>
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
                    <Textarea value={selectedField.description || ''} onChange={(e) => updateField(selectedField.id, { description: e.target.value })} rows={4} />
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

          {/* Logic tab */}
          <TabsContent value="logic" className="mt-0 space-y-4 p-4">
            {selectedField && !['heading', 'paragraph'].includes(selectedField.type) ? (
              <ConditionalLogicEditor
                field={selectedField}
                allFields={form.fields}
                onChange={(rules, action) => updateField(selectedField.id, { conditionalRules: rules, conditionalAction: action })}
              />
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                <p className="text-sm">
                  {selectedField ? 'Les titres/paragraphes ne supportent pas la logique conditionnelle' : 'Sélectionnez un champ pour configurer sa logique'}
                </p>
              </div>
            )}
          </TabsContent>

          {/* Theme tab */}
          <TabsContent value="theme" className="mt-0 p-4">
            <FormThemeEditor
              theme={form.settings.formTheme || {}}
              onChange={(formTheme) => setForm((prev) => ({ ...prev, settings: { ...prev.settings, formTheme } }))}
            />
          </TabsContent>

          {/* Settings tab */}
          <TabsContent value="settings" className="mt-0 space-y-4 p-4">
            <div>
              <Label className="text-xs">Texte du bouton</Label>
              <Input value={form.settings.submitButtonText} onChange={(e) => setForm((prev) => ({ ...prev, settings: { ...prev.settings, submitButtonText: e.target.value } }))} />
            </div>
            <div>
              <Label className="text-xs">Message de succès</Label>
              <Textarea value={form.settings.successMessage} onChange={(e) => setForm((prev) => ({ ...prev, settings: { ...prev.settings, successMessage: e.target.value } }))} rows={2} />
            </div>

            <div className="space-y-3 border-t pt-3">
              <div className="text-xs font-semibold">Page de remerciement</div>
              <div>
                <Label className="text-xs">Titre</Label>
                <Input value={form.settings.thankYouPage?.title || ''} onChange={(e) => setForm((prev) => ({ ...prev, settings: { ...prev.settings, thankYouPage: { ...prev.settings.thankYouPage, title: e.target.value } } }))} placeholder="Merci !" />
              </div>
              <div>
                <Label className="text-xs">Image (URL)</Label>
                <Input value={form.settings.thankYouPage?.imageUrl || ''} onChange={(e) => setForm((prev) => ({ ...prev, settings: { ...prev.settings, thankYouPage: { ...prev.settings.thankYouPage, imageUrl: e.target.value } } }))} placeholder="https://..." />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Confetti 🎉</Label>
                <Switch checked={form.settings.thankYouPage?.showConfetti || false} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, settings: { ...prev.settings, thankYouPage: { ...prev.settings.thankYouPage, showConfetti: checked } } }))} />
              </div>
              <div>
                <Label className="text-xs">Texte du CTA</Label>
                <Input value={form.settings.thankYouPage?.ctaText || ''} onChange={(e) => setForm((prev) => ({ ...prev, settings: { ...prev.settings, thankYouPage: { ...prev.settings.thankYouPage, ctaText: e.target.value } } }))} placeholder="Retour au site" />
              </div>
              <div>
                <Label className="text-xs">Lien du CTA</Label>
                <Input value={form.settings.thankYouPage?.ctaUrl || ''} onChange={(e) => setForm((prev) => ({ ...prev, settings: { ...prev.settings, thankYouPage: { ...prev.settings.thankYouPage, ctaUrl: e.target.value } } }))} placeholder="https://..." />
              </div>
              <div>
                <Label className="text-xs">Délai redirection (sec)</Label>
                <Input type="number" value={form.settings.thankYouPage?.redirectDelay ?? ''} onChange={(e) => setForm((prev) => ({ ...prev, settings: { ...prev.settings, thankYouPage: { ...prev.settings.thankYouPage, redirectDelay: Number(e.target.value) } } }))} placeholder="3" min={0} />
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
              <Select value={form.settings.displayMode || 'classic'} onValueChange={(value: 'classic' | 'stepped') => setForm((prev) => ({ ...prev, settings: { ...prev.settings, displayMode: value } }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="classic">Classique (tous les champs)</SelectItem>
                  <SelectItem value="stepped">Question par question (Tally)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border-t pt-3">
              <Label className="text-xs">Thème</Label>
              <Select value={form.settings.theme || 'default'} onValueChange={(value: 'default' | 'minimal' | 'modern') => setForm((prev) => ({ ...prev, settings: { ...prev.settings, theme: value } }))}>
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
  );
};
