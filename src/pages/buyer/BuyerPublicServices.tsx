import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, ArrowLeft, Instagram, Music, Youtube, Send, Twitter, 
  Linkedin, Facebook, Globe, Zap, Star, ShoppingCart, Filter, CheckCircle,
  ChevronDown, ChevronRight, UserPlus, Lock, Sparkles, Shield, Clock
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useBuyerAuth } from "@/contexts/BuyerAuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";
import { LanguageSelector } from "@/components/buyer/LanguageSelector";
import { CurrencySelector } from "@/components/buyer/CurrencySelector";
import { BuyerThemeWrapper } from "@/components/buyer-themes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { SOCIAL_ICONS_MAP } from "@/components/icons/SocialIcons";

const BuyerPublicServices = () => {
  const { panelId, buyer } = useBuyerAuth();
  const { formatPrice } = useCurrency();
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);
  
  // Fast Order prefill state
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [prefilledService, setPrefilledService] = useState<any>(null);
  const [prefilledQuantity, setPrefilledQuantity] = useState<number>(1000);
  const [prefilledUrl, setPrefilledUrl] = useState<string>("");

  // Mount guard for hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch services for this panel
  const { data: services = [], isLoading } = useQuery({
    queryKey: ['public-services', panelId],
    queryFn: async () => {
      if (!panelId) return [];
      
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('panel_id', panelId)
        .eq('is_active', true)
        .order('category')
        .order('display_order');

      if (error) throw error;
      return data || [];
    },
    enabled: !!panelId,
  });

  // Auto-expand all categories on load
  useEffect(() => {
    if (services.length > 0) {
      const cats = [...new Set(services.map((s: any) => s.category))];
      setExpandedCategories(new Set(cats.slice(0, 3))); // Expand first 3
    }
  }, [services]);

  // Handle Fast Order URL parameters
  useEffect(() => {
    if (services.length === 0) return;
    
    const serviceId = searchParams.get('service');
    const quantityParam = searchParams.get('quantity');
    const urlParam = searchParams.get('url');
    
    if (serviceId) {
      const service = services.find((s: any) => s.id === serviceId);
      if (service) {
        setPrefilledService(service);
        if (quantityParam) setPrefilledQuantity(parseInt(quantityParam) || 1000);
        if (urlParam) setPrefilledUrl(decodeURIComponent(urlParam));
        setShowOrderModal(true);
        
        setSearchParams({});
        
        toast({
          title: t('cart.order_placed') || "Order Pre-filled",
          description: `${service.name} selected from Fast Order`,
        });
      }
    }
  }, [services, searchParams, setSearchParams, t]);

  // Get unique categories with counts and icons from SOCIAL_ICONS_MAP
  const categories = useMemo(() => {
    const cats = [...new Set(services.map((s: any) => s.category).filter(Boolean))];
    return cats.sort().map(cat => ({
      id: cat,
      name: cat,
      count: services.filter((s: any) => s.category === cat).length,
      ...SOCIAL_ICONS_MAP[cat.toLowerCase()] || SOCIAL_ICONS_MAP.other
    }));
  }, [services]);

  // Filter services
  const filteredServices = useMemo(() => {
    return services.filter((service: any) => {
      const matchesSearch = !searchQuery || 
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || service.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [services, searchQuery, selectedCategory]);

  // Group by category
  const groupedServices = useMemo(() => {
    const groups: Record<string, typeof services> = {};
    filteredServices.forEach((service: any) => {
      if (!groups[service.category]) {
        groups[service.category] = [];
      }
      groups[service.category].push(service);
    });
    return groups;
  }, [filteredServices]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  // If buyer is logged in, redirect to dashboard
  if (buyer) {
    return (
      <BuyerThemeWrapper panelId={panelId}>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold mb-2">{t('dashboard.welcome')}</h2>
              <p className="text-muted-foreground mb-4">
                You're already logged in. Go to your dashboard to place orders.
              </p>
              <Button asChild className="w-full">
                <Link to="/dashboard">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {t('nav.dashboard')}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </BuyerThemeWrapper>
    );
  }

  return (
    <BuyerThemeWrapper panelId={panelId}>
      <div className="min-h-screen bg-background">
      {/* Header - Guest Mode - Responsive */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9" asChild>
                <Link to="/">
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </Button>
              <h1 className="text-base sm:text-lg font-bold truncate">{t('services.title')}</h1>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <div className="hidden sm:flex items-center gap-1">
                <LanguageSelector />
                <CurrencySelector />
              </div>
              <ThemeToggle />
              <Button asChild size="sm" variant="outline" className="hidden sm:inline-flex">
                <Link to="/auth">
                  {t('auth.sign_in')}
                </Link>
              </Button>
              <Button asChild size="sm" className="text-xs sm:text-sm">
                <Link to="/auth?tab=signup">
                  <UserPlus className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">{t('auth.sign_up')}</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Promotional Banner - Only show after mount to prevent hydration flash */}
      {mounted && (
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-r from-primary/20 via-primary/10 to-amber-500/20 border-b border-primary/30"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute -right-20 -top-20 w-60 h-60 bg-primary/5 rounded-full blur-3xl"
          />
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-10 -bottom-10 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl"
          />
        </div>
        
        <div className="container mx-auto px-4 py-5 relative">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.div 
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/30"
              >
                <Sparkles className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                  🎉 Get 10% OFF Your First Order!
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Sign up now and start growing your social presence today
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 bg-background/50 px-2 py-1 rounded-full">
                  <Zap className="w-3 h-3 text-amber-500" />
                  Instant
                </span>
                <span className="flex items-center gap-1 bg-background/50 px-2 py-1 rounded-full">
                  <Shield className="w-3 h-3 text-green-500" />
                  Secure
                </span>
                <span className="flex items-center gap-1 bg-background/50 px-2 py-1 rounded-full">
                  <Clock className="w-3 h-3 text-blue-500" />
                  24/7
                </span>
              </div>
              <Button asChild size="sm" className="w-full sm:w-auto shadow-lg shadow-primary/20">
                <Link to="/auth?tab=signup">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Sign Up Free
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Urgency indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground"
          >
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-amber-500"
              />
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                ⏰ Limited time offer - Don't miss out!
              </span>
            </div>
          </motion.div>
        </div>
      </motion.div>
      )}

      <main className="container mx-auto px-4 py-6">
        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder={t('orders.search_placeholder') || "Search services..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-muted/50"
            />
          </div>

          {/* Category Filter Pills - Horizontal Scroll with Icons */}
          <div className="-mx-4 px-4 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 pb-2 min-w-max">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="rounded-full shrink-0"
              >
                <Filter className="w-4 h-4 mr-1" />
                {t('common.all')}
                <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0">
                  {services.length}
                </Badge>
              </Button>
              {categories.map(category => {
                const CategoryIcon = category.icon || Globe;
                const isActive = selectedCategory === category.id;
                return (
                  <Button
                    key={category.id}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className={cn(
                      "rounded-full capitalize shrink-0 gap-1.5",
                      isActive && "shadow-lg"
                    )}
                  >
                    <div className={cn(
                      "p-1 rounded-md",
                      isActive ? "bg-white/20" : category.bgColor || "bg-gray-500"
                    )}>
                      <CategoryIcon className={cn("w-3 h-3", isActive ? "text-current" : "text-white")} />
                    </div>
                    {category.name}
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "text-[10px] px-1.5 py-0",
                        isActive && "bg-white/20 text-current"
                      )}
                    >
                      {category.count}
                    </Badge>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Services List View for Guests */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Globe className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">{t('orders.no_orders') || "No services found"}</h3>
              <p className="text-muted-foreground text-sm">
                {searchQuery ? "Try adjusting your search query" : "No services available at the moment"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedServices).map(([category, categoryServices]) => {
              const categoryData = SOCIAL_ICONS_MAP[category.toLowerCase()] || SOCIAL_ICONS_MAP.other;
              const CategoryIcon = categoryData.icon;
              const isExpanded = expandedCategories.has(category);
              
              return (
                <Collapsible 
                  key={category} 
                  open={isExpanded}
                  onOpenChange={() => toggleCategory(category)}
                >
                  {/* Category Header */}
                  <CollapsibleTrigger asChild>
                    <motion.div 
                      className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/30 cursor-pointer transition-all"
                      whileHover={{ scale: 1.005 }}
                      whileTap={{ scale: 0.995 }}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                        categoryData.bgColor || "bg-gray-500"
                      )}>
                        <CategoryIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="font-semibold capitalize">{category}</h2>
                        <p className="text-xs text-muted-foreground">
                          {categoryServices.length} {t('services.title')?.toLowerCase() || 'services'}
                        </p>
                      </div>
                      <Badge variant="secondary" className="shrink-0">
                        {categoryServices.length}
                      </Badge>
                      <ChevronDown className={cn(
                        "w-5 h-5 text-muted-foreground transition-transform",
                        isExpanded && "rotate-180"
                      )} />
                    </motion.div>
                  </CollapsibleTrigger>

                  {/* Services List */}
                  <CollapsibleContent>
                    <AnimatePresence>
                      <div className="mt-2 space-y-1.5 pl-4 border-l-2 border-muted ml-5">
                        {categoryServices.map((service: any, index: number) => (
                          <motion.div
                            key={service.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
                          >
                            {/* Service Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
                                {service.name}
                              </p>
                              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Zap className="w-3 h-3" />
                                  {service.estimated_time || 'Instant'}
                                </span>
                                <span>
                                  {service.min_quantity?.toLocaleString()}-{service.max_quantity?.toLocaleString()}
                                </span>
                              </div>
                            </div>

                            {/* Price */}
                            <Badge variant="secondary" className="shrink-0 font-mono">
                              {formatPrice(service.price)}/1K
                            </Badge>

                            {/* Sign Up CTA */}
                            <Button size="sm" variant="outline" asChild className="shrink-0 gap-1.5">
                              <Link to="/auth?tab=signup">
                                <Lock className="w-3 h-3" />
                                <span className="hidden sm:inline">{t('auth.sign_up')}</span>
                                <ChevronRight className="w-3 h-3 sm:hidden" />
                              </Link>
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    </AnimatePresence>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        )}

        {/* Bottom CTA for Guests */}
        <motion.div 
          className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/20 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-xl font-bold mb-2">Ready to Get Started?</h3>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            Create a free account to access all services, track your orders, and get instant delivery.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link to="/auth?tab=signup">
                <UserPlus className="w-4 h-4 mr-2" />
                Create Free Account
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/auth">
                {t('auth.sign_in')}
              </Link>
            </Button>
          </div>
        </motion.div>
      </main>

      {/* Fast Order Pre-fill Modal */}
      <Dialog open={showOrderModal} onOpenChange={setShowOrderModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Complete Your Order
            </DialogTitle>
            <DialogDescription>
              Your order has been pre-filled from Fast Order
            </DialogDescription>
          </DialogHeader>
          
          {prefilledService && (
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span className="font-medium">{prefilledService.name}</span>
                </div>
                <p className="text-sm text-muted-foreground">${prefilledService.price}/1K</p>
              </div>
              
              <div className="space-y-2">
                <Label>{t('common.quantity')}</Label>
                <Input
                  type="number"
                  value={prefilledQuantity}
                  onChange={(e) => setPrefilledQuantity(parseInt(e.target.value) || 1000)}
                  min={prefilledService.min_quantity || 100}
                  max={prefilledService.max_quantity || 100000}
                />
              </div>
              
              <div className="space-y-2">
                <Label>{t('orders.target_url')}</Label>
                <Input
                  placeholder="https://..."
                  value={prefilledUrl}
                  onChange={(e) => setPrefilledUrl(e.target.value)}
                />
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-muted-foreground">{t('common.total')}</span>
                <span className="text-xl font-bold text-primary">
                  ${((prefilledService.price * prefilledQuantity) / 1000).toFixed(2)}
                </span>
              </div>
              
              <Button className="w-full" asChild>
                <Link to="/auth?tab=signup">
                  <UserPlus className="w-4 h-4 mr-2" />
                  {t('auth.sign_up')} to Order
                </Link>
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </BuyerThemeWrapper>
  );
};

export default BuyerPublicServices;
