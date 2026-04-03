import React, { useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FieldType } from './types';
import { FIELD_TYPES } from './constants';

interface FieldPaletteProps {
  fieldSearch: string;
  onFieldSearchChange: (value: string) => void;
  onAddField: (type: FieldType) => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
}

export const FieldPalette: React.FC<FieldPaletteProps> = ({
  fieldSearch,
  onFieldSearchChange,
  onAddField,
  searchInputRef,
}) => {
  const filteredFieldTypes = useMemo(
    () => FIELD_TYPES.filter((item) => item.label.toLowerCase().includes(fieldSearch.toLowerCase())),
    [fieldSearch]
  );

  return (
    <aside className="hidden w-64 shrink-0 rounded-xl border bg-card lg:flex lg:flex-col">
      <div className="border-b p-3">
        <h3 className="text-sm font-semibold text-foreground">Questions</h3>
        <div className="relative mt-2">
          <Input
            ref={searchInputRef}
            value={fieldSearch}
            onChange={(e) => onFieldSearchChange(e.target.value)}
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
              onClick={() => onAddField(type)}
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
  );
};
