import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BuyerThemeAliPanelProps {
  children: ReactNode;
  className?: string;
  themeMode?: 'light' | 'dark';
}

// AliPanel Theme: Dark with pink-to-orange gradients, 3D floating icons
export const BuyerThemeAliPanel = ({ children, className, themeMode = 'dark' }: BuyerThemeAliPanelProps) => {
  return (
    <div className={themeMode === 'light' ? 'light' : 'dark'}>
      <div 
        className={cn(
          "buyer-theme-alipanel buyer-theme-wrapper min-h-screen font-poppins",
          className
        )}
      >
      <style>{`
        /* ===== ALIPANEL THEME-SPECIFIC STYLES ===== */
        /* Base unified variables are inherited from buyer-theme-variables.css */
        
        /* Legacy variable aliases for compatibility */
        .buyer-theme-alipanel {
          --theme-gradient: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 50%, #FFCC70 100%);
          --theme-glow: 0 0 40px rgba(255, 107, 107, 0.3);
          --panel-primary: #FF6B6B;
          --panel-secondary: #FF8E53;
          --panel-accent: #FFCC70;
          --panel-gradient: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
          --panel-gradient-accent: linear-gradient(135deg, #FF6B6B 0%, #FFCC70 100%);
          --panel-glow: 0 0 20px rgba(255, 107, 107, 0.4);
          --panel-glow-lg: 0 0 40px rgba(255, 107, 107, 0.3);
          --panel-nav-active-bg: rgba(255, 107, 107, 0.2);
          --panel-nav-active-text: #FF6B6B;
          --panel-bottom-nav-center-gradient: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
          --step-active: #FF6B6B;
          --step-completed: #FF6B6B;
          --step-glow: 0 0 16px rgba(255, 107, 107, 0.6);
        }
        
        /* Theme-specific component styles */
        .buyer-theme-alipanel .theme-card {
          background: rgba(20, 20, 20, 0.8);
          border: 1px solid rgba(255, 107, 107, 0.1);
          backdrop-filter: blur(10px);
        }
        
        .buyer-theme-alipanel .theme-button-primary {
          background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
          box-shadow: 0 4px 20px rgba(255, 107, 107, 0.4);
          border: none;
          color: white;
          font-weight: 600;
        }
        
        .buyer-theme-alipanel .theme-button-primary:hover {
          box-shadow: 0 6px 30px rgba(255, 107, 107, 0.6);
          transform: translateY(-2px);
        }
        
        .buyer-theme-alipanel .theme-gradient-text {
          background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 50%, #FFCC70 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .buyer-theme-alipanel .theme-icon-box {
          background: linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(255, 142, 83, 0.1));
          border: 1px solid rgba(255, 107, 107, 0.2);
          box-shadow: 0 8px 32px rgba(255, 107, 107, 0.15);
        }
        
        .buyer-theme-alipanel .theme-nav {
          background: rgba(10, 10, 10, 0.9);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 107, 107, 0.1);
        }
        
        .buyer-theme-alipanel .theme-hero {
          background: radial-gradient(ellipse at top, rgba(255, 107, 107, 0.15) 0%, transparent 50%),
                      radial-gradient(ellipse at bottom right, rgba(255, 142, 83, 0.1) 0%, transparent 50%);
        }
        
        /* ===== LIGHT MODE OVERRIDES ===== */
        .light .buyer-theme-alipanel {
          background: linear-gradient(180deg, #FFFBFB 0%, #FFF5F5 100%);
          --panel-nav-active-text: #FF6B6B;
        }
        
        .light .buyer-theme-alipanel .theme-card {
          background: #FFFFFF;
          border: 1px solid rgba(255, 107, 107, 0.15);
          box-shadow: 0 4px 20px rgba(255, 107, 107, 0.08);
        }
        
        .light .buyer-theme-alipanel .theme-nav {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 107, 107, 0.12);
        }
        
        .light .buyer-theme-alipanel .theme-hero {
          background: linear-gradient(180deg, #FFF0F0 0%, #FFFBFB 100%);
        }
        
        .light .buyer-theme-alipanel .theme-button-primary {
          box-shadow: 0 4px 20px rgba(255, 107, 107, 0.25);
        }
      `}</style>
        {children}
      </div>
    </div>
  );
};

// Theme configuration for database storage
export const aliPanelThemeConfig = {
  key: 'alipanel',
  name: 'AliPanel',
  description: 'Dark with pink-to-orange gradients and 3D effects',
  fonts: {
    heading: 'Poppins',
    body: 'Poppins',
  },
  colors: {
    dark: {
      background: '#0A0A0A',
      surface: '#141414',
      primary: '#FF6B6B',
      secondary: '#FF8E53',
      accent: '#FFCC70',
      text: '#FFFFFF',
      muted: '#A1A1AA',
    },
    light: {
      background: '#FFFBFB',
      surface: '#FFFFFF',
      primary: '#FF6B6B',
      secondary: '#FF8E53',
      accent: '#FFCC70',
      text: '#1A1A1A',
      muted: '#6B7280',
    },
  },
  layout: {
    heroStyle: '3d-floating',
    cardStyle: 'glass-glow',
    navStyle: 'blur-dark',
    spacing: 'spacious',
  },
};

export default BuyerThemeAliPanel;
