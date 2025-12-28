import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Zap, ArrowRight, Lock, Loader2, Mail, User, CheckCircle, Upload, X } from 'lucide-react';
import { SOCIAL_ICONS_MAP } from '@/components/icons/SocialIcons';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useBuyerAuth } from '@/contexts/BuyerAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Service {
  id: string;
  name: string;
  price: number;
  category: string;
  min_quantity?: number;
  max_quantity?: number;
}

interface RecentTarget {
  target_url: string;
  service_id: string | null;
  quantity: number | null;
}

interface OrderProfile {
  id: string;
  name: string;
  target_url: string;
  service_id: string | null;
  quantity: number;
}

interface FastOrderSectionProps {
  services: Service[];
  panelId: string;
  panelName: string;
  customization?: any;
}

export const FastOrderSection = ({ services, panelId, panelName, customization }: FastOrderSectionProps) => {
  const themeMode = customization?.themeMode || 'dark';
  const textColor = customization?.textColor || (themeMode === 'dark' ? '#FFFFFF' : '#1F2937');
  const textMuted = customization?.textMuted || (themeMode === 'dark' ? '#A1A1AA' : '#4B5563');
  const cardBg = themeMode === 'dark' ? 'bg-slate-900/80 border-white/10' : 'bg-white shadow-md border-gray-200';
  const inputBg = themeMode === 'dark' ? 'bg-slate-800/50 border-white/10' : 'bg-gray-50 border-gray-200';
  const navigate = useNavigate();
  const { buyer, refreshBuyer, login } = useBuyerAuth();
  
  // Order form state
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [targetUrl, setTargetUrl] = useState('');
  const [quantity, setQuantity] = useState(1000);
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderAttachment, setOrderAttachment] = useState<File | null>(null);
  
  const [recentTargets, setRecentTargets] = useState<RecentTarget[]>([]);
  const [favoriteServices, setFavoriteServices] = useState<Service[]>([]);
  const [profiles, setProfiles] = useState<OrderProfile[]>([]);
  
  // Guest signup modal state
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestPassword, setGuestPassword] = useState('');
  const [isGuestSignup, setIsGuestSignup] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);
  const [tempPassword, setTempPassword] = useState('');

  // Get top 8 popular services (sorted by price or just take first 8)
  const popularServices = services.slice(0, 8);
  const selectedService = services.find(s => s.id === selectedServiceId);
  const totalPrice = selectedService ? (selectedService.price * quantity) / 1000 : 0;

  const getCategoryIcon = (category: string) => {
    return SOCIAL_ICONS_MAP[category] || SOCIAL_ICONS_MAP.other;
  };

  useEffect(() => {
    if (!buyer?.id || !panelId) return;

    const fetchData = async () => {
      try {
        const [{ data: orders }, { data: favorites }] = await Promise.all([
          supabase
            .from('orders')
            .select('service_id, target_url, quantity, created_at')
            .eq('buyer_id', buyer.id)
            .eq('panel_id', panelId)
            .not('target_url', 'is', null)
            .order('created_at', { ascending: false })
            .limit(30),
          supabase
            .from('buyer_favorites')
            .select('service_id')
            .eq('buyer_id', buyer.id)
            .eq('panel_id', panelId),
        ]);

        if (orders) {
          const byUrl: Record<string, RecentTarget> = {};
          for (const o of orders as any[]) {
            if (!o.target_url) continue;
            if (!byUrl[o.target_url]) {
              byUrl[o.target_url] = {
                target_url: o.target_url,
                service_id: o.service_id ?? null,
                quantity: o.quantity ?? null,
              };
            }
          }
          setRecentTargets(Object.values(byUrl).slice(0, 5));
        }

        if (favorites) {
          const favIds = (favorites as any[]).map(f => f.service_id).filter(Boolean);
          const fav = services.filter(s => favIds.includes(s.id));
          setFavoriteServices(fav);
        }
      } catch (err) {
        console.error('FastOrder favorites/recent error', err);
      }
    };

    fetchData();
  }, [buyer?.id, panelId, services]);

  useEffect(() => {
    if (buyer) return;
    const key = `fast_order_recent_${panelId}`;
    const stored = localStorage.getItem(key);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        setRecentTargets(parsed.slice(0, 5));
      }
    } catch {
      // ignore
    }
  }, [buyer, panelId]);

  useEffect(() => {
    const key = `fast_order_profiles_${panelId}`;
    const stored = localStorage.getItem(key);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        setProfiles(parsed);
      }
    } catch {
      // ignore
    }
  }, [panelId]);

  const saveGuestRecent = () => {
    if (!targetUrl) return;
    const entry: RecentTarget = {
      target_url: targetUrl,
      service_id: selectedServiceId || null,
      quantity,
    };
    const key = `fast_order_recent_${panelId}`;
    try {
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      const filtered = existing.filter((e: any) => e.target_url !== targetUrl);
      const updated = [entry, ...filtered].slice(0, 5);
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {
      localStorage.setItem(key, JSON.stringify([entry]));
    }
  };

  const saveProfile = () => {
    if (!targetUrl) return;
    const name = window.prompt('Profile name');
    if (!name) return;
    const profile: OrderProfile = {
      id: `${Date.now()}`,
      name,
      target_url: targetUrl,
      service_id: selectedServiceId || null,
      quantity,
    };
    const key = `fast_order_profiles_${panelId}`;
    const updated = [profile, ...profiles].slice(0, 10);
    setProfiles(updated);
    try {
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const applyProfile = (profile: OrderProfile) => {
    setTargetUrl(profile.target_url);
    if (profile.service_id) setSelectedServiceId(profile.service_id);
    if (profile.quantity) setQuantity(profile.quantity);
  };
  const handleGuestSignup = async () => {
    if (!guestEmail) {
      toast({ title: "Email is required", variant: "destructive" });
      return;
    }

    setIsGuestSignup(true);
    try {
      const { data, error } = await supabase.functions.invoke('buyer-auth', {
        body: {
          panelId,
          action: 'guest-order',
          email: guestEmail,
          fullName: guestName,
        }
      });

      if (error) throw error;

      if (data.error) {
        if (data.needsLogin) {
          // Account exists, show login form
          setShowLoginForm(true);
          toast({
            title: "Account Found",
            description: "Please enter your password to continue",
          });
        } else {
          toast({ title: data.error, variant: "destructive" });
        }
        return;
      }

      if (data.success && data.user) {
        // Account created successfully
        setTempPassword(data.tempPassword);
        setAccountCreated(true);
        
        // Store buyer session - use consistent key format
        localStorage.setItem('buyer_session', JSON.stringify({
          buyerId: data.user.id,
          panelId,
        }));
        
        // Refresh buyer context
        await refreshBuyer();
        
        toast({
          title: "Account Created!",
          description: `Your password is: ${data.tempPassword}. Save it!`,
        });
      }
    } catch (error: any) {
      console.error('Guest signup error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive"
      });
    } finally {
      setIsGuestSignup(false);
    }
  };

  // Handle login for existing account
  const handleGuestLogin = async () => {
    if (!guestEmail || !guestPassword) {
      toast({ title: "Email and password are required", variant: "destructive" });
      return;
    }

    setIsGuestSignup(true);
    try {
      const success = await login(guestEmail, guestPassword);
      if (success) {
        setShowGuestModal(false);
        setShowLoginForm(false);
        toast({
          title: "Welcome back!",
          description: "You can now place your order",
        });
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive"
      });
    } finally {
      setIsGuestSignup(false);
    }
  };

  const handleQuickOrder = async () => {
    if (!buyer) {
      // Show guest signup modal
      setShowGuestModal(true);
      return;
    }

    // Authenticated user - redirect to services/order page with pre-filled data
    if (selectedService) {
      const params = new URLSearchParams();
      params.set('service', selectedServiceId);
      if (quantity) params.set('quantity', quantity.toString());
      if (targetUrl) params.set('url', encodeURIComponent(targetUrl));
      navigate(`/services?${params.toString()}`);
    } else {
      navigate('/services');
    }
  };

  const handleContinueToDeposit = () => {
    // Save pending order to localStorage
    if (selectedService) {
      localStorage.setItem('pending_order', JSON.stringify({
        serviceId: selectedServiceId,
        serviceName: selectedService.name,
        quantity,
        targetUrl,
        price: totalPrice,
        panelId,
      }));
      saveGuestRecent();
    }
    setShowGuestModal(false);
    navigate('/deposit');
  };

  if (services.length === 0) return null;

  return (
    <>
      <section className="py-16 md:py-24 relative overflow-hidden" id="fast-order">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Zap className="w-3 h-3 mr-1" />
              Fast Order
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: textColor }}>
              Quick Order in Seconds
            </h2>
            <p className="max-w-2xl mx-auto" style={{ color: textMuted }}>
              Select a service, enter your link, and boost your social presence instantly
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Popular Services Grid */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                {buyer && favoriteServices.length > 0 && (
                  <div className="mb-2 space-y-2">
                    <h4 className="text-sm font-semibold" style={{ color: textColor }}>My Favorites</h4>
                    <div className="flex flex-wrap gap-2">
                      {favoriteServices.map(service => (
                        <Button
                          key={service.id}
                          variant={selectedServiceId === service.id ? "default" : "outline"}
                          size="sm"
                          className="text-xs"
                          onClick={() => setSelectedServiceId(service.id)}
                        >
                          {service.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                <h3 className="text-lg font-semibold mb-4" style={{ color: textColor }}>Popular Services</h3>
              <div className="grid grid-cols-2 gap-3">
                {popularServices.map((service) => {
                  const categoryData = getCategoryIcon(service.category);
                  const CategoryIcon = categoryData.icon;
                  const isSelected = selectedServiceId === service.id;

                  return (
                    <motion.button
                      key={service.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedServiceId(service.id)}
                      className={cn(
                        "p-4 rounded-xl border text-left transition-all",
                        isSelected
                          ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                          : themeMode === 'dark' 
                            ? "border-white/10 bg-slate-800/50 hover:bg-slate-800 hover:border-primary/30"
                            : "border-gray-200 bg-white hover:bg-gray-50 hover:border-primary/30 shadow-sm"
                      )}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={cn("p-2 rounded-lg", categoryData.bgColor)}>
                          <CategoryIcon className="w-4 h-4 text-white" size={16} />
                        </div>
                        <span className="text-lg font-bold" style={{ color: textColor }}>${service.price}</span>
                      </div>
                      <p className="text-sm line-clamp-2" style={{ color: textMuted }}>
                        {service.name}
                      </p>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Order Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className={`backdrop-blur-xl border ${cardBg}`}>
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/60">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold" style={{ color: textColor }}>Place Your Order</h3>
                      <p className="text-sm" style={{ color: textMuted }}>Fast & secure delivery</p>
                    </div>
                  </div>

                  {/* Service Selector */}
                  <div className="space-y-2">
                    <Label style={{ color: textColor }}>Service</Label>
                    <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                      <SelectTrigger className={inputBg}>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name} - ${service.price}/1K
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Target URL */}
                  <div className="space-y-2">
                    <Label style={{ color: textColor }}>Link / Username</Label>
                    <Input
                      placeholder="https://instagram.com/yourprofile"
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                      className={inputBg}
                    />
                  </div>

                  {/* Quantity */}
                  <div className="space-y-2">
                    <Label style={{ color: textColor }}>Quantity</Label>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                      min={selectedService?.min_quantity || 100}
                      max={selectedService?.max_quantity || 100000}
                      className={inputBg}
                    />
                    {selectedService && (
                      <p className="text-xs" style={{ color: textMuted }}>
                        Min: {selectedService.min_quantity || 100} | Max: {(selectedService.max_quantity || 10000).toLocaleString()}
                      </p>
                    )}
                  </div>

                  {recentTargets.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <Label className="text-xs" style={{ color: textMuted }}>
                        Frequently used links {buyer ? '' : '(this device)'}
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {recentTargets.map(item => {
                          const label = (() => {
                            try {
                              const u = new URL(item.target_url);
                              return u.hostname;
                            } catch {
                              return item.target_url.length > 22
                                ? item.target_url.slice(0, 22) + '…'
                                : item.target_url;
                            }
                          })();

                          return (
                            <button
                              key={item.target_url}
                              type="button"
                              onClick={() => {
                                setTargetUrl(item.target_url);
                                if (item.service_id) setSelectedServiceId(item.service_id);
                                if (item.quantity) setQuantity(item.quantity);
                              }}
                              className="px-2 py-1 rounded-full border text-xs bg-primary/5 border-primary/30 text-primary hover:bg-primary/10 transition-colors"
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {profiles.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <Label className="text-xs" style={{ color: textMuted }}>
                        Saved profiles
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {profiles.map(profile => (
                          <button
                            key={profile.id}
                            type="button"
                            onClick={() => applyProfile(profile)}
                            className="px-2 py-1 rounded-full border text-xs bg-secondary/10 border-secondary/30 text-secondary-foreground/90 hover:bg-secondary/20 transition-colors"
                          >
                            {profile.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Attachment Upload */}
                  <div className="space-y-2">
                    <Label style={{ color: textColor }}>Attachment (Optional)</Label>
                    <div className="relative">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setOrderAttachment(e.target.files?.[0] || null)}
                        className={cn(inputBg, "file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-primary/10 file:text-primary")}
                      />
                      {orderAttachment && (
                        <div className="flex items-center gap-2 mt-2">
                          <Upload className="w-4 h-4" style={{ color: textMuted }} />
                          <span className="text-xs flex-1 truncate" style={{ color: textMuted }}>
                            {orderAttachment.name}
                          </span>
                          <button
                            onClick={() => setOrderAttachment(null)}
                            className="p-1 hover:bg-destructive/20 rounded"
                          >
                            <X className="w-3 h-3 text-destructive" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Total */}
                  <div className={`pt-4 border-t ${themeMode === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-center mb-4">
                      <span style={{ color: textMuted }}>Total</span>
                      <span className="text-2xl font-bold text-primary">${totalPrice.toFixed(2)}</span>
                    </div>

                    {buyer ? (
                      <Button
                        className="w-full gap-2"
                        size="lg"
                        onClick={handleQuickOrder}
                        disabled={!selectedService || isOrdering}
                      >
                        {isOrdering ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Zap className="w-4 h-4" />
                        )}
                        {isOrdering ? 'Processing...' : 'Place Order'}
                      </Button>
                    ) : (
                      <Button
                        className="w-full gap-2"
                        size="lg"
                        onClick={() => setShowGuestModal(true)}
                        disabled={!selectedService}
                      >
                        <Zap className="w-4 h-4" />
                        Quick Order
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Guest Signup Modal */}
      <Dialog open={showGuestModal} onOpenChange={setShowGuestModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {accountCreated ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Account Created!
                </>
              ) : showLoginForm ? (
                <>
                  <Lock className="w-5 h-5" />
                  Login to Continue
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 text-primary" />
                  Quick Checkout
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {accountCreated 
                ? "Your account has been created. Add funds to complete your order."
                : showLoginForm
                  ? "Enter your password to login"
                  : "Enter your email to create an account and place your order"
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {accountCreated ? (
              <>
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-sm font-medium mb-2">Your temporary password:</p>
                  <code className="text-lg font-bold text-green-600 bg-green-500/10 px-3 py-1 rounded">
                    {tempPassword}
                  </code>
                  <p className="text-xs text-muted-foreground mt-2">
                    Save this password! You'll need it to login next time.
                  </p>
                </div>
                <Button className="w-full" onClick={handleContinueToDeposit}>
                  Add Funds to Order
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            ) : showLoginForm ? (
              <>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="pl-10"
                      disabled
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      value={guestPassword}
                      onChange={(e) => setGuestPassword(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleGuestLogin}
                  disabled={isGuestSignup}
                >
                  {isGuestSignup ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Login & Continue
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => setShowLoginForm(false)}
                >
                  Use Different Email
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Name (Optional)</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Your name"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {selectedService && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Service:</span>
                      <span className="font-medium truncate ml-2">{selectedService.name}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-muted-foreground">Quantity:</span>
                      <span className="font-medium">{quantity.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1 pt-1 border-t">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-bold text-primary">${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full" 
                  onClick={handleGuestSignup}
                  disabled={isGuestSignup || !guestEmail}
                >
                  {isGuestSignup ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4 mr-2" />
                  )}
                  Create Account & Order
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Already have an account?{' '}
                  <button 
                    className="text-primary hover:underline"
                    onClick={() => navigate('/auth')}
                  >
                    Login here
                  </button>
                </p>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
