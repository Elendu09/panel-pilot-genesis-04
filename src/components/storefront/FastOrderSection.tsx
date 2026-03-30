import { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { useTheme } from '@/hooks/use-theme';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
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
  DollarSign, Sparkles, Star, Users, Heart, MessageCircle, Share2, Bookmark, Play, Shield, Search
} from 'lucide-react';
import { SOCIAL_ICONS_MAP, TikTokIcon } from '@/components/icons/SocialIcons';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useNavigate, Link } from 'react-router-dom';
import { BuyerAuthContext } from '@/contexts/BuyerAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { LiveOrderTracker } from '@/components/order/LiveOrderTracker';
import { useUnifiedServices } from '@/hooks/useUnifiedServices';
import { Confetti } from '@/components/effects/Confetti';
import { useCategoryFilters } from '@/hooks/useCategoryFilters';
import { SpeedGauge } from '@/components/buyer/SpeedGauge';
import { detectServiceType } from '@/lib/service-icon-detection';
import { useAvailablePaymentGateways, AvailableGateway } from '@/hooks/useAvailablePaymentGateways';
import { useAnalyticsTracking } from '@/hooks/use-analytics-tracking';

interface Service {
  id: string;
  name: string;
  price: number;
  category: string;
  min_quantity?: number;
  max_quantity?: number;
  provider_service_id?: string;
  display_order?: number;
  displayOrder?: number;
}

// Smart price formatting: 4 decimals for < $1, 2 decimals for >= $1
const formatPrice = (price: number): string => {
  if (price === 0) return '0.00';
  return price < 1 ? price.toFixed(4) : price.toFixed(2);
};

interface FastOrderSectionProps {
  services: Service[];
  panelId: string;
  panelName: string;
  customization?: any;
  onStepChange?: (step: number) => void;
}

// All available payment gateways with their display info - dynamically loaded based on panel settings
const allPaymentGateways: Record<string, { name: string; icon: any; color: string; badge: string }> = {
  // Cards & Digital Wallets
  stripe: { name: "Credit Card", icon: CreditCard, color: "bg-gradient-to-br from-blue-500 to-blue-600", badge: "Instant" },
  paypal: { name: "PayPal", icon: Wallet, color: "bg-gradient-to-br from-blue-600 to-indigo-600", badge: "Instant" },
  square: { name: "Square", icon: CreditCard, color: "bg-gradient-to-br from-black to-gray-700", badge: "Instant" },
  adyen: { name: "Adyen", icon: CreditCard, color: "bg-gradient-to-br from-green-600 to-green-700", badge: "Instant" },
  
  // African Gateways
  flutterwave: { name: "Flutterwave", icon: Globe, color: "bg-gradient-to-br from-orange-400 to-yellow-400", badge: "Instant" },
  paystack: { name: "Paystack", icon: Globe, color: "bg-gradient-to-br from-cyan-500 to-blue-500", badge: "Instant" },
  korapay: { name: "Kora Pay", icon: Globe, color: "bg-gradient-to-br from-purple-500 to-indigo-500", badge: "Instant" },
  monnify: { name: "Monnify", icon: Globe, color: "bg-gradient-to-br from-green-500 to-teal-500", badge: "Instant" },
  
  // Indian Gateways
  razorpay: { name: "Razorpay", icon: Globe, color: "bg-gradient-to-br from-blue-600 to-indigo-600", badge: "Instant" },
  paytm: { name: "Paytm", icon: Wallet, color: "bg-gradient-to-br from-blue-400 to-cyan-500", badge: "Instant" },
  phonepe: { name: "PhonePe", icon: Wallet, color: "bg-gradient-to-br from-purple-500 to-purple-600", badge: "Instant" },
  
  // LATAM Gateways
  mercadopago: { name: "Mercado Pago", icon: DollarSign, color: "bg-gradient-to-br from-sky-400 to-blue-500", badge: "Instant" },
  payu: { name: "PayU", icon: CreditCard, color: "bg-gradient-to-br from-green-600 to-green-700", badge: "Instant" },
  
  // EU Gateways
  mollie: { name: "Mollie", icon: CreditCard, color: "bg-gradient-to-br from-black to-gray-800", badge: "Instant" },
  klarna: { name: "Klarna", icon: Wallet, color: "bg-gradient-to-br from-pink-400 to-pink-500", badge: "Instant" },
  ideal: { name: "iDEAL", icon: Globe, color: "bg-gradient-to-br from-pink-500 to-red-500", badge: "Instant" },
  
  // Crypto Gateways
  crypto: { name: "Crypto", icon: DollarSign, color: "bg-gradient-to-br from-orange-500 to-amber-500", badge: "5-30 min" },
  coinbase: { name: "Coinbase", icon: DollarSign, color: "bg-gradient-to-br from-blue-600 to-blue-700", badge: "5-30 min" },
  btcpay: { name: "Bitcoin", icon: Sparkles, color: "bg-gradient-to-br from-orange-500 to-amber-500", badge: "10-60 min" },
  nowpayments: { name: "NowPayments", icon: Sparkles, color: "bg-gradient-to-br from-gray-700 to-gray-900", badge: "5-30 min" },
  coingate: { name: "CoinGate", icon: Sparkles, color: "bg-gradient-to-br from-blue-500 to-indigo-600", badge: "5-30 min" },
  binancepay: { name: "Binance Pay", icon: Sparkles, color: "bg-gradient-to-br from-yellow-400 to-yellow-500", badge: "Instant" },
  
  // E-Wallets
  perfectmoney: { name: "Perfect Money", icon: Shield, color: "bg-gradient-to-br from-green-500 to-emerald-500", badge: "Instant" },
  skrill: { name: "Skrill", icon: Shield, color: "bg-gradient-to-br from-purple-600 to-purple-700", badge: "Instant" },
  neteller: { name: "Neteller", icon: Shield, color: "bg-gradient-to-br from-green-600 to-green-700", badge: "Instant" },
  webmoney: { name: "WebMoney", icon: Wallet, color: "bg-gradient-to-br from-blue-500 to-blue-600", badge: "Instant" },
  
  // Bank Transfers
  wise: { name: "Wise", icon: Globe, color: "bg-gradient-to-br from-green-400 to-green-600", badge: "1-2 days" },
  ach: { name: "ACH Transfer", icon: Globe, color: "bg-gradient-to-br from-blue-500 to-blue-700", badge: "1-3 days" },
  sepa: { name: "SEPA", icon: Globe, color: "bg-gradient-to-br from-blue-600 to-indigo-600", badge: "1-2 days" },
};

interface PaymentMethod {
  id: string;
  name: string;
  icon: any;
  color: string;
  badge?: string;
}

// Service type icons map
const SERVICE_TYPE_ICONS: Record<string, any> = {
  followers: Users,
  subscribers: Users,
  members: Users,
  likes: Heart,
  views: Eye,
  plays: Play,
  comments: MessageCircle,
  shares: Share2,
  saves: Bookmark,
  general: Zap,
};

// Service type colors
const SERVICE_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  followers: { bg: 'bg-gradient-to-br from-blue-500 to-blue-600', text: 'text-blue-500' },
  subscribers: { bg: 'bg-gradient-to-br from-red-500 to-red-600', text: 'text-red-500' },
  members: { bg: 'bg-gradient-to-br from-purple-500 to-purple-600', text: 'text-purple-500' },
  likes: { bg: 'bg-gradient-to-br from-pink-500 to-rose-500', text: 'text-pink-500' },
  views: { bg: 'bg-gradient-to-br from-green-500 to-emerald-500', text: 'text-green-500' },
  plays: { bg: 'bg-gradient-to-br from-orange-500 to-amber-500', text: 'text-orange-500' },
  comments: { bg: 'bg-gradient-to-br from-cyan-500 to-teal-500', text: 'text-cyan-500' },
  shares: { bg: 'bg-gradient-to-br from-indigo-500 to-violet-500', text: 'text-indigo-500' },
  saves: { bg: 'bg-gradient-to-br from-yellow-500 to-amber-500', text: 'text-yellow-500' },
  general: { bg: 'bg-gradient-to-br from-gray-500 to-gray-600', text: 'text-gray-500' },
};

export const FastOrderSection = ({ services, panelId, panelName, customization, onStepChange }: FastOrderSectionProps) => {
  // Safely access buyer auth context (may not be available in preview mode)
  const buyerAuthContext = useContext(BuyerAuthContext);
  const buyer = buyerAuthContext?.buyer ?? null;
  const refreshBuyer = buyerAuthContext?.refreshBuyer ?? (async () => {});
  const login = buyerAuthContext?.login ?? (async () => false);
  
  const navigate = useNavigate();
  
  // Analytics tracking for Fast Order funnel
  const { trackServiceSelect, trackCheckoutStart, trackOrderComplete } = useAnalyticsTracking(panelId);
  
  // Use actual theme from context instead of customization
  const { theme } = useTheme();
  const themeMode = theme === 'system' 
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;
  
  // Use proper theme-aware text colors
  const textColor = themeMode === 'dark' ? 'hsl(var(--foreground))' : 'hsl(var(--foreground))';
  const textMuted = themeMode === 'dark' ? 'hsl(var(--muted-foreground))' : 'hsl(var(--muted-foreground))';
  
  // True dark/light mode card styles
  const cardBg = themeMode === 'dark' 
    ? 'bg-[#1a1a2e] backdrop-blur-xl border-[#2d2d3d] shadow-2xl shadow-black/30' 
    : 'bg-white backdrop-blur-xl shadow-xl shadow-gray-200/60 border-gray-200';
  const inputBg = themeMode === 'dark' 
    ? 'bg-[#1a1a2e] border-[#2d2d3d] focus:border-teal-500/50 focus:ring-teal-500/20 text-white placeholder:text-gray-500' 
    : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 shadow-sm';
  
  // Blue glow button style for light mode
  const glowButtonClass = themeMode === 'dark'
    ? 'bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/30'
    : 'bg-blue-500 hover:bg-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_28px_rgba(59,130,246,0.5)]';
  
  // Step state (1-6: Network, Category, Service, Order, Payment, Tracking)
  const [currentStep, setCurrentStepInternal] = useState(1);
  
  // Wrapper to notify parent of step changes
  const setCurrentStep = (step: number) => {
    setCurrentStepInternal(step);
    onStepChange?.(step);
  };
  
  // Order form state - 3-tier selection
  const [selectedNetwork, setSelectedNetwork] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [targetUrl, setTargetUrl] = useState('');
  const [quantity, setQuantity] = useState(1000);
  const [isOrdering, setIsOrdering] = useState(false);
  
  // Drip feed state
  const [dripFeedEnabled, setDripFeedEnabled] = useState(false);
  const [dripFeedRuns, setDripFeedRuns] = useState(2);
  const [dripFeedInterval, setDripFeedInterval] = useState(60);
  
  // Payment state - use available payment gateways hook for consistent behavior with deposits
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
  const [serviceSearch, setServiceSearch] = useState('');
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  
  // Track credential copy status - user must copy both to proceed
  const [credentialsCopied, setCredentialsCopied] = useState({ username: false, password: false });

  // Use unified payment gateways hook - includes manual payments and applies proper filtering
  const { gateways: availableGateways, loading: loadingPaymentMethods } = useAvailablePaymentGateways({
    panelId,
  });

  // Map available gateways to payment method format for UI
  const paymentMethods: PaymentMethod[] = useMemo(() => {
    return availableGateways.map((gw: AvailableGateway) => {
      const gatewayInfo = allPaymentGateways[gw.id];
      if (gatewayInfo) {
        return { id: gw.id, ...gatewayInfo };
      }
      // For manual methods or unknown gateways
      const isManual = gw.id.startsWith('manual_') || gw.category === 'manual';
      return {
        id: gw.id,
        name: gw.displayName || gw.id.charAt(0).toUpperCase() + gw.id.slice(1).replace(/([A-Z])/g, ' $1').trim(),
        icon: isManual ? Wallet : CreditCard,
        color: isManual ? 'bg-gradient-to-br from-emerald-500 to-teal-500' : 'bg-gradient-to-br from-gray-500 to-gray-600',
        badge: isManual ? 'Manual' : 'Instant',
      };
    });
  }, [availableGateways]);

  const noPaymentGateway = !loadingPaymentMethods && paymentMethods.length === 0;

  // Set default payment method when available
  useEffect(() => {
    if (paymentMethods.length > 0 && !paymentMethods.find(m => m.id === selectedPaymentMethod)) {
      setSelectedPaymentMethod(paymentMethods[0].id);
    }
  }, [paymentMethods, selectedPaymentMethod]);

  // Use unified services for consistent category ordering across all pages
  const { 
    categoriesWithServices: unifiedCategories,
  } = useUnifiedServices({ panelId, enabled: !!panelId });

  // Get category data helper - uses SOCIAL_ICONS_MAP for icons
  const hookGetCategoryData = useCallback((category: string) => {
    const catData = SOCIAL_ICONS_MAP[category.toLowerCase()] || SOCIAL_ICONS_MAP.other;
    return {
      icon: catData.icon,
      label: catData.label || category.charAt(0).toUpperCase() + category.slice(1),
      color: catData.color,
      bgColor: catData.bgColor,
    };
  }, []);

  // Tier 1: Get unique networks (platforms) from services
  const networks = useMemo(() => {
    const networkMap = new Map<string, { count: number }>();
    services.forEach((s) => {
      const network = s.category || 'other';
      if (!networkMap.has(network)) {
        networkMap.set(network, { count: 0 });
      }
      networkMap.get(network)!.count++;
    });
    
    // Sort by count (most services first)
    return Array.from(networkMap.entries())
      .map(([id, data]) => ({
        id,
        ...hookGetCategoryData(id),
        count: data.count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [services, hookGetCategoryData]);
  
  // Tier 2: Get categories (service types) for selected network
  const categories = useMemo(() => {
    if (!selectedNetwork) return [];
    
    const networkServices = services.filter(s => s.category === selectedNetwork);
    const categoryMap = new Map<string, { count: number; services: Service[] }>();
    
    networkServices.forEach((s) => {
      const serviceType = detectServiceType(s.name);
      if (!categoryMap.has(serviceType)) {
        categoryMap.set(serviceType, { count: 0, services: [] });
      }
      categoryMap.get(serviceType)!.count++;
      categoryMap.get(serviceType)!.services.push(s);
    });
    
    return Array.from(categoryMap.entries())
      .map(([type, data]) => ({
        id: type,
        name: type.charAt(0).toUpperCase() + type.slice(1),
        icon: SERVICE_TYPE_ICONS[type] || Zap,
        colors: SERVICE_TYPE_COLORS[type] || SERVICE_TYPE_COLORS.general,
        count: data.count,
        services: data.services,
      }))
      .sort((a, b) => b.count - a.count);
  }, [selectedNetwork, services]);
  
  // Tier 3: Get services for selected category
  const categoryServices = useMemo(() => {
    if (!selectedCategory) return [];
    const category = categories.find(c => c.id === selectedCategory);
    const allServices = category?.services || [];
    
    // Filter by search if provided
    if (serviceSearch.trim()) {
      const search = serviceSearch.toLowerCase();
      return allServices.filter(s => 
        s.name.toLowerCase().includes(search) ||
        (s.provider_service_id || '').toLowerCase().includes(search)
      );
    }
    return allServices;
  }, [selectedCategory, categories, serviceSearch]);
  
  const selectedService = services.find(s => s.id === selectedServiceId);
  const totalPrice = selectedService ? (selectedService.price * quantity) / 1000 : 0;

  // Quantity presets
  const quantityPresets = [100, 500, 1000, 5000, 10000];

  // Get selected network data for display
  const selectedNetworkData = selectedNetwork ? hookGetCategoryData(selectedNetwork) : null;
  const selectedCategoryData = selectedCategory ? categories.find(c => c.id === selectedCategory) : null;

  // Handle network selection (Tier 1)
  const handleNetworkSelect = (network: string) => {
    setSelectedNetwork(network);
    setSelectedCategory('');
    setSelectedServiceId('');
    setCurrentStep(2);
  };

  // Handle category selection (Tier 2)
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSelectedServiceId('');
    setCurrentStep(3);
  };

  // Handle service selection (Tier 3)
  const handleServiceSelect = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    const service = services.find(s => s.id === serviceId);
    if (service?.min_quantity) {
      setQuantity(service.min_quantity);
    }
    // Track service selection for analytics
    if (service) {
      trackServiceSelect(serviceId, service.name, service.category);
    }
    setCurrentStep(4);
  };

  // Handle details confirmed
  const handleDetailsConfirmed = () => {
    if (!targetUrl.trim()) {
      toast({ title: "Please enter a link or username", variant: "destructive" });
      return;
    }
    // Validate quantity against service limits
    if (selectedService) {
      const minQty = selectedService.min_quantity || 100;
      const maxQty = selectedService.max_quantity || 100000;
      if (quantity < minQty) {
        toast({ title: `Minimum quantity is ${minQty.toLocaleString()}`, variant: "destructive" });
        return;
      }
      if (quantity > maxQty) {
        toast({ title: `Maximum quantity is ${maxQty.toLocaleString()}`, variant: "destructive" });
        return;
      }
    }
    if (quantity <= 0) {
      toast({ title: "Please enter a valid quantity", variant: "destructive" });
      return;
    }
    // Track checkout start for analytics
    if (selectedService) {
      trackCheckoutStart(selectedService.id, totalPrice);
    }
    setCurrentStep(5); // Go directly to payment (no review step)
  };

  // Generate username for guest signup
  const generateUsername = () => {
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `user_${randomStr}`;
  };

  // Copy to clipboard helper - tracks which fields have been copied
  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
      toast({ title: "Copied!", description: `${field} copied to clipboard` });
      
      // Track credential copy status for requirement enforcement
      if (field === 'Username') {
        setCredentialsCopied(prev => ({ ...prev, username: true }));
      }
      if (field === 'Password') {
        setCredentialsCopied(prev => ({ ...prev, password: true }));
      }
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

  // Continue to payment step after account creation (only if credentials copied)
  const handleContinueToPayment = () => {
    if (!credentialsCopied.username || !credentialsCopied.password) {
      toast({
        title: "Please Copy Your Credentials",
        description: "You must copy both your username and password before continuing.",
        variant: "destructive"
      });
      return;
    }
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
      setCredentialsCopied({ username: false, password: false }); // Reset copy tracking
    }
    setShowGuestModal(open);
  };

  const handlePlaceOrder = async () => {
    if (!buyer) {
      // Save order state to localStorage before showing guest modal
      localStorage.setItem('fast_order_pending', JSON.stringify({
        networkId: selectedNetwork,
        categoryId: selectedCategory,
        serviceId: selectedServiceId,
        quantity,
        targetUrl
      }));
      setShowGuestModal(true);
      return;
    }
    // Authenticated user - go to payment step
    setCurrentStep(5);
  };

  // Restore order state after login/signup
  useEffect(() => {
    if (buyer && services.length > 0) {
      const pending = localStorage.getItem('fast_order_pending');
      if (pending) {
        try {
          const data = JSON.parse(pending);
          const service = services.find(s => s.id === data.serviceId);
          if (service) {
            setSelectedNetwork(data.networkId);
            setSelectedCategory(data.categoryId);
            setSelectedServiceId(data.serviceId);
            setQuantity(data.quantity || 1000);
            setTargetUrl(data.targetUrl || '');
            // Continue to payment step
            setCurrentStep(5);
          }
          localStorage.removeItem('fast_order_pending');
        } catch (e) {
          console.error('Failed to restore order state:', e);
          localStorage.removeItem('fast_order_pending');
        }
      }
    }
  }, [buyer, services]);

  // Check for payment success/cancel URL params on mount (for direct order payment flow)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const cancelled = params.get('cancelled');
    
    if (success === 'true') {
      // Payment was successful - check for pending order payment
      const pendingOrder = localStorage.getItem('pending_order_payment');
      if (pendingOrder) {
        try {
          const { orderId, orderNumber } = JSON.parse(pendingOrder);
          setPlacedOrderId(orderId);
          setPlacedOrderNumber(orderNumber);
          
          toast({ 
            title: "Payment Successful!", 
            description: `Order #${orderNumber} is now being processed.`
          });
          
          // Track order completion for analytics funnel
          trackOrderComplete(orderId, 0);
          
          setShowOrderSuccess(true);
          setTimeout(() => {
            setShowOrderSuccess(false);
            setCurrentStep(6);
          }, 2000);
          
          localStorage.removeItem('pending_order_payment');
        } catch (e) {
          console.error('Failed to parse pending order:', e);
        }
      } else {
        toast({ 
          title: "Payment Successful!", 
          description: "Your order is being processed."
        });
      }
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (cancelled === 'true') {
      toast({ 
        variant: "destructive",
        title: "Payment Cancelled", 
        description: "Your payment was not completed. You can try again."
      });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Process payment and create order
  const handleProcessPayment = async () => {
    if (!buyer) {
      toast({ title: "Error", description: "Please login first", variant: "destructive" });
      setShowGuestModal(true);
      return;
    }
    
    if (!selectedService) {
      toast({ 
        title: "Service Not Available", 
        description: "Please select a service again",
        variant: "destructive" 
      });
      setCurrentStep(3);
      return;
    }

    setIsProcessingPayment(true);

    try {
      const buyerBalance = buyer.balance || 0;
      
      // Check if buyer has sufficient balance
      if (buyerBalance >= totalPrice) {
        // Use balance payment - deduct from balance
        const response = await supabase.functions.invoke('buyer-order', {
          body: {
            panelId: panelId,
            buyerId: buyer.id,
            serviceId: selectedServiceId,
            quantity: quantity,
            targetUrl: targetUrl,
            price: totalPrice,
            paymentType: 'balance',
            notes: `Fast Order via ${panelName}`,
            ...(dripFeedEnabled && selectedService && (selectedService as any).dripfeed_available && dripFeedRuns >= 2 ? {
              runs: dripFeedRuns,
              interval: dripFeedInterval,
            } : {}),
          }
        });

        const result = response.data || {};

        if (!result.success && result.error) {
          throw new Error(result.error);
        }

        const { order, newBalance } = result;
        await refreshBuyer();

        setPlacedOrderId(order.id);
        setPlacedOrderNumber(order.orderNumber);

        toast({
          title: "Order Placed Successfully!",
          description: `Order #${order.orderNumber} is now being processed.`,
        });

        try {
          await navigator.clipboard.writeText(order.orderNumber);
        } catch {}

        // Track order completion for analytics funnel
        trackOrderComplete(order.id, totalPrice);

        setShowOrderSuccess(true);
        setTimeout(() => {
          setShowOrderSuccess(false);
          setCurrentStep(6);
        }, 2000);
      } else {
        // Insufficient balance - use direct payment flow
        // First create the order with awaiting_payment status
        const orderResponse = await supabase.functions.invoke('buyer-order', {
          body: {
            panelId: panelId,
            buyerId: buyer.id,
            serviceId: selectedServiceId,
            quantity: quantity,
            targetUrl: targetUrl,
            price: totalPrice,
            paymentType: 'direct',
            notes: `Fast Order via ${panelName}`,
            ...(dripFeedEnabled && selectedService && (selectedService as any).dripfeed_available && dripFeedRuns >= 2 ? {
              runs: dripFeedRuns,
              interval: dripFeedInterval,
            } : {}),
          }
        });

        const orderResult = orderResponse.data || {};

        if (!orderResult.success && orderResult.error) {
          throw new Error(orderResult.error);
        }

        const { order } = orderResult;

        // Now redirect to payment gateway with order ID
        const paymentResponse = await supabase.functions.invoke('process-payment', {
          body: {
            gateway: selectedPaymentMethod,
            amount: totalPrice,
            panelId: panelId,
            buyerId: buyer.id,
            orderId: order.id,
            returnUrl: window.location.origin + '/fast-order',
            currency: 'usd',
          }
        });

        const paymentResult = paymentResponse.data || {};

        if (!paymentResult.success) {
          throw new Error(paymentResult.error || 'Payment processing failed');
        }

        if (paymentResult.redirectUrl) {
          // Store order info for tracking after payment
          localStorage.setItem('pending_order_payment', JSON.stringify({
            orderId: order.id,
            orderNumber: order.orderNumber,
          }));
          window.location.href = paymentResult.redirectUrl;
        } else {
          toast({
            title: "Order Created",
            description: "Complete payment to start processing.",
          });
          // Track order completion for analytics funnel
          trackOrderComplete(order.id, totalPrice);
          setPlacedOrderId(order.id);
          setPlacedOrderNumber(order.orderNumber);
          setCurrentStep(6);
        }
      }

    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Order Failed",
        description: error.message || "Failed to process order",
        variant: "destructive"
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Back navigation
  const handleBack = () => {
    if (currentStep === 2) {
      setSelectedNetwork('');
      setCurrentStep(1);
    } else if (currentStep === 3) {
      setSelectedCategory('');
      setCurrentStep(2);
    } else if (currentStep === 4) {
      setSelectedServiceId('');
      setCurrentStep(3);
    } else if (currentStep === 5) {
      setCurrentStep(4);
    }
  };

  // Show empty state if no services available
  if (services.length === 0 || networks.length === 0) {
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
              <h3 className={cn("text-xl font-bold mb-2 tracking-tight", themeMode === 'dark' ? 'text-white' : 'text-gray-900')}>
                No Services Available Yet
              </h3>
              <p className={cn("mb-6 text-sm", themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600')}>
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
            <CardContent className="p-3 sm:p-4 md:p-6 lg:p-8">
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
                    {currentStep === 2 && 'Back to Networks'}
                    {currentStep === 3 && 'Back to Categories'}
                    {currentStep === 4 && 'Back to Services'}
                    {currentStep === 5 && 'Back to Order'}
                  </Button>
                </motion.div>
              )}

              <AnimatePresence mode="wait">
                {/* Step 1: Select Network (Platform) */}
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
                      <h3 className={cn(
                        "text-xl sm:text-2xl font-bold mb-2 tracking-tight",
                        themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                      )}>
                        Select a Network
                      </h3>
                      <p className={cn(
                        "text-sm",
                        themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      )}>
                        Choose the platform you want to boost
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                      {networks.map((network, index) => {
                        const NetworkIcon = network.icon;
                        
                        return (
                          <motion.button
                            key={network.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            whileHover={{ scale: 1.03, y: -4 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleNetworkSelect(network.id)}
                            className={cn(
                              "relative flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-300 group overflow-hidden",
                              themeMode === 'dark'
                                ? "border-[#2d2d3d] bg-[#1a1a2e]/60 hover:bg-[#1a1a2e] hover:border-teal-500/50"
                                : "border-gray-200 bg-white hover:bg-blue-50/50 hover:border-blue-400 shadow-sm hover:shadow-lg hover:shadow-blue-500/10"
                            )}
                          >
                            {/* Glow effect on hover */}
                            <div className={cn(
                              "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                              network.bgColor,
                              "blur-2xl"
                            )} style={{ opacity: 0.1 }} />
                            
                            <div className={cn(
                              "relative p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl shadow-lg transition-transform group-hover:scale-110",
                              network.bgColor
                            )}>
                              <NetworkIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" size={24} />
                            </div>
                            <div className="text-center relative">
                              <span className={cn(
                                "text-xs sm:text-sm font-semibold capitalize block tracking-tight",
                                themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                              )}>
                                {network.label}
                              </span>
                              <span className={cn(
                                "text-[10px] sm:text-xs",
                                themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'
                              )}>
                                {network.count} service{network.count !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Select Category (Service Type) */}
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
                      
                      {/* Network Icon Display */}
                      {selectedNetworkData && (
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <div className={cn("p-2 rounded-lg", selectedNetworkData.bgColor)}>
                            <selectedNetworkData.icon className="w-5 h-5 text-white" size={20} />
                          </div>
                          <span className="capitalize font-semibold text-blue-500">{selectedNetworkData.label}</span>
                        </div>
                      )}
                      
                      <h3 className={cn(
                        "text-xl sm:text-2xl font-bold mb-2 tracking-tight",
                        themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                      )}>
                        Select a Category
                      </h3>
                      <p className={cn(
                        "text-sm",
                        themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      )}>
                        Choose the type of service you need
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                      {categories.map((category, index) => {
                        const CategoryIcon = category.icon;
                        
                        return (
                          <motion.button
                            key={category.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.03, y: -4 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleCategorySelect(category.id)}
                            className={cn(
                              "relative flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-300 group overflow-hidden",
                              themeMode === 'dark'
                                ? "border-[#2d2d3d] bg-[#1a1a2e]/60 hover:bg-[#1a1a2e] hover:border-teal-500/50"
                                : "border-gray-200 bg-white hover:bg-blue-50/50 hover:border-blue-400 shadow-sm hover:shadow-lg hover:shadow-blue-500/10"
                            )}
                          >
                            <div className={cn(
                              "relative p-2.5 sm:p-3 rounded-lg sm:rounded-xl shadow-lg transition-transform group-hover:scale-110",
                              category.colors.bg
                            )}>
                              <CategoryIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <div className="text-center relative">
                              <span className={cn(
                                "text-xs sm:text-sm font-semibold capitalize block tracking-tight",
                                themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                              )}>
                                {category.name}
                              </span>
                              <span className={cn(
                                "text-[10px] sm:text-xs",
                                themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'
                              )}>
                                {category.count} service{category.count !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Select Service */}
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
                      
                      {/* Network + Category Display */}
                      {selectedNetworkData && selectedCategoryData && (
                        <div className="flex items-center justify-center gap-2 mb-3 flex-wrap">
                          <div className={cn("p-1.5 rounded-lg", selectedNetworkData.bgColor)}>
                            <selectedNetworkData.icon className="w-4 h-4 text-white" size={16} />
                          </div>
                          <span className="text-sm font-medium text-muted-foreground">{selectedNetworkData.label}</span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          <div className={cn("p-1.5 rounded-lg", selectedCategoryData.colors.bg)}>
                            <selectedCategoryData.icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm font-medium text-blue-500">{selectedCategoryData.name}</span>
                        </div>
                      )}
                      
                      <h3 className={cn(
                        "text-xl sm:text-2xl font-bold mb-2 tracking-tight",
                        themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                      )}>
                        Choose a Service
                      </h3>
                      <p className={cn(
                        "text-sm",
                        themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      )}>
                        {categoryServices.length} services available
                      </p>
                    </div>
                    
                    {/* Search filter for services */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search services..."
                        value={serviceSearch}
                        onChange={(e) => setServiceSearch(e.target.value)}
                        className={cn("pl-9 h-10 rounded-xl", inputBg)}
                      />
                    </div>
                    
                    {/* All services in scrollable compact grid */}
                    <ScrollArea className="h-[240px] sm:h-[300px] pr-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                        {categoryServices.map((service, index) => (
                          <motion.button
                            key={service.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(index * 0.02, 0.3) }}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleServiceSelect(service.id)}
                            className={cn(
                              "p-2 sm:p-2.5 rounded-lg border text-left transition-all",
                              selectedServiceId === service.id
                                ? themeMode === 'dark'
                                  ? "border-teal-500 bg-teal-500/10 ring-1 ring-teal-500/30"
                                  : "border-blue-500 bg-blue-50 ring-2 ring-blue-500/30"
                                : themeMode === 'dark'
                                  ? "border-[#2d2d3d] bg-[#1a1a2e]/60 hover:border-teal-500/40"
                                  : "border-gray-200 bg-white hover:border-blue-400"
                            )}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-sm sm:text-base font-bold tabular-nums text-blue-500">
                                ${service.price.toFixed(4)}
                              </span>
                              {selectedServiceId === service.id && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center"
                                >
                                  <Check className="w-2.5 h-2.5 text-white" />
                                </motion.div>
                              )}
                            </div>
                            <Badge variant="secondary" className="text-[7px] font-mono px-0.5 py-0 h-3 mb-0.5">
                              ID: {service.provider_service_id || service.providerServiceId || service.display_order || service.displayOrder || service.id?.slice(0,6)}
                            </Badge>
                            <p className={cn(
                              "text-[10px] sm:text-xs line-clamp-1",
                              themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                            )}>
                              {service.name}
                            </p>
                            <div className="flex items-center justify-between mt-0.5">
                              <p className={cn(
                                "text-[9px] sm:text-[10px]",
                                themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                              )}>
                                Min: {service.min_quantity || 100}
                              </p>
                              <SpeedGauge 
                                estimatedTime={(service as any).average_time || (service as any).averageTime} 
                                compact 
                                size="sm"
                                showEstimatedTime={false}
                              />
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </ScrollArea>
                  </motion.div>
                )}

                {/* Step 4: Enter Order Details */}
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
                      
                      {/* Network + Category + Service breadcrumb */}
                      {selectedNetworkData && selectedCategoryData && (
                        <div className="flex items-center justify-center gap-1.5 mb-3 flex-wrap text-xs">
                          <div className={cn("p-1 rounded", selectedNetworkData.bgColor)}>
                            <selectedNetworkData.icon className="w-3 h-3 text-white" size={12} />
                          </div>
                          <span className="text-muted-foreground">{selectedNetworkData.label}</span>
                          <ChevronRight className="w-3 h-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{selectedCategoryData.name}</span>
                        </div>
                      )}
                      
                      <h3 className={cn(
                        "text-xl sm:text-2xl font-bold mb-2 tracking-tight",
                        themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                      )}>
                        Order Details
                      </h3>
                      <p className={cn(
                        "text-xs sm:text-sm truncate max-w-xs mx-auto",
                        themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      )}>
                        {selectedService?.name}
                      </p>
                    </div>
                    
                    {/* Target URL */}
                    <div className="space-y-2">
                      <Label className={cn("font-semibold text-sm", themeMode === 'dark' ? 'text-white' : 'text-gray-900')}>Link / Username *</Label>
                      <Input
                        placeholder="https://instagram.com/yourprofile"
                        value={targetUrl}
                        onChange={(e) => setTargetUrl(e.target.value)}
                        className={cn("h-11 sm:h-12 rounded-xl text-sm", inputBg)}
                      />
                    </div>

                    {/* Quantity */}
                    <div className="space-y-2">
                      <Label className={cn("font-semibold text-sm", themeMode === 'dark' ? 'text-white' : 'text-gray-900')}>Quantity</Label>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2">
                        {quantityPresets.map((preset) => (
                          <Button
                            key={preset}
                            type="button"
                            variant={quantity === preset ? "default" : "outline"}
                            size="sm"
                            onClick={() => setQuantity(preset)}
                            className={cn(
                              "min-w-[50px] sm:min-w-[60px] rounded-lg font-semibold tabular-nums text-xs sm:text-sm h-8 sm:h-9",
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
                        className={cn("rounded-xl tabular-nums text-sm", inputBg)}
                      />
                      {selectedService && (
                        <p className={cn(
                          "text-[10px] sm:text-xs",
                          themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        )}>
                          Min: {selectedService.min_quantity || 100} | Max: {(selectedService.max_quantity || 10000).toLocaleString()}
                        </p>
                      )}
                    </div>

                    {/* Drip Feed Options */}
                    {selectedService && (
                      <div className="space-y-3">
                        <div className={cn(
                          "flex items-center justify-between p-3 rounded-xl border",
                          themeMode === 'dark' 
                            ? "bg-teal-500/5 border-teal-500/20" 
                            : "bg-blue-50 border-blue-200"
                        )}>
                          <Label className={cn("font-semibold text-sm flex items-center gap-2 cursor-pointer", themeMode === 'dark' ? 'text-white' : 'text-gray-900')}>
                            <Zap className="w-4 h-4 text-blue-500" />
                            Enable Drip Feed
                          </Label>
                          <Switch
                            checked={dripFeedEnabled}
                            onCheckedChange={setDripFeedEnabled}
                          />
                        </div>
                        {dripFeedEnabled && (
                          <div className={cn(
                            "space-y-3 p-4 rounded-xl border",
                            themeMode === 'dark' 
                              ? "bg-teal-500/5 border-teal-500/20" 
                              : "bg-blue-50 border-blue-200"
                          )}>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label className={cn("text-xs", themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600')}>Runs</Label>
                                <Input
                                  type="number"
                                  min={2}
                                  max={100}
                                  value={dripFeedRuns < 2 ? 2 : dripFeedRuns}
                                  onChange={(e) => setDripFeedRuns(Math.max(2, parseInt(e.target.value) || 2))}
                                  className={cn("h-10 rounded-lg font-mono", inputBg)}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className={cn("text-xs", themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600')}>Interval (min)</Label>
                                <Input
                                  type="number"
                                  min={1}
                                  value={dripFeedInterval}
                                  onChange={(e) => setDripFeedInterval(parseInt(e.target.value) || 60)}
                                  className={cn("h-10 rounded-lg font-mono", inputBg)}
                                />
                              </div>
                            </div>
                            <p className={cn("text-xs", themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500')}>
                              {dripFeedRuns} runs × {quantity.toLocaleString()} qty every {dripFeedInterval} min
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Price Preview */}
                    <div className={cn(
                      "p-4 sm:p-5 rounded-2xl border",
                      themeMode === 'dark' 
                        ? "bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20" 
                        : "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg shadow-blue-500/10"
                    )}>
                      <div className="flex justify-between items-center">
                        <div>
                          <span className={cn(
                            "text-[10px] sm:text-xs uppercase tracking-wider font-semibold",
                            themeMode === 'dark' ? 'text-muted-foreground' : 'text-gray-500'
                          )}>
                            Estimated Total
                          </span>
                        <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-2xl sm:text-3xl font-bold tabular-nums text-blue-500">
                              ${formatPrice(totalPrice)}
                            </span>
                            <span className={cn("text-xs sm:text-sm", themeMode === 'dark' ? 'text-muted-foreground' : 'text-gray-500')}>USD</span>
                          </div>
                        </div>
                        <Sparkles className={cn(
                          "w-6 h-6 sm:w-8 sm:h-8",
                          themeMode === 'dark' ? 'text-blue-400' : 'text-blue-500'
                        )} />
                      </div>
                    </div>

                    <Button
                      className={cn(
                        "w-full h-11 sm:h-12 gap-2 rounded-xl font-semibold text-sm sm:text-base text-white transition-all",
                        glowButtonClass
                      )}
                      onClick={handleDetailsConfirmed}
                      disabled={!targetUrl.trim()}
                    >
                      {buyer ? 'Continue to Payment' : 'Checkout'}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                    
                    {!buyer && (
                      <p className={cn("text-[10px] sm:text-xs text-center", themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600')}>
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
                      <h3 className={cn(
                        "text-xl sm:text-2xl font-bold mb-2 tracking-tight",
                        themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                      )}>
                        Complete Payment
                      </h3>
                      <p className={cn(
                        "text-xs sm:text-sm",
                        themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      )}>
                        Select a payment method to complete your order
                      </p>
                    </div>

                    {/* Order Summary - Enhanced dark mode */}
                    <div className={cn(
                      "p-4 sm:p-5 rounded-2xl border",
                      themeMode === 'dark' 
                        ? "bg-gray-900/80 border-gray-700/50" 
                        : "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg shadow-green-500/10"
                    )}>
                      <div className="text-center mb-3">
                        <p className={cn(
                          "text-[10px] sm:text-xs uppercase tracking-widest font-semibold mb-1",
                          themeMode === 'dark' ? 'text-gray-300' : 'text-gray-500'
                        )}>
                          ORDER TOTAL
                        </p>
                        <p className={cn(
                          "text-3xl sm:text-4xl font-bold tabular-nums",
                          themeMode === 'dark' ? 'text-teal-400' : 'text-green-500'
                        )}>
                          ${formatPrice(totalPrice)}
                        </p>
                      </div>
                      
                      <div className={cn(
                        "pt-3 border-t space-y-2 text-xs sm:text-sm",
                        themeMode === 'dark' ? 'border-gray-700/50' : 'border-green-200'
                      )}>
                        <div className="flex justify-between">
                          <span className={themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Service</span>
                          <span className={cn("font-medium truncate max-w-[180px] sm:max-w-[220px]", themeMode === 'dark' ? 'text-white' : 'text-gray-900')}>
                            {selectedService?.name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Quantity</span>
                          <span className={cn("font-semibold tabular-nums", themeMode === 'dark' ? 'text-white' : 'text-gray-900')}>
                            {quantity.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Link</span>
                          <a
                            href={targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn("font-medium truncate max-w-[180px] sm:max-w-[220px] underline", themeMode === 'dark' ? 'text-teal-400' : 'text-blue-500')}
                          >
                            {targetUrl}
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="space-y-2 sm:space-y-3">
                      <Label className={cn(
                        "font-semibold text-sm",
                        themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                      )}>Payment Method</Label>
                      
                      {loadingPaymentMethods ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : noPaymentGateway ? (
                        <Card className={cn(
                          "border",
                          themeMode === 'dark' 
                            ? "border-amber-500/30 bg-amber-500/5" 
                            : "border-amber-400 bg-amber-50"
                        )}>
                          <CardContent className="p-4 sm:p-6 text-center">
                            <AlertTriangle className={cn(
                              "w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3",
                              themeMode === 'dark' ? 'text-amber-400' : 'text-amber-500'
                            )} />
                            <h3 className={cn("text-base sm:text-lg font-semibold mb-2", themeMode === 'dark' ? 'text-white' : 'text-gray-900')}>
                              No Payment Gateway Available
                            </h3>
                            <p className={cn("text-xs sm:text-sm mb-4", themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600')}>
                              Payment methods are currently being configured. Please contact support for assistance.
                            </p>
                            <Button asChild variant="outline" size="sm" className="gap-2">
                              <Link to="/support">
                                <MessageCircle className="w-4 h-4" />
                                Contact Support
                              </Link>
                            </Button>
                          </CardContent>
                        </Card>
                      ) : (
                        paymentMethods.map((method, index) => {
                          const MethodIcon = method.icon;
                          const isManual = method.id.startsWith('manual_') || method.badge === 'Manual';
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
                                "w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border transition-all",
                                selectedPaymentMethod === method.id
                                  ? themeMode === 'dark'
                                    ? "border-teal-500/50 bg-gray-800 ring-1 ring-teal-500/20"
                                    : "border-blue-500 bg-blue-50 ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/10"
                                  : themeMode === 'dark'
                                    ? "border-gray-700 bg-gray-800/80 hover:border-gray-600"
                                    : "border-gray-200 bg-white hover:border-blue-400 hover:shadow-md"
                              )}
                            >
                              <div className={cn(
                                "p-2 sm:p-2.5 rounded-lg sm:rounded-xl shadow-lg",
                                themeMode === 'dark' && isManual 
                                  ? "bg-gradient-to-br from-teal-500 to-cyan-600" 
                                  : method.color
                              )}>
                                <MethodIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                              </div>
                              <div className="flex-1 text-left">
                              <span className={cn(
                                  "font-semibold text-sm sm:text-base",
                                  themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                                )}>
                                  {method.name}
                                </span>
                                {method.badge && (
                                  <Badge 
                                    variant="secondary" 
                                    className={cn(
                                      "ml-2 text-[9px] px-1.5 py-0 h-4",
                                      themeMode === 'dark' && isManual 
                                        ? "bg-teal-500/20 text-teal-400 border-teal-500/30" 
                                        : ""
                                    )}
                                  >
                                    {method.badge}
                                  </Badge>
                                )}
                              </div>
                              {selectedPaymentMethod === method.id && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className={cn(
                                    "w-5 h-5 rounded-full flex items-center justify-center",
                                    themeMode === 'dark' ? "bg-teal-500" : "bg-blue-500"
                                  )}
                                >
                                  <Check className="w-3 h-3 text-white" />
                                </motion.div>
                              )}
                            </motion.button>
                          );
                        })
                      )}
                    </div>

                    {/* Balance Info - Enhanced dark mode */}
                    {buyer && (
                      <div className={cn(
                        "p-3 rounded-xl border",
                        themeMode === 'dark' ? "bg-gray-800/50 border-gray-700/50" : "bg-gray-50 border-gray-200"
                      )}>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className={themeMode === 'dark' ? 'text-gray-300' : 'text-gray-500'}>Your Balance:</span>
                          <span className={cn("font-semibold tabular-nums", themeMode === 'dark' ? 'text-white' : 'text-gray-900')}>
                            ${(buyer.balance || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Pay Button with glow - Enhanced dark mode with green underline */}
                    {!noPaymentGateway && (
                      <Button
                        className={cn(
                          "w-full h-12 sm:h-14 gap-2 text-base sm:text-lg rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 font-semibold text-white transition-all",
                          themeMode === 'dark' 
                            ? "shadow-lg shadow-green-500/25 border-b-2 border-green-400/40"
                            : "shadow-[0_0_24px_rgba(34,197,94,0.4)] hover:shadow-[0_0_32px_rgba(34,197,94,0.5)]"
                        )}
                        size="lg"
                        onClick={buyer ? handleProcessPayment : handlePlaceOrder}
                        disabled={isProcessingPayment || loadingPaymentMethods}
                      >
                        {isProcessingPayment ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing...
                          </>
                        ) : buyer ? (
                          <>
                            <Lock className="w-5 h-5" />
                            Pay ${formatPrice(totalPrice)} Now
                          </>
                        ) : (
                          <>
                            <Lock className="w-5 h-5" />
                            Checkout ${formatPrice(totalPrice)}
                          </>
                        )}
                      </Button>
                    )}

                    <p className={cn("text-[10px] sm:text-xs text-center flex items-center justify-center gap-1.5", themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600')}>
                      <Lock className="w-3 h-3" />
                      Secure payment • Order will be processed immediately
                    </p>
                  </motion.div>
                )}

                {/* Success Celebration */}
                {showOrderSuccess && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="text-center py-12"
                  >
                    <Confetti isActive={showOrderSuccess} />
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: 'spring', stiffness: 400, damping: 15 }}
                      className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30"
                    >
                      <CheckCircle className="w-10 h-10 text-white" />
                    </motion.div>
                    <motion.h3 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className={cn("text-2xl font-bold mb-2", themeMode === 'dark' ? 'text-white' : 'text-gray-900')}
                    >
                      Order Placed!
                    </motion.h3>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-muted-foreground"
                    >
                      Order #{placedOrderNumber}
                    </motion.p>
                  </motion.div>
                )}

                {/* Step 6: Live Order Tracking */}
                {currentStep === 6 && !showOrderSuccess && placedOrderId && placedOrderNumber && (
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
                      buyerApiKey={buyer?.api_key || undefined}
                      buyerId={buyer?.id}
                      panelId={panelId}
                      onTrackAnother={() => {
                        // Reset all state for new order
                        setCurrentStep(1);
                        setSelectedNetwork('');
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
        <DialogContent className="max-w-[95vw] sm:max-w-md w-full overflow-hidden overflow-x-hidden p-2 xs:p-3 sm:p-6 mx-1 sm:mx-auto max-h-[90vh] overflow-y-auto">
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

          <div className="space-y-4 py-4 w-full overflow-hidden">
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

                {/* Credential Copy Status Indicator */}
                {credentialsCopied.username && credentialsCopied.password ? (
                  <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    <p className="text-xs text-green-700 dark:text-green-400">
                      <strong>You're now logged in!</strong> Proceed to payment.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      <strong>Important:</strong> You must copy BOTH your username and password before continuing.
                      {!credentialsCopied.username && !credentialsCopied.password && ' (0/2 copied)'}
                      {credentialsCopied.username && !credentialsCopied.password && ' (1/2 - copy password)'}
                      {!credentialsCopied.username && credentialsCopied.password && ' (1/2 - copy username)'}
                    </p>
                  </div>
                )}

                <Button 
                  className={cn(
                    "w-full h-12 text-base transition-all",
                    credentialsCopied.username && credentialsCopied.password
                      ? "bg-blue-500 hover:bg-blue-600"
                      : "bg-gray-400 cursor-not-allowed opacity-60"
                  )}
                  onClick={handleContinueToPayment}
                  disabled={!credentialsCopied.username || !credentialsCopied.password}
                >
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
                <div className="space-y-2 w-full">
                  <Label>Email *</Label>
                  <div className="relative w-full overflow-hidden">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="pl-10 w-full box-border focus-visible:ring-offset-0 focus-visible:ring-1"
                    />
                  </div>
                </div>
                <div className="space-y-2 w-full">
                  <Label>Name (Optional)</Label>
                  <div className="relative w-full overflow-hidden">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                    <Input
                      type="text"
                      placeholder="Your name"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="pl-10 w-full box-border focus-visible:ring-offset-0 focus-visible:ring-1"
                    />
                  </div>
                </div>

                {selectedService && (
                  <div className="p-3 bg-muted/50 rounded-lg w-full overflow-hidden">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground shrink-0">Service:</span>
                      <span className="font-medium truncate ml-2 max-w-[60%]">{selectedService.name}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-muted-foreground">Quantity:</span>
                      <span className="font-medium tabular-nums">{quantity.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1 pt-1 border-t">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-bold text-blue-500 tabular-nums">${formatPrice(totalPrice)}</span>
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full max-w-full bg-blue-500 hover:bg-blue-600" 
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
