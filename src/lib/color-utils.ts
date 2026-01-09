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
 * Default color values for light and dark themes
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
