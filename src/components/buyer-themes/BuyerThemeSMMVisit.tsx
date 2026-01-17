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
        
        /* ===== ENHANCED LIGHT MODE - CLEAN & VISIBLE ===== */
        .light .buyer-theme-smmvisit {
          background: #F5F5F5 !important;
          color: #1A1A1A !important;
        }
        
        /* Force all text to be dark in light mode */
        .light .buyer-theme-smmvisit h1,
        .light .buyer-theme-smmvisit h2,
        .light .buyer-theme-smmvisit h3,
        .light .buyer-theme-smmvisit h4,
        .light .buyer-theme-smmvisit h5,
        .light .buyer-theme-smmvisit h6,
        .light .buyer-theme-smmvisit p,
        .light .buyer-theme-smmvisit span:not(.theme-gradient-text),
        .light .buyer-theme-smmvisit label,
        .light .buyer-theme-smmvisit div {
          color: #1A1A1A;
        }
        
        .light .buyer-theme-smmvisit .text-muted-foreground {
          color: #6B7280 !important;
        }
        
        .light .buyer-theme-smmvisit .theme-card {
          background: #FFFFFF !important;
          border: 1px solid #E5E7EB !important;
          border-radius: 1rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          color: #1A1A1A !important;
        }
        
        .light .buyer-theme-smmvisit .theme-card:hover {
          box-shadow: 0 8px 24px rgba(255, 215, 0, 0.15);
          border-color: #FFD700 !important;
        }
        
        /* Light mode auth page */
        .light .buyer-theme-smmvisit .bg-background {
          background: #F5F5F5 !important;
        }
        
        .light .buyer-theme-smmvisit .bg-card {
          background: #FFFFFF !important;
        }
        
        .light .buyer-theme-smmvisit .border-border {
          border-color: #E5E7EB !important;
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
        .light .buyer-theme-smmvisit [class*="BottomNav"],
        .light .buyer-theme-smmvisit nav.fixed.bottom-0 {
          background: #FFFFFF !important;
          border-top: 1px solid #E5E7EB !important;
        }
        
        .light .buyer-theme-smmvisit nav.fixed.bottom-0 button,
        .light .buyer-theme-smmvisit nav.fixed.bottom-0 a,
        .light .buyer-theme-smmvisit nav.fixed.bottom-0 span {
          color: #6B7280 !important;
        }
        
        .light .buyer-theme-smmvisit nav.fixed.bottom-0 button:hover,
        .light .buyer-theme-smmvisit nav.fixed.bottom-0 a:hover {
          color: #D4A500 !important;
        }
        
        /* Light mode sidebar */
        .light .buyer-theme-smmvisit aside,
        .light .buyer-theme-smmvisit .glass-sidebar {
          background: #FFFFFF !important;
          border-color: #E5E7EB !important;
        }
        
        .light .buyer-theme-smmvisit aside a,
        .light .buyer-theme-smmvisit aside button {
          color: #1A1A1A !important;
        }
        
        .light .buyer-theme-smmvisit aside a:hover,
        .light .buyer-theme-smmvisit aside a.active {
          background: rgba(255, 215, 0, 0.15) !important;
          color: #B8860B !important;
        }
        
        /* ===== COMPREHENSIVE DARK MODE ===== */
        .dark .buyer-theme-smmvisit {
          --theme-background: #1A1A1A;
          --theme-surface: #262626;
          --theme-text: #FFFFFF;
          --theme-muted: #9CA3AF;
          --panel-nav-active-text: #FFD700;
        }
        
        .dark .buyer-theme-smmvisit {
          background: linear-gradient(180deg, #1A1A1A 0%, #141414 100%);
        }
        
        .dark .buyer-theme-smmvisit .theme-card {
          background: #262626;
          border: 1px solid rgba(255, 215, 0, 0.2);
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
        }
        
        .dark .buyer-theme-smmvisit .theme-nav {
          background: rgba(26, 26, 26, 0.98);
          backdrop-filter: blur(12px);
          border-color: rgba(255, 215, 0, 0.15);
        }
        
        .dark .buyer-theme-smmvisit .theme-hero {
          background: radial-gradient(ellipse at top, rgba(255, 215, 0, 0.1) 0%, transparent 50%);
        }
        
        .dark .buyer-theme-smmvisit .theme-button-primary {
          box-shadow: 0 4px 20px rgba(255, 215, 0, 0.35);
        }
        
        .dark .buyer-theme-smmvisit .theme-button-primary:hover {
          box-shadow: 0 6px 30px rgba(255, 215, 0, 0.5);
        }
        
        /* Dark mode dashboard elements */
        .dark .buyer-theme-smmvisit .glass-card,
        .dark .buyer-theme-smmvisit [class*="Card"] {
          background: #262626 !important;
          border-color: rgba(255, 215, 0, 0.15) !important;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3) !important;
        }
        
        .dark .buyer-theme-smmvisit .glass-sidebar {
          background: rgba(26, 26, 26, 0.98) !important;
          border-color: rgba(255, 215, 0, 0.1) !important;
          box-shadow: 2px 0 20px rgba(0, 0, 0, 0.4) !important;
        }
        
        .dark .buyer-theme-smmvisit input,
        .dark .buyer-theme-smmvisit textarea,
        .dark .buyer-theme-smmvisit select {
          background: #1A1A1A !important;
          border-color: rgba(255, 215, 0, 0.2) !important;
          color: #FFFFFF !important;
        }
        
        .dark .buyer-theme-smmvisit input::placeholder,
        .dark .buyer-theme-smmvisit textarea::placeholder {
          color: #6B7280 !important;
        }
        
        .dark .buyer-theme-smmvisit input:focus,
        .dark .buyer-theme-smmvisit textarea:focus,
        .dark .buyer-theme-smmvisit select:focus {
          border-color: #FFD700 !important;
          box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.25) !important;
        }
        
        .dark .buyer-theme-smmvisit table {
          background: #262626 !important;
        }
        
        .dark .buyer-theme-smmvisit thead {
          background: rgba(255, 215, 0, 0.1) !important;
        }
        
        .dark .buyer-theme-smmvisit tbody tr:hover {
          background: rgba(255, 215, 0, 0.08) !important;
        }
        
        .dark .buyer-theme-smmvisit .nav-item.active,
        .dark .buyer-theme-smmvisit .nav-item:hover {
          background: rgba(255, 215, 0, 0.15) !important;
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
          color: #D1D5DB;
        }
        
        .dark .buyer-theme-smmvisit .text-muted-foreground {
          color: #9CA3AF !important;
        }
        
        /* Dark mode badges */
        .dark .buyer-theme-smmvisit [class*="Badge"],
        .dark .buyer-theme-smmvisit .badge {
          background: rgba(255, 215, 0, 0.2) !important;
          color: #FFD700 !important;
          border-color: rgba(255, 215, 0, 0.3) !important;
        }
        
        /* Dark mode footer */
        .dark .buyer-theme-smmvisit footer {
          background: linear-gradient(180deg, #1A1A1A 0%, #141414 100%) !important;
          border-top: 1px solid rgba(255, 215, 0, 0.1) !important;
        }
        
        /* Dark mode dropdowns and popovers */
        .dark .buyer-theme-smmvisit [data-radix-popper-content-wrapper] > div,
        .dark .buyer-theme-smmvisit [role="listbox"],
        .dark .buyer-theme-smmvisit [role="menu"] {
          background: #262626 !important;
          border-color: rgba(255, 215, 0, 0.2) !important;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.35) !important;
        }
        
        /* Dark mode select options */
        .dark .buyer-theme-smmvisit [role="option"],
        .dark .buyer-theme-smmvisit [role="menuitem"] {
          color: #FFFFFF !important;
        }
        
        .dark .buyer-theme-smmvisit [role="option"]:hover,
        .dark .buyer-theme-smmvisit [role="menuitem"]:hover,
        .dark .buyer-theme-smmvisit [role="option"][data-highlighted],
        .dark .buyer-theme-smmvisit [role="menuitem"][data-highlighted] {
          background: rgba(255, 215, 0, 0.15) !important;
        }
        
        /* Dark mode skeleton loading */
        .dark .buyer-theme-smmvisit .skeleton,
        .dark .buyer-theme-smmvisit [class*="Skeleton"] {
          background: rgba(255, 215, 0, 0.15) !important;
        }
        
        /* Dark mode scrollbar */
        .dark .buyer-theme-smmvisit ::-webkit-scrollbar-thumb {
          background: rgba(255, 215, 0, 0.3);
        }
        .dark .buyer-theme-smmvisit ::-webkit-scrollbar-track {
          background: rgba(255, 215, 0, 0.08);
        }
        
        /* Dark mode accordion */
        .dark .buyer-theme-smmvisit [data-state="open"] {
          background: rgba(255, 215, 0, 0.08) !important;
        }
        
        /* Dark mode buttons - comprehensive */
        .dark .buyer-theme-smmvisit button:not(.theme-button-primary):not([class*="gradient"]) {
          color: #FFFFFF;
        }
        
        /* Fix quick action buttons in dashboard */
        .dark .buyer-theme-smmvisit button.h-auto,
        .dark .buyer-theme-smmvisit .h-auto.rounded-xl,
        .dark .buyer-theme-smmvisit button[class*="h-auto"] {
          background: #262626 !important;
          border-color: rgba(255, 215, 0, 0.25) !important;
        }
        
        .dark .buyer-theme-smmvisit button.h-auto:hover,
        .dark .buyer-theme-smmvisit button[class*="h-auto"]:hover {
          background: rgba(255, 215, 0, 0.15) !important;
          border-color: rgba(255, 215, 0, 0.4) !important;
        }
        
        .dark .buyer-theme-smmvisit button.h-auto span,
        .dark .buyer-theme-smmvisit button.h-auto .font-medium,
        .dark .buyer-theme-smmvisit button.h-auto p,
        .dark .buyer-theme-smmvisit button[class*="h-auto"] span,
        .dark .buyer-theme-smmvisit button[class*="h-auto"] p {
          color: #FFFFFF !important;
        }
        
        .dark .buyer-theme-smmvisit button.h-auto .text-muted-foreground,
        .dark .buyer-theme-smmvisit button.h-auto p.text-muted-foreground,
        .dark .buyer-theme-smmvisit button[class*="h-auto"] .text-muted-foreground {
          color: rgba(255, 255, 255, 0.65) !important;
        }
        
        /* Fix outline/ghost variant buttons */
        .dark .buyer-theme-smmvisit button[class*="outline"],
        .dark .buyer-theme-smmvisit button[class*="ghost"],
        .dark .buyer-theme-smmvisit button[class*="secondary"] {
          background: rgba(38, 38, 38, 0.95) !important;
          border-color: rgba(255, 215, 0, 0.3) !important;
          color: #FFFFFF !important;
        }
        
        .dark .buyer-theme-smmvisit button[class*="outline"]:hover,
        .dark .buyer-theme-smmvisit button[class*="ghost"]:hover,
        .dark .buyer-theme-smmvisit button[class*="secondary"]:hover {
          background: rgba(255, 215, 0, 0.15) !important;
          border-color: rgba(255, 215, 0, 0.5) !important;
        }
        
        .dark .buyer-theme-smmvisit button[class*="outline"] span,
        .dark .buyer-theme-smmvisit button[class*="ghost"] span,
        .dark .buyer-theme-smmvisit button[class*="secondary"] span {
          color: #FFFFFF !important;
        }
        
        /* Fix "View All" buttons */
        .dark .buyer-theme-smmvisit a button,
        .dark .buyer-theme-smmvisit a > .inline-flex {
          color: #FFD700 !important;
        }
        
        .dark .buyer-theme-smmvisit a button span {
          color: #FFD700 !important;
        }
        
        .dark .buyer-theme-smmvisit a {
          color: #D1D5DB;
        }
        
        .dark .buyer-theme-smmvisit a:hover {
          color: #FFD700;
        }
        
        /* Dark mode secondary buttons */
        .dark .buyer-theme-smmvisit .btn-secondary {
          background: rgba(255, 215, 0, 0.1) !important;
          color: #FFD700 !important;
          border-color: rgba(255, 215, 0, 0.25) !important;
        }
        
        .dark .buyer-theme-smmvisit .btn-secondary:hover {
          background: rgba(255, 215, 0, 0.2) !important;
        }
        
        /* Dark mode icons */
        .dark .buyer-theme-smmvisit svg:not([class*="gradient"]) {
          color: inherit;
        }
        
        /* Dark mode dialog/modal */
        .dark .buyer-theme-smmvisit [role="dialog"] {
          background: #262626 !important;
          border-color: rgba(255, 215, 0, 0.2) !important;
        }
        
        /* Dark mode sheet/drawer */
        .dark .buyer-theme-smmvisit [class*="SheetContent"],
        .dark .buyer-theme-smmvisit [data-state="open"] > [role="dialog"] {
          background: #1A1A1A !important;
          border-color: rgba(255, 215, 0, 0.2) !important;
        }
        
        /* Dark mode tabs */
        .dark .buyer-theme-smmvisit [role="tablist"] {
          background: rgba(255, 215, 0, 0.08) !important;
        }
        
        .dark .buyer-theme-smmvisit [role="tab"][data-state="active"] {
          background: #262626 !important;
          color: #FFD700 !important;
        }
        
        /* Dark mode links in nav */
        .dark .buyer-theme-smmvisit nav a,
        .dark .buyer-theme-smmvisit header a {
          color: #D1D5DB;
        }
        
        .dark .buyer-theme-smmvisit nav a:hover,
        .dark .buyer-theme-smmvisit header a:hover {
          color: #FFD700;
        }
        
        /* Dark mode bottom nav - CRITICAL FIX */
        .dark .buyer-theme-smmvisit .bottom-nav,
        .dark .buyer-theme-smmvisit [class*="BottomNav"],
        .dark .buyer-theme-smmvisit nav.fixed.bottom-0 {
          background: rgba(26, 26, 26, 0.98) !important;
          border-top: 1px solid rgba(255, 215, 0, 0.15) !important;
        }
        
        .dark .buyer-theme-smmvisit nav.fixed.bottom-0 button,
        .dark .buyer-theme-smmvisit nav.fixed.bottom-0 a {
          color: #9CA3AF !important;
        }
        
        .dark .buyer-theme-smmvisit nav.fixed.bottom-0 button:hover,
        .dark .buyer-theme-smmvisit nav.fixed.bottom-0 a:hover,
        .dark .buyer-theme-smmvisit nav.fixed.bottom-0 button[data-active="true"],
        .dark .buyer-theme-smmvisit nav.fixed.bottom-0 a[data-active="true"] {
          color: #FFD700 !important;
        }
        
        .dark .buyer-theme-smmvisit nav.fixed.bottom-0 span {
          color: inherit !important;
        }
        
        /* Dark mode auth page */
        .dark .buyer-theme-smmvisit .bg-background {
          background: #1A1A1A !important;
        }
        
        .dark .buyer-theme-smmvisit .bg-card {
          background: #262626 !important;
        }
        
        .dark .buyer-theme-smmvisit .border-border {
          border-color: rgba(255, 215, 0, 0.2) !important;
        }
        
        /* Dark mode labels and form text */
        .dark .buyer-theme-smmvisit label {
          color: #D1D5DB !important;
        }
        
        .dark .buyer-theme-smmvisit .text-foreground {
          color: #FFFFFF !important;
        }
        
        /* Ensure proper color inheritance */
        .dark .buyer-theme-smmvisit * {
          border-color: inherit;
        }
        
        .dark .buyer-theme-smmvisit,
        .dark .buyer-theme-smmvisit .buyer-theme-wrapper {
          color: #FFFFFF;
        }
        
        /* ===== COMPREHENSIVE DASHBOARD DARK MODE FIXES ===== */
        /* Fix all card content text */
        .dark .buyer-theme-smmvisit [class*="CardContent"] h1,
        .dark .buyer-theme-smmvisit [class*="CardContent"] h2,
        .dark .buyer-theme-smmvisit [class*="CardContent"] h3,
        .dark .buyer-theme-smmvisit [class*="CardContent"] h4,
        .dark .buyer-theme-smmvisit [class*="CardContent"] p,
        .dark .buyer-theme-smmvisit [class*="CardContent"] span {
          color: #FFFFFF;
        }
        
        .dark .buyer-theme-smmvisit [class*="CardContent"] .text-muted-foreground {
          color: rgba(255, 255, 255, 0.7) !important;
        }
        
        /* Fix stats cards numeric values */
        .dark .buyer-theme-smmvisit .text-2xl,
        .dark .buyer-theme-smmvisit .text-3xl,
        .dark .buyer-theme-smmvisit .text-4xl {
          color: #FFFFFF !important;
        }
        
        /* Fix small muted text labels */
        .dark .buyer-theme-smmvisit .text-xs.text-muted-foreground,
        .dark .buyer-theme-smmvisit .text-sm.text-muted-foreground {
          color: rgba(255, 255, 255, 0.6) !important;
        }
        
        /* Fix flex column button groups (quick actions) */
        .dark .buyer-theme-smmvisit .flex.flex-col.gap-3 > button,
        .dark .buyer-theme-smmvisit .flex.flex-col.gap-4 > button,
        .dark .buyer-theme-smmvisit .grid button {
          background: #262626 !important;
          border-color: rgba(255, 215, 0, 0.2) !important;
        }
        
        .dark .buyer-theme-smmvisit .flex.flex-col.gap-3 > button:hover,
        .dark .buyer-theme-smmvisit .flex.flex-col.gap-4 > button:hover,
        .dark .buyer-theme-smmvisit .grid button:hover {
          background: rgba(255, 215, 0, 0.12) !important;
          border-color: rgba(255, 215, 0, 0.35) !important;
        }
        
        /* Force white text on all interactive elements in dark mode */
        .dark .buyer-theme-smmvisit button:not([class*="primary"]):not([class*="gradient"]) {
          color: #FFFFFF;
        }
        
        .dark .buyer-theme-smmvisit button:not([class*="primary"]):not([class*="gradient"]) * {
          color: inherit;
        }
        
        /* Special fix for buttons with muted text inside */
        .dark .buyer-theme-smmvisit button .text-muted-foreground {
          color: rgba(255, 255, 255, 0.65) !important;
        }
        
        /* ===== MOBILE NAVIGATION FIXES ===== */
        /* Mobile hamburger menu sheet */
        .dark .buyer-theme-smmvisit [data-vaul-drawer],
        .dark .buyer-theme-smmvisit [role="dialog"][class*="Sheet"] {
          background: #1A1A1A !important;
        }
        
        /* Mobile sidebar navigation items */
        .dark .buyer-theme-smmvisit [class*="SidebarContent"],
        .dark .buyer-theme-smmvisit aside {
          background: #1A1A1A !important;
        }
        
        .dark .buyer-theme-smmvisit aside a,
        .dark .buyer-theme-smmvisit [class*="SidebarContent"] a {
          color: #D1D5DB !important;
        }
        
        .dark .buyer-theme-smmvisit aside a:hover,
        .dark .buyer-theme-smmvisit [class*="SidebarContent"] a:hover {
          background: rgba(255, 215, 0, 0.1) !important;
          color: #FFD700 !important;
        }
        
        /* Select trigger button fix */
        .dark .buyer-theme-smmvisit [role="combobox"],
        .dark .buyer-theme-smmvisit button[aria-haspopup="listbox"] {
          background: #1A1A1A !important;
          border-color: rgba(255, 215, 0, 0.2) !important;
          color: #FFFFFF !important;
        }
        
        .dark .buyer-theme-smmvisit [role="combobox"]:hover,
        .dark .buyer-theme-smmvisit button[aria-haspopup="listbox"]:hover {
          border-color: rgba(255, 215, 0, 0.4) !important;
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
      background: '#1A1A1A',
      surface: '#262626',
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