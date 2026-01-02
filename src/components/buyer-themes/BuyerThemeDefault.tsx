import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BuyerThemeDefaultProps {
  children: ReactNode;
  className?: string;
}

// Default Theme: Clean modern design with blue-purple gradients
export const BuyerThemeDefault = ({ children, className }: BuyerThemeDefaultProps) => {
  return (
    <div 
      className={cn(
        "buyer-theme-default min-h-screen font-inter",
        className
      )}
      style={{
        '--theme-background': 'hsl(var(--background))',
        '--theme-surface': 'hsl(var(--card))',
        '--theme-primary': 'hsl(var(--primary))',
        '--theme-secondary': 'hsl(var(--secondary))',
        '--theme-accent': 'hsl(var(--accent))',
        '--theme-text': 'hsl(var(--foreground))',
        '--theme-muted': 'hsl(var(--muted-foreground))',
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
};

// Theme configuration for database storage
export const defaultThemeConfig = {
  key: 'default',
  name: 'Default Theme',
  description: 'Clean modern design with subtle gradients',
  fonts: {
    heading: 'Inter',
    body: 'Inter',
  },
  colors: {
    dark: {
      background: '#0F172A',
      surface: '#1E293B',
      primary: '#6366F1',
      secondary: '#8B5CF6',
      accent: '#EC4899',
      text: '#FFFFFF',
      muted: '#94A3B8',
    },
    light: {
      background: '#FFFFFF',
      surface: '#F8FAFC',
      primary: '#6366F1',
      secondary: '#8B5CF6',
      accent: '#EC4899',
      text: '#0F172A',
      muted: '#64748B',
    },
  },
  layout: {
    heroStyle: 'gradient',
    cardStyle: 'glass',
    navStyle: 'floating',
    spacing: 'comfortable',
  },
};

export default BuyerThemeDefault;
