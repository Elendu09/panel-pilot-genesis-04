import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Smartphone,
  Tablet,
  Monitor,
  Save,
  ChevronLeft,
  ChevronRight,
  Wand2,
  Palette,
  Image,
  Sparkles,
  Type,
  Maximize,
  Layers,
  MousePointer,
  Layout,
  Zap,
  BarChart3,
  Users,
  HelpCircle,
  MessageSquare,
  Code,
  Sun,
  Moon,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MobileDesignSliderProps {
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
  previewThemeMode?: 'dark' | 'light';
  onTogglePreviewTheme?: () => void;
  deviceMode?: 'all' | 'mobileOnly';
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

export function MobileDesignSlider({
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
  previewThemeMode = 'dark',
  onTogglePreviewTheme,
  deviceMode = 'all',
}: MobileDesignSliderProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(1);
  const [viewMode, setViewMode] = useState<'preview' | 'controls'>('preview');
  
  // Debounce swipe handlers to prevent rapid navigation
  const lastSwipeTime = useRef(0);
  const SWIPE_DEBOUNCE_MS = 250;

  const devices = deviceMode === 'mobileOnly'
    ? ([{ key: 'mobile' as const, icon: Smartphone, label: 'Mobile' }] as const)
    : ([
        { key: 'mobile' as const, icon: Smartphone, label: 'Mobile' },
        { key: 'tablet' as const, icon: Tablet, label: 'Tablet' },
        { key: 'desktop' as const, icon: Monitor, label: 'Desktop' },
      ] as const);

  const handleDeviceSwipe = useCallback((direction: 'left' | 'right') => {
    if (deviceMode === 'mobileOnly') return;

    if (direction === 'left' && currentPreviewIndex < 2) {
      const newIndex = currentPreviewIndex + 1;
      setCurrentPreviewIndex(newIndex);
      setPreviewDevice((devices as any)[newIndex].key);
    } else if (direction === 'right' && currentPreviewIndex > 0) {
      const newIndex = currentPreviewIndex - 1;
      setCurrentPreviewIndex(newIndex);
      setPreviewDevice((devices as any)[newIndex].key);
    }
  }, [currentPreviewIndex, setPreviewDevice, deviceMode, devices]);

  const handleSectionSwipe = useCallback((direction: 'left' | 'right') => {
    const now = Date.now();
    if (now - lastSwipeTime.current < SWIPE_DEBOUNCE_MS) return;
    lastSwipeTime.current = now;
    
    if (direction === 'left' && currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
    } else if (direction === 'right' && currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
    }
  }, [currentSectionIndex]);

  const currentSection = sections[currentSectionIndex];

  return (
    <div className="flex flex-col h-screen bg-slate-950 overflow-hidden">
      {/* Top Bar - Enhanced styling with cleaner contrast */}
      <div className="flex items-center justify-between px-3 py-2.5 bg-slate-900 border-b border-slate-700/50">
        {/* View Mode Toggle - Pill with stronger contrast */}
        <div className="flex items-center gap-0.5 p-0.5 bg-slate-800 rounded-full border border-slate-700/50">
          <button
            onClick={() => setViewMode('preview')}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
              viewMode === 'preview' 
                ? "bg-primary text-primary-foreground shadow-md" 
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            Preview
          </button>
          <button
            onClick={() => setViewMode('controls')}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
              viewMode === 'controls' 
                ? "bg-primary text-primary-foreground shadow-md" 
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            Controls
          </button>
        </div>

        {/* Device Selector - Only show in preview mode */}
        {viewMode === 'preview' && deviceMode !== 'mobileOnly' && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => handleDeviceSwipe('right')}
              disabled={currentPreviewIndex === 0}
            >
              <ChevronLeft className="w-3 h-3" />
            </Button>
            <div className="flex gap-1">
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
                      "p-1 rounded-lg transition-all",
                      currentPreviewIndex === idx
                        ? "bg-primary/20 text-primary"
                        : "text-white/40 hover:text-white/60"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                );
              })}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => handleDeviceSwipe('left')}
              disabled={currentPreviewIndex === 2}
            >
              <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        )}

        {/* Section info - Only show in controls mode with Presets badge styling */}
        {viewMode === 'controls' && (
          <div className="flex items-center gap-2 px-2 py-1 bg-slate-800/60 rounded-lg border border-slate-700/30">
            <div className={cn("p-1 rounded-lg bg-gradient-to-br", currentSection.color)}>
              <currentSection.icon className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-medium text-slate-200">{currentSection.title}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
        {/* Preview Theme Toggle - Always visible */}
          {onTogglePreviewTheme && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 transition-colors",
                previewThemeMode === 'dark' 
                  ? "bg-slate-800 hover:bg-slate-700" 
                  : "bg-amber-100 hover:bg-amber-200"
              )}
              onClick={onTogglePreviewTheme}
              title={previewThemeMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {previewThemeMode === 'dark' ? (
                <Sun className="w-3.5 h-3.5 text-yellow-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-slate-600" />
              )}
            </Button>
          )}
          <Button
            size="sm"
            onClick={onSave}
            disabled={!hasUnsavedChanges || saving}
            className="h-7 gap-1 text-xs px-2"
          >
            <Save className="w-3 h-3" />
            Save
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {viewMode === 'preview' ? (
          <motion.div 
            key="preview"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex-1 overflow-hidden relative"
            drag={deviceMode === 'mobileOnly' ? false : 'x'}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
              if (deviceMode === 'mobileOnly') return;
              if (info.offset.x < -50) handleDeviceSwipe('left');
              if (info.offset.x > 50) handleDeviceSwipe('right');
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
                    "rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 transition-all",
                    previewThemeMode === 'dark' ? 'bg-slate-900' : 'bg-white',
                    previewDevice === 'mobile' && "w-full max-w-[320px]",
                    previewDevice === 'tablet' && "w-full max-w-[480px]",
                    previewDevice === 'desktop' && "w-full max-w-[900px]"
                  )}
                  style={{ 
                    height: previewDevice === 'mobile' ? 'min(580px, calc(100vh - 120px))' : 'calc(100vh - 120px)',
                    maxHeight: 'calc(100vh - 120px)'
                  }}
                >
                  <div className={cn("w-full h-full overflow-auto", previewThemeMode === 'dark' ? 'dark' : 'light')}>
                    {children}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Device indicator dots */}
            {deviceMode !== 'mobileOnly' && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                {devices.map((_, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all",
                      currentPreviewIndex === idx ? "bg-primary w-3" : "bg-white/30"
                    )}
                  />
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="controls"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Section Navigation - Enhanced with cleaner background */}
            <div className="flex items-center justify-between px-3 py-2.5 bg-slate-900 border-b border-slate-700/50">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                onClick={() => handleSectionSwipe('right')}
                disabled={currentSectionIndex === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-800 rounded-full border border-slate-700/50">
                <div className={cn("p-1.5 rounded-lg bg-gradient-to-br", currentSection.color)}>
                  <currentSection.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-slate-200">{currentSection.title}</span>
                <Badge variant="secondary" className="text-[10px] px-2 py-0.5 bg-slate-700 text-slate-300 border border-slate-600">
                  {currentSectionIndex + 1}/{sections.length}
                </Badge>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                onClick={() => handleSectionSwipe('left')}
                disabled={currentSectionIndex === sections.length - 1}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Section dots */}
            <div className="flex justify-center gap-1 py-2 px-3 overflow-x-auto bg-slate-900/30">
              {sections.map((section, idx) => (
                <button
                  key={section.id}
                  onClick={() => setCurrentSectionIndex(idx)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all flex-shrink-0",
                    currentSectionIndex === idx ? "bg-primary w-4" : "bg-white/20 hover:bg-white/40"
                  )}
                />
              ))}
            </div>

            {/* Section Content - Full Height */}
            <ScrollArea className="flex-1">
              <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.1}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -50) handleSectionSwipe('left');
                  if (info.offset.x > 50) handleSectionSwipe('right');
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSection.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.1 }}
                    className="p-4"
                    style={{ willChange: 'transform, opacity' }}
                  >
                    {renderSection(currentSection.id)}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unsaved changes indicator - Always visible at bottom */}
      {hasUnsavedChanges && (
        <div className="flex items-center justify-center gap-2 py-2 bg-amber-500/10 border-t border-amber-500/20">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-xs text-amber-400">Unsaved changes</span>
        </div>
      )}
    </div>
  );
}
