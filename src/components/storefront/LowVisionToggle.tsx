import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AccessibilitySettings {
  highContrast?: boolean;
  largeText?: boolean;
  reduceMotion?: boolean;
  fontSize?: number;
  enhancedFocus?: boolean;
}

interface LowVisionToggleProps {
  accessibilitySettings?: AccessibilitySettings;
  panelId?: string;
  variant?: 'dark' | 'light';
}

export const LowVisionToggle = ({ 
  accessibilitySettings, 
  panelId,
  variant = 'dark' 
}: LowVisionToggleProps) => {
  const storageKey = `lowVisionMode_${panelId || 'default'}`;
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem(storageKey);
    if (saved === 'true') {
      setIsEnabled(true);
      applyLowVisionStyles(true);
    }
  }, [storageKey]);

  const applyLowVisionStyles = (enabled: boolean) => {
    const root = document.documentElement;
    
    if (enabled) {
      // Apply accessibility enhancements
      root.style.setProperty('--low-vision-font-scale', '1.2');
      root.classList.add('low-vision-mode');
      
      // Add CSS class for high contrast and large text
      document.body.classList.add('low-vision-active');
      
      // Apply settings-specific enhancements
      if (accessibilitySettings?.highContrast) {
        root.classList.add('high-contrast');
      }
      if (accessibilitySettings?.reduceMotion) {
        root.classList.add('reduce-motion');
      }
      if (accessibilitySettings?.enhancedFocus) {
        root.classList.add('enhanced-focus');
      }
    } else {
      root.style.removeProperty('--low-vision-font-scale');
      root.classList.remove('low-vision-mode', 'high-contrast', 'reduce-motion', 'enhanced-focus');
      document.body.classList.remove('low-vision-active');
    }
  };

  const toggleLowVision = () => {
    const newValue = !isEnabled;
    setIsEnabled(newValue);
    localStorage.setItem(storageKey, String(newValue));
    applyLowVisionStyles(newValue);
  };

  const isDark = variant === 'dark';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLowVision}
            className={`relative ${isDark ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
            aria-label={isEnabled ? 'Disable low vision mode' : 'Enable low vision mode'}
          >
            {isEnabled ? (
              <Eye className="w-5 h-5" />
            ) : (
              <EyeOff className="w-5 h-5" />
            )}
            {isEnabled && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isEnabled ? 'Disable' : 'Enable'} accessibility mode</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
