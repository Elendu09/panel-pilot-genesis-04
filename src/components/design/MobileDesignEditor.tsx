import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  Smartphone,
  Tablet,
  Monitor,
  Settings,
  Palette,
  Type,
  Layout,
  Sparkles,
  Save,
  ChevronLeft,
  ChevronRight,
  Wand2,
  Image,
  Layers,
  MousePointer,
  Zap,
  BarChart3,
  Users,
  HelpCircle,
  MessageSquare,
  Code,
  Maximize,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MobileDesignEditorProps {
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  setPreviewDevice: (device: 'desktop' | 'tablet' | 'mobile') => void;
  hasUnsavedChanges: boolean;
  saving: boolean;
  onSave: () => void;
  children: React.ReactNode;
  renderSection: (sectionId: string) => React.ReactNode;
  currentTheme?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

const sections = [
  { id: 'presets', title: 'Presets', icon: Wand2, color: 'from-purple-500 to-pink-500' },
  { id: 'themes', title: 'Themes', icon: Palette, color: 'from-blue-500 to-cyan-500' },
  { id: 'branding', title: 'Branding', icon: Image, color: 'from-amber-500 to-orange-500' },
  { id: 'colors', title: 'Colors', icon: Sparkles, color: 'from-pink-500 to-rose-500' },
  { id: 'typography', title: 'Typography', icon: Type, color: 'from-green-500 to-emerald-500' },
  { id: 'spacing', title: 'Layout', icon: Maximize, color: 'from-indigo-500 to-violet-500' },
  { id: 'animations', title: 'Motion', icon: Sparkles, color: 'from-cyan-500 to-blue-500' },
  { id: 'backgrounds', title: 'Background', icon: Layers, color: 'from-slate-500 to-slate-600' },
  { id: 'buttons', title: 'Buttons', icon: MousePointer, color: 'from-violet-500 to-purple-500' },
  { id: 'hero', title: 'Hero', icon: Layout, color: 'from-rose-500 to-red-500' },
  { id: 'platform', title: 'Features', icon: Zap, color: 'from-yellow-500 to-amber-500' },
  { id: 'stats', title: 'Stats', icon: BarChart3, color: 'from-teal-500 to-green-500' },
  { id: 'testimonials', title: 'Reviews', icon: Users, color: 'from-blue-500 to-indigo-500' },
  { id: 'faqs', title: 'FAQs', icon: HelpCircle, color: 'from-orange-500 to-red-500' },
  { id: 'footer', title: 'Footer', icon: MessageSquare, color: 'from-slate-600 to-slate-700' },
  { id: 'advanced', title: 'Advanced', icon: Code, color: 'from-gray-500 to-gray-600' },
];

export function MobileDesignEditor({
  previewDevice,
  setPreviewDevice,
  hasUnsavedChanges,
  saving,
  onSave,
  children,
  renderSection,
  currentTheme,
  primaryColor,
  secondaryColor,
}: MobileDesignEditorProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(1); // 0=mobile, 1=tablet, 2=desktop

  const devices = [
    { key: 'mobile' as const, icon: Smartphone, label: 'Mobile' },
    { key: 'tablet' as const, icon: Tablet, label: 'Tablet' },
    { key: 'desktop' as const, icon: Monitor, label: 'Desktop' },
  ];

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left' && currentPreviewIndex < 2) {
      setCurrentPreviewIndex(prev => prev + 1);
      setPreviewDevice(devices[currentPreviewIndex + 1].key);
    } else if (direction === 'right' && currentPreviewIndex > 0) {
      setCurrentPreviewIndex(prev => prev - 1);
      setPreviewDevice(devices[currentPreviewIndex - 1].key);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: primaryColor || '#8B5CF6' }} 
            />
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: secondaryColor || '#EC4899' }} 
            />
          </div>
          <span className="text-xs font-medium text-white/70 truncate max-w-[100px]">
            {currentTheme || 'Custom'}
          </span>
        </div>

        {/* Device Swipe Indicator */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleSwipe('right')}
            disabled={currentPreviewIndex === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex gap-1.5">
            {devices.map((device, idx) => {
              const Icon = device.icon;
              return (
                <button
                  key={device.key}
                  onClick={() => {
                    setCurrentPreviewIndex(idx);
                    setPreviewDevice(device.key);
                  }}
                  className={cn(
                    "p-1.5 rounded-lg transition-all",
                    currentPreviewIndex === idx 
                      ? "bg-primary/20 text-primary" 
                      : "text-white/40 hover:text-white/60"
                  )}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleSwipe('left')}
            disabled={currentPreviewIndex === 2}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <Button
          size="sm"
          onClick={onSave}
          disabled={!hasUnsavedChanges || saving}
          className="h-8 gap-1.5"
        >
          <Save className="w-3.5 h-3.5" />
          Save
        </Button>
      </div>

      {/* Preview Area with Swipe */}
      <motion.div 
        className="flex-1 overflow-hidden relative"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDragEnd={(_, info) => {
          if (info.offset.x < -50) handleSwipe('left');
          if (info.offset.x > 50) handleSwipe('right');
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={previewDevice}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 p-2 flex items-start justify-center overflow-auto"
          >
            <div 
              className={cn(
                "bg-white rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 transition-all",
                previewDevice === 'mobile' && "w-full max-w-[375px]",
                previewDevice === 'tablet' && "w-full max-w-[500px]",
                previewDevice === 'desktop' && "w-full max-w-[1024px]"
              )}
              style={{ 
                height: previewDevice === 'mobile' ? 'min(667px, calc(100vh - 180px))' : 'calc(100vh - 180px)',
                maxHeight: 'calc(100vh - 180px)'
              }}
            >
              <div 
                className="w-full h-full overflow-auto"
                style={{
                  transform: 'none',
                  transformOrigin: 'top center',
                  width: '100%',
                  height: '100%',
                }}
              >
                {children}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Swipe hint dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {devices.map((_, idx) => (
            <div
              key={idx}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                currentPreviewIndex === idx ? "bg-primary w-4" : "bg-white/30"
              )}
            />
          ))}
        </div>
      </motion.div>

      {/* Bottom Sheet Trigger */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerTrigger asChild>
          <Button
            className="fixed bottom-4 left-1/2 -translate-x-1/2 gap-2 rounded-full px-6 shadow-xl shadow-primary/20"
            size="lg"
          >
            <Settings className="w-4 h-4" />
            Edit Design
            {hasUnsavedChanges && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 bg-amber-500/20 text-amber-400">
                •
              </Badge>
            )}
          </Button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="pb-2">
            <DrawerTitle className="flex items-center justify-between">
              <span>Design Controls</span>
              {activeSection && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveSection(null)}
                  className="text-muted-foreground"
                >
                  ← Back
                </Button>
              )}
            </DrawerTitle>
          </DrawerHeader>
          
          <ScrollArea className="h-[60vh] px-4 pb-6">
            <AnimatePresence mode="wait">
              {activeSection ? (
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {renderSection(activeSection)}
                </motion.div>
              ) : (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="grid grid-cols-3 gap-2"
                >
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className={cn("p-2 rounded-lg bg-gradient-to-br", section.color)}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs font-medium">{section.title}</span>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
