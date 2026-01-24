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
        
        /* ===== DARK MODE - PREMIUM GOLD STYLING ===== */
        .dark .buyer-theme-smmvisit {
          --theme-background: #1C1F26;
          --theme-surface: #262A33;
          --theme-text: #FFFFFF;
          --theme-muted: #9CA3AF;
          --panel-nav-active-text: #FFD700;
        }
        
        /* Premium gradient background with gold accents */
        .dark .buyer-theme-smmvisit {
          background: 
            radial-gradient(ellipse at top left, rgba(255, 215, 0, 0.08) 0%, transparent 40%),
            radial-gradient(ellipse at bottom right, rgba(255, 193, 7, 0.06) 0%, transparent 40%),
            linear-gradient(180deg, #1C1F26 0%, #171A20 100%);
          color: #FFFFFF;
        }
        
        .dark .buyer-theme-smmvisit .theme-card {
          background: linear-gradient(135deg, #262A33 0%, #1C1F26 100%);
          border: 1px solid rgba(255, 215, 0, 0.15);
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
          transition: all 0.3s ease;
        }
        
        .dark .buyer-theme-smmvisit .theme-card:hover {
          box-shadow: 0 0 40px rgba(255, 215, 0, 0.12), 0 8px 32px rgba(0, 0, 0, 0.35);
          border-color: rgba(255, 215, 0, 0.3);
          transform: translateY(-4px);
        }
        
        .dark .buyer-theme-smmvisit .theme-nav {
          background: rgba(28, 31, 38, 0.95);
          backdrop-filter: blur(16px);
          border-color: rgba(255, 215, 0, 0.1);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.4);
        }
        
        .dark .buyer-theme-smmvisit .theme-hero {
          background: radial-gradient(ellipse at top, rgba(255, 215, 0, 0.1) 0%, transparent 50%);
        }
        
        /* Enhanced primary button with glow */
        .dark .buyer-theme-smmvisit .theme-button-primary {
          box-shadow: 
            0 4px 20px rgba(255, 215, 0, 0.4),
            0 0 50px rgba(255, 215, 0, 0.2);
          transition: all 0.3s ease;
        }
        
        .dark .buyer-theme-smmvisit .theme-button-primary:hover {
          box-shadow: 
            0 6px 35px rgba(255, 215, 0, 0.55),
            0 0 70px rgba(255, 215, 0, 0.3);
          transform: translateY(-2px);
        }
        
        .dark .buyer-theme-smmvisit .theme-badge {
          background: rgba(255, 215, 0, 0.15);
          color: #FFD700;
          border: 1px solid rgba(255, 215, 0, 0.25);
        }
        
        /* Glass cards with premium gold tint */
        .dark .buyer-theme-smmvisit .glass-card,
        .dark .buyer-theme-smmvisit [class*="Card"] {
          background: linear-gradient(135deg, rgba(38, 42, 51, 0.95), rgba(28, 31, 38, 0.9));
          backdrop-filter: blur(10px);
          border-color: rgba(255, 215, 0, 0.12);
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
          transition: all 0.3s ease;
        }
        
        .dark .buyer-theme-smmvisit .glass-card:hover,
        .dark .buyer-theme-smmvisit [class*="Card"]:hover {
          box-shadow: 0 0 40px rgba(255, 215, 0, 0.1), 0 8px 32px rgba(0, 0, 0, 0.35);
          border-color: rgba(255, 215, 0, 0.2);
        }
        
        /* Stats cards with gold gradient overlay */
        .dark .buyer-theme-smmvisit .glass-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.05) 0%, transparent 60%);
          border-radius: inherit;
          pointer-events: none;
        }
        
        .dark .buyer-theme-smmvisit .glass-sidebar {
          background: rgba(28, 31, 38, 0.98);
          backdrop-filter: blur(12px);
          border-color: rgba(255, 215, 0, 0.1);
          box-shadow: 2px 0 30px rgba(0, 0, 0, 0.4);
        }
        
        /* Form elements with gold focus */
        .dark .buyer-theme-smmvisit input,
        .dark .buyer-theme-smmvisit textarea,
        .dark .buyer-theme-smmvisit select {
          background: rgba(28, 31, 38, 0.9);
          border-color: rgba(255, 215, 0, 0.15);
          color: #FFFFFF;
          transition: all 0.2s ease;
        }
        
        .dark .buyer-theme-smmvisit input::placeholder,
        .dark .buyer-theme-smmvisit textarea::placeholder {
          color: #6B7280;
        }
        
        .dark .buyer-theme-smmvisit input:focus,
        .dark .buyer-theme-smmvisit textarea:focus,
        .dark .buyer-theme-smmvisit select:focus {
          border-color: #FFD700;
          box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.2), 0 0 20px rgba(255, 215, 0, 0.15);
          outline: none;
        }
        
        /* Tables with gold accents */
        .dark .buyer-theme-smmvisit table {
          background: #262A33;
        }
        
        .dark .buyer-theme-smmvisit thead {
          background: rgba(255, 215, 0, 0.1);
        }
        
        .dark .buyer-theme-smmvisit tbody tr {
          transition: background 0.2s ease;
        }
        
        .dark .buyer-theme-smmvisit tbody tr:hover {
          background: rgba(255, 215, 0, 0.08);
        }
        
        /* Typography - white text in dark mode */
        .dark .buyer-theme-smmvisit h1,
        .dark .buyer-theme-smmvisit h2,
        .dark .buyer-theme-smmvisit h3,
        .dark .buyer-theme-smmvisit h4,
        .dark .buyer-theme-smmvisit h5,
        .dark .buyer-theme-smmvisit h6 {
          color: #FFFFFF;
        }
        
        .dark .buyer-theme-smmvisit p,
        .dark .buyer-theme-smmvisit span:not(.theme-gradient-text):not(.balance-display):not(button span) {
          color: #E5E7EB;
        }
        
        /* Balance display - always white */
        .buyer-theme-smmvisit .balance-display,
        .light .buyer-theme-smmvisit .balance-display,
        .dark .buyer-theme-smmvisit .balance-display {
          color: #FFFFFF !important;
        }
        
        .dark .buyer-theme-smmvisit .text-muted-foreground {
          color: #9CA3AF;
        }
        
        /* Dashboard text sizes - always white */
        .dark .buyer-theme-smmvisit .text-2xl,
        .dark .buyer-theme-smmvisit .text-3xl,
        .dark .buyer-theme-smmvisit .text-4xl,
        .dark .buyer-theme-smmvisit .text-5xl {
          color: #FFFFFF;
        }
        
        /* Navigation with gold hover glow */
        .dark .buyer-theme-smmvisit nav a,
        .dark .buyer-theme-smmvisit header a {
          color: #E5E7EB;
          transition: all 0.2s ease;
        }
        
        .dark .buyer-theme-smmvisit nav a:hover,
        .dark .buyer-theme-smmvisit header a:hover {
          color: #FFD700;
          text-shadow: 0 0 12px rgba(255, 215, 0, 0.4);
        }
        
        /* Active navigation with gold indicator */
        .dark .buyer-theme-smmvisit .nav-item.active,
        .dark .buyer-theme-smmvisit aside a.active {
          background: rgba(255, 215, 0, 0.15);
          border-left: 3px solid #FFD700;
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
          border-color: rgba(255, 215, 0, 0.2);
          color: #FFFFFF;
          transition: all 0.2s ease;
        }
        
        .dark .buyer-theme-smmvisit button[class*="outline"]:hover,
        .dark .buyer-theme-smmvisit button[class*="ghost"]:hover,
        .dark .buyer-theme-smmvisit button[class*="secondary"]:hover {
          background: rgba(255, 215, 0, 0.12);
          border-color: rgba(255, 215, 0, 0.4);
          box-shadow: 0 0 20px rgba(255, 215, 0, 0.15);
        }
        
        /* Footer with gradient border */
        .dark .buyer-theme-smmvisit footer {
          background: linear-gradient(180deg, #1C1F26 0%, #171A20 100%);
          border-top: 1px solid rgba(255, 215, 0, 0.15);
          position: relative;
        }
        
        .dark .buyer-theme-smmvisit footer::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.5), transparent);
        }
        
        /* Dropdowns with gold styling */
        .dark .buyer-theme-smmvisit [data-radix-popper-content-wrapper] > div,
        .dark .buyer-theme-smmvisit [role="listbox"],
        .dark .buyer-theme-smmvisit [role="menu"] {
          background: #262A33;
          border-color: rgba(255, 215, 0, 0.2);
          box-shadow: 0 10px 50px rgba(0, 0, 0, 0.4);
        }
        
        .dark .buyer-theme-smmvisit [role="option"],
        .dark .buyer-theme-smmvisit [role="menuitem"] {
          color: #FFFFFF;
          transition: all 0.15s ease;
        }
        
        .dark .buyer-theme-smmvisit [role="option"]:hover,
        .dark .buyer-theme-smmvisit [role="option"][data-highlighted],
        .dark .buyer-theme-smmvisit [role="menuitem"]:hover {
          background: rgba(255, 215, 0, 0.15);
          color: #FFD700;
        }
        
        .dark .buyer-theme-smmvisit [role="option"][aria-selected="true"] {
          background: rgba(255, 215, 0, 0.2);
          color: #FFD700;
        }
        
        /* Bottom navigation - premium glass effect */
        .dark .buyer-theme-smmvisit nav.fixed.bottom-0 {
          background: rgba(28, 31, 38, 0.98);
          backdrop-filter: blur(16px);
          border-top: 1px solid rgba(255, 215, 0, 0.15);
          z-index: 50;
          pointer-events: auto;
          box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.3);
        }
        
        .dark .buyer-theme-smmvisit nav.fixed.bottom-0 button,
        .dark .buyer-theme-smmvisit nav.fixed.bottom-0 a,
        .dark .buyer-theme-smmvisit nav.fixed.bottom-0 span {
          color: #9CA3AF;
          transition: all 0.2s ease;
        }
        
        .dark .buyer-theme-smmvisit nav.fixed.bottom-0 button:hover,
        .dark .buyer-theme-smmvisit nav.fixed.bottom-0 a:hover {
          color: #FFD700;
          text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
        }
        
        /* Dialog/modal with premium styling */
        .dark .buyer-theme-smmvisit [role="dialog"] {
          background: linear-gradient(135deg, #262A33, #1C1F26);
          border: 1px solid rgba(255, 215, 0, 0.15);
          box-shadow: 0 25px 100px rgba(0, 0, 0, 0.5);
        }
        
        /* Tabs with gold accent */
        .dark .buyer-theme-smmvisit [role="tablist"] {
          background: rgba(255, 215, 0, 0.06);
          border-radius: 12px;
        }
        
        .dark .buyer-theme-smmvisit [role="tab"][data-state="active"] {
          background: #262A33;
          color: #FFD700;
          box-shadow: 0 0 15px rgba(255, 215, 0, 0.2);
        }
        
        /* Accordion with gold highlight */
        .dark .buyer-theme-smmvisit [data-state="open"] {
          background: rgba(255, 215, 0, 0.06);
          border-radius: 12px;
        }
        
        /* Sidebar */
        .dark .buyer-theme-smmvisit aside a {
          color: #D1D5DB;
          transition: all 0.2s ease;
        }
        
        .dark .buyer-theme-smmvisit aside a:hover,
        .dark .buyer-theme-smmvisit aside a.active {
          background: rgba(255, 215, 0, 0.12);
          color: #FFD700;
        }
        
        /* Premium gold scrollbar */
        .dark .buyer-theme-smmvisit ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        .dark .buyer-theme-smmvisit ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(255, 215, 0, 0.35), rgba(255, 193, 7, 0.25));
          border-radius: 4px;
        }
        
        .dark .buyer-theme-smmvisit ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(255, 215, 0, 0.5), rgba(255, 193, 7, 0.4));
        }
        
        .dark .buyer-theme-smmvisit ::-webkit-scrollbar-track {
          background: rgba(255, 215, 0, 0.05);
        }
        
        /* Border colors */
        .dark .buyer-theme-smmvisit .border,
        .dark .buyer-theme-smmvisit .border-border {
          border-color: rgba(255, 215, 0, 0.12);
        }
        
        /* Dividers with gold gradient */
        .dark .buyer-theme-smmvisit hr,
        .dark .buyer-theme-smmvisit .divider {
          background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.25), transparent);
          height: 1px;
          border: none;
        }
        
        /* Mobile drawer/sheet */
        .dark .buyer-theme-smmvisit [data-vaul-drawer],
        .dark .buyer-theme-smmvisit [class*="SheetContent"] {
          background: linear-gradient(180deg, #1C1F26 0%, #171A20 100%);
        }
        
        /* Quick action buttons - premium styling */
        .dark .buyer-theme-smmvisit button.h-auto,
        .dark .buyer-theme-smmvisit button[class*="h-auto"] {
          background: linear-gradient(135deg, #262A33, #1C1F26);
          border: 1px solid rgba(255, 215, 0, 0.2);
          transition: all 0.25s ease;
        }
        
        .dark .buyer-theme-smmvisit button.h-auto:hover,
        .dark .buyer-theme-smmvisit button[class*="h-auto"]:hover {
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 193, 7, 0.1));
          border-color: rgba(255, 215, 0, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 215, 0, 0.1);
        }
        
        .dark .buyer-theme-smmvisit button.h-auto span,
        .dark .buyer-theme-smmvisit button.h-auto p,
        .dark .buyer-theme-smmvisit button[class*="h-auto"] span,
        .dark .buyer-theme-smmvisit button[class*="h-auto"] p {
          color: #FFFFFF !important;
        }
        
        .dark .buyer-theme-smmvisit button.h-auto .text-muted-foreground,
        .dark .buyer-theme-smmvisit button[class*="h-auto"] .text-muted-foreground {
          color: rgba(255, 255, 255, 0.65) !important;
        }
        
        /* Link button spans */
        .dark .buyer-theme-smmvisit a button span {
          color: #FFD700 !important;
        }
        
        /* CardContent text adjustments */
        .dark .buyer-theme-smmvisit [class*="CardContent"] .text-muted-foreground {
          color: rgba(255, 255, 255, 0.7) !important;
        }
        
        /* Button spans in general */
        .dark .buyer-theme-smmvisit button .text-muted-foreground {
          color: rgba(255, 255, 255, 0.65) !important;
        }
        
        /* Ensure proper color inheritance */
        .dark .buyer-theme-smmvisit,
        .dark .buyer-theme-smmvisit .buyer-theme-wrapper {
          color: #FFFFFF;
        }
        
        .dark .buyer-theme-smmvisit a {
          color: #E5E7EB;
          transition: all 0.2s ease;
        }
        
        .dark .buyer-theme-smmvisit a:hover {
          color: #FFD700;
        }
        
        /* ===== GOLD SHIMMER LOADING SKELETON ===== */
        @keyframes shimmer-gold {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        
        .dark .buyer-theme-smmvisit .skeleton,
        .dark .buyer-theme-smmvisit [class*="Skeleton"] {
          background: linear-gradient(90deg, 
            rgba(255, 215, 0, 0.08) 0%, 
            rgba(255, 215, 0, 0.18) 50%, 
            rgba(255, 215, 0, 0.08) 100%);
          background-size: 200% 100%;
          animation: shimmer-gold 1.5s infinite;
        }
        
        /* Progress bar with gold glow */
        .dark .buyer-theme-smmvisit [role="progressbar"] > div {
          background: linear-gradient(90deg, #FFD700, #FFC107);
          box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
        }
        
        /* Order status badges */
        .dark .buyer-theme-smmvisit .status-pending {
          background: rgba(251, 191, 36, 0.15);
          color: #FBBF24;
          border: 1px solid rgba(251, 191, 36, 0.3);
        }
        
        .dark .buyer-theme-smmvisit .status-completed {
          background: rgba(34, 197, 94, 0.15);
          color: #22C55E;
          border: 1px solid rgba(34, 197, 94, 0.3);
        }
        
        .dark .buyer-theme-smmvisit .status-in_progress {
          background: rgba(255, 215, 0, 0.15);
          color: #FFD700;
          border: 1px solid rgba(255, 215, 0, 0.3);
        }
        
        /* Switch/toggle gold accent */
        .dark .buyer-theme-smmvisit [role="switch"][data-state="checked"] {
          background: linear-gradient(135deg, #FFD700, #FFC107);
          box-shadow: 0 0 10px rgba(255, 215, 0, 0.4);
        }
        
        /* Slider gold track */
        .dark .buyer-theme-smmvisit [role="slider"] {
          background: rgba(255, 215, 0, 0.2);
        }
        
        .dark .buyer-theme-smmvisit [role="slider"] > span {
          background: #FFD700;
        }
        
        /* Tooltip dark mode */
        .dark .buyer-theme-smmvisit [role="tooltip"] {
          background: #262A33;
          border: 1px solid rgba(255, 215, 0, 0.2);
          color: #FFFFFF;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }
        
        /* Alert/toast gold border */
        .dark .buyer-theme-smmvisit [role="alert"] {
          background: #262A33;
          border-left: 4px solid #FFD700;
        }
        
        /* Gold focus states */
        .dark .buyer-theme-smmvisit *:focus-visible {
          outline: 2px solid rgba(255, 215, 0, 0.5);
          outline-offset: 2px;
        }
        
        /* Notification badge gold pulse */
        @keyframes pulse-gold {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.5); }
          50% { box-shadow: 0 0 0 8px rgba(255, 215, 0, 0); }
        }
        
        .dark .buyer-theme-smmvisit .notification-badge {
          background: #FFD700;
          animation: pulse-gold 2s infinite;
        }
        
        /* Service cards */
        .dark .buyer-theme-smmvisit .service-card {
          background: linear-gradient(135deg, #262A33 0%, #1C1F26 100%);
          border: 1px solid rgba(255, 215, 0, 0.1);
          transition: all 0.3s ease;
        }
        
        .dark .buyer-theme-smmvisit .service-card:hover {
          border-color: rgba(255, 215, 0, 0.3);
          box-shadow: 0 0 25px rgba(255, 215, 0, 0.12);
          transform: translateY(-2px);
        }
        
        /* Category pills */
        .dark .buyer-theme-smmvisit .category-pill {
          background: rgba(38, 42, 51, 0.9);
          border: 1px solid rgba(255, 215, 0, 0.15);
          transition: all 0.2s ease;
        }
        
        .dark .buyer-theme-smmvisit .category-pill:hover,
        .dark .buyer-theme-smmvisit .category-pill.active {
          background: rgba(255, 215, 0, 0.15);
          border-color: rgba(255, 215, 0, 0.4);
          color: #FFD700;
        }
        
        /* Price tag gold highlight */
        .dark .buyer-theme-smmvisit .price-tag {
          color: #FFD700;
          text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
        }
        
        /* Favorite button glow */
        .dark .buyer-theme-smmvisit .favorite-btn.active {
          color: #FFD700;
          filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.5));
        }
        
        /* Kanban headers */
        .dark .buyer-theme-smmvisit .kanban-header {
          background: rgba(255, 215, 0, 0.08);
          border-bottom: 2px solid rgba(255, 215, 0, 0.2);
        }
        
        /* Empty state */
        .dark .buyer-theme-smmvisit .empty-state {
          color: rgba(255, 215, 0, 0.6);
        }
        
        /* Social icons in dark mode - glow effect */
        .dark .buyer-theme-smmvisit .social-icon-wrapper {
          transition: all 0.3s ease;
        }
        
        .dark .buyer-theme-smmvisit .social-icon-wrapper:hover {
          box-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
          transform: scale(1.1);
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
