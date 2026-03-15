import { useState, useEffect, useRef } from 'react';
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
  Rocket,
  Search,
  AlertCircle,
  FileText,
  Wand2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { OnboardingPlanSelector } from '@/components/onboarding/OnboardingPlanSelector';
import { OnboardingPaymentStep } from '@/components/onboarding/OnboardingPaymentStep';
import { OnboardingDomainStep } from '@/components/onboarding/OnboardingDomainStep';
import { ThemeMiniPreview } from '@/components/design/ThemeMiniPreview';
import { SEO_DESC_PX_RANGE, SEO_TITLE_PX_RANGE, isInRange, measureTextPx, clampToPx, generateSeoMeta } from '@/lib/seo-metrics';
import { getThemeDefaultAnimationStyle } from '@/components/buyer-themes/shared/AnimatedHeroText';

// Fixed step definitions - NEVER change this array dynamically
const STEP_KEYS = {
  BASIC_INFO: 'basic-info',
  PLAN: 'plan',
  PAYMENT: 'payment',
  DOMAIN: 'domain',
  THEME: 'theme',
  SEO: 'seo',
  COMPLETE: 'complete'
} as const;

const PanelOnboardingV2 = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkingPanel, setCheckingPanel] = useState(true);
  const [restoringState, setRestoringState] = useState(true);
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
  const [selectedTheme, setSelectedTheme] = useState<'default' | 'alipanel' | 'flysmm' | 'smmstay' | 'tgref' | 'smmvisit'>('default');
  const [brandingMode, setBrandingMode] = useState<'preset' | 'custom'>('preset');
  const [primaryColor, setPrimaryColor] = useState('#6366F1');
  const [secondaryColor, setSecondaryColor] = useState('#8B5CF6');
  const [createdPanelId, setCreatedPanelId] = useState<string | null>(null);
  const createdPanelIdRef = useRef<string | null>(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [trialStarted, setTrialStarted] = useState(false);
  const [trialSlideUnlocked, setTrialSlideUnlocked] = useState(false);
  const [trialPlan, setTrialPlan] = useState<'basic' | 'pro' | null>(null);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [verificationSecondsLeft, setVerificationSecondsLeft] = useState(0);
  const [verificationTimedOut, setVerificationTimedOut] = useState(false);
  const verificationPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const verificationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [currency, setCurrency] = useState('USD');
  const [domainVerificationState, setDomainVerificationState] = useState<{ step: 'configure' | 'txt-pending' | 'dns-pending' | 'verified'; token: string | null }>({ step: 'configure', token: null });
  
  // SEO state
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [generatingSeo, setGeneratingSeo] = useState(false);

  // Theme presets with actual preview data matching ThemeMiniPreview
  const themePresets = [
    { key: 'default' as const, name: 'Modern Default', description: 'Clean purple gradient', colors: ['#0F172A', '#6366F1', '#8B5CF6'] },
    { key: 'alipanel' as const, name: 'AliPanel', description: 'Neon glow glassmorphism', colors: ['#0A0A0F', '#FF4081', '#8B5CF6'] },
    { key: 'flysmm' as const, name: 'FlySMM', description: 'Light professional', colors: ['#F8FAFC', '#2196F3', '#1976D2'] },
    { key: 'smmstay' as const, name: 'SMMStay', description: 'Dark neon pink', colors: ['#000000', '#FF4081', '#E040FB'] },
    { key: 'tgref' as const, name: 'TGRef', description: 'Terminal hacker green', colors: ['#1A1B26', '#00D4AA', '#0EA5E9'] },
    { key: 'smmvisit' as const, name: 'SMMVisit', description: 'Elegant gold accent', colors: ['#F5F5F5', '#FFD700', '#1A1A1A'] },
  ];

  // Fixed 7-step flow (0-6), payment is conditional but index stays fixed
  const allSteps = [
    { id: 0, key: STEP_KEYS.BASIC_INFO, title: 'Basic Info', icon: FileText, description: 'Name your panel' },
    { id: 1, key: STEP_KEYS.PLAN, title: 'Choose Plan', icon: CreditCard, description: 'Select subscription' },
    { id: 2, key: STEP_KEYS.PAYMENT, title: 'Payment', icon: CreditCard, description: 'Complete payment', conditional: true },
    { id: 3, key: STEP_KEYS.DOMAIN, title: 'Domain', icon: Globe, description: 'Setup URL' },
    { id: 4, key: STEP_KEYS.THEME, title: 'Theme & Style', icon: Palette, description: 'Choose look & feel' },
    { id: 5, key: STEP_KEYS.SEO, title: 'SEO', icon: Search, description: 'Optimize search' },
    { id: 6, key: STEP_KEYS.COMPLETE, title: 'Complete', icon: Rocket, description: 'Launch panel' },
  ];

  // Filter steps to show (hide payment if free plan, but always show if on payment step)
  const shouldShowPaymentStep = selectedPlan !== 'free';
  const visibleSteps = allSteps.filter(step => 
    step.key !== STEP_KEYS.PAYMENT || shouldShowPaymentStep
  );

  // Get current step by actual index in allSteps
  const currentStepData = allSteps[currentStep];
  const currentStepKey = currentStepData?.key;
  
  // Progress based on visible steps — handle case where current step is hidden (e.g. payment step removed after success)
  const rawVisibleStepIndex = visibleSteps.findIndex(s => s.id === currentStep);
  const fallbackIndex = visibleSteps.findIndex(s => s.id > currentStep);
  const visibleStepIndex = rawVisibleStepIndex >= 0 
    ? rawVisibleStepIndex 
    : fallbackIndex >= 0 
      ? fallbackIndex 
      : visibleSteps.length - 1; // If on last step and it's hidden, show last visible
  const progress = ((visibleStepIndex + 1) / visibleSteps.length) * 100;

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
        // If creating a new additional panel, skip the redirect check
        const params = new URLSearchParams(window.location.search);
        const isNewPanel = params.get('new') === 'true';
        
        if (isNewPanel) {
          setCheckingPanel(false);
          setRestoringState(false);
          return;
        }

        // FIRST check for incomplete panels — resume them instead of redirecting
        // This prevents the loop: completed panel → /panel → incomplete exists → /onboarding → completed found → /panel
        const { data: incompletePanel } = await supabase
          .from('panels')
          .select('id, onboarding_step, onboarding_data, default_currency, subscription_status')
          .eq('owner_id', profile.id)
          .eq('onboarding_completed', false)
          .order('created_at', { ascending: false })
          .maybeSingle();

        if (incompletePanel) {
          setCreatedPanelId(incompletePanel.id);
          createdPanelIdRef.current = incompletePanel.id;
          const savedStep = incompletePanel.onboarding_step || 0;
          const savedData = incompletePanel.onboarding_data as Record<string, any> | null;
          
          if (savedStep > 0) {
            setCurrentStep(savedStep);
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
            if (savedData.trialStarted) setTrialStarted(savedData.trialStarted);
            if (savedData.trialPlan) setTrialPlan(savedData.trialPlan);
            if (savedData.selectedTheme) setSelectedTheme(savedData.selectedTheme);
            if (savedData.brandingMode) setBrandingMode(savedData.brandingMode);
            if (savedData.seoTitle) setSeoTitle(savedData.seoTitle);
            if (savedData.seoDescription) setSeoDescription(savedData.seoDescription);
            if (savedData.seoKeywords) setSeoKeywords(savedData.seoKeywords);
            // Restore domain verification state
            if (savedData.domainVerificationStep) {
              setDomainVerificationState({
                step: savedData.domainVerificationStep,
                token: savedData.domainVerificationToken || null
              });
            }
          }
          
          // If subscription is already active, mark payment as completed. If trial, mark trial.
          if (incompletePanel.subscription_status === 'active') {
            setPaymentCompleted(true);
          } else if (incompletePanel.subscription_status === 'trial') {
            setTrialStarted(true);
          }
          
          if (incompletePanel.default_currency) {
            setCurrency(incompletePanel.default_currency);
          }
        } else {
          // No incomplete panel — check if all panels are completed
          const { data: completedPanels } = await supabase
            .from('panels')
            .select('id')
            .eq('owner_id', profile.id)
            .eq('onboarding_completed', true)
            .limit(1);
            
          if (completedPanels && completedPanels.length > 0) {
            navigate('/panel');
            return;
          }
        }
      } catch (error) {
        console.error('Error checking panel:', error);
      } finally {
        setCheckingPanel(false);
        setRestoringState(false);
      }
    };
    
    checkExistingPanel();
  }, [user, profile, navigate]);

  // Detect payment=success return from gateway — runs immediately
  // Flutterwave returns URLs like ?payment=success?success=true&transaction_id=...
  // The double ? means URLSearchParams gives us "success?success=true&..." for payment param
  // Cancel payment verification
  const cancelPaymentVerification = () => {
    if (verificationPollRef.current) clearInterval(verificationPollRef.current);
    if (verificationTimerRef.current) clearInterval(verificationTimerRef.current);
    verificationPollRef.current = null;
    verificationTimerRef.current = null;
    setIsVerifyingPayment(false);
    setVerificationSecondsLeft(0);
    toast({ title: 'Verification Cancelled', description: 'You can now change your plan or retry payment.' });
  };

  // Start payment verification polling with countdown
  const startPaymentVerification = (txId: string | null) => {
    setIsVerifyingPayment(true);
    setVerificationSecondsLeft(30);
    setCurrentStep(2);

    // Countdown timer
    verificationTimerRef.current = setInterval(() => {
      setVerificationSecondsLeft(prev => {
        if (prev <= 1) {
          if (verificationTimerRef.current) clearInterval(verificationTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Polling (6 attempts, 5s intervals)
    let attempts = 0;
    verificationPollRef.current = setInterval(async () => {
      attempts++;
      let confirmed = false;

      // Check transaction status if we have the ID
      if (txId) {
        const { data: txData } = await supabase
          .from('transactions')
          .select('status')
          .or(`id.eq.${txId},payment_id.eq.${txId}`)
          .maybeSingle();
        if (txData?.status === 'completed') confirmed = true;
      }

      // Also check panel subscription status
      if (!confirmed && createdPanelIdRef.current) {
        const { data: panelData } = await supabase
          .from('panels')
          .select('subscription_status, subscription_tier, onboarding_data')
          .eq('id', createdPanelIdRef.current)
          .single();
        if (panelData?.subscription_status === 'active') {
          confirmed = true;
          if (panelData.subscription_tier) {
            setSelectedPlan(panelData.subscription_tier as 'free' | 'basic' | 'pro');
          }
        }
      }

      if (confirmed) {
        if (verificationPollRef.current) clearInterval(verificationPollRef.current);
        if (verificationTimerRef.current) clearInterval(verificationTimerRef.current);
        verificationPollRef.current = null;
        verificationTimerRef.current = null;
        setIsVerifyingPayment(false);
        setVerificationSecondsLeft(0);
        setPaymentCompleted(true);
        setTrialStarted(false);
        markStepComplete(2);
        toast({ title: 'Payment Successful', description: 'Your subscription payment has been confirmed.' });
        // Persist to DB
        if (createdPanelIdRef.current) {
          const { data: panelInfo } = await supabase.from('panels').select('onboarding_data').eq('id', createdPanelIdRef.current).single();
          const existingData = (panelInfo?.onboarding_data as Record<string, any>) || {};
          await supabase.from('panels').update({
            onboarding_data: { ...existingData, paymentCompleted: true, trialStarted: false },
            subscription_status: 'active',
          }).eq('id', createdPanelIdRef.current);
        }
      }

      if (attempts >= 6) {
        if (verificationPollRef.current) clearInterval(verificationPollRef.current);
        if (verificationTimerRef.current) clearInterval(verificationTimerRef.current);
        verificationPollRef.current = null;
        verificationTimerRef.current = null;
        setIsVerifyingPayment(false);
        setVerificationSecondsLeft(0);
        setVerificationTimedOut(true);
      }
    }, 5000);
  };

  // Detect payment=success return from gateway
  const paymentDetectedRef = useRef(false);
  useEffect(() => {
    if (paymentDetectedRef.current) return;
    const fullSearch = window.location.search;
    const params = new URLSearchParams(fullSearch);
    const paymentParam = params.get('payment');
    const isPaymentReturn = paymentParam?.startsWith('success');

    if (!isPaymentReturn) return;
    paymentDetectedRef.current = true;

    // Extract transaction_id robustly from URL params
    let txId = params.get('transaction_id') || params.get('tx_ref');
    if (!txId && paymentParam?.includes('transaction_id=')) {
      const innerParams = new URLSearchParams(paymentParam.replace(/^success\??/, ''));
      txId = innerParams.get('transaction_id') || innerParams.get('tx_ref');
    }
    
    // Fallback: read from localStorage (stored before redirect)
    if (!txId) {
      txId = localStorage.getItem('onboarding_payment_tx');
    }

    // Clean URL and stored tx
    window.history.replaceState({}, '', '/panel/onboarding');

    // Start verification
    startPaymentVerification(txId);
  }, [restoringState]);

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

  // Auto-generate SEO when entering SEO step
  useEffect(() => {
    if (currentStepKey === STEP_KEYS.SEO && panelName && !seoTitle && !seoDescription) {
      generateAllSeo();
    }
  }, [currentStepKey, panelName]);

  const generateAllSeo = async () => {
    if (!panelName) return;
    
    setGeneratingSeo(true);
    try {
      const { data, error } = await supabase.functions.invoke('enhance-seo-text', {
        body: { action: 'generate-all', panelName, description }
      });
      
      if (error) throw error;
      
      if (data) {
        // Clamp AI-generated text to pixel limits to prevent validation errors
        const clampedTitle = clampToPx(data.title || '', SEO_TITLE_PX_RANGE.max);
        const clampedDesc = clampToPx(data.description || '', SEO_DESC_PX_RANGE.max);
        setSeoTitle(clampedTitle);
        setSeoDescription(clampedDesc);
        setSeoKeywords(data.keywords || '');
      }
    } catch (error) {
      console.error('Error generating SEO:', error);
      // Fallback to basic generation
      setSeoTitle(`${panelName} - #1 SMM Panel | Buy Followers & Likes`);
      setSeoDescription(`${panelName} offers premium SMM services. Real followers, instant delivery, 24/7 support, best prices.`);
      setSeoKeywords(`${panelName.toLowerCase()}, SMM panel, buy followers, social media marketing, instagram likes`);
    } finally {
      setGeneratingSeo(false);
    }
  };

  const checkSubdomainAvailability = async (subdomainToCheck: string) => {
    if (!subdomainToCheck || subdomainToCheck.length < 3) {
      setSubdomainAvailable(null);
      return;
    }

    setCheckingSubdomain(true);
    try {
      const { data } = await supabase
        .from('panels_public')
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

  const subdomainTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const handleSubdomainChange = (value: string) => {
    const cleanValue = value.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
    setSubdomain(cleanValue);
    
    // Clear previous timeout to debounce properly
    if (subdomainTimeoutRef.current) clearTimeout(subdomainTimeoutRef.current);
    
    if (cleanValue.length >= 3) {
      subdomainTimeoutRef.current = setTimeout(() => {
        checkSubdomainAvailability(cleanValue);
      }, 500);
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
      domainType, primaryColor, secondaryColor, paymentCompleted,
      selectedTheme, brandingMode, seoTitle, seoDescription, seoKeywords,
      currency,
      domainVerificationStep: domainVerificationState.step,
      domainVerificationToken: domainVerificationState.token,
    };

    try {
      if (createdPanelIdRef.current) {
        // UPDATE existing panel
        await supabase.from('panels')
          .update({
            name: panelName || 'My Panel',
            subdomain: subdomain || 'temp-' + profile.id.slice(0, 8),
            onboarding_step: step,
            onboarding_data: progressData,
            default_currency: currency,
          })
          .eq('id', createdPanelIdRef.current);
      } else {
        // INSERT new panel and capture ID
        const { data: newPanel } = await supabase.from('panels')
          .insert({
            owner_id: profile.id,
            name: panelName || 'My Panel',
            subdomain: subdomain || 'temp-' + profile.id.slice(0, 8),
            onboarding_step: step,
            onboarding_data: progressData,
            default_currency: currency,
            onboarding_completed: false,
            status: 'pending'
          })
          .select('id')
          .single();

        if (newPanel?.id) {
          createdPanelIdRef.current = newPanel.id;
          setCreatedPanelId(newPanel.id);
        }
      }

      // Sync custom domain to panel_domains mid-flow for persistence
      const panelIdForDomain = createdPanelIdRef.current;
      if (panelIdForDomain && domainType === 'custom' && customDomain && domainVerificationState.token) {
        const isFullyVerified = domainVerificationState.step === 'verified';
        const isTxtVerified = domainVerificationState.step === 'dns-pending';
        const verificationStatus = isFullyVerified ? 'verified' : isTxtVerified ? 'txt_verified' : 'pending';

        await supabase
          .from('panel_domains')
          .upsert({
            panel_id: panelIdForDomain,
            domain: customDomain,
            is_primary: true,
            verification_status: verificationStatus,
            dns_configured: isFullyVerified,
            verified_at: isFullyVerified ? new Date().toISOString() : null,
            txt_verification_record: `smmpilot-verify=${domainVerificationState.token}`,
            txt_verified_at: isTxtVerified || isFullyVerified ? new Date().toISOString() : null,
            hosting_provider: 'lovable',
          }, { onConflict: 'domain' })
          .then(({ error }) => {
            if (error) console.error('Error syncing domain mid-flow:', error);
          });
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const handleNext = async () => {
    // Validate current step
    if (currentStepKey === STEP_KEYS.BASIC_INFO && !panelName.trim()) {
      toast({ variant: "destructive", title: "Panel name required" });
      return;
    }
    
    if (currentStepKey === STEP_KEYS.DOMAIN && domainType === 'subdomain') {
      if (checkingSubdomain) {
        toast({ variant: "destructive", title: "Please wait", description: "Checking subdomain availability..." });
        return;
      }
      if (!subdomainAvailable) {
        toast({ variant: "destructive", title: "Please choose an available subdomain" });
        return;
      }
    }

    // Gate custom domain: must be fully verified before proceeding
    if (currentStepKey === STEP_KEYS.DOMAIN && domainType === 'custom') {
      if (domainVerificationState.step !== 'verified') {
        toast({ 
          variant: "destructive", 
          title: "Domain not verified", 
          description: "Please complete domain verification before continuing." 
        });
        return;
      }
    }

    // Validate SEO before leaving SEO step
    if (currentStepKey === STEP_KEYS.SEO) {
      const titlePx = measureTextPx(seoTitle || '');
      const descPx = measureTextPx(seoDescription || '');
      const titleOk = !!seoTitle.trim() && isInRange(titlePx, SEO_TITLE_PX_RANGE);
      const descOk = !!seoDescription.trim() && isInRange(descPx, SEO_DESC_PX_RANGE);
      const keywordsOk = !!seoKeywords.trim() && seoKeywords.split(',').length >= 3;
      
      if (!titleOk || !descOk || !keywordsOk) {
        toast({ 
          variant: "destructive", 
          title: "Complete SEO settings", 
          description: "Title, description, and keywords (min 3) are required with correct lengths."
        });
        return;
      }
    }
    
    markStepComplete(currentStep);
    
    // Calculate next step, skipping payment if free plan
    let nextStep = currentStep + 1;
    
    // Skip payment step if free plan selected
    if (allSteps[nextStep]?.key === STEP_KEYS.PAYMENT && selectedPlan === 'free') {
      nextStep++;
    }
    
    if (nextStep <= 6) {
      // Save progress first and wait for panel creation before advancing
      // This ensures createdPanelId is set before reaching payment step
      await saveProgress(nextStep);
      setCurrentStep(nextStep);
    }
  };

  const handlePrevious = () => {
    let prevStep = currentStep - 1;
    
    // Skip payment step when going back if free plan
    if (allSteps[prevStep]?.key === STEP_KEYS.PAYMENT && selectedPlan === 'free') {
      prevStep--;
    }
    
    if (prevStep >= 0) {
      setCurrentStep(prevStep);
    }
  };

  const handlePaymentSuccess = async () => {
    setPaymentCompleted(true);
    setTrialStarted(false);
    markStepComplete(currentStep);
    // Persist paymentCompleted to DB + write panel_subscriptions
    if (createdPanelIdRef.current) {
      const planPrices = { basic: 5, pro: 15 };
      const progressData = {
        panelName, description, selectedPlan, subdomain, customDomain,
        domainType, primaryColor, secondaryColor, paymentCompleted: true,
        trialStarted: false,
        selectedTheme, brandingMode, seoTitle, seoDescription, seoKeywords, currency
      };
      await supabase.from('panels').update({
        onboarding_data: progressData,
        subscription_status: 'active',
        subscription_tier: selectedPlan,
      }).eq('id', createdPanelIdRef.current);
      
      // Upsert panel_subscriptions for immediate billing sync
      await supabase.from('panel_subscriptions').upsert({
        panel_id: createdPanelIdRef.current,
        plan_type: selectedPlan,
        price: planPrices[selectedPlan as 'basic' | 'pro'],
        status: 'active' as any,
        started_at: new Date().toISOString(),
      }, { onConflict: 'panel_id' });
    }
    // Don't auto-advance — user clicks Next
  };

  const handleComplete = async () => {
    if (!panelName.trim()) {
      toast({ variant: "destructive", title: "Panel name required" });
      return;
    }

    // Auto-fill empty SEO fields with fallback values before validating
    let finalSeoTitle = seoTitle;
    let finalSeoDesc = seoDescription;
    let finalSeoKeywords = seoKeywords;
    
    if (!finalSeoTitle.trim() || !finalSeoDesc.trim()) {
      const fallback = generateSeoMeta({ panelName, offeringHint: description });
      if (!finalSeoTitle.trim()) {
        finalSeoTitle = fallback.title;
        setSeoTitle(fallback.title);
      }
      if (!finalSeoDesc.trim()) {
        finalSeoDesc = fallback.description;
        setSeoDescription(fallback.description);
      }
      if (!finalSeoKeywords.trim()) {
        finalSeoKeywords = `${panelName.toLowerCase()}, smm panel, buy followers, social media marketing`;
        setSeoKeywords(finalSeoKeywords);
      }
    }

    // Validate SEO
    const titlePx = measureTextPx(finalSeoTitle);
    const descPx = measureTextPx(finalSeoDesc);
    
    if (!isInRange(titlePx, SEO_TITLE_PX_RANGE) || !isInRange(descPx, SEO_DESC_PX_RANGE)) {
      toast({
        variant: "destructive",
        title: "SEO meta needs adjustment",
        description: "Please ensure your title and description are within the recommended length."
      });
      return;
    }

    markStepComplete(currentStep);
    setLoading(true);

    try {
      const finalSubdomain = domainType === 'subdomain' 
        ? subdomain 
        : panelName.toLowerCase().replace(/[^a-zA-Z0-9]/g, '').substring(0, 20) || 'panel';

      // Get colors from preset or custom
      const selectedPreset = themePresets.find(t => t.key === selectedTheme);
      const finalPrimaryColor = brandingMode === 'preset' 
        ? selectedPreset?.colors[1] || primaryColor 
        : primaryColor;
      const finalSecondaryColor = brandingMode === 'preset' 
        ? selectedPreset?.colors[2] || secondaryColor 
        : secondaryColor;
      
      // Get default animation style for the selected theme
      const defaultAnimationStyle = getThemeDefaultAnimationStyle(selectedTheme);

      // Determine status based on domain type and payment
      const panelStatus = (domainType === 'custom' && !paymentCompleted ? 'pending' : 'active') as 'pending' | 'active';
      
      const panelPayload = {
            name: panelName,
            description: description || null,
            owner_id: profile?.id,
            status: panelStatus,
            is_approved: panelStatus === 'active',
            theme_type: 'dark_gradient' as const,
            buyer_theme: selectedTheme,
            subdomain: finalSubdomain,
            custom_domain: domainType === 'custom' ? customDomain : null,
            primary_color: finalPrimaryColor,
            secondary_color: finalSecondaryColor,
            subscription_tier: selectedPlan,
            subscription_status: 'active',
            onboarding_completed: true,
            default_currency: currency,
            custom_branding: {
              selectedTheme: selectedTheme,
              heroTitle: 'Boost Your Social Media Presence',
              heroSubtitle: 'Get real followers, likes, and views at the lowest prices. Trusted by over 50,000+ customers worldwide.',
              heroCTAText: 'Get Started',
              heroSecondaryCTAText: 'Fast Order',
              heroBadgeText: '#1 SMM Panel',
              heroAnimatedTextStyle: defaultAnimationStyle,
              heroAnimatedTextPosition: 'last',
              enableFastOrder: false,
              enablePlatformFeatures: true,
              enableStats: true,
              enableFeatures: true,
              enableTestimonials: true,
              enableFAQs: true,
              enableFooter: true,
              enableAnimations: true,
              primaryColor: finalPrimaryColor,
              secondaryColor: finalSecondaryColor,
              companyName: panelName,
              themeMode: 'dark',
            }
      };

      let panelData: any = null;
      
      if (createdPanelIdRef.current) {
        // UPDATE existing panel
        const { data, error: updateError } = await supabase
          .from('panels')
          .update(panelPayload)
          .eq('id', createdPanelIdRef.current)
          .select()
          .single();
        if (updateError) throw updateError;
        panelData = data;
      } else {
        // INSERT new panel
        const { data, error: insertError } = await supabase
          .from('panels')
          .insert(panelPayload)
          .select()
          .single();
        if (insertError) throw insertError;
        panelData = data;
      }


      // Create panel settings with SEO
      if (panelData) {
        await supabase
          .from('panel_settings')
          .upsert({
              panel_id: panelData.id,
              seo_title: seoTitle || `${panelName} - SMM Services`,
              seo_description: seoDescription || description || `Professional SMM services from ${panelName}`,
              seo_keywords: seoKeywords || 'SMM, social media marketing, services'
          }, { onConflict: 'panel_id' });

        // Sync custom domain to panel_domains if configured
        if (domainType === 'custom' && customDomain) {
          const token = domainVerificationState.token || crypto.randomUUID();
          const isFullyVerified = domainVerificationState.step === 'verified';
          const isTxtVerified = domainVerificationState.step === 'dns-pending';
          
          const verificationStatus = isFullyVerified ? 'verified' : isTxtVerified ? 'txt_verified' : 'pending';
          
          await supabase
            .from('panel_domains')
            .upsert({
              panel_id: panelData.id,
              domain: customDomain,
              is_primary: true,
              verification_status: verificationStatus,
              dns_configured: isFullyVerified,
              verified_at: isFullyVerified ? new Date().toISOString() : null,
              txt_verification_record: `smmpilot-verify=${token}`,
              txt_verified_at: isTxtVerified || isFullyVerified ? new Date().toISOString() : null,
              hosting_provider: 'lovable',
            }, { onConflict: 'domain' });
        }
      }

      toast({
        title: (
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Panel Created Successfully!
          </span>
        ) as any,
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

  if (checkingPanel || restoringState) {
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
    switch (currentStepKey) {
      case STEP_KEYS.BASIC_INFO:
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
                onChange={(e) => setPanelName(e.target.value.replace(/^\s+/, ''))}
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
              <p className="text-xs text-muted-foreground">
                Brief description of your panel used for SEO and marketing context.
              </p>
            </div>
          </motion.div>
        );

      case STEP_KEYS.PLAN:
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
              onSelectPlan={(plan) => {
                // If payment was completed, lock plan selection
                if (paymentCompleted) {
                  toast({ variant: 'destructive', title: 'Plan Locked', description: `You've already paid for the ${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} plan. Continue with your current plan.` });
                  return;
                }
                // If user changes plan while on trial, reset trial state
                if (trialStarted && plan !== trialPlan) {
                  setTrialStarted(false);
                  setTrialSlideUnlocked(false);
                  setTrialPlan(null);
                }
                setSelectedPlan(plan);
              }}
              lockedPlan={paymentCompleted ? selectedPlan : null}
            />
          </motion.div>
        );

      case STEP_KEYS.PAYMENT:
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
              panelId={createdPanelIdRef.current || undefined}
              onPaymentSuccess={handlePaymentSuccess}
              paymentCompleted={paymentCompleted}
              trialStarted={trialStarted}
              verifying={isVerifyingPayment}
              verificationSecondsLeft={verificationSecondsLeft}
              verificationTimedOut={verificationTimedOut}
              onCancelVerification={cancelPaymentVerification}
              onKeepWaiting={() => {
                setVerificationTimedOut(false);
                startPaymentVerification(null);
              }}
              onContinueFreePlan={async () => {
                setVerificationTimedOut(false);
                setTrialStarted(true);
                setPaymentCompleted(false);
                setTrialPlan(selectedPlan as 'basic' | 'pro');
                setTrialSlideUnlocked(false);
                markStepComplete(currentStep);
                if (createdPanelIdRef.current) {
                  const trialEndsAt = new Date();
                  trialEndsAt.setDate(trialEndsAt.getDate() + 3);
                  await supabase.from('panels').update({
                    subscription_status: 'trial',
                    subscription_tier: selectedPlan,
                  }).eq('id', createdPanelIdRef.current);
                  await supabase.from('panel_subscriptions').upsert({
                    panel_id: createdPanelIdRef.current,
                    plan_type: selectedPlan,
                    price: selectedPlan === 'pro' ? 15 : 5,
                    status: 'trial' as any,
                    started_at: new Date().toISOString(),
                    expires_at: trialEndsAt.toISOString(),
                    trial_ends_at: trialEndsAt.toISOString(),
                  }, { onConflict: 'panel_id' });
                }
              }}
              onSlideUnlocked={() => setTrialSlideUnlocked(true)}
              slideUnlocked={trialSlideUnlocked}
              onSkip={async () => {
                // Trial: mark trial started but NOT payment completed
                setTrialStarted(true);
                setPaymentCompleted(false);
                setTrialPlan(selectedPlan as 'basic' | 'pro');
                setTrialSlideUnlocked(false);
                markStepComplete(currentStep);
                // Persist to DB
                if (createdPanelIdRef.current) {
                  const planPrices = { basic: 5, pro: 15 };
                  const progressData = {
                    panelName, description, selectedPlan, subdomain, customDomain,
                    domainType, primaryColor, secondaryColor, paymentCompleted: false,
                    trialStarted: true, trialPlan: selectedPlan,
                    selectedTheme, brandingMode, seoTitle, seoDescription, seoKeywords, currency
                  };
                  await supabase.from('panels').update({
                    onboarding_data: progressData,
                    subscription_status: 'trial',
                    subscription_tier: selectedPlan,
                  }).eq('id', createdPanelIdRef.current);
                  
                  // Upsert trial subscription record
                  const trialEndsAt = new Date();
                  trialEndsAt.setDate(trialEndsAt.getDate() + 3);
                  await supabase.from('panel_subscriptions').upsert({
                    panel_id: createdPanelIdRef.current,
                    plan_type: selectedPlan,
                    price: planPrices[selectedPlan as 'basic' | 'pro'],
                    status: 'trial' as any,
                    started_at: new Date().toISOString(),
                    expires_at: trialEndsAt.toISOString(),
                    trial_ends_at: trialEndsAt.toISOString(),
                  }, { onConflict: 'panel_id' });
                }
              }}
            />
          </motion.div>
        );

      case STEP_KEYS.DOMAIN:
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
              panelId={createdPanelIdRef.current || undefined}
              onVerificationStateChange={setDomainVerificationState}
              initialVerificationStep={domainVerificationState.step}
              initialVerificationToken={domainVerificationState.token || undefined}
              initialCustomDomain={customDomain}
            />
          </motion.div>
        );

      case STEP_KEYS.THEME:
        return (
          <motion.div
            key="theme-style"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Theme & Style</h2>
              <p className="text-muted-foreground">Choose a preset or customize manually</p>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <Palette className="w-5 h-5 text-primary flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                You can fine-tune all colors, fonts, and layouts in <strong>Design Customization</strong> after setup.
              </p>
            </div>

            {/* Mode Toggle */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant={brandingMode === 'preset' ? 'default' : 'outline'}
                onClick={() => setBrandingMode('preset')}
                className="flex-1"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Theme Presets
              </Button>
              <Button
                type="button"
                variant={brandingMode === 'custom' ? 'default' : 'outline'}
                onClick={() => setBrandingMode('custom')}
                className="flex-1"
              >
                <Palette className="w-4 h-4 mr-2" />
                Custom Colors
              </Button>
            </div>

            {brandingMode === 'preset' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {themePresets.map((preset) => (
                  <ThemeMiniPreview
                    key={preset.key}
                    themeId={preset.key}
                    name={preset.name}
                    description={preset.description}
                    colors={preset.colors}
                    isActive={selectedTheme === preset.key}
                    onClick={() => {
                      setSelectedTheme(preset.key);
                      setPrimaryColor(preset.colors[1]);
                      setSecondaryColor(preset.colors[2]);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
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

                {/* Preview for custom colors */}
                <div className="p-4 rounded-xl border border-border">
                  <p className="text-sm text-muted-foreground mb-3">Preview</p>
                  <div 
                    className="h-24 rounded-xl flex items-center justify-center text-white font-bold text-xl"
                    style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                  >
                    {panelName || 'Your Panel'}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        );

      case STEP_KEYS.SEO: {
        const titlePx = measureTextPx(seoTitle || '');
        const descPx = measureTextPx(seoDescription || '');
        const titleOk = !!seoTitle.trim() && isInRange(titlePx, SEO_TITLE_PX_RANGE);
        const descOk = !!seoDescription.trim() && isInRange(descPx, SEO_DESC_PX_RANGE);

        const getTitleFeedback = () => {
          if (!seoTitle.trim()) return { type: 'info', text: 'Add a compelling title with your brand name' };
          if (titlePx < SEO_TITLE_PX_RANGE.min) return { type: 'warning', text: 'Too short - add more keywords' };
          if (titlePx > SEO_TITLE_PX_RANGE.max) return { type: 'warning', text: 'Too long - trim a few words' };
          return { type: 'success', text: 'Great title! Well optimized' };
        };

        const getDescFeedback = () => {
          if (!seoDescription.trim()) return { type: 'info', text: 'Describe your key benefits' };
          if (descPx < SEO_DESC_PX_RANGE.min) return { type: 'warning', text: 'Too short - add more details' };
          if (descPx > SEO_DESC_PX_RANGE.max) return { type: 'warning', text: 'Too long - be more concise' };
          return { type: 'success', text: 'Perfect description!' };
        };

        const titleFeedback = getTitleFeedback();
        const descFeedback = getDescFeedback();

        return (
          <motion.div
            key="seo"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-6"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">SEO Optimization</h2>
                <p className="text-sm text-muted-foreground">Optimize how your panel appears in Google</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateAllSeo}
                disabled={generatingSeo}
                className="gap-2"
              >
                {generatingSeo ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4" />
                )}
                Auto-Generate
              </Button>
            </div>

            <div className="space-y-2">
              <Label>SEO Title</Label>
              <Input
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder={`${panelName || 'Your Panel'} - #1 SMM Panel | Buy Followers & Likes`}
                className="bg-background/50"
              />
              <div className="flex items-center justify-between">
                <p className={cn(
                  "text-xs flex items-center gap-1",
                  titleFeedback.type === 'success' ? "text-emerald-500" : 
                  titleFeedback.type === 'warning' ? "text-yellow-500" : "text-muted-foreground"
                )}>
                  {titleFeedback.type === 'success' ? <CheckCircle className="w-3 h-3" /> : 
                   titleFeedback.type === 'warning' ? <AlertCircle className="w-3 h-3" /> : 
                   <Sparkles className="w-3 h-3" />}
                  {titleFeedback.text}
                </p>
                <span className={cn(
                  "text-[10px] font-mono",
                  titleOk ? "text-emerald-500" : "text-muted-foreground"
                )}>
                  {Math.round(titlePx)}px
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>SEO Description</Label>
              <Textarea
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Get real followers, likes, views & more. Instant delivery, 24/7 support, best prices."
                rows={3}
                className="bg-background/50"
              />
              <div className="flex items-center justify-between">
                <p className={cn(
                  "text-xs flex items-center gap-1",
                  descFeedback.type === 'success' ? "text-emerald-500" : 
                  descFeedback.type === 'warning' ? "text-yellow-500" : "text-muted-foreground"
                )}>
                  {descFeedback.type === 'success' ? <CheckCircle className="w-3 h-3" /> : 
                   descFeedback.type === 'warning' ? <AlertCircle className="w-3 h-3" /> : 
                   <Sparkles className="w-3 h-3" />}
                  {descFeedback.text}
                </p>
                <span className={cn(
                  "text-[10px] font-mono",
                  descOk ? "text-emerald-500" : "text-muted-foreground"
                )}>
                  {Math.round(descPx)}px
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>SEO Keywords</Label>
              <Input
                value={seoKeywords}
                onChange={(e) => setSeoKeywords(e.target.value)}
                placeholder="SMM panel, buy followers, social media marketing"
                className="bg-background/50"
              />
              <p className="text-xs text-muted-foreground">Comma-separated keywords</p>
            </div>

            {/* Google Preview */}
            <div className="p-4 rounded-xl border border-border bg-white dark:bg-slate-900">
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Search className="w-3 h-3" /> Google Preview
              </p>
              <div className="space-y-1">
                <p className="text-blue-600 dark:text-blue-400 text-base hover:underline cursor-pointer truncate">
                  {seoTitle || `${panelName || 'Your Panel'} - #1 SMM Panel`}
                </p>
                <p className="text-green-700 dark:text-green-500 text-xs">
                  {domainType === 'custom' ? customDomain : `${subdomain || 'yourpanel'}.smmpilot.online`}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                  {seoDescription || 'Get real followers, likes, views & more. Instant delivery and 24/7 support.'}
                </p>
              </div>
            </div>
          </motion.div>
        );
      }

      case STEP_KEYS.COMPLETE:
        return (
          <motion.div
            key="complete"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-8"
          >
            {/* Success Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 via-primary/5 to-emerald-500/10 border border-emerald-500/20 p-6">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative flex flex-col items-center text-center gap-4">
                <motion.div 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }} 
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-primary flex items-center justify-center shadow-lg shadow-emerald-500/25"
                >
                  <Rocket className="w-8 h-8 text-primary-foreground" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold mb-1">Ready to Launch!</h2>
                  <p className="text-sm text-muted-foreground">
                    Everything looks good. Review your configuration below.
                  </p>
                </div>
              </div>
            </div>

            {/* Configuration Summary */}
            <div className="relative rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden">
              {/* Gradient border glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 via-transparent to-emerald-500/10 pointer-events-none" />
              
              <div className="relative p-6 space-y-5">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Configuration Summary</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Panel Name */}
                  <div className="group flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/40 cursor-pointer hover:border-primary/40 transition-colors" onClick={() => setCurrentStep(0)}>
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">Panel Name</p>
                      <p className="text-sm font-semibold truncate">{panelName}</p>
                    </div>
                    <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1">Edit</span>
                  </div>

                  {/* Plan */}
                  <div className="group flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/40 cursor-pointer hover:border-primary/40 transition-colors" onClick={() => setCurrentStep(1)}>
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <CreditCard className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">Plan</p>
                      <p className="text-sm font-semibold capitalize">{selectedPlan}</p>
                    </div>
                    <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1">Edit</span>
                  </div>

                  {/* Domain */}
                  <div className="group flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/40 cursor-pointer hover:border-primary/40 transition-colors" onClick={() => setCurrentStep(3)}>
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Globe className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">Domain</p>
                      <p className="text-sm font-semibold truncate">
                        {domainType === 'subdomain' 
                          ? `${subdomain}.smmpilot.online` 
                          : customDomain || `${subdomain}.smmpilot.online`
                        }
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1">Edit</span>
                  </div>

                  {/* Theme */}
                  <div className="group flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/40 cursor-pointer hover:border-primary/40 transition-colors" onClick={() => setCurrentStep(4)}>
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Palette className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">Theme</p>
                      <p className="text-sm font-semibold">{themePresets.find(t => t.key === selectedTheme)?.name || 'Custom'}</p>
                    </div>
                    <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1">Edit</span>
                  </div>

                  {/* Currency */}
                  <div className="group flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/40 cursor-pointer hover:border-primary/40 transition-colors" onClick={() => setCurrentStep(4)}>
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Settings className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">Currency</p>
                      <p className="text-sm font-semibold">{currency}</p>
                    </div>
                    <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1">Edit</span>
                  </div>

                  {/* SEO */}
                  <div className="group flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/40 cursor-pointer hover:border-primary/40 transition-colors" onClick={() => setCurrentStep(5)}>
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">SEO</p>
                      <p className="text-sm font-semibold text-emerald-500">Configured</p>
                    </div>
                    <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1">Edit</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Launch Button */}
            <Button 
              className="w-full gap-2 h-12 text-base font-semibold bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-500/90 text-primary-foreground shadow-lg shadow-primary/25" 
              size="lg"
              onClick={handleComplete}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Panel...
                </>
              ) : (
                <>
                  <Rocket className="w-5 h-5" />
                  Launch My Panel
                  <Sparkles className="w-4 h-4" />
                </>
              )}
            </Button>
          </motion.div>
        );

      default:
        return null;
    }
  };

  const isLastStep = currentStepKey === STEP_KEYS.COMPLETE;
  const isPaymentStep = currentStepKey === STEP_KEYS.PAYMENT;
  const isDomainStep = currentStepKey === STEP_KEYS.DOMAIN;
  const isNextDisabled = (isPaymentStep && !paymentCompleted && !trialSlideUnlocked) || (isPaymentStep && isVerifyingPayment) || (isDomainStep && domainType === 'custom' && domainVerificationState.step !== 'verified');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 pb-24 sm:pb-8">
      <Helmet>
        <title>Create Your Panel | HOME OF SMM</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="container max-w-3xl mx-auto px-4 py-4 sm:py-8">
        {/* Progress Header */}
        <div className="mb-4 sm:mb-8">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h1 className="text-lg sm:text-xl font-bold">Create Your Panel</h1>
            <span className="text-xs sm:text-sm text-muted-foreground">
              Step {visibleStepIndex + 1} of {visibleSteps.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          
          {/* Step Indicators - Mobile Optimized */}
          <div className="flex justify-between mt-3 sm:mt-4 gap-1 sm:gap-2">
            {visibleSteps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = completedSteps.includes(step.id);
              const isCurrent = currentStep === step.id;
              
              // Find current step index in visible steps
              const currentVisibleIndex = visibleSteps.findIndex(s => s.id === currentStep);
              
              // On mobile, only show current step + immediate neighbors (3 max)
              const isAdjacentOnMobile = 
                isCurrent || 
                index === currentVisibleIndex - 1 ||
                index === currentVisibleIndex + 1;
              
              // Show dots for hidden steps on mobile
              const isFirstHidden = index === currentVisibleIndex - 2 && currentVisibleIndex > 1;
              const isLastHidden = index === currentVisibleIndex + 2 && currentVisibleIndex < visibleSteps.length - 2;
              
              return (
                <div 
                  key={step.id} 
                  className={cn(
                    "flex flex-col items-center gap-1 transition-all",
                    // On mobile: show current + neighbors, hide others
                    isAdjacentOnMobile ? "flex-1" : "hidden sm:flex sm:flex-1",
                    // Show ellipsis indicators on mobile for hidden steps
                    (isFirstHidden || isLastHidden) && "flex sm:flex flex-none w-6",
                    isCurrent && "text-primary",
                    isCompleted && "text-emerald-500",
                    !isCurrent && !isCompleted && "text-muted-foreground"
                  )}
                >
                  {/* Ellipsis for hidden steps on mobile */}
                  {(isFirstHidden || isLastHidden) ? (
                    <div className="w-6 h-8 flex items-center justify-center sm:hidden">
                      <span className="text-muted-foreground text-lg">···</span>
                    </div>
                  ) : null}
                  
                  {/* Regular step indicator */}
                  <div className={cn(
                    "w-8 h-8 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 transition-all",
                    isCurrent && "border-primary bg-primary/10 scale-110 sm:scale-100",
                    isCompleted && "border-emerald-500 bg-emerald-500/10",
                    !isCurrent && !isCompleted && "border-muted",
                    (isFirstHidden || isLastHidden) && "hidden sm:flex"
                  )}>
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <span className={cn(
                    "text-xs text-center whitespace-nowrap",
                    // Hide titles on mobile except for current step
                    isCurrent ? "block" : "hidden sm:block"
                  )}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* Mobile step counter */}
          <div className="flex sm:hidden justify-center mt-2">
            <span className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
              Step {visibleStepIndex + 1} of {visibleSteps.length}
            </span>
          </div>
        </div>

        {/* Step Content */}
        <Card className="bg-card/60 backdrop-blur-xl border-border/50">
          <CardContent className="p-4 sm:p-6">
            <AnimatePresence mode="wait">
              {renderStepContent()}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Desktop Navigation Buttons */}
        {!isLastStep && (
          <div className="hidden sm:flex justify-between mt-6">
            {isPaymentStep && isVerifyingPayment ? (
              <Button
                variant="destructive"
                onClick={cancelPaymentVerification}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Cancel
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            )}
            <Button 
              onClick={handleNext} 
              className="gap-2"
              disabled={isNextDisabled}
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Mobile Sticky Navigation Buttons */}
      {!isLastStep && (
        <div className="fixed bottom-0 left-0 right-0 sm:hidden bg-background/95 backdrop-blur-md border-t border-border/50 p-4 pb-safe z-50">
          <div className="flex gap-3 max-w-3xl mx-auto">
            {isPaymentStep && isVerifyingPayment ? (
              <Button
                variant="destructive"
                onClick={cancelPaymentVerification}
                className="flex-1 h-12"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex-1 h-12"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            <Button 
              onClick={handleNext} 
              className="flex-1 h-12"
              disabled={isNextDisabled}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PanelOnboardingV2;
