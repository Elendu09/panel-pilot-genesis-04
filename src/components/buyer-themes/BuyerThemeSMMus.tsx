import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BuyerThemeSMMusProps {
  children: ReactNode;
  className?: string;
}

// SMMus Theme: Dark navy with purple primary and green accents, playful bubbles
export const BuyerThemeSMMus = ({ children, className }: BuyerThemeSMMusProps) => {
  return (
    <div 
      className={cn(
        "buyer-theme-smmus min-h-screen font-outfit",
        className
      )}
    >
      <style>{`
        .buyer-theme-smmus {
          --theme-background: #0F0F1A;
          --theme-surface: #1A1A2E;
          --theme-primary: #8B5CF6;
          --theme-secondary: #A78BFA;
          --theme-accent: #10B981;
          --theme-text: #FFFFFF;
          --theme-muted: #9CA3AF;
          --theme-gradient: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 50%, #10B981 100%);
          background: var(--theme-background);
          color: var(--theme-text);
        }
        
        .buyer-theme-smmus .theme-card {
          background: linear-gradient(145deg, rgba(26, 26, 46, 0.9), rgba(15, 15, 26, 0.9));
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 24px;
          overflow: hidden;
          position: relative;
        }
        
        .buyer-theme-smmus .theme-card::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%);
          pointer-events: none;
        }
        
        .buyer-theme-smmus .theme-button-primary {
          background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%);
          border: none;
          color: white;
          font-weight: 600;
          border-radius: 16px;
          box-shadow: 0 4px 24px rgba(139, 92, 246, 0.4);
        }
        
        .buyer-theme-smmus .theme-button-primary:hover {
          box-shadow: 0 8px 40px rgba(139, 92, 246, 0.6);
          transform: translateY(-2px) scale(1.02);
        }
        
        .buyer-theme-smmus .theme-button-secondary {
          background: linear-gradient(135deg, #10B981 0%, #34D399 100%);
          border: none;
          color: white;
          font-weight: 600;
          border-radius: 16px;
        }
        
        .buyer-theme-smmus .theme-gradient-text {
          background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 50%, #10B981 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .buyer-theme-smmus .theme-icon-box {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(16, 185, 129, 0.1));
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(139, 92, 246, 0.15);
        }
        
        .buyer-theme-smmus .theme-nav {
          background: rgba(15, 15, 26, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(139, 92, 246, 0.1);
        }
        
        .buyer-theme-smmus .theme-hero {
          background: 
            radial-gradient(ellipse at top left, rgba(139, 92, 246, 0.15) 0%, transparent 40%),
            radial-gradient(ellipse at bottom right, rgba(16, 185, 129, 0.1) 0%, transparent 40%);
        }
        
        .buyer-theme-smmus .theme-bubble {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(16, 185, 129, 0.2));
          filter: blur(40px);
          pointer-events: none;
        }
        
        .buyer-theme-smmus .theme-feature-pill {
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 999px;
          padding: 8px 16px;
          font-size: 14px;
          color: #A78BFA;
        }
        
        .buyer-theme-smmus .theme-accent-badge {
          background: linear-gradient(135deg, #10B981 0%, #34D399 100%);
          color: white;
          border-radius: 8px;
          padding: 4px 12px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .light .buyer-theme-smmus {
          --theme-background: #FAFBFF;
          --theme-surface: #FFFFFF;
          --theme-text: #1A1A2E;
          --theme-muted: #6B7280;
        }
        
        .light .buyer-theme-smmus .theme-card {
          background: white;
          border-color: rgba(139, 92, 246, 0.15);
          box-shadow: 0 4px 24px rgba(139, 92, 246, 0.08);
        }
      `}</style>
      {children}
    </div>
  );
};

// Theme configuration for database storage
export const smmusThemeConfig = {
  key: 'smmus',
  name: 'SMMus',
  description: 'Playful purple-green with bubbles and rounded elements',
  fonts: {
    heading: 'Outfit',
    body: 'Outfit',
  },
  colors: {
    dark: {
      background: '#0F0F1A',
      surface: '#1A1A2E',
      primary: '#8B5CF6',
      secondary: '#A78BFA',
      accent: '#10B981',
      text: '#FFFFFF',
      muted: '#9CA3AF',
    },
    light: {
      background: '#FAFBFF',
      surface: '#FFFFFF',
      primary: '#8B5CF6',
      secondary: '#A78BFA',
      accent: '#10B981',
      text: '#1A1A2E',
      muted: '#6B7280',
    },
  },
  layout: {
    heroStyle: 'bubbles',
    cardStyle: 'gradient-glass',
    navStyle: 'blur-dark',
    spacing: 'playful',
  },
};

export default BuyerThemeSMMus;
