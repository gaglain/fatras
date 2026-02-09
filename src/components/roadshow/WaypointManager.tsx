import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X, GripVertical } from 'lucide-react';

export interface Waypoint {
  id: string;
  address: string;
}

interface WaypointManagerProps {
  waypoints: Waypoint[];
  onChange: (waypoints: Waypoint[]) => void;
  disabled?: boolean;
}

export const WaypointManager: React.FC<WaypointManagerProps> = ({
  waypoints,
  onChange,
  disabled = false,
}) => {
  const [newAddress, setNewAddress] = useState('');

  const addWaypoint = () => {
    if (!newAddress.trim()) return;
    const wp: Waypoint = {
      id: crypto.randomUUID(),
      address: newAddress.trim(),
    };
    onChange([...waypoints, wp]);
    setNewAddress('');
  };

  const removeWaypoint = (id: string) => {
    onChange(waypoints.filter(wp => wp.id !== id));
  };

  const moveWaypoint = (index: number, direction: 'up' | 'down') => {
    const newWaypoints = [...waypoints];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newWaypoints.length) return;
    [newWaypoints[index], newWaypoints[targetIndex]] = [newWaypoints[targetIndex], newWaypoints[index]];
    onChange(newWaypoints);
  };

  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Étapes intermédiaires
      </div>

      {waypoints.length > 0 && (
        <div className="space-y-1.5">
          {waypoints.map((wp, index) => (
            <div
              key={wp.id}
              className="flex items-center gap-1.5 bg-muted/30 rounded-md px-2 py-1.5 border text-sm"
            >
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => moveWaypoint(index, 'up')}
                  disabled={disabled || index === 0}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30 leading-none text-[10px]"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => moveWaypoint(index, 'down')}
                  disabled={disabled || index === waypoints.length - 1}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30 leading-none text-[10px]"
                >
                  ▼
                </button>
              </div>
              <GripVertical className="h-3 w-3 text-muted-foreground/50 flex-shrink-0" />
              <span className="text-xs font-medium text-muted-foreground w-4 flex-shrink-0">
                {index + 1}.
              </span>
              <span className="flex-1 truncate">{wp.address}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-5 w-5 flex-shrink-0"
                onClick={() => removeWaypoint(wp.id)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Input
          placeholder="Ajouter une étape (ex: Lyon, Valence...)"
          value={newAddress}
          onChange={(e) => setNewAddress(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addWaypoint();
            }
          }}
          disabled={disabled}
          className="h-8 text-sm"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={addWaypoint}
          disabled={disabled || !newAddress.trim()}
          className="h-8 px-2 flex-shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};
