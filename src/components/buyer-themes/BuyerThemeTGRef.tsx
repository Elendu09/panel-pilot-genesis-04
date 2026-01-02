import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BuyerThemeTGRefProps {
  children: ReactNode;
  className?: string;
}

// TGRef Theme: Dark blue-gray with teal/cyan gradients, tech/monospace feel
export const BuyerThemeTGRef = ({ children, className }: BuyerThemeTGRefProps) => {
  return (
    <div 
      className={cn(
        "buyer-theme-tgref min-h-screen",
        className
      )}
    >
      <style>{`
        .buyer-theme-tgref {
          --theme-background: #1A1B26;
          --theme-surface: #24283B;
          --theme-primary: #00D4AA;
          --theme-secondary: #0EA5E9;
          --theme-accent: #7C3AED;
          --theme-text: #C0CAF5;
          --theme-muted: #565F89;
          --theme-gradient: linear-gradient(135deg, #00D4AA 0%, #0EA5E9 50%, #7C3AED 100%);
          background: var(--theme-background);
          color: var(--theme-text);
          font-family: 'Inter', sans-serif;
        }
        
        .buyer-theme-tgref code,
        .buyer-theme-tgref .theme-mono {
          font-family: 'Space Mono', 'JetBrains Mono', monospace;
        }
        
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
        
        .light .buyer-theme-tgref {
          --theme-background: #F8FAFC;
          --theme-surface: #FFFFFF;
          --theme-text: #1E293B;
          --theme-muted: #64748B;
        }
        
        .light .buyer-theme-tgref .theme-card {
          background: white;
          border-color: rgba(0, 212, 170, 0.2);
        }
      `}</style>
      {children}
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
