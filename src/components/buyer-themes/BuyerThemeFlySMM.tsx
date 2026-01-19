import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BuyerThemeFlySMMProps {
  children: ReactNode;
  className?: string;
  themeMode?: 'light' | 'dark';
}

// FlySMM Theme: Light/white background with blue primary and illustrated cards
export const BuyerThemeFlySMM = ({ children, className, themeMode = 'light' }: BuyerThemeFlySMMProps) => {
  return (
    <div className={themeMode === 'light' ? 'light' : 'dark'}>
      <div 
        className={cn(
          "buyer-theme-flysmm buyer-theme-wrapper min-h-screen font-nunito",
          className
        )}
      >
      <style>{`
        .buyer-theme-flysmm {
          --theme-background: #F8FAFC;
          --theme-surface: #FFFFFF;
          --theme-primary: #2196F3;
          --theme-secondary: #64B5F6;
          --theme-accent: #00BCD4;
          --theme-text: #1E293B;
          --theme-muted: #64748B;
          --theme-gradient: linear-gradient(135deg, #2196F3 0%, #00BCD4 100%);
          background: var(--theme-background);
          color: var(--theme-text);
        }
        
        /* Override panel variables for this theme */
        .buyer-theme-flysmm {
          --panel-primary: #2196F3;
          --panel-secondary: #64B5F6;
          --panel-accent: #00BCD4;
          --panel-gradient: linear-gradient(135deg, #2196F3 0%, #00BCD4 100%);
          --panel-gradient-accent: linear-gradient(135deg, #2196F3 0%, #64B5F6 100%);
          --panel-glow: 0 0 20px rgba(33, 150, 243, 0.4);
          --panel-glow-lg: 0 0 40px rgba(33, 150, 243, 0.3);
          --panel-nav-active-bg: rgba(33, 150, 243, 0.1);
          --panel-nav-active-text: #2196F3;
          --panel-bottom-nav-center-gradient: linear-gradient(135deg, #2196F3 0%, #00BCD4 100%);
          --step-active: #2196F3;
          --step-completed: #2196F3;
          --step-glow: 0 0 16px rgba(33, 150, 243, 0.5);
        }
        
        .buyer-theme-flysmm .theme-card {
          background: white;
          border: 1px solid #E2E8F0;
          border-radius: 20px;
          box-shadow: 0 4px 24px rgba(33, 150, 243, 0.08);
        }
        
        .buyer-theme-flysmm .theme-card:hover {
          box-shadow: 0 8px 40px rgba(33, 150, 243, 0.15);
          transform: translateY(-4px);
        }
        
        .buyer-theme-flysmm .theme-button-primary {
          background: linear-gradient(135deg, #2196F3 0%, #00BCD4 100%);
          border: none;
          color: white;
          font-weight: 700;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(33, 150, 243, 0.3);
        }
        
        .buyer-theme-flysmm .theme-button-primary:hover {
          box-shadow: 0 6px 24px rgba(33, 150, 243, 0.4);
        }
        
        .buyer-theme-flysmm .theme-gradient-text {
          background: linear-gradient(135deg, #2196F3 0%, #00BCD4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .buyer-theme-flysmm .theme-icon-box {
          background: linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(0, 188, 212, 0.1));
          border-radius: 16px;
        }
        
        .buyer-theme-flysmm .theme-nav {
          background: white;
          box-shadow: 0 2px 20px rgba(0, 0, 0, 0.05);
          border-bottom: 1px solid #E2E8F0;
        }
        
        .buyer-theme-flysmm .theme-hero {
          background: linear-gradient(180deg, #F0F9FF 0%, #F8FAFC 100%);
        }
        
        .buyer-theme-flysmm .theme-badge {
          background: rgba(33, 150, 243, 0.1);
          color: #2196F3;
          font-weight: 600;
        }
        
        /* Dashboard elements - Light mode */
        .buyer-theme-flysmm .glass-card,
        .buyer-theme-flysmm [class*="Card"] {
          background: #FFFFFF !important;
          border-color: #E2E8F0 !important;
          box-shadow: 0 4px 24px rgba(33, 150, 243, 0.06) !important;
        }
        
        .buyer-theme-flysmm .glass-sidebar {
          background: #FFFFFF !important;
          border-color: #E2E8F0 !important;
          box-shadow: 2px 0 20px rgba(0, 0, 0, 0.03) !important;
        }
        
        .buyer-theme-flysmm input,
        .buyer-theme-flysmm textarea,
        .buyer-theme-flysmm select {
          background: #FFFFFF !important;
          border-color: #E2E8F0 !important;
          color: #1E293B !important;
        }
        
        .buyer-theme-flysmm input::placeholder,
        .buyer-theme-flysmm textarea::placeholder {
          color: #94A3B8 !important;
        }
        
        .buyer-theme-flysmm input:focus,
        .buyer-theme-flysmm textarea:focus,
        .buyer-theme-flysmm select:focus {
          border-color: #2196F3 !important;
          box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.15) !important;
        }
        
        .buyer-theme-flysmm table {
          background: #FFFFFF !important;
        }
        
        .buyer-theme-flysmm thead {
          background: rgba(33, 150, 243, 0.05) !important;
        }
        
        .buyer-theme-flysmm tbody tr:hover {
          background: rgba(33, 150, 243, 0.03) !important;
        }
        
        /* ===== COMPREHENSIVE DARK MODE ===== */
        .dark .buyer-theme-flysmm {
          --theme-background: #0C1929;
          --theme-surface: #132337;
          --theme-text: #F1F5F9;
          --theme-muted: #94A3B8;
          --panel-nav-active-text: #64B5F6;
        }
        
        .dark .buyer-theme-flysmm {
          background: linear-gradient(180deg, #0C1929 0%, #0A1422 100%);
        }
        
        .dark .buyer-theme-flysmm .theme-card {
          background: #132337;
          border: 1px solid rgba(33, 150, 243, 0.2);
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
        }
        
        .dark .buyer-theme-flysmm .theme-card:hover {
          box-shadow: 0 8px 40px rgba(33, 150, 243, 0.2);
          border-color: rgba(33, 150, 243, 0.3);
        }
        
        .dark .buyer-theme-flysmm .theme-nav {
          background: rgba(12, 25, 41, 0.95);
          backdrop-filter: blur(10px);
          border-color: rgba(33, 150, 243, 0.1);
          box-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
        }
        
        .dark .buyer-theme-flysmm .theme-hero {
          background: radial-gradient(ellipse at top, rgba(33, 150, 243, 0.1) 0%, transparent 50%);
        }
        
        .dark .buyer-theme-flysmm .theme-button-primary {
          box-shadow: 0 4px 20px rgba(33, 150, 243, 0.35);
        }
        
        .dark .buyer-theme-flysmm .theme-button-primary:hover {
          box-shadow: 0 6px 30px rgba(33, 150, 243, 0.5);
        }
        
        .dark .buyer-theme-flysmm .theme-badge {
          background: rgba(33, 150, 243, 0.2);
          color: #64B5F6;
        }
        
        /* Dark mode dashboard elements */
        .dark .buyer-theme-flysmm .glass-card,
        .dark .buyer-theme-flysmm [class*="Card"] {
          background: #132337 !important;
          border-color: rgba(33, 150, 243, 0.15) !important;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.25) !important;
        }
        
        .dark .buyer-theme-flysmm .glass-sidebar {
          background: rgba(12, 25, 41, 0.98) !important;
          border-color: rgba(33, 150, 243, 0.1) !important;
          box-shadow: 2px 0 20px rgba(0, 0, 0, 0.3) !important;
        }
        
        .dark .buyer-theme-flysmm input,
        .dark .buyer-theme-flysmm textarea,
        .dark .buyer-theme-flysmm select {
          background: #0C1929 !important;
          border-color: rgba(33, 150, 243, 0.2) !important;
          color: #F1F5F9 !important;
        }
        
        .dark .buyer-theme-flysmm input::placeholder,
        .dark .buyer-theme-flysmm textarea::placeholder {
          color: #64748B !important;
        }
        
        .dark .buyer-theme-flysmm input:focus,
        .dark .buyer-theme-flysmm textarea:focus,
        .dark .buyer-theme-flysmm select:focus {
          border-color: #2196F3 !important;
          box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.2) !important;
        }
        
        .dark .buyer-theme-flysmm table {
          background: #132337 !important;
        }
        
        .dark .buyer-theme-flysmm thead {
          background: rgba(33, 150, 243, 0.1) !important;
        }
        
        .dark .buyer-theme-flysmm tbody tr:hover {
          background: rgba(33, 150, 243, 0.08) !important;
        }
        
        .dark .buyer-theme-flysmm .nav-item.active,
        .dark .buyer-theme-flysmm .nav-item:hover {
          background: rgba(33, 150, 243, 0.15) !important;
        }
        
        /* Dark mode text colors */
        .dark .buyer-theme-flysmm h1,
        .dark .buyer-theme-flysmm h2,
        .dark .buyer-theme-flysmm h3,
        .dark .buyer-theme-flysmm h4,
        .dark .buyer-theme-flysmm h5,
        .dark .buyer-theme-flysmm h6 {
          color: #F1F5F9;
        }
        
        .dark .buyer-theme-flysmm p,
        .dark .buyer-theme-flysmm span:not(.theme-gradient-text) {
          color: #CBD5E1;
        }
        
        .dark .buyer-theme-flysmm .text-muted-foreground {
          color: #94A3B8 !important;
        }
        
        /* Dark mode badges */
        .dark .buyer-theme-flysmm [class*="Badge"],
        .dark .buyer-theme-flysmm .badge {
          background: rgba(33, 150, 243, 0.2) !important;
          color: #64B5F6 !important;
          border-color: rgba(33, 150, 243, 0.3) !important;
        }
        
        /* Dark mode footer */
        .dark .buyer-theme-flysmm footer {
          background: linear-gradient(180deg, #0C1929 0%, #0A1422 100%) !important;
          border-top: 1px solid rgba(33, 150, 243, 0.1) !important;
        }
        
        /* Dark mode dropdowns and popovers */
        .dark .buyer-theme-flysmm [data-radix-popper-content-wrapper] > div,
        .dark .buyer-theme-flysmm [role="listbox"],
        .dark .buyer-theme-flysmm [role="menu"] {
          background: #132337 !important;
          border-color: rgba(33, 150, 243, 0.2) !important;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3) !important;
        }
        
        /* Dark mode skeleton loading */
        .dark .buyer-theme-flysmm .skeleton,
        .dark .buyer-theme-flysmm [class*="Skeleton"] {
          background: rgba(33, 150, 243, 0.15) !important;
        }
        
        /* Dark mode scrollbar */
        .dark .buyer-theme-flysmm ::-webkit-scrollbar-thumb {
          background: rgba(33, 150, 243, 0.3);
        }
        .dark .buyer-theme-flysmm ::-webkit-scrollbar-track {
          background: rgba(33, 150, 243, 0.08);
        }
        
        /* Dark mode accordion */
        .dark .buyer-theme-flysmm [data-state="open"] {
          background: rgba(33, 150, 243, 0.08) !important;
        }
        
        /* Dark mode buttons - comprehensive */
        .dark .buyer-theme-flysmm button:not(.theme-button-primary):not([class*="gradient"]) {
          color: #F1F5F9;
        }
        
        /* Fix quick action buttons in dashboard */
        .dark .buyer-theme-flysmm button.h-auto,
        .dark .buyer-theme-flysmm button[class*="h-auto"] {
          background: #132337 !important;
          border-color: rgba(33, 150, 243, 0.25) !important;
        }
        
        .dark .buyer-theme-flysmm button.h-auto:hover,
        .dark .buyer-theme-flysmm button[class*="h-auto"]:hover {
          background: rgba(33, 150, 243, 0.15) !important;
          border-color: rgba(33, 150, 243, 0.4) !important;
        }
        
        .dark .buyer-theme-flysmm button.h-auto span,
        .dark .buyer-theme-flysmm button.h-auto p,
        .dark .buyer-theme-flysmm button[class*="h-auto"] span,
        .dark .buyer-theme-flysmm button[class*="h-auto"] p {
          color: #F1F5F9 !important;
        }
        
        .dark .buyer-theme-flysmm button.h-auto .text-muted-foreground,
        .dark .buyer-theme-flysmm button[class*="h-auto"] .text-muted-foreground {
          color: rgba(241, 245, 249, 0.65) !important;
        }
        
        .dark .buyer-theme-flysmm a {
          color: #CBD5E1;
        }
        
        .dark .buyer-theme-flysmm a:hover {
          color: #64B5F6;
        }
        
        .dark .buyer-theme-flysmm a button span {
          color: #64B5F6 !important;
        }
        
        /* Dark mode secondary buttons - using class matching */
        .dark .buyer-theme-flysmm button[class*="outline"],
        .dark .buyer-theme-flysmm button[class*="ghost"],
        .dark .buyer-theme-flysmm button[class*="secondary"] {
          background: rgba(33, 150, 243, 0.1) !important;
          color: #F1F5F9 !important;
          border-color: rgba(33, 150, 243, 0.25) !important;
        }
        
        .dark .buyer-theme-flysmm button[class*="outline"]:hover,
        .dark .buyer-theme-flysmm button[class*="ghost"]:hover,
        .dark .buyer-theme-flysmm button[class*="secondary"]:hover {
          background: rgba(33, 150, 243, 0.2) !important;
        }
        
        .dark .buyer-theme-flysmm button[class*="outline"] span,
        .dark .buyer-theme-flysmm button[class*="ghost"] span {
          color: #F1F5F9 !important;
        }
        
        /* Dark mode icons */
        .dark .buyer-theme-flysmm svg:not([class*="gradient"]) {
          color: inherit;
        }
        
        /* Dark mode dialog/modal */
        .dark .buyer-theme-flysmm [role="dialog"] {
          background: #132337 !important;
          border-color: rgba(33, 150, 243, 0.2) !important;
        }
        
        /* Dark mode tabs */
        .dark .buyer-theme-flysmm [role="tablist"] {
          background: rgba(33, 150, 243, 0.08) !important;
        }
        
        .dark .buyer-theme-flysmm [role="tab"][data-state="active"] {
          background: #132337 !important;
          color: #64B5F6 !important;
        }
        
        /* Dark mode links in nav */
        .dark .buyer-theme-flysmm nav a,
        .dark .buyer-theme-flysmm header a {
          color: #CBD5E1;
        }
        
        .dark .buyer-theme-flysmm nav a:hover,
        .dark .buyer-theme-flysmm header a:hover {
          color: #64B5F6;
        }
        
        /* Comprehensive dashboard fixes */
        .dark .buyer-theme-flysmm [class*="CardContent"] .text-muted-foreground {
          color: rgba(241, 245, 249, 0.7) !important;
        }
        
        .dark .buyer-theme-flysmm .text-2xl,
        .dark .buyer-theme-flysmm .text-3xl,
        .dark .buyer-theme-flysmm .text-4xl {
          color: #F1F5F9 !important;
        }
        
        .dark .buyer-theme-flysmm button .text-muted-foreground {
          color: rgba(241, 245, 249, 0.65) !important;
        }
        
        /* Ensure proper color inheritance */
        .dark .buyer-theme-flysmm * {
          border-color: inherit;
        }
        
        .dark .buyer-theme-flysmm,
        .dark .buyer-theme-flysmm .buyer-theme-wrapper {
          color: #F1F5F9;
        }
      `}</style>
        {children}
      </div>
    </div>
  );
};

// Theme configuration for database storage
export const flySMMThemeConfig = {
  key: 'flysmm',
  name: 'FlySMM',
  description: 'Light and airy with blue accents and soft shadows',
  fonts: {
    heading: 'Nunito',
    body: 'Nunito',
  },
  colors: {
    dark: {
      background: '#0C1929',
      surface: '#132337',
      primary: '#2196F3',
      secondary: '#64B5F6',
      accent: '#00BCD4',
      text: '#F1F5F9',
      muted: '#94A3B8',
    },
    light: {
      background: '#F8FAFC',
      surface: '#FFFFFF',
      primary: '#2196F3',
      secondary: '#64B5F6',
      accent: '#00BCD4',
      text: '#1E293B',
      muted: '#64748B',
    },
  },
  layout: {
    heroStyle: 'illustrated',
    cardStyle: 'soft-shadow',
    navStyle: 'clean',
    spacing: 'comfortable',
  },
};

export default BuyerThemeFlySMM;