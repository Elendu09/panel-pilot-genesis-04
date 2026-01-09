import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BuyerThemeSMMVisitProps {
  children: ReactNode;
  className?: string;
}

// SMMVisit Theme: Light gray with yellow/gold accents
export const BuyerThemeSMMVisit = ({ children, className }: BuyerThemeSMMVisitProps) => {
  return (
    <div 
      className={cn(
        "buyer-theme-smmvisit min-h-screen font-sans",
        className
      )}
    >
      <style>{`
        .buyer-theme-smmvisit {
          --theme-background: #F5F5F5;
          --theme-surface: #FFFFFF;
          --theme-primary: #FFD700;
          --theme-secondary: #FFC107;
          --theme-accent: #1A1A1A;
          --theme-text: #1A1A1A;
          --theme-muted: #6B7280;
          background: var(--theme-background);
          color: var(--theme-text);
        }
        
        .buyer-theme-smmvisit .theme-card {
          background: white;
          border: 1px solid #E5E7EB;
          border-radius: 1rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .buyer-theme-smmvisit .theme-button-primary {
          background: linear-gradient(135deg, #FFD700 0%, #FFC107 100%);
          color: #1A1A1A;
          font-weight: 600;
          border-radius: 9999px;
        }
      `}</style>
      {children}
    </div>
  );
};

export const smmVisitThemeConfig = {
  key: 'smmvisit',
  name: 'SMMVisit',
  description: 'Clean professional with yellow/gold accents',
  fonts: {
    heading: 'Inter',
    body: 'Inter',
  },
  colors: {
    dark: {
      background: '#1A1A1A',
      surface: '#262626',
      primary: '#FFD700',
      secondary: '#FFC107',
      accent: '#FFFFFF',
      text: '#FFFFFF',
      muted: '#9CA3AF',
    },
    light: {
      background: '#F5F5F5',
      surface: '#FFFFFF',
      primary: '#FFD700',
      secondary: '#FFC107',
      accent: '#1A1A1A',
      text: '#1A1A1A',
      muted: '#6B7280',
    },
  },
  layout: {
    heroStyle: 'comparison-chart',
    cardStyle: 'rounded-shadow',
    navStyle: 'rounded-white',
    spacing: 'comfortable',
  },
};

export default BuyerThemeSMMVisit;
