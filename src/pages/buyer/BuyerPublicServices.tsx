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

// Platform icon mapping
const platformIcons: Record<string, React.ElementType> = {
  instagram: Instagram,
  tiktok: Music,
  youtube: Youtube,
  telegram: Send,
  twitter: Twitter,
  linkedin: Linkedin,
  facebook: Facebook,
  other: Globe,
};

const platformColors: Record<string, string> = {
  instagram: "from-pink-500 to-purple-500",
  tiktok: "from-cyan-400 to-pink-500",
  youtube: "from-red-500 to-red-600",
  telegram: "from-blue-400 to-blue-600",
  twitter: "from-sky-400 to-blue-500",
  linkedin: "from-blue-600 to-blue-700",
  facebook: "from-blue-500 to-blue-600",
  other: "from-gray-500 to-gray-600",
};

const BuyerPublicServices = () => {
  const { panelId, buyer } = useBuyerAuth();
  const { formatPrice } = useCurrency();
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  // Fast Order prefill state
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [prefilledService, setPrefilledService] = useState<any>(null);
  const [prefilledQuantity, setPrefilledQuantity] = useState<number>(1000);
  const [prefilledUrl, setPrefilledUrl] = useState<string>("");

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

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(services.map((s: any) => s.category))];
    return cats.sort();
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
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Guest Mode */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t('common.back')}
                </Link>
              </Button>
              <h1 className="text-lg font-bold hidden sm:block">{t('services.title')}</h1>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSelector />
              <CurrencySelector />
              <ThemeToggle />
              <Button asChild size="sm" variant="outline">
                <Link to="/auth">
                  {t('auth.sign_in')}
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/auth?tab=signup">
                  <UserPlus className="w-4 h-4 mr-2" />
                  {t('auth.sign_up')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Promotional Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-b border-primary/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">{t('auth.sign_up')} to Start Ordering!</p>
                <p className="text-xs text-muted-foreground">Get access to all services with instant delivery</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" />
                Instant Delivery
              </span>
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-green-500" />
                Secure Payment
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-blue-500" />
                24/7 Support
              </span>
            </div>
          </div>
        </div>
      </div>

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

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="rounded-full"
            >
              <Filter className="w-4 h-4 mr-1" />
              {t('common.all')}
            </Button>
            {categories.map(category => {
              const Icon = platformIcons[category] || Globe;
              return (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="rounded-full capitalize"
                >
                  <Icon className="w-4 h-4 mr-1" />
                  {category}
                </Button>
              );
            })}
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
              const Icon = platformIcons[category] || Globe;
              const gradient = platformColors[category] || platformColors.other;
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
                        "w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0",
                        gradient
                      )}>
                        <Icon className="w-5 h-5 text-white" />
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
  );
};

export default BuyerPublicServices;
