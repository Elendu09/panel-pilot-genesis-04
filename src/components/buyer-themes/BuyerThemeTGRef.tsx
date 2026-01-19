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
        
        /* Override panel variables for this theme */
        .buyer-theme-tgref {
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
        
        /* Dashboard elements - Dark mode */
        .buyer-theme-tgref .glass-card,
        .buyer-theme-tgref [class*="Card"] {
          background: #24283B !important;
          border-color: rgba(0, 212, 170, 0.15) !important;
        }
        
        .buyer-theme-tgref .glass-sidebar {
          background: rgba(26, 27, 38, 0.98) !important;
          border-color: rgba(0, 212, 170, 0.1) !important;
        }
        
        .buyer-theme-tgref input,
        .buyer-theme-tgref textarea,
        .buyer-theme-tgref select {
          background: #1A1B26 !important;
          border-color: rgba(0, 212, 170, 0.2) !important;
          color: #C0CAF5 !important;
          font-family: 'Space Mono', monospace !important;
        }
        
        .buyer-theme-tgref input::placeholder,
        .buyer-theme-tgref textarea::placeholder {
          color: #565F89 !important;
        }
        
        .buyer-theme-tgref input:focus,
        .buyer-theme-tgref textarea:focus,
        .buyer-theme-tgref select:focus {
          border-color: #00D4AA !important;
          box-shadow: 0 0 0 2px rgba(0, 212, 170, 0.2) !important;
        }
        
        .buyer-theme-tgref table {
          background: #24283B !important;
          font-family: 'Space Mono', monospace !important;
        }
        
        .buyer-theme-tgref thead {
          background: rgba(0, 212, 170, 0.1) !important;
        }
        
        .buyer-theme-tgref tbody tr:hover {
          background: rgba(0, 212, 170, 0.05) !important;
        }
        
        /* ===== COMPREHENSIVE LIGHT MODE ===== */
        .light .buyer-theme-tgref {
          --theme-background: #F8FAFC;
          --theme-surface: #FFFFFF;
          --theme-text: #1E293B;
          --theme-muted: #64748B;
          --panel-nav-active-text: #00A88A;
        }
        
        .light .buyer-theme-tgref {
          background: linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%);
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
        
        /* Light mode dashboard elements */
        .light .buyer-theme-tgref .glass-card,
        .light .buyer-theme-tgref [class*="Card"] {
          background: #FFFFFF !important;
          border-color: rgba(0, 212, 170, 0.15) !important;
          box-shadow: 0 4px 20px rgba(0, 212, 170, 0.05) !important;
        }
        
        .light .buyer-theme-tgref .glass-sidebar {
          background: #FFFFFF !important;
          border-color: rgba(0, 212, 170, 0.1) !important;
          box-shadow: 2px 0 20px rgba(0, 212, 170, 0.04) !important;
        }
        
        .light .buyer-theme-tgref input,
        .light .buyer-theme-tgref textarea,
        .light .buyer-theme-tgref select {
          background: #FFFFFF !important;
          border-color: rgba(0, 212, 170, 0.2) !important;
          color: #1E293B !important;
        }
        
        .light .buyer-theme-tgref input::placeholder,
        .light .buyer-theme-tgref textarea::placeholder {
          color: #94A3B8 !important;
        }
        
        .light .buyer-theme-tgref table {
          background: #FFFFFF !important;
        }
        
        .light .buyer-theme-tgref thead {
          background: rgba(0, 212, 170, 0.08) !important;
        }
        
        .light .buyer-theme-tgref tbody tr:hover {
          background: rgba(0, 212, 170, 0.04) !important;
        }
        
        .light .buyer-theme-tgref .nav-item.active,
        .light .buyer-theme-tgref .nav-item:hover {
          background: rgba(0, 212, 170, 0.1) !important;
        }
        
        /* Light mode text colors */
        .light .buyer-theme-tgref h1,
        .light .buyer-theme-tgref h2,
        .light .buyer-theme-tgref h3,
        .light .buyer-theme-tgref h4,
        .light .buyer-theme-tgref h5,
        .light .buyer-theme-tgref h6 {
          color: #1E293B;
        }
        
        .light .buyer-theme-tgref p,
        .light .buyer-theme-tgref span:not(.theme-gradient-text) {
          color: #334155;
        }
        
        .light .buyer-theme-tgref .text-muted-foreground {
          color: #64748B !important;
        }
        
        /* Light mode badges */
        .light .buyer-theme-tgref [class*="Badge"],
        .light .buyer-theme-tgref .badge {
          background: rgba(0, 212, 170, 0.1) !important;
          color: #00A88A !important;
          border-color: rgba(0, 212, 170, 0.2) !important;
        }
        
        /* Light mode footer */
        .light .buyer-theme-tgref footer {
          background: linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%) !important;
          border-top: 1px solid rgba(0, 212, 170, 0.1) !important;
        }
        
        /* Light mode dropdowns and popovers */
        .light .buyer-theme-tgref [data-radix-popper-content-wrapper] > div,
        .light .buyer-theme-tgref [role="listbox"],
        .light .buyer-theme-tgref [role="menu"] {
          background: #FFFFFF !important;
          border-color: rgba(0, 212, 170, 0.2) !important;
          box-shadow: 0 10px 40px rgba(0, 212, 170, 0.1) !important;
        }
        
        /* Light mode skeleton loading */
        .light .buyer-theme-tgref .skeleton,
        .light .buyer-theme-tgref [class*="Skeleton"] {
          background: rgba(0, 212, 170, 0.08) !important;
        }
        
        /* Light mode scrollbar */
        .light .buyer-theme-tgref ::-webkit-scrollbar-thumb {
          background: rgba(0, 212, 170, 0.3);
        }
        .light .buyer-theme-tgref ::-webkit-scrollbar-track {
          background: rgba(0, 212, 170, 0.05);
        }
        
        /* Light mode accordion */
        .light .buyer-theme-tgref [data-state="open"] {
          background: rgba(0, 212, 170, 0.04) !important;
        }
        
        /* Light mode buttons - comprehensive */
        .light .buyer-theme-tgref button:not(.theme-button-primary):not(.theme-button-filled):not([class*="gradient"]) {
          color: #1E293B;
        }
        
        .light .buyer-theme-tgref a {
          color: #334155;
        }
        
        .light .buyer-theme-tgref a:hover {
          color: #00A88A;
        }
        
        /* Light mode secondary buttons */
        .light .buyer-theme-tgref .btn-secondary,
        .light .buyer-theme-tgref button[variant="secondary"],
        .light .buyer-theme-tgref button[variant="outline"],
        .light .buyer-theme-tgref button[variant="ghost"] {
          background: rgba(0, 212, 170, 0.08) !important;
          color: #00A88A !important;
          border-color: rgba(0, 212, 170, 0.2) !important;
        }
        
        .light .buyer-theme-tgref .btn-secondary:hover,
        .light .buyer-theme-tgref button[variant="secondary"]:hover,
        .light .buyer-theme-tgref button[variant="outline"]:hover,
        .light .buyer-theme-tgref button[variant="ghost"]:hover {
          background: rgba(0, 212, 170, 0.15) !important;
        }
        
        /* Light mode icons */
        .light .buyer-theme-tgref svg:not([class*="gradient"]) {
          color: inherit;
        }
        
        /* Light mode dialog/modal */
        .light .buyer-theme-tgref [role="dialog"] {
          background: #FFFFFF !important;
          border-color: rgba(0, 212, 170, 0.15) !important;
        }
        
        /* Light mode tabs */
        .light .buyer-theme-tgref [role="tablist"] {
          background: rgba(0, 212, 170, 0.05) !important;
        }
        
        .light .buyer-theme-tgref [role="tab"][data-state="active"] {
          background: #FFFFFF !important;
          color: #00A88A !important;
        }
        
        /* Light mode links in nav */
        .light .buyer-theme-tgref nav a,
        .light .buyer-theme-tgref header a {
          color: #334155;
        }
        
        .light .buyer-theme-tgref nav a:hover,
        .light .buyer-theme-tgref header a:hover {
          color: #00A88A;
        }
        
        /* Ensure proper color inheritance */
        .light .buyer-theme-tgref * {
          border-color: inherit;
        }
        
        .light .buyer-theme-tgref,
        .light .buyer-theme-tgref .buyer-theme-wrapper {
          color: #1E293B;
        }
        
        /* Force balance text to always be white */
        .buyer-theme-tgref .balance-card .text-xl.font-bold,
        .buyer-theme-tgref .balance-card p.text-white,
        .light .buyer-theme-tgref .balance-card .text-xl.font-bold,
        .light .buyer-theme-tgref .balance-card p.text-white {
          color: #FFFFFF !important;
        }
        .buyer-theme-tgref .balance-card .text-white\\/70,
        .light .buyer-theme-tgref .balance-card .text-white\\/70 {
          color: rgba(255, 255, 255, 0.7) !important;
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