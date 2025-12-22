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
  Upload, 
  Palette, 
  Search, 
  Settings, 
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const PanelOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
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

  // Step 3: Branding
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');
  const [secondaryColor, setSecondaryColor] = useState('#1e40af');

  // Step 4: SEO
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');

  const steps = [
    { id: 0, title: 'Basic Info', icon: Settings, description: 'Name your panel' },
    { id: 1, title: 'Domain', icon: Globe, description: 'Choose your URL' },
    { id: 2, title: 'Branding', icon: Palette, description: 'Customize look' },
    { id: 3, title: 'SEO', icon: Search, description: 'Optimize search' },
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  useEffect(() => {
    if (!user || !profile || profile.role !== 'panel_owner') {
      navigate('/auth');
      return;
    }
    
    const checkExistingPanel = async () => {
      const { data: existingPanel } = await supabase
        .from('panels')
        .select('*')
        .eq('owner_id', profile.id)
        .eq('onboarding_completed', true)
        .maybeSingle();
        
      if (existingPanel) {
        navigate('/panel');
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
      const { data, error } = await supabase
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

  const handleNext = () => {
    if (currentStep === 0 && !panelName.trim()) {
      toast({ variant: "destructive", title: "Panel name required" });
      return;
    }
    
    if (currentStep === 1 && domainType === 'subdomain' && !subdomainAvailable) {
      toast({ variant: "destructive", title: "Please choose an available subdomain" });
      return;
    }
    
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

    setLoading(true);
    try {
      const finalSubdomain = domainType === 'subdomain' 
        ? subdomain 
        : panelName.toLowerCase().replace(/[^a-zA-Z0-9]/g, '').substring(0, 20) || 'panel';

      const { error } = await supabase
        .from('panels')
        .insert([
          {
            name: panelName,
            description: description || null,
            owner_id: profile?.id,
            status: 'pending',
            theme_type: 'dark_gradient',
            subdomain: finalSubdomain,
            custom_domain: domainType === 'custom' ? customDomain : null,
            primary_color: primaryColor,
            secondary_color: secondaryColor,
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
              seo_title: seoTitle || panelName,
              seo_description: seoDescription || `Professional SMM services by ${panelName}`,
              seo_keywords: seoKeywords || 'SMM, social media marketing, services'
            }
          ]);
      }

      toast({
        title: "Panel Created! 🎉",
        description: "Your panel is being reviewed and will be active soon."
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
                  <p className="text-sm text-muted-foreground">yourname.smmpilot.online</p>
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
                  <span className="text-sm text-muted-foreground whitespace-nowrap">.smmpilot.online</span>
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

      case 3:
        return (
          <motion.div
            key="step3"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label>SEO Title</Label>
              <Input
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder={panelName ? `${panelName} - Professional SMM Services` : "Your Business - SMM Services"}
                className="bg-background/50"
              />
              <p className="text-xs text-muted-foreground">50-60 characters recommended</p>
            </div>
            
            <div className="space-y-2">
              <Label>SEO Description</Label>
              <Textarea
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Get professional social media marketing services..."
                rows={3}
                className="bg-background/50"
              />
              <p className="text-xs text-muted-foreground">150-160 characters recommended</p>
            </div>
            
            <div className="space-y-2">
              <Label>SEO Keywords</Label>
              <Input
                value={seoKeywords}
                onChange={(e) => setSeoKeywords(e.target.value)}
                placeholder="SMM, social media marketing, followers, likes"
                className="bg-background/50"
              />
              <p className="text-xs text-muted-foreground">Comma-separated keywords</p>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex items-center justify-center p-4">
      <Helmet>
        <title>Setup Your Panel - SMMPilot</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      
      <div className="w-full max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Step {currentStep + 1} of {steps.length}</p>
            <p className="text-sm font-medium">{Math.round(progress)}% Complete</p>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Kanban-style Step Cards - Desktop */}
          <div className="hidden lg:flex flex-col gap-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
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
                  onClick={() => index <= currentStep && setCurrentStep(index)}
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
              const isCompleted = index < currentStep;
              
              return (
                <button
                  key={step.id}
                  onClick={() => index <= currentStep && setCurrentStep(index)}
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
          <Card className="lg:col-span-3 bg-card/80 backdrop-blur-xl border-border/50 shadow-xl">
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
