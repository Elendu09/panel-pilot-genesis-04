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
        .buyer-theme-alipanel {
          --theme-background: #0A0A0A;
          --theme-surface: #141414;
          --theme-primary: #FF6B6B;
          --theme-secondary: #FF8E53;
          --theme-accent: #FF6B9D;
          --theme-text: #FFFFFF;
          --theme-muted: #A1A1AA;
          --theme-gradient: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 50%, #FFCC70 100%);
          --theme-glow: 0 0 40px rgba(255, 107, 107, 0.3);
          background: var(--theme-background);
          color: var(--theme-text);
        }
        
        /* Override panel variables for this theme */
        .buyer-theme-alipanel {
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
        
        /* Dashboard elements - Dark mode */
        .buyer-theme-alipanel .glass-card,
        .buyer-theme-alipanel [class*="Card"] {
          background: rgba(20, 20, 20, 0.8) !important;
          border-color: rgba(255, 107, 107, 0.15) !important;
        }
        
        .buyer-theme-alipanel .glass-sidebar {
          background: rgba(10, 10, 10, 0.95) !important;
          border-color: rgba(255, 107, 107, 0.1) !important;
        }
        
        .buyer-theme-alipanel input,
        .buyer-theme-alipanel textarea,
        .buyer-theme-alipanel select {
          background: rgba(20, 20, 20, 0.9) !important;
          border-color: rgba(255, 107, 107, 0.2) !important;
          color: #FFFFFF !important;
        }
        
        .buyer-theme-alipanel input::placeholder,
        .buyer-theme-alipanel textarea::placeholder {
          color: #71717A !important;
        }
        
        .buyer-theme-alipanel input:focus,
        .buyer-theme-alipanel textarea:focus,
        .buyer-theme-alipanel select:focus {
          border-color: #FF6B6B !important;
          box-shadow: 0 0 0 2px rgba(255, 107, 107, 0.2) !important;
        }
        
        .buyer-theme-alipanel table {
          background: rgba(20, 20, 20, 0.5) !important;
        }
        
        .buyer-theme-alipanel thead {
          background: rgba(255, 107, 107, 0.1) !important;
        }
        
        .buyer-theme-alipanel tbody tr:hover {
          background: rgba(255, 107, 107, 0.05) !important;
        }
        
        /* ===== COMPREHENSIVE LIGHT MODE ===== */
        .light .buyer-theme-alipanel {
          --theme-background: #FFFBFB;
          --theme-surface: #FFFFFF;
          --theme-text: #1A1A1A;
          --theme-muted: #6B7280;
          --panel-nav-active-text: #FF6B6B;
        }
        
        .light .buyer-theme-alipanel {
          background: linear-gradient(180deg, #FFFBFB 0%, #FFF5F5 100%);
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
        
        /* Light mode dashboard elements */
        .light .buyer-theme-alipanel .glass-card,
        .light .buyer-theme-alipanel [class*="Card"] {
          background: #FFFFFF !important;
          border-color: rgba(255, 107, 107, 0.12) !important;
          box-shadow: 0 4px 20px rgba(255, 107, 107, 0.06) !important;
        }
        
        .light .buyer-theme-alipanel .glass-sidebar {
          background: #FFFFFF !important;
          border-color: rgba(255, 107, 107, 0.1) !important;
          box-shadow: 2px 0 20px rgba(255, 107, 107, 0.05) !important;
        }
        
        .light .buyer-theme-alipanel input,
        .light .buyer-theme-alipanel textarea,
        .light .buyer-theme-alipanel select {
          background: #FFFFFF !important;
          border-color: rgba(255, 107, 107, 0.2) !important;
          color: #1A1A1A !important;
        }
        
        .light .buyer-theme-alipanel input::placeholder,
        .light .buyer-theme-alipanel textarea::placeholder {
          color: #9CA3AF !important;
        }
        
        .light .buyer-theme-alipanel table {
          background: #FFFFFF !important;
        }
        
        .light .buyer-theme-alipanel thead {
          background: rgba(255, 107, 107, 0.08) !important;
        }
        
        .light .buyer-theme-alipanel tbody tr:hover {
          background: rgba(255, 107, 107, 0.04) !important;
        }
        
        .light .buyer-theme-alipanel .nav-item.active,
        .light .buyer-theme-alipanel .nav-item:hover {
          background: rgba(255, 107, 107, 0.1) !important;
        }
        
        /* Light mode text colors */
        .light .buyer-theme-alipanel h1,
        .light .buyer-theme-alipanel h2,
        .light .buyer-theme-alipanel h3,
        .light .buyer-theme-alipanel h4,
        .light .buyer-theme-alipanel h5,
        .light .buyer-theme-alipanel h6 {
          color: #1A1A1A;
        }
        
        .light .buyer-theme-alipanel p,
        .light .buyer-theme-alipanel span:not(.theme-gradient-text) {
          color: #374151;
        }
        
        .light .buyer-theme-alipanel .text-muted-foreground {
          color: #6B7280 !important;
        }
        
        /* Light mode badges and chips */
        .light .buyer-theme-alipanel [class*="Badge"],
        .light .buyer-theme-alipanel .badge {
          background: rgba(255, 107, 107, 0.1) !important;
          color: #FF6B6B !important;
          border-color: rgba(255, 107, 107, 0.2) !important;
        }
        
        /* Light mode footer */
        .light .buyer-theme-alipanel footer {
          background: linear-gradient(180deg, #FFFBFB 0%, #FFF0F0 100%) !important;
          border-top: 1px solid rgba(255, 107, 107, 0.1) !important;
        }
        
        /* Light mode dropdowns and popovers */
        .light .buyer-theme-alipanel [data-radix-popper-content-wrapper] > div,
        .light .buyer-theme-alipanel [role="listbox"],
        .light .buyer-theme-alipanel [role="menu"] {
          background: #FFFFFF !important;
          border-color: rgba(255, 107, 107, 0.15) !important;
          box-shadow: 0 10px 40px rgba(255, 107, 107, 0.12) !important;
        }
        
        /* Light mode skeleton loading */
        .light .buyer-theme-alipanel .skeleton,
        .light .buyer-theme-alipanel [class*="Skeleton"] {
          background: rgba(255, 107, 107, 0.08) !important;
        }
        
        /* Light mode scrollbar */
        .light .buyer-theme-alipanel ::-webkit-scrollbar-thumb {
          background: rgba(255, 107, 107, 0.3);
        }
        .light .buyer-theme-alipanel ::-webkit-scrollbar-track {
          background: rgba(255, 107, 107, 0.05);
        }
        
        /* Light mode accordion */
        .light .buyer-theme-alipanel [data-state="open"] {
          background: rgba(255, 107, 107, 0.04) !important;
        }
        
        /* Light mode buttons - comprehensive */
        .light .buyer-theme-alipanel button:not(.theme-button-primary):not([class*="gradient"]) {
          color: #1A1A1A;
        }
        
        .light .buyer-theme-alipanel a {
          color: #374151;
        }
        
        .light .buyer-theme-alipanel a:hover {
          color: #FF6B6B;
        }
        
        /* Light mode secondary buttons */
        .light .buyer-theme-alipanel .btn-secondary,
        .light .buyer-theme-alipanel button[variant="secondary"],
        .light .buyer-theme-alipanel button[variant="outline"],
        .light .buyer-theme-alipanel button[variant="ghost"] {
          background: rgba(255, 107, 107, 0.08) !important;
          color: #FF6B6B !important;
          border-color: rgba(255, 107, 107, 0.2) !important;
        }
        
        .light .buyer-theme-alipanel .btn-secondary:hover,
        .light .buyer-theme-alipanel button[variant="secondary"]:hover,
        .light .buyer-theme-alipanel button[variant="outline"]:hover,
        .light .buyer-theme-alipanel button[variant="ghost"]:hover {
          background: rgba(255, 107, 107, 0.15) !important;
        }
        
        /* Light mode icons */
        .light .buyer-theme-alipanel svg:not([class*="gradient"]) {
          color: inherit;
        }
        
        /* Light mode dialog/modal */
        .light .buyer-theme-alipanel [role="dialog"] {
          background: #FFFFFF !important;
          border-color: rgba(255, 107, 107, 0.15) !important;
        }
        
        /* Light mode tabs */
        .light .buyer-theme-alipanel [role="tablist"] {
          background: rgba(255, 107, 107, 0.05) !important;
        }
        
        .light .buyer-theme-alipanel [role="tab"][data-state="active"] {
          background: #FFFFFF !important;
          color: #FF6B6B !important;
        }
        
        /* Light mode links in nav */
        .light .buyer-theme-alipanel nav a,
        .light .buyer-theme-alipanel header a {
          color: #374151;
        }
        
        .light .buyer-theme-alipanel nav a:hover,
        .light .buyer-theme-alipanel header a:hover {
          color: #FF6B6B;
        }
        
        /* Ensure proper color inheritance */
        .light .buyer-theme-alipanel * {
          border-color: inherit;
        }
        
        .light .buyer-theme-alipanel,
        .light .buyer-theme-alipanel .buyer-theme-wrapper {
          color: #1A1A1A;
        }
        
        /* Force balance text to always be white */
        .buyer-theme-alipanel .balance-card .text-xl.font-bold,
        .buyer-theme-alipanel .balance-card p.text-white,
        .light .buyer-theme-alipanel .balance-card .text-xl.font-bold,
        .light .buyer-theme-alipanel .balance-card p.text-white {
          color: #FFFFFF !important;
        }
        .buyer-theme-alipanel .balance-card .text-white\\/70,
        .light .buyer-theme-alipanel .balance-card .text-white\\/70 {
          color: rgba(255, 255, 255, 0.7) !important;
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