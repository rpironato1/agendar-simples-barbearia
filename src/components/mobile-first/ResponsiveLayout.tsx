// Mobile-first responsive layout component
import React from 'react';
import { cn } from '@/lib/utils';
import { BREAKPOINTS, TOUCH_SIZES } from '@/core/constants';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  centeredContent?: boolean;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  className,
  padding = 'md',
  maxWidth = 'lg',
  centeredContent = true
}) => {
  const paddingClasses = {
    none: '',
    sm: 'px-4 py-2 md:px-6 md:py-4',
    md: 'px-4 py-4 md:px-8 md:py-6 lg:px-12 lg:py-8',
    lg: 'px-6 py-6 md:px-12 md:py-8 lg:px-16 lg:py-12'
  };

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full'
  };

  return (
    <div className={cn(
      'w-full min-h-screen',
      centeredContent && 'mx-auto',
      maxWidthClasses[maxWidth],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
};

// Mobile-first container component
interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const Container: React.FC<ContainerProps> = ({
  children,
  className,
  size = 'lg'
}) => {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-4xl', 
    xl: 'max-w-6xl',
    full: 'w-full'
  };

  return (
    <div className={cn(
      'w-full mx-auto px-4 sm:px-6 lg:px-8',
      sizeClasses[size],
      className
    )}>
      {children}
    </div>
  );
};

// Responsive grid component
interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md'
}) => {
  const gapClasses = {
    sm: 'gap-2 md:gap-3',
    md: 'gap-4 md:gap-6',
    lg: 'gap-6 md:gap-8'
  };

  const gridCols = cn(
    'grid',
    `grid-cols-${cols.mobile || 1}`,
    `md:grid-cols-${cols.tablet || 2}`,
    `lg:grid-cols-${cols.desktop || 3}`,
    gapClasses[gap]
  );

  return (
    <div className={cn(gridCols, className)}>
      {children}
    </div>
  );
};

// Mobile-first stack component
interface StackProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'vertical' | 'horizontal';
  spacing?: 'sm' | 'md' | 'lg';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
}

export const Stack: React.FC<StackProps> = ({
  children,
  className,
  direction = 'vertical',
  spacing = 'md',
  align = 'stretch',
  justify = 'start'
}) => {
  const spacingClasses = {
    sm: direction === 'vertical' ? 'space-y-2' : 'space-x-2',
    md: direction === 'vertical' ? 'space-y-4' : 'space-x-4',
    lg: direction === 'vertical' ? 'space-y-6' : 'space-x-6'
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around'
  };

  return (
    <div className={cn(
      'flex',
      direction === 'vertical' ? 'flex-col' : 'flex-row',
      spacingClasses[spacing],
      alignClasses[align],
      justifyClasses[justify],
      className
    )}>
      {children}
    </div>
  );
};

// Responsive section component
interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  fullHeight?: boolean;
  background?: 'none' | 'muted' | 'accent' | 'gradient';
}

export const Section: React.FC<SectionProps> = ({
  children,
  className,
  id,
  fullHeight = false,
  background = 'none'
}) => {
  const backgroundClasses = {
    none: '',
    muted: 'bg-muted/50',
    accent: 'bg-accent/10',
    gradient: 'bg-gradient-to-br from-background via-background/50 to-muted/30'
  };

  return (
    <section 
      id={id}
      className={cn(
        'w-full py-8 md:py-12 lg:py-16',
        fullHeight && 'min-h-screen',
        backgroundClasses[background],
        className
      )}
    >
      {children}
    </section>
  );
};