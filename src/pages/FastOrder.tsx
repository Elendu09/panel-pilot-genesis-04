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
    { id: 1, label: 'Categories' },
    { id: 2, label: 'Service' },
    { id: 3, label: 'Details' },
    { id: 4, label: 'Review' },
    { id: 5, label: 'Payment' },
  ];

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col w-64 h-full border-r p-6 flex-shrink-0 transition-colors duration-300",
        themeMode === 'dark' 
          ? 'bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border-white/5 shadow-xl shadow-black/20' 
          : 'bg-gradient-to-b from-white via-gray-50/50 to-gray-100/30 border-gray-200/80 shadow-lg shadow-gray-200/50'
      )}
    >
      {/* Panel Logo */}
      <div className="flex items-center gap-3 mb-10">
        {panelLogo ? (
          <img 
            src={panelLogo} 
            alt={panelName} 
            className="h-10 w-auto object-contain"
          />
        ) : (
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg",
            themeMode === 'dark' 
              ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30'
              : 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/40'
          )}>
            {panelName.charAt(0).toUpperCase()}
          </div>
        )}
        <span className={cn(
          "font-bold text-lg",
          themeMode === 'dark' ? 'text-white' : 'text-gray-900'
        )}>
          {panelName}
        </span>
      </div>

      {/* Vertical Step Progress */}
      <div className="flex-1">
        <div className="relative pl-4">
          {steps.map((step, index) => {
            const isCompleted = currentStep > step.id;
            const isActive = currentStep === step.id;

            return (
              <div key={step.id} className="relative mb-6 last:mb-0">
                {/* Connecting Line */}
                {index < steps.length - 1 && (
                  <div 
                    className={cn(
                      "absolute left-0 top-8 w-0.5 h-8 -translate-x-1/2 transition-all duration-500",
                      isCompleted 
                        ? 'bg-gradient-to-b from-blue-500 to-blue-400' 
                        : themeMode === 'dark' ? 'bg-white/10' : 'bg-gray-200'
                    )}
                  />
                )}

                {/* Step Item */}
                <div className="flex items-center gap-4">
                  {/* Step Circle */}
                  <motion.div 
                    initial={{ scale: 0.8 }}
                    animate={{ scale: isActive ? 1.1 : 1 }}
                    className={cn(
                      "relative z-10 flex items-center justify-center w-8 h-8 rounded-full -ml-4 transition-all duration-300",
                      isCompleted 
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/40' 
                        : isActive 
                          ? themeMode === 'dark'
                            ? 'border-2 border-blue-400 bg-slate-800 shadow-lg shadow-blue-500/20'
                            : 'border-2 border-blue-500 bg-white shadow-lg shadow-blue-500/30'
                          : themeMode === 'dark' 
                            ? 'bg-slate-800/80 border border-white/10' 
                            : 'bg-gray-100 border border-gray-200'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : isActive ? (
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        themeMode === 'dark' ? 'bg-blue-400' : 'bg-blue-500'
                      )} />
                    ) : (
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        themeMode === 'dark' ? 'bg-white/20' : 'bg-gray-300'
                      )} />
                    )}
                  </motion.div>

                  {/* Step Label */}
                  <span 
                    className={cn(
                      "text-sm font-medium transition-colors duration-300",
                      isCompleted 
                        ? themeMode === 'dark' ? 'text-blue-400' : 'text-blue-600'
                        : isActive 
                          ? themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                          : themeMode === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Theme Toggle at Bottom */}
      <div className={cn(
        "pt-6 border-t",
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
  const steps = ['Categories', 'Service', 'Details', 'Review', 'Payment'];
  
  return (
    <div className={cn(
      "lg:hidden sticky top-0 z-50 flex items-center justify-center gap-1.5 py-4 px-3 border-b transition-colors duration-300",
      themeMode === 'dark' 
        ? 'bg-slate-900/98 backdrop-blur-xl border-white/5 shadow-lg shadow-black/20' 
        : 'bg-white/98 backdrop-blur-xl border-gray-200/80 shadow-md shadow-gray-200/50'
    )}>
      {steps.map((step, index) => {
        const isCompleted = currentStep > index + 1;
        const isActive = currentStep === index + 1;
        
        return (
          <div key={index} className="flex items-center">
            <motion.div 
              animate={{ scale: isActive ? 1.1 : 1 }}
              className={cn(
                "flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-all duration-300",
                isCompleted 
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/40' 
                  : isActive 
                    ? themeMode === 'dark'
                      ? 'border-2 border-blue-400 text-blue-400 bg-slate-800/80 shadow-md shadow-blue-500/20'
                      : 'border-2 border-blue-500 text-blue-600 bg-white shadow-md shadow-blue-500/30'
                    : themeMode === 'dark'
                      ? 'bg-slate-800/60 text-gray-500 border border-white/5'
                      : 'bg-gray-100 text-gray-400 border border-gray-200/80'
              )}
            >
              {isCompleted ? <Check className="w-3.5 h-3.5" /> : index + 1}
            </motion.div>
            {index < steps.length - 1 && (
              <div className={cn(
                "w-4 sm:w-6 h-0.5 mx-1 rounded-full transition-all duration-500",
                isCompleted 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-400' 
                  : themeMode === 'dark' ? 'bg-white/10' : 'bg-gray-200'
              )} />
            )}
          </div>
        );
      })}
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
        <div className="hidden lg:block w-64 border-r border-border p-6 flex-shrink-0">
          <Skeleton className="h-10 w-32 mb-10" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 mb-6">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="h-4 w-20" />
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
        "h-screen h-[100dvh] flex flex-col lg:flex-row overflow-hidden transition-colors duration-300",
        themeMode === 'dark' 
          ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' 
          : 'bg-gradient-to-br from-gray-50 via-white to-gray-100/50'
      )}>
        {/* Desktop Vertical Step Progress Sidebar */}
        <VerticalStepProgress 
          currentStep={currentStep} 
          panelLogo={panel.logo_url}
          panelName={panel.name}
          themeMode={themeMode}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
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
                  <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold">
                    {panel.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className={cn(
                  "font-semibold",
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
                  <Sparkles className="w-5 h-5 text-blue-400" />
                </div>
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Search className="w-5 h-5 text-muted-foreground" />
                </div>
                <Input
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "h-14 pl-12 pr-12 rounded-2xl text-base",
                    themeMode === 'dark'
                      ? 'bg-slate-800/50 border-white/10'
                      : 'bg-white border-gray-200 shadow-sm'
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