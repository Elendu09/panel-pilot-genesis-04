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
  HelpCircle,
  Globe,
  Server,
  Cloud
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface DomainConfigWizardProps {
  domain?: string;
  onComplete?: () => void;
}

const LOVABLE_IP = "185.158.133.1";

export const DomainConfigWizard = ({ domain, onComplete }: DomainConfigWizardProps) => {
  const { toast } = useToast();
  const [selectedRegistrar, setSelectedRegistrar] = useState<string>("namecheap");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const registrars = [
    { id: "namecheap", name: "Namecheap", icon: "🟠" },
    { id: "godaddy", name: "GoDaddy", icon: "🟢" },
    { id: "cloudflare", name: "Cloudflare", icon: "🟡" },
  ];

  const dnsRecords = [
    { type: "A", host: "@", value: LOVABLE_IP, description: "Root domain (yourdomain.com)" },
    { type: "A", host: "*", value: LOVABLE_IP, description: "Wildcard for subdomains (*.yourdomain.com)" },
    { type: "A", host: "www", value: LOVABLE_IP, description: "WWW subdomain (www.yourdomain.com)" },
  ];

  return (
    <div className="space-y-6">
      {/* Registrar Selector */}
      <Card className="glass-card border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="w-5 h-5 text-primary" />
            Select Your Domain Registrar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
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
                <span className="font-medium">{registrar.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* DNS Records Required */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Server className="w-5 h-5 text-primary" />
            Required DNS Records
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {dnsRecords.map((record, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/50"
            >
              <div className="flex items-center gap-4 flex-wrap">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  {record.type}
                </Badge>
                <code className="text-sm font-mono bg-background px-2 py-1 rounded">{record.host}</code>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <code className="text-sm font-mono bg-background px-2 py-1 rounded">{record.value}</code>
              </div>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(record.value)}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            {domain && <><strong>For domain:</strong> {domain}<br /></>}
            The wildcard (*) record is critical for subdomains like istock.smmpilot.online to work.
          </p>
        </CardContent>
      </Card>

      {/* Step-by-Step Guide per Registrar */}
      <Tabs value={selectedRegistrar} onValueChange={setSelectedRegistrar}>
        <TabsList className="grid w-full grid-cols-3">
          {registrars.map((registrar) => (
            <TabsTrigger key={registrar.id} value={registrar.id} className="gap-2">
              <span>{registrar.icon}</span> {registrar.name}
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
                      Go to <a href="https://www.namecheap.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">namecheap.com</a> and sign in to your account.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">2</div>
                  <div>
                    <h4 className="font-medium">Go to Domain List</h4>
                    <p className="text-sm text-muted-foreground">
                      Click on <strong>"Domain List"</strong> in the left sidebar, then click <strong>"Manage"</strong> next to your domain.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">3</div>
                  <div>
                    <h4 className="font-medium">Open Advanced DNS</h4>
                    <p className="text-sm text-muted-foreground">
                      Click on the <strong>"Advanced DNS"</strong> tab at the top of the page.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">4</div>
                  <div>
                    <h4 className="font-medium">Remove Existing A Records</h4>
                    <p className="text-sm text-muted-foreground">
                      Delete any existing A records for <code className="bg-muted px-1 rounded">@</code>, <code className="bg-muted px-1 rounded">*</code>, or <code className="bg-muted px-1 rounded">www</code> that point to different IP addresses.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">5</div>
                  <div>
                    <h4 className="font-medium">Add New A Records</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Click <strong>"Add New Record"</strong> and add these three records:
                    </p>
                    <div className="bg-muted/50 p-3 rounded-lg space-y-2 text-sm font-mono">
                      <div className="flex justify-between">
                        <span>Type: A | Host: @ | Value: {LOVABLE_IP} | TTL: Automatic</span>
                        <Button variant="ghost" size="sm" className="h-6" onClick={() => copyToClipboard(LOVABLE_IP)}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="flex justify-between">
                        <span>Type: A | Host: * | Value: {LOVABLE_IP} | TTL: Automatic</span>
                        <Button variant="ghost" size="sm" className="h-6" onClick={() => copyToClipboard(LOVABLE_IP)}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="flex justify-between">
                        <span>Type: A | Host: www | Value: {LOVABLE_IP} | TTL: Automatic</span>
                        <Button variant="ghost" size="sm" className="h-6" onClick={() => copyToClipboard(LOVABLE_IP)}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-medium">Save Changes</h4>
                    <p className="text-sm text-muted-foreground">
                      Click the green checkmark to save each record. DNS propagation takes 15-60 minutes.
                    </p>
                  </div>
                </div>
              </div>

              <Alert className="bg-amber-500/10 border-amber-500/20">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <AlertDescription className="text-amber-500">
                  <strong>Important:</strong> If you're using Namecheap's PremiumDNS or a third-party DNS service, you'll need to configure the records there instead.
                </AlertDescription>
              </Alert>

              <Button variant="outline" className="w-full" asChild>
                <a href="https://www.namecheap.com/support/knowledgebase/article.aspx/319/2237/how-can-i-set-up-an-a-address-record-for-my-domain/" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Namecheap A Record Guide
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
                      Go to <a href="https://www.godaddy.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">godaddy.com</a> and sign in to your account.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">2</div>
                  <div>
                    <h4 className="font-medium">Go to My Products</h4>
                    <p className="text-sm text-muted-foreground">
                      Click your name in the top right, then select <strong>"My Products"</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">3</div>
                  <div>
                    <h4 className="font-medium">Open DNS Management</h4>
                    <p className="text-sm text-muted-foreground">
                      Find your domain, click the three dots menu, and select <strong>"Manage DNS"</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">4</div>
                  <div>
                    <h4 className="font-medium">Add A Records</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Click <strong>"Add"</strong> and create these records:
                    </p>
                    <div className="bg-muted/50 p-3 rounded-lg space-y-2 text-sm">
                      <p>• Type: A | Name: @ | Points to: {LOVABLE_IP} | TTL: 1 Hour</p>
                      <p>• Type: A | Name: * | Points to: {LOVABLE_IP} | TTL: 1 Hour</p>
                      <p>• Type: A | Name: www | Points to: {LOVABLE_IP} | TTL: 1 Hour</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-medium">Save Each Record</h4>
                    <p className="text-sm text-muted-foreground">
                      Click <strong>"Save"</strong> after adding each record.
                    </p>
                  </div>
                </div>
              </div>

              <Button variant="outline" className="w-full" asChild>
                <a href="https://www.godaddy.com/help/add-an-a-record-19238" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  GoDaddy A Record Guide
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
                <AlertDescription className="text-amber-500">
                  <strong>Important:</strong> Set Proxy Status to <strong>"DNS only"</strong> (gray cloud) for wildcard records. Cloudflare's free plan doesn't proxy wildcards.
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
                      Click <strong>"DNS"</strong> in the left sidebar.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">3</div>
                  <div>
                    <h4 className="font-medium">Add A Records</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Click <strong>"Add record"</strong> and create these:
                    </p>
                    <div className="bg-muted/50 p-3 rounded-lg space-y-2 text-sm">
                      <p>• Type: A | Name: @ | IPv4: {LOVABLE_IP} | Proxy: DNS only</p>
                      <p>• Type: A | Name: * | IPv4: {LOVABLE_IP} | Proxy: DNS only (required)</p>
                      <p>• Type: A | Name: www | IPv4: {LOVABLE_IP} | Proxy: DNS only</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="font-medium">Disable Proxy for Wildcards</h4>
                    <p className="text-sm text-muted-foreground">
                      Click the orange cloud icon to turn it gray (DNS only) for the wildcard (*) record.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-medium">Save Records</h4>
                    <p className="text-sm text-muted-foreground">
                      Click <strong>"Save"</strong> for each record. Cloudflare DNS propagates very quickly.
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
      </Tabs>

      {/* Troubleshooting */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <HelpCircle className="w-5 h-5 text-primary" />
            Troubleshooting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="propagation">
              <AccordionTrigger className="text-sm">DNS changes not taking effect?</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                DNS propagation can take 15 minutes to 48 hours. Try:
                <ul className="list-disc ml-4 mt-2 space-y-1">
                  <li>Clear your browser cache and DNS cache</li>
                  <li>Use <a href="https://dnschecker.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">dnschecker.org</a> to verify global propagation</li>
                  <li>Try accessing from a different device or network</li>
                  <li>Wait at least 30 minutes before checking again</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="ssl">
              <AccordionTrigger className="text-sm">SSL certificate not working?</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                SSL provisioning happens after DNS verification:
                <ul className="list-disc ml-4 mt-2 space-y-1">
                  <li>Ensure DNS is correctly pointing to {LOVABLE_IP}</li>
                  <li>Wait 5-10 minutes after DNS verification for SSL to provision</li>
                  <li>Check for CAA records that might block Let's Encrypt</li>
                  <li>If using Cloudflare, ensure SSL mode is set to "Full" or disable proxy</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="wildcard">
              <AccordionTrigger className="text-sm">Subdomains not working?</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                For subdomains like istock.smmpilot.online to work:
                <ul className="list-disc ml-4 mt-2 space-y-1">
                  <li>The wildcard (*) A record must be added pointing to {LOVABLE_IP}</li>
                  <li>On Cloudflare, wildcard records must have proxy disabled (gray cloud)</li>
                  <li>Some registrars don't support wildcard records on their free DNS</li>
                  <li>Check that no specific subdomain record is overriding the wildcard</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="conflict">
              <AccordionTrigger className="text-sm">Conflicting DNS records?</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Remove any conflicting records:
                <ul className="list-disc ml-4 mt-2 space-y-1">
                  <li>Delete old A records pointing to different IPs</li>
                  <li>Remove CNAME records for @ or * if they exist</li>
                  <li>Ensure only one A record exists per hostname</li>
                  <li>Check for parking page or redirect records from your registrar</li>
                </ul>
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
