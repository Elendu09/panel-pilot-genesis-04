import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Globe, 
  Shield, 
  Server, 
  Clock,
  ExternalLink,
  Copy,
  ArrowRight,
  Loader2,
  RefreshCw,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface TroubleshootingIssue {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  severity: 'high' | 'medium' | 'low';
  category: 'dns' | 'ssl' | 'verification' | 'loading';
  symptoms: string[];
  solutions: {
    title: string;
    steps: string[];
    link?: { text: string; url: string };
  }[];
}

interface DiagnosticCheck {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'warning';
  message?: string;
}

interface DomainTroubleshootingGuideProps {
  domain?: string;
  panelId?: string;
  onRunDiagnostics?: () => void;
}

const ISSUES: TroubleshootingIssue[] = [
  {
    id: 'dns-not-resolving',
    title: 'DNS Not Resolving',
    description: 'Your domain is not pointing to the correct IP address',
    icon: <Globe className="w-5 h-5" />,
    severity: 'high',
    category: 'dns',
    symptoms: [
      'Domain shows "Site not found" or similar error',
      'Verification keeps showing "Pending"',
      'DNS checker shows wrong or no IP address'
    ],
    solutions: [
      {
        title: 'Check DNS Records',
        steps: [
          'Log in to your domain registrar (GoDaddy, Namecheap, etc.)',
          'Navigate to DNS settings for your domain',
          'Ensure you have an A record pointing @ to 185.158.133.1',
          'Add another A record pointing www to 185.158.133.1',
          'Remove any conflicting A or AAAA records'
        ],
        link: { text: 'DNS Checker Tool', url: 'https://dnschecker.org' }
      },
      {
        title: 'Wait for Propagation',
        steps: [
          'DNS changes can take up to 48 hours to propagate globally',
          'Some registrars have a TTL (Time To Live) setting - lower values propagate faster',
          'Use the Propagation Tracker to monitor progress'
        ]
      }
    ]
  },
  {
    id: 'ssl-not-provisioning',
    title: 'SSL Certificate Not Provisioning',
    description: 'HTTPS is not working even though DNS is configured correctly',
    icon: <Shield className="w-5 h-5" />,
    severity: 'high',
    category: 'ssl',
    symptoms: [
      'Browser shows "Not Secure" warning',
      'SSL status shows "Pending" or "Error"',
      'Site works with http:// but not https://'
    ],
    solutions: [
      {
        title: 'Check CAA Records',
        steps: [
          'CAA records restrict which certificate authorities can issue SSL for your domain',
          'If you have CAA records, add: 0 issue "letsencrypt.org"',
          'Or remove CAA records entirely to allow any CA'
        ]
      },
      {
        title: 'Wait for SSL Issuance',
        steps: [
          'SSL certificates are automatically issued after DNS verification',
          'This process typically takes 5-15 minutes',
          'If still pending after 1 hour, try the "Retry SSL" button'
        ]
      },
      {
        title: 'Check for Proxy Conflicts',
        steps: [
          'Disable Cloudflare proxy (orange cloud) if enabled',
          'Set Cloudflare to DNS-only (gray cloud) mode',
          'Other proxies or CDNs may interfere with SSL issuance'
        ]
      }
    ]
  },
  {
    id: 'verification-failing',
    title: 'Domain Verification Failing',
    description: 'The system cannot verify domain ownership',
    icon: <XCircle className="w-5 h-5" />,
    severity: 'medium',
    category: 'verification',
    symptoms: [
      'Verification button always fails',
      'TXT record verification not working',
      'Domain stuck in "Pending" state'
    ],
    solutions: [
      {
        title: 'Verify DNS A Record',
        steps: [
          'Confirm A record points to 185.158.133.1',
          'Use dig or nslookup to verify: dig A yourdomain.com',
          'Ensure no CNAME record exists for the root domain (@ or apex)'
        ]
      },
      {
        title: 'Use TXT Verification Alternative',
        steps: [
          'Add a TXT record: _smmpilot.yourdomain.com',
          'Set the value to: smmpilot-verify=YOUR_PANEL_ID',
          'Click "Verify TXT Record" after adding'
        ]
      }
    ]
  },
  {
    id: 'domain-not-loading',
    title: 'Domain Not Loading Panel',
    description: 'Domain resolves but shows wrong content or errors',
    icon: <Server className="w-5 h-5" />,
    severity: 'medium',
    category: 'loading',
    symptoms: [
      'Domain shows a different website',
      'Shows Vercel 404 or default page',
      'Panel content not appearing'
    ],
    solutions: [
      {
        title: 'Check Domain Assignment',
        steps: [
          'Verify the domain is added to your panel settings',
          'Ensure the domain is marked as verified',
          'Check that the panel is active (not suspended)'
        ]
      },
      {
        title: 'Clear DNS Cache',
        steps: [
          'Clear your browser cache and cookies',
          'Flush local DNS cache: ipconfig /flushdns (Windows) or sudo dscacheutil -flushcache (Mac)',
          'Try accessing from incognito/private window'
        ]
      }
    ]
  }
];

export const DomainTroubleshootingGuide = ({ 
  domain, 
  panelId,
  onRunDiagnostics 
}: DomainTroubleshootingGuideProps) => {
  const { toast } = useToast();
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticCheck[]>([]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const runAutoDiagnostics = async () => {
    if (!domain) {
      toast({ variant: "destructive", title: "No domain specified" });
      return;
    }

    setIsRunningDiagnostics(true);
    setDiagnosticResults([
      { name: 'DNS A Record', status: 'running' },
      { name: 'DNS CNAME Record', status: 'pending' },
      { name: 'HTTPS Reachability', status: 'pending' },
      { name: 'SSL Certificate', status: 'pending' },
      { name: 'Panel Assignment', status: 'pending' }
    ]);

    try {
      // Run DNS check
      const { data, error } = await supabase.functions.invoke("domain-health-check", {
        body: { domain }
      });

      if (error) throw error;

      const results: DiagnosticCheck[] = [
        {
          name: 'DNS A Record',
          status: data?.a_records?.length > 0 ? 'passed' : 'failed',
          message: data?.a_records?.length > 0 
            ? `Found: ${data.a_records.join(', ')}` 
            : 'No A records found'
        },
        {
          name: 'DNS CNAME Record',
          status: data?.cname_records?.length > 0 ? 'passed' : 'warning',
          message: data?.cname_records?.length > 0 
            ? `Found: ${data.cname_records.join(', ')}` 
            : 'No CNAME records (optional for root domain)'
        },
        {
          name: 'HTTPS Reachability',
          status: data?.https_ok ? 'passed' : 'failed',
          message: data?.https_ok ? 'HTTPS is working' : 'HTTPS not reachable'
        },
        {
          name: 'SSL Certificate',
          status: data?.https_ok ? 'passed' : 'warning',
          message: data?.https_ok ? 'Valid SSL certificate' : 'SSL may be provisioning'
        },
        {
          name: 'DNS Configuration',
          status: data?.dns_ok ? 'passed' : 'failed',
          message: data?.dns_ok ? 'DNS correctly configured' : 'DNS not pointing to expected target'
        }
      ];

      setDiagnosticResults(results);

      if (onRunDiagnostics) {
        onRunDiagnostics();
      }
    } catch (error) {
      console.error('Diagnostic error:', error);
      setDiagnosticResults(prev => prev.map(r => ({ ...r, status: 'failed' as const, message: 'Check failed' })));
    } finally {
      setIsRunningDiagnostics(false);
    }
  };

  const getSeverityColor = (severity: TroubleshootingIssue['severity']) => {
    switch (severity) {
      case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'low': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  const getStatusIcon = (status: DiagnosticCheck['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-destructive" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'running': return <Loader2 className="w-4 h-4 animate-spin text-primary" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-primary" />
          Domain Troubleshooting Guide
        </CardTitle>
        <CardDescription>
          Diagnose and fix common domain configuration issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Auto Diagnostics */}
        {domain && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Automatic Diagnostics</h4>
                <p className="text-sm text-muted-foreground">
                  Run checks for <code className="text-xs bg-muted px-1 rounded">{domain}</code>
                </p>
              </div>
              <Button onClick={runAutoDiagnostics} disabled={isRunningDiagnostics}>
                {isRunningDiagnostics ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 mr-2" />
                )}
                Run Diagnostics
              </Button>
            </div>

            {diagnosticResults.length > 0 && (
              <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                {diagnosticResults.map((check, index) => (
                  <div 
                    key={index} 
                    className={cn(
                      "flex items-center justify-between p-2 rounded",
                      check.status === 'passed' && "bg-green-500/5",
                      check.status === 'failed' && "bg-red-500/5",
                      check.status === 'warning' && "bg-yellow-500/5"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {getStatusIcon(check.status)}
                      <span className="text-sm font-medium">{check.name}</span>
                    </div>
                    {check.message && (
                      <span className="text-xs text-muted-foreground">{check.message}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Issue Categories */}
        <div className="space-y-4">
          <h4 className="font-medium">Common Issues</h4>
          
          <div className="grid gap-3">
            {ISSUES.map((issue) => (
              <Card 
                key={issue.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  selectedIssue === issue.id && "ring-2 ring-primary"
                )}
                onClick={() => setSelectedIssue(selectedIssue === issue.id ? null : issue.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={cn("p-2 rounded-lg", getSeverityColor(issue.severity))}>
                      {issue.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h5 className="font-medium">{issue.title}</h5>
                        <Badge variant="outline" className="text-xs capitalize">
                          {issue.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{issue.description}</p>
                      
                      {selectedIssue === issue.id && (
                        <div className="mt-4 space-y-4">
                          {/* Symptoms */}
                          <div>
                            <h6 className="text-sm font-medium mb-2 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Symptoms
                            </h6>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {issue.symptoms.map((symptom, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-muted-foreground">•</span>
                                  {symptom}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Solutions */}
                          <Accordion type="single" collapsible>
                            {issue.solutions.map((solution, i) => (
                              <AccordionItem key={i} value={`solution-${i}`}>
                                <AccordionTrigger className="text-sm font-medium">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    {solution.title}
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <ol className="text-sm space-y-2 pl-6">
                                    {solution.steps.map((step, j) => (
                                      <li key={j} className="list-decimal text-muted-foreground">
                                        {step}
                                      </li>
                                    ))}
                                  </ol>
                                  {solution.link && (
                                    <Button variant="link" size="sm" asChild className="mt-2 p-0 h-auto">
                                      <a href={solution.link.url} target="_blank" rel="noopener noreferrer">
                                        {solution.link.text}
                                        <ExternalLink className="w-3 h-3 ml-1" />
                                      </a>
                                    </Button>
                                  )}
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Help */}
        <Alert>
          <HelpCircle className="w-4 h-4" />
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>Still having issues? Our support team can help.</span>
            <Button variant="outline" size="sm" asChild>
              <a href="mailto:support@smmpilot.online">
                Contact Support
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
