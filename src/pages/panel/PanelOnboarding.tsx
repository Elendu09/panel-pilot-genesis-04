import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Globe, Upload, Palette, Search, Settings, ArrowRight } from 'lucide-react';

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
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Step 4: SEO
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');

  const steps = [
    { id: 0, title: 'Basic Info', icon: Settings },
    { id: 1, title: 'Domain Setup', icon: Globe },
    { id: 2, title: 'Branding', icon: Palette },
    { id: 3, title: 'SEO Setup', icon: Search },
  ];

  useEffect(() => {
    if (!user || !profile || profile.role !== 'panel_owner') {
      navigate('/auth');
      return;
    }
    
    // Check if user already has a completed panel
    const checkExistingPanel = async () => {
      const { data: existingPanel } = await supabase
        .from('panels')
        .select('*')
        .eq('owner_id', profile.id)
        .eq('onboarding_completed', true)
        .single();
        
      if (existingPanel) {
        navigate('/panel');
      }
    };
    
    checkExistingPanel();
  }, [user, profile, navigate]);

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
        .single();

      setSubdomainAvailable(!data && error?.code === 'PGRST116');
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
    if (currentStep === 1 && domainType === 'subdomain' && !subdomainAvailable) {
      toast({
        variant: "destructive",
        title: "Subdomain Required",
        description: "Please choose an available subdomain."
      });
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
      toast({
        variant: "destructive",
        title: "Panel Name Required",
        description: "Please enter a panel name."
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('panels')
        .insert([
          {
            name: panelName,
            description: description || null,
            owner_id: profile.id,
            status: 'pending',
            theme_type: 'dark_gradient',
            subdomain: domainType === 'subdomain' ? subdomain : panelName.toLowerCase().replace(/[^a-zA-Z0-9]/g, '').substring(0, 20) || 'panel',
            custom_domain: domainType === 'custom' ? customDomain : null,
            primary_color: primaryColor,
            secondary_color: secondaryColor,
            onboarding_completed: true
          }
        ]);

      if (error) throw error;

      // Create panel settings
      const { data: panelData } = await supabase
        .from('panels')
        .select('id')
        .eq('owner_id', profile.id)
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
        title: "Panel Created Successfully!",
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="panelName">Panel Name *</Label>
              <Input
                id="panelName"
                value={panelName}
                onChange={(e) => setPanelName(e.target.value)}
                placeholder="My SMM Business"
                required
              />
              <p className="text-sm text-muted-foreground">
                This will be displayed as your brand name
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Panel Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Professional SMM services for businesses and individuals..."
                rows={3}
              />
              <p className="text-sm text-muted-foreground">
                Brief description of your services (optional)
              </p>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label>Choose Your Domain Setup</Label>
              <RadioGroup value={domainType} onValueChange={(value: 'subdomain' | 'custom') => setDomainType(value)}>
                <div className="flex items-center space-x-2 p-4 border rounded-lg">
                  <RadioGroupItem value="subdomain" id="subdomain" />
                  <div className="flex-1">
                    <Label htmlFor="subdomain" className="font-medium">Free Subdomain</Label>
                    <p className="text-sm text-muted-foreground">Get a free subdomain like yourname.smmpilot.online</p>
                  </div>
                  <Badge variant="secondary">Free</Badge>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg">
                  <RadioGroupItem value="custom" id="custom" />
                  <div className="flex-1">
                    <Label htmlFor="custom" className="font-medium">Custom Domain</Label>
                    <p className="text-sm text-muted-foreground">Use your own domain (you'll need to configure DNS)</p>
                  </div>
                  <Badge variant="outline">Pro</Badge>
                </div>
              </RadioGroup>
            </div>

            {domainType === 'subdomain' && (
              <div className="space-y-2">
                <Label htmlFor="subdomainInput">Choose Your Subdomain</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="subdomainInput"
                    value={subdomain}
                    onChange={(e) => handleSubdomainChange(e.target.value)}
                    placeholder="mysmm"
                  />
                  <span className="text-sm text-muted-foreground">.smmpilot.online</span>
                </div>
                {checkingSubdomain && (
                  <p className="text-sm text-muted-foreground">Checking availability...</p>
                )}
                {subdomainAvailable === true && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Subdomain available
                  </p>
                )}
                {subdomainAvailable === false && (
                  <p className="text-sm text-red-600">Subdomain already taken</p>
                )}
              </div>
            )}

            {domainType === 'custom' && (
              <div className="space-y-2">
                <Label htmlFor="customDomainInput">Your Custom Domain</Label>
                <Input
                  id="customDomainInput"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="yourdomain.com"
                />
                <p className="text-sm text-muted-foreground">
                  You'll receive DNS configuration instructions after setup
                </p>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label>Brand Colors</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-20 h-10 p-1 border rounded"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-20 h-10 p-1 border rounded"
                    />
                    <Input
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      placeholder="#1e40af"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <Label>Logo Upload (Optional)</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">Upload your logo (PNG, JPG - Max 2MB)</p>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                  className="w-auto mx-auto"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="seoTitle">SEO Title</Label>
              <Input
                id="seoTitle"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder={panelName ? `${panelName} - Professional SMM Services` : "Your Business - Professional SMM Services"}
              />
              <p className="text-sm text-muted-foreground">
                Appears in search results and browser tabs (50-60 characters recommended)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="seoDescription">SEO Description</Label>
              <Textarea
                id="seoDescription"
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Get professional social media marketing services including followers, likes, views, and more. Boost your online presence today!"
                rows={3}
              />
              <p className="text-sm text-muted-foreground">
                Appears in search results (150-160 characters recommended)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="seoKeywords">SEO Keywords</Label>
              <Input
                id="seoKeywords"
                value={seoKeywords}
                onChange={(e) => setSeoKeywords(e.target.value)}
                placeholder="SMM, social media marketing, followers, likes, Instagram, TikTok"
              />
              <p className="text-sm text-muted-foreground">
                Comma-separated keywords related to your services
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex items-center justify-center p-4">
      <Helmet>
        <title>Setup Your Panel - SMMPilot</title>
        <meta name="description" content="Complete your SMM panel setup with domain configuration, branding, and SEO optimization." />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      
      <Card className="w-full max-w-2xl bg-card/80 backdrop-blur-sm border-border shadow-card">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Setup Your Panel
          </CardTitle>
          <CardDescription>
            Complete the setup to launch your professional SMM panel
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Progress Steps */}
          <div className="flex justify-between items-center mb-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isCompleted ? 'bg-primary border-primary text-primary-foreground' :
                    isActive ? 'border-primary text-primary' : 'border-border text-muted-foreground'
                  }`}>
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    isActive ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 ml-4 ${
                      isCompleted ? 'bg-primary' : 'bg-border'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step Content */}
          <div className="min-h-[300px]">
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            
            {currentStep < steps.length - 1 ? (
              <Button onClick={handleNext} className="gap-2">
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleComplete} disabled={loading} className="gap-2">
                {loading ? 'Creating...' : 'Complete Setup'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PanelOnboarding;