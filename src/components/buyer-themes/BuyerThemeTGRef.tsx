import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BuyerThemeTGRefProps {
  children: ReactNode;
  className?: string;
  themeMode?: 'light' | 'dark';
}

// TGRef Theme: Dark blue-gray with teal/cyan gradients, tech/monospace feel
export const BuyerThemeTGRef = ({ children, className, themeMode = 'dark' }: BuyerThemeTGRefProps) => {
  return (
    <div className={themeMode === 'light' ? 'light' : 'dark'}>
      <div 
        className={cn(
          "buyer-theme-tgref buyer-theme-wrapper min-h-screen",
          className
        )}
      >
      <style>{`
        /* ===== TGREF THEME-SPECIFIC STYLES ===== */
        /* Base unified variables are inherited from buyer-theme-variables.css */
        
        /* Legacy variable aliases for compatibility */
        .buyer-theme-tgref {
          --theme-gradient: linear-gradient(135deg, #00D4AA 0%, #0EA5E9 50%, #7C3AED 100%);
          --panel-primary: #00D4AA;
          --panel-secondary: #0EA5E9;
          --panel-accent: #7C3AED;
          --panel-gradient: linear-gradient(135deg, #00D4AA 0%, #0EA5E9 100%);
          --panel-gradient-accent: linear-gradient(135deg, #00D4AA 0%, #7C3AED 100%);
          --panel-glow: 0 0 20px rgba(0, 212, 170, 0.4);
          --panel-glow-lg: 0 0 40px rgba(0, 212, 170, 0.3);
          --panel-nav-active-bg: rgba(0, 212, 170, 0.15);
          --panel-nav-active-text: #00D4AA;
          --panel-bottom-nav-center-gradient: linear-gradient(135deg, #00D4AA 0%, #0EA5E9 100%);
          --step-active: #00D4AA;
          --step-completed: #00D4AA;
          --step-glow: 0 0 16px rgba(0, 212, 170, 0.6);
          font-family: 'Inter', sans-serif;
        }
        
        /* Monospace for code elements */
        .buyer-theme-tgref code,
        .buyer-theme-tgref .theme-mono {
          font-family: 'Space Mono', 'JetBrains Mono', monospace;
        }
        
        /* Theme-specific component styles */
        .buyer-theme-tgref .theme-card {
          background: #24283B;
          border: 1px solid rgba(0, 212, 170, 0.15);
          border-radius: 8px;
          position: relative;
        }
        
        .buyer-theme-tgref .theme-card::before {
          content: '[ ';
          position: absolute;
          top: 8px;
          left: 8px;
          color: #00D4AA;
          font-family: 'Space Mono', monospace;
          font-size: 12px;
          opacity: 0.5;
        }
        
        .buyer-theme-tgref .theme-card::after {
          content: ' ]';
          position: absolute;
          bottom: 8px;
          right: 8px;
          color: #00D4AA;
          font-family: 'Space Mono', monospace;
          font-size: 12px;
          opacity: 0.5;
        }
        
        .buyer-theme-tgref .theme-button-primary {
          background: transparent;
          border: 1px solid #00D4AA;
          color: #00D4AA;
          font-family: 'Space Mono', monospace;
          font-size: 14px;
          position: relative;
          border-radius: 4px;
        }
        
        .buyer-theme-tgref .theme-button-primary::before {
          content: '>';
          margin-right: 8px;
          opacity: 0;
          transition: opacity 0.2s;
        }
        
        .buyer-theme-tgref .theme-button-primary:hover::before {
          opacity: 1;
        }
        
        .buyer-theme-tgref .theme-button-primary:hover {
          background: rgba(0, 212, 170, 0.1);
          box-shadow: 0 0 20px rgba(0, 212, 170, 0.3);
        }
        
        .buyer-theme-tgref .theme-button-filled {
          background: linear-gradient(135deg, #00D4AA 0%, #0EA5E9 100%);
          border: none;
          color: #1A1B26;
          font-weight: 600;
        }
        
        .buyer-theme-tgref .theme-gradient-text {
          background: linear-gradient(135deg, #00D4AA 0%, #0EA5E9 50%, #7C3AED 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .buyer-theme-tgref .theme-icon-box {
          background: rgba(0, 212, 170, 0.1);
          border: 1px solid rgba(0, 212, 170, 0.3);
          border-radius: 8px;
        }
        
        .buyer-theme-tgref .theme-nav {
          background: rgba(26, 27, 38, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(0, 212, 170, 0.1);
        }
        
        .buyer-theme-tgref .theme-hero {
          background: 
            linear-gradient(180deg, rgba(0, 212, 170, 0.05) 0%, transparent 50%),
            repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(0, 212, 170, 0.03) 50px, rgba(0, 212, 170, 0.03) 51px);
        }
        
        .buyer-theme-tgref .theme-terminal {
          background: #1A1B26;
          border: 1px solid rgba(0, 212, 170, 0.2);
          border-radius: 8px;
          padding: 16px;
          font-family: 'Space Mono', monospace;
        }
        
        .buyer-theme-tgref .theme-terminal::before {
          content: '$ ';
          color: #00D4AA;
        }
        
        /* ===== LIGHT MODE OVERRIDES ===== */
        .light .buyer-theme-tgref {
          background: linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%);
          --panel-nav-active-text: #00A88A;
        }
        
        .light .buyer-theme-tgref .theme-card {
          background: #FFFFFF;
          border: 1px solid rgba(0, 212, 170, 0.2);
          box-shadow: 0 4px 20px rgba(0, 212, 170, 0.06);
        }
        
        .light .buyer-theme-tgref .theme-card::before,
        .light .buyer-theme-tgref .theme-card::after {
          color: #00A88A;
          opacity: 0.7;
        }
        
        .light .buyer-theme-tgref .theme-nav {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(0, 212, 170, 0.15);
        }
        
        .light .buyer-theme-tgref .theme-hero {
          background: 
            linear-gradient(180deg, rgba(0, 212, 170, 0.08) 0%, transparent 50%),
            repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(0, 212, 170, 0.03) 50px, rgba(0, 212, 170, 0.03) 51px);
        }
        
        .light .buyer-theme-tgref .theme-button-primary {
          border-color: #00A88A;
          color: #00A88A;
        }
        
        .light .buyer-theme-tgref .theme-button-primary:hover {
          background: rgba(0, 212, 170, 0.08);
        }
        
        .light .buyer-theme-tgref .theme-terminal {
          background: #F1F5F9;
          border-color: rgba(0, 212, 170, 0.25);
          color: #1E293B;
        }
      `}</style>
        {children}
      </div>
    </div>
  );
};

// Theme configuration for database storage
export const tgRefThemeConfig = {
  key: 'tgref',
  name: 'TGRef',
  description: 'Tech-inspired with teal accents and monospace elements',
  fonts: {
    heading: 'Inter',
    body: 'Inter',
    mono: 'Space Mono',
  },
  colors: {
    dark: {
      background: '#1A1B26',
      surface: '#24283B',
      primary: '#00D4AA',
      secondary: '#0EA5E9',
      accent: '#7C3AED',
      text: '#C0CAF5',
      muted: '#565F89',
    },
    light: {
      background: '#F8FAFC',
      surface: '#FFFFFF',
      primary: '#00D4AA',
      secondary: '#0EA5E9',
      accent: '#7C3AED',
      text: '#1E293B',
      muted: '#64748B',
    },
  },
  layout: {
    heroStyle: 'terminal',
    cardStyle: 'bracketed',
    navStyle: 'blur-dark',
    spacing: 'compact',
  },
};

export default BuyerThemeTGRef;
