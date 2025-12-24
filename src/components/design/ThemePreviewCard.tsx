import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Palette, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ThemePreviewCardProps {
  theme: {
    id: string;
    name: string;
    description: string;
    colors: {
      primary: string;
      secondary: string;
      bg: string;
      surface: string;
    };
    preview: string;
  };
  isSelected: boolean;
  onSelect: () => void;
  onPreview?: () => void;
}

export const ThemePreviewCard = ({
  theme,
  isSelected,
  onSelect,
  onPreview
}: ThemePreviewCardProps) => {
  const isDark = theme.colors.bg.startsWith('#0') || 
                 theme.colors.bg.startsWith('#1') || 
                 theme.colors.bg === '#000000';

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative"
    >
      <Card 
        className={cn(
          "overflow-hidden cursor-pointer transition-all duration-300 group",
          "border-2",
          isSelected 
            ? "border-primary ring-2 ring-primary/20" 
            : "border-border/50 hover:border-primary/50"
        )}
        onClick={onSelect}
      >
        {/* Color Preview Banner */}
        <div 
          className={cn("h-24 relative overflow-hidden", theme.preview)}
          style={{ backgroundColor: theme.colors.bg }}
        >
          {/* Mini storefront preview */}
          <div className="absolute inset-2 rounded-lg overflow-hidden shadow-lg"
               style={{ backgroundColor: theme.colors.surface }}>
            {/* Mini header */}
            <div className="h-4 flex items-center px-2 gap-1" 
                 style={{ backgroundColor: theme.colors.bg }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.colors.primary }} />
              <div className="flex-1 h-1 rounded" style={{ backgroundColor: theme.colors.primary + '40' }} />
            </div>
            
            {/* Mini content */}
            <div className="p-2 space-y-1">
              <div className="h-2 rounded" style={{ backgroundColor: theme.colors.primary }} />
              <div className="h-1.5 w-2/3 rounded" style={{ backgroundColor: isDark ? '#ffffff30' : '#00000020' }} />
              <div className="flex gap-1 mt-2">
                <div className="h-2 w-8 rounded" style={{ backgroundColor: theme.colors.primary }} />
                <div className="h-2 w-8 rounded" style={{ backgroundColor: theme.colors.secondary }} />
              </div>
            </div>
          </div>

          {/* Color dots */}
          <div className="absolute bottom-2 right-2 flex gap-1">
            <div className="w-3 h-3 rounded-full shadow-md border border-white/20" 
                 style={{ backgroundColor: theme.colors.primary }} />
            <div className="w-3 h-3 rounded-full shadow-md border border-white/20" 
                 style={{ backgroundColor: theme.colors.secondary }} />
            <div className="w-3 h-3 rounded-full shadow-md border border-white/20" 
                 style={{ backgroundColor: theme.colors.bg }} />
          </div>

          {/* Selection indicator */}
          {isSelected && (
            <div className="absolute top-2 right-2">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-4 h-4 text-primary-foreground" />
              </div>
            </div>
          )}
        </div>

        <CardContent className="p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{theme.name}</h3>
              <p className="text-xs text-muted-foreground line-clamp-1">{theme.description}</p>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onPreview?.();
              }}
            >
              <Eye className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {isSelected && (
        <Badge className="absolute -top-2 -left-2 bg-primary text-primary-foreground text-xs">
          Active
        </Badge>
      )}
    </motion.div>
  );
};

export default ThemePreviewCard;
