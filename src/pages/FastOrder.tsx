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

// Grid Background Pattern Component
const GridPattern = ({ themeMode }: { themeMode: string }) => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    <div 
      className={cn(
        "absolute inset-0",
        "bg-[linear-gradient(to_right,var(--grid-color)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid-color)_1px,transparent_1px)]",
        "bg-[size:60px_60px]",
        themeMode === 'dark' 
          ? '[--grid-color:rgba(255,255,255,0.03)]' 
          : '[--grid-color:rgba(0,0,0,0.04)]'
      )}
    />
    {/* Gradient fade at edges */}
    <div className={cn(
      "absolute inset-0",
      themeMode === 'dark'
        ? 'bg-gradient-to-b from-slate-950/50 via-transparent to-slate-950/80'
        : 'bg-gradient-to-b from-white/30 via-transparent to-gray-100/50'
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
    { id: 1, label: 'Categories', description: 'Choose platform' },
    { id: 2, label: 'Service', description: 'Pick service' },
    { id: 3, label: 'Order', description: 'Enter details' },
    { id: 4, label: 'Review', description: 'Confirm order' },
    { id: 5, label: 'Payment', description: 'Complete payment' },
  ];

  const progressPercent = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col w-72 h-full border-r p-6 flex-shrink-0 transition-colors duration-300 relative overflow-hidden",
        themeMode === 'dark' 
          ? 'bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border-white/5' 
          : 'bg-gradient-to-b from-white via-gray-50/50 to-gray-100/30 border-gray-200/80'
      )}
    >
      {/* Subtle glow effect */}
      <div className={cn(
        "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20",
        themeMode === 'dark' ? 'bg-blue-500' : 'bg-blue-400'
      )} />

      {/* Panel Logo */}
      <div className="flex items-center gap-3 mb-8 relative z-10">
        {panelLogo ? (
          <img 
            src={panelLogo} 
            alt={panelName} 
            className="h-10 w-auto object-contain"
          />
        ) : (
          <div className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg",
            themeMode === 'dark' 
              ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30'
              : 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/40'
          )}>
            {panelName.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <span className={cn(
            "font-bold text-lg tracking-tight block",
            themeMode === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            {panelName}
          </span>
          <span className={cn(
            "text-xs font-medium",
            themeMode === 'dark' ? 'text-gray-500' : 'text-gray-400'
          )}>
            Fast Order
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 relative z-10">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className={cn(
            "font-semibold uppercase tracking-wider",
            themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'
          )}>
            Progress
          </span>
          <span className={cn(
            "font-bold tabular-nums",
            themeMode === 'dark' ? 'text-blue-400' : 'text-blue-600'
          )}>
            {Math.round(progressPercent)}%
          </span>
        </div>
        <div className={cn(
          "h-1.5 rounded-full overflow-hidden",
          themeMode === 'dark' ? 'bg-slate-800' : 'bg-gray-200'
        )}>
          <motion.div 
            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
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
          <div className={cn(
            "absolute left-[11px] top-4 bottom-4 w-0.5",
            themeMode === 'dark' ? 'bg-white/5' : 'bg-gray-200'
          )} />
          
          {/* Animated progress line */}
          <motion.div 
            className="absolute left-[11px] top-4 w-0.5 bg-gradient-to-b from-blue-500 to-blue-400"
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
                          ? '0 0 20px rgba(59, 130, 246, 0.5)' 
                          : '0 0 20px rgba(59, 130, 246, 0.3)'
                        : 'none'
                    }}
                    className={cn(
                      "relative z-10 flex items-center justify-center w-6 h-6 rounded-full -ml-5 transition-all duration-300",
                      isCompleted 
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                        : isActive 
                          ? themeMode === 'dark'
                            ? 'border-2 border-blue-400 bg-slate-900'
                            : 'border-2 border-blue-500 bg-white'
                          : themeMode === 'dark' 
                            ? 'bg-slate-800/80 border border-white/10' 
                            : 'bg-gray-100 border border-gray-200'
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
                        className={cn(
                          "w-2 h-2 rounded-full",
                          themeMode === 'dark' ? 'bg-blue-400' : 'bg-blue-500'
                        )}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    ) : (
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        themeMode === 'dark' ? 'bg-white/20' : 'bg-gray-300'
                      )} />
                    )}
                  </motion.div>

                  {/* Step Content */}
                  <div className="pt-0.5">
                    <span 
                      className={cn(
                        "text-sm font-semibold tracking-tight block transition-colors duration-300",
                        isCompleted 
                          ? themeMode === 'dark' ? 'text-blue-400' : 'text-blue-600'
                          : isActive 
                            ? themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                            : themeMode === 'dark' ? 'text-gray-500' : 'text-gray-400'
                      )}
                    >
                      {step.label}
                    </span>
                    <span 
                      className={cn(
                        "text-xs transition-colors duration-300",
                        isActive 
                          ? themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          : themeMode === 'dark' ? 'text-gray-600' : 'text-gray-400'
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
      <div className={cn(
        "pt-6 border-t relative z-10",
        themeMode === 'dark' ? 'border-white/5' : 'border-gray-200/80'
      )}>
        <div className={cn(
          "flex items-center justify-between p-3 rounded-xl transition-colors",
          themeMode === 'dark' ? 'bg-slate-800/50' : 'bg-gray-100/80'
        )}>
          <span className={cn(
            "text-sm font-medium",
            themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'
          )}>
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
  const steps = ['Category', 'Service', 'Order', 'Review', 'Pay'];
  
  return (
    <div className={cn(
      "lg:hidden sticky top-0 z-50 border-b transition-colors duration-300",
      themeMode === 'dark' 
        ? 'bg-slate-900/98 backdrop-blur-xl border-white/5' 
        : 'bg-white/98 backdrop-blur-xl border-gray-200/80'
    )}>
      {/* Progress bar */}
      <div className={cn(
        "h-1 w-full",
        themeMode === 'dark' ? 'bg-slate-800' : 'bg-gray-200'
      )}>
        <motion.div 
          className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
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
                    boxShadow: isActive 
                      ? themeMode === 'dark' 
                        ? '0 0 12px rgba(59, 130, 246, 0.5)' 
                        : '0 0 12px rgba(59, 130, 246, 0.3)'
                      : 'none'
                  }}
                  className={cn(
                    "flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-bold transition-all duration-300",
                    isCompleted 
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' 
                      : isActive 
                        ? themeMode === 'dark'
                          ? 'border-2 border-blue-400 text-blue-400 bg-slate-800/80'
                          : 'border-2 border-blue-500 text-blue-600 bg-white'
                        : themeMode === 'dark'
                          ? 'bg-slate-800/60 text-gray-500 border border-white/5'
                          : 'bg-gray-100 text-gray-400 border border-gray-200/80'
                  )}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : index + 1}
                </motion.div>
                <span className={cn(
                  "text-[9px] font-medium mt-1 transition-colors",
                  isActive 
                    ? themeMode === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    : isCompleted
                      ? themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      : themeMode === 'dark' ? 'text-gray-600' : 'text-gray-400'
                )}>
                  {step}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  "w-4 sm:w-6 h-0.5 mx-0.5 rounded-full transition-all duration-500",
                  isCompleted 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-400' 
                    : themeMode === 'dark' ? 'bg-white/10' : 'bg-gray-200'
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
  
  // Try to get buyer context - may be undefined if not wrapped
  let buyerContext: { buyer: any; panelId?: string } | null = null;
  try {
    buyerContext = useBuyerAuth();
  } catch {
    // Not wrapped in BuyerAuthProvider - that's okay
  }
  
  const [panel, setPanel] = useState<Panel | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  // Resolve panelId: URL param > context > localStorage
  const resolvedPanelId = 
    searchParams.get('panel') || 
    buyerContext?.panelId || 
    localStorage.getItem('current_panel_id');

  useEffect(() => {
    // Store resolved panelId for future use
    if (resolvedPanelId) {
      localStorage.setItem('current_panel_id', resolvedPanelId);
    }

    const fetchData = async () => {
      if (!resolvedPanelId) {
        setError('No panel specified');
        setLoading(false);
        return;
      }

      try {
        // Fetch panel data
        const { data: panelData, error: panelError } = await supabase
          .from('panels')
          .select('id, name, logo_url, primary_color, custom_branding')
          .eq('id', resolvedPanelId)
          .single();

        if (panelError) throw panelError;
        setPanel(panelData);

        // Fetch services
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('id, name, price, category, min_quantity, max_quantity')
          .eq('panel_id', resolvedPanelId)
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (servicesError) throw servicesError;
        setServices(servicesData || []);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [resolvedPanelId]);

  if (loading) {
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
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const customBranding = panel.custom_branding || {};
  const themeMode = customBranding.themeMode || 'dark';

  return (
    <>
      <Helmet>
        <title>Fast Order - {panel.name}</title>
        <meta name="description" content={`Quick order process for ${panel.name}`} />
      </Helmet>

      <div className={cn(
        "h-screen h-[100dvh] flex flex-col lg:flex-row overflow-hidden transition-colors duration-300 relative",
        themeMode === 'dark' 
          ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' 
          : 'bg-gradient-to-br from-gray-50 via-white to-gray-100/50'
      )}>
        {/* Grid Background Pattern */}
        <GridPattern themeMode={themeMode} />

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
                ? 'bg-slate-900/80 border-white/10' 
                : 'bg-white/80 border-gray-200'
            )}
          >
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {panel.logo_url ? (
                  <img 
                    src={panel.logo_url} 
                    alt={panel.name} 
                    className="h-8 w-auto object-contain"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                    {panel.name.charAt(0).toUpperCase()}
                  </div>
                )}
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
                  <Search className="w-5 h-5 text-muted-foreground" />
                </div>
                <Input
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "h-14 pl-12 pr-12 rounded-2xl text-base font-medium",
                    themeMode === 'dark'
                      ? 'bg-slate-800/50 border-white/10 placeholder:text-gray-500'
                      : 'bg-white border-gray-200 shadow-sm placeholder:text-gray-400'
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
    </>
  );
};

// Export directly - BuyerAuthProvider is provided by TenantRouter on tenant domains
export default FastOrderContent;