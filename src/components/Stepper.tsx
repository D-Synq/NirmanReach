import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StepId } from '@/lib/types';

const STEPS: { id: StepId; label: string; description: string }[] = [
  { id: 1, label: 'Upload', description: 'Import Excel/CSV' },
  { id: 2, label: 'Preview', description: 'Customize template' },
  { id: 3, label: 'Dispatch', description: 'Confirm & send' },
  { id: 4, label: 'Results', description: 'Review & export' },
];

interface StepperProps {
  current: StepId;
  onStepClick?: (step: StepId) => void;
  maxReached: StepId;
}

export function Stepper({ current, onStepClick, maxReached }: StepperProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const isComplete = step.id < current;
          const isCurrent = step.id === current;
          const isClickable = step.id <= maxReached && onStepClick;
          const isLast = index === STEPS.length - 1;

          return (
            <div
              key={step.id}
              className={cn('flex items-center', !isLast && 'flex-1')}
            >
              <div
                className={cn(
                  'flex items-center gap-3',
                  isClickable && 'cursor-pointer',
                )}
                onClick={() => isClickable && onStepClick?.(step.id)}
              >
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all',
                    isComplete &&
                      'border-[#00A887] bg-[#00A887] text-white',
                    isCurrent &&
                      'border-[#00A887] bg-[#00A887] text-white animate-pulse-ring',
                    !isComplete &&
                      !isCurrent &&
                      'border-[#DDE5E0] bg-white/50 text-[#526B63] dark:border-[#184239] dark:bg-[#0D2721]/50 dark:text-[#8FAEA6]',
                  )}
                >
                  {isComplete ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <div className="hidden flex-col sm:flex">
                  <span
                    className={cn(
                      'text-sm font-semibold leading-tight',
                      isCurrent && 'text-[#00A887]',
                      !isCurrent && !isComplete && 'text-[#526B63] dark:text-[#8FAEA6]',
                    )}
                  >
                    {step.label}
                  </span>
                  <span className="text-xs text-[#526B63] dark:text-[#8FAEA6] leading-tight">
                    {step.description}
                  </span>
                </div>
              </div>

              {!isLast && (
                <div
                  className={cn(
                    'mx-2 h-0.5 flex-1 rounded-full transition-colors sm:mx-4',
                    step.id < current ? 'bg-[#00A887]' : 'bg-[#DDE5E0] dark:bg-[#184239]',
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
