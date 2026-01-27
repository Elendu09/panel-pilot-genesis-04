import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Code, ArrowLeft, Copy, Check, Key, Globe, Zap, Shield, BookOpen, ChevronRight,
  Send, Package, RefreshCw, XCircle, Clock, DollarSign, AlertCircle, CheckCircle,
  List, FileText, Hash, MessageSquare, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useNavigate } from "react-router-dom";
import { useTenant } from "@/hooks/useTenant";
import { useBuyerAuth } from "@/contexts/BuyerAuthContext";
import { toast } from "@/hooks/use-toast";
import BuyerLayout from "./BuyerLayout";

const BuyerAPI = () => {
  const navigate = useNavigate();
  const { panel } = useTenant();
  const { buyer } = useBuyerAuth();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>("services");

  // Detect current platform domain dynamically
  const getPlatformDomain = (): string => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const parts = hostname.split('.');
      if (parts.length >= 2) {
        const rootDomain = parts.slice(-2).join('.');
        if (['homeofsmm.com', 'smmpilot.online'].includes(rootDomain)) {
          return rootDomain;
        }
      }
      if (hostname.includes('localhost') || hostname.includes('lovable.app')) {
        return 'smmpilot.online';
      }
    }
    return 'smmpilot.online';
  };

  const platformDomain = getPlatformDomain();

  // Buyer API uses tenant's domain (custom domain or subdomain)
  const apiBaseUrl = panel?.custom_domain 
    ? `https://${panel.custom_domain}/api/v2`
    : panel?.subdomain 
      ? `https://${panel.subdomain}.${platformDomain}/api/v2`
      : `https://yourpanel.${platformDomain}/api/v2`;

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(id);
      toast({ title: "Copied to clipboard" });
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const endpoints = [
    {
      id: "services",
      method: "POST",
      action: "services",
      description: "Get all available services",
      params: [
        { name: "key", type: "string", required: true, description: "Your API key" },
        { name: "action", type: "string", required: true, description: "services" }
      ],
      response: `[
  {
    "service": "1",
    "name": "Instagram Followers [Real] [30 Days Refill]",
    "type": "Default",
    "category": "Instagram",
    "rate": "2.5000",
    "min": 100,
    "max": 10000,
    "refill": true,
    "cancel": false,
    "desc": "High quality followers with 30 day refill guarantee"
  }
]`
    },
    {
      id: "add",
      method: "POST",
      action: "add",
      description: "Add new order",
      params: [
        { name: "key", type: "string", required: true, description: "Your API key" },
        { name: "action", type: "string", required: true, description: "add" },
        { name: "service", type: "number", required: true, description: "Service ID" },
        { name: "link", type: "string", required: true, description: "Target URL/username" },
        { name: "quantity", type: "number", required: true, description: "Order quantity" },
        { name: "comments", type: "string", required: false, description: "Custom comments (for comment services)" },
        { name: "username", type: "string", required: false, description: "Username (for mention services)" }
      ],
      response: `{
  "order": "ORD1234567890ABCD"
}`
    },
    {
      id: "status",
      method: "POST",
      action: "status",
      description: "Get order status",
      params: [
        { name: "key", type: "string", required: true, description: "Your API key" },
        { name: "action", type: "string", required: true, description: "status" },
        { name: "order", type: "string", required: true, description: "Order ID" }
      ],
      response: `{
  "charge": "2.5000",
  "start_count": "1000",
  "status": "In progress",
  "remains": "500",
  "currency": "USD"
}`
    },
    {
      id: "multi-status",
      method: "POST",
      action: "status",
      description: "Get multiple orders status",
      params: [
        { name: "key", type: "string", required: true, description: "Your API key" },
        { name: "action", type: "string", required: true, description: "status" },
        { name: "orders", type: "string", required: true, description: "Order IDs (comma separated)" }
      ],
      response: `{
  "ORD123": {"charge": "2.50", "status": "Completed", "start_count": "1000", "remains": "0"},
  "ORD456": {"charge": "5.00", "status": "In progress", "start_count": "500", "remains": "250"}
}`
    },
    {
      id: "balance",
      method: "POST",
      action: "balance",
      description: "Get account balance",
      params: [
        { name: "key", type: "string", required: true, description: "Your API key" },
        { name: "action", type: "string", required: true, description: "balance" }
      ],
      response: `{
  "balance": "150.5000",
  "currency": "USD"
}`
    },
    {
      id: "refill",
      method: "POST",
      action: "refill",
      description: "Request order refill",
      params: [
        { name: "key", type: "string", required: true, description: "Your API key" },
        { name: "action", type: "string", required: true, description: "refill" },
        { name: "order", type: "string", required: true, description: "Order ID" }
      ],
      response: `{
  "refill": "abc123-refill-id"
}`
    },
    {
      id: "refill_status",
      method: "POST",
      action: "refill_status",
      description: "Get refill status",
      params: [
        { name: "key", type: "string", required: true, description: "Your API key" },
        { name: "action", type: "string", required: true, description: "refill_status" },
        { name: "refill", type: "string", required: true, description: "Refill ID" }
      ],
      response: `{
  "status": "Completed"
}`
    },
    {
      id: "cancel",
      method: "POST",
      action: "cancel",
      description: "Cancel orders",
      params: [
        { name: "key", type: "string", required: true, description: "Your API key" },
        { name: "action", type: "string", required: true, description: "cancel" },
        { name: "orders", type: "string", required: true, description: "Order IDs (comma separated)" }
      ],
      response: `[
  {"order": "ORD123", "cancel": true},
  {"order": "ORD456", "cancel": {"error": "Order cannot be cancelled"}}
]`
    }
  ];

  const serviceTypes = [
    { type: "Default", description: "Standard service with link and quantity", fields: ["link", "quantity"] },
    { type: "Package", description: "Pre-defined package", fields: ["link"] },
    { type: "Custom Comments", description: "Custom comments service", fields: ["link", "comments"] },
    { type: "Mentions Custom List", description: "Mentions with custom usernames", fields: ["link", "usernames"] },
    { type: "Mentions Hashtag", description: "Mentions from hashtag followers", fields: ["link", "hashtag"] },
    { type: "Poll", description: "Poll voting service", fields: ["link", "answer_number"] },
    { type: "Subscriptions", description: "Recurring service", fields: ["link", "min", "max", "posts", "delay", "expiry"] }
  ];

  const errorCodes = [
    { code: "Invalid API key", description: "The API key is incorrect or inactive" },
    { code: "Service not found", description: "The service ID does not exist" },
    { code: "Incorrect order ID", description: "Order ID not found" },
    { code: "Order cannot be cancelled", description: "Order is not in a cancellable state" },
    { code: "Insufficient balance", description: "Not enough funds for the order" },
    { code: "Invalid link", description: "The target URL format is invalid" }
  ];

  const generateCode = (lang: string, action: string) => {
    const examples: Record<string, Record<string, string>> = {
      curl: {
        services: `curl -X POST "${apiBaseUrl}" \\
  -d "key=YOUR_API_KEY" \\
  -d "action=services"`,
        add: `curl -X POST "${apiBaseUrl}" \\
  -d "key=YOUR_API_KEY" \\
  -d "action=add" \\
  -d "service=1" \\
  -d "link=https://instagram.com/username" \\
  -d "quantity=1000"`,
        status: `curl -X POST "${apiBaseUrl}" \\
  -d "key=YOUR_API_KEY" \\
  -d "action=status" \\
  -d "order=ORD1234567890"`,
        balance: `curl -X POST "${apiBaseUrl}" \\
  -d "key=YOUR_API_KEY" \\
  -d "action=balance"`
      },
      php: {
        services: `<?php
$api_url = "${apiBaseUrl}";

$response = file_get_contents($api_url . "?" . http_build_query([
    'key' => 'YOUR_API_KEY',
    'action' => 'services'
]));

$services = json_decode($response, true);
print_r($services);`,
        add: `<?php
$api_url = "${apiBaseUrl}";

$data = [
    'key' => 'YOUR_API_KEY',
    'action' => 'add',
    'service' => 1,
    'link' => 'https://instagram.com/username',
    'quantity' => 1000
];

$ch = curl_init($api_url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$result = json_decode($response, true);
echo "Order ID: " . $result['order'];`,
        status: `<?php
$api_url = "${apiBaseUrl}";

$data = [
    'key' => 'YOUR_API_KEY',
    'action' => 'status',
    'order' => 'ORD1234567890'
];

$ch = curl_init($api_url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$status = json_decode($response, true);
print_r($status);`,
        balance: `<?php
$api_url = "${apiBaseUrl}";

$data = [
    'key' => 'YOUR_API_KEY',
    'action' => 'balance'
];

$ch = curl_init($api_url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$balance = json_decode($response, true);
echo "Balance: $" . $balance['balance'];`
      },
      python: {
        services: `import requests

api_url = "${apiBaseUrl}"
response = requests.post(api_url, data={
    "key": "YOUR_API_KEY",
    "action": "services"
})

data = response.json()
for item in data:
    print(item['service'], item['name'], item['rate'])`,
        add: `import requests

api_url = "${apiBaseUrl}"
response = requests.post(api_url, data={
    "key": "YOUR_API_KEY",
    "action": "add",
    "service": 1,
    "link": "https://instagram.com/username",
    "quantity": 1000
})

result = response.json()
print("Order ID:", result['order'])`,
        status: `import requests

api_url = "${apiBaseUrl}"
response = requests.post(api_url, data={
    "key": "YOUR_API_KEY",
    "action": "status",
    "order": "ORD1234567890"
})

order_status = response.json()
print("Status:", order_status['status'])
print("Remaining:", order_status['remains'])`,
        balance: `import requests

api_url = "${apiBaseUrl}"
response = requests.post(api_url, data={
    "key": "YOUR_API_KEY",
    "action": "balance"
})

bal = response.json()
print("Balance:", bal['balance'])`
      },
      nodejs: {
        services: `const axios = require('axios');

const apiUrl = '${apiBaseUrl}';

axios.post(apiUrl, new URLSearchParams({
    key: 'YOUR_API_KEY',
    action: 'services'
}))
.then(response => {
    console.log('Services:', response.data);
})
.catch(error => console.error(error));`,
        add: `const axios = require('axios');

const apiUrl = '${apiBaseUrl}';

axios.post(apiUrl, new URLSearchParams({
    key: 'YOUR_API_KEY',
    action: 'add',
    service: '1',
    link: 'https://instagram.com/username',
    quantity: '1000'
}))
.then(response => {
    console.log('Order ID:', response.data.order);
})
.catch(error => console.error(error));`,
        status: `const axios = require('axios');

const apiUrl = '${apiBaseUrl}';

axios.post(apiUrl, new URLSearchParams({
    key: 'YOUR_API_KEY',
    action: 'status',
    order: 'ORD1234567890'
}))
.then(response => {
    console.log('Status:', response.data);
})
.catch(error => console.error(error));`,
        balance: `const axios = require('axios');

const apiUrl = '${apiBaseUrl}';

axios.post(apiUrl, new URLSearchParams({
    key: 'YOUR_API_KEY',
    action: 'balance'
}))
.then(response => {
    console.log('Balance:', response.data.balance);
})
.catch(error => console.error(error));`
      }
    };
    return examples[lang]?.[action] || examples[lang]?.services || '';
  };

  return (
    <BuyerLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">API Documentation</h1>
            <p className="text-sm text-muted-foreground">
              SMM Panel API v2 - Compatible with all standard SMM panels
            </p>
          </div>
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
            v2.0
          </Badge>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Endpoints", value: endpoints.length, icon: Code, color: "text-primary" },
            { label: "Rate Limit", value: "100/min", icon: Zap, color: "text-amber-500" },
            { label: "Response", value: "JSON", icon: FileText, color: "text-blue-500" },
            { label: "Auth", value: "API Key", icon: Key, color: "text-green-500" },
          ].map((stat) => (
            <Card key={stat.label} className="glass-card">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="font-semibold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="endpoints" className="space-y-6">
          <TabsList className="glass-card p-1 flex-wrap h-auto">
            <TabsTrigger value="endpoints"><List className="w-4 h-4 mr-2" /> Endpoints</TabsTrigger>
            <TabsTrigger value="examples"><Code className="w-4 h-4 mr-2" /> Code Examples</TabsTrigger>
            <TabsTrigger value="types"><Package className="w-4 h-4 mr-2" /> Service Types</TabsTrigger>
            <TabsTrigger value="errors"><AlertCircle className="w-4 h-4 mr-2" /> Error Codes</TabsTrigger>
          </TabsList>

          {/* Endpoints Tab */}
          <TabsContent value="endpoints" className="space-y-4">
            {/* Base URL Card */}
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  API Base URL
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-muted px-4 py-2 rounded-lg text-sm font-mono overflow-x-auto">
                    {apiBaseUrl}
                  </code>
                  <Button variant="ghost" size="icon" onClick={() => copyToClipboard(apiBaseUrl, "baseurl")}>
                    {copiedCode === "baseurl" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  All requests should use POST method with form-data or JSON body
                </p>
              </CardContent>
            </Card>

            {/* Endpoints List */}
            {endpoints.map((endpoint) => (
              <Collapsible 
                key={endpoint.id} 
                open={expandedEndpoint === endpoint.id}
                onOpenChange={(open) => setExpandedEndpoint(open ? endpoint.id : null)}
              >
                <Card className="glass-card overflow-hidden">
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="flex flex-row items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                          {endpoint.method}
                        </Badge>
                        <code className="text-sm font-mono">action={endpoint.action}</code>
                        <span className="text-sm text-muted-foreground hidden md:inline">
                          — {endpoint.description}
                        </span>
                      </div>
                      <ChevronRight className={`w-5 h-5 transition-transform ${expandedEndpoint === endpoint.id ? 'rotate-90' : ''}`} />
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="border-t space-y-4 pt-4">
                      {/* Parameters */}
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Hash className="w-4 h-4" /> Parameters
                        </h4>
                        <div className="space-y-2">
                          {endpoint.params.map((param) => (
                            <div key={param.name} className="flex items-start gap-3 p-2 bg-muted/30 rounded-lg">
                              <code className="text-sm font-mono text-primary">{param.name}</code>
                              <Badge variant="outline" className="text-xs">{param.type}</Badge>
                              {param.required && (
                                <Badge variant="outline" className="text-xs bg-red-500/10 text-red-500 border-red-500/20">Required</Badge>
                              )}
                              <span className="text-sm text-muted-foreground">{param.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Response */}
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <FileText className="w-4 h-4" /> Response Example
                        </h4>
                        <div className="relative">
                          <pre className="bg-muted/50 p-4 rounded-lg text-sm overflow-x-auto">
                            <code>{endpoint.response}</code>
                          </pre>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="absolute top-2 right-2 h-8 w-8"
                            onClick={() => copyToClipboard(endpoint.response, `response-${endpoint.id}`)}
                          >
                            {copiedCode === `response-${endpoint.id}` ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </TabsContent>

          {/* Code Examples Tab */}
          <TabsContent value="examples" className="space-y-4">
            <Tabs defaultValue="curl">
              <TabsList className="mb-4">
                <TabsTrigger value="curl">cURL</TabsTrigger>
                <TabsTrigger value="php">PHP</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
                <TabsTrigger value="nodejs">Node.js</TabsTrigger>
              </TabsList>

              {['curl', 'php', 'python', 'nodejs'].map((lang) => (
                <TabsContent key={lang} value={lang} className="space-y-4">
                  {['services', 'add', 'status', 'balance'].map((action) => (
                    <Card key={action} className="glass-card">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm capitalize">{action === 'add' ? 'Create Order' : action}</CardTitle>
                      </CardHeader>
                      <CardContent className="relative">
                        <pre className="bg-muted/50 p-4 rounded-lg text-sm overflow-x-auto max-h-[300px]">
                          <code>{generateCode(lang, action)}</code>
                        </pre>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-2 right-2 h-8 w-8"
                          onClick={() => copyToClipboard(generateCode(lang, action), `${lang}-${action}`)}
                        >
                          {copiedCode === `${lang}-${action}` ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              ))}
            </Tabs>
          </TabsContent>

          {/* Service Types Tab */}
          <TabsContent value="types" className="space-y-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Service Types
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {serviceTypes.map((st, index) => (
                  <div key={index} className="p-4 bg-muted/30 rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge>{st.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{st.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs text-muted-foreground">Required fields:</span>
                      {st.fields.map((field) => (
                        <code key={field} className="text-xs bg-muted px-2 py-0.5 rounded">{field}</code>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Error Codes Tab */}
          <TabsContent value="errors" className="space-y-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  Error Responses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {errorCodes.map((err, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                      <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <code className="text-sm font-medium text-red-500">{err.code}</code>
                        <p className="text-sm text-muted-foreground">{err.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Support Card */}
        <Card className="glass-card bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold mb-2">Need Help?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Contact our support team for API integration assistance.
            </p>
            <Button onClick={() => navigate('/support')}>Contact Support</Button>
          </CardContent>
        </Card>
      </motion.div>
    </BuyerLayout>
  );
};

export default BuyerAPI;
