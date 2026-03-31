import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Plus, Send, Edit, Trash2 } from 'lucide-react';
import { LocalEmailTemplate, templateCategories } from './emailData';

interface EmailTemplateSectionProps {
  templates: LocalEmailTemplate[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  onEditTemplate: (t: LocalEmailTemplate) => void;
  onNewTemplate: () => void;
}

export const EmailTemplateSection: React.FC<EmailTemplateSectionProps> = ({
  templates, selectedCategory, setSelectedCategory, onEditTemplate, onNewTemplate
}) => {
  const filtered = selectedCategory === 'all' ? templates : templates.filter(t => t.category === selectedCategory);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Modèles d'Email</CardTitle>
          <div className="flex items-center space-x-3">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Catégorie" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {templateCategories.slice(1).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={onNewTemplate} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" />Nouveau Modèle
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(template => (
            <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-foreground">{template.name}</h3>
                  <Badge variant="outline">{template.category}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{template.subject}</p>
                <div className="mb-3">
                  <p className="text-xs text-muted-foreground mb-1">Variables disponibles:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.variables.slice(0, 3).map(v => <Badge key={v} variant="secondary" className="text-xs">{v}</Badge>)}
                    {template.variables.length > 3 && <Badge variant="secondary" className="text-xs">+{template.variables.length - 3}</Badge>}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{template.content.substring(0, 100)}...</p>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="flex-1"><Send className="h-3 w-3 mr-1" />Utiliser</Button>
                  <Button size="sm" variant="outline" onClick={() => onEditTemplate(template)}><Edit className="h-3 w-3" /></Button>
                  <Button size="sm" variant="outline"><Trash2 className="h-3 w-3" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
