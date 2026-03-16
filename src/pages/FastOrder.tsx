import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Check, Search, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { FastOrderSection } from '@/components/storefront/FastOrderSection';
import { useBuyerAuth } from '@/contexts/BuyerAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';
import { BuyerThemeWrapper } from '@/components/buyer-themes';
import { useAnalyticsTracking } from '@/hooks/use-analytics-tracking';
import { useUnifiedServices } from '@/hooks/useUnifiedServices';

interface Panel {
  id: string;
  name: string;
  logo_url?: string;
  primary_color?: string;
  custom_branding?: any;
}

interface Service {
  id: string;
  name: string;
  price: number;
  category: string;
  min_quantity?: number;
  max_quantity?: number;
}

// Enhanced Grid Background Pattern Component with multiple layers - uses theme CSS variables
const EnhancedGridPattern = ({ themeMode }: { themeMode: string }) => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {/* Primary grid - 60px with theme-aware colors */}
    <div 
      className={cn(
        "absolute inset-0",
        "bg-[linear-gradient(to_right,var(--grid-color)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid-color)_1px,transparent_1px)]",
        "bg-[size:60px_60px]",
        themeMode === 'dark' 
          ? '[--grid-color:rgba(255,255,255,0.035)]' 
          : '[--grid-color:hsl(var(--primary)/0.08)]'
      )}
    />
    
    {/* Secondary larger grid - 120px for depth */}
    <div 
      className={cn(
        "absolute inset-0",
        "bg-[linear-gradient(to_right,var(--grid-color-lg)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid-color-lg)_1px,transparent_1px)]",
        "bg-[size:120px_120px]",
        themeMode === 'dark' 
          ? '[--grid-color-lg:rgba(255,255,255,0.02)]' 
          : '[--grid-color-lg:hsl(var(--primary)/0.05)]'
      )}
    />
    
    {/* Corner gradient accents - uses theme primary color */}
    <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl bg-[hsl(var(--primary)/0.08)]" />
    <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl bg-[hsl(var(--accent)/0.06)]" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl bg-[hsl(var(--primary)/0.04)]" />
    
    {/* Gradient fade at edges */}
    <div className={cn(
      "absolute inset-0",
      themeMode === 'dark'
        ? 'bg-gradient-to-b from-background/60 via-transparent to-background/80'
        : 'bg-gradient-to-b from-background/40 via-transparent to-background/60'
    )} />
  </div>
);

// Vertical Step Progress Component for Desktop Sidebar
const VerticalStepProgress = ({ 
  currentStep, 
  panelLogo, 
  panelName,
  themeMode 
}: { 
  currentStep: number; 
  panelLogo?: string;
  panelName: string;
  themeMode: string;
}) => {
  const steps = [
    { id: 1, label: 'Network', description: 'Choose platform' },
    { id: 2, label: 'Category', description: 'Pick service type' },
    { id: 3, label: 'Service', description: 'Select service' },
    { id: 4, label: 'Order', description: 'Enter details' },
    { id: 5, label: 'Payment', description: 'Complete payment' },
    { id: 6, label: 'Track', description: 'Order status' },
  ];

  const progressPercent = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col w-72 h-full border-r p-6 flex-shrink-0 transition-colors duration-300 relative overflow-hidden",
        "bg-background border-border"
      )}
    >
      {/* Subtle glow effect - uses theme primary color */}
      <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl bg-[hsl(var(--primary)/0.1)]" />
      <div className="absolute bottom-20 left-0 w-32 h-32 rounded-full blur-2xl bg-[hsl(var(--accent)/0.08)]" />

      {/* Panel Logo */}
      <div className="flex items-center gap-3 mb-8 relative z-10">
        <img 
          src={panelLogo || '/default-panel-favicon.png'} 
          alt={panelName} 
          className="h-10 w-10 rounded-xl object-cover"
        />
        <div>
          <span className="font-bold text-lg tracking-tight block text-foreground">
            {panelName}
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            Fast Order
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 relative z-10">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold uppercase tracking-wider text-muted-foreground">
            Progress
          </span>
          <span className="font-bold tabular-nums text-primary">
            {Math.round(progressPercent)}%
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden bg-muted">
          <motion.div 
            className="h-full rounded-full bg-primary"
            style={{ boxShadow: 'var(--step-glow)' }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Vertical Step Progress */}
      <div className="flex-1 relative z-10">
        <div className="relative pl-5">
          {/* Background connecting line */}
          <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-border" />
          
          {/* Animated progress line */}
          <motion.div 
            className="absolute left-[11px] top-4 w-0.5 bg-primary"
            initial={{ height: 0 }}
            animate={{ height: `${Math.min(100, ((currentStep - 1) / (steps.length - 1)) * 100)}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />

          {steps.map((step, index) => {
            const isCompleted = currentStep > step.id;
            const isActive = currentStep === step.id;

            return (
              <motion.div 
                key={step.id} 
                className="relative mb-6 last:mb-0"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Step Item */}
                <div className="flex items-start gap-4">
                  {/* Step Circle */}
                  <motion.div 
                    animate={{ 
                      scale: isActive ? 1.15 : 1,
                      boxShadow: isActive 
                        ? themeMode === 'dark' 
                          ? '0 0 20px rgba(59, 130, 246, 0.6)' 
                          : '0 0 24px rgba(59, 130, 246, 0.5)'
                        : 'none'
                    }}
                    className={cn(
                      "relative z-10 flex items-center justify-center w-6 h-6 rounded-full -ml-5 transition-all duration-300",
                      isCompleted 
                        ? 'bg-gradient-to-br from-orange-500 to-amber-500' 
                        : isActive 
                          ? 'border-2 border-primary bg-background'
                          : 'bg-muted border border-border'
                    )}
                  >
                    {isCompleted ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      >
                        <Check className="w-3.5 h-3.5 text-white" />
                      </motion.div>
                    ) : isActive ? (
                      <motion.div 
                        className="w-2 h-2 rounded-full bg-primary"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                    )}
                  </motion.div>

                  {/* Step Content */}
                  <div className="pt-0.5">
                    <span 
                      className={cn(
                        "text-sm font-semibold tracking-tight block transition-colors duration-300",
                        isCompleted 
                          ? 'text-orange-500'
                          : isActive 
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                      )}
                    >
                      {step.label}
                    </span>
                    <span 
                      className={cn(
                        "text-xs transition-colors duration-300",
                        isActive 
                          ? 'text-muted-foreground'
                          : 'text-muted-foreground/70'
                      )}
                    >
                      {step.description}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Theme Toggle at Bottom */}
      <div className="pt-6 border-t relative z-10 border-border">
        <div className="flex items-center justify-between p-3 rounded-xl transition-colors bg-muted">
          <span className="text-sm font-medium text-muted-foreground">
            Theme
          </span>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
};

// Mobile Step Progress (compact horizontal) - always visible sticky
const MobileStepProgress = ({ currentStep, themeMode }: { currentStep: number; themeMode: string }) => {
  const steps = ['Network', 'Category', 'Service', 'Order', 'Pay', 'Track'];
  
  return (
    <div className={cn(
      "lg:hidden sticky top-0 z-50 border-b transition-colors duration-300",
      "bg-background/98 backdrop-blur-xl border-border"
    )}>
      {/* Progress bar */}
      <div className="h-1 w-full bg-muted">
        <motion.div 
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      
      <div className="flex items-center justify-center gap-1 py-3 px-2">
        {steps.map((step, index) => {
          const isCompleted = currentStep > index + 1;
          const isActive = currentStep === index + 1;
          
          return (
            <div key={index} className="flex items-center">
              <div className="flex flex-col items-center">
                <motion.div 
                  animate={{ 
                    scale: isActive ? 1.1 : 1,
                  }}
                  className={cn(
                    "flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-bold transition-all duration-300",
                    isCompleted 
                      ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white' 
                      : isActive 
                        ? 'border-2 border-primary text-primary bg-background'
                        : 'bg-muted text-muted-foreground border border-border'
                  )}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : index + 1}
                </motion.div>
                <span className={cn(
                  "text-[9px] font-medium mt-1 transition-colors",
                  isActive 
                    ? 'text-primary'
                    : isCompleted
                      ? 'text-orange-500'
                      : 'text-muted-foreground/70'
                )}>
                  {step}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  "w-4 sm:w-6 h-0.5 mx-0.5 rounded-full transition-all duration-500",
                  isCompleted 
                    ? 'bg-orange-500' 
                    : 'bg-muted'
                )} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const FastOrderContent = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get actual theme from context instead of database branding
  const { theme } = useTheme();
  const resolvedTheme = theme === 'system' 
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;
  
  // Dark mode background color
  const pageBgClass = resolvedTheme === 'dark' 
    ? 'bg-[#0a0a12]' 
    : 'bg-background';
  
  // Try to get buyer context - may be undefined if not wrapped
  let buyerContext: { buyer: any; panelId?: string } | null = null;
  try {
    buyerContext = useBuyerAuth();
  } catch {
    // Not wrapped in BuyerAuthProvider - that's okay
  }
  
  const [panel, setPanel] = useState<Panel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  // Resolve panelId: URL param > context > localStorage
  const resolvedPanelId = 
    searchParams.get('panel') || 
    buyerContext?.panelId || 
    localStorage.getItem('current_panel_id');

  // Use unified services hook for consistent counts across all pages
  const { services: unifiedServices, loading: servicesLoading } = useUnifiedServices({ 
    panelId: resolvedPanelId, 
    enabled: !!resolvedPanelId 
  });

  // Map unified services to the Service interface expected by FastOrderSection
  const services: Service[] = unifiedServices.map(s => ({
    id: s.id,
    name: s.name,
    price: s.price,
    category: s.category,
    min_quantity: s.minQuantity,
    max_quantity: s.maxQuantity,
    provider_service_id: s.providerServiceId,
  }));

  // Analytics tracking for Fast Order funnel
  const { trackPageVisit, trackFastOrderStep } = useAnalyticsTracking(resolvedPanelId || undefined);

  // Track page visit on mount
  useEffect(() => {
    if (resolvedPanelId) {
      trackPageVisit('fast_order');
    }
  }, [resolvedPanelId, trackPageVisit]);

  // Track step changes
  useEffect(() => {
    if (resolvedPanelId && currentStep > 1) {
      const stepNames = ['network', 'category', 'service', 'order', 'payment', 'complete'];
      trackFastOrderStep(currentStep, stepNames[currentStep - 1] || 'unknown');
    }
  }, [currentStep, resolvedPanelId, trackFastOrderStep]);

  useEffect(() => {
    // Store resolved panelId for future use
    if (resolvedPanelId) {
      localStorage.setItem('current_panel_id', resolvedPanelId);
    }

    const fetchPanelData = async () => {
      if (!resolvedPanelId) {
        setError('No panel specified');
        setLoading(false);
        return;
      }

      try {
        // Fetch panel data only - services come from useUnifiedServices
        const { data: panelData, error: panelError } = await supabase
          .from('panels_public')
          .select('id, name, logo_url, primary_color, custom_branding')
          .eq('id', resolvedPanelId)
          .maybeSingle();

        if (panelError) throw panelError;
        setPanel(panelData);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchPanelData();
  }, [resolvedPanelId]);

  if (loading || servicesLoading) {
    return (
      <div className="h-screen h-[100dvh] bg-background flex overflow-hidden">
        <div className="hidden lg:block w-72 border-r border-border p-6 flex-shrink-0">
          <Skeleton className="h-11 w-36 mb-8" />
          <Skeleton className="h-1.5 w-full mb-6" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 mb-6">
              <Skeleton className="w-6 h-6 rounded-full" />
              <div>
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex-1 p-6 overflow-auto">
          <Skeleton className="h-12 w-full max-w-md mb-8" />
          <Skeleton className="h-[500px] w-full" />
        </div>
      </div>
    );
  }

  if (error || !panel) {
    return (
      <div className="h-screen h-[100dvh] bg-background flex items-center justify-center overflow-hidden">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Panel Not Found</h1>
          <p className="text-muted-foreground mb-6">{error || 'Unable to load panel data'}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate('/')}>Go Home</Button>
            <Button variant="outline" asChild>
              <a href="https://homeofsmm.com/auth">Create Your Own Panel</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const customBranding = panel.custom_branding || {};
  // Use resolved theme from context instead of database branding
  const themeMode = resolvedTheme;

  return (
    <BuyerThemeWrapper panelId={resolvedPanelId || undefined}>
      <Helmet>
        <title>Fast Order - {panel.name}</title>
        <meta name="description" content={`Quick order process for ${panel.name}`} />
      </Helmet>

      <div className={cn(
        "h-screen h-[100dvh] flex flex-col lg:flex-row overflow-hidden transition-colors duration-300 relative",
        pageBgClass
      )}>
        {/* Enhanced Grid Background Pattern */}
        <EnhancedGridPattern themeMode={themeMode} />

        {/* Desktop Vertical Step Progress Sidebar */}
        <VerticalStepProgress 
          currentStep={currentStep} 
          panelLogo={panel.logo_url}
          panelName={panel.name}
          themeMode={themeMode}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden relative z-10">
          {/* Mobile Header with Logo */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "lg:hidden sticky top-0 z-40 backdrop-blur-xl border-b",
              themeMode === 'dark' 
                ? 'bg-gray-950/90 border-gray-800' 
                : 'bg-white/90 border-gray-200'
            )}
          >
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img 
                  src={panel.logo_url || '/default-panel-favicon.png'} 
                  alt={panel.name} 
                  className="h-8 w-8 rounded-lg object-cover"
                />
                <span className={cn(
                  "font-semibold tracking-tight",
                  themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  {panel.name}
                </span>
              </div>
              <ThemeToggle />
            </div>
          </motion.header>

          {/* Mobile Step Progress - Sticky */}
          <MobileStepProgress currentStep={currentStep} themeMode={themeMode} />

          {/* Main Content Area - Scrollable */}
          <main className="flex-1 overflow-auto">
            {/* Search Bar - Desktop Only */}
            <div className="hidden lg:block px-8 pt-6">
              <div className="relative max-w-2xl mx-auto">
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Sparkles className={cn(
                    "w-5 h-5",
                    themeMode === 'dark' ? 'text-blue-400' : 'text-blue-500'
                  )} />
                </div>
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Search className={cn(
                    "w-5 h-5",
                    themeMode === 'dark' ? 'text-gray-500' : 'text-gray-400'
                  )} />
                </div>
                <Input
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "h-14 pl-12 pr-12 rounded-2xl text-base font-medium transition-all",
                    themeMode === 'dark'
                      ? 'bg-gray-900 border-gray-800 placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-blue-500/20'
                      : 'bg-white border-gray-200 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20 focus:shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                  )}
                />
              </div>
            </div>

            <FastOrderSection
              services={services.filter(s => 
                !searchQuery || 
                s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.category.toLowerCase().includes(searchQuery.toLowerCase())
              )}
              panelId={panel.id}
              panelName={panel.name}
              customization={{
                themeMode,
                primaryColor: panel.primary_color,
                ...customBranding,
              }}
              onStepChange={setCurrentStep}
            />
          </main>
        </div>
      </div>
    </BuyerThemeWrapper>
  );
};

// Export directly - BuyerAuthProvider is provided by TenantRouter on tenant domains
export default FastOrderContent;
