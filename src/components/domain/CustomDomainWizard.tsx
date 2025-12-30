import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Globe, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Copy, 
  ExternalLink,
  Server,
  Settings,
  Shield,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { VERCEL_NAMESERVERS, VERCEL_A_RECORDS, VERCEL_CNAME } from "@/lib/hosting-config";

interface CustomDomainWizardProps {
  open: boolean;
  onClose: () => void;
  onComplete: (domain: string, method: 'nameservers' | 'dns') => Promise<void>;
  panelId?: string;
}

type WizardStep = 1 | 2 | 3 | 4;
type SetupMethod = 'nameservers' | 'dns';

export const CustomDomainWizard = ({ open, onClose, onComplete, panelId }: CustomDomainWizardProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState<WizardStep>(1);
  const [domain, setDomain] = useState("");
  const [setupMethod, setSetupMethod] = useState<SetupMethod>('nameservers');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const handleNext = () => {
    if (step === 1 && !domain.trim()) {
      toast({ variant: "destructive", title: "Please enter a domain name" });
      return;
    }
    setStep((s) => Math.min(s + 1, 4) as WizardStep);
  };

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 1) as WizardStep);
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await onComplete(domain.trim(), setupMethod);
      toast({ title: "Domain added successfully!", description: "Configure your DNS to complete setup." });
      onClose();
      resetWizard();
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to add domain" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetWizard = () => {
    setStep(1);
    setDomain("");
    setSetupMethod('nameservers');
  };

  if (!open) return null;

  const steps = [
    { number: 1, title: "Domain", description: "Enter your domain" },
    { number: 2, title: "Method", description: "Choose setup method" },
    { number: 3, title: "Configure", description: "Set up DNS" },
    { number: 4, title: "Verify", description: "Confirm setup" }
  ];

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl"
      >
        <Card className="glass-card border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Add Custom Domain
                </CardTitle>
                <CardDescription>Connect your own domain to your panel</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { onClose(); resetWizard(); }}>
                ✕
              </Button>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between mt-6">
              {steps.map((s, i) => (
                <div key={s.number} className="flex items-center">
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors",
                    step >= s.number 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {step > s.number ? <CheckCircle className="w-4 h-4" /> : s.number}
                  </div>
                  <div className="hidden sm:block ml-2">
                    <p className={cn(
                      "text-xs font-medium",
                      step >= s.number ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {s.title}
                    </p>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={cn(
                      "w-8 sm:w-16 h-0.5 mx-2",
                      step > s.number ? "bg-primary" : "bg-muted"
                    )} />
                  )}
                </div>
              ))}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <AnimatePresence mode="wait">
              {/* Step 1: Enter Domain */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="domain">Domain Name</Label>
                    <Input
                      id="domain"
                      placeholder="example.com"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, ''))}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Enter your domain without http:// or https://
                    </p>
                  </div>

                  <Alert>
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>
                      You must own this domain and have access to its DNS settings.
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {/* Step 2: Choose Method */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <Label>Setup Method</Label>
                  <RadioGroup value={setupMethod} onValueChange={(v) => setSetupMethod(v as SetupMethod)}>
                    <div 
                      className={cn(
                        "flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-colors",
                        setupMethod === 'nameservers' ? "border-primary bg-primary/5" : "border-border"
                      )}
                      onClick={() => setSetupMethod('nameservers')}
                    >
                      <RadioGroupItem value="nameservers" id="ns" className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="ns" className="cursor-pointer font-medium">
                            Vercel Nameservers
                          </Label>
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                            Recommended
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Point your domain's nameservers to Vercel for automatic SSL and wildcard support.
                          Best for full control and reliability.
                        </p>
                      </div>
                    </div>

                    <div 
                      className={cn(
                        "flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-colors",
                        setupMethod === 'dns' ? "border-primary bg-primary/5" : "border-border"
                      )}
                      onClick={() => setSetupMethod('dns')}
                    >
                      <RadioGroupItem value="dns" id="dns" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="dns" className="cursor-pointer font-medium">
                          Manual DNS Records
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Keep your current DNS provider and add A/CNAME records manually.
                          Use if you have other services on the same domain.
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </motion.div>
              )}

              {/* Step 3: Configure DNS */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {setupMethod === 'nameservers' ? (
                    <>
                      <Alert className="border-primary/20 bg-primary/5">
                        <Server className="w-4 h-4 text-primary" />
                        <AlertDescription>
                          <strong>Change your domain's nameservers to:</strong>
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-3">
                        {VERCEL_NAMESERVERS.map((ns, i) => (
                          <div key={ns} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div>
                              <p className="text-xs text-muted-foreground">Nameserver {i + 1}</p>
                              <code className="font-mono">{ns}</code>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(ns)}>
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                        <p className="text-sm font-medium">After changing nameservers:</p>
                        <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
                          <li>Add <code>{domain}</code> to your Vercel project</li>
                          <li>Add <code>*.{domain}</code> for wildcard support</li>
                          <li>Wait 24-48 hours for DNS propagation</li>
                        </ol>
                      </div>
                    </>
                  ) : (
                    <>
                      <Alert className="border-primary/20 bg-primary/5">
                        <Settings className="w-4 h-4 text-primary" />
                        <AlertDescription>
                          <strong>Add these DNS records at your registrar:</strong>
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <p className="text-xs text-muted-foreground">A Record (Root)</p>
                            <div className="flex gap-4">
                              <div>
                                <span className="text-xs text-muted-foreground">Host:</span>
                                <code className="ml-1 font-mono">@</code>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground">Value:</span>
                                <code className="ml-1 font-mono">{VERCEL_A_RECORDS[0]}</code>
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(VERCEL_A_RECORDS[0])}>
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <p className="text-xs text-muted-foreground">CNAME Record (WWW)</p>
                            <div className="flex gap-4">
                              <div>
                                <span className="text-xs text-muted-foreground">Host:</span>
                                <code className="ml-1 font-mono">www</code>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground">Value:</span>
                                <code className="ml-1 font-mono">{VERCEL_CNAME}</code>
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(VERCEL_CNAME)}>
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <Alert>
                        <AlertCircle className="w-4 h-4" />
                        <AlertDescription>
                          Note: Manual DNS setup doesn't support wildcard subdomains. 
                          Use nameservers for full wildcard support.
                        </AlertDescription>
                      </Alert>
                    </>
                  )}
                </motion.div>
              )}

              {/* Step 4: Verify */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="text-center py-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">Ready to Add Domain</h3>
                    <p className="text-muted-foreground mt-1">
                      We'll save your domain and start verification
                    </p>
                  </div>

                  <Card className="bg-muted/50">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Domain:</span>
                        <code className="font-mono">{domain}</code>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Setup Method:</span>
                        <span>{setupMethod === 'nameservers' ? 'Vercel Nameservers' : 'Manual DNS'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">SSL:</span>
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                          <Shield className="w-3 h-3 mr-1" /> Auto-provisioned
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Alert>
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>
                      DNS changes can take up to 48 hours to propagate. We'll automatically verify your domain once configured.
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={step === 1 ? () => { onClose(); resetWizard(); } : handleBack}>
                {step === 1 ? 'Cancel' : <><ArrowLeft className="w-4 h-4 mr-2" /> Back</>}
              </Button>

              {step < 4 ? (
                <Button onClick={handleNext}>
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleComplete} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Add Domain
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default CustomDomainWizard;
