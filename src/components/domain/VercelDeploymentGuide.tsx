import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ExternalLink, 
  Copy, 
  Check, 
  AlertTriangle, 
  Server, 
  Shield, 
  Globe,
  Rocket,
  CheckCircle,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { VERCEL_NAMESERVERS, PLATFORM_DOMAIN } from "@/lib/tenant-domain-config";

interface VercelDeploymentGuideProps {
  domain?: string;
  currentStatus?: 'pending' | 'verified' | 'failed';
  onVerify?: () => void;
}

const VercelDeploymentGuide = ({ 
  domain = PLATFORM_DOMAIN, 
  currentStatus = 'pending',
  onVerify 
}: VercelDeploymentGuideProps) => {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const { toast } = useToast();

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedItem(label);
    toast({ title: "Copied!", description: `${label} copied to clipboard` });
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const steps = [
    {
      number: 1,
      title: "Change Nameservers",
      description: "Point your domain's nameservers to Vercel for automatic wildcard SSL",
      icon: Server,
      content: (
        <div className="space-y-4">
          <Alert className="bg-amber-500/10 border-amber-500/30">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertTitle className="text-amber-500">Important</AlertTitle>
            <AlertDescription>
              This will transfer DNS control to Vercel. You'll manage DNS records in Vercel dashboard.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Update your domain's nameservers to:</p>
            {VERCEL_NAMESERVERS.map((ns, i) => (
              <div 
                key={ns}
                className="flex items-center justify-between p-3 rounded-lg bg-accent/30"
              >
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">NS {i + 1}</Badge>
                  <code className="text-sm font-mono">{ns}</code>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(ns, `Nameserver ${i + 1}`)}
                >
                  {copiedItem === `Nameserver ${i + 1}` ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
          
          <p className="text-xs text-muted-foreground">
            Find this setting at your domain registrar (Namecheap, GoDaddy, Cloudflare, etc.) 
            under "Nameservers" or "DNS Settings". Wait 24-48 hours for propagation.
          </p>
        </div>
      ),
    },
    {
      number: 2,
      title: "Add Domain in Vercel",
      description: "Configure your domain in Vercel project settings",
      icon: Globe,
      content: (
        <div className="space-y-4">
          <ol className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs">1</span>
              <span>Go to your Vercel Project → Settings → Domains</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs">2</span>
              <div>
                <span>Add your apex domain:</span>
                <div className="flex items-center gap-2 mt-1">
                  <code className="px-2 py-1 bg-muted rounded text-xs">{domain}</code>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(domain, 'Domain')}>
                    {copiedItem === 'Domain' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </div>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs">3</span>
              <div>
                <span>Add wildcard domain:</span>
                <div className="flex items-center gap-2 mt-1">
                  <code className="px-2 py-1 bg-muted rounded text-xs">*.{domain}</code>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(`*.${domain}`, 'Wildcard')}>
                    {copiedItem === 'Wildcard' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </div>
              </div>
            </li>
          </ol>
          
          <Button variant="outline" size="sm" asChild>
            <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer">
              Open Vercel Dashboard
              <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </Button>
        </div>
      ),
    },
    {
      number: 3,
      title: "Automatic SSL",
      description: "Vercel provisions SSL certificates for all subdomains automatically",
      icon: Shield,
      content: (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <span className="font-medium text-emerald-500">Automatic SSL Certificates</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Once nameservers propagate and domains are verified, Vercel automatically issues 
              SSL certificates for every subdomain (e.g., panel1.{domain}, panel2.{domain}).
            </p>
          </div>
          
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="font-medium">Benefits of Vercel Wildcard SSL:</p>
            <ul className="space-y-1 ml-4">
              <li className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3" /> Unlimited subdomains
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3" /> No manual certificate management
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3" /> Instant SSL for new panels
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3" /> Auto-renewal
              </li>
            </ul>
          </div>
        </div>
      ),
    },
  ];

  return (
    <Card className="glass-card border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-primary" />
            <CardTitle>Vercel Wildcard Deployment</CardTitle>
          </div>
          <Badge 
            className={
              currentStatus === 'verified' 
                ? 'bg-emerald-500/20 text-emerald-500' 
                : currentStatus === 'failed'
                ? 'bg-red-500/20 text-red-500'
                : 'bg-amber-500/20 text-amber-500'
            }
          >
            {currentStatus === 'verified' ? 'Configured' : currentStatus === 'failed' ? 'Failed' : 'Pending'}
          </Badge>
        </div>
        <CardDescription>
          Configure Vercel hosting with automatic wildcard SSL for unlimited subdomains
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Quick Links */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href="https://vercel.com/docs/projects/domains/working-with-nameservers" target="_blank" rel="noopener noreferrer">
              Nameservers Docs
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="https://vercel.com/docs/projects/domains/using-a-custom-domain#wildcard-domains" target="_blank" rel="noopener noreferrer">
              Wildcard Domains
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="https://vercel.com/docs/multi-tenant/domain-management" target="_blank" rel="noopener noreferrer">
              Multi-Tenant Guide
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </Button>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step) => (
            <div 
              key={step.number} 
              className="p-4 rounded-xl border border-border/50 bg-accent/20"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">{step.number}</span>
                </div>
                <div>
                  <h4 className="font-medium">{step.title}</h4>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
              {step.content}
            </div>
          ))}
        </div>

        {/* Verify Button */}
        {onVerify && currentStatus !== 'verified' && (
          <Button onClick={onVerify} className="w-full">
            <CheckCircle className="w-4 h-4 mr-2" />
            Verify Configuration
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default VercelDeploymentGuide;
