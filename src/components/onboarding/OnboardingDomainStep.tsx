import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Globe, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Lock, 
  Copy,
  ExternalLink 
} from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";

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
  checkingSubdomain
}: OnboardingDomainStepProps) => {
  const { toast } = useToast();
  const canUseCustomDomain = selectedPlan !== 'free';
  
  const dnsRecords = [
    { type: 'A', name: '@', value: '76.76.21.21', ttl: '3600' },
    { type: 'CNAME', name: 'www', value: 'cname.vercel-dns.com', ttl: '3600' }
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard' });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Set Up Your Domain</h2>
        <p className="text-muted-foreground">Choose how customers will access your panel</p>
      </div>

      <RadioGroup 
        value={domainType} 
        onValueChange={(value: 'subdomain' | 'custom') => onDomainTypeChange(value)}
      >
        {/* Free Subdomain Option */}
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

        {/* Custom Domain Option */}
        <div className={cn(
          "flex items-center space-x-3 p-4 rounded-xl border-2 transition-all",
          !canUseCustomDomain && "opacity-60",
          domainType === 'custom' ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
          canUseCustomDomain ? "cursor-pointer" : "cursor-not-allowed"
        )}>
          <RadioGroupItem 
            value="custom" 
            id="custom" 
            disabled={!canUseCustomDomain}
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Label 
                htmlFor="custom" 
                className={cn("font-medium", canUseCustomDomain && "cursor-pointer")}
              >
                Custom Domain
              </Label>
              {!canUseCustomDomain && <Lock className="w-4 h-4 text-muted-foreground" />}
            </div>
            <p className="text-sm text-muted-foreground">
              {canUseCustomDomain 
                ? "Use your own domain (e.g., yourpanel.com)" 
                : "Upgrade to Basic or Pro to use custom domains"
              }
            </p>
          </div>
          <Badge variant="outline">Pro</Badge>
        </div>
      </RadioGroup>

      {/* Subdomain Input */}
      {domainType === 'subdomain' && (
        <div className="space-y-3">
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
      )}

      {/* Custom Domain Input & DNS Instructions */}
      {domainType === 'custom' && canUseCustomDomain && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Your Custom Domain</Label>
            <Input
              value={customDomain}
              onChange={(e) => onCustomDomainChange(e.target.value.toLowerCase())}
              placeholder="yourdomain.com"
              className="bg-background/50"
            />
          </div>

          {customDomain && (
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-2 text-amber-600">
                  <Globe className="w-5 h-5" />
                  <span className="font-medium">DNS Configuration Required</span>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Add these DNS records at your domain registrar:
                </p>

                <div className="space-y-2">
                  {dnsRecords.map((record, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-background/50 text-sm font-mono">
                      <Badge variant="outline" className="shrink-0">{record.type}</Badge>
                      <span className="flex-1 truncate">{record.name} → {record.value}</span>
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
                </div>

                <p className="text-xs text-muted-foreground">
                  DNS changes can take up to 48 hours to propagate. You can complete setup now and verify later.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Preview */}
      <Card className="bg-card/60 backdrop-blur-xl border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Your panel will be available at:</p>
              <p className="font-medium text-primary">
                {domainType === 'subdomain' 
                  ? `https://${subdomain || 'yourname'}.homeofsmm.com`
                  : customDomain 
                    ? `https://${customDomain}`
                    : 'https://yourdomain.com'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
