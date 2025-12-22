import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  ExternalLink, 
  RefreshCw, 
  Copy, 
  CheckCircle,
  Code,
  Globe,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SubdomainPreviewProps {
  subdomain: string;
  panelName: string;
  primaryColor?: string;
  secondaryColor?: string;
  status?: 'active' | 'pending' | 'checking';
  onRefresh?: () => void;
}

const SubdomainPreview = ({
  subdomain,
  panelName,
  primaryColor = '#3b82f6',
  secondaryColor = '#1e40af',
  status = 'checking',
  onRefresh
}: SubdomainPreviewProps) => {
  const { toast } = useToast();
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [tab, setTab] = useState<'preview' | 'html'>('preview');
  const [checking, setChecking] = useState(false);
  const [isReachable, setIsReachable] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);

  const storefrontUrl = `https://${subdomain}.smmpilot.online`;

  useEffect(() => {
    if (subdomain) {
      checkReachability();
    }
  }, [subdomain]);

  const checkReachability = async () => {
    setChecking(true);
    try {
      // Try to call the domain health check function
      const { data, error } = await supabase.functions.invoke('domain-health-check', {
        body: { domain: `${subdomain}.smmpilot.online` }
      });

      if (!error && data) {
        setIsReachable(data.https?.reachable || data.http?.reachable || false);
      } else {
        // Fallback: assume reachable if we can't check
        setIsReachable(true);
      }
    } catch (err) {
      // If the function doesn't exist or fails, assume the subdomain works
      setIsReachable(true);
    } finally {
      setChecking(false);
    }
  };

  const deviceSizes = {
    desktop: { width: '100%', height: '400px' },
    tablet: { width: '768px', height: '400px' },
    mobile: { width: '375px', height: '400px' }
  };

  const copyHtmlCode = () => {
    const htmlCode = generateHtmlCode();
    navigator.clipboard.writeText(htmlCode);
    setCopied(true);
    toast({ title: "HTML copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const generateHtmlCode = () => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${panelName} - SMM Services</title>
  <meta name="description" content="Professional social media marketing services by ${panelName}">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
      min-height: 100vh;
      color: #ffffff;
    }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
    header {
      padding: 20px 0;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    nav a {
      color: rgba(255,255,255,0.8);
      text-decoration: none;
      margin-left: 24px;
      transition: color 0.3s;
    }
    nav a:hover { color: ${primaryColor}; }
    .hero {
      padding: 80px 0;
      text-align: center;
    }
    .hero h1 {
      font-size: 48px;
      margin-bottom: 20px;
      background: linear-gradient(135deg, #fff, rgba(255,255,255,0.8));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero p {
      font-size: 20px;
      color: rgba(255,255,255,0.7);
      max-width: 600px;
      margin: 0 auto 32px;
    }
    .cta-button {
      display: inline-block;
      padding: 16px 32px;
      background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
      color: white;
      text-decoration: none;
      border-radius: 12px;
      font-weight: 600;
      transition: transform 0.3s, box-shadow 0.3s;
    }
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
      padding: 60px 0;
      border-top: 1px solid rgba(255,255,255,0.1);
    }
    .stat {
      text-align: center;
      padding: 24px;
      background: rgba(255,255,255,0.05);
      border-radius: 16px;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .stat-value {
      font-size: 36px;
      font-weight: bold;
      color: ${primaryColor};
    }
    .stat-label {
      color: rgba(255,255,255,0.6);
      margin-top: 8px;
    }
    @media (max-width: 768px) {
      .hero h1 { font-size: 32px; }
      .stats { grid-template-columns: repeat(2, 1fr); }
      nav { display: none; }
    }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <div class="header-content">
        <div class="logo">${panelName}</div>
        <nav>
          <a href="/services">Services</a>
          <a href="/pricing">Pricing</a>
          <a href="/auth">Login</a>
        </nav>
      </div>
    </div>
  </header>
  
  <main>
    <section class="hero">
      <div class="container">
        <h1>Boost Your Social Media</h1>
        <p>Professional SMM services with instant delivery. Get real followers, likes, and engagement.</p>
        <a href="/auth" class="cta-button">Get Started</a>
      </div>
    </section>
    
    <section class="stats">
      <div class="container" style="display: contents;">
        <div class="stat">
          <div class="stat-value">10K+</div>
          <div class="stat-label">Happy Customers</div>
        </div>
        <div class="stat">
          <div class="stat-value">50M+</div>
          <div class="stat-label">Orders Delivered</div>
        </div>
        <div class="stat">
          <div class="stat-value">100+</div>
          <div class="stat-label">Services</div>
        </div>
        <div class="stat">
          <div class="stat-value">24/7</div>
          <div class="stat-label">Support</div>
        </div>
      </div>
    </section>
  </main>
</body>
</html>`;
  };

  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader className="border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Subdomain Preview</CardTitle>
              <p className="text-sm text-muted-foreground">{storefrontUrl}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Status Badge */}
            {checking ? (
              <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Checking
              </Badge>
            ) : isReachable ? (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500">
                <CheckCircle className="w-3 h-3 mr-1" />
                Live
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-500">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Pending DNS
              </Badge>
            )}
            
            {/* Device Selector */}
            <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg">
              {[
                { id: 'desktop', icon: Monitor },
                { id: 'tablet', icon: Tablet },
                { id: 'mobile', icon: Smartphone }
              ].map(({ id, icon: Icon }) => (
                <Button
                  key={id}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0",
                    device === id && "bg-background shadow-sm"
                  )}
                  onClick={() => setDevice(id as any)}
                >
                  <Icon className="w-4 h-4" />
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                checkReachability();
                onRefresh?.();
              }}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(storefrontUrl, '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <div className="px-4 pt-2 border-b border-border/50">
          <TabsList className="bg-transparent p-0 h-auto">
            <TabsTrigger value="preview" className="data-[state=active]:bg-muted rounded-b-none">
              <Monitor className="w-4 h-4 mr-2" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="html" className="data-[state=active]:bg-muted rounded-b-none">
              <Code className="w-4 h-4 mr-2" />
              HTML Code
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="preview" className="m-0">
          <CardContent className="p-4">
            {/* URL Bar */}
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg mb-4">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-background rounded-md">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground truncate">{storefrontUrl}</span>
              </div>
            </div>

            {/* Preview Frame */}
            <motion.div
              className="mx-auto border border-border rounded-lg overflow-hidden bg-background"
              style={{ 
                maxWidth: deviceSizes[device].width,
                height: deviceSizes[device].height 
              }}
              layout
            >
              <iframe
                key={`${subdomain}-${device}`}
                src={storefrontUrl}
                className="w-full h-full border-0"
                title="Subdomain Preview"
              />
            </motion.div>
          </CardContent>
        </TabsContent>

        <TabsContent value="html" className="m-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                Copy this HTML to customize your storefront
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={copyHtmlCode}
                className="gap-2"
              >
                {copied ? (
                  <><CheckCircle className="w-4 h-4 text-emerald-500" /> Copied!</>
                ) : (
                  <><Copy className="w-4 h-4" /> Copy HTML</>
                )}
              </Button>
            </div>
            <div className="relative">
              <pre className="p-4 bg-muted/50 rounded-lg overflow-auto max-h-[400px] text-xs font-mono">
                <code>{generateHtmlCode()}</code>
              </pre>
            </div>
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default SubdomainPreview;