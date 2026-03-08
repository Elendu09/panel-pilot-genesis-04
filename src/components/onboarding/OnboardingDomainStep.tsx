import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Globe, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Copy,
  ShoppingCart,
  Search,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Sparkles
} from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";
import { DomainRegistrarLinks } from './DomainRegistrarLinks';
import { OnboardingCurrencySelector } from './OnboardingCurrencySelector';
import { PRIMARY_PLATFORM_DOMAIN, VERCEL_IP, VERCEL_CNAME } from '@/lib/hosting-config';

interface OnboardingDomainStepProps {
  selectedPlan: 'free' | 'basic' | 'pro';
  panelName: string;
  subdomain: string;
  customDomain: string;
  domainType: 'subdomain' | 'custom';
  onSubdomainChange: (value: string) => void;
  onCustomDomainChange: (value: string) => void;
  onDomainTypeChange: (value: 'subdomain' | 'custom') => void;
  subdomainAvailable: boolean | null;
  checkingSubdomain: boolean;
  currency?: string;
  onCurrencyChange?: (value: string) => void;
  panelId?: string;
  onVerificationStateChange?: (state: { step: 'configure' | 'txt-pending' | 'dns-pending' | 'verified'; token: string | null }) => void;
}

type DomainOption = 'have-domain' | 'register-new' | 'free-subdomain';

const tldOptions = [
  { value: '.com', label: '.com', price: '$10-15/yr' },
  { value: '.net', label: '.net', price: '$12-15/yr' },
  { value: '.org', label: '.org', price: '$12-15/yr' },
  { value: '.io', label: '.io', price: '$30-50/yr' },
  { value: '.store', label: '.store', price: '$5-20/yr' },
  { value: '.shop', label: '.shop', price: '$5-15/yr' },
  { value: '.online', label: '.online', price: '$3-10/yr' },
  { value: '.co', label: '.co', price: '$20-30/yr' },
  { value: '.app', label: '.app', price: '$15-20/yr' },
  { value: '.dev', label: '.dev', price: '$15-20/yr' }
];

interface DnsRecord {
  type: string;
  name: string;
  value: string;
  ttl: number;
  description?: string;
}

interface DnsStatus {
  checking: boolean;
  result: {
    overall_status: 'verified' | 'pending' | 'misconfigured';
    message: string;
    checks_passed: number;
    total_checks: number;
  } | null;
}

export const OnboardingDomainStep = ({
  selectedPlan,
  panelName,
  subdomain,
  customDomain,
  domainType,
  onSubdomainChange,
  onCustomDomainChange,
  onDomainTypeChange,
  subdomainAvailable,
  checkingSubdomain,
  currency = 'USD',
  onCurrencyChange,
  panelId,
  onVerificationStateChange
}: OnboardingDomainStepProps) => {
  const { toast } = useToast();
  const canUseCustomDomain = selectedPlan !== 'free';
  
  const [domainOption, setDomainOption] = useState<DomainOption>('have-domain');
  const [searchDomain, setSearchDomain] = useState('');
  const [selectedTld, setSelectedTld] = useState('.com');
  const [dnsRecords, setDnsRecords] = useState<DnsRecord[]>([
    { type: 'A', name: '@', value: VERCEL_IP, ttl: 3600, description: 'Root domain' },
    { type: 'CNAME', name: 'www', value: VERCEL_CNAME, ttl: 3600, description: 'WWW subdomain' }
  ]);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [addingDomain, setAddingDomain] = useState(false);
  const [dnsStatus, setDnsStatus] = useState<DnsStatus>({ checking: false, result: null });
  const [verificationStep, setVerificationStep] = useState<'configure' | 'txt-pending' | 'dns-pending' | 'verified'>('configure');
  const [pollingActive, setPollingActive] = useState(false);

  useEffect(() => {
    if (!pollingActive || !customDomain || verificationStep === 'verified') return;

    const interval = setInterval(() => {
      checkDnsStatus(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [pollingActive, customDomain, verificationStep, verificationToken]);

  const handleDomainSubmit = async () => {
    if (!customDomain || !canUseCustomDomain) return;
    
    setAddingDomain(true);
    try {
      if (!panelId) {
        toast({ variant: 'destructive', title: 'Panel not ready', description: 'Please complete previous steps first so your panel is created.' });
        setAddingDomain(false);
        return;
      }
      const { data, error } = await supabase.functions.invoke('add-vercel-domain', {
        body: { domain: customDomain, panel_id: panelId }
      });

      if (error) throw error;

      if (data.dns_records) {
        setDnsRecords(data.dns_records);
      }
      if (data.verification_token) {
        setVerificationToken(data.verification_token);
      } else if (!verificationToken) {
        setVerificationToken(crypto.randomUUID().slice(0, 12));
      }

      setVerificationStep('txt-pending');
      setPollingActive(true);
      toast({ title: 'Domain configured', description: 'Now add the DNS records shown below.' });
    } catch (error: any) {
      console.error('Error adding domain:', error);
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to configure domain' });
    } finally {
      setAddingDomain(false);
    }
  };

  const checkDnsStatus = async (showToasts = true) => {
    if (!customDomain) return;
    
    setDnsStatus(prev => ({ ...prev, checking: true }));
    try {
      const { data, error } = await supabase.functions.invoke('verify-domain-dns', {
        body: { 
          domain: customDomain,
          expected_txt_value: verificationToken ? `smmpilot-verify=${verificationToken}` : undefined
        }
      });

      if (error) throw error;

      const result = {
        overall_status: data.overall_status as 'verified' | 'pending' | 'misconfigured',
        message: data.message,
        checks_passed: data.checks_passed,
        total_checks: data.total_checks
      };

      setDnsStatus({ checking: false, result });

      if (data.txt_record?.found && verificationStep === 'txt-pending') {
        setVerificationStep('dns-pending');
        if (showToasts) {
          toast({ title: 'TXT Record Verified!', description: 'Now configure your A and CNAME records.' });
        }
      }

      if (data.overall_status === 'verified') {
        setVerificationStep('verified');
        setPollingActive(false);

        if (panelId) {
          await supabase
            .from('panels')
            .update({ custom_domain: customDomain })
            .eq('id', panelId);
        }

        if (showToasts) {
          toast({ title: 'Domain Verified!', description: 'Your custom domain is now active.' });
        }
      }
    } catch (error: any) {
      console.error('Error checking DNS:', error);
      setDnsStatus(prev => ({ ...prev, checking: false }));
      if (showToasts) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to check DNS status' });
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard' });
  };

  // If free plan, show subdomain option only
  if (selectedPlan === 'free') {
    return (
      <div className="space-y-4">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-medium mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Free Forever</span>
          </div>
          <h2 className="text-2xl font-bold">Set Up Your Domain</h2>
          <p className="text-sm text-muted-foreground">Your panel will be available on a free subdomain</p>
        </div>

        <Card className="border border-primary/30 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold">Free Subdomain</h3>
                <p className="text-xs text-muted-foreground">SSL Included</p>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs">Free</Badge>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">Choose Your Subdomain</Label>
              <div className="flex items-center gap-1.5">
                <Input
                  value={subdomain}
                  onChange={(e) => onSubdomainChange(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                  placeholder="mysmm"
                  className="bg-background/50 h-10"
                />
                <div className="px-3 h-10 flex items-center bg-muted/50 rounded-md border border-border shrink-0">
                  <span className="text-xs text-muted-foreground font-medium">.{PRIMARY_PLATFORM_DOMAIN}</span>
                </div>
              </div>
              
              {checkingSubdomain && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Checking...
                </p>
              )}
              {subdomainAvailable === true && subdomain.length >= 3 && (
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-emerald-500/10 text-emerald-600 text-xs">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Available!</span>
                </div>
              )}
              {subdomainAvailable === false && (
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-destructive/10 text-destructive text-xs">
                  <XCircle className="w-4 h-4" />
                  <span className="font-medium">Already taken</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Currency Selector */}
        {onCurrencyChange && (
          <OnboardingCurrencySelector value={currency} onChange={onCurrencyChange} />
        )}

        {/* Preview */}
        <Card className="border border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground leading-tight">Your panel URL:</p>
                <p className="text-sm font-semibold text-primary truncate">
                  https://{subdomain || 'yourname'}.{PRIMARY_PLATFORM_DOMAIN}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Pro/Basic plans - show custom domain options
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Set Up Your Domain</h2>
        <p className="text-muted-foreground">Configure your custom domain for a professional look</p>
      </div>

      <RadioGroup 
        value={domainOption} 
        onValueChange={(value: DomainOption) => {
          setDomainOption(value);
          onDomainTypeChange(value === 'free-subdomain' ? 'subdomain' : 'custom');
        }}
        className="space-y-4"
      >
        {/* Option 1: I have a domain */}
        <div className={cn(
          "rounded-xl border-2 transition-all",
          domainOption === 'have-domain' ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        )}>
          <div 
            className="flex items-start space-x-3 p-4 cursor-pointer"
            onClick={() => setDomainOption('have-domain')}
          >
            <RadioGroupItem value="have-domain" id="have-domain" className="mt-1" />
            <div className="flex-1">
              <Label htmlFor="have-domain" className="font-medium cursor-pointer text-base">
                I have a domain name
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Enter your domain and configure DNS records to point to your panel
              </p>
            </div>
          </div>

          {domainOption === 'have-domain' && (
            <div className="px-4 pb-4 pt-0 space-y-4">
              {/* Domain Input */}
              <div className="space-y-2">
                <Label>Your Domain</Label>
                <div className="flex gap-2">
                  <Input
                    value={customDomain}
                    onChange={(e) => onCustomDomainChange(e.target.value.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, ''))}
                    placeholder="yourdomain.com"
                    className="bg-background/50"
                  />
                  <Button 
                    onClick={handleDomainSubmit}
                    disabled={!customDomain || addingDomain}
                    variant="secondary"
                  >
                    {addingDomain ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Configure'}
                  </Button>
                </div>
              </div>

              {customDomain && verificationStep !== 'configure' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                        verificationStep === 'txt-pending' ? "bg-primary text-primary-foreground" : "bg-emerald-500 text-white"
                      )}>
                        {verificationStep !== 'txt-pending' ? <CheckCircle className="w-3.5 h-3.5" /> : '1'}
                      </div>
                      <span className="text-xs font-medium">TXT</span>
                    </div>
                    <div className="flex-1 h-0.5 bg-border rounded">
                      <div className={cn("h-full rounded transition-all", verificationStep !== 'txt-pending' ? "bg-emerald-500 w-full" : "bg-primary/30 w-0")} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                        verificationStep === 'dns-pending' ? "bg-primary text-primary-foreground" : verificationStep === 'verified' ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                      )}>
                        {verificationStep === 'verified' ? <CheckCircle className="w-3.5 h-3.5" /> : '2'}
                      </div>
                      <span className="text-xs font-medium">DNS</span>
                    </div>
                    <div className="flex-1 h-0.5 bg-border rounded">
                      <div className={cn("h-full rounded transition-all", verificationStep === 'verified' ? "bg-emerald-500 w-full" : "bg-primary/30 w-0")} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                        verificationStep === 'verified' ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                      )}>
                        {verificationStep === 'verified' ? <CheckCircle className="w-3.5 h-3.5" /> : '3'}
                      </div>
                      <span className="text-xs font-medium">Live</span>
                    </div>
                  </div>

                  {verificationStep === 'verified' && (
                    <Card className="border-emerald-500/30 bg-emerald-500/5">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-6 h-6 text-emerald-500" />
                          <div>
                            <p className="font-medium text-emerald-600">Domain Verified!</p>
                            <p className="text-xs text-muted-foreground">Your custom domain is active and ready to use.</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {verificationStep === 'txt-pending' && (
                    <Card className="border-amber-500/30 bg-amber-500/5">
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2 text-amber-600">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <span className="font-medium text-sm">Step 1: Verify domain ownership</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => checkDnsStatus()}
                            disabled={dnsStatus.checking}
                            className="text-primary"
                            data-testid="button-check-txt"
                          >
                            {dnsStatus.checking ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <RefreshCw className="w-4 h-4 mr-1" />
                                Check Now
                              </>
                            )}
                          </Button>
                        </div>
                        
                        <p className="text-xs text-muted-foreground">
                          Add this TXT record at your domain registrar to prove ownership.
                        </p>

                        {verificationToken && (
                          <div className="p-3 rounded-lg bg-background/50 text-sm font-mono space-y-2">
                            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
                              <span className="text-muted-foreground">Type:</span>
                              <Badge variant="outline" className="w-fit">TXT</Badge>
                              <span className="text-muted-foreground">Host:</span>
                              <code className="break-all">_smmpilot</code>
                              <span className="text-muted-foreground">Value:</span>
                              <div className="flex items-center gap-1.5">
                                <code className="break-all text-xs">smmpilot-verify={verificationToken}</code>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="shrink-0"
                                  onClick={() => copyToClipboard(`smmpilot-verify=${verificationToken}`)}
                                  data-testid="button-copy-txt-value"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}

                        {pollingActive && !dnsStatus.checking && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            Auto-checking every 30 seconds...
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {verificationStep === 'dns-pending' && (
                    <Card className="border-amber-500/30 bg-amber-500/5">
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2 text-amber-600">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <span className="font-medium text-sm">Step 2: Configure DNS records</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => checkDnsStatus()}
                            disabled={dnsStatus.checking}
                            className="text-primary"
                            data-testid="button-check-dns"
                          >
                            {dnsStatus.checking ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <RefreshCw className="w-4 h-4 mr-1" />
                                Verify DNS
                              </>
                            )}
                          </Button>
                        </div>

                        <p className="text-xs text-muted-foreground bg-background/50 p-2 rounded-lg">
                          Do NOT change your nameservers. Only add these records to your existing DNS settings.
                        </p>

                        <div className="space-y-2">
                          {dnsRecords.filter(r => r.type !== 'TXT').map((record, i) => (
                            <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-lg bg-background/50 text-sm font-mono">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="shrink-0 w-16 justify-center">{record.type}</Badge>
                                <span className="text-muted-foreground">{record.name}</span>
                              </div>
                              <span className="flex-1 text-xs sm:text-sm break-all">{record.value}</span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="shrink-0 self-end sm:self-auto"
                                onClick={() => copyToClipboard(record.value)}
                                data-testid={`button-copy-${record.type.toLowerCase()}-value`}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>

                        {pollingActive && !dnsStatus.checking && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            Auto-checking every 30 seconds...
                          </p>
                        )}

                        <p className="text-xs text-muted-foreground">
                          DNS changes can take up to 48 hours to propagate. You can complete setup now and verify later from Domain Settings.
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {dnsStatus.result && verificationStep !== 'verified' && (
                    <div className={cn(
                      "flex items-center gap-2 p-3 rounded-lg",
                      dnsStatus.result.overall_status === 'verified' && "bg-emerald-500/10 text-emerald-600",
                      dnsStatus.result.overall_status === 'pending' && "bg-amber-500/10 text-amber-600",
                      dnsStatus.result.overall_status === 'misconfigured' && "bg-destructive/10 text-destructive"
                    )}>
                      {dnsStatus.result.overall_status === 'verified' ? (
                        <CheckCircle className="w-5 h-5 shrink-0" />
                      ) : dnsStatus.result.overall_status === 'pending' ? (
                        <Loader2 className="w-5 h-5 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 shrink-0" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{dnsStatus.result.message}</p>
                        <p className="text-xs opacity-80">
                          {dnsStatus.result.checks_passed}/{dnsStatus.result.total_checks} records verified
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Option 2: Register new domain */}
        <div className={cn(
          "rounded-xl border-2 transition-all",
          domainOption === 'register-new' ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        )}>
          <div 
            className="flex items-start space-x-3 p-4 cursor-pointer"
            onClick={() => setDomainOption('register-new')}
          >
            <RadioGroupItem value="register-new" id="register-new" className="mt-1" />
            <div className="flex-1">
              <Label htmlFor="register-new" className="font-medium cursor-pointer text-base">
                I want to register a new domain
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Find and purchase your perfect domain name from trusted registrars
              </p>
            </div>
            <ShoppingCart className="w-5 h-5 text-muted-foreground" />
          </div>

          {domainOption === 'register-new' && (
            <div className="px-4 pb-4 pt-0 space-y-4 overflow-hidden min-w-0">
              {/* Domain Search */}
              <div className="space-y-2">
                <Label>Search for a domain</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    value={searchDomain}
                    onChange={(e) => setSearchDomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="mydomain"
                    className="bg-background/50 flex-1"
                  />
                  <Select value={selectedTld} onValueChange={setSelectedTld}>
                    <SelectTrigger className="w-full sm:w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tldOptions.map(tld => (
                        <SelectItem key={tld.value} value={tld.value}>
                          <span className="flex items-center justify-between gap-2">
                            <span>{tld.label}</span>
                            <span className="text-[10px] text-muted-foreground">{tld.price}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {searchDomain && (
                  <p className="text-sm text-muted-foreground">
                    Searching for: <strong>{searchDomain}{selectedTld}</strong>
                  </p>
                )}
              </div>

              {/* Registrar Links */}
              <DomainRegistrarLinks searchDomain={searchDomain ? `${searchDomain}${selectedTld}` : ''} />
            </div>
          )}
        </div>

        {/* Option 3: Free Subdomain */}
        <div className={cn(
          "rounded-xl border-2 transition-all",
          domainOption === 'free-subdomain' ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        )}>
          <div 
            className="flex items-start space-x-3 p-4 cursor-pointer"
            onClick={() => { setDomainOption('free-subdomain'); onDomainTypeChange('subdomain'); }}
          >
            <RadioGroupItem value="free-subdomain" id="free-subdomain" className="mt-1" />
            <div className="flex-1">
              <Label htmlFor="free-subdomain" className="font-medium cursor-pointer text-base">
                Use Free Subdomain
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Use a free *.{PRIMARY_PLATFORM_DOMAIN} subdomain — no cost, instant setup
              </p>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Free</Badge>
          </div>

          {domainOption === 'free-subdomain' && (
            <div className="px-4 pb-4 pt-0 space-y-3">
              <Label className="text-sm font-medium">Choose Your Subdomain</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={subdomain}
                  onChange={(e) => onSubdomainChange(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                  placeholder="mysmm"
                  className="bg-background/50 h-12"
                />
                <div className="px-3 h-12 flex items-center bg-muted/50 rounded-lg border border-border text-sm">
                  <span className="text-muted-foreground">.{PRIMARY_PLATFORM_DOMAIN}</span>
                </div>
              </div>
              {checkingSubdomain && (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Checking availability...
                </p>
              )}
              {subdomainAvailable === true && subdomain.length >= 3 && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 text-emerald-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Subdomain available!</span>
                </div>
              )}
              {subdomainAvailable === false && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
                  <XCircle className="w-5 h-5" />
                  <span className="font-medium">Subdomain already taken</span>
                </div>
              )}
            </div>
          )}
        </div>
      </RadioGroup>

      {/* Currency Selector */}
      {onCurrencyChange && (
        <OnboardingCurrencySelector value={currency} onChange={onCurrencyChange} />
      )}

      {/* Preview */}
      <Card className="bg-card/60 backdrop-blur-xl border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Your panel will be available at:</p>
              <p className="font-medium text-primary">
                {domainOption === 'free-subdomain'
                  ? `https://${subdomain || 'yourname'}.${PRIMARY_PLATFORM_DOMAIN}`
                  : customDomain 
                    ? `https://${customDomain}`
                    : searchDomain 
                      ? `https://${searchDomain}${selectedTld}` 
                      : `https://${subdomain || 'yourname'}.${PRIMARY_PLATFORM_DOMAIN}`
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
