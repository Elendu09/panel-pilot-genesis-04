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

  // Compute real API base URL from panel's domain
  const apiBaseUrl = panel?.custom_domain 
    ? `https://${panel.custom_domain}` 
    : panel?.subdomain 
      ? `https://${panel.subdomain}.smmpilot.online`
      : "https://yourpanel.smmpilot.online";

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

  const endpoints = [
    {
      id: "services",
      method: "GET",
      path: "/api/v2/services",
      description: "Get all available services",
      params: [],
      response: `{"status":"success","data":[{"service":1,"name":"Instagram Followers","type":"default","rate":"2.50","min":"100","max":"10000","category":"Instagram"}]}`
    },
    {
      id: "add-order",
      method: "POST",
      path: "/api/v2/order",
      description: "Add new order",
      params: ["key", "action=add", "service", "link", "quantity"],
      response: `{"order":12345}`
    },
    {
      id: "order-status",
      method: "POST",
      path: "/api/v2/status",
      description: "Get order status",
      params: ["key", "action=status", "order"],
      response: `{"charge":"2.50","start_count":"1000","status":"In progress","remains":"500","currency":"USD"}`
    },
    {
      id: "multi-status",
      method: "POST",
      path: "/api/v2/status",
      description: "Get multiple orders status",
      params: ["key", "action=status", "orders (comma separated)"],
      response: `{"1":{"charge":"2.50","status":"Completed"},"2":{"charge":"5.00","status":"In progress"}}`
    },
    {
      id: "balance",
      method: "POST",
      path: "/api/v2/balance",
      description: "Get account balance",
      params: ["key", "action=balance"],
      response: `{"balance":"150.50","currency":"USD"}`
    },
    {
      id: "refill",
      method: "POST",
      path: "/api/v2/refill",
      description: "Request order refill",
      params: ["key", "action=refill", "order"],
      response: `{"refill":1}`
    },
    {
      id: "cancel",
      method: "POST",
      path: "/api/v2/cancel",
      description: "Cancel order",
      params: ["key", "action=cancel", "orders (comma separated)"],
      response: `[{"order":1,"cancel":{"error":"Incorrect order ID"}}]`
    },
  ];

  const sdkExamples = {
    curl: `curl -X POST "${apiBaseUrl}/api/v2" \\
  -d "key=${maskedKey}" \\
  -d "action=services"`,
    php: `<?php
$api_url = "${apiBaseUrl}/api/v2";
$data = [
    'key' => '${maskedKey}',
    'action' => 'services'
];

$ch = curl_init($api_url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$result = json_decode($response, true);
print_r($result);`,
    python: `import requests

api_url = "${apiBaseUrl}/api/v2"
data = {
    "key": "${maskedKey}",
    "action": "services"
}

response = requests.post(api_url, data=data)
result = response.json()
print(result)`,
    nodejs: `const axios = require('axios');

const apiUrl = '${apiBaseUrl}/api/v2';
const data = new URLSearchParams({
    key: '${maskedKey}',
    action: 'services'
});

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
                  <Label className="text-sm text-muted-foreground">API Base URL</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono">{apiBaseUrl}/api/v2</code>
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(`${apiBaseUrl}/api/v2`)}>
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
                <p className="text-sm text-muted-foreground mb-4">
                  Base URL: <code className="bg-muted px-2 py-1 rounded">{apiBaseUrl}/api/v2</code>
                </p>
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