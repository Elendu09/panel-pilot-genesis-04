import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BuyerThemeKanbanProps {
  children: ReactNode;
  className?: string;
  themeMode?: 'light' | 'dark';
}

export const BuyerThemeKanban = ({ children, className, themeMode = 'dark' }: BuyerThemeKanbanProps) => {
  return (
    <div className={themeMode === 'light' ? 'light' : 'dark'}>
      <div 
        className={cn(
          "buyer-theme-kanban buyer-theme-wrapper min-h-screen font-inter",
          className
        )}
      >
      <style>{`
        .buyer-theme-kanban {
          --theme-background: #0B1120;
          --theme-surface: #131C2E;
          --theme-primary: #3B82F6;
          --theme-secondary: #06B6D4;
          --theme-accent: #8B5CF6;
          --theme-text: #F1F5F9;
          --theme-muted: #94A3B8;
          --theme-gradient: linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%);
          --theme-glow: 0 0 40px rgba(59, 130, 246, 0.3);
          background: var(--theme-background);
          color: var(--theme-text);
        }
        
        .buyer-theme-kanban {
          --panel-primary: #3B82F6;
          --panel-secondary: #06B6D4;
          --panel-accent: #8B5CF6;
          --panel-gradient: linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%);
          --panel-gradient-accent: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
          --panel-glow: 0 0 20px rgba(59, 130, 246, 0.4);
          --panel-glow-lg: 0 0 40px rgba(59, 130, 246, 0.3);
          --panel-nav-active-bg: rgba(59, 130, 246, 0.2);
          --panel-nav-active-text: #3B82F6;
          --panel-bottom-nav-center-gradient: linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%);
          --step-active: #3B82F6;
          --step-completed: #3B82F6;
          --step-glow: 0 0 16px rgba(59, 130, 246, 0.6);
        }
        
        .buyer-theme-kanban .theme-card {
          background: rgba(19, 28, 46, 0.8);
          border: 1px solid rgba(59, 130, 246, 0.12);
          backdrop-filter: blur(10px);
        }
        
        .buyer-theme-kanban .theme-button-primary {
          background: linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%);
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
          border: none;
          color: white;
          font-weight: 600;
        }
        
        .buyer-theme-kanban .theme-button-primary:hover {
          box-shadow: 0 6px 30px rgba(59, 130, 246, 0.6);
          transform: translateY(-2px);
        }
        
        .buyer-theme-kanban .theme-gradient-text {
          background: linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .buyer-theme-kanban .theme-icon-box {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(6, 182, 212, 0.1));
          border: 1px solid rgba(59, 130, 246, 0.2);
          box-shadow: 0 8px 32px rgba(59, 130, 246, 0.15);
        }
        
        .buyer-theme-kanban .theme-nav {
          background: rgba(11, 17, 32, 0.9);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(59, 130, 246, 0.1);
        }
        
        .buyer-theme-kanban .theme-hero {
          background: radial-gradient(ellipse at top, rgba(59, 130, 246, 0.12) 0%, transparent 50%),
                      radial-gradient(ellipse at bottom right, rgba(6, 182, 212, 0.08) 0%, transparent 50%);
        }
        
        .buyer-theme-kanban .glass-card,
        .buyer-theme-kanban [class*="Card"] {
          background: rgba(19, 28, 46, 0.8) !important;
          border-color: rgba(59, 130, 246, 0.12) !important;
        }
        
        .buyer-theme-kanban .glass-sidebar {
          background: rgba(11, 17, 32, 0.95) !important;
          border-color: rgba(59, 130, 246, 0.1) !important;
        }
        
        .buyer-theme-kanban input,
        .buyer-theme-kanban textarea,
        .buyer-theme-kanban select {
          background: rgba(19, 28, 46, 0.9) !important;
          border-color: rgba(59, 130, 246, 0.2) !important;
          color: #F1F5F9 !important;
        }
        
        .buyer-theme-kanban input::placeholder,
        .buyer-theme-kanban textarea::placeholder {
          color: #64748B !important;
        }
        
        .buyer-theme-kanban input:focus,
        .buyer-theme-kanban textarea:focus,
        .buyer-theme-kanban select:focus {
          border-color: #3B82F6 !important;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
        }
        
        .buyer-theme-kanban table {
          background: rgba(19, 28, 46, 0.5) !important;
        }
        
        .buyer-theme-kanban thead {
          background: rgba(59, 130, 246, 0.1) !important;
        }
        
        .buyer-theme-kanban tbody tr:hover {
          background: rgba(59, 130, 246, 0.05) !important;
        }
        
        /* ===== COMPREHENSIVE LIGHT MODE ===== */
        .light .buyer-theme-kanban {
          --theme-background: #F8FAFC;
          --theme-surface: #FFFFFF;
          --theme-text: #0F172A;
          --theme-muted: #64748B;
          --panel-nav-active-text: #3B82F6;
        }
        
        .light .buyer-theme-kanban {
          background: linear-gradient(180deg, #F8FAFC 0%, #EFF6FF 100%);
        }
        
        .light .buyer-theme-kanban .theme-card {
          background: #FFFFFF;
          border: 1px solid rgba(59, 130, 246, 0.12);
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.06);
        }
        
        .light .buyer-theme-kanban .theme-nav {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(59, 130, 246, 0.1);
        }
        
        .light .buyer-theme-kanban .theme-hero {
          background: linear-gradient(180deg, #EFF6FF 0%, #F8FAFC 100%);
        }
        
        .light .buyer-theme-kanban .theme-button-primary {
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.25);
        }
        
        .light .buyer-theme-kanban .glass-card,
        .light .buyer-theme-kanban [class*="Card"] {
          background: #FFFFFF !important;
          border-color: rgba(59, 130, 246, 0.1) !important;
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.06) !important;
        }
        
        .light .buyer-theme-kanban .glass-sidebar {
          background: #FFFFFF !important;
          border-color: rgba(59, 130, 246, 0.1) !important;
          box-shadow: 2px 0 20px rgba(59, 130, 246, 0.05) !important;
        }
        
        .light .buyer-theme-kanban input,
        .light .buyer-theme-kanban textarea,
        .light .buyer-theme-kanban select {
          background: #FFFFFF !important;
          border-color: rgba(59, 130, 246, 0.2) !important;
          color: #0F172A !important;
        }
        
        .light .buyer-theme-kanban input::placeholder,
        .light .buyer-theme-kanban textarea::placeholder {
          color: #94A3B8 !important;
        }
        
        .light .buyer-theme-kanban table {
          background: #FFFFFF !important;
        }
        
        .light .buyer-theme-kanban thead {
          background: rgba(59, 130, 246, 0.06) !important;
        }
        
        .light .buyer-theme-kanban tbody tr:hover {
          background: rgba(59, 130, 246, 0.04) !important;
        }
        
        .light .buyer-theme-kanban .nav-item.active,
        .light .buyer-theme-kanban .nav-item:hover {
          background: rgba(59, 130, 246, 0.1) !important;
        }
        
        .light .buyer-theme-kanban h1,
        .light .buyer-theme-kanban h2,
        .light .buyer-theme-kanban h3,
        .light .buyer-theme-kanban h4,
        .light .buyer-theme-kanban h5,
        .light .buyer-theme-kanban h6 {
          color: #0F172A;
        }
        
        .light .buyer-theme-kanban p,
        .light .buyer-theme-kanban span:not(.theme-gradient-text):not(.balance-display):not(button span) {
          color: #334155;
        }
        
        .buyer-theme-kanban .balance-display,
        .light .buyer-theme-kanban .balance-display,
        .dark .buyer-theme-kanban .balance-display {
          color: #FFFFFF !important;
        }
        
        .light .buyer-theme-kanban .text-muted-foreground {
          color: #64748B !important;
        }
        
        .light .buyer-theme-kanban [class*="Badge"],
        .light .buyer-theme-kanban .badge {
          background: rgba(59, 130, 246, 0.1) !important;
          color: #3B82F6 !important;
          border-color: rgba(59, 130, 246, 0.2) !important;
        }
        
        .light .buyer-theme-kanban footer {
          background: linear-gradient(180deg, #F8FAFC 0%, #EFF6FF 100%) !important;
          border-top: 1px solid rgba(59, 130, 246, 0.1) !important;
        }
        
        .light .buyer-theme-kanban [data-radix-popper-content-wrapper] > div,
        .light .buyer-theme-kanban [role="listbox"],
        .light .buyer-theme-kanban [role="menu"] {
          background: #FFFFFF !important;
          border-color: rgba(59, 130, 246, 0.12) !important;
          box-shadow: 0 10px 40px rgba(59, 130, 246, 0.1) !important;
        }
        
        .light .buyer-theme-kanban .skeleton,
        .light .buyer-theme-kanban [class*="Skeleton"] {
          background: rgba(59, 130, 246, 0.08) !important;
        }
        
        .light .buyer-theme-kanban ::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.3);
        }
        .light .buyer-theme-kanban ::-webkit-scrollbar-track {
          background: rgba(59, 130, 246, 0.05);
        }
        
        .light .buyer-theme-kanban [data-state="open"] {
          background: rgba(59, 130, 246, 0.04) !important;
        }
        
        .light .buyer-theme-kanban button:not(.theme-button-primary):not([class*="gradient"]) {
          color: #0F172A;
        }
        
        .light .buyer-theme-kanban a {
          color: #334155;
        }
        
        .light .buyer-theme-kanban a:hover {
          color: #3B82F6;
        }
        
        .light .buyer-theme-kanban .btn-secondary,
        .light .buyer-theme-kanban button[variant="secondary"],
        .light .buyer-theme-kanban button[variant="outline"],
        .light .buyer-theme-kanban button[variant="ghost"] {
          background: rgba(59, 130, 246, 0.08) !important;
          color: #3B82F6 !important;
          border-color: rgba(59, 130, 246, 0.2) !important;
        }
        
        .light .buyer-theme-kanban .btn-secondary:hover,
        .light .buyer-theme-kanban button[variant="secondary"]:hover,
        .light .buyer-theme-kanban button[variant="outline"]:hover,
        .light .buyer-theme-kanban button[variant="ghost"]:hover {
          background: rgba(59, 130, 246, 0.15) !important;
        }
        
        .light .buyer-theme-kanban svg:not([class*="gradient"]) {
          color: inherit;
        }
        
        .light .buyer-theme-kanban [role="dialog"] {
          background: #FFFFFF !important;
          border-color: rgba(59, 130, 246, 0.12) !important;
        }
        
        .light .buyer-theme-kanban [role="tablist"] {
          background: rgba(59, 130, 246, 0.05) !important;
        }
        
        .light .buyer-theme-kanban [role="tab"][data-state="active"] {
          background: #FFFFFF !important;
          color: #3B82F6 !important;
        }
        
        .light .buyer-theme-kanban nav a,
        .light .buyer-theme-kanban header a {
          color: #334155;
        }
        
        .light .buyer-theme-kanban nav a:hover,
        .light .buyer-theme-kanban header a:hover {
          color: #3B82F6;
        }
        
        .light .buyer-theme-kanban * {
          border-color: inherit;
        }
        
        .light .buyer-theme-kanban,
        .light .buyer-theme-kanban .buyer-theme-wrapper {
          color: #0F172A;
        }
      `}</style>
        {children}
      </div>
    </div>
  );
};

export const kanbanThemeConfig = {
  key: 'kanban',
  name: 'Kanban',
  description: 'Clean productivity-inspired layout with card-based design',
  fonts: {
    heading: 'Inter',
    body: 'Inter',
  },
  colors: {
    dark: {
      background: '#0B1120',
      surface: '#131C2E',
      primary: '#3B82F6',
      secondary: '#06B6D4',
      accent: '#8B5CF6',
      text: '#F1F5F9',
      muted: '#94A3B8',
    },
    light: {
      background: '#F8FAFC',
      surface: '#FFFFFF',
      primary: '#3B82F6',
      secondary: '#06B6D4',
      accent: '#8B5CF6',
      text: '#0F172A',
      muted: '#64748B',
    },
  },
  layout: {
    heroStyle: 'kanban-board',
    cardStyle: 'column-cards',
    navStyle: 'blur-clean',
    spacing: 'structured',
  },
};

export default BuyerThemeKanban;
