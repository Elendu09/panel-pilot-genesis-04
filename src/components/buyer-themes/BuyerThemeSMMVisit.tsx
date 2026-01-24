import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BuyerThemeSMMVisitProps {
  children: ReactNode;
  className?: string;
  themeMode?: 'light' | 'dark';
}

// SMMVisit Theme: Light gray with yellow/gold accents - Uses unified variable system
export const BuyerThemeSMMVisit = ({ children, className, themeMode = 'light' }: BuyerThemeSMMVisitProps) => {
  return (
    <div className={themeMode === 'light' ? 'light' : 'dark'}>
      <div 
        className={cn(
          "buyer-theme-smmvisit buyer-theme-wrapper min-h-screen font-sans",
          className
        )}
      >
      <style>{`
        /* ===== SMMVISIT THEME-SPECIFIC STYLES ===== */
        /* Base unified variables are inherited from buyer-theme-variables.css */
        
        /* Legacy variable aliases for compatibility */
        .buyer-theme-smmvisit {
          --theme-gradient: linear-gradient(135deg, #FFD700 0%, #FFC107 100%);
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
        
        /* Theme-specific component styles */
        .buyer-theme-smmvisit .theme-card {
          background: #FFFFFF;
          border: 1px solid #E5E7EB;
          border-radius: 1rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }
        
        .buyer-theme-smmvisit .theme-card:hover {
          box-shadow: 0 8px 24px rgba(255, 215, 0, 0.15);
          border-color: #FFD700;
          transform: translateY(-4px);
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
          background: #FFFFFF;
          box-shadow: 0 2px 20px rgba(0, 0, 0, 0.05);
          border-bottom: 1px solid #E5E7EB;
        }
        
        .buyer-theme-smmvisit .theme-hero {
          background: linear-gradient(180deg, #FFFBEB 0%, #F5F5F5 100%);
        }
        
        .buyer-theme-smmvisit .theme-badge {
          background: rgba(255, 215, 0, 0.15);
          color: #B8860B;
          font-weight: 600;
        }
        
        /* ===== DARK MODE OVERRIDES ===== */
        .dark .buyer-theme-smmvisit {
          background: linear-gradient(180deg, #1C1F26 0%, #171A20 100%);
          --panel-nav-active-text: #FFD700;
        }
        
        .dark .buyer-theme-smmvisit .theme-card {
          background: #262A33;
          border: 1px solid rgba(255, 215, 0, 0.15);
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.25);
        }
        
        .dark .buyer-theme-smmvisit .theme-card:hover {
          box-shadow: 0 8px 32px rgba(255, 215, 0, 0.1);
          border-color: rgba(255, 215, 0, 0.3);
        }
        
        .dark .buyer-theme-smmvisit .theme-nav {
          background: rgba(28, 31, 38, 0.95);
          backdrop-filter: blur(12px);
          border-color: rgba(255, 215, 0, 0.1);
          box-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
        }
        
        .dark .buyer-theme-smmvisit .theme-hero {
          background: radial-gradient(ellipse at top, rgba(255, 215, 0, 0.08) 0%, transparent 50%);
        }
        
        .dark .buyer-theme-smmvisit .theme-button-primary {
          box-shadow: 0 4px 20px rgba(255, 215, 0, 0.35);
        }
        
        .dark .buyer-theme-smmvisit .theme-button-primary:hover {
          box-shadow: 0 6px 30px rgba(255, 215, 0, 0.5);
        }
        
        .dark .buyer-theme-smmvisit .theme-badge {
          background: rgba(255, 215, 0, 0.15);
          color: #FFD700;
        }
        
        /* Premium dark mode gold shimmer for skeletons */
        @keyframes gold-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        .dark .buyer-theme-smmvisit .skeleton,
        .dark .buyer-theme-smmvisit [class*="Skeleton"] {
          background: linear-gradient(
            90deg,
            #262A33,
            rgba(255, 215, 0, 0.15),
            #262A33
          ) !important;
          background-size: 200% 100%;
          animation: gold-shimmer 1.5s infinite;
        }
        
        /* Dark mode scrollbar with gold tint */
        .dark .buyer-theme-smmvisit ::-webkit-scrollbar-thumb {
          background: rgba(255, 215, 0, 0.25);
          border-radius: 4px;
        }
        
        .dark .buyer-theme-smmvisit ::-webkit-scrollbar-track {
          background: rgba(255, 215, 0, 0.05);
        }
      `}</style>
        {children}
      </div>
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
      background: '#1C1F26',
      surface: '#262A33',
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
    heroStyle: 'clean',
    cardStyle: 'rounded',
    navStyle: 'clean',
    spacing: 'comfortable',
  },
};

export default BuyerThemeSMMVisit;
