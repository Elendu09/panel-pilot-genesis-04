import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  Globe, 
  Palette, 
  Search, 
  Settings, 
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SEO_DESC_PX_RANGE, SEO_TITLE_PX_RANGE, generateSeoMeta, isInRange, measureTextPx } from '@/lib/seo-metrics';

const PanelOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkingPanel, setCheckingPanel] = useState(true);
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Step 1: Basic Info
  const [panelName, setPanelName] = useState('');
  const [description, setDescription] = useState('');

  // Step 2: Domain Setup
  const [domainType, setDomainType] = useState<'subdomain' | 'custom'>('subdomain');
  const [subdomain, setSubdomain] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);
  const [checkingSubdomain, setCheckingSubdomain] = useState(false);

  // Step 3: Theme & Branding
  const [selectedTheme, setSelectedTheme] = useState<'default' | 'alipanel' | 'flysmm' | 'smmstay' | 'tgref' | 'smmvisit'>('default');
  const [brandingMode, setBrandingMode] = useState<'preset' | 'custom'>('preset');
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');
  const [secondaryColor, setSecondaryColor] = useState('#1e40af');

  // Step 4: SEO
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');

  // Theme presets with colors
  const themePresets = [
    { key: 'default' as const, name: 'Modern Default', description: 'Clean and professional', primary: '#6366F1', secondary: '#8B5CF6', preview: 'bg-gradient-to-br from-indigo-500 to-purple-500' },
    { key: 'alipanel' as const, name: 'AliPanel', description: 'Bold orange energy', primary: '#F97316', secondary: '#EA580C', preview: 'bg-gradient-to-br from-orange-500 to-orange-600' },
    { key: 'flysmm' as const, name: 'FlySMM', description: 'Deep purple luxury', primary: '#7C3AED', secondary: '#5B21B6', preview: 'bg-gradient-to-br from-violet-600 to-violet-800' },
    { key: 'smmstay' as const, name: 'SMMStay', description: 'Neon pink vibrant', primary: '#FF4081', secondary: '#E040FB', preview: 'bg-gradient-to-br from-pink-500 to-fuchsia-500' },
    { key: 'tgref' as const, name: 'TGRef', description: 'Terminal hacker', primary: '#22C55E', secondary: '#16A34A', preview: 'bg-gradient-to-br from-green-500 to-green-600' },
    { key: 'smmvisit' as const, name: 'SMMVisit', description: 'Ocean blue calm', primary: '#0EA5E9', secondary: '#0284C7', preview: 'bg-gradient-to-br from-sky-500 to-sky-600' },
  ];

  const steps = [
    { id: 0, title: 'Basic Info', icon: Settings, description: 'Name your panel' },
    { id: 1, title: 'Domain', icon: Globe, description: 'Choose your URL' },
    { id: 2, title: 'Theme & Style', icon: Palette, description: 'Choose look & feel' },
    { id: 3, title: 'SEO', icon: Search, description: 'Optimize search' },
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

  const handleNext = () => {
    if (currentStep === 0 && !panelName.trim()) {
      toast({ variant: "destructive", title: "Panel name required" });
      return;
    }
    
    if (currentStep === 1 && domainType === 'subdomain' && !subdomainAvailable) {
      toast({ variant: "destructive", title: "Please choose an available subdomain" });
      return;
    }
    
    // Mark current step as completed
    markStepComplete(currentStep);
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!panelName.trim()) {
      toast({ variant: "destructive", title: "Panel name required" });
      return;
    }

    // Ensure SEO fields are generated + pixel-valid on first save
    const draft = {
      title: seoTitle,
      description: seoDescription,
    };

    const ensureSeo = () => {
      if (draft.title.trim() && draft.description.trim()) return;
      const generated = generateSeoMeta({
        panelName,
        offeringHint: description,
      });
      draft.title = generated.title;
      draft.description = generated.description;
      setSeoTitle(generated.title);
      setSeoDescription(generated.description);
    };

    ensureSeo();

    const titlePx = measureTextPx(draft.title);
    const descPx = measureTextPx(draft.description);

    if (!isInRange(titlePx, SEO_TITLE_PX_RANGE) || !isInRange(descPx, SEO_DESC_PX_RANGE)) {
      toast({
        variant: "destructive",
        title: "SEO meta length needs adjustment",
        description: `Title: ${Math.round(titlePx)}px (needs ${SEO_TITLE_PX_RANGE.min}-${SEO_TITLE_PX_RANGE.max}px), Description: ${Math.round(descPx)}px (needs ${SEO_DESC_PX_RANGE.min}-${SEO_DESC_PX_RANGE.max}px)`
      });
      return;
    }

    // Mark final step as complete
    markStepComplete(currentStep);

    setLoading(true);
    try {
      const finalSubdomain = domainType === 'subdomain' 
        ? subdomain 
        : panelName.toLowerCase().replace(/[^a-zA-Z0-9]/g, '').substring(0, 20) || 'panel';

      // Get colors from preset or custom
      const finalPrimaryColor = brandingMode === 'preset' 
        ? themePresets.find(t => t.key === selectedTheme)?.primary || primaryColor 
        : primaryColor;
      const finalSecondaryColor = brandingMode === 'preset' 
        ? themePresets.find(t => t.key === selectedTheme)?.secondary || secondaryColor 
        : secondaryColor;

      const { error } = await supabase
        .from('panels')
        .insert([
          {
            name: panelName,
            description: description || null,
            owner_id: profile?.id,
            status: 'active',
            is_approved: true,
            theme_type: 'dark_gradient',
            buyer_theme: selectedTheme,
            subdomain: finalSubdomain,
            custom_domain: domainType === 'custom' ? customDomain : null,
            primary_color: finalPrimaryColor,
            secondary_color: finalSecondaryColor,
            onboarding_completed: true
          }
        ]);

      if (error) throw error;

      const { data: panelData } = await supabase
        .from('panels')
        .select('id')
        .eq('owner_id', profile?.id)
        .single();

      if (panelData) {
        await supabase
          .from('panel_settings')
          .insert([
            {
              panel_id: panelData.id,
              seo_title: draft.title,
              seo_description: draft.description,
              seo_keywords: seoKeywords || 'SMM, social media marketing, services'
            }
          ]);
      }

      toast({
        title: (
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Panel Created Successfully!
          </span>
        ) as any,
        description: "Your subdomain is live now. If you added a custom domain, complete DNS setup to go live."
      });

      // Navigate to panel - the onboarding tour will show automatically
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

  // Show loading while checking for existing panel
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
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            key="step0"
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

      case 1:
        return (
          <motion.div
            key="step1"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-6"
          >
            <RadioGroup value={domainType} onValueChange={(value: 'subdomain' | 'custom') => setDomainType(value)}>
              <div className={cn(
                "flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer",
                domainType === 'subdomain' ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              )}>
                <RadioGroupItem value="subdomain" id="subdomain" />
                <div className="flex-1">
                  <Label htmlFor="subdomain" className="font-medium cursor-pointer">Free Subdomain</Label>
                  <p className="text-sm text-muted-foreground">yourname.homeofsmm.com</p>
                </div>
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500">Free</Badge>
              </div>
              <div className={cn(
                "flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer",
                domainType === 'custom' ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              )}>
                <RadioGroupItem value="custom" id="custom" />
                <div className="flex-1">
                  <Label htmlFor="custom" className="font-medium cursor-pointer">Custom Domain</Label>
                  <p className="text-sm text-muted-foreground">Use your own domain</p>
                </div>
                <Badge variant="outline">Pro</Badge>
              </div>
            </RadioGroup>

            {domainType === 'subdomain' && (
              <div className="space-y-2">
                <Label>Choose Your Subdomain</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={subdomain}
                    onChange={(e) => handleSubdomainChange(e.target.value)}
                    placeholder="mysmm"
                    className="bg-background/50"
                  />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">.homeofsmm.com</span>
                </div>
                {checkingSubdomain && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Checking availability...
                  </p>
                )}
                {subdomainAvailable === true && (
                  <p className="text-sm text-emerald-500 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Subdomain available!
                  </p>
                )}
                {subdomainAvailable === false && (
                  <p className="text-sm text-destructive">Subdomain already taken</p>
                )}
              </div>
            )}

            {domainType === 'custom' && (
              <div className="space-y-2">
                <Label>Your Custom Domain</Label>
                <Input
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="yourdomain.com"
                  className="bg-background/50"
                />
                <p className="text-sm text-muted-foreground">
                  DNS configuration instructions will be provided after setup
                </p>
              </div>
            )}
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-6"
          >
            <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <Palette className="w-5 h-5 text-primary" />
              <p className="text-sm text-muted-foreground">
                Choose a theme preset or customize colors manually. You can fine-tune everything in <strong>Design Customization</strong> after setup.
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
                  <div
                    key={preset.key}
                    onClick={() => {
                      setSelectedTheme(preset.key);
                      setPrimaryColor(preset.primary);
                      setSecondaryColor(preset.secondary);
                    }}
                    className={cn(
                      "relative rounded-xl border-2 p-3 cursor-pointer transition-all hover:scale-[1.02]",
                      selectedTheme === preset.key 
                        ? "border-primary ring-2 ring-primary/20" 
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className={cn("h-16 rounded-lg mb-2", preset.preview)} />
                    <p className="font-medium text-sm">{preset.name}</p>
                    <p className="text-xs text-muted-foreground">{preset.description}</p>
                    {selectedTheme === preset.key && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
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
              </div>
            )}

            {/* Preview */}
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

      case 3: {
        const titlePx = measureTextPx(seoTitle || '');
        const descPx = measureTextPx(seoDescription || '');
        const titleOk = !!seoTitle.trim() && isInRange(titlePx, SEO_TITLE_PX_RANGE);
        const descOk = !!seoDescription.trim() && isInRange(descPx, SEO_DESC_PX_RANGE);

        // Real-time SEO feedback
        const getTitleFeedback = () => {
          if (!seoTitle.trim()) return { type: 'info', text: 'Add a compelling title with your brand name and main keyword' };
          if (titlePx < SEO_TITLE_PX_RANGE.min) return { type: 'warning', text: 'Keep going! Add more descriptive keywords' };
          if (titlePx > SEO_TITLE_PX_RANGE.max) return { type: 'warning', text: 'Slightly too long - trim a few words' };
          if (!seoTitle.toLowerCase().includes('smm') && !seoTitle.toLowerCase().includes('social')) {
            return { type: 'tip', text: 'Tip: Include "SMM" or "Social Media" for better SEO' };
          }
          return { type: 'success', text: 'Great title! Keywords and length are optimized' };
        };

        const getDescFeedback = () => {
          if (!seoDescription.trim()) return { type: 'info', text: 'Write a description that tells users what you offer' };
          if (descPx < SEO_DESC_PX_RANGE.min) return { type: 'warning', text: 'Keep going! Describe your key benefits and services' };
          if (descPx > SEO_DESC_PX_RANGE.max) return { type: 'warning', text: 'Slightly too long - focus on your main value proposition' };
          return { type: 'success', text: 'Perfect! Your description is well-optimized' };
        };

        const titleFeedback = getTitleFeedback();
        const descFeedback = getDescFeedback();

        return (
          <motion.div
            key="step3"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-6"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">SEO Optimization</h2>
                <p className="text-sm text-muted-foreground">Optimize how your panel appears in Google search results</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const generated = generateSeoMeta({
                    panelName,
                    offeringHint: description,
                  });
                  setSeoTitle(generated.title);
                  setSeoDescription(generated.description);
                }}
                className="gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Auto-Generate
              </Button>
            </div>

            <div className="space-y-2">
              <Label>SEO Title</Label>
              <Input
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder={panelName ? `${panelName} - #1 SMM Panel | Buy Followers & Likes` : "Your Panel - #1 SMM Panel | Buy Followers & Likes"}
                className="bg-background/50"
              />
              <div className="flex items-center justify-between">
                <p className={cn(
                  "text-xs flex items-center gap-1",
                  titleFeedback.type === 'success' ? "text-emerald-500" : 
                  titleFeedback.type === 'warning' ? "text-yellow-500" : 
                  titleFeedback.type === 'tip' ? "text-blue-500" : "text-muted-foreground"
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
                placeholder="Get real followers, likes, views & more. Instant delivery, 24/7 support, best prices guaranteed."
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
                placeholder="SMM panel, buy followers, social media marketing, instagram likes"
                className="bg-background/50"
              />
              <p className="text-xs text-muted-foreground">Comma-separated keywords for better search visibility</p>
            </div>

            {/* Google Preview */}
            <div className="p-4 rounded-xl border border-border bg-white">
              <p className="text-xs text-muted-foreground mb-2">Google Preview</p>
              <div className="space-y-1">
                <p className="text-blue-600 text-base hover:underline cursor-pointer truncate">
                  {seoTitle || `${panelName || 'Your Panel'} - #1 SMM Panel`}
                </p>
                <p className="text-green-700 text-xs">
                  {domainType === 'custom' ? customDomain : `${subdomain || 'yourpanel'}.homeofsmm.com`}
                </p>
                <p className="text-gray-600 text-sm line-clamp-2">
                  {seoDescription || 'Get real followers, likes, views & more. Instant delivery and 24/7 support.'}
                </p>
              </div>
            </div>
          </motion.div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 flex items-center justify-center p-4">
      <Helmet>
        <title>Setup Your Panel - HOME OF SMM</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      
      <div className="w-full max-w-4xl">
        {/* Header Card with Stacked Windows Effect */}
        <div className="relative mb-8">
          {/* Stacked floating windows effect */}
          <div className="absolute inset-x-8 -top-6 h-8 bg-white/20 backdrop-blur-sm rounded-t-2xl opacity-30 transform scale-[0.92]" />
          <div className="absolute inset-x-4 -top-4 h-6 bg-white/30 backdrop-blur-sm rounded-t-2xl opacity-50 transform scale-[0.96]" />
          <div className="absolute inset-x-2 -top-2 h-4 bg-white/40 backdrop-blur-sm rounded-t-2xl opacity-70 scale-[0.98]" />
          
          {/* Main Header Card */}
          <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Create Your Panel</h1>
                  <p className="text-sm text-muted-foreground">Step {currentStep + 1} of {steps.length}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{Math.round(progress)}%</p>
                <p className="text-xs text-muted-foreground">Complete</p>
              </div>
            </div>
            <Progress value={progress} className="h-2 mt-4" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Kanban-style Step Cards - Desktop */}
          <div className="hidden lg:flex flex-col gap-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = completedSteps.includes(index);
              
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={cn(
                    "transition-all cursor-pointer",
                    isActive && "ring-2 ring-primary border-primary shadow-lg shadow-primary/10",
                    isCompleted && "bg-emerald-500/5 border-emerald-500/20",
                    !isActive && !isCompleted && "opacity-60 hover:opacity-80"
                  )}
                  onClick={() => (isCompleted || index <= currentStep) && setCurrentStep(index)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          isCompleted ? "bg-emerald-500/10" : isActive ? "bg-primary/10" : "bg-muted"
                        )}>
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <Icon className={cn(
                              "w-5 h-5",
                              isActive ? "text-primary" : "text-muted-foreground"
                            )} />
                          )}
                        </div>
                        <div>
                          <p className={cn(
                            "font-medium text-sm",
                            isActive && "text-primary"
                          )}>{step.title}</p>
                          <p className="text-xs text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Mobile Step Indicators */}
          <div className="lg:hidden flex gap-2 mb-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = completedSteps.includes(index);
              
              return (
                <button
                  key={step.id}
                  onClick={() => (isCompleted || index <= currentStep) && setCurrentStep(index)}
                  className={cn(
                    "flex-1 p-3 rounded-xl transition-all",
                    isActive && "bg-primary text-primary-foreground",
                    isCompleted && "bg-emerald-500/10 text-emerald-500",
                    !isActive && !isCompleted && "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 mx-auto" />
                  ) : (
                    <Icon className="w-5 h-5 mx-auto" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Main Content Card */}
          <Card className="lg:col-span-3 bg-white/90 dark:bg-card/90 backdrop-blur-xl border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-primary" />
                {steps[currentStep].title}
              </CardTitle>
              <CardDescription>{steps[currentStep].description}</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <AnimatePresence mode="wait">
                {renderStepContent()}
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-6 border-t border-border/50">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </Button>

                {currentStep < steps.length - 1 ? (
                  <Button onClick={handleNext} className="gap-2">
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleComplete} 
                    disabled={loading}
                    className="gap-2 bg-gradient-to-r from-primary to-primary/80"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    {loading ? 'Creating...' : 'Complete Setup'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PanelOnboarding;
