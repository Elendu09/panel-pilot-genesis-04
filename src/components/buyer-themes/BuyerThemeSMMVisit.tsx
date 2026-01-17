import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BuyerThemeSMMVisitProps {
  children: ReactNode;
  className?: string;
  themeMode?: 'light' | 'dark';
}

// SMMVisit Theme: Light gray with yellow/gold accents
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
        .buyer-theme-smmvisit {
          --theme-background: #F5F5F5;
          --theme-surface: #FFFFFF;
          --theme-primary: #FFD700;
          --theme-secondary: #FFC107;
          --theme-accent: #1A1A1A;
          --theme-text: #1A1A1A;
          --theme-muted: #6B7280;
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
        
        /* ===== ENHANCED LIGHT MODE ===== */
        .light .buyer-theme-smmvisit {
          background: linear-gradient(180deg, #FFFBEB 0%, #F5F5F5 100%);
        }
        
        .light .buyer-theme-smmvisit .theme-card {
          background: #FFFFFF;
          border: 1px solid #E5E7EB;
          border-radius: 1rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        
        .light .buyer-theme-smmvisit .theme-card:hover {
          box-shadow: 0 8px 24px rgba(255, 215, 0, 0.15);
          border-color: #FFD700;
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
        
        .light .buyer-theme-smmvisit .theme-nav {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(229, 231, 235, 0.8);
        }
        
        .light .buyer-theme-smmvisit .theme-hero {
          background: linear-gradient(180deg, #FFFBEB 0%, #FFF9E6 50%, #F5F5F5 100%);
        }
        
        /* Light mode dashboard elements */
        .light .buyer-theme-smmvisit .glass-card,
        .light .buyer-theme-smmvisit [class*="Card"] {
          background: #FFFFFF !important;
          border-color: #E5E7EB !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
        }
        
        .light .buyer-theme-smmvisit .glass-sidebar {
          background: #FFFFFF !important;
          border-color: #E5E7EB !important;
          box-shadow: 2px 0 20px rgba(0, 0, 0, 0.03) !important;
        }
        
        .light .buyer-theme-smmvisit input,
        .light .buyer-theme-smmvisit textarea,
        .light .buyer-theme-smmvisit select {
          background: #FFFFFF !important;
          border-color: #D1D5DB !important;
          color: #1A1A1A !important;
        }
        
        .light .buyer-theme-smmvisit input::placeholder,
        .light .buyer-theme-smmvisit textarea::placeholder {
          color: #9CA3AF !important;
        }
        
        .light .buyer-theme-smmvisit input:focus,
        .light .buyer-theme-smmvisit textarea:focus,
        .light .buyer-theme-smmvisit select:focus {
          border-color: #FFD700 !important;
          box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.2) !important;
        }
        
        .light .buyer-theme-smmvisit table {
          background: #FFFFFF !important;
        }
        
        .light .buyer-theme-smmvisit thead {
          background: rgba(255, 215, 0, 0.08) !important;
        }
        
        .light .buyer-theme-smmvisit tbody tr:hover {
          background: rgba(255, 215, 0, 0.05) !important;
        }
        
        /* Light mode stats cards */
        .light .buyer-theme-smmvisit .text-2xl,
        .light .buyer-theme-smmvisit .text-3xl,
        .light .buyer-theme-smmvisit .text-4xl {
          color: #1A1A1A !important;
        }
        
        /* Light mode badges with gold accent */
        .light .buyer-theme-smmvisit [class*="Badge"] {
          background: rgba(255, 215, 0, 0.15) !important;
          color: #B8860B !important;
          border-color: rgba(255, 215, 0, 0.3) !important;
        }
        
        /* Light mode button variants */
        .light .buyer-theme-smmvisit button[class*="outline"],
        .light .buyer-theme-smmvisit button[class*="ghost"] {
          background: transparent !important;
          border-color: #D1D5DB !important;
          color: #1A1A1A !important;
        }
        
        .light .buyer-theme-smmvisit button[class*="outline"]:hover,
        .light .buyer-theme-smmvisit button[class*="ghost"]:hover {
          background: rgba(255, 215, 0, 0.1) !important;
          border-color: #FFD700 !important;
        }
        
        /* Light mode navigation hover */
        .light .buyer-theme-smmvisit nav a:hover,
        .light .buyer-theme-smmvisit header a:hover {
          color: #D4A500;
        }
        
        /* Light mode bottom nav */
        .light .buyer-theme-smmvisit .bottom-nav,
        .light .buyer-theme-smmvisit [class*="BottomNav"] {
          background: #FFFFFF !important;
          border-top: 1px solid #E5E7EB !important;
        }
        
        /* ===== COMPREHENSIVE DARK MODE ===== */
        .dark .buyer-theme-smmvisit {
          --theme-background: #0D0D0D;
          --theme-surface: #1A1A1A;
          --theme-text: #FFFFFF;
          --theme-muted: #9CA3AF;
          --panel-nav-active-text: #FFD700;
        }
        
        .dark .buyer-theme-smmvisit {
          background: #0D0D0D;
        }
        
        .dark .buyer-theme-smmvisit .theme-card {
          background: #1A1A1A;
          border: 1px solid rgba(255, 215, 0, 0.15);
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);
        }
        
        .dark .buyer-theme-smmvisit .theme-nav {
          background: rgba(13, 13, 13, 0.98);
          backdrop-filter: blur(12px);
          border-color: rgba(255, 215, 0, 0.1);
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
        
        /* ===== DARK MODE DASHBOARD PAGES ===== */
        /* Main layout background */
        .dark .buyer-theme-smmvisit main,
        .dark .buyer-theme-smmvisit .main-content,
        .dark .buyer-theme-smmvisit [class*="flex-1"] {
          background: #0D0D0D !important;
        }
        
        /* All cards in dashboard */
        .dark .buyer-theme-smmvisit .glass-card,
        .dark .buyer-theme-smmvisit [class*="Card"],
        .dark .buyer-theme-smmvisit .rounded-xl,
        .dark .buyer-theme-smmvisit .rounded-2xl,
        .dark .buyer-theme-smmvisit .rounded-3xl {
          background: #1A1A1A !important;
          border-color: rgba(255, 215, 0, 0.12) !important;
        }
        
        /* Card content text */
        .dark .buyer-theme-smmvisit [class*="CardHeader"],
        .dark .buyer-theme-smmvisit [class*="CardTitle"],
        .dark .buyer-theme-smmvisit [class*="CardDescription"],
        .dark .buyer-theme-smmvisit [class*="CardContent"] {
          color: #FFFFFF !important;
        }
        
        .dark .buyer-theme-smmvisit [class*="CardDescription"] {
          color: #9CA3AF !important;
        }
        
        /* Glass sidebar */
        .dark .buyer-theme-smmvisit .glass-sidebar,
        .dark .buyer-theme-smmvisit aside {
          background: #0D0D0D !important;
          border-color: rgba(255, 215, 0, 0.1) !important;
        }
        
        /* Form inputs */
        .dark .buyer-theme-smmvisit input,
        .dark .buyer-theme-smmvisit textarea,
        .dark .buyer-theme-smmvisit select,
        .dark .buyer-theme-smmvisit [role="combobox"] {
          background: #141414 !important;
          border-color: rgba(255, 215, 0, 0.15) !important;
          color: #FFFFFF !important;
        }
        
        .dark .buyer-theme-smmvisit input::placeholder,
        .dark .buyer-theme-smmvisit textarea::placeholder {
          color: #6B7280 !important;
        }
        
        .dark .buyer-theme-smmvisit input:focus,
        .dark .buyer-theme-smmvisit textarea:focus,
        .dark .buyer-theme-smmvisit select:focus,
        .dark .buyer-theme-smmvisit [role="combobox"]:focus {
          border-color: #FFD700 !important;
          box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.2) !important;
          outline: none !important;
        }
        
        /* Tables */
        .dark .buyer-theme-smmvisit table {
          background: #1A1A1A !important;
        }
        
        .dark .buyer-theme-smmvisit thead,
        .dark .buyer-theme-smmvisit th {
          background: rgba(255, 215, 0, 0.08) !important;
          color: #FFFFFF !important;
        }
        
        .dark .buyer-theme-smmvisit tbody tr {
          border-color: rgba(255, 215, 0, 0.08) !important;
        }
        
        .dark .buyer-theme-smmvisit tbody tr:hover {
          background: rgba(255, 215, 0, 0.05) !important;
        }
        
        .dark .buyer-theme-smmvisit td {
          color: #D1D5DB !important;
        }
        
        /* Text colors */
        .dark .buyer-theme-smmvisit h1,
        .dark .buyer-theme-smmvisit h2,
        .dark .buyer-theme-smmvisit h3,
        .dark .buyer-theme-smmvisit h4,
        .dark .buyer-theme-smmvisit h5,
        .dark .buyer-theme-smmvisit h6 {
          color: #FFFFFF !important;
        }
        
        .dark .buyer-theme-smmvisit p,
        .dark .buyer-theme-smmvisit span:not(.theme-gradient-text):not([class*="Badge"]) {
          color: #D1D5DB !important;
        }
        
        .dark .buyer-theme-smmvisit .text-muted-foreground {
          color: #9CA3AF !important;
        }
        
        /* Stats values */
        .dark .buyer-theme-smmvisit .text-2xl,
        .dark .buyer-theme-smmvisit .text-3xl,
        .dark .buyer-theme-smmvisit .text-4xl,
        .dark .buyer-theme-smmvisit .text-5xl {
          color: #FFFFFF !important;
        }
        
        /* Badges */
        .dark .buyer-theme-smmvisit [class*="Badge"],
        .dark .buyer-theme-smmvisit .badge {
          background: rgba(255, 215, 0, 0.15) !important;
          color: #FFD700 !important;
          border-color: rgba(255, 215, 0, 0.25) !important;
        }
        
        /* Buttons - Default/Outline/Ghost */
        .dark .buyer-theme-smmvisit button:not(.theme-button-primary):not([style*="background"]) {
          color: #FFFFFF !important;
        }
        
        .dark .buyer-theme-smmvisit button[class*="outline"],
        .dark .buyer-theme-smmvisit button[class*="ghost"],
        .dark .buyer-theme-smmvisit button[class*="secondary"] {
          background: #1A1A1A !important;
          border-color: rgba(255, 215, 0, 0.2) !important;
          color: #FFFFFF !important;
        }
        
        .dark .buyer-theme-smmvisit button[class*="outline"]:hover,
        .dark .buyer-theme-smmvisit button[class*="ghost"]:hover,
        .dark .buyer-theme-smmvisit button[class*="secondary"]:hover {
          background: rgba(255, 215, 0, 0.1) !important;
          border-color: rgba(255, 215, 0, 0.3) !important;
        }
        
        /* Quick action cards/buttons */
        .dark .buyer-theme-smmvisit button.h-auto,
        .dark .buyer-theme-smmvisit button[class*="h-auto"],
        .dark .buyer-theme-smmvisit .grid button {
          background: #1A1A1A !important;
          border-color: rgba(255, 215, 0, 0.15) !important;
        }
        
        .dark .buyer-theme-smmvisit button.h-auto:hover,
        .dark .buyer-theme-smmvisit button[class*="h-auto"]:hover,
        .dark .buyer-theme-smmvisit .grid button:hover {
          background: rgba(255, 215, 0, 0.08) !important;
          border-color: rgba(255, 215, 0, 0.25) !important;
        }
        
        .dark .buyer-theme-smmvisit button.h-auto span,
        .dark .buyer-theme-smmvisit button.h-auto p,
        .dark .buyer-theme-smmvisit button[class*="h-auto"] span,
        .dark .buyer-theme-smmvisit button[class*="h-auto"] p {
          color: #FFFFFF !important;
        }
        
        .dark .buyer-theme-smmvisit button .text-muted-foreground {
          color: #9CA3AF !important;
        }
        
        /* Links */
        .dark .buyer-theme-smmvisit a {
          color: #D1D5DB !important;
        }
        
        .dark .buyer-theme-smmvisit a:hover {
          color: #FFD700 !important;
        }
        
        /* Dropdowns and Popovers */
        .dark .buyer-theme-smmvisit [data-radix-popper-content-wrapper] > div,
        .dark .buyer-theme-smmvisit [role="listbox"],
        .dark .buyer-theme-smmvisit [role="menu"],
        .dark .buyer-theme-smmvisit [data-state="open"] > div {
          background: #1A1A1A !important;
          border-color: rgba(255, 215, 0, 0.15) !important;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5) !important;
        }
        
        .dark .buyer-theme-smmvisit [role="option"],
        .dark .buyer-theme-smmvisit [role="menuitem"] {
          color: #FFFFFF !important;
        }
        
        .dark .buyer-theme-smmvisit [role="option"]:hover,
        .dark .buyer-theme-smmvisit [role="menuitem"]:hover,
        .dark .buyer-theme-smmvisit [role="option"][data-highlighted],
        .dark .buyer-theme-smmvisit [role="menuitem"][data-highlighted] {
          background: rgba(255, 215, 0, 0.1) !important;
        }
        
        /* Select trigger */
        .dark .buyer-theme-smmvisit button[aria-haspopup="listbox"] {
          background: #141414 !important;
          border-color: rgba(255, 215, 0, 0.15) !important;
          color: #FFFFFF !important;
        }
        
        .dark .buyer-theme-smmvisit button[aria-haspopup="listbox"]:hover {
          border-color: rgba(255, 215, 0, 0.3) !important;
        }
        
        /* Dialogs and Sheets */
        .dark .buyer-theme-smmvisit [role="dialog"],
        .dark .buyer-theme-smmvisit [class*="DialogContent"],
        .dark .buyer-theme-smmvisit [class*="SheetContent"],
        .dark .buyer-theme-smmvisit [data-vaul-drawer] {
          background: #0D0D0D !important;
          border-color: rgba(255, 215, 0, 0.15) !important;
        }
        
        /* Tabs */
        .dark .buyer-theme-smmvisit [role="tablist"] {
          background: rgba(255, 215, 0, 0.05) !important;
        }
        
        .dark .buyer-theme-smmvisit [role="tab"] {
          color: #9CA3AF !important;
        }
        
        .dark .buyer-theme-smmvisit [role="tab"][data-state="active"] {
          background: #1A1A1A !important;
          color: #FFD700 !important;
        }
        
        /* Accordion */
        .dark .buyer-theme-smmvisit [data-state="open"] {
          background: rgba(255, 215, 0, 0.05) !important;
        }
        
        /* Skeleton loading */
        .dark .buyer-theme-smmvisit .skeleton,
        .dark .buyer-theme-smmvisit [class*="Skeleton"] {
          background: rgba(255, 215, 0, 0.1) !important;
        }
        
        /* Scrollbar */
        .dark .buyer-theme-smmvisit ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        .dark .buyer-theme-smmvisit ::-webkit-scrollbar-thumb {
          background: rgba(255, 215, 0, 0.25);
          border-radius: 4px;
        }
        
        .dark .buyer-theme-smmvisit ::-webkit-scrollbar-track {
          background: rgba(255, 215, 0, 0.05);
        }
        
        /* Footer */
        .dark .buyer-theme-smmvisit footer {
          background: #0D0D0D !important;
          border-top: 1px solid rgba(255, 215, 0, 0.1) !important;
        }
        
        /* Navigation links */
        .dark .buyer-theme-smmvisit nav a,
        .dark .buyer-theme-smmvisit header a {
          color: #D1D5DB !important;
        }
        
        .dark .buyer-theme-smmvisit nav a:hover,
        .dark .buyer-theme-smmvisit header a:hover,
        .dark .buyer-theme-smmvisit nav a.active {
          color: #FFD700 !important;
        }
        
        .dark .buyer-theme-smmvisit .nav-item.active,
        .dark .buyer-theme-smmvisit .nav-item:hover {
          background: rgba(255, 215, 0, 0.1) !important;
        }
        
        /* Sidebar navigation */
        .dark .buyer-theme-smmvisit [class*="SidebarContent"] {
          background: #0D0D0D !important;
        }
        
        .dark .buyer-theme-smmvisit [class*="SidebarContent"] a {
          color: #D1D5DB !important;
        }
        
        .dark .buyer-theme-smmvisit [class*="SidebarContent"] a:hover,
        .dark .buyer-theme-smmvisit [class*="SidebarContent"] a.active {
          background: rgba(255, 215, 0, 0.08) !important;
          color: #FFD700 !important;
        }
        
        /* ===== BOTTOM NAV BAR - DARK MODE ===== */
        .dark .buyer-theme-smmvisit .bottom-nav,
        .dark .buyer-theme-smmvisit [class*="BottomNav"],
        .dark .buyer-theme-smmvisit nav[class*="fixed"][class*="bottom"],
        .dark .buyer-theme-smmvisit .fixed.bottom-0 {
          background: rgba(13, 13, 13, 0.98) !important;
          backdrop-filter: blur(12px) !important;
          border-top: 1px solid rgba(255, 215, 0, 0.1) !important;
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3) !important;
        }
        
        /* Bottom nav items */
        .dark .buyer-theme-smmvisit .bottom-nav a,
        .dark .buyer-theme-smmvisit [class*="BottomNav"] a,
        .dark .buyer-theme-smmvisit .fixed.bottom-0 a {
          color: #9CA3AF !important;
        }
        
        .dark .buyer-theme-smmvisit .bottom-nav a:hover,
        .dark .buyer-theme-smmvisit [class*="BottomNav"] a:hover,
        .dark .buyer-theme-smmvisit .fixed.bottom-0 a:hover {
          color: #FFD700 !important;
        }
        
        .dark .buyer-theme-smmvisit .bottom-nav a.active,
        .dark .buyer-theme-smmvisit [class*="BottomNav"] a.active,
        .dark .buyer-theme-smmvisit .fixed.bottom-0 a.active,
        .dark .buyer-theme-smmvisit .bottom-nav a[data-active="true"],
        .dark .buyer-theme-smmvisit [class*="BottomNav"] a[data-active="true"] {
          color: #FFD700 !important;
        }
        
        /* Bottom nav center button (FAB style) */
        .dark .buyer-theme-smmvisit .bottom-nav button[class*="center"],
        .dark .buyer-theme-smmvisit [class*="BottomNav"] button,
        .dark .buyer-theme-smmvisit .fixed.bottom-0 button {
          background: linear-gradient(135deg, #FFD700 0%, #FFC107 100%) !important;
          color: #1A1A1A !important;
          box-shadow: 0 4px 20px rgba(255, 215, 0, 0.35) !important;
        }
        
        /* Bottom nav icons */
        .dark .buyer-theme-smmvisit .bottom-nav svg,
        .dark .buyer-theme-smmvisit [class*="BottomNav"] svg,
        .dark .buyer-theme-smmvisit .fixed.bottom-0 svg {
          color: inherit !important;
        }
        
        /* Bottom nav text labels */
        .dark .buyer-theme-smmvisit .bottom-nav span,
        .dark .buyer-theme-smmvisit [class*="BottomNav"] span,
        .dark .buyer-theme-smmvisit .fixed.bottom-0 span {
          color: inherit !important;
        }
        
        /* Ensure proper color inheritance */
        .dark .buyer-theme-smmvisit * {
          border-color: inherit;
        }
        
        .dark .buyer-theme-smmvisit,
        .dark .buyer-theme-smmvisit .buyer-theme-wrapper {
          color: #FFFFFF;
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
      background: '#0D0D0D',
      surface: '#1A1A1A',
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