import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'accent' | 'destructive' | 'subtle';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', disabled, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none cursor-pointer';

    const variantStyles = {
      default:
        'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow dark:bg-blue-600 dark:hover:bg-blue-500',
      secondary:
        'bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-100',
      outline:
        'border border-slate-200 hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-200',
      ghost:
        'hover:bg-slate-100 text-slate-700 dark:text-slate-200 dark:hover:bg-slate-800/70',
      accent:
        'bg-teal-600 hover:bg-teal-700 text-white shadow-sm hover:shadow dark:bg-teal-600 dark:hover:bg-teal-500',
      destructive:
        'bg-rose-600 hover:bg-rose-700 text-white shadow-sm dark:bg-rose-600 dark:hover:bg-rose-500',
      subtle:
        'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-900/60',
    }[variant];

    const sizeStyles = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2 gap-2',
      lg: 'text-base px-5 py-2.5 gap-2.5',
      icon: 'h-9 w-9 p-0',
    }[size];

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(baseStyles, variantStyles, sizeStyles, className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
