import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BuyerThemeDefaultProps {
  children: ReactNode;
  className?: string;
  themeMode?: 'light' | 'dark';
}

// Default Theme: Clean modern design with blue-purple gradients
export const BuyerThemeDefault = ({ children, className, themeMode = 'dark' }: BuyerThemeDefaultProps) => {
  return (
    <div className={themeMode === 'light' ? 'light' : 'dark'}>
      <div 
        className={cn(
          "buyer-theme-default buyer-theme-wrapper min-h-screen font-inter",
          className
        )}
      >
      <style>{`
        .buyer-theme-default {
          --theme-background: hsl(var(--background));
          --theme-surface: hsl(var(--card));
          --theme-primary: hsl(var(--primary));
          --theme-secondary: hsl(var(--secondary));
          --theme-accent: hsl(var(--accent));
          --theme-text: hsl(var(--foreground));
          --theme-muted: hsl(var(--muted-foreground));
        }
        
        /* Override panel variables for default theme - uses Tailwind CSS variables */
        .buyer-theme-default {
          --panel-gradient: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%);
          --panel-gradient-accent: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%);
          --panel-glow: 0 0 20px hsl(var(--primary) / 0.4);
          --panel-glow-lg: 0 0 40px hsl(var(--primary) / 0.3);
          --panel-nav-active-bg: hsl(var(--primary) / 0.1);
          --panel-nav-active-text: hsl(var(--primary));
          --panel-bottom-nav-center-gradient: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%);
          --step-active: hsl(var(--primary));
          --step-completed: hsl(var(--primary));
          --step-glow: 0 0 16px hsl(var(--primary) / 0.5);
        }
        
        .buyer-theme-default .theme-card {
          background: hsl(var(--card));
          border: 1px solid hsl(var(--border));
        }
        
        .buyer-theme-default .theme-button-primary {
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
        }
        
        .buyer-theme-default .theme-gradient-text {
          background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .buyer-theme-default .theme-icon-box {
          background: hsl(var(--primary) / 0.1);
          border-radius: 12px;
        }
        
        .buyer-theme-default .theme-nav {
          background: hsl(var(--background) / 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid hsl(var(--border));
        }
        
        .buyer-theme-default .theme-hero {
          background: linear-gradient(180deg, hsl(var(--primary) / 0.05) 0%, transparent 50%);
        }
        
        /* ===== DARK MODE ===== */
        .dark .buyer-theme-default {
          background: hsl(var(--background));
          color: hsl(var(--foreground));
        }
        
        .dark .buyer-theme-default .theme-card {
          background: hsl(var(--card));
          border-color: hsl(var(--border));
        }
        
        .dark .buyer-theme-default .theme-nav {
          background: hsl(var(--background) / 0.95);
          border-color: hsl(var(--border));
        }
        
        .dark .buyer-theme-default input,
        .dark .buyer-theme-default textarea,
        .dark .buyer-theme-default select {
          background: hsl(var(--background)) !important;
          border-color: hsl(var(--border)) !important;
          color: hsl(var(--foreground)) !important;
        }
        
        .dark .buyer-theme-default button:not(.theme-button-primary):not([class*="gradient"]) {
          color: hsl(var(--foreground));
        }
        
        .dark .buyer-theme-default a {
          color: hsl(var(--muted-foreground));
        }
        
        .dark .buyer-theme-default a:hover {
          color: hsl(var(--primary));
        }
        
        .dark .buyer-theme-default [class*="Card"] {
          background: hsl(var(--card)) !important;
          border-color: hsl(var(--border)) !important;
        }
        
        .dark .buyer-theme-default [role="dialog"] {
          background: hsl(var(--card)) !important;
          border-color: hsl(var(--border)) !important;
        }
        
        .dark .buyer-theme-default nav a,
        .dark .buyer-theme-default header a {
          color: hsl(var(--muted-foreground));
        }
        
        .dark .buyer-theme-default nav a:hover,
        .dark .buyer-theme-default header a:hover {
          color: hsl(var(--primary));
        }
        
        /* ===== LIGHT MODE ===== */
        .light .buyer-theme-default {
          background: hsl(var(--background));
          color: hsl(var(--foreground));
        }
        
        .light .buyer-theme-default .theme-card {
          background: hsl(var(--card));
          border-color: hsl(var(--border));
          box-shadow: 0 4px 20px hsl(var(--primary) / 0.05);
        }
        
        .light .buyer-theme-default .theme-nav {
          background: hsl(var(--background) / 0.95);
          border-color: hsl(var(--border));
        }
        
        .light .buyer-theme-default input,
        .light .buyer-theme-default textarea,
        .light .buyer-theme-default select {
          background: hsl(var(--background)) !important;
          border-color: hsl(var(--border)) !important;
          color: hsl(var(--foreground)) !important;
        }
        
        .light .buyer-theme-default button:not(.theme-button-primary):not([class*="gradient"]) {
          color: hsl(var(--foreground));
        }
        
        .light .buyer-theme-default a {
          color: hsl(var(--muted-foreground));
        }
        
        .light .buyer-theme-default a:hover {
          color: hsl(var(--primary));
        }
        
        .light .buyer-theme-default [class*="Card"] {
          background: hsl(var(--card)) !important;
          border-color: hsl(var(--border)) !important;
        }
        
        .light .buyer-theme-default [role="dialog"] {
          background: hsl(var(--card)) !important;
          border-color: hsl(var(--border)) !important;
        }
        
        .light .buyer-theme-default nav a,
        .light .buyer-theme-default header a {
          color: hsl(var(--muted-foreground));
        }
        
        .light .buyer-theme-default nav a:hover,
        .light .buyer-theme-default header a:hover {
          color: hsl(var(--primary));
        }
        
        .light .buyer-theme-default h1,
        .light .buyer-theme-default h2,
        .light .buyer-theme-default h3,
        .light .buyer-theme-default h4,
        .light .buyer-theme-default h5,
        .light .buyer-theme-default h6 {
          color: hsl(var(--foreground));
        }
        
        .light .buyer-theme-default p,
        .light .buyer-theme-default span:not(.theme-gradient-text) {
          color: hsl(var(--muted-foreground));
        }
      `}</style>
        {children}
      </div>
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