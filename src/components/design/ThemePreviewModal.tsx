import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Sun, Moon, Check, Sparkles, Zap, Users, Star, Shield } from "lucide-react";

interface ThemePreviewModalProps {
  onApplyTheme: (themeId: string, mode: 'dark' | 'light') => void;
  currentTheme?: string;
}

// Theme definitions with their palettes
const themeDefinitions = [
  {
    id: 'theme_one',
    name: 'Cosmic Purple',
    description: 'Deep purple gradients with pink accents',
    dark: {
      background: '#0F0F1A',
      surface: '#1A1A2E',
      primary: '#8B5CF6',
      secondary: '#EC4899',
      text: '#FFFFFF',
      muted: '#A1A1AA',
    },
    light: {
      background: '#FAF8FF',
      surface: '#FFFFFF',
      primary: '#7C3AED',
      secondary: '#DB2777',
      text: '#1E1B4B',
      muted: '#6B7280',
    },
  },
  {
    id: 'theme_two',
    name: 'Ocean Blue',
    description: 'Professional blue with cyan highlights',
    dark: {
      background: '#0C1929',
      surface: '#152238',
      primary: '#3B82F6',
      secondary: '#06B6D4',
      text: '#FFFFFF',
      muted: '#94A3B8',
    },
    light: {
      background: '#F8FAFC',
      surface: '#FFFFFF',
      primary: '#2563EB',
      secondary: '#0891B2',
      text: '#1E3A5F',
      muted: '#64748B',
    },
  },
  {
    id: 'theme_three',
    name: 'Sunset Orange',
    description: 'Warm and vibrant orange tones',
    dark: {
      background: '#1A1310',
      surface: '#2A1F1A',
      primary: '#F97316',
      secondary: '#EAB308',
      text: '#FFFFFF',
      muted: '#A8A29E',
    },
    light: {
      background: '#FFFBF5',
      surface: '#FFFFFF',
      primary: '#EA580C',
      secondary: '#CA8A04',
      text: '#431407',
      muted: '#78716C',
    },
  },
  {
    id: 'theme_four',
    name: 'Forest Earth',
    description: 'Natural green with earthy accents',
    dark: {
      background: '#0D1912',
      surface: '#162419',
      primary: '#22C55E',
      secondary: '#84CC16',
      text: '#FFFFFF',
      muted: '#9CA3AF',
    },
    light: {
      background: '#F5FFF8',
      surface: '#FFFFFF',
      primary: '#16A34A',
      secondary: '#65A30D',
      text: '#14532D',
      muted: '#6B7280',
    },
  },
];

const ThemeMiniPreview = ({ theme, mode, isSelected }: { theme: typeof themeDefinitions[0]; mode: 'dark' | 'light'; isSelected: boolean }) => {
  const palette = mode === 'dark' ? theme.dark : theme.light;
  
  return (
    <motion.div
      className="relative rounded-xl overflow-hidden border-2 transition-all"
      style={{ 
        backgroundColor: palette.background,
        borderColor: isSelected ? palette.primary : 'transparent',
      }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Mini Hero Preview */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div 
              className="w-6 h-6 rounded-md"
              style={{ background: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})` }}
            />
            <div className="w-16 h-2 rounded-full" style={{ backgroundColor: palette.muted + '40' }} />
          </div>
          <div className="flex gap-1">
            <div className="w-8 h-2 rounded-full" style={{ backgroundColor: palette.muted + '30' }} />
            <div className="w-8 h-2 rounded-full" style={{ backgroundColor: palette.muted + '30' }} />
          </div>
        </div>
        
        {/* Hero Content */}
        <div className="text-center mb-4">
          <div className="w-20 h-3 rounded-full mx-auto mb-2" style={{ backgroundColor: palette.primary + '30' }} />
          <div className="w-32 h-4 rounded-full mx-auto mb-1" style={{ backgroundColor: palette.text + '20' }} />
          <div className="w-24 h-4 rounded-full mx-auto mb-3" style={{ background: `linear-gradient(90deg, ${palette.primary}, ${palette.secondary})` }} />
          <div className="w-28 h-2 rounded-full mx-auto" style={{ backgroundColor: palette.muted + '30' }} />
        </div>
        
        {/* CTA Buttons */}
        <div className="flex gap-2 justify-center mb-4">
          <div 
            className="px-3 py-1.5 rounded-full text-[10px] font-medium"
            style={{ backgroundColor: palette.primary, color: '#FFFFFF' }}
          >
            Fast Order
          </div>
          <div 
            className="px-3 py-1.5 rounded-full text-[10px] font-medium border"
            style={{ borderColor: palette.primary + '50', color: palette.text }}
          >
            Services
          </div>
        </div>
        
        {/* Service Cards */}
        <div className="grid grid-cols-4 gap-1">
          {[0, 1, 2, 3].map((i) => (
            <div 
              key={i}
              className="p-2 rounded-lg"
              style={{ backgroundColor: palette.surface }}
            >
              <div 
                className="w-6 h-6 rounded-md mx-auto mb-1"
                style={{ background: `linear-gradient(135deg, ${palette.primary}80, ${palette.secondary}80)` }}
              />
              <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: palette.muted + '30' }} />
              <div className="w-2/3 h-1.5 rounded-full mt-1 mx-auto" style={{ backgroundColor: palette.primary }} />
            </div>
          ))}
        </div>
      </div>
      
      {/* Mode Badge */}
      <div 
        className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1"
        style={{ backgroundColor: palette.surface, color: palette.text }}
      >
        {mode === 'dark' ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
        {mode === 'dark' ? 'Dark' : 'Light'}
      </div>
      
      {isSelected && (
        <motion.div 
          className="absolute inset-0 border-2 rounded-xl pointer-events-none"
          style={{ borderColor: palette.primary }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div 
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: palette.primary }}
          >
            <Check className="w-4 h-4 text-white" />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export function ThemePreviewModal({ onApplyTheme, currentTheme }: ThemePreviewModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'dark' | 'light'>('dark');

  const handleApply = () => {
    if (selectedTheme) {
      onApplyTheme(selectedTheme, previewMode);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Eye className="w-4 h-4" />
          Preview Themes
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-5 h-5 text-primary" />
            Theme Preview Gallery
          </DialogTitle>
        </DialogHeader>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-6">
          <Tabs value={previewMode} onValueChange={(v) => setPreviewMode(v as 'dark' | 'light')}>
            <TabsList className="grid grid-cols-2 w-64">
              <TabsTrigger value="dark" className="gap-2">
                <Moon className="w-4 h-4" /> Dark Mode
              </TabsTrigger>
              <TabsTrigger value="light" className="gap-2">
                <Sun className="w-4 h-4" /> Light Mode
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Theme Grid */}
        <div className="grid grid-cols-2 gap-6">
          {themeDefinitions.map((theme) => (
            <motion.div
              key={theme.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card 
                className={`p-4 cursor-pointer transition-all ${
                  selectedTheme === theme.id 
                    ? 'ring-2 ring-primary shadow-lg' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedTheme(theme.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{theme.name}</h3>
                    <p className="text-sm text-muted-foreground">{theme.description}</p>
                  </div>
                  {currentTheme === theme.id && (
                    <Badge variant="secondary">Current</Badge>
                  )}
                </div>
                
                {/* Side-by-side Dark/Light Preview */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground text-center">Dark</p>
                    <ThemeMiniPreview 
                      theme={theme} 
                      mode="dark" 
                      isSelected={selectedTheme === theme.id && previewMode === 'dark'} 
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground text-center">Light</p>
                    <ThemeMiniPreview 
                      theme={theme} 
                      mode="light" 
                      isSelected={selectedTheme === theme.id && previewMode === 'light'} 
                    />
                  </div>
                </div>

                {/* Color Swatches */}
                <div className="flex items-center justify-center gap-2 mt-4">
                  <div 
                    className="w-6 h-6 rounded-full shadow-sm" 
                    style={{ backgroundColor: previewMode === 'dark' ? theme.dark.background : theme.light.background }}
                    title="Background"
                  />
                  <div 
                    className="w-6 h-6 rounded-full shadow-sm" 
                    style={{ backgroundColor: previewMode === 'dark' ? theme.dark.primary : theme.light.primary }}
                    title="Primary"
                  />
                  <div 
                    className="w-6 h-6 rounded-full shadow-sm" 
                    style={{ backgroundColor: previewMode === 'dark' ? theme.dark.secondary : theme.light.secondary }}
                    title="Secondary"
                  />
                  <div 
                    className="w-6 h-6 rounded-full shadow-sm border" 
                    style={{ backgroundColor: previewMode === 'dark' ? theme.dark.surface : theme.light.surface }}
                    title="Surface"
                  />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Apply Button */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleApply} 
            disabled={!selectedTheme}
            className="gap-2"
          >
            <Check className="w-4 h-4" />
            Apply {selectedTheme ? themeDefinitions.find(t => t.id === selectedTheme)?.name : 'Theme'} ({previewMode})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ThemePreviewModal;
