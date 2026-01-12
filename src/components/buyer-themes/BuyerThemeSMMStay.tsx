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
        
        /* Dashboard elements - Dark mode */
        .buyer-theme-smmstay .glass-card,
        .buyer-theme-smmstay [class*="Card"] {
          background: #0D0D0D !important;
          border: 1px solid rgba(255, 64, 129, 0.2) !important;
        }
        
        .buyer-theme-smmstay .glass-sidebar {
          background: rgba(0, 0, 0, 0.98) !important;
          border-color: rgba(255, 64, 129, 0.15) !important;
        }
        
        .buyer-theme-smmstay input,
        .buyer-theme-smmstay textarea,
        .buyer-theme-smmstay select {
          background: #0D0D0D !important;
          border: 2px solid rgba(255, 64, 129, 0.2) !important;
          color: #FFFFFF !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
        }
        
        .buyer-theme-smmstay input::placeholder,
        .buyer-theme-smmstay textarea::placeholder {
          color: #6B7280 !important;
          text-transform: uppercase !important;
        }
        
        .buyer-theme-smmstay input:focus,
        .buyer-theme-smmstay textarea:focus,
        .buyer-theme-smmstay select:focus {
          border-color: #FF4081 !important;
          box-shadow: 0 0 20px rgba(255, 64, 129, 0.3) !important;
        }
        
        .buyer-theme-smmstay table {
          background: #0D0D0D !important;
        }
        
        .buyer-theme-smmstay thead {
          background: rgba(255, 64, 129, 0.1) !important;
          text-transform: uppercase !important;
          letter-spacing: 1px !important;
        }
        
        .buyer-theme-smmstay tbody tr:hover {
          background: rgba(255, 64, 129, 0.08) !important;
        }
        
        /* ===== COMPREHENSIVE LIGHT MODE ===== */
        .light .buyer-theme-smmstay {
          --theme-background: #FFFAFC;
          --theme-surface: #FFFFFF;
          --theme-text: #1A1A1A;
          --theme-muted: #6B7280;
          --panel-nav-active-text: #FF4081;
        }
        
        .light .buyer-theme-smmstay {
          background: linear-gradient(180deg, #FFFAFC 0%, #FFF0F5 100%);
        }
        
        .light .buyer-theme-smmstay .theme-card {
          background: #FFFFFF;
          border: 2px solid rgba(255, 64, 129, 0.15);
          box-shadow: 0 4px 24px rgba(255, 64, 129, 0.08);
        }
        
        .light .buyer-theme-smmstay .theme-card::before {
          filter: blur(30px);
          opacity: 0.5;
        }
        
        .light .buyer-theme-smmstay .theme-nav {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 2px solid rgba(255, 64, 129, 0.1);
        }
        
        .light .buyer-theme-smmstay .theme-hero {
          background: radial-gradient(ellipse at center, rgba(255, 64, 129, 0.08) 0%, transparent 60%);
        }
        
        .light .buyer-theme-smmstay .theme-button-primary {
          border-color: #FF4081;
          color: #FF4081;
        }
        
        .light .buyer-theme-smmstay .theme-button-primary:hover {
          background: #FF4081;
          color: white;
          box-shadow: 0 0 30px rgba(255, 64, 129, 0.4);
        }
        
        /* Light mode dashboard elements */
        .light .buyer-theme-smmstay .glass-card,
        .light .buyer-theme-smmstay [class*="Card"] {
          background: #FFFFFF !important;
          border: 2px solid rgba(255, 64, 129, 0.12) !important;
          box-shadow: 0 4px 24px rgba(255, 64, 129, 0.06) !important;
        }
        
        .light .buyer-theme-smmstay .glass-sidebar {
          background: #FFFFFF !important;
          border-color: rgba(255, 64, 129, 0.1) !important;
          box-shadow: 2px 0 24px rgba(255, 64, 129, 0.05) !important;
        }
        
        .light .buyer-theme-smmstay input,
        .light .buyer-theme-smmstay textarea,
        .light .buyer-theme-smmstay select {
          background: #FFFFFF !important;
          border: 2px solid rgba(255, 64, 129, 0.15) !important;
          color: #1A1A1A !important;
        }
        
        .light .buyer-theme-smmstay input::placeholder,
        .light .buyer-theme-smmstay textarea::placeholder {
          color: #9CA3AF !important;
        }
        
        .light .buyer-theme-smmstay table {
          background: #FFFFFF !important;
        }
        
        .light .buyer-theme-smmstay thead {
          background: rgba(255, 64, 129, 0.08) !important;
        }
        
        .light .buyer-theme-smmstay tbody tr:hover {
          background: rgba(255, 64, 129, 0.04) !important;
        }
        
        .light .buyer-theme-smmstay .nav-item.active,
        .light .buyer-theme-smmstay .nav-item:hover {
          background: rgba(255, 64, 129, 0.1) !important;
        }
        
        /* Light mode text colors */
        .light .buyer-theme-smmstay h1,
        .light .buyer-theme-smmstay h2,
        .light .buyer-theme-smmstay h3,
        .light .buyer-theme-smmstay h4,
        .light .buyer-theme-smmstay h5,
        .light .buyer-theme-smmstay h6 {
          color: #1A1A1A;
        }
        
        .light .buyer-theme-smmstay p,
        .light .buyer-theme-smmstay span:not(.theme-gradient-text):not(.theme-outline-text) {
          color: #374151;
        }
        
        .light .buyer-theme-smmstay .text-muted-foreground {
          color: #6B7280 !important;
        }
        
        .light .buyer-theme-smmstay .theme-outline-text {
          -webkit-text-stroke-color: #FF4081;
        }
        
        /* Light mode badges */
        .light .buyer-theme-smmstay [class*="Badge"],
        .light .buyer-theme-smmstay .badge {
          background: rgba(255, 64, 129, 0.1) !important;
          color: #FF4081 !important;
          border: 2px solid rgba(255, 64, 129, 0.2) !important;
          text-transform: uppercase !important;
          letter-spacing: 1px !important;
        }
        
        /* Light mode footer */
        .light .buyer-theme-smmstay footer {
          background: linear-gradient(180deg, #FFFAFC 0%, #FFF0F5 100%) !important;
          border-top: 2px solid rgba(255, 64, 129, 0.1) !important;
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
      background: '#FFFAFC',
      surface: '#FFFFFF',
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