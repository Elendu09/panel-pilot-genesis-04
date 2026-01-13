import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  Globe, 
  Palette, 
  CreditCard, 
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Loader2,
  Settings,
  Rocket
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { OnboardingPlanSelector } from '@/components/onboarding/OnboardingPlanSelector';
import { OnboardingPaymentStep } from '@/components/onboarding/OnboardingPaymentStep';
import { OnboardingDomainStep } from '@/components/onboarding/OnboardingDomainStep';

const PanelOnboardingV2 = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkingPanel, setCheckingPanel] = useState(true);
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Form state
  const [panelName, setPanelName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'basic' | 'pro'>('free');
  const [domainType, setDomainType] = useState<'subdomain' | 'custom'>('subdomain');
  const [subdomain, setSubdomain] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);
  const [checkingSubdomain, setCheckingSubdomain] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#6366F1');
  const [secondaryColor, setSecondaryColor] = useState('#8B5CF6');
  const [createdPanelId, setCreatedPanelId] = useState<string | null>(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [loadingProgress, setLoadingProgress] = useState(false);

  const steps = [
    { id: 0, title: 'Basic Info', icon: Settings, description: 'Name your panel' },
    { id: 1, title: 'Choose Plan', icon: CreditCard, description: 'Select subscription' },
    ...(selectedPlan !== 'free' && !paymentCompleted 
      ? [{ id: 2, title: 'Payment', icon: CreditCard, description: 'Complete payment' }] 
      : []
    ),
    { id: selectedPlan !== 'free' && !paymentCompleted ? 3 : 2, title: 'Domain', icon: Globe, description: 'Setup URL' },
    { id: selectedPlan !== 'free' && !paymentCompleted ? 4 : 3, title: 'Branding', icon: Palette, description: 'Customize colors' },
    { id: selectedPlan !== 'free' && !paymentCompleted ? 5 : 4, title: 'Complete', icon: Rocket, description: 'Launch panel' },
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  useEffect(() => {
    const checkExistingPanel = async () => {
      if (!user || !profile) {
        setCheckingPanel(false);
        return;
      }
      
      if (profile.role !== 'panel_owner') {
        navigate('/auth');
        return;
      }
      
      try {
        // Check for completed panel
        const { data: existingPanel } = await supabase
          .from('panels')
          .select('*')
          .eq('owner_id', profile.id)
          .eq('onboarding_completed', true)
          .maybeSingle();
          
        if (existingPanel) {
          navigate('/panel');
          return;
        }

        // Check for incomplete onboarding to resume
        const { data: incompletePanel } = await supabase
          .from('panels')
          .select('onboarding_step, onboarding_data, default_currency')
          .eq('owner_id', profile.id)
          .eq('onboarding_completed', false)
          .maybeSingle();

        if (incompletePanel) {
          const savedStep = incompletePanel.onboarding_step || 0;
          const savedData = incompletePanel.onboarding_data as Record<string, any> | null;
          
          if (savedStep > 0) {
            setCurrentStep(savedStep);
            // Mark previous steps as completed
            setCompletedSteps(Array.from({ length: savedStep }, (_, i) => i));
          }
          
          if (savedData) {
            if (savedData.panelName) setPanelName(savedData.panelName);
            if (savedData.description) setDescription(savedData.description);
            if (savedData.selectedPlan) setSelectedPlan(savedData.selectedPlan);
            if (savedData.subdomain) setSubdomain(savedData.subdomain);
            if (savedData.customDomain) setCustomDomain(savedData.customDomain);
            if (savedData.domainType) setDomainType(savedData.domainType);
            if (savedData.primaryColor) setPrimaryColor(savedData.primaryColor);
            if (savedData.secondaryColor) setSecondaryColor(savedData.secondaryColor);
            if (savedData.paymentCompleted) setPaymentCompleted(savedData.paymentCompleted);
          }
          
          if (incompletePanel.default_currency) {
            setCurrency(incompletePanel.default_currency);
          }
        }
      } catch (error) {
        console.error('Error checking panel:', error);
      } finally {
        setCheckingPanel(false);
      }
    };
    
    checkExistingPanel();
  }, [user, profile, navigate]);

  // Auto-generate subdomain from panel name
  useEffect(() => {
    if (panelName && !subdomain) {
      const generated = panelName.toLowerCase().replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
      setSubdomain(generated);
      if (generated.length >= 3) {
        checkSubdomainAvailability(generated);
      }
    }
  }, [panelName]);

  const checkSubdomainAvailability = async (subdomainToCheck: string) => {
    if (!subdomainToCheck || subdomainToCheck.length < 3) {
      setSubdomainAvailable(null);
      return;
    }

    setCheckingSubdomain(true);
    try {
      const { data } = await supabase
        .from('panels')
        .select('subdomain')
        .eq('subdomain', subdomainToCheck)
        .maybeSingle();

      setSubdomainAvailable(!data);
    } catch (error) {
      console.error('Error checking subdomain:', error);
      setSubdomainAvailable(null);
    } finally {
      setCheckingSubdomain(false);
    }
  };

  const handleSubdomainChange = (value: string) => {
    const cleanValue = value.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
    setSubdomain(cleanValue);
    
    if (cleanValue.length >= 3) {
      const timeoutId = setTimeout(() => {
        checkSubdomainAvailability(cleanValue);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setSubdomainAvailable(null);
    }
  };

  const markStepComplete = (step: number) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps(prev => [...prev, step]);
    }
  };

  // Save progress to database
  const saveProgress = async (step: number) => {
    if (!profile?.id) return;
    
    const progressData = {
      panelName, description, selectedPlan, subdomain, customDomain, 
      domainType, primaryColor, secondaryColor, paymentCompleted
    };

    try {
      await supabase.from('panels').upsert({
        owner_id: profile.id,
        name: panelName || 'My Panel',
        subdomain: subdomain || 'temp-' + profile.id.slice(0, 8),
        onboarding_step: step,
        onboarding_data: progressData,
        default_currency: currency,
        onboarding_completed: false,
        status: 'pending'
      }, { onConflict: 'owner_id' });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const handleNext = async () => {
    if (currentStep === 0 && !panelName.trim()) {
      toast({ variant: "destructive", title: "Panel name required" });
      return;
    }
    
    markStepComplete(currentStep);
    const nextStep = currentStep + 1;
    
    if (nextStep < steps.length) {
      setCurrentStep(nextStep);
      await saveProgress(nextStep);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePaymentSuccess = () => {
    setPaymentCompleted(true);
    markStepComplete(currentStep);
    setCurrentStep(currentStep + 1);
  };

  const handleComplete = async () => {
    if (!panelName.trim()) {
      toast({ variant: "destructive", title: "Panel name required" });
      return;
    }

    markStepComplete(currentStep);
    setLoading(true);

    try {
      const finalSubdomain = domainType === 'subdomain' 
        ? subdomain 
        : panelName.toLowerCase().replace(/[^a-zA-Z0-9]/g, '').substring(0, 20) || 'panel';

      const { data: panelData, error } = await supabase
        .from('panels')
        .insert([
          {
            name: panelName,
            description: description || null,
            owner_id: profile?.id,
            status: 'active',
            is_approved: true,
            theme_type: 'dark_gradient',
            subdomain: finalSubdomain,
            custom_domain: domainType === 'custom' ? customDomain : null,
            primary_color: primaryColor,
            secondary_color: secondaryColor,
            subscription_tier: selectedPlan,
            subscription_status: 'active',
            onboarding_completed: true
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Create panel settings
      if (panelData) {
        await supabase
          .from('panel_settings')
          .insert([
            {
              panel_id: panelData.id,
              seo_title: `${panelName} - SMM Services`,
              seo_description: description || `Professional SMM services from ${panelName}`,
              seo_keywords: 'SMM, social media marketing, services'
            }
          ]);
      }

      toast({
        title: "Panel Created! 🎉",
        description: selectedPlan === 'free' 
          ? "Your subdomain is live now!" 
          : "Your panel is ready. Complete DNS setup for custom domain."
      });

      navigate('/panel');
    } catch (error: any) {
      console.error('Error creating panel:', error);
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: error.message || "Failed to create your panel."
      });
    } finally {
      setLoading(false);
    }
  };

  const stepVariants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  if (checkingPanel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const renderStepContent = () => {
    const stepTitle = steps[currentStep]?.title;

    switch (stepTitle) {
      case 'Basic Info':
        return (
          <motion.div
            key="basic-info"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="panelName">Panel Name *</Label>
              <Input
                id="panelName"
                value={panelName}
                onChange={(e) => setPanelName(e.target.value)}
                placeholder="My SMM Business"
                className="bg-background/50"
              />
              <p className="text-sm text-muted-foreground">
                This will be displayed as your brand name
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Professional SMM services..."
                rows={3}
                className="bg-background/50"
              />
            </div>
          </motion.div>
        );

      case 'Choose Plan':
        return (
          <motion.div
            key="choose-plan"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <OnboardingPlanSelector
              selectedPlan={selectedPlan}
              onSelectPlan={setSelectedPlan}
            />
          </motion.div>
        );

      case 'Payment':
        return (
          <motion.div
            key="payment"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <OnboardingPaymentStep
              selectedPlan={selectedPlan as 'basic' | 'pro'}
              panelId={createdPanelId || undefined}
              onPaymentSuccess={handlePaymentSuccess}
              onSkip={() => {
                setSelectedPlan('free');
                setPaymentCompleted(true);
                handleNext();
              }}
            />
          </motion.div>
        );

      case 'Domain':
        return (
          <motion.div
            key="domain"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <OnboardingDomainStep
              selectedPlan={selectedPlan}
              panelName={panelName}
              subdomain={subdomain}
              customDomain={customDomain}
              domainType={domainType}
              onSubdomainChange={handleSubdomainChange}
              onCustomDomainChange={setCustomDomain}
              onDomainTypeChange={setDomainType}
              subdomainAvailable={subdomainAvailable}
              checkingSubdomain={checkingSubdomain}
              currency={currency}
              onCurrencyChange={setCurrency}
            />
          </motion.div>
        );

      case 'Branding':
        return (
          <motion.div
            key="branding"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Brand Colors</h2>
              <p className="text-muted-foreground">Customize your panel's look</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Primary Color</Label>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-12 h-12 rounded-xl border-2 border-border cursor-pointer overflow-hidden"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="bg-background/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Secondary Color</Label>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-12 h-12 rounded-xl border-2 border-border cursor-pointer overflow-hidden"
                    style={{ backgroundColor: secondaryColor }}
                  >
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <Input
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="bg-background/50"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border">
              <p className="text-sm text-muted-foreground mb-3">Preview</p>
              <div 
                className="h-24 rounded-xl flex items-center justify-center text-white font-bold text-xl"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
              >
                {panelName || 'Your Panel'}
              </div>
            </div>
          </motion.div>
        );

      case 'Complete':
        return (
          <motion.div
            key="complete"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-6 text-center"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-2">Ready to Launch! 🚀</h2>
              <p className="text-muted-foreground">
                Your panel "{panelName}" is ready to go live
              </p>
            </div>

            <Card className="bg-card/60 text-left">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span>Plan: <strong className="capitalize">{selectedPlan}</strong></span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span>
                    Domain: <strong>
                      {domainType === 'subdomain' 
                        ? `${subdomain}.homeofsmm.com` 
                        : customDomain || `${subdomain}.homeofsmm.com`
                      }
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span>Branding configured</span>
                </div>
              </CardContent>
            </Card>

            <Button 
              className="w-full gap-2" 
              size="lg"
              onClick={handleComplete}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Panel...
                </>
              ) : (
                <>
                  Launch My Panel
                  <Rocket className="w-4 h-4" />
                </>
              )}
            </Button>
          </motion.div>
        );

      default:
        return null;
    }
  };

  const isLastStep = currentStep === steps.length - 1;
  const isPaymentStep = steps[currentStep]?.title === 'Payment';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      <Helmet>
        <title>Create Your Panel | HOME OF SMM</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="container max-w-3xl mx-auto px-4 py-8">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Create Your Panel</h1>
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          
          {/* Step Indicators */}
          <div className="flex justify-between mt-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = completedSteps.includes(index);
              const isCurrent = currentStep === index;
              
              return (
                <div 
                  key={step.id} 
                  className={cn(
                    "flex flex-col items-center gap-1",
                    isCurrent && "text-primary",
                    isCompleted && "text-emerald-500",
                    !isCurrent && !isCompleted && "text-muted-foreground"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors",
                    isCurrent && "border-primary bg-primary/10",
                    isCompleted && "border-emerald-500 bg-emerald-500/10",
                    !isCurrent && !isCompleted && "border-muted"
                  )}>
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-xs hidden sm:block">{step.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <Card className="bg-card/60 backdrop-blur-xl border-border/50">
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              {renderStepContent()}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        {!isLastStep && !isPaymentStep && (
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Button onClick={handleNext} className="gap-2">
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PanelOnboardingV2;
