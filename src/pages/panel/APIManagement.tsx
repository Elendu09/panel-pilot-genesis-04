import { useState } from "react";
import { 
  Key, Copy, RefreshCw, Eye, EyeOff, Code, Send, CheckCircle, XCircle, Clock,
  BarChart3, Webhook, FileText, ChevronDown, ChevronRight, Zap, Shield, Activity,
  Terminal, BookOpen, Play, AlertCircle, RotateCcw, ExternalLink
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
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useWebhooks, WebhookEventType } from "@/hooks/use-webhooks";

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

const APIManagement = () => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [isRegenerateOpen, setIsRegenerateOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("https://your-domain.com/webhook");
  const [webhookEnabled, setWebhookEnabled] = useState(true);
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>("services");
  const [selectedLanguage, setSelectedLanguage] = useState("curl");
  const [selectedEvents, setSelectedEvents] = useState<WebhookEventType[]>([
    "order.created", "order.completed", "gateway.approved", "dns.propagated"
  ]);
  const [autoRefreshLogs, setAutoRefreshLogs] = useState(false);

  const { sending, deliveries, testWebhook: sendTestWebhook } = useWebhooks();

  const apiKey = "sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
  const maskedKey = "sk_live_xxxx...xxxx";
  const apiBaseUrl = "https://api.yourpanel.com";

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

  const apiLogs = [
    { id: 1, endpoint: "/api/v2 (add)", method: "POST", status: 200, time: "45ms", date: "2024-01-15 14:30:22" },
    { id: 2, endpoint: "/api/v2 (services)", method: "POST", status: 200, time: "23ms", date: "2024-01-15 14:29:15" },
    { id: 3, endpoint: "/api/v2 (status)", method: "POST", status: 200, time: "18ms", date: "2024-01-15 14:28:45" },
    { id: 4, endpoint: "/api/v2 (add)", method: "POST", status: 400, time: "12ms", date: "2024-01-15 14:27:30" },
    { id: 5, endpoint: "/api/v2 (balance)", method: "POST", status: 200, time: "15ms", date: "2024-01-15 14:25:10" },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const regenerateKey = () => {
    toast({ title: "API key regenerated successfully" });
    setIsRegenerateOpen(false);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
          API Management
        </h1>
        <p className="text-muted-foreground">Manage API keys, view documentation, and monitor usage</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "API Calls Today", value: "1,234", icon: Activity, color: "text-primary" },
          { label: "Success Rate", value: "99.2%", icon: CheckCircle, color: "text-green-500" },
          { label: "Avg Response", value: "45ms", icon: Zap, color: "text-blue-500" },
          { label: "Rate Limit", value: "85%", icon: Shield, color: "text-yellow-500" },
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
                    <Input value={showApiKey ? apiKey : maskedKey} readOnly className="pr-20 bg-background/50 font-mono" />
                    <Button variant="ghost" size="icon" className="absolute right-10 top-1/2 -translate-y-1/2" onClick={() => setShowApiKey(!showApiKey)}>
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2" onClick={() => copyToClipboard(apiKey)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button variant="outline" onClick={() => setIsRegenerateOpen(true)} className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Regenerate
                  </Button>
                </div>
                <div className="glass-card p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Rate Limit Usage</span>
                    <span className="text-sm font-medium">8,500 / 10,000 requests</span>
                  </div>
                  <Progress value={85} className="h-2" />
                  <p className="text-xs text-muted-foreground">Resets in 4 hours</p>
                </div>
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

        {/* Webhooks Tab - Enhanced */}
        <TabsContent value="webhooks" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Webhook Configuration */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Webhook className="w-5 h-5 text-primary" />
                    Webhook Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Enable Webhooks</p>
                      <p className="text-sm text-muted-foreground">Receive real-time event notifications</p>
                    </div>
                    <Switch checked={webhookEnabled} onCheckedChange={setWebhookEnabled} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Webhook URL</Label>
                    <div className="flex flex-col md:flex-row gap-2">
                      <Input 
                        value={webhookUrl} 
                        onChange={(e) => setWebhookUrl(e.target.value)} 
                        placeholder="https://your-domain.com/webhook" 
                        className="flex-1 bg-background/50" 
                      />
                      <Button onClick={handleTestWebhook} disabled={sending} className="gap-2">
                        {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Test
                      </Button>
                    </div>
                  </div>

                  {/* Event Type Selection */}
                  <div className="space-y-4">
                    <Label>Event Types</Label>
                    {Object.entries(webhookEvents).map(([category, { label, events }]) => (
                      <div key={category} className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">{label}</p>
                        <div className="grid gap-2">
                          {events.map((event) => (
                            <div 
                              key={event.id} 
                              className="glass-card p-3 rounded-lg flex items-start gap-3 hover:bg-accent/30 transition-colors"
                            >
                              <Checkbox 
                                id={event.id}
                                checked={selectedEvents.includes(event.id)}
                                onCheckedChange={() => toggleEvent(event.id)}
                              />
                              <div className="flex-1">
                                <label htmlFor={event.id} className="text-sm font-medium cursor-pointer">
                                  {event.name}
                                </label>
                                <p className="text-xs text-muted-foreground">{event.description}</p>
                              </div>
                              <Badge variant="outline" className="font-mono text-xs shrink-0">
                                {event.id}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button onClick={saveWebhookConfig} className="w-full bg-gradient-to-r from-primary to-primary/80">
                    Save Configuration
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Delivery Logs */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="glass-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary" />
                      Delivery Logs
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="auto-refresh" className="text-sm text-muted-foreground">Auto-refresh</Label>
                      <Switch 
                        id="auto-refresh"
                        checked={autoRefreshLogs}
                        onCheckedChange={setAutoRefreshLogs}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {deliveries.length === 0 ? (
                      <div className="text-center py-8">
                        <Webhook className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">No webhook deliveries yet</p>
                        <p className="text-sm text-muted-foreground">Test your webhook to see delivery logs</p>
                      </div>
                    ) : (
                      deliveries.map((delivery) => (
                        <div 
                          key={delivery.id}
                          className="glass-card p-3 rounded-lg space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "font-mono text-xs",
                                  delivery.status === "success" && "bg-green-500/10 text-green-500 border-green-500/20",
                                  delivery.status === "failed" && "bg-destructive/10 text-destructive border-destructive/20",
                                  delivery.status === "pending" && "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                )}
                              >
                                {delivery.status === "success" && <CheckCircle className="w-3 h-3 mr-1" />}
                                {delivery.status === "failed" && <XCircle className="w-3 h-3 mr-1" />}
                                {delivery.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                                {delivery.statusCode || delivery.status.toUpperCase()}
                              </Badge>
                              <span className="text-sm font-mono">{delivery.event}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(delivery.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate font-mono">{delivery.url}</p>
                          {delivery.retries > 0 && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <RotateCcw className="w-3 h-3" />
                              {delivery.retries} retries
                            </div>
                          )}
                          {delivery.response && (
                            <pre className="text-xs bg-muted/50 p-2 rounded overflow-x-auto max-h-20">
                              {delivery.response.substring(0, 200)}...
                            </pre>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="glass-card overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Recent API Calls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Endpoint</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Method</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Time</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {apiLogs.map((log) => (
                        <tr key={log.id} className="border-b border-border/30 hover:bg-accent/30 transition-colors">
                          <td className="p-3 font-mono text-sm">{log.endpoint}</td>
                          <td className="p-3">
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                              {log.method}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge 
                              variant="outline" 
                              className={cn(
                                log.status === 200 
                                  ? "bg-green-500/10 text-green-500 border-green-500/20" 
                                  : "bg-destructive/10 text-destructive border-destructive/20"
                              )}
                            >
                              {log.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">{log.time}</td>
                          <td className="p-3 text-sm text-muted-foreground">{log.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Regenerate Key Dialog */}
      <Dialog open={isRegenerateOpen} onOpenChange={setIsRegenerateOpen}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>Regenerate API Key</DialogTitle>
            <DialogDescription>
              This will invalidate your current API key. All applications using the current key will need to be updated.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 p-4 bg-destructive/10 rounded-lg">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <p className="text-sm text-destructive">This action cannot be undone</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRegenerateOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={regenerateKey}>Regenerate Key</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default APIManagement;
