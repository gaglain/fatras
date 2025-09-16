import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface Step {
  id: number;
  name: string;
  description: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep, onStepClick }) => {
  return (
    <nav aria-label="Progress">
      <ol className="flex items-center">
        {steps.map((step, stepIdx) => (
          <li key={step.id} className={cn("relative", stepIdx !== steps.length - 1 && "pr-8 sm:pr-20")}>
            {stepIdx !== steps.length - 1 && (
              <div className="absolute inset-0 flex items-center">
                <div className="h-0.5 w-full bg-gray-200" />
              </div>
            )}
            <div
              className={cn(
                "relative flex h-8 w-8 items-center justify-center rounded-full border-2 bg-white cursor-pointer",
                step.id < currentStep
                  ? "border-primary bg-primary text-white"
                  : step.id === currentStep
                  ? "border-primary text-primary"
                  : "border-gray-300 text-gray-500"
              )}
              onClick={() => onStepClick?.(step.id)}
            >
              {step.id < currentStep ? (
                <Check className="h-5 w-5" />
              ) : (
                <span className="text-sm font-medium">{step.id}</span>
              )}
            </div>
            <div className="mt-2 text-center">
              <div className={cn(
                "text-sm font-medium",
                step.id <= currentStep ? "text-primary" : "text-gray-500"
              )}>
                {step.name}
              </div>
              <div className="text-xs text-gray-500">{step.description}</div>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};