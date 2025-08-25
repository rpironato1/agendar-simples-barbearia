// Mobile-first button component optimized for touch interfaces
import React from 'react';
import { cn } from '@/lib/utils';
import { TOUCH_SIZES } from '@/core/constants';
import { Loader2 } from 'lucide-react';

interface TouchButtonProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  'data-testid'?: string;
}

export const TouchButton: React.FC<TouchButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  type = 'button',
  'data-testid': testId
}) => {
  const baseClasses = cn(
    // Base styles
    'inline-flex items-center justify-center gap-2',
    'font-medium transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-95', // Touch feedback
    // Touch-optimized minimum size
    `min-h-[${TOUCH_SIZES.minTouch}px]`,
    // Full width option
    fullWidth && 'w-full'
  );

  const variantClasses = {
    primary: cn(
      'btn-primary-accessible',
      'hover:btn-primary-accessible:hover focus:btn-primary-accessible:focus',
      'focus-visible:ring-primary transition-all duration-200'
    ),
    secondary: cn(
      'btn-secondary-accessible',
      'hover:btn-secondary-accessible:hover',
      'focus-visible:ring-ring'
    ),
    outline: cn(
      'border-2 border-input bg-background text-foreground',
      'hover:bg-accent hover:text-accent-foreground',
      'active:bg-accent/80',
      'focus-visible:ring-ring focus-visible:outline-2 focus-visible:outline-offset-2'
    ),
    ghost: cn(
      'text-foreground',
      'hover:bg-accent hover:text-accent-foreground',
      'active:bg-accent/80',
      'focus-visible:ring-ring focus-visible:outline-2 focus-visible:outline-offset-2'
    ),
    destructive: cn(
      'bg-destructive text-destructive-foreground border-2 border-destructive',
      'hover:bg-destructive/90 active:bg-destructive/80',
      'focus-visible:ring-destructive focus-visible:outline-2 focus-visible:outline-offset-2'
    )
  };

  const sizeClasses = {
    sm: 'h-9 px-3 text-sm rounded-md',
    md: 'h-10 px-4 py-2 text-base rounded-lg',
    lg: 'h-12 px-6 py-3 text-lg rounded-xl',
    icon: 'h-10 w-10 rounded-lg'
  };

  return (
    <button
      type={type}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      onClick={onClick}
      data-testid={testId}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
};

// Mobile-optimized input component
interface TouchInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'number';
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  inputClassName?: string;
  'data-testid'?: string;
}

export const TouchInput: React.FC<TouchInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
  disabled = false,
  required = false,
  className,
  inputClassName,
  'data-testid': testId
}) => {
  return (
    <div className={cn('w-full space-y-2', className)}>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={cn(
          // Base styles
          'flex w-full rounded-lg border border-input bg-background',
          'text-base text-foreground', // Larger text for mobile
          'placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          // Touch-optimized sizing
          `min-h-[${TOUCH_SIZES.inputHeight}px] px-4 py-3`,
          // Error state
          error && 'border-destructive focus-visible:ring-destructive',
          inputClassName
        )}
        data-testid={testId}
      />
      {error && (
        <p className="text-sm text-destructive font-medium">{error}</p>
      )}
    </div>
  );
};

// Mobile-optimized card component
interface TouchCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
  'data-testid'?: string;
}

export const TouchCard: React.FC<TouchCardProps> = ({
  children,
  className,
  padding = 'md',
  shadow = 'sm',
  hover = false,
  onClick,
  'data-testid': testId
}) => {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4 md:p-6',
    lg: 'p-6 md:p-8'
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  };

  return (
    <div
      className={cn(
        'rounded-xl border bg-card text-card-foreground',
        paddingClasses[padding],
        shadowClasses[shadow],
        hover && 'transition-all duration-200 hover:shadow-md hover:scale-[1.02]',
        onClick && 'cursor-pointer active:scale-[0.98]',
        className
      )}
      onClick={onClick}
      data-testid={testId}
    >
      {children}
    </div>
  );
};

// Mobile-first navigation component
interface TouchNavProps {
  items: Array<{
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: React.ReactNode;
    active?: boolean;
  }>;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export const TouchNav: React.FC<TouchNavProps> = ({
  items,
  className,
  orientation = 'horizontal'
}) => {
  return (
    <nav className={cn(
      'flex gap-1',
      orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
      className
    )}>
      {items.map((item, index) => (
        <button
          key={index}
          className={cn(
            'flex items-center gap-2 px-4 py-3 rounded-lg',
            'text-sm font-medium transition-colors duration-200',
            `min-h-[${TOUCH_SIZES.comfortableTouch}px]`,
            item.active 
              ? 'bg-primary text-primary-foreground' 
              : 'text-muted-foreground hover:text-foreground hover:bg-accent',
            'active:scale-95'
          )}
          onClick={item.onClick}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </nav>
  );
};

// Export all mobile-first components
export { TouchButton as Button };
export { TouchInput as Input };
export { TouchCard as Card };
export { TouchNav as Nav };