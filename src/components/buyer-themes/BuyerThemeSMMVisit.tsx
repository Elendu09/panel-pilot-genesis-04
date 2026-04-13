import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BuyerThemeSMMVisitProps {
  children: ReactNode;
  className?: string;
  themeMode?: 'light' | 'dark'; // Kept for interface compatibility, but always forces light
}

// SMMVisit Theme: Light gray with yellow/gold accents - LIGHT MODE ONLY
const BuyerThemeSMMVisit = ({ children, className }: BuyerThemeSMMVisitProps) => {
  // SMMVisit is ALWAYS light mode - ignore themeMode prop
  return (
    <div className="light">
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
          background: var(--theme-background) !important;
          color: var(--theme-text) !important;
        }
        
        /* Override panel variables — !important ensures theme-specific values
           win over the global generateBuyerThemeCSS output */
        .buyer-theme-smmvisit {
          --panel-primary: #FFD700 !important;
          --panel-secondary: #FFC107 !important;
          --panel-accent: #1A1A1A !important;
          --panel-gradient: linear-gradient(135deg, #FFD700 0%, #FFC107 100%) !important;
          --panel-gradient-accent: linear-gradient(135deg, #FFD700 0%, #FFB300 100%) !important;
          --panel-glow: 0 0 20px rgba(255, 215, 0, 0.4) !important;
          --panel-glow-lg: 0 0 40px rgba(255, 215, 0, 0.3) !important;
          --panel-nav-active-bg: rgba(255, 215, 0, 0.2) !important;
          --panel-nav-active-text: #1A1A1A !important;
          --panel-bottom-nav-center-gradient: linear-gradient(135deg, #FFD700 0%, #FFC107 100%) !important;
          --step-active: #FFD700 !important;
          --step-completed: #FFD700 !important;
          --step-glow: 0 0 16px rgba(255, 215, 0, 0.6) !important;
          --panel-background: #F5F5F5 !important;
          --panel-surface: #FFFFFF !important;
          --panel-card: #FFFFFF !important;
          --panel-text: #1A1A1A !important;
          --panel-muted: #6B7280 !important;
          --panel-border: #E5E7EB !important;
          --background: 0 0% 96% !important;
          --foreground: 0 0% 10% !important;
          --card: 0 0% 100% !important;
          --card-foreground: 0 0% 10% !important;
          --popover: 0 0% 100% !important;
          --popover-foreground: 0 0% 10% !important;
          --muted: 220 14% 96% !important;
          --muted-foreground: 220 9% 46% !important;
          --border: 220 13% 91% !important;
          --input: 220 13% 91% !important;
        }
        
        /* ===== LIGHT MODE STYLES (Only mode for SMMVisit) ===== */
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
        
        /* Dashboard elements */
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
          background: #FFFFFF;
          border-top: 1px solid #E5E7EB;
        }
        
        /* Balance display - always white (for header with dark bg) */
        .buyer-theme-smmvisit .balance-display {
          color: #FFFFFF !important;
        }
        
        /* Ensure proper text colors */
        .buyer-theme-smmvisit h1,
        .buyer-theme-smmvisit h2,
        .buyer-theme-smmvisit h3,
        .buyer-theme-smmvisit h4,
        .buyer-theme-smmvisit h5,
        .buyer-theme-smmvisit h6 {
          color: #1A1A1A;
        }
        
        .buyer-theme-smmvisit p {
          color: #374151;
        }
        
        .buyer-theme-smmvisit .text-muted-foreground {
          color: #6B7280;
        }
        
        /* Navigation links */
        .buyer-theme-smmvisit nav a,
        .buyer-theme-smmvisit header a {
          color: #374151;
        }
        
        .buyer-theme-smmvisit nav a:hover,
        .buyer-theme-smmvisit header a:hover {
          color: #B8860B;
        }
        
        /* Badges */
        .buyer-theme-smmvisit [class*="Badge"] {
          background: rgba(255, 215, 0, 0.15);
          color: #B8860B;
          border-color: rgba(255, 215, 0, 0.25);
        }
        
        /* Buttons */
        .buyer-theme-smmvisit button:not(.theme-button-primary):not([class*="gradient"]) {
          color: #1A1A1A;
        }
        
        .buyer-theme-smmvisit button[class*="outline"],
        .buyer-theme-smmvisit button[class*="ghost"],
        .buyer-theme-smmvisit button[class*="secondary"] {
          background: #FFFFFF;
          border-color: #D1D5DB;
          color: #1A1A1A;
        }
        
        .buyer-theme-smmvisit button[class*="outline"]:hover,
        .buyer-theme-smmvisit button[class*="ghost"]:hover,
        .buyer-theme-smmvisit button[class*="secondary"]:hover {
          background: rgba(255, 215, 0, 0.08);
          border-color: #FFD700;
        }
        
        /* Footer */
        .buyer-theme-smmvisit footer {
          background: linear-gradient(180deg, #F5F5F5 0%, #EEEEEE 100%);
          border-top: 1px solid #E5E7EB;
        }
        
        /* Dropdowns */
        .buyer-theme-smmvisit [data-radix-popper-content-wrapper] > div,
        .buyer-theme-smmvisit [role="listbox"],
        .buyer-theme-smmvisit [role="menu"] {
          background: #FFFFFF;
          border-color: #E5E7EB;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }
        
        .buyer-theme-smmvisit [role="option"],
        .buyer-theme-smmvisit [role="menuitem"] {
          color: #1A1A1A;
        }
        
        .buyer-theme-smmvisit [role="option"]:hover,
        .buyer-theme-smmvisit [role="option"][data-highlighted] {
          background: rgba(255, 215, 0, 0.1);
        }
        
        /* Dialog/modal */
        .buyer-theme-smmvisit [role="dialog"] {
          background: #FFFFFF;
          border-color: #E5E7EB;
        }
        
        /* Tabs */
        .buyer-theme-smmvisit [role="tablist"] {
          background: rgba(255, 215, 0, 0.06);
        }
        
        .buyer-theme-smmvisit [role="tab"][data-state="active"] {
          background: #FFFFFF;
          color: #B8860B;
        }
        
        /* Accordion */
        .buyer-theme-smmvisit [data-state="open"] {
          background: rgba(255, 215, 0, 0.05);
        }
        
        /* Sidebar */
        .buyer-theme-smmvisit aside a {
          color: #374151;
        }
        
        .buyer-theme-smmvisit aside a:hover,
        .buyer-theme-smmvisit aside a.active {
          background: rgba(255, 215, 0, 0.12);
          color: #B8860B;
        }
        
        /* Mobile drawer/sheet */
        .buyer-theme-smmvisit [data-vaul-drawer],
        .buyer-theme-smmvisit [class*="SheetContent"] {
          background: #FFFFFF;
        }
        
        /* Quick action buttons */
        .buyer-theme-smmvisit button.h-auto,
        .buyer-theme-smmvisit button[class*="h-auto"] {
          background: #FFFFFF;
          border-color: #E5E7EB;
        }
        
        .buyer-theme-smmvisit button.h-auto:hover,
        .buyer-theme-smmvisit button[class*="h-auto"]:hover {
          background: rgba(255, 215, 0, 0.08);
          border-color: #FFD700;
        }
        
        /* Border colors */
        .buyer-theme-smmvisit .border,
        .buyer-theme-smmvisit .border-border {
          border-color: #E5E7EB;
        }
        
        /* Scrollbar */
        .buyer-theme-smmvisit ::-webkit-scrollbar-thumb {
          background: rgba(255, 215, 0, 0.3);
          border-radius: 4px;
        }
        
        .buyer-theme-smmvisit ::-webkit-scrollbar-track {
          background: rgba(255, 215, 0, 0.05);
        }
      `}</style>
        {children}
      </div>
    </div>
  );
};

export { BuyerThemeSMMVisit };
export default BuyerThemeSMMVisit;

export const smmVisitThemeConfig = {
  key: 'smmvisit',
  name: 'SMMVisit',
  description: 'Clean professional with yellow/gold accents (Light mode only)',
  lightModeOnly: true, // Flag indicating this theme is light-mode only
  fonts: {
    heading: 'Inter',
    body: 'Inter',
  },
  colors: {
    // Provide both dark and light for type compatibility, but only light is used
    dark: {
      background: '#F5F5F5',
      surface: '#FFFFFF',
      primary: '#FFD700',
      secondary: '#FFC107',
      accent: '#1A1A1A',
      text: '#1A1A1A',
      muted: '#6B7280',
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
    heroStyle: 'centered',
    navStyle: 'fixed',
    cardStyle: 'rounded',
    spacing: 'comfortable',
  },
};
