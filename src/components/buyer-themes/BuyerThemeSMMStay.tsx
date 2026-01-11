import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BuyerThemeSMMStayProps {
  children: ReactNode;
  className?: string;
}

// SMMStay Theme: Deep black with hot pink neon accents, bold typography
export const BuyerThemeSMMStay = ({ children, className }: BuyerThemeSMMStayProps) => {
  return (
    <div 
      className={cn(
        "buyer-theme-smmstay buyer-theme-wrapper min-h-screen font-montserrat",
        className
      )}
    >
      <style>{`
        .buyer-theme-smmstay {
          --theme-background: #000000;
          --theme-surface: #0D0D0D;
          --theme-primary: #FF4081;
          --theme-secondary: #FF80AB;
          --theme-accent: #E040FB;
          --theme-text: #FFFFFF;
          --theme-muted: #9E9E9E;
          --theme-gradient: linear-gradient(135deg, #FF4081 0%, #E040FB 100%);
          --theme-glow: 0 0 60px rgba(255, 64, 129, 0.5);
          background: var(--theme-background);
          color: var(--theme-text);
        }
        
        /* Override panel variables for this theme */
        .buyer-theme-smmstay {
          --panel-primary: #FF4081;
          --panel-secondary: #FF80AB;
          --panel-accent: #E040FB;
          --panel-gradient: linear-gradient(135deg, #FF4081 0%, #E040FB 100%);
          --panel-gradient-accent: linear-gradient(135deg, #FF4081 0%, #FF80AB 100%);
          --panel-glow: 0 0 20px rgba(255, 64, 129, 0.5);
          --panel-glow-lg: 0 0 60px rgba(255, 64, 129, 0.4);
          --panel-nav-active-bg: rgba(255, 64, 129, 0.2);
          --panel-nav-active-text: #FF4081;
          --panel-bottom-nav-center-gradient: linear-gradient(135deg, #FF4081 0%, #E040FB 100%);
          --step-active: #FF4081;
          --step-completed: #FF4081;
          --step-glow: 0 0 16px rgba(255, 64, 129, 0.6);
        }
        
        .buyer-theme-smmstay .theme-card {
          background: #0D0D0D;
          border: 2px solid transparent;
          border-image: linear-gradient(135deg, rgba(255, 64, 129, 0.3), rgba(224, 64, 251, 0.3)) 1;
          position: relative;
        }
        
        .buyer-theme-smmstay .theme-card::before {
          content: '';
          position: absolute;
          inset: -2px;
          background: linear-gradient(135deg, rgba(255, 64, 129, 0.1), rgba(224, 64, 251, 0.1));
          z-index: -1;
          filter: blur(20px);
        }
        
        .buyer-theme-smmstay .theme-button-primary {
          background: transparent;
          border: 2px solid #FF4081;
          color: #FF4081;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 2px;
          position: relative;
          overflow: hidden;
        }
        
        .buyer-theme-smmstay .theme-button-primary:hover {
          background: #FF4081;
          color: white;
          box-shadow: 0 0 40px rgba(255, 64, 129, 0.6);
        }
        
        .buyer-theme-smmstay .theme-button-filled {
          background: linear-gradient(135deg, #FF4081 0%, #E040FB 100%);
          border: none;
          color: white;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .buyer-theme-smmstay .theme-gradient-text {
          background: linear-gradient(135deg, #FF4081 0%, #FF80AB 50%, #E040FB 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 800;
        }
        
        .buyer-theme-smmstay .theme-outline-text {
          color: transparent;
          -webkit-text-stroke: 2px #FF4081;
          font-weight: 800;
        }
        
        .buyer-theme-smmstay .theme-icon-box {
          background: transparent;
          border: 2px solid rgba(255, 64, 129, 0.5);
          box-shadow: 0 0 30px rgba(255, 64, 129, 0.2);
        }
        
        .buyer-theme-smmstay .theme-nav {
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 64, 129, 0.2);
        }
        
        .buyer-theme-smmstay .theme-hero {
          background: radial-gradient(ellipse at center, rgba(255, 64, 129, 0.1) 0%, transparent 60%);
        }
        
        .buyer-theme-smmstay h1,
        .buyer-theme-smmstay h2,
        .buyer-theme-smmstay h3 {
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .light .buyer-theme-smmstay {
          --theme-background: #FFFFFF;
          --theme-surface: #FFF0F5;
          --theme-text: #1A1A1A;
          --theme-muted: #6B7280;
        }
        
        .light .buyer-theme-smmstay .theme-card {
          background: #FFF0F5;
        }
        
        .light .buyer-theme-smmstay .theme-nav {
          background: rgba(255, 255, 255, 0.95);
          border-bottom: 1px solid rgba(255, 64, 129, 0.15);
        }
      `}</style>
      {children}
    </div>
  );
};

// Theme configuration for database storage
export const smmStayThemeConfig = {
  key: 'smmstay',
  name: 'SMMStay',
  description: 'Bold black with hot pink neon and uppercase typography',
  fonts: {
    heading: 'Montserrat',
    body: 'Montserrat',
  },
  colors: {
    dark: {
      background: '#000000',
      surface: '#0D0D0D',
      primary: '#FF4081',
      secondary: '#FF80AB',
      accent: '#E040FB',
      text: '#FFFFFF',
      muted: '#9E9E9E',
    },
    light: {
      background: '#FFFFFF',
      surface: '#FFF0F5',
      primary: '#FF4081',
      secondary: '#FF80AB',
      accent: '#E040FB',
      text: '#1A1A1A',
      muted: '#6B7280',
    },
  },
  layout: {
    heroStyle: 'neon-glow',
    cardStyle: 'bordered-glow',
    navStyle: 'blur-dark',
    spacing: 'bold',
  },
};

export default BuyerThemeSMMStay;