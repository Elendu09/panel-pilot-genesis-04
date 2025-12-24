import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ThemeMiniPreviewsProps {
  selectedTheme: string;
  onApplyTheme: (themeId: string) => void;
}

const themePresets = [
  {
    id: "dark_gradient",
    name: "Default Dark",
    description: "Modern dark theme with purple accents",
    colors: {
      primary: "#8B5CF6",
      secondary: "#06B6D4",
      background: "#0F172A",
      surface: "#1E293B",
    },
    gradient: "from-purple-900 via-slate-900 to-blue-900",
  },
  {
    id: "theme_one",
    name: "AliPanel Dark",
    description: "Floating icons, neon glow, glassmorphism",
    colors: {
      primary: "#00FF88",
      secondary: "#FF00FF",
      background: "#0A0A0A",
      surface: "#1A1A2E",
    },
    gradient: "from-green-950 via-black to-purple-950",
  },
  {
    id: "theme_two",
    name: "Professional Dark",
    description: "Quick order card, gradient overlays",
    colors: {
      primary: "#3B82F6",
      secondary: "#10B981",
      background: "#0C1929",
      surface: "#132F4C",
    },
    gradient: "from-blue-950 via-slate-900 to-cyan-950",
  },
  {
    id: "theme_three",
    name: "Light Minimal",
    description: "Clean and professional light theme",
    colors: {
      primary: "#F97316",
      secondary: "#EF4444",
      background: "#FFFFFF",
      surface: "#F8FAFC",
    },
    gradient: "from-orange-50 via-white to-amber-50",
    isLight: true,
  },
];

export const ThemeMiniPreviews = ({
  selectedTheme,
  onApplyTheme,
}: ThemeMiniPreviewsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Quick Theme Gallery</h3>
        <Badge variant="secondary" className="text-xs">4 Themes</Badge>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {themePresets.map((theme, index) => (
          <motion.div
            key={theme.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className={cn(
                "overflow-hidden cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg",
                selectedTheme === theme.id && "ring-2 ring-primary"
              )}
              onClick={() => onApplyTheme(theme.id)}
            >
              {/* Preview Thumbnail */}
              <div
                className={cn(
                  "aspect-[4/3] relative bg-gradient-to-br",
                  theme.gradient
                )}
              >
                {/* Mini mockup of theme */}
                <div className="absolute inset-2 flex flex-col">
                  {/* Header mockup */}
                  <div
                    className="h-4 rounded-t flex items-center px-1.5 gap-1"
                    style={{ backgroundColor: theme.colors.surface }}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: theme.colors.primary }}
                    />
                    <div className="flex-1 h-1 rounded bg-white/20" />
                  </div>
                  
                  {/* Content mockup */}
                  <div
                    className="flex-1 p-1.5 rounded-b"
                    style={{ backgroundColor: theme.colors.background }}
                  >
                    {/* Hero section mockup */}
                    <div className="space-y-1">
                      <div
                        className="h-2 w-3/4 rounded"
                        style={{ backgroundColor: theme.isLight ? '#1e293b' : '#f1f5f9' + '40' }}
                      />
                      <div
                        className="h-1.5 w-1/2 rounded"
                        style={{ backgroundColor: theme.isLight ? '#64748b' : '#94a3b8' + '30' }}
                      />
                    </div>
                    
                    {/* Cards mockup */}
                    <div className="flex gap-1 mt-2">
                      {[1, 2, 3].map(i => (
                        <div
                          key={i}
                          className="flex-1 h-4 rounded"
                          style={{ backgroundColor: theme.colors.surface }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Selected indicator */}
                {selectedTheme === theme.id && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>

              <CardContent className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{theme.name}</span>
                  {selectedTheme === theme.id && (
                    <Badge className="text-[10px] px-1.5 py-0">Active</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {theme.description}
                </p>

                {/* Color palette preview */}
                <div className="flex gap-1">
                  {Object.values(theme.colors).map((color, i) => (
                    <div
                      key={i}
                      className="w-5 h-5 rounded-full border border-border"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                <Button
                  size="sm"
                  variant={selectedTheme === theme.id ? "secondary" : "default"}
                  className="w-full h-7 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onApplyTheme(theme.id);
                  }}
                >
                  {selectedTheme === theme.id ? "Applied" : "Apply Theme"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ThemeMiniPreviews;
