import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Zap, ShoppingBag, FileText, UserPlus, LogIn, Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FastOrderSection } from '@/components/storefront/FastOrderSection';
import { useBuyerAuth } from '@/contexts/BuyerAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';

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
  const [searchQuery, setSearchQuery] = useState('');

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

  const navItems = [
    { label: 'New order', icon: Zap, href: '/fast-order', active: true },
    { label: 'Blog', icon: FileText, href: '/blog', active: false },
    { label: 'Registration', icon: UserPlus, href: '/auth?mode=register', active: false },
    { label: 'Sign in', icon: LogIn, href: '/auth', active: false },
  ];

  return (
    <>
      <Helmet>
        <title>Fast Order - {panel.name}</title>
        <meta name="description" content={`Quick order process for ${panel.name}`} />
      </Helmet>

      <div className={cn(
        "min-h-screen flex",
        themeMode === 'dark' ? 'bg-slate-950' : 'bg-gray-50'
      )}>
        {/* Desktop Sidebar */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={cn(
            "hidden lg:flex flex-col w-64 min-h-screen border-r p-6",
            themeMode === 'dark' 
              ? 'bg-slate-900/80 border-white/10' 
              : 'bg-white border-gray-200'
          )}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            {panel.logo_url ? (
              <img 
                src={panel.logo_url} 
                alt={panel.name} 
                className="h-10 w-auto object-contain"
              />
            ) : (
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: panel.primary_color || '#3b82f6' }}
              >
                {panel.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className={cn(
              "font-bold text-lg",
              themeMode === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              {panel.name}
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                    item.active
                      ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                      : themeMode === 'dark'
                        ? "text-gray-400 hover:text-white hover:bg-white/5"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Theme Toggle */}
          <div className={cn(
            "pt-6 border-t",
            themeMode === 'dark' ? 'border-white/10' : 'border-gray-200'
          )}>
            <div className="flex items-center justify-between">
              <span className={cn(
                "text-sm font-medium",
                themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'
              )}>
                Theme
              </span>
              <ThemeToggle />
            </div>
          </div>
        </motion.aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Mobile Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "lg:hidden sticky top-0 z-50 backdrop-blur-xl border-b",
              themeMode === 'dark' 
                ? 'bg-slate-900/80 border-white/10' 
                : 'bg-white/80 border-gray-200'
            )}
          >
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(-1)}
                  className="shrink-0"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex items-center gap-2">
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
                  <span className={cn(
                    "font-semibold",
                    themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                  )}>
                    {panel.name}
                  </span>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </motion.header>

          {/* Main Content Area */}
          <main className="flex-1 pb-16">
            {/* Search Bar - Desktop */}
            <div className="hidden lg:block px-8 pt-8">
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
            />
          </main>
        </div>
      </div>
    </>
  );
};

// Export directly - BuyerAuthProvider is provided by TenantRouter on tenant domains
export default FastOrderContent;
