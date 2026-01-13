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
  RefreshCw
} from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";
import { DomainRegistrarLinks } from './DomainRegistrarLinks';
import { OnboardingCurrencySelector } from './OnboardingCurrencySelector';

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
}

type DomainOption = 'have-domain' | 'register-new';

const tldOptions = ['.com', '.net', '.org', '.io', '.store', '.shop', '.online', '.co', '.app', '.dev'];

interface DnsRecord {
  type: string;
  name: string;
  value: string;
  ttl: number;
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
  onCurrencyChange
}: OnboardingDomainStepProps) => {
  const { toast } = useToast();
  const canUseCustomDomain = selectedPlan !== 'free';
  
  // Custom domain state
  const [domainOption, setDomainOption] = useState<DomainOption>('have-domain');
  const [searchDomain, setSearchDomain] = useState('');
  const [selectedTld, setSelectedTld] = useState('.com');
  const [dnsRecords, setDnsRecords] = useState<DnsRecord[]>([
    { type: 'A', name: '@', value: '76.76.21.21', ttl: 3600 },
    { type: 'CNAME', name: 'www', value: 'cname.vercel-dns.com', ttl: 3600 }
  ]);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [addingDomain, setAddingDomain] = useState(false);
  const [dnsStatus, setDnsStatus] = useState<DnsStatus>({ checking: false, result: null });

  // When custom domain changes, register it with Vercel
  const handleDomainSubmit = async () => {
    if (!customDomain || !canUseCustomDomain) return;
    
    setAddingDomain(true);
    try {
      const { data, error } = await supabase.functions.invoke('add-vercel-domain', {
        body: { domain: customDomain, panel_id: 'pending' }
      });

      if (error) throw error;

      if (data.dns_records) {
        setDnsRecords(data.dns_records);
      }
      if (data.verification_token) {
        setVerificationToken(data.verification_token);
      }

      toast({ title: 'Domain configured', description: data.message });
    } catch (error: any) {
      console.error('Error adding domain:', error);
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to configure domain' });
    } finally {
      setAddingDomain(false);
    }
  };

  // Check DNS status
  const checkDnsStatus = async () => {
    if (!customDomain) return;
    
    setDnsStatus({ checking: true, result: null });
    try {
      const { data, error } = await supabase.functions.invoke('verify-domain-dns', {
        body: { 
          domain: customDomain,
          expected_txt_value: verificationToken ? `homeofsmm-verify=${verificationToken}` : undefined
        }
      });

      if (error) throw error;

      setDnsStatus({
        checking: false,
        result: {
          overall_status: data.overall_status,
          message: data.message,
          checks_passed: data.checks_passed,
          total_checks: data.total_checks
        }
      });

      if (data.overall_status === 'verified') {
        toast({ title: 'DNS Verified!', description: 'Your domain is correctly configured.' });
      }
    } catch (error: any) {
      console.error('Error checking DNS:', error);
      setDnsStatus({ checking: false, result: null });
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to check DNS status' });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard' });
  };

  // If free plan, show subdomain option only
  if (selectedPlan === 'free') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Set Up Your Domain</h2>
          <p className="text-muted-foreground">Your panel will be available on a free subdomain</p>
        </div>

        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Globe className="w-6 h-6 text-primary" />
              <div>
                <h3 className="font-semibold">Free Subdomain</h3>
                <p className="text-sm text-muted-foreground">Included with your plan</p>
              </div>
              <Badge className="ml-auto bg-emerald-500/10 text-emerald-500">Free</Badge>
            </div>

            <div className="space-y-2">
              <Label>Choose Your Subdomain</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={subdomain}
                  onChange={(e) => onSubdomainChange(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
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
              {subdomainAvailable === true && subdomain.length >= 3 && (
                <p className="text-sm text-emerald-500 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Subdomain available!
                </p>
              )}
              {subdomainAvailable === false && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <XCircle className="w-4 h-4" />
                  Subdomain already taken
                </p>
              )}
            </div>
          </CardContent>
        </Card>

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
                  https://{subdomain || 'yourname'}.homeofsmm.com
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
        onValueChange={(value: DomainOption) => setDomainOption(value)}
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

              {/* DNS Records */}
              {customDomain && (
                <Card className="border-amber-500/30 bg-amber-500/5">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-amber-600">
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-medium">Add these DNS records at your registrar</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={checkDnsStatus}
                        disabled={dnsStatus.checking}
                        className="text-primary"
                      >
                        {dnsStatus.checking ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Check DNS
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <p className="text-xs text-muted-foreground bg-background/50 p-2 rounded-lg">
                      ⚠️ Do NOT change your nameservers. Only add these records to your existing DNS settings.
                    </p>

                    <div className="space-y-2">
                      {dnsRecords.map((record, i) => (
                        <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-background/50 text-sm font-mono">
                          <Badge variant="outline" className="shrink-0 w-16 justify-center">{record.type}</Badge>
                          <span className="w-24 shrink-0 text-muted-foreground">{record.name}</span>
                          <span className="flex-1 truncate">{record.value}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 shrink-0"
                            onClick={() => copyToClipboard(record.value)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      
                      {verificationToken && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-background/50 text-sm font-mono">
                          <Badge variant="outline" className="shrink-0 w-16 justify-center">TXT</Badge>
                          <span className="w-24 shrink-0 text-muted-foreground">_homeofsmm</span>
                          <span className="flex-1 truncate">homeofsmm-verify={verificationToken}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 shrink-0"
                            onClick={() => copyToClipboard(`homeofsmm-verify=${verificationToken}`)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* DNS Status */}
                    {dnsStatus.result && (
                      <div className={cn(
                        "flex items-center gap-2 p-3 rounded-lg",
                        dnsStatus.result.overall_status === 'verified' && "bg-emerald-500/10 text-emerald-600",
                        dnsStatus.result.overall_status === 'pending' && "bg-amber-500/10 text-amber-600",
                        dnsStatus.result.overall_status === 'misconfigured' && "bg-destructive/10 text-destructive"
                      )}>
                        {dnsStatus.result.overall_status === 'verified' ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : dnsStatus.result.overall_status === 'pending' ? (
                          <Loader2 className="w-5 h-5" />
                        ) : (
                          <XCircle className="w-5 h-5" />
                        )}
                        <div>
                          <p className="font-medium">{dnsStatus.result.message}</p>
                          <p className="text-xs opacity-80">
                            {dnsStatus.result.checks_passed}/{dnsStatus.result.total_checks} records verified
                          </p>
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground">
                      DNS changes can take up to 48 hours to propagate. You can complete setup now and verify later.
                    </p>
                  </CardContent>
                </Card>
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
            <div className="px-4 pb-4 pt-0 space-y-4">
              {/* Domain Search */}
              <div className="space-y-2">
                <Label>Search for a domain</Label>
                <div className="flex gap-2">
                  <Input
                    value={searchDomain}
                    onChange={(e) => setSearchDomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="mydomain"
                    className="bg-background/50"
                  />
                  <Select value={selectedTld} onValueChange={setSelectedTld}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tldOptions.map(tld => (
                        <SelectItem key={tld} value={tld}>{tld}</SelectItem>
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
                {customDomain 
                  ? `https://${customDomain}`
                  : searchDomain 
                    ? `https://${searchDomain}${selectedTld}` 
                    : `https://${subdomain || 'yourname'}.homeofsmm.com`
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
