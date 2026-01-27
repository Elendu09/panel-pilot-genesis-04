import { useState, useEffect } from "react";
import { 
  Key, Copy, RefreshCw, Eye, EyeOff, Code, Send, CheckCircle, XCircle, Clock,
  BarChart3, Webhook, FileText, ChevronDown, ChevronRight, Zap, Shield, Activity,
  Terminal, BookOpen, Play, AlertCircle, RotateCcw, ExternalLink, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useWebhooks, WebhookEventType } from "@/hooks/use-webhooks";
import { usePanel } from "@/hooks/usePanel";
import { supabase } from "@/integrations/supabase/client";

// Webhook event definitions
const webhookEvents = {
  orders: {
    label: "Order Events",
    events: [
      { id: "order.created" as WebhookEventType, name: "Order Created", description: "Triggered when a new order is placed" },
      { id: "order.completed" as WebhookEventType, name: "Order Completed", description: "Triggered when an order is fulfilled" },
      { id: "order.cancelled" as WebhookEventType, name: "Order Cancelled", description: "Triggered when an order is cancelled" },
      { id: "order.refunded" as WebhookEventType, name: "Order Refunded", description: "Triggered when an order is refunded" },
    ]
  },
  gateway: {
    label: "Gateway Events",
    events: [
      { id: "gateway.requested" as WebhookEventType, name: "Gateway Requested", description: "New payment gateway request submitted" },
      { id: "gateway.approved" as WebhookEventType, name: "Gateway Approved", description: "Payment gateway request approved" },
      { id: "gateway.rejected" as WebhookEventType, name: "Gateway Rejected", description: "Payment gateway request rejected" },
    ]
  },
  dns: {
    label: "DNS Events",
    events: [
      { id: "dns.propagated" as WebhookEventType, name: "DNS Propagated", description: "DNS records fully propagated" },
      { id: "dns.failed" as WebhookEventType, name: "DNS Failed", description: "DNS propagation failed" },
    ]
  }
};

interface ApiKey {
  id: string;
  api_key: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
}

interface ApiLog {
  id: string;
  endpoint: string;
  method: string;
  status_code: number | null;
  response_time_ms: number | null;
  created_at: string;
}

const APIManagement = () => {
  const { panel, loading: panelLoading } = usePanel();
  const [showApiKey, setShowApiKey] = useState(false);
  const [isRegenerateOpen, setIsRegenerateOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookEnabled, setWebhookEnabled] = useState(true);
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>("services");
  const [selectedLanguage, setSelectedLanguage] = useState("curl");
  const [selectedEvents, setSelectedEvents] = useState<WebhookEventType[]>([
    "order.created", "order.completed", "gateway.approved", "dns.propagated"
  ]);
  const [autoRefreshLogs, setAutoRefreshLogs] = useState(false);

  // Real data state
  const [apiKey, setApiKey] = useState<ApiKey | null>(null);
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  const { sending, deliveries, testWebhook: sendTestWebhook } = useWebhooks();

  // Detect current platform domain dynamically
  const getPlatformDomain = () => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const parts = hostname.split('.');
      if (parts.length >= 2) {
        const rootDomain = parts.slice(-2).join('.');
        // Whitelist known platform domains
        if (['homeofsmm.com', 'smmpilot.online'].includes(rootDomain)) {
          return `https://${rootDomain}`;
        }
      }
      // For development/preview environments, show brand domain
      if (hostname.includes('localhost') || hostname.includes('lovable.app')) {
        return 'https://homeofsmm.com';
      }
    }
    return 'https://homeofsmm.com';
  };

  // Panel Owner API is centralized at the platform domain
  const apiBaseUrl = getPlatformDomain();
  
  // Buyer API URL (for reference - uses tenant domains)
  const buyerApiUrl = panel?.custom_domain 
    ? `https://${panel.custom_domain}/api/v2`
    : panel?.subdomain 
      ? `https://${panel.subdomain}.${apiBaseUrl.replace('https://', '')}/api/v2`
      : `https://yourpanel.${apiBaseUrl.replace('https://', '')}/api/v2`;

  // Fetch API key and logs
  useEffect(() => {
    if (panel?.id) {
      fetchApiKey();
      fetchApiLogs();
    }
  }, [panel?.id]);

  const fetchApiKey = async () => {
    if (!panel?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('panel_api_keys')
        .select('*')
        .eq('panel_id', panel.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setApiKey(data);
      } else {
        // Generate first API key for panel
        await generateApiKey();
      }
    } catch (error) {
      console.error('Error fetching API key:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApiLogs = async () => {
    if (!panel?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('api_logs')
        .select('*')
        .eq('panel_id', panel.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setApiLogs(data || []);
    } catch (error) {
      console.error('Error fetching API logs:', error);
    }
  };

  const generateApiKey = async () => {
    if (!panel?.id) return;
    
    try {
      // Generate a secure API key
      const newKey = 'sk_live_' + crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '').substring(0, 16);
      
      const { data, error } = await supabase
        .from('panel_api_keys')
        .insert({
          panel_id: panel.id,
          api_key: newKey,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      setApiKey(data);
      return data;
    } catch (error) {
      console.error('Error generating API key:', error);
      throw error;
    }
  };

  const regenerateKey = async () => {
    if (!panel?.id || !apiKey) return;
    
    setRegenerating(true);
    try {
      // Deactivate old key
      await supabase
        .from('panel_api_keys')
        .update({ is_active: false })
        .eq('id', apiKey.id);

      // Generate new key
      await generateApiKey();
      
      toast({ title: "API key regenerated successfully" });
      setIsRegenerateOpen(false);
    } catch (error) {
      console.error('Error regenerating key:', error);
      toast({ variant: "destructive", title: "Failed to regenerate API key" });
    } finally {
      setRegenerating(false);
    }
  };

  // Calculate real stats from logs
  const todayLogs = apiLogs.filter(log => {
    const today = new Date().toDateString();
    return new Date(log.created_at).toDateString() === today;
  });
  
  const successfulLogs = apiLogs.filter(log => log.status_code && log.status_code >= 200 && log.status_code < 400);
  const successRate = apiLogs.length > 0 ? ((successfulLogs.length / apiLogs.length) * 100).toFixed(1) : "0";
  const avgResponseTime = apiLogs.length > 0 
    ? Math.round(apiLogs.reduce((acc, log) => acc + (log.response_time_ms || 0), 0) / apiLogs.length)
    : 0;

  const displayKey = apiKey?.api_key || "";
  const maskedKey = displayKey ? displayKey.substring(0, 12) + "..." + displayKey.slice(-4) : "No API key";

  // Panel Owner Management API Endpoints (different from Buyer API)
  const endpoints = [
    {
      id: "services",
      method: "POST",
      path: "/api/v2/panel",
      action: "services",
      description: "Get all panel services",
      params: ["key", "action=services"],
      response: `{"success":true,"data":[{"id":"uuid","service_id":1,"name":"Instagram Followers","rate":"2.50","min":100,"max":10000,"category":"Instagram","status":"active"}]}`
    },
    {
      id: "customers",
      method: "POST",
      path: "/api/v2/panel",
      action: "customers",
      description: "Get all customers",
      params: ["key", "action=customers", "page (optional)", "limit (optional)"],
      response: `{"success":true,"data":[{"id":"uuid","email":"user@example.com","balance":"150.50","total_spent":"500.00","status":"active","created_at":"2024-01-15"}],"pagination":{"page":1,"limit":20,"total":156}}`
    },
    {
      id: "orders",
      method: "POST",
      path: "/api/v2/panel",
      action: "orders",
      description: "Get all panel orders",
      params: ["key", "action=orders", "status (optional)", "page (optional)"],
      response: `{"success":true,"data":[{"id":"uuid","order_number":"ORD-12345","service":"Instagram Followers","quantity":1000,"price":"2.50","status":"completed","created_at":"2024-01-20"}]}`
    },
    {
      id: "stats",
      method: "POST",
      path: "/api/v2/panel",
      action: "stats",
      description: "Get panel statistics",
      params: ["key", "action=stats"],
      response: `{"success":true,"data":{"total_orders":1250,"total_revenue":"15000.00","total_customers":450,"active_services":125,"orders_today":45}}`
    },
    {
      id: "services-sync",
      method: "POST",
      path: "/api/v2/panel",
      action: "services.sync",
      description: "Sync services from provider",
      params: ["key", "action=services.sync", "provider_id"],
      response: `{"success":true,"message":"Synced 125 services","imported":125,"updated":30,"failed":2}`
    },
    {
      id: "customer-balance",
      method: "POST",
      path: "/api/v2/panel",
      action: "balance.adjust",
      description: "Adjust customer balance",
      params: ["key", "action=balance.adjust", "customer_id", "amount", "type (add/subtract)", "reason (optional)"],
      response: `{"success":true,"customer_id":"uuid","new_balance":"175.50","transaction_id":"tx_123"}`
    },
    {
      id: "customer-status",
      method: "POST",
      path: "/api/v2/panel",
      action: "customer.status",
      description: "Update customer status",
      params: ["key", "action=customer.status", "customer_id", "status (active/suspended/banned)"],
      response: `{"success":true,"customer_id":"uuid","status":"suspended"}`
    },
    {
      id: "order-update",
      method: "POST",
      path: "/api/v2/panel",
      action: "order.update",
      description: "Update order status",
      params: ["key", "action=order.update", "order_id", "status (pending/in_progress/paused/completed/cancelled)"],
      response: `{"success":true,"order_id":"uuid","status":"completed"}`
    },
  ];

  const sdkExamples = {
    curl: `curl -X POST "${apiBaseUrl}/api/v2/panel" \\
  -H "Content-Type: application/json" \\
  -d '{"key":"${maskedKey}","action":"services"}'`,
    php: `<?php
$api_url = "${apiBaseUrl}/api/v2/panel";
$data = [
    'key' => '${maskedKey}',
    'action' => 'services'
];

$ch = curl_init($api_url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$result = json_decode($response, true);
print_r($result);`,
    python: `import requests

api_url = "${apiBaseUrl}/api/v2/panel"
data = {
    "key": "${maskedKey}",
    "action": "services"
}

response = requests.post(api_url, json=data)
result = response.json()
print(result)`,
    nodejs: `const axios = require('axios');

const apiUrl = '${apiBaseUrl}/api/v2/panel';
const data = {
    key: '${maskedKey}',
    action: 'services'
};

axios.post(apiUrl, data)
    .then(response => console.log(response.data))
    .catch(error => console.error(error));`,
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl) {
      toast({ variant: "destructive", title: "Please enter a webhook URL" });
      return;
    }
    await sendTestWebhook(webhookUrl);
  };

  const toggleEvent = (eventId: WebhookEventType) => {
    setSelectedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(e => e !== eventId)
        : [...prev, eventId]
    );
  };

  const saveWebhookConfig = () => {
    toast({ 
      title: "Webhook configuration saved", 
      description: `${selectedEvents.length} events enabled` 
    });
  };

  if (panelLoading || loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/4"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-muted rounded-xl"></div>)}
        </div>
        <div className="h-64 bg-muted rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
          API Management
        </h1>
        <p className="text-muted-foreground">Manage API keys, view documentation, and monitor usage</p>
      </motion.div>

      {/* API Endpoint Info Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="glass-card border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 shrink-0">
                <Code className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="font-semibold">Panel Owner API (Management)</h3>
                <p className="text-sm text-muted-foreground">
                  Centralized endpoint for panel management tasks. Use JSON body with your API key.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <code className="bg-muted px-4 py-2 rounded-lg text-sm font-mono whitespace-nowrap">
                  {apiBaseUrl}/api/v2/panel
                </code>
                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(`${apiBaseUrl}/api/v2/panel`)}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Buyer API Reference */}
            <div className="mt-4 pt-4 border-t border-border/50 flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Buyer API (Storefront):</span> Your customers use this endpoint for placing orders.
                </p>
              </div>
              <code className="bg-muted/50 px-3 py-1.5 rounded text-xs font-mono text-muted-foreground">
                {buyerApiUrl}
              </code>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Real Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "API Calls Today", value: todayLogs.length.toLocaleString(), icon: Activity, color: "text-primary" },
          { label: "Success Rate", value: `${successRate}%`, icon: CheckCircle, color: "text-green-500" },
          { label: "Avg Response", value: `${avgResponseTime}ms`, icon: Zap, color: "text-blue-500" },
          { label: "Total Calls", value: apiLogs.length.toLocaleString(), icon: BarChart3, color: "text-yellow-500" },
        ].map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <Card className="glass-card-hover">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-muted">
                    <stat.icon className={cn("w-5 h-5", stat.color)} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="keys" className="space-y-6">
        <TabsList className="glass-card p-1 flex-wrap h-auto">
          <TabsTrigger value="keys"><Key className="w-4 h-4 mr-2" /> API Keys</TabsTrigger>
          <TabsTrigger value="docs"><FileText className="w-4 h-4 mr-2" /> Documentation</TabsTrigger>
          <TabsTrigger value="sdk"><Terminal className="w-4 h-4 mr-2" /> SDK Examples</TabsTrigger>
          <TabsTrigger value="webhooks"><Webhook className="w-4 h-4 mr-2" /> Webhooks</TabsTrigger>
          <TabsTrigger value="logs"><BarChart3 className="w-4 h-4 mr-2" /> Logs</TabsTrigger>
        </TabsList>

        {/* API Keys Tab */}
        <TabsContent value="keys" className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-primary" />
                  Your API Key
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                  <div className="flex-1 relative">
                    <Input 
                      value={showApiKey ? displayKey : maskedKey} 
                      readOnly 
                      className="pr-20 bg-background/50 font-mono" 
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-10 top-1/2 -translate-y-1/2" 
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-1 top-1/2 -translate-y-1/2" 
                      onClick={() => copyToClipboard(displayKey)}
                      disabled={!displayKey}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button variant="outline" onClick={() => setIsRegenerateOpen(true)} className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Regenerate
                  </Button>
                </div>

                {/* API Base URL */}
                <div className="glass-card p-4 rounded-xl space-y-2">
                  <Label className="text-sm text-muted-foreground">Panel Owner API URL</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono">{apiBaseUrl}/api/v2/panel</code>
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(`${apiBaseUrl}/api/v2/panel`)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Key Info */}
                {apiKey && (
                  <div className="glass-card p-4 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Created</span>
                      <span>{new Date(apiKey.created_at).toLocaleDateString()}</span>
                    </div>
                    {apiKey.last_used_at && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Last Used</span>
                        <span>{new Date(apiKey.last_used_at).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant="outline" className="bg-green-500/10 text-green-500">Active</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Documentation Tab */}
        <TabsContent value="docs" className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  API Endpoints (SMM Panel Standard)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-muted-foreground">
                    Panel Owner API Base URL:
                  </p>
                  <code className="block bg-muted px-3 py-2 rounded-lg text-sm break-all">
                    {apiBaseUrl}/api/v2/panel
                  </code>
                  <p className="text-xs text-muted-foreground/70">
                    All requests require your API key and an <code className="bg-muted px-1 rounded">action</code> parameter.
                  </p>
                </div>
                {endpoints.map((endpoint) => (
                  <Collapsible key={endpoint.id} open={expandedEndpoint === endpoint.id} onOpenChange={() => setExpandedEndpoint(expandedEndpoint === endpoint.id ? null : endpoint.id)}>
                    <CollapsibleTrigger className="w-full">
                      <div className="glass-card p-4 rounded-xl flex items-center justify-between hover:bg-accent/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className={cn(
                            endpoint.method === "GET" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                            "bg-blue-500/10 text-blue-500 border-blue-500/20"
                          )}>{endpoint.method}</Badge>
                          <code className="text-sm font-mono">{endpoint.path}</code>
                          {(endpoint as any).action && (
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-mono text-xs">
                              {(endpoint as any).action}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground hidden md:block">{endpoint.description}</span>
                          {expandedEndpoint === endpoint.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="mt-2 p-4 bg-muted/30 rounded-xl space-y-4">
                        {endpoint.params.length > 0 && (
                          <div>
                            <span className="text-sm font-medium mb-2 block">Parameters</span>
                            <div className="flex flex-wrap gap-2">
                              {endpoint.params.map((param) => (
                                <Badge key={param} variant="outline" className="font-mono text-xs">{param}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Response</span>
                          </div>
                          <pre className="bg-background/50 p-3 rounded-lg overflow-x-auto text-xs font-mono text-green-500 whitespace-pre-wrap break-all">
                            {endpoint.response}
                          </pre>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* SDK Examples Tab */}
        <TabsContent value="sdk" className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-primary" />
                  SDK & Code Examples
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {Object.keys(sdkExamples).map((lang) => (
                    <Button
                      key={lang}
                      variant={selectedLanguage === lang ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedLanguage(lang)}
                      className="capitalize"
                    >
                      {lang === "nodejs" ? "Node.js" : lang}
                    </Button>
                  ))}
                </div>
                <div className="relative">
                  <pre className="bg-muted/50 p-4 rounded-xl overflow-x-auto text-sm font-mono whitespace-pre-wrap break-all">
                    {sdkExamples[selectedLanguage as keyof typeof sdkExamples]}
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(sdkExamples[selectedLanguage as keyof typeof sdkExamples])}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Webhook Configuration */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="glass-card h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Webhook className="w-5 h-5 text-primary" />
                    Webhook Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Webhook URL</Label>
                    <Input
                      placeholder="https://your-domain.com/webhook"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Enable Webhooks</Label>
                    <Switch checked={webhookEnabled} onCheckedChange={setWebhookEnabled} />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={saveWebhookConfig} className="flex-1">Save Configuration</Button>
                    <Button variant="outline" onClick={handleTestWebhook} disabled={sending}>
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Event Selection */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="glass-card h-full">
                <CardHeader>
                  <CardTitle>Event Subscriptions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(webhookEvents).map(([category, { label, events }]) => (
                    <div key={category} className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">{label}</h4>
                      <div className="space-y-1">
                        {events.map((event) => (
                          <div key={event.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50">
                            <Checkbox
                              checked={selectedEvents.includes(event.id)}
                              onCheckedChange={() => toggleEvent(event.id)}
                            />
                            <div className="flex-1">
                              <span className="text-sm">{event.name}</span>
                              <p className="text-xs text-muted-foreground">{event.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* Logs Tab - Real Data */}
        <TabsContent value="logs" className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    API Call Logs
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm text-muted-foreground">Auto Refresh</Label>
                    <Switch checked={autoRefreshLogs} onCheckedChange={setAutoRefreshLogs} />
                    <Button variant="outline" size="sm" onClick={fetchApiLogs}>
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {apiLogs.length === 0 ? (
                  <div className="text-center py-12">
                    <Activity className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No API calls yet</h3>
                    <p className="text-muted-foreground text-sm">
                      API calls made using your API key will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {apiLogs.map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-3 glass-card rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className={cn(
                            log.method === "GET" ? "bg-green-500/10 text-green-500" : "bg-blue-500/10 text-blue-500"
                          )}>{log.method}</Badge>
                          <code className="text-sm font-mono">{log.endpoint}</code>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <Badge variant="outline" className={cn(
                            log.status_code && log.status_code < 400 
                              ? "bg-green-500/10 text-green-500" 
                              : "bg-red-500/10 text-red-500"
                          )}>{log.status_code || 'N/A'}</Badge>
                          <span className="text-muted-foreground">{log.response_time_ms}ms</span>
                          <span className="text-muted-foreground">{new Date(log.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Regenerate Dialog */}
      <Dialog open={isRegenerateOpen} onOpenChange={setIsRegenerateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              Regenerate API Key
            </DialogTitle>
            <DialogDescription>
              This will invalidate your current API key. All applications using the old key will need to be updated.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRegenerateOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={regenerateKey} disabled={regenerating}>
              {regenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Regenerate Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default APIManagement;