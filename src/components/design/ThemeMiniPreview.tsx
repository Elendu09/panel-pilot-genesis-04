import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Check, Terminal, Star, Zap, Sun, Moon, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThemeMiniPreviewProps {
  themeId: string;
  name: string;
  description: string;
  colors: string[];
  isActive?: boolean;
  isConfigured?: boolean;
  hasUnsavedChanges?: boolean;
  onClick?: () => void;
}

// Mini preview mockups for each theme type
const ThemeMockup = ({ themeId, colors }: { themeId: string; colors: string[] }) => {
  const [bg, primary, accent] = colors;
  
  // Determine theme-specific mockup
  switch (themeId) {
    case 'theme_tgref':
    case 'tgref':
      return (
        <div className="w-full h-full bg-[#1A1B26] rounded overflow-hidden">
          {/* Nav bar */}
          <div className="h-3 bg-[#0D0E14] flex items-center px-1 gap-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00D4AA]" />
            <div className="flex-1" />
            <div className="w-3 h-1 rounded-full bg-[#00D4AA]/30" />
          </div>
          {/* Hero */}
          <div className="p-2 flex flex-col items-center justify-center h-[calc(100%-12px)]">
            <Terminal className="w-4 h-4 text-[#00D4AA] mb-1" />
            <div className="w-12 h-1.5 rounded bg-gradient-to-r from-[#00D4AA] to-[#0EA5E9] mb-1" />
            <div className="w-8 h-1 rounded bg-gray-600" />
            <div className="w-6 h-2 rounded bg-[#00D4AA] mt-2" />
          </div>
        </div>
      );
    
    case 'theme_alipanel':
    case 'alipanel':
      return (
        <div className="w-full h-full bg-[#0A0A0F] rounded overflow-hidden relative">
          {/* Gradient orbs */}
          <div className="absolute top-1 left-1 w-6 h-6 rounded-full bg-gradient-to-br from-pink-500/30 to-purple-500/30 blur-sm" />
          <div className="absolute bottom-2 right-1 w-4 h-4 rounded-full bg-gradient-to-br from-orange-500/30 to-pink-500/30 blur-sm" />
          {/* Nav */}
          <div className="h-3 bg-black/50 flex items-center px-1 gap-0.5 relative z-10">
            <Star className="w-2 h-2 text-pink-400" />
          </div>
          {/* Hero */}
          <div className="p-2 flex flex-col items-center justify-center h-[calc(100%-12px)] relative z-10">
            <div className="w-10 h-1.5 rounded bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 mb-1" />
            <div className="w-6 h-1 rounded bg-gray-600 mb-2" />
            <div className="w-8 h-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500" />
          </div>
        </div>
      );
    
    case 'theme_flysmm':
    case 'flysmm':
      return (
        <div className="w-full h-full bg-[#F8FAFC] rounded overflow-hidden">
          {/* Nav */}
          <div className="h-3 bg-white flex items-center px-1 gap-0.5 border-b border-gray-100">
            <div className="w-2 h-2 rounded bg-[#2196F3]" />
            <div className="flex-1" />
            <div className="w-3 h-1 rounded-full bg-[#2196F3]" />
          </div>
          {/* Hero */}
          <div className="p-2 flex flex-col items-center justify-center h-[calc(100%-12px)]">
            <Sun className="w-3 h-3 text-[#2196F3] mb-1" />
            <div className="w-10 h-1.5 rounded bg-gray-800 mb-1" />
            <div className="w-6 h-1 rounded bg-gray-400 mb-2" />
            <div className="w-8 h-2 rounded bg-[#2196F3]" />
          </div>
        </div>
      );
    
    case 'theme_smmstay':
    case 'smmstay':
      return (
        <div className="w-full h-full bg-black rounded overflow-hidden">
          {/* Nav */}
          <div className="h-3 bg-black flex items-center px-1 gap-0.5 border-b border-pink-500/20">
            <Zap className="w-2 h-2 text-pink-500" />
          </div>
          {/* Hero */}
          <div className="p-2 flex flex-col items-center justify-center h-[calc(100%-12px)]">
            <div className="w-12 h-2 rounded bg-gradient-to-r from-pink-500 to-purple-500 mb-1" />
            <div className="w-8 h-1 rounded bg-gray-700 mb-2" />
            <div className="flex gap-1">
              <div className="w-4 h-2 rounded bg-pink-500" />
              <div className="w-4 h-2 rounded border border-pink-500/50" />
            </div>
          </div>
        </div>
      );
    
    case 'theme_smmvisit':
    case 'smmvisit':
      return (
        <div className="w-full h-full bg-[#F5F5F5] rounded overflow-hidden">
          {/* Nav */}
          <div className="h-3 bg-[#1A1A1A] flex items-center px-1 gap-0.5">
            <div className="w-2 h-2 rounded bg-[#FFD700]" />
          </div>
          {/* Hero */}
          <div className="p-2 flex flex-col items-center justify-center h-[calc(100%-12px)]">
            <Sparkles className="w-3 h-3 text-[#FFD700] mb-1" />
            <div className="w-10 h-1.5 rounded bg-[#1A1A1A] mb-1" />
            <div className="w-6 h-1 rounded bg-gray-400 mb-2" />
            <div className="w-8 h-2 rounded bg-[#FFD700]" />
          </div>
        </div>
      );
    
    // Default / Theme One through Five
    default:
      return (
        <div className="w-full h-full rounded overflow-hidden" style={{ backgroundColor: bg }}>
          {/* Nav */}
          <div className="h-3 flex items-center px-1 gap-0.5" style={{ backgroundColor: `${bg}cc` }}>
            <div className="w-2 h-2 rounded" style={{ backgroundColor: primary }} />
            <div className="flex-1" />
            <div className="w-3 h-1 rounded-full" style={{ backgroundColor: `${primary}80` }} />
          </div>
          {/* Hero */}
          <div className="p-2 flex flex-col items-center justify-center h-[calc(100%-12px)]">
            <div className="w-10 h-1.5 rounded mb-1" style={{ background: `linear-gradient(to right, ${primary}, ${accent})` }} />
            <div className="w-6 h-1 rounded bg-white/30 mb-2" />
            <div className="w-8 h-2 rounded" style={{ backgroundColor: primary }} />
          </div>
        </div>
      );
  }
};

export const ThemeMiniPreview = memo(({
  themeId,
  name,
  description,
  colors,
  isActive = false,
  isConfigured = false,
  hasUnsavedChanges = false,
  onClick,
}: ThemeMiniPreviewProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative p-3 rounded-xl border-2 transition-all text-left hover:shadow-lg",
        isActive 
          ? "border-primary ring-2 ring-primary/20 bg-primary/5" 
          : "border-border hover:border-primary/50 bg-card"
      )}
    >
      {/* Mini Preview Mockup */}
      <div className="w-full aspect-[5/3] mb-2 rounded-lg overflow-hidden ring-1 ring-border/50">
        <ThemeMockup themeId={themeId} colors={colors} />
      </div>
      
      {/* Color Swatches */}
      <div className="flex gap-1 mb-2">
        {colors.map((color, i) => (
          <div 
            key={i} 
            className="w-4 h-4 rounded-full ring-1 ring-white/20 shadow-sm" 
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      
      {/* Theme Info */}
      <p className="text-xs font-semibold truncate">{name}</p>
      <p className="text-[10px] text-muted-foreground line-clamp-1">{description}</p>
      
      {/* Status Badges */}
      <div className="flex gap-1 mt-1.5 flex-wrap">
        {isActive && (
          <Badge variant="secondary" className="text-[10px] gap-0.5">
            <Check className="w-2.5 h-2.5" />
            Active
          </Badge>
        )}
        {isConfigured && !isActive && (
          <Badge variant="outline" className="text-[10px] text-green-500 border-green-500/30">
            Saved
          </Badge>
        )}
        {isActive && hasUnsavedChanges && (
          <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/30">
            Unsaved
          </Badge>
        )}
      </div>
      
      {/* Hover Overlay */}
      <div className={cn(
        "absolute inset-0 rounded-xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none",
        isActive && "opacity-0"
      )} />
    </button>
  );
});

ThemeMiniPreview.displayName = 'ThemeMiniPreview';

export default ThemeMiniPreview;
