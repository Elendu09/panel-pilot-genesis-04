import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Zap, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FastOrderSection } from '@/components/storefront/FastOrderSection';
import { useBuyerAuth } from '@/contexts/BuyerAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

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
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-48 mb-8" />
          <Skeleton className="h-[500px] w-full" />
        </div>
      </div>
    );
  }

  if (error || !panel) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
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

      <div className={`min-h-screen ${themeMode === 'dark' ? 'bg-slate-950' : 'bg-gray-50'}`}>
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`sticky top-0 z-50 backdrop-blur-xl border-b ${
            themeMode === 'dark' 
              ? 'bg-slate-900/80 border-white/10' 
              : 'bg-white/80 border-gray-200'
          }`}
        >
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                {panel.logo_url ? (
                  <img 
                    src={panel.logo_url} 
                    alt={panel.name} 
                    className="h-8 w-auto object-contain"
                  />
                ) : (
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: panel.primary_color || '#3b82f6' }}
                  >
                    {panel.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className={`font-semibold ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {panel.name}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              <span className={`font-medium ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Fast Order
              </span>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="pb-16">
          <FastOrderSection
            services={services}
            panelId={panel.id}
            panelName={panel.name}
            customization={{
              themeMode,
              primaryColor: panel.primary_color,
              ...customBranding,
            }}
          />
        </main>
      </div>
    </>
  );
};

// Export directly - BuyerAuthProvider is provided by TenantRouter on tenant domains
export default FastOrderContent;
