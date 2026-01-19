import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BuyerThemeSMMVisitProps {
  children: ReactNode;
  className?: string;
  themeMode?: 'light' | 'dark';
}

// SMMVisit Theme: Light gray with yellow/gold accents - Clean rewrite following FlySMM pattern
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
        /* ===== BASE THEME VARIABLES ===== */
        .buyer-theme-smmvisit {
          --theme-background: #F5F5F5;
          --theme-surface: #FFFFFF;
          --theme-primary: #FFD700;
          --theme-secondary: #FFC107;
          --theme-accent: #1A1A1A;
          --theme-text: #1A1A1A;
          --theme-muted: #6B7280;
          --theme-gradient: linear-gradient(135deg, #FFD700 0%, #FFC107 100%);
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
        
        /* ===== LIGHT MODE (DEFAULT) ===== */
        .buyer-theme-smmvisit .theme-card {
          background: #FFFFFF;
          border: 1px solid #E5E7EB;
          border-radius: 1rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
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
        
        /* Dashboard elements - Light mode */
        .buyer-theme-smmvisit .glass-card,
        .buyer-theme-smmvisit [class*="Card"] {
          background: #FFFFFF;
          border-color: #E5E7EB;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        
        .buyer-theme-smmvisit .glass-sidebar {
          background: #FFFFFF;
          border-color: #E5E7EB;
          box-shadow: 2px 0 20px rgba(0, 0, 0, 0.03);
        }
        
        .buyer-theme-smmvisit input,
        .buyer-theme-smmvisit textarea,
        .buyer-theme-smmvisit select {
          background: #FFFFFF;
          border-color: #D1D5DB;
          color: #1A1A1A;
        }
        
        .buyer-theme-smmvisit input::placeholder,
        .buyer-theme-smmvisit textarea::placeholder {
          color: #9CA3AF;
        }
        
        .buyer-theme-smmvisit input:focus,
        .buyer-theme-smmvisit textarea:focus,
        .buyer-theme-smmvisit select:focus {
          border-color: #FFD700;
          box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.2);
        }
        
        .buyer-theme-smmvisit table {
          background: #FFFFFF;
        }
        
        .buyer-theme-smmvisit thead {
          background: rgba(255, 215, 0, 0.08);
        }
        
        .buyer-theme-smmvisit tbody tr:hover {
          background: rgba(255, 215, 0, 0.05);
        }
        
        /* Bottom navigation - CRITICAL: Always clickable */
        .buyer-theme-smmvisit nav.fixed.bottom-0 {
          z-index: 50;
          pointer-events: auto;
          position: fixed;
        }
        
        /* ===== DARK MODE ===== */
        .dark .buyer-theme-smmvisit {
          --theme-background: #1C1F26;
          --theme-surface: #262A33;
          --theme-text: #FFFFFF;
          --theme-muted: #9CA3AF;
          --panel-nav-active-text: #FFD700;
        }
        
        .dark .buyer-theme-smmvisit {
          background: linear-gradient(180deg, #1C1F26 0%, #171A20 100%);
          color: #FFFFFF;
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
        
        /* Dark mode dashboard elements */
        .dark .buyer-theme-smmvisit .glass-card,
        .dark .buyer-theme-smmvisit [class*="Card"] {
          background: #262A33;
          border-color: rgba(255, 215, 0, 0.15);
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.25);
        }
        
        .dark .buyer-theme-smmvisit .glass-sidebar {
          background: rgba(28, 31, 38, 0.98);
          border-color: rgba(255, 215, 0, 0.1);
          box-shadow: 2px 0 20px rgba(0, 0, 0, 0.3);
        }
        
        .dark .buyer-theme-smmvisit input,
        .dark .buyer-theme-smmvisit textarea,
        .dark .buyer-theme-smmvisit select {
          background: #1C1F26;
          border-color: rgba(255, 215, 0, 0.2);
          color: #FFFFFF;
        }
        
        .dark .buyer-theme-smmvisit input::placeholder,
        .dark .buyer-theme-smmvisit textarea::placeholder {
          color: #6B7280;
        }
        
        .dark .buyer-theme-smmvisit input:focus,
        .dark .buyer-theme-smmvisit textarea:focus,
        .dark .buyer-theme-smmvisit select:focus {
          border-color: #FFD700;
          box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.2);
        }
        
        .dark .buyer-theme-smmvisit table {
          background: #262A33;
        }
        
        .dark .buyer-theme-smmvisit thead {
          background: rgba(255, 215, 0, 0.1);
        }
        
        .dark .buyer-theme-smmvisit tbody tr:hover {
          background: rgba(255, 215, 0, 0.08);
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
          color: #E5E7EB;
        }
        
        .dark .buyer-theme-smmvisit .text-muted-foreground {
          color: #9CA3AF;
        }
        
        /* Dark mode navigation */
        .dark .buyer-theme-smmvisit nav a,
        .dark .buyer-theme-smmvisit header a {
          color: #E5E7EB;
        }
        
        .dark .buyer-theme-smmvisit nav a:hover,
        .dark .buyer-theme-smmvisit header a:hover {
          color: #FFD700;
        }
        
        /* Dark mode badges */
        .dark .buyer-theme-smmvisit [class*="Badge"] {
          background: rgba(255, 215, 0, 0.15);
          color: #FFD700;
          border-color: rgba(255, 215, 0, 0.25);
        }
        
        /* Dark mode buttons */
        .dark .buyer-theme-smmvisit button:not(.theme-button-primary):not([class*="gradient"]) {
          color: #FFFFFF;
        }
        
        .dark .buyer-theme-smmvisit button[class*="outline"],
        .dark .buyer-theme-smmvisit button[class*="ghost"],
        .dark .buyer-theme-smmvisit button[class*="secondary"] {
          background: rgba(38, 42, 51, 0.95);
          border-color: rgba(255, 215, 0, 0.25);
          color: #FFFFFF;
        }
        
        .dark .buyer-theme-smmvisit button[class*="outline"]:hover,
        .dark .buyer-theme-smmvisit button[class*="ghost"]:hover,
        .dark .buyer-theme-smmvisit button[class*="secondary"]:hover {
          background: rgba(255, 215, 0, 0.12);
          border-color: rgba(255, 215, 0, 0.4);
        }
        
        /* Dark mode footer */
        .dark .buyer-theme-smmvisit footer {
          background: linear-gradient(180deg, #1C1F26 0%, #171A20 100%);
          border-top: 1px solid rgba(255, 215, 0, 0.1);
        }
        
        /* Dark mode dropdowns */
        .dark .buyer-theme-smmvisit [data-radix-popper-content-wrapper] > div,
        .dark .buyer-theme-smmvisit [role="listbox"],
        .dark .buyer-theme-smmvisit [role="menu"] {
          background: #262A33;
          border-color: rgba(255, 215, 0, 0.2);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        }
        
        .dark .buyer-theme-smmvisit [role="option"],
        .dark .buyer-theme-smmvisit [role="menuitem"] {
          color: #FFFFFF;
        }
        
        .dark .buyer-theme-smmvisit [role="option"]:hover,
        .dark .buyer-theme-smmvisit [role="option"][data-highlighted] {
          background: rgba(255, 215, 0, 0.12);
        }
        
        /* Dark mode bottom nav */
        .dark .buyer-theme-smmvisit nav.fixed.bottom-0 {
          background: rgba(28, 31, 38, 0.98);
          backdrop-filter: blur(12px);
          border-top: 1px solid rgba(255, 215, 0, 0.12);
          z-index: 50;
          pointer-events: auto;
        }
        
        .dark .buyer-theme-smmvisit nav.fixed.bottom-0 button,
        .dark .buyer-theme-smmvisit nav.fixed.bottom-0 a,
        .dark .buyer-theme-smmvisit nav.fixed.bottom-0 span {
          color: #9CA3AF;
        }
        
        .dark .buyer-theme-smmvisit nav.fixed.bottom-0 button:hover,
        .dark .buyer-theme-smmvisit nav.fixed.bottom-0 a:hover {
          color: #FFD700;
        }
        
        /* Dark mode dialog/modal */
        .dark .buyer-theme-smmvisit [role="dialog"] {
          background: #262A33;
          border-color: rgba(255, 215, 0, 0.15);
        }
        
        /* Dark mode tabs */
        .dark .buyer-theme-smmvisit [role="tablist"] {
          background: rgba(255, 215, 0, 0.06);
        }
        
        .dark .buyer-theme-smmvisit [role="tab"][data-state="active"] {
          background: #262A33;
          color: #FFD700;
        }
        
        /* Dark mode accordion */
        .dark .buyer-theme-smmvisit [data-state="open"] {
          background: rgba(255, 215, 0, 0.05);
        }
        
        /* Dark mode sidebar */
        .dark .buyer-theme-smmvisit aside a {
          color: #D1D5DB;
        }
        
        .dark .buyer-theme-smmvisit aside a:hover,
        .dark .buyer-theme-smmvisit aside a.active {
          background: rgba(255, 215, 0, 0.12);
          color: #FFD700;
        }
        
        /* Dark mode scrollbar */
        .dark .buyer-theme-smmvisit ::-webkit-scrollbar-thumb {
          background: rgba(255, 215, 0, 0.25);
          border-radius: 4px;
        }
        
        .dark .buyer-theme-smmvisit ::-webkit-scrollbar-track {
          background: rgba(255, 215, 0, 0.05);
        }
        
        /* Stats and text sizes */
        .dark .buyer-theme-smmvisit .text-2xl,
        .dark .buyer-theme-smmvisit .text-3xl,
        .dark .buyer-theme-smmvisit .text-4xl {
          color: #FFFFFF;
        }
        
        /* Border colors */
        .dark .buyer-theme-smmvisit .border,
        .dark .buyer-theme-smmvisit .border-border {
          border-color: rgba(255, 215, 0, 0.12);
        }
        
        /* Mobile drawer/sheet */
        .dark .buyer-theme-smmvisit [data-vaul-drawer],
        .dark .buyer-theme-smmvisit [class*="SheetContent"] {
          background: #1C1F26;
        }
        
        /* Quick action buttons */
        .dark .buyer-theme-smmvisit button.h-auto {
          background: #262A33;
          border-color: rgba(255, 215, 0, 0.15);
        }
        
        .dark .buyer-theme-smmvisit button.h-auto:hover {
          background: rgba(255, 215, 0, 0.1);
          border-color: rgba(255, 215, 0, 0.3);
        }
        
        .dark .buyer-theme-smmvisit button.h-auto span,
        .dark .buyer-theme-smmvisit button.h-auto p {
          color: #FFFFFF;
        }
        
        .dark .buyer-theme-smmvisit button.h-auto .text-muted-foreground {
          color: #9CA3AF;
        }
        
        /* Ensure proper color inheritance */
        .dark .buyer-theme-smmvisit,
        .dark .buyer-theme-smmvisit .buyer-theme-wrapper {
          color: #FFFFFF;
        }
        
        .dark .buyer-theme-smmvisit a {
          color: #E5E7EB;
        }
        
        .dark .buyer-theme-smmvisit a:hover {
          color: #FFD700;
        }
        
        /* Force balance text to always be white */
        .buyer-theme-smmvisit .balance-card .text-xl.font-bold,
        .buyer-theme-smmvisit .balance-card p.text-white,
        .dark .buyer-theme-smmvisit .balance-card .text-xl.font-bold,
        .dark .buyer-theme-smmvisit .balance-card p.text-white {
          color: #FFFFFF !important;
        }
        .buyer-theme-smmvisit .balance-card .text-white\\/70,
        .dark .buyer-theme-smmvisit .balance-card .text-white\\/70 {
          color: rgba(255, 255, 255, 0.7) !important;
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
    heroStyle: 'comparison-chart',
    cardStyle: 'rounded-shadow',
    navStyle: 'rounded-white',
    spacing: 'comfortable',
  },
};

export default BuyerThemeSMMVisit;
