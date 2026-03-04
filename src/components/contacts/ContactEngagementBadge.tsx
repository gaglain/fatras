import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';

interface ContactEngagementBadgeProps {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D';
  compact?: boolean;
  showScore?: boolean;
}

const gradeConfig = {
  A: {
    label: 'Très engagé',
    className: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    icon: TrendingUp,
  },
  B: {
    label: 'Engagé',
    className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    icon: TrendingUp,
  },
  C: {
    label: 'Peu actif',
    className: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    icon: Minus,
  },
  D: {
    label: 'Inactif / Bounced',
    className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    icon: AlertTriangle,
  },
};

export const ContactEngagementBadge: React.FC<ContactEngagementBadgeProps> = ({
  score,
  grade,
  compact = false,
  showScore = true,
}) => {
  const config = gradeConfig[grade];
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={`${config.className} gap-1 cursor-help`}>
            <Icon className="h-3 w-3" />
            {compact ? grade : config.label}
            {showScore && <span className="font-mono text-xs ml-0.5">({score})</span>}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs space-y-1">
            <p className="font-semibold">Score de fiabilité : {score}/100</p>
            <p>Grade : {grade} — {config.label}</p>
            <p className="text-muted-foreground">
              Basé sur : livraison, ouvertures, clics et bounces
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
