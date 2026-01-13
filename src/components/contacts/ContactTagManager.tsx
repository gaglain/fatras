
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Check, Plus, X, Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

interface ContactTagManagerProps {
  contactId: string;
  currentTags: string[];
  onTagsUpdated: (newTags: string[]) => void;
  availableTags: string[];
  onNewTagAdded: (tag: string) => void;
}

export const ContactTagManager: React.FC<ContactTagManagerProps> = ({
  contactId,
  currentTags,
  onTagsUpdated,
  availableTags,
  onNewTagAdded
}) => {
  const [open, setOpen] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [showNewTagInput, setShowNewTagInput] = useState(false);

  const handleTagToggle = async (tag: string) => {
    const updatedTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];

    try {
      const { error } = await supabase
        .from('contacts')
        .update({ tags: updatedTags })
        .eq('id', contactId);

      if (error) {
        logger.error('Error updating tags:', error);
        toast.error('Erreur lors de la mise à jour des tags');
        return;
      }

      onTagsUpdated(updatedTags);
      logger.debug('✅ Tags updated for contact:', contactId, updatedTags);
    } catch (error: unknown) {
      logger.error('Error in handleTagToggle:', error);
      toast.error('Erreur lors de la mise à jour des tags');
    }
  };

  const handleNewTagAdd = async () => {
    if (!newTag.trim()) return;

    const trimmedTag = newTag.trim();
    
    // Ajouter le tag au contact
    const updatedTags = [...currentTags, trimmedTag];
    
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ tags: updatedTags })
        .eq('id', contactId);

      if (error) {
        logger.error('Error adding new tag:', error);
        toast.error('Erreur lors de l\'ajout du tag');
        return;
      }

      onTagsUpdated(updatedTags);
      onNewTagAdded(trimmedTag);
      setNewTag('');
      setShowNewTagInput(false);
      toast.success(`Tag "${trimmedTag}" ajouté`);
      logger.debug('✅ New tag added:', trimmedTag);
    } catch (error: unknown) {
      logger.error('Error in handleNewTagAdd:', error);
      toast.error('Erreur lors de l\'ajout du tag');
    }
  };

  const handleTagRemove = async (tagToRemove: string) => {
    const updatedTags = currentTags.filter(tag => tag !== tagToRemove);
    
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ tags: updatedTags })
        .eq('id', contactId);

      if (error) {
        logger.error('Error removing tag:', error);
        toast.error('Erreur lors de la suppression du tag');
        return;
      }

      onTagsUpdated(updatedTags);
      logger.debug('✅ Tag removed from contact:', tagToRemove);
    } catch (error: unknown) {
      logger.error('Error in handleTagRemove:', error);
      toast.error('Erreur lors de la suppression du tag');
    }
  };

  return (
    <div className="space-y-2">
      {/* Tags actuels */}
      {currentTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {currentTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
              <button
                onClick={() => handleTagRemove(tag)}
                className="ml-1 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Gestionnaire de tags */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 text-xs">
            <Tag className="h-3 w-3 mr-1" />
            Gérer les tags
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <Command>
            <CommandInput placeholder="Rechercher un tag..." />
            <CommandEmpty>
              {showNewTagInput ? (
                <div className="p-2 space-y-2">
                  <Input
                    placeholder="Nouveau tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleNewTagAdd();
                      }
                    }}
                    className="h-8"
                  />
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={handleNewTagAdd}>
                      Ajouter
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        setShowNewTagInput(false);
                        setNewTag('');
                      }}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowNewTagInput(true)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Créer un nouveau tag
                  </Button>
                </div>
              )}
            </CommandEmpty>
            <CommandGroup>
              {availableTags.map((tag) => (
                <CommandItem
                  key={tag}
                  onSelect={() => handleTagToggle(tag)}
                  className="cursor-pointer"
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      currentTags.includes(tag) ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                  {tag}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
