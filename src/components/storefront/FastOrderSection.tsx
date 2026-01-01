import { useState, useEffect, useContext } from 'react';
import { useTheme } from '@/hooks/use-theme';
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
import { 
  Zap, ArrowRight, ArrowLeft, Lock, Loader2, Mail, User, CheckCircle, Check, 
  ChevronRight, Instagram, Youtube, Send, Twitter, Facebook, Linkedin, 
  Music2, Globe, Copy, AlertTriangle, Eye, EyeOff, CreditCard, Wallet,
  DollarSign, Sparkles, Star
} from 'lucide-react';
import { SOCIAL_ICONS_MAP, TikTokIcon } from '@/components/icons/SocialIcons';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { BuyerAuthContext } from '@/contexts/BuyerAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { LiveOrderTracker } from '@/components/order/LiveOrderTracker';
import { Confetti } from '@/components/effects/Confetti';

interface Service {
  id: string;
  name: string;
  price: number;
  category: string;
  min_quantity?: number;
  max_quantity?: number;
}

interface FastOrderSectionProps {
  services: Service[];
  panelId: string;
  panelName: string;
  customization?: any;
  onStepChange?: (step: number) => void;
}

// Payment methods
const paymentMethods = [
  { id: 'stripe', name: 'Credit Card', icon: CreditCard, color: 'bg-gradient-to-br from-blue-500 to-blue-600' },
  { id: 'paypal', name: 'PayPal', icon: Wallet, color: 'bg-gradient-to-br from-blue-600 to-indigo-600' },
  { id: 'crypto', name: 'Crypto', icon: DollarSign, color: 'bg-gradient-to-br from-orange-500 to-amber-500' },
];

export const FastOrderSection = ({ services, panelId, panelName, customization, onStepChange }: FastOrderSectionProps) => {
  // Safely access buyer auth context (may not be available in preview mode)
  const buyerAuthContext = useContext(BuyerAuthContext);
  const buyer = buyerAuthContext?.buyer ?? null;
  const refreshBuyer = buyerAuthContext?.refreshBuyer ?? (async () => {});
  const login = buyerAuthContext?.login ?? (async () => false);
  
  const navigate = useNavigate();
  
  // Use actual theme from context instead of customization
  const { theme } = useTheme();
  const themeMode = theme === 'system' 
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;
  
  const textColor = customization?.textColor || (themeMode === 'dark' ? '#FFFFFF' : '#111827');
  const textMuted = customization?.textMuted || (themeMode === 'dark' ? '#9CA3AF' : '#6B7280');
  
  // True dark/light mode card styles
  const cardBg = themeMode === 'dark' 
    ? 'bg-gray-900/80 backdrop-blur-xl border-gray-800 shadow-2xl shadow-black/30' 
    : 'bg-white backdrop-blur-xl shadow-xl shadow-gray-200/60 border-gray-200';
  const inputBg = themeMode === 'dark' 
    ? 'bg-gray-800 border-gray-700 focus:border-blue-500/50 focus:ring-blue-500/20' 
    : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 shadow-sm';
  
  // Blue glow button style for light mode
  const glowButtonClass = themeMode === 'dark'
    ? 'bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/30'
    : 'bg-blue-500 hover:bg-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_28px_rgba(59,130,246,0.5)]';
  
  // Step state (1-6: Categories, Service, Order, Review, Payment, Tracking)
  const [currentStep, setCurrentStepInternal] = useState(1);
  
  // Wrapper to notify parent of step changes
  const setCurrentStep = (step: number) => {
    setCurrentStepInternal(step);
    onStepChange?.(step);
  };
  
  // Order form state
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [targetUrl, setTargetUrl] = useState('');
  const [quantity, setQuantity] = useState(1000);
  const [isOrdering, setIsOrdering] = useState(false);
  
  // Payment state
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('stripe');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  // Order tracking state
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [placedOrderNumber, setPlacedOrderNumber] = useState<string | null>(null);
  
  // Guest signup modal state
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestPassword, setGuestPassword] = useState('');
  const [isGuestSignup, setIsGuestSignup] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  const [autoUsername, setAutoUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [modalStep, setModalStep] = useState<'email' | 'credentials' | 'login'>('email');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Get unique categories from services (filter out empty/null categories)
  const categories = [...new Set(services.map(s => s.category).filter(Boolean))];
  
  // Get services for selected category
  const categoryServices = selectedCategory 
    ? services.filter(s => s.category === selectedCategory)
    : [];
  
  const selectedService = services.find(s => s.id === selectedServiceId);
  const totalPrice = selectedService ? (selectedService.price * quantity) / 1000 : 0;

  const getCategoryIcon = (category: string) => {
    return SOCIAL_ICONS_MAP[category.toLowerCase()] || SOCIAL_ICONS_MAP.other;
  };

  // Quantity presets
  const quantityPresets = [100, 500, 1000, 5000, 10000];

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSelectedServiceId('');
    setCurrentStep(2);
  };

  // Handle service selection
  const handleServiceSelect = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    const service = services.find(s => s.id === serviceId);
    if (service?.min_quantity) {
      setQuantity(service.min_quantity);
    }
    setCurrentStep(3);
  };

  // Handle details confirmed
  const handleDetailsConfirmed = () => {
    if (!targetUrl.trim()) {
      toast({ title: "Please enter a link", variant: "destructive" });
      return;
    }
    setCurrentStep(4);
  };

  // Generate username for guest signup
  const generateUsername = () => {
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `user_${randomStr}`;
  };

  // Copy to clipboard helper
  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
      toast({ title: "Copied!", description: `${field} copied to clipboard` });
    } catch (err) {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  // Generate order number
  const generateOrderNumber = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  };

  const handleGuestSignup = async () => {
    if (!guestEmail) {
      toast({ title: "Email is required", variant: "destructive" });
      return;
    }

    setIsGuestSignup(true);
    
    // Generate auto username
    const generatedUsername = generateUsername();
    setAutoUsername(generatedUsername);
    
    try {
      const { data, error } = await supabase.functions.invoke('buyer-auth', {
        body: {
          panelId,
          action: 'guest-order',
          email: guestEmail,
          fullName: guestName,
          username: generatedUsername,
        }
      });

      if (error) throw error;

      if (data.error) {
        if (data.needsLogin) {
          setModalStep('login');
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
        setTempPassword(data.tempPassword);
        setAutoUsername(data.username || generatedUsername);
        setAccountCreated(true);
        setModalStep('credentials');
        
        localStorage.setItem('buyer_session', JSON.stringify({
          buyerId: data.user.id,
          panelId,
        }));
        
        await refreshBuyer();
        
        toast({
          title: "Account Created!",
          description: "Save your credentials below.",
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
        setModalStep('email');
        toast({
          title: "Welcome back!",
          description: "Continue to payment",
        });
        // Go to payment step after login
        setCurrentStep(5);
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

  // Continue to payment step after account creation
  const handleContinueToPayment = () => {
    setShowGuestModal(false);
    setAccountCreated(false);
    setModalStep('email');
    setCurrentStep(5);
  };

  // Reset modal state when closed
  const handleModalClose = (open: boolean) => {
    if (!open) {
      setAccountCreated(false);
      setShowLoginForm(false);
      setModalStep('email');
      setGuestEmail('');
      setGuestName('');
      setGuestPassword('');
      setTempPassword('');
      setAutoUsername('');
      setCopiedField(null);
    }
    setShowGuestModal(open);
  };

  const handlePlaceOrder = async () => {
    if (!buyer) {
      setShowGuestModal(true);
      return;
    }
    // Authenticated user - go to payment step
    setCurrentStep(5);
  };

  // Process payment and create order
  const handleProcessPayment = async () => {
    if (!buyer || !selectedService) {
      toast({ title: "Error", description: "Please complete previous steps", variant: "destructive" });
      return;
    }

    setIsProcessingPayment(true);

    try {
      const orderNumber = generateOrderNumber();

      // Create pending transaction
      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id: buyer.id,
          amount: totalPrice,
          type: 'payment',
          payment_method: selectedPaymentMethod,
          status: 'pending',
          description: `Fast Order - ${selectedService.name}`,
        })
        .select()
        .single();

      if (txError) throw txError;

      // Simulate payment processing (replace with real payment gateway)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update transaction to completed
      await supabase
        .from('transactions')
        .update({ status: 'completed' })
        .eq('id', transaction.id);

      // Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          buyer_id: buyer.id,
          panel_id: panelId,
          service_id: selectedServiceId,
          order_number: orderNumber,
          quantity: quantity,
          price: totalPrice,
          target_url: targetUrl,
          status: 'pending',
          notes: `Fast Order via ${panelName}`,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Update buyer balance (deduct the amount)
      const newBalance = Math.max(0, (buyer.balance || 0) - totalPrice);
      await supabase
        .from('client_users')
        .update({ 
          balance: newBalance,
          total_spent: (buyer.total_spent || 0) + totalPrice 
        })
        .eq('id', buyer.id);

      await refreshBuyer();

      // Store order info for tracking
      setPlacedOrderId(order.id);
      setPlacedOrderNumber(orderNumber);

      toast({
        title: "Order Placed Successfully!",
        description: `Order #${orderNumber} is now being processed.`,
      });

      // Copy order number to clipboard for easy tracking
      try {
        await navigator.clipboard.writeText(orderNumber);
      } catch {}

      // Go to tracking step instead of redirecting
      setCurrentStep(6);

    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment",
        variant: "destructive"
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Back navigation
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Get category data for display
  const selectedCategoryData = selectedCategory ? getCategoryIcon(selectedCategory) : null;

  // Show empty state if no services available
  if (services.length === 0 || categories.length === 0) {
    return (
      <section className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="max-w-md mx-auto">
            <div className={cn("p-8 rounded-3xl border", cardBg)}>
              <div className={cn(
                "w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center",
                themeMode === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
              )}>
                <Zap className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2 tracking-tight" style={{ color: textColor }}>
                No Services Available Yet
              </h3>
              <p className="mb-6 text-sm" style={{ color: textMuted }}>
                This panel hasn't added any services yet. Please check back later.
              </p>
              <Button 
                onClick={() => navigate('/')}
                variant="outline"
                className="w-full"
              >
                Back to Storefront
              </Button>
            </div>
          </div>
        </motion.div>
      </section>
    );
  }

  return (
    <>
      <section className="flex-1 p-4 lg:p-8" id="fast-order">
        <div className="max-w-3xl mx-auto h-full">
          <Card className={cn("border rounded-3xl overflow-hidden", cardBg)}>
            <CardContent className="p-4 md:p-6 lg:p-8">
              {/* Back Button - Visible after step 1, hidden on step 6 (tracking) */}
              {currentStep > 1 && currentStep < 6 && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mb-4"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBack}
                    className={cn(
                      "gap-2 transition-colors",
                      themeMode === 'dark' 
                        ? 'text-gray-400 hover:text-white hover:bg-white/5' 
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                    )}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {currentStep === 2 && 'Back to Categories'}
                    {currentStep === 3 && 'Back to Services'}
                    {currentStep === 4 && 'Back to Order'}
                    {currentStep === 5 && 'Back to Review'}
                  </Button>
                </motion.div>
              )}

              <AnimatePresence mode="wait">
                {/* Step 1: Select Category */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    <div className="text-center">
                      <Badge className={cn(
                        "mb-3 font-semibold",
                        themeMode === 'dark' 
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                          : 'bg-blue-50 text-blue-600 border-blue-200'
                      )}>
                        Step 1 of 6
                      </Badge>
                      <h3 className="text-2xl font-bold mb-2 tracking-tight" style={{ color: textColor }}>
                        Select a Platform
                      </h3>
                      <p className="text-sm" style={{ color: textMuted }}>
                        Choose the platform you want to boost
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {categories.map((category, index) => {
                        const categoryData = getCategoryIcon(category);
                        const CategoryIcon = categoryData.icon;
                        const serviceCount = services.filter(s => s.category === category).length;
                        
                        return (
                          <motion.button
                            key={category}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.03, y: -4 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleCategorySelect(category)}
                            className={cn(
                              "relative flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all duration-300 group overflow-hidden",
                              themeMode === 'dark'
                                ? "border-gray-700 bg-gray-800/60 hover:bg-gray-800 hover:border-blue-500/50"
                                : "border-gray-200 bg-white hover:bg-blue-50/50 hover:border-blue-400 shadow-sm hover:shadow-lg hover:shadow-blue-500/10"
                            )}
                          >
                            {/* Glow effect on hover */}
                            <div className={cn(
                              "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                              categoryData.bgColor,
                              "blur-2xl"
                            )} style={{ opacity: 0.1 }} />
                            
                            <div className={cn(
                              "relative p-3.5 rounded-xl shadow-lg transition-transform group-hover:scale-110",
                              categoryData.bgColor
                            )}>
                              <CategoryIcon className="w-6 h-6 text-white" size={24} />
                            </div>
                            <div className="text-center relative">
                              <span className="text-sm font-semibold capitalize block tracking-tight" style={{ color: textColor }}>
                                {category}
                              </span>
                              <span className="text-xs" style={{ color: textMuted }}>
                                {serviceCount} service{serviceCount !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Select Service */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    <div className="text-center">
                      <Badge className={cn(
                        "mb-3 font-semibold",
                        themeMode === 'dark' 
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                          : 'bg-blue-50 text-blue-600 border-blue-200'
                      )}>
                        Step 2 of 6
                      </Badge>
                      
                      {/* Category Icon Display */}
                      {selectedCategoryData && (
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <div className={cn("p-2 rounded-lg", selectedCategoryData.bgColor)}>
                            <selectedCategoryData.icon className="w-5 h-5 text-white" size={20} />
                          </div>
                          <span className="capitalize font-semibold text-blue-500">{selectedCategory}</span>
                        </div>
                      )}
                      
                      <h3 className="text-2xl font-bold mb-2 tracking-tight" style={{ color: textColor }}>
                        Choose a Service
                      </h3>
                      <p className="text-sm" style={{ color: textMuted }}>
                        {categoryServices.length} services available
                      </p>
                    </div>
                    
                    <Select value={selectedServiceId} onValueChange={handleServiceSelect}>
                      <SelectTrigger className={cn("h-14 text-left rounded-xl", inputBg)}>
                        <SelectValue placeholder="Select a service..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-80">
                        {categoryServices.map((service) => (
                          <SelectItem key={service.id} value={service.id} className="py-3">
                            <div className="flex flex-col">
                              <span className="font-medium">{service.name}</span>
                              <span className="text-xs text-muted-foreground">
                                ${service.price.toFixed(4)}/1K • Min: {service.min_quantity || 100}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {/* Quick service buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {categoryServices.slice(0, 4).map((service, index) => (
                        <motion.button
                          key={service.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleServiceSelect(service.id)}
                          className={cn(
                            "p-4 rounded-xl border text-left transition-all",
                            selectedServiceId === service.id
                              ? themeMode === 'dark'
                                ? "border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/30"
                                : "border-blue-500 bg-blue-50 ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/10"
                              : themeMode === 'dark'
                                ? "border-gray-700 bg-gray-800/60 hover:border-blue-500/40"
                                : "border-gray-200 bg-white hover:border-blue-400 hover:shadow-md"
                          )}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xl font-bold tabular-nums text-blue-500">
                              ${service.price.toFixed(4)}
                            </span>
                            {selectedServiceId === service.id && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center"
                              >
                                <Check className="w-3 h-3 text-white" />
                              </motion.div>
                            )}
                          </div>
                          <p className="text-sm line-clamp-2" style={{ color: textMuted }}>
                            {service.name}
                          </p>
                          <p className="text-xs mt-1" style={{ color: textMuted }}>
                            Min: {service.min_quantity || 100}
                          </p>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Enter Order Details */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    <div className="text-center">
                      <Badge className={cn(
                        "mb-3 font-semibold",
                        themeMode === 'dark' 
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                          : 'bg-blue-50 text-blue-600 border-blue-200'
                      )}>
                        Step 3 of 6
                      </Badge>
                      
                      {/* Category Icon Display */}
                      {selectedCategoryData && (
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <div className={cn("p-2 rounded-lg", selectedCategoryData.bgColor)}>
                            <selectedCategoryData.icon className="w-5 h-5 text-white" size={20} />
                          </div>
                        </div>
                      )}
                      
                      <h3 className="text-2xl font-bold mb-2 tracking-tight" style={{ color: textColor }}>
                        Order Details
                      </h3>
                      <p className="text-sm truncate max-w-xs mx-auto" style={{ color: textMuted }}>
                        {selectedService?.name}
                      </p>
                    </div>
                    
                    {/* Target URL */}
                    <div className="space-y-2">
                      <Label className="font-semibold" style={{ color: textColor }}>Link / Username *</Label>
                      <Input
                        placeholder="https://instagram.com/yourprofile"
                        value={targetUrl}
                        onChange={(e) => setTargetUrl(e.target.value)}
                        className={cn("h-12 rounded-xl", inputBg)}
                      />
                    </div>

                    {/* Quantity */}
                    <div className="space-y-2">
                      <Label className="font-semibold" style={{ color: textColor }}>Quantity</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {quantityPresets.map((preset) => (
                          <Button
                            key={preset}
                            type="button"
                            variant={quantity === preset ? "default" : "outline"}
                            size="sm"
                            onClick={() => setQuantity(preset)}
                            className={cn(
                              "min-w-[60px] rounded-lg font-semibold tabular-nums",
                              quantity === preset && "bg-blue-500 hover:bg-blue-600"
                            )}
                          >
                            {preset >= 1000 ? `${preset / 1000}K` : preset}
                          </Button>
                        ))}
                      </div>
                      <Input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                        min={selectedService?.min_quantity || 100}
                        max={selectedService?.max_quantity || 100000}
                        className={cn("rounded-xl tabular-nums", inputBg)}
                      />
                      {selectedService && (
                        <p className="text-xs" style={{ color: textMuted }}>
                          Min: {selectedService.min_quantity || 100} | Max: {(selectedService.max_quantity || 10000).toLocaleString()}
                        </p>
                      )}
                    </div>

                    {/* Price Preview */}
                    <div className={cn(
                      "p-5 rounded-2xl border",
                      themeMode === 'dark' 
                        ? "bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20" 
                        : "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg shadow-blue-500/10"
                    )}>
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: textMuted }}>
                            Estimated Total
                          </span>
                          <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-3xl font-bold tabular-nums text-blue-500">
                              ${totalPrice.toFixed(2)}
                            </span>
                            <span className="text-sm" style={{ color: textMuted }}>USD</span>
                          </div>
                        </div>
                        <Sparkles className={cn(
                          "w-8 h-8",
                          themeMode === 'dark' ? 'text-blue-400' : 'text-blue-500'
                        )} />
                      </div>
                    </div>

                    <Button
                      className={cn(
                        "w-full h-12 gap-2 rounded-xl font-semibold text-base text-white transition-all",
                        glowButtonClass
                      )}
                      onClick={handleDetailsConfirmed}
                      disabled={!targetUrl.trim()}
                    >
                      Continue to Review
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </motion.div>
                )}

                {/* Step 4: Review Order */}
                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    <div className="text-center">
                      <Badge className={cn(
                        "mb-3 font-semibold",
                        themeMode === 'dark' 
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                          : 'bg-blue-50 text-blue-600 border-blue-200'
                      )}>
                        Step 4 of 6
                      </Badge>
                      <h3 className="text-2xl font-bold mb-2 tracking-tight" style={{ color: textColor }}>
                        Review Your Order
                      </h3>
                      <p className="text-sm" style={{ color: textMuted }}>
                        Confirm your order details
                      </p>
                    </div>
                    
                    {/* Order Summary */}
                    <div className={cn(
                      "p-5 rounded-2xl border space-y-4",
                      themeMode === 'dark' 
                        ? "bg-gray-800/60 border-gray-700" 
                        : "bg-gray-50 border-gray-200 shadow-sm"
                    )}>
                      {/* Category & Service with Icon */}
                      <div className="flex items-start gap-3">
                        {selectedCategoryData && (
                          <div className={cn("p-2.5 rounded-xl shrink-0", selectedCategoryData.bgColor)}>
                            <selectedCategoryData.icon className="w-5 h-5 text-white" size={20} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: textMuted }}>
                            Service
                          </span>
                          <p className="font-semibold truncate" style={{ color: textColor }}>
                            {selectedService?.name}
                          </p>
                          <p className="text-sm capitalize" style={{ color: textMuted }}>
                            {selectedCategory}
                          </p>
                        </div>
                      </div>
                      
                      <div className={cn(
                        "h-px",
                        themeMode === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                      )} />
                      
                      <div className="flex justify-between items-start">
                        <span style={{ color: textMuted }}>Link</span>
                        <span className="text-right font-medium max-w-[200px] truncate text-blue-500">
                          {targetUrl}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: textMuted }}>Quantity</span>
                        <span className="font-semibold tabular-nums" style={{ color: textColor }}>
                          {quantity.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: textMuted }}>Price per 1K</span>
                        <span className="font-medium tabular-nums" style={{ color: textColor }}>
                          ${selectedService?.price.toFixed(4)}
                        </span>
                      </div>
                      
                      <div className={cn(
                        "pt-4 border-t border-dashed flex justify-between items-center",
                        themeMode === 'dark' ? 'border-gray-600' : 'border-gray-300'
                      )}>
                        <span className="font-semibold" style={{ color: textColor }}>Total</span>
                        <span className="text-3xl font-bold tabular-nums text-blue-500">${totalPrice.toFixed(2)}</span>
                      </div>
                    </div>

                    <Button
                      className={cn(
                        "w-full h-12 gap-2 rounded-xl font-semibold text-base text-white transition-all",
                        glowButtonClass
                      )}
                      size="lg"
                      onClick={handlePlaceOrder}
                      disabled={isOrdering}
                    >
                      {isOrdering ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : buyer ? (
                        <>
                          Continue to Payment
                          <ArrowRight className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          Checkout
                        </>
                      )}
                    </Button>
                    
                    {!buyer && (
                      <p className="text-xs text-center" style={{ color: textMuted }}>
                        Quick signup - no password required to get started
                      </p>
                    )}
                  </motion.div>
                )}

                {/* Step 5: Payment */}
                {currentStep === 5 && (
                  <motion.div
                    key="step5"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    <div className="text-center">
                      <Badge className={cn(
                        "mb-3 font-semibold",
                        themeMode === 'dark' 
                          ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                          : 'bg-green-50 text-green-600 border-green-200'
                      )}>
                        Step 5 of 6
                      </Badge>
                      <h3 className="text-2xl font-bold mb-2 tracking-tight" style={{ color: textColor }}>
                        Complete Payment
                      </h3>
                      <p className="text-sm" style={{ color: textMuted }}>
                        Select a payment method to complete your order
                      </p>
                    </div>

                    {/* Order Total */}
                    <div className={cn(
                      "p-5 rounded-2xl border text-center",
                      themeMode === 'dark' 
                        ? "bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20" 
                        : "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg shadow-green-500/10"
                    )}>
                      <p className="text-xs uppercase tracking-wider font-semibold mb-1" style={{ color: textMuted }}>
                        Order Total
                      </p>
                      <p className="text-4xl font-bold tabular-nums text-green-500">${totalPrice.toFixed(2)}</p>
                      <div className="flex items-center justify-center gap-2 mt-3">
                        {selectedCategoryData && (
                          <div className={cn("p-1.5 rounded-lg", selectedCategoryData.bgColor)}>
                            <selectedCategoryData.icon className="w-4 h-4 text-white" size={16} />
                          </div>
                        )}
                        <p className="text-xs" style={{ color: textMuted }}>
                          {selectedService?.name} • {quantity.toLocaleString()} units
                        </p>
                      </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="space-y-3">
                      <Label className="font-semibold" style={{ color: textColor }}>Payment Method</Label>
                      {paymentMethods.map((method, index) => {
                        const MethodIcon = method.icon;
                        return (
                          <motion.button
                            key={method.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => setSelectedPaymentMethod(method.id)}
                            className={cn(
                              "w-full flex items-center gap-4 p-4 rounded-xl border transition-all",
                              selectedPaymentMethod === method.id
                                ? themeMode === 'dark'
                                  ? "border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/30"
                                  : "border-blue-500 bg-blue-50 ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/10"
                                : themeMode === 'dark'
                                  ? "border-gray-700 bg-gray-800/60 hover:border-blue-500/40"
                                  : "border-gray-200 bg-white hover:border-blue-400 hover:shadow-md"
                            )}
                          >
                            <div className={cn("p-2.5 rounded-xl shadow-lg", method.color)}>
                              <MethodIcon className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-semibold" style={{ color: textColor }}>
                              {method.name}
                            </span>
                            {selectedPaymentMethod === method.id && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center ml-auto"
                              >
                                <Check className="w-3 h-3 text-white" />
                              </motion.div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Balance Info */}
                    {buyer && (
                      <div className={cn(
                        "p-3 rounded-xl border",
                        themeMode === 'dark' ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"
                      )}>
                        <div className="flex justify-between text-sm">
                          <span style={{ color: textMuted }}>Your Balance:</span>
                          <span className="font-semibold tabular-nums" style={{ color: textColor }}>
                            ${(buyer.balance || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Pay Button with glow in light mode */}
                    <Button
                      className={cn(
                        "w-full h-14 gap-2 text-lg rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 font-semibold text-white transition-all",
                        themeMode === 'dark' 
                          ? "shadow-lg shadow-green-500/25"
                          : "shadow-[0_0_24px_rgba(34,197,94,0.4)] hover:shadow-[0_0_32px_rgba(34,197,94,0.5)]"
                      )}
                      size="lg"
                      onClick={handleProcessPayment}
                      disabled={isProcessingPayment}
                    >
                      {isProcessingPayment ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Lock className="w-5 h-5" />
                          Pay ${totalPrice.toFixed(2)} Now
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center flex items-center justify-center gap-1.5" style={{ color: textMuted }}>
                      <Lock className="w-3 h-3" />
                      Secure payment • Order will be processed immediately
                    </p>
                  </motion.div>
                )}

                {/* Step 6: Live Order Tracking */}
                {currentStep === 6 && placedOrderId && placedOrderNumber && (
                  <motion.div
                    key="step6"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  >
                    <LiveOrderTracker
                      orderId={placedOrderId}
                      orderNumber={placedOrderNumber}
                      themeMode={themeMode}
                      onTrackAnother={() => {
                        // Reset all state for new order
                        setCurrentStep(1);
                        setSelectedCategory('');
                        setSelectedServiceId('');
                        setTargetUrl('');
                        setQuantity(1000);
                        setPlacedOrderId(null);
                        setPlacedOrderNumber(null);
                      }}
                      onViewAllOrders={() => navigate('/orders')}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Guest Signup Modal */}
      <Dialog open={showGuestModal} onOpenChange={handleModalClose}>
        <DialogContent className="max-w-[95vw] sm:max-w-md overflow-hidden p-4 sm:p-6">
          {/* Modal Progress Indicator - Compact on mobile */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-2">
            <div className={cn(
              "flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full text-[10px] sm:text-xs font-bold transition-all",
              modalStep === 'email' 
                ? "bg-blue-500 text-white ring-2 ring-blue-500/30" 
                : accountCreated 
                  ? "bg-green-500 text-white" 
                  : "bg-muted text-muted-foreground"
            )}>
              {accountCreated || modalStep !== 'email' ? <Check className="w-3 h-3 sm:w-4 sm:h-4" /> : '1'}
            </div>
            <div className={cn(
              "w-4 sm:w-8 h-0.5 transition-all",
              accountCreated ? "bg-green-500" : modalStep !== 'email' ? "bg-blue-500" : "bg-muted"
            )} />
            <div className={cn(
              "flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full text-[10px] sm:text-xs font-bold transition-all",
              modalStep === 'credentials'
                ? "bg-blue-500 text-white ring-2 ring-blue-500/30"
                : accountCreated
                  ? "bg-green-500 text-white"
                  : "bg-muted text-muted-foreground"
            )}>
              {accountCreated ? <Check className="w-3 h-3 sm:w-4 sm:h-4" /> : '2'}
            </div>
            <div className={cn(
              "w-4 sm:w-8 h-0.5 transition-all",
              accountCreated ? "bg-blue-500" : "bg-muted"
            )} />
            <div className={cn(
              "flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full text-[10px] sm:text-xs font-bold transition-all",
              "bg-muted text-muted-foreground"
            )}>
              3
            </div>
          </div>
          <div className="flex justify-center gap-4 sm:gap-8 text-[10px] sm:text-xs text-muted-foreground mb-3 sm:mb-4">
            <span className={modalStep === 'email' && !accountCreated ? 'text-blue-500 font-medium' : ''}>Email</span>
            <span className={modalStep === 'credentials' || accountCreated ? 'text-blue-500 font-medium' : ''}>Credentials</span>
            <span>Payment</span>
          </div>

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
                  <Zap className="w-5 h-5 text-blue-500" />
                  Quick Checkout
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {accountCreated 
                ? "Save your credentials below, then continue to payment."
                : showLoginForm
                  ? "Enter your password to login"
                  : "Enter your email to create an account"
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {accountCreated ? (
              <>
                {/* Credentials Display - Mobile responsive */}
                <div className="p-3 sm:p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl">
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 shrink-0" />
                    <span className="font-semibold text-green-600 text-sm sm:text-base">Your Login Credentials</span>
                  </div>
                  
                  {/* Username */}
                  <div className="mb-2 sm:mb-3">
                    <Label className="text-[10px] sm:text-xs text-muted-foreground mb-1 block">Username</Label>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <code className="flex-1 text-xs sm:text-sm font-mono font-bold bg-background/80 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border break-all min-w-0">
                        {autoUsername}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0 h-8 w-8 sm:h-10 sm:w-10"
                        onClick={() => copyToClipboard(autoUsername, 'Username')}
                      >
                        {copiedField === 'Username' ? (
                          <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                        ) : (
                          <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <Label className="text-[10px] sm:text-xs text-muted-foreground mb-1 block">Password</Label>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <code className="flex-1 text-xs sm:text-sm font-mono font-bold bg-background/80 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border break-all min-w-0">
                        {showPassword ? tempPassword : '••••••••'}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0 h-8 w-8 sm:h-10 sm:w-10"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" /> : <Eye className="w-3 h-3 sm:w-4 sm:h-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0 h-8 w-8 sm:h-10 sm:w-10"
                        onClick={() => copyToClipboard(tempPassword, 'Password')}
                      >
                        {copiedField === 'Password' ? (
                          <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                        ) : (
                          <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Warning */}
                <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    <strong>Important:</strong> Save these credentials! You'll need them to login later.
                  </p>
                </div>

                <Button className="w-full h-12 text-base bg-blue-500 hover:bg-blue-600" onClick={handleContinueToPayment}>
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
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
                  onClick={() => {
                    setShowLoginForm(false);
                    setModalStep('email');
                  }}
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
                      <span className="font-medium tabular-nums">{quantity.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1 pt-1 border-t">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-bold text-blue-500 tabular-nums">${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full bg-blue-500 hover:bg-blue-600" 
                  onClick={handleGuestSignup}
                  disabled={isGuestSignup || !guestEmail}
                >
                  {isGuestSignup ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4 mr-2" />
                  )}
                  Create Account & Continue
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Already have an account?{' '}
                  <button 
                    className="text-blue-500 hover:underline"
                    onClick={() => {
                      setShowLoginForm(true);
                      setModalStep('login');
                    }}
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