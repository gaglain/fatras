import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Variable } from 'lucide-react';
import { EMAIL_VARIABLES, EmailVariable } from '@/utils/emailVariables';
import { toast } from 'sonner';

interface VariableInserterProps {
  onInsert: (variable: string) => void;
}

export const VariableInserter: React.FC<VariableInserterProps> = ({ onInsert }) => {
  const handleInsert = (variable: EmailVariable) => {
    onInsert(variable.placeholder);
    toast.success(`Variable "${variable.label}" insérée`);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Variable className="h-4 w-4 mr-2" />
          Insérer une variable
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <p className="text-sm font-medium mb-3">Variables disponibles</p>
          <div className="space-y-2">
            {EMAIL_VARIABLES.map((variable) => (
              <div
                key={variable.key}
                className="flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer transition-colors"
                onClick={() => handleInsert(variable)}
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{variable.label}</p>
                  <Badge variant="secondary" className="text-xs mt-1">
                    {variable.placeholder}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3 pt-3 border-t">
            Cliquez sur une variable pour l'insérer dans votre message
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};
