/**
 * Color utility functions for converting between color formats
 * Used for dynamic theming and CSS variable generation
 */

/**
 * Convert hex color to HSL format for CSS variables
 * @param hex - Hex color string (e.g., "#6366F1" or "6366F1")
 * @returns HSL values as string (e.g., "239 84% 67%")
 */
export function hexToHSL(hex: string): string {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Handle shorthand hex (e.g., "FFF")
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  
  // Parse RGB values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/**
 * Check if a color is light or dark
 * @param hex - Hex color string
 * @returns true if the color is light, false if dark
 */
export function isLightColor(hex: string): boolean {
  hex = hex.replace('#', '');
  
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5;
}

/**
 * Lighten or darken a hex color
 * @param hex - Hex color string
 * @param amount - Amount to adjust (-100 to 100, negative darkens, positive lightens)
 * @returns Adjusted hex color
 */
export function adjustColor(hex: string, amount: number): string {
  hex = hex.replace('#', '');
  
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  
  r = Math.max(0, Math.min(255, r + amount));
  g = Math.max(0, Math.min(255, g + amount));
  b = Math.max(0, Math.min(255, b + amount));
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Generate a complete color palette from a primary color
 */
export interface ColorPalette {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  cardColor: string;
  textColor: string;
  mutedColor: string;
  borderColor: string;
  successColor: string;
  warningColor: string;
  infoColor: string;
  errorColor: string;
}

/**
 * Default color values for dark theme
 */
export const defaultDarkColors: ColorPalette = {
  primaryColor: '#6366F1',
  secondaryColor: '#8B5CF6',
  accentColor: '#EC4899',
  backgroundColor: '#0F172A',
  surfaceColor: '#1E293B',
  cardColor: '#1E293B',
  textColor: '#FFFFFF',
  mutedColor: '#94A3B8',
  borderColor: '#334155',
  successColor: '#22C55E',
  warningColor: '#F59E0B',
  infoColor: '#3B82F6',
  errorColor: '#EF4444',
};

/**
 * Default color values for light theme
 */
export const defaultLightColors: ColorPalette = {
  primaryColor: '#3B82F6',
  secondaryColor: '#1E40AF',
  accentColor: '#EC4899',
  backgroundColor: '#FFFFFF',
  surfaceColor: '#F8FAFC',
  cardColor: '#FFFFFF',
  textColor: '#1F2937',
  mutedColor: '#6B7280',
  borderColor: '#E5E7EB',
  successColor: '#22C55E',
  warningColor: '#F59E0B',
  infoColor: '#3B82F6',
  errorColor: '#EF4444',
};

/**
 * Generate complete CSS variables for buyer theme
 * Supports both light and dark modes with proper scoping
 */
export function generateBuyerThemeCSS(colors: Partial<ColorPalette>): string {
  const primary = colors.primaryColor || defaultDarkColors.primaryColor;
  const secondary = colors.secondaryColor || defaultDarkColors.secondaryColor;
  const accent = colors.accentColor || defaultDarkColors.accentColor;
  const background = colors.backgroundColor || defaultDarkColors.backgroundColor;
  const surface = colors.surfaceColor || defaultDarkColors.surfaceColor;
  const card = colors.cardColor || surface;
  const text = colors.textColor || defaultDarkColors.textColor;
  const muted = colors.mutedColor || defaultDarkColors.mutedColor;
  const border = colors.borderColor || defaultDarkColors.borderColor;
  const success = colors.successColor || defaultDarkColors.successColor;
  const warning = colors.warningColor || defaultDarkColors.warningColor;
  const info = colors.infoColor || defaultDarkColors.infoColor;
  const error = colors.errorColor || defaultDarkColors.errorColor;

  // Light mode equivalents - keep brand colors, adjust UI colors
  const lightBg = '#FAFBFC';
  const lightSurface = '#FFFFFF';
  const lightCard = '#FFFFFF';
  const lightText = '#1F2937';
  const lightMuted = '#6B7280';
  const lightBorder = '#E5E7EB';

  return `
    /* Panel brand colors (shared across themes) */
    .buyer-theme-wrapper {
      --panel-primary: ${primary};
      --panel-primary-hsl: ${hexToHSL(primary)};
      --panel-secondary: ${secondary};
      --panel-secondary-hsl: ${hexToHSL(secondary)};
      --panel-accent: ${accent};
      --panel-accent-hsl: ${hexToHSL(accent)};
      --panel-success: ${success};
      --panel-warning: ${warning};
      --panel-info: ${info};
      --panel-error: ${error};
      
      /* Theme gradients */
      --panel-gradient: linear-gradient(135deg, ${primary} 0%, ${secondary} 100%);
      --panel-gradient-accent: linear-gradient(135deg, ${primary} 0%, ${accent} 100%);
      --panel-gradient-subtle: linear-gradient(135deg, ${primary}20 0%, ${secondary}20 100%);
      
      /* Theme glows */
      --panel-glow: 0 0 20px ${primary}40;
      --panel-glow-lg: 0 0 40px ${primary}30;
      --panel-glow-accent: 0 0 20px ${accent}40;
      
      /* Nav & sidebar */
      --panel-nav-bg: ${surface};
      --panel-nav-active-bg: ${primary}20;
      --panel-nav-active-text: ${primary};
      --panel-nav-hover-bg: ${primary}10;
      
      /* Bottom nav */
      --panel-bottom-nav-bg: ${surface}F0;
      --panel-bottom-nav-active: ${primary};
      --panel-bottom-nav-center-gradient: linear-gradient(135deg, ${primary} 0%, ${secondary} 100%);
    }
    
    /* Dark mode buyer theme (default) */
    .buyer-theme-wrapper:not(.light),
    .dark .buyer-theme-wrapper {
      --panel-background: ${background};
      --panel-surface: ${surface};
      --panel-card: ${card};
      --panel-text: ${text};
      --panel-muted: ${muted};
      --panel-border: ${border};
      
      --background: ${hexToHSL(background)};
      --foreground: ${hexToHSL(text)};
      --card: ${hexToHSL(card)};
      --card-foreground: ${hexToHSL(text)};
      --popover: ${hexToHSL(surface)};
      --popover-foreground: ${hexToHSL(text)};
      --primary: ${hexToHSL(primary)};
      --primary-foreground: 0 0% 100%;
      --secondary: ${hexToHSL(surface)};
      --secondary-foreground: ${hexToHSL(text)};
      --muted: ${hexToHSL(surface)};
      --muted-foreground: ${hexToHSL(muted)};
      --accent: ${hexToHSL(accent)};
      --accent-foreground: 0 0% 100%;
      --border: ${hexToHSL(border)};
      --input: ${hexToHSL(border)};
      --ring: ${hexToHSL(primary)};
      --destructive: ${hexToHSL(error)};
      --destructive-foreground: 0 0% 100%;
      --success: ${hexToHSL(success)};
      --warning: ${hexToHSL(warning)};
      --info: ${hexToHSL(info)};
      
      --sidebar-background: ${hexToHSL(surface)};
      --sidebar-foreground: ${hexToHSL(text)};
      --sidebar-primary: ${hexToHSL(primary)};
      --sidebar-primary-foreground: 0 0% 100%;
      --sidebar-accent: ${hexToHSL(background)};
      --sidebar-accent-foreground: ${hexToHSL(text)};
      --sidebar-border: ${hexToHSL(border)};
      --sidebar-ring: ${hexToHSL(primary)};
      
      --glass-bg: ${hexToHSL(surface)} / 0.6;
      --glass-border: ${hexToHSL(border)} / 0.3;
      
      /* Fast order step colors */
      --step-active: ${primary};
      --step-completed: ${primary};
      --step-pending: ${muted};
      --step-line: ${border};
      --step-glow: 0 0 16px ${primary}60;
    }
    
    /* Light mode buyer theme */
    .light .buyer-theme-wrapper,
    .buyer-theme-wrapper.light {
      --panel-background: ${lightBg};
      --panel-surface: ${lightSurface};
      --panel-card: ${lightCard};
      --panel-text: ${lightText};
      --panel-muted: ${lightMuted};
      --panel-border: ${lightBorder};
      
      --background: ${hexToHSL(lightBg)};
      --foreground: ${hexToHSL(lightText)};
      --card: ${hexToHSL(lightCard)};
      --card-foreground: ${hexToHSL(lightText)};
      --popover: ${hexToHSL(lightSurface)};
      --popover-foreground: ${hexToHSL(lightText)};
      --primary: ${hexToHSL(primary)};
      --primary-foreground: 0 0% 100%;
      --secondary: ${hexToHSL(lightSurface)};
      --secondary-foreground: ${hexToHSL(lightText)};
      --muted: ${hexToHSL(lightSurface)};
      --muted-foreground: ${hexToHSL(lightMuted)};
      --accent: ${hexToHSL(accent)};
      --accent-foreground: 0 0% 100%;
      --border: ${hexToHSL(lightBorder)};
      --input: ${hexToHSL(lightBorder)};
      --ring: ${hexToHSL(primary)};
      --destructive: ${hexToHSL(error)};
      --destructive-foreground: 0 0% 100%;
      --success: ${hexToHSL(success)};
      --warning: ${hexToHSL(warning)};
      --info: ${hexToHSL(info)};
      
      --sidebar-background: ${hexToHSL(lightSurface)};
      --sidebar-foreground: ${hexToHSL(lightText)};
      --sidebar-primary: ${hexToHSL(primary)};
      --sidebar-primary-foreground: 0 0% 100%;
      --sidebar-accent: ${hexToHSL(lightBg)};
      --sidebar-accent-foreground: ${hexToHSL(lightText)};
      --sidebar-border: ${hexToHSL(lightBorder)};
      --sidebar-ring: ${hexToHSL(primary)};
      
      --glass-bg: ${hexToHSL(lightSurface)} / 0.85;
      --glass-border: ${hexToHSL(lightBorder)} / 0.6;
      
      /* Fast order step colors - light mode */
      --step-active: ${primary};
      --step-completed: ${primary};
      --step-pending: ${lightMuted};
      --step-line: ${lightBorder};
      --step-glow: 0 0 20px ${primary}50;
    }
  `;
}
