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
import { Zap, ArrowRight, Lock, Loader2, Mail, User, CheckCircle, Check, ChevronRight } from 'lucide-react';
import { SOCIAL_ICONS_MAP } from '@/components/icons/SocialIcons';
import { motion, AnimatePresence } from 'framer-motion';
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

interface FastOrderSectionProps {
  services: Service[];
  panelId: string;
  panelName: string;
  customization?: any;
}

// Step indicator with visual progress bar
const StepIndicator = ({ currentStep, selectedCategory }: { currentStep: number; selectedCategory?: string }) => {
  const steps = [
    { num: 1, label: 'Category', icon: '📱' },
    { num: 2, label: 'Service', icon: '⚡' },
    { num: 3, label: 'Details', icon: '📝' },
    { num: 4, label: 'Order', icon: '✨' },
  ];

  return (
    <div className="relative mb-8">
      {/* Progress bar background */}
      <div className="absolute top-5 left-[10%] right-[10%] h-1 bg-muted rounded-full" />
      
      {/* Active progress bar */}
      <motion.div 
        className="absolute top-5 left-[10%] h-1 bg-gradient-to-r from-primary to-green-500 rounded-full"
        initial={{ width: '0%' }}
        animate={{ width: `${Math.min((currentStep - 1) * 26.66, 80)}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
      
      <div className="relative flex items-center justify-between px-4 sm:px-8">
        {steps.map((step) => (
          <div key={step.num} className="flex flex-col items-center z-10">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ 
                scale: currentStep === step.num ? 1.15 : 1,
                transition: { duration: 0.3, type: 'spring' }
              }}
              className={cn(
                "flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full text-lg transition-all duration-300 shadow-lg",
                currentStep > step.num 
                  ? "bg-green-500 text-white" 
                  : currentStep === step.num 
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/30" 
                    : "bg-muted text-muted-foreground"
              )}
            >
              {currentStep > step.num ? (
                <Check className="w-5 h-5" />
              ) : (
                <span>{step.icon}</span>
              )}
            </motion.div>
            <span className={cn(
              "mt-2 text-xs font-medium transition-colors text-center",
              currentStep >= step.num ? "text-foreground" : "text-muted-foreground"
            )}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const FastOrderSection = ({ services, panelId, panelName, customization }: FastOrderSectionProps) => {
  const themeMode = customization?.themeMode || 'dark';
  const textColor = customization?.textColor || (themeMode === 'dark' ? '#FFFFFF' : '#1F2937');
  const textMuted = customization?.textMuted || (themeMode === 'dark' ? '#A1A1AA' : '#4B5563');
  const cardBg = themeMode === 'dark' ? 'bg-slate-900/80 border-white/10' : 'bg-white shadow-md border-gray-200';
  const inputBg = themeMode === 'dark' ? 'bg-slate-800/50 border-white/10' : 'bg-gray-50 border-gray-200';
  const navigate = useNavigate();
  const { buyer, refreshBuyer, login } = useBuyerAuth();
  
  // Step state
  const [currentStep, setCurrentStep] = useState(1);
  
  // Order form state
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [targetUrl, setTargetUrl] = useState('');
  const [quantity, setQuantity] = useState(1000);
  const [isOrdering, setIsOrdering] = useState(false);
  
  // Guest signup modal state
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestPassword, setGuestPassword] = useState('');
  const [isGuestSignup, setIsGuestSignup] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);
  const [tempPassword, setTempPassword] = useState('');

  // Get unique categories from services
  const categories = [...new Set(services.map(s => s.category))];
  
  // Get services for selected category
  const categoryServices = selectedCategory 
    ? services.filter(s => s.category === selectedCategory)
    : [];
  
  const selectedService = services.find(s => s.id === selectedServiceId);
  const totalPrice = selectedService ? (selectedService.price * quantity) / 1000 : 0;

  const getCategoryIcon = (category: string) => {
    return SOCIAL_ICONS_MAP[category] || SOCIAL_ICONS_MAP.other;
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
        setAccountCreated(true);
        
        localStorage.setItem('buyer_session', JSON.stringify({
          buyerId: data.user.id,
          panelId,
        }));
        
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

  const handlePlaceOrder = async () => {
    if (!buyer) {
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
    if (selectedService) {
      localStorage.setItem('pending_order', JSON.stringify({
        serviceId: selectedServiceId,
        serviceName: selectedService.name,
        quantity,
        targetUrl,
        price: totalPrice,
        panelId,
      }));
    }
    setShowGuestModal(false);
    navigate('/deposit');
  };

  // Reset to step 1
  const resetToStep = (step: number) => {
    if (step < currentStep) {
      setCurrentStep(step);
      if (step < 2) {
        setSelectedCategory('');
        setSelectedServiceId('');
      }
      if (step < 3) {
        setSelectedServiceId('');
      }
    }
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
            className="text-center mb-8"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Zap className="w-3 h-3 mr-1" />
              Fast Order
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: textColor }}>
              Order in 4 Simple Steps
            </h2>
            <p className="max-w-2xl mx-auto" style={{ color: textMuted }}>
              Select your platform, choose a service, and boost your social presence instantly
            </p>
          </motion.div>

          {/* Step Indicator */}
          <StepIndicator currentStep={currentStep} selectedCategory={selectedCategory} />

          <div className="max-w-4xl mx-auto">
            <Card className={`backdrop-blur-xl border ${cardBg}`}>
              <CardContent className="p-6 md:p-8">
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
                        <h3 className="text-xl font-bold mb-2" style={{ color: textColor }}>
                          Select a Category 👆
                        </h3>
                        <p className="text-sm" style={{ color: textMuted }}>
                          Choose the platform you want to boost
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 md:gap-4">
                        {categories.map((category) => {
                          const categoryData = getCategoryIcon(category);
                          const CategoryIcon = categoryData.icon;
                          const serviceCount = services.filter(s => s.category === category).length;
                          
                          return (
                            <motion.button
                              key={category}
                              whileHover={{ scale: 1.05, y: -2 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleCategorySelect(category)}
                              className={cn(
                                "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200",
                                themeMode === 'dark'
                                  ? "border-white/10 bg-slate-800/50 hover:bg-slate-800 hover:border-primary/50"
                                  : "border-gray-200 bg-white hover:bg-gray-50 hover:border-primary/50 shadow-sm"
                              )}
                            >
                              <div className={cn("p-3 rounded-xl", categoryData.bgColor)}>
                                <CategoryIcon className="w-6 h-6 text-white" size={24} />
                              </div>
                              <span className="text-sm font-medium capitalize" style={{ color: textColor }}>
                                {category}
                              </span>
                              <span className="text-xs" style={{ color: textMuted }}>
                                {serviceCount} services
                              </span>
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
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold mb-1" style={{ color: textColor }}>
                            Choose a Service
                          </h3>
                          <p className="text-sm" style={{ color: textMuted }}>
                            {categoryServices.length} services available for{' '}
                            <span className="capitalize font-medium text-primary">{selectedCategory}</span>
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => resetToStep(1)}>
                          Change Category
                        </Button>
                      </div>
                      
                      <Select value={selectedServiceId} onValueChange={handleServiceSelect}>
                        <SelectTrigger className={cn("h-14 text-left", inputBg)}>
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
                      <div className="grid grid-cols-2 gap-3">
                        {categoryServices.slice(0, 4).map((service) => (
                          <motion.button
                            key={service.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleServiceSelect(service.id)}
                            className={cn(
                              "p-3 rounded-lg border text-left transition-all",
                              selectedServiceId === service.id
                                ? "border-primary bg-primary/10"
                                : themeMode === 'dark'
                                  ? "border-white/10 bg-slate-800/50 hover:border-primary/30"
                                  : "border-gray-200 bg-gray-50 hover:border-primary/30"
                            )}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-lg font-bold text-primary">${service.price.toFixed(4)}</span>
                              {selectedServiceId === service.id && <Check className="w-4 h-4 text-primary" />}
                            </div>
                            <p className="text-xs line-clamp-2" style={{ color: textMuted }}>
                              {service.name}
                            </p>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Enter Details */}
                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold mb-1" style={{ color: textColor }}>
                            Enter Order Details
                          </h3>
                          <p className="text-sm" style={{ color: textMuted }}>
                            {selectedService?.name}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => resetToStep(2)}>
                          Change Service
                        </Button>
                      </div>
                      
                      {/* Target URL */}
                      <div className="space-y-2">
                        <Label style={{ color: textColor }}>Link / Username *</Label>
                        <Input
                          placeholder="https://instagram.com/yourprofile"
                          value={targetUrl}
                          onChange={(e) => setTargetUrl(e.target.value)}
                          className={cn("h-12", inputBg)}
                        />
                      </div>

                      {/* Quantity */}
                      <div className="space-y-2">
                        <Label style={{ color: textColor }}>Quantity</Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {quantityPresets.map((preset) => (
                            <Button
                              key={preset}
                              type="button"
                              variant={quantity === preset ? "default" : "outline"}
                              size="sm"
                              onClick={() => setQuantity(preset)}
                              className="min-w-[60px]"
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
                          className={inputBg}
                        />
                        {selectedService && (
                          <p className="text-xs" style={{ color: textMuted }}>
                            Min: {selectedService.min_quantity || 100} | Max: {(selectedService.max_quantity || 10000).toLocaleString()}
                          </p>
                        )}
                      </div>

                      {/* Price Preview */}
                      <div className={cn(
                        "p-4 rounded-xl border",
                        themeMode === 'dark' ? "bg-slate-800/50 border-white/10" : "bg-gray-50 border-gray-200"
                      )}>
                        <div className="flex justify-between items-center">
                          <span style={{ color: textMuted }}>Estimated Total</span>
                          <span className="text-2xl font-bold text-primary">${totalPrice.toFixed(2)}</span>
                        </div>
                      </div>

                      <Button
                        className="w-full h-12 gap-2"
                        onClick={handleDetailsConfirmed}
                        disabled={!targetUrl.trim()}
                      >
                        Continue to Order
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  )}

                  {/* Step 4: Review & Order */}
                  {currentStep === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-6"
                    >
                      <div className="text-center">
                        <h3 className="text-xl font-bold mb-2" style={{ color: textColor }}>
                          Review & Place Order ✨
                        </h3>
                        <p className="text-sm" style={{ color: textMuted }}>
                          Confirm your order details below
                        </p>
                      </div>
                      
                      {/* Order Summary */}
                      <div className={cn(
                        "p-5 rounded-xl border space-y-4",
                        themeMode === 'dark' ? "bg-slate-800/50 border-white/10" : "bg-gray-50 border-gray-200"
                      )}>
                        <div className="flex justify-between items-start">
                          <span style={{ color: textMuted }}>Service</span>
                          <span className="text-right font-medium max-w-[200px] truncate" style={{ color: textColor }}>
                            {selectedService?.name}
                          </span>
                        </div>
                        <div className="flex justify-between items-start">
                          <span style={{ color: textMuted }}>Category</span>
                          <span className="capitalize font-medium" style={{ color: textColor }}>
                            {selectedCategory}
                          </span>
                        </div>
                        <div className="flex justify-between items-start">
                          <span style={{ color: textMuted }}>Link</span>
                          <span className="text-right font-medium max-w-[200px] truncate text-primary">
                            {targetUrl}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span style={{ color: textMuted }}>Quantity</span>
                          <span className="font-medium" style={{ color: textColor }}>
                            {quantity.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span style={{ color: textMuted }}>Price per 1K</span>
                          <span className="font-medium" style={{ color: textColor }}>
                            ${selectedService?.price.toFixed(4)}
                          </span>
                        </div>
                        <div className="pt-3 border-t border-dashed flex justify-between items-center">
                          <span className="font-semibold" style={{ color: textColor }}>Total</span>
                          <span className="text-3xl font-bold text-primary">${totalPrice.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => resetToStep(3)}
                        >
                          Edit Details
                        </Button>
                        <Button
                          className="flex-1 gap-2"
                          size="lg"
                          onClick={handlePlaceOrder}
                          disabled={isOrdering}
                        >
                          {isOrdering ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Lock className="w-4 h-4" />
                          )}
                          {buyer ? 'Place Order' : 'Checkout'}
                        </Button>
                      </div>
                      
                      {!buyer && (
                        <p className="text-xs text-center" style={{ color: textMuted }}>
                          Quick signup - no password required to get started
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
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
