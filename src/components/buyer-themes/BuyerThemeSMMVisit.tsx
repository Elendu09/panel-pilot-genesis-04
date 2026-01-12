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
        "buyer-theme-smmvisit buyer-theme-wrapper min-h-screen font-sans",
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
        
        /* Override panel variables for this theme */
        .buyer-theme-smmvisit {
          --panel-primary: #FFD700;
          --panel-secondary: #FFC107;
          --panel-accent: #1A1A1A;
          --panel-gradient: linear-gradient(135deg, #FFD700 0%, #FFC107 100%);
          --panel-gradient-accent: linear-gradient(135deg, #FFD700 0%, #FFB300 100%);
          --panel-glow: 0 0 20px rgba(255, 215, 0, 0.4);
          --panel-glow-lg: 0 0 40px rgba(255, 215, 0, 0.3);
          --panel-nav-active-bg: rgba(255, 215, 0, 0.2);
          --panel-nav-active-text: #1A1A1A;
          --panel-bottom-nav-center-gradient: linear-gradient(135deg, #FFD700 0%, #FFC107 100%);
          --step-active: #FFD700;
          --step-completed: #FFD700;
          --step-glow: 0 0 16px rgba(255, 215, 0, 0.6);
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
          box-shadow: 0 4px 16px rgba(255, 215, 0, 0.3);
        }
        
        .buyer-theme-smmvisit .theme-button-primary:hover {
          box-shadow: 0 6px 24px rgba(255, 215, 0, 0.5);
        }
        
        .buyer-theme-smmvisit .theme-gradient-text {
          background: linear-gradient(135deg, #FFD700 0%, #FFC107 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .buyer-theme-smmvisit .theme-icon-box {
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 193, 7, 0.1));
          border-radius: 16px;
        }
        
        .buyer-theme-smmvisit .theme-nav {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid #E5E7EB;
        }
        
        .buyer-theme-smmvisit .theme-hero {
          background: linear-gradient(180deg, #FFFBEB 0%, #F5F5F5 100%);
        }
        
        /* Dashboard elements - Light mode */
        .buyer-theme-smmvisit .glass-card,
        .buyer-theme-smmvisit [class*="Card"] {
          background: #FFFFFF !important;
          border-color: #E5E7EB !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
        }
        
        .buyer-theme-smmvisit .glass-sidebar {
          background: #FFFFFF !important;
          border-color: #E5E7EB !important;
          box-shadow: 2px 0 20px rgba(0, 0, 0, 0.03) !important;
        }
        
        .buyer-theme-smmvisit input,
        .buyer-theme-smmvisit textarea,
        .buyer-theme-smmvisit select {
          background: #FFFFFF !important;
          border-color: #E5E7EB !important;
          color: #1A1A1A !important;
        }
        
        .buyer-theme-smmvisit input::placeholder,
        .buyer-theme-smmvisit textarea::placeholder {
          color: #9CA3AF !important;
        }
        
        .buyer-theme-smmvisit input:focus,
        .buyer-theme-smmvisit textarea:focus,
        .buyer-theme-smmvisit select:focus {
          border-color: #FFD700 !important;
          box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.2) !important;
        }
        
        .buyer-theme-smmvisit table {
          background: #FFFFFF !important;
        }
        
        .buyer-theme-smmvisit thead {
          background: rgba(255, 215, 0, 0.08) !important;
        }
        
        .buyer-theme-smmvisit tbody tr:hover {
          background: rgba(255, 215, 0, 0.05) !important;
        }
        
        /* ===== COMPREHENSIVE DARK MODE ===== */
        .dark .buyer-theme-smmvisit {
          --theme-background: #1A1A1A;
          --theme-surface: #262626;
          --theme-text: #FFFFFF;
          --theme-muted: #9CA3AF;
          --panel-nav-active-text: #FFD700;
        }
        
        .dark .buyer-theme-smmvisit {
          background: linear-gradient(180deg, #1A1A1A 0%, #141414 100%);
        }
        
        .dark .buyer-theme-smmvisit .theme-card {
          background: #262626;
          border: 1px solid rgba(255, 215, 0, 0.2);
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
        }
        
        .dark .buyer-theme-smmvisit .theme-nav {
          background: rgba(26, 26, 26, 0.95);
          backdrop-filter: blur(10px);
          border-color: rgba(255, 215, 0, 0.1);
        }
        
        .dark .buyer-theme-smmvisit .theme-hero {
          background: radial-gradient(ellipse at top, rgba(255, 215, 0, 0.1) 0%, transparent 50%);
        }
        
        .dark .buyer-theme-smmvisit .theme-button-primary {
          box-shadow: 0 4px 20px rgba(255, 215, 0, 0.35);
        }
        
        .dark .buyer-theme-smmvisit .theme-button-primary:hover {
          box-shadow: 0 6px 30px rgba(255, 215, 0, 0.5);
        }
        
        /* Dark mode dashboard elements */
        .dark .buyer-theme-smmvisit .glass-card,
        .dark .buyer-theme-smmvisit [class*="Card"] {
          background: #262626 !important;
          border-color: rgba(255, 215, 0, 0.15) !important;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3) !important;
        }
        
        .dark .buyer-theme-smmvisit .glass-sidebar {
          background: rgba(26, 26, 26, 0.98) !important;
          border-color: rgba(255, 215, 0, 0.1) !important;
          box-shadow: 2px 0 20px rgba(0, 0, 0, 0.4) !important;
        }
        
        .dark .buyer-theme-smmvisit input,
        .dark .buyer-theme-smmvisit textarea,
        .dark .buyer-theme-smmvisit select {
          background: #1A1A1A !important;
          border-color: rgba(255, 215, 0, 0.2) !important;
          color: #FFFFFF !important;
        }
        
        .dark .buyer-theme-smmvisit input::placeholder,
        .dark .buyer-theme-smmvisit textarea::placeholder {
          color: #6B7280 !important;
        }
        
        .dark .buyer-theme-smmvisit input:focus,
        .dark .buyer-theme-smmvisit textarea:focus,
        .dark .buyer-theme-smmvisit select:focus {
          border-color: #FFD700 !important;
          box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.25) !important;
        }
        
        .dark .buyer-theme-smmvisit table {
          background: #262626 !important;
        }
        
        .dark .buyer-theme-smmvisit thead {
          background: rgba(255, 215, 0, 0.1) !important;
        }
        
        .dark .buyer-theme-smmvisit tbody tr:hover {
          background: rgba(255, 215, 0, 0.08) !important;
        }
        
        .dark .buyer-theme-smmvisit .nav-item.active,
        .dark .buyer-theme-smmvisit .nav-item:hover {
          background: rgba(255, 215, 0, 0.15) !important;
        }
        
        /* Dark mode text colors */
        .dark .buyer-theme-smmvisit h1,
        .dark .buyer-theme-smmvisit h2,
        .dark .buyer-theme-smmvisit h3,
        .dark .buyer-theme-smmvisit h4,
        .dark .buyer-theme-smmvisit h5,
        .dark .buyer-theme-smmvisit h6 {
          color: #FFFFFF;
        }
        
        .dark .buyer-theme-smmvisit p,
        .dark .buyer-theme-smmvisit span:not(.theme-gradient-text) {
          color: #D1D5DB;
        }
        
        .dark .buyer-theme-smmvisit .text-muted-foreground {
          color: #9CA3AF !important;
        }
        
        /* Dark mode badges */
        .dark .buyer-theme-smmvisit [class*="Badge"],
        .dark .buyer-theme-smmvisit .badge {
          background: rgba(255, 215, 0, 0.2) !important;
          color: #FFD700 !important;
          border-color: rgba(255, 215, 0, 0.3) !important;
        }
        
        /* Dark mode footer */
        .dark .buyer-theme-smmvisit footer {
          background: linear-gradient(180deg, #1A1A1A 0%, #141414 100%) !important;
          border-top: 1px solid rgba(255, 215, 0, 0.1) !important;
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