import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Copy, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  Info,
  Globe,
  Server,
  Cloud
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { HostingProviderSelector } from "./HostingProviderSelector";
import { DnsRecordsDisplay } from "./DnsRecordsDisplay";
import { 
  HOSTING_PROVIDERS, 
  type HostingProvider,
  getDnsRecordsForProvider
} from "@/lib/hosting-config";

interface DomainConfigWizardProps {
  domain?: string;
  onComplete?: () => void;
}

export const DomainConfigWizard = ({ domain, onComplete }: DomainConfigWizardProps) => {
  const { toast } = useToast();
  const [selectedRegistrar, setSelectedRegistrar] = useState<string>("namecheap");
  const [hostingProvider, setHostingProvider] = useState<HostingProvider>("lovable");
  const [customTarget, setCustomTarget] = useState("");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const registrars = [
    { id: "namecheap", name: "Namecheap", icon: "🟠" },
    { id: "godaddy", name: "GoDaddy", icon: "🟢" },
    { id: "cloudflare", name: "Cloudflare", icon: "🟡" },
    { id: "route53", name: "AWS Route53", icon: "🟤" },
    { id: "other", name: "Other", icon: "⚪" },
  ];

  const providerConfig = HOSTING_PROVIDERS[hostingProvider];
  const displayDomain = domain || "yourdomain.com";

  return (
    <div className="space-y-6">
      {/* Automatic Subdomain Info */}
      <Alert className="bg-emerald-500/10 border-emerald-500/20">
        <CheckCircle className="w-4 h-4 text-emerald-500" />
        <AlertDescription className="text-emerald-600 dark:text-emerald-400">
          <strong>Your Panel Subdomain Works Automatically!</strong><br />
          <span className="text-sm">
            Subdomains like <code className="bg-muted px-1 rounded">yourpanel.homeofsmm.com</code> require 
            no DNS configuration. They work instantly via our wildcard DNS setup.
          </span>
        </AlertDescription>
      </Alert>

      {/* Hosting Provider Selector */}
      <Card className="glass-card border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Server className="w-5 h-5 text-primary" />
            Step 1: Select Your Hosting Provider
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Choose where your custom domain will be hosted. This determines the correct DNS records.
          </p>
          <HostingProviderSelector
            selected={hostingProvider}
            onSelect={setHostingProvider}
            customTarget={customTarget}
            onCustomTargetChange={setCustomTarget}
          />
        </CardContent>
      </Card>

      {/* DNS Records Required */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="w-5 h-5 text-primary" />
            Step 2: Required DNS Records for {providerConfig.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <DnsRecordsDisplay 
            provider={hostingProvider}
            domain={displayDomain}
            customTarget={customTarget}
          />
          
          {hostingProvider !== 'lovable' && (
            <Alert className="bg-amber-500/10 border-amber-500/20">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <AlertDescription className="text-amber-600 dark:text-amber-400">
                <strong>External Hosting:</strong> Since you're using {providerConfig.name}, make sure your 
                domain is properly configured in their dashboard as well.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Registrar Selector */}
      <Card className="glass-card border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="w-5 h-5 text-primary" />
            Step 3: Select Your Domain Registrar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {registrars.map((registrar) => (
              <Button
                key={registrar.id}
                variant={selectedRegistrar === registrar.id ? "default" : "outline"}
                className={cn(
                  "h-auto py-4 flex flex-col gap-2",
                  selectedRegistrar === registrar.id && "ring-2 ring-primary"
                )}
                onClick={() => setSelectedRegistrar(registrar.id)}
              >
                <span className="text-2xl">{registrar.icon}</span>
                <span className="font-medium text-xs">{registrar.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step-by-Step Guide per Registrar */}
      <Tabs value={selectedRegistrar} onValueChange={setSelectedRegistrar}>
        <TabsList className="grid w-full grid-cols-5">
          {registrars.map((registrar) => (
            <TabsTrigger key={registrar.id} value={registrar.id} className="gap-1 text-xs">
              <span>{registrar.icon}</span> <span className="hidden md:inline">{registrar.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Namecheap Guide */}
        <TabsContent value="namecheap" className="space-y-4 mt-4">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                🟠 Namecheap DNS Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">1</div>
                  <div>
                    <h4 className="font-medium">Log into Namecheap</h4>
                    <p className="text-sm text-muted-foreground">
                      Go to <a href="https://www.namecheap.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">namecheap.com</a> and sign in.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">2</div>
                  <div>
                    <h4 className="font-medium">Go to Domain List → Manage → Advanced DNS</h4>
                    <p className="text-sm text-muted-foreground">
                      Find your domain and click <strong>"Advanced DNS"</strong> tab.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">3</div>
                  <div>
                    <h4 className="font-medium">Add DNS Records</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Add the records shown above. For {providerConfig.dnsType} records:
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                      <li>Host: Enter <code className="bg-muted px-1 rounded">@</code> for root domain</li>
                      <li>Host: Enter <code className="bg-muted px-1 rounded">www</code> for www subdomain</li>
                      <li>For subdomains like <code className="bg-muted px-1 rounded">soc</code>, enter just <code className="bg-muted px-1 rounded">soc</code> (NOT soc.yourdomain.com)</li>
                      <li>TTL: Set to "Automatic" or "1 Hour"</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-medium">Save & Wait</h4>
                    <p className="text-sm text-muted-foreground">
                      DNS propagation takes 15-60 minutes. We'll auto-verify once detected.
                    </p>
                  </div>
                </div>
              </div>

              <Alert className="bg-blue-500/10 border-blue-500/20">
                <Info className="w-4 h-4 text-blue-500" />
                <AlertDescription className="text-blue-600 dark:text-blue-400">
                  <strong>CNAME at Root Domain:</strong> Namecheap doesn't support CNAME at <code>@</code>. 
                  Use an <strong>ALIAS record</strong> or A record for the root domain instead.
                </AlertDescription>
              </Alert>

              <Button variant="outline" className="w-full" asChild>
                <a href="https://www.namecheap.com/support/knowledgebase/article.aspx/319/2237/how-can-i-set-up-an-a-address-record-for-my-domain/" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Namecheap DNS Guide
                </a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* GoDaddy Guide */}
        <TabsContent value="godaddy" className="space-y-4 mt-4">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                🟢 GoDaddy DNS Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">1</div>
                  <div>
                    <h4 className="font-medium">Log into GoDaddy</h4>
                    <p className="text-sm text-muted-foreground">
                      Go to <a href="https://www.godaddy.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">godaddy.com</a> → My Products → Manage DNS
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">2</div>
                  <div>
                    <h4 className="font-medium">Add DNS Records</h4>
                    <p className="text-sm text-muted-foreground">
                      Click "Add" and create the records shown above. Use TTL of "1 Hour".
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-medium">Save Each Record</h4>
                    <p className="text-sm text-muted-foreground">Click "Save" after adding each record.</p>
                  </div>
                </div>
              </div>

              <Button variant="outline" className="w-full" asChild>
                <a href="https://www.godaddy.com/help/add-an-a-record-19238" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  GoDaddy DNS Guide
                </a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cloudflare Guide */}
        <TabsContent value="cloudflare" className="space-y-4 mt-4">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                🟡 Cloudflare DNS Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-amber-500/10 border-amber-500/20">
                <Cloud className="w-4 h-4 text-amber-500" />
                <AlertDescription className="text-amber-600 dark:text-amber-400">
                  <strong>Important:</strong> Set Proxy Status to <strong>"DNS only"</strong> (gray cloud icon). 
                  Orange cloud (Proxied) can interfere with SSL provisioning.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">1</div>
                  <div>
                    <h4 className="font-medium">Log into Cloudflare</h4>
                    <p className="text-sm text-muted-foreground">
                      Go to <a href="https://dash.cloudflare.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">dash.cloudflare.com</a> and select your domain.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">2</div>
                  <div>
                    <h4 className="font-medium">Go to DNS Settings</h4>
                    <p className="text-sm text-muted-foreground">
                      Click "DNS" in the sidebar, then "Add record".
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="font-medium">Disable Proxy (Important!)</h4>
                    <p className="text-sm text-muted-foreground">
                      Click the orange cloud icon to change it to gray (DNS only).
                    </p>
                  </div>
                </div>
              </div>

              <Button variant="outline" className="w-full" asChild>
                <a href="https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Cloudflare DNS Guide
                </a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AWS Route53 Guide */}
        <TabsContent value="route53" className="space-y-4 mt-4">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                🟤 AWS Route53 DNS Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">1</div>
                  <div>
                    <h4 className="font-medium">Open Route53 Console</h4>
                    <p className="text-sm text-muted-foreground">
                      Go to AWS Console → Route53 → Hosted Zones → Select your domain.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">2</div>
                  <div>
                    <h4 className="font-medium">Create Record</h4>
                    <p className="text-sm text-muted-foreground">
                      Click "Create record" and add the DNS records shown above.
                      For root domain, use <strong>ALIAS</strong> if pointing to another AWS resource.
                    </p>
                  </div>
                </div>
              </div>

              <Button variant="outline" className="w-full" asChild>
                <a href="https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resource-record-sets-creating.html" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  AWS Route53 Guide
                </a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other Registrar Guide */}
        <TabsContent value="other" className="space-y-4 mt-4">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                ⚪ Generic DNS Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                For any domain registrar, follow these general steps:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Log into your domain registrar's control panel</li>
                <li>Find DNS Management, DNS Settings, or Zone Editor</li>
                <li>Add the DNS records shown above</li>
                <li>For subdomains like <code className="bg-muted px-1 rounded">soc</code>, enter only <code className="bg-muted px-1 rounded">soc</code> as the host</li>
                <li>Save changes and wait 15-60 minutes for propagation</li>
              </ol>

              <Alert>
                <Info className="w-4 h-4" />
                <AlertDescription>
                  <strong>Tip:</strong> Use <a href="https://dnschecker.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">dnschecker.org</a> to verify your DNS records are propagating correctly.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Troubleshooting */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Troubleshooting</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible>
            <AccordionItem value="propagation">
              <AccordionTrigger className="text-sm">DNS changes not showing up?</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                DNS propagation can take 15 minutes to 48 hours. Use 
                <a href="https://dnschecker.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">dnschecker.org</a> 
                to check global propagation status.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="cname-root">
              <AccordionTrigger className="text-sm">Can't add CNAME at root domain (@)?</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Most registrars don't allow CNAME at the root domain. Use an A record pointing to the IP address, 
                or use ALIAS/ANAME if your registrar supports it (Cloudflare, Route53, DNSimple).
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="ssl">
              <AccordionTrigger className="text-sm">SSL certificate not working?</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                <ul className="list-disc list-inside space-y-1">
                  <li>Ensure DNS is pointing correctly first</li>
                  <li>If using Cloudflare, disable proxy (use "DNS only")</li>
                  <li>Check for CAA records that might block Let's Encrypt</li>
                  <li>Wait 10-15 minutes after DNS verification for SSL provisioning</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="subdomain">
              <AccordionTrigger className="text-sm">How do I add a subdomain like soc.mydomain.com?</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Add a new DNS record with Host/Name set to just <code className="bg-muted px-1 rounded">soc</code> 
                (not the full domain). Your registrar will automatically append your domain.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {onComplete && (
        <Button onClick={onComplete} className="w-full">
          <CheckCircle className="w-4 h-4 mr-2" />
          I've Configured My DNS
        </Button>
      )}
    </div>
  );
};

export default DomainConfigWizard;
