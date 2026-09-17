import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-[#0A6A4E] text-[#E6F7F3] hover:bg-[#0A6A4E]/90 dark:bg-[#00A887]/20 dark:text-[#00A887]',
        secondary:
          'border-transparent bg-[#E6F7F3] text-[#0A6A4E] hover:bg-[#E6F7F3]/80 dark:bg-[#143830] dark:text-[#00A887]',
        destructive:
          'border-transparent bg-[#FEE4E2] text-[#B42318] hover:bg-[#FEE4E2]/80 dark:bg-[#2A0F0C] dark:text-[#FF6B5A] dark:border-[#5C1A14]',
        outline: 'border-[#DDE5E0] text-[#0D322B] bg-white/50 dark:border-[#184239] dark:text-[#F4F9F6] dark:bg-white/5',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
