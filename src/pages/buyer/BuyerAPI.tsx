import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Code, 
  ArrowLeft, 
  Copy, 
  Check, 
  Key, 
  Globe, 
  Zap,
  Shield,
  BookOpen,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  const apiBaseUrl = `https://${panel?.subdomain}.smmpilot.online/api/v1`;

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
      method: "POST",
      path: "/order",
      description: "Create a new order",
      params: ["service", "link", "quantity"],
    },
    {
      method: "GET",
      path: "/order/{id}",
      description: "Get order status",
      params: ["id"],
    },
    {
      method: "GET",
      path: "/services",
      description: "Get all available services",
      params: [],
    },
    {
      method: "GET",
      path: "/balance",
      description: "Get current account balance",
      params: [],
    },
  ];

  const curlExample = `curl -X POST "${apiBaseUrl}/order" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "service": "1",
    "link": "https://instagram.com/username",
    "quantity": 1000
  }'`;

  const jsExample = `const response = await fetch("${apiBaseUrl}/order", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    service: "1",
    link: "https://instagram.com/username",
    quantity: 1000
  })
});

const data = await response.json();
console.log(data);`;

  const pythonExample = `import requests

response = requests.post(
    "${apiBaseUrl}/order",
    headers={
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
    },
    json={
        "service": "1",
        "link": "https://instagram.com/username",
        "quantity": 1000
    }
)

print(response.json())`;

  const phpExample = `<?php
$ch = curl_init();

curl_setopt_array($ch, [
    CURLOPT_URL => "${apiBaseUrl}/order",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        "Authorization: Bearer YOUR_API_KEY",
        "Content-Type: application/json"
    ],
    CURLOPT_POSTFIELDS => json_encode([
        "service" => "1",
        "link" => "https://instagram.com/username",
        "quantity" => 1000
    ])
]);

$response = curl_exec($ch);
curl_close($ch);

print_r(json_decode($response, true));
?>`;

  return (
    <BuyerLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">API Documentation</h1>
            <p className="text-sm text-muted-foreground">
              Integrate our services into your applications
            </p>
          </div>
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
            v1.0
          </Badge>
        </div>

        {/* Quick Start Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Key className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">API Key</p>
                <p className="text-xs text-muted-foreground">Get from Profile</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Globe className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="font-medium text-sm">Base URL</p>
                <p className="text-xs text-muted-foreground truncate">{apiBaseUrl}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Zap className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="font-medium text-sm">Rate Limit</p>
                <p className="text-xs text-muted-foreground">100 req/min</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Authentication */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Authentication
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              All API requests require authentication using your API key. Include it in the Authorization header:
            </p>
            <div className="relative">
              <pre className="bg-muted/50 p-4 rounded-lg text-sm overflow-x-auto">
                <code>Authorization: Bearer YOUR_API_KEY</code>
              </pre>
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={() => copyToClipboard("Authorization: Bearer YOUR_API_KEY", "auth")}
              >
                {copiedCode === "auth" ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              You can find your API key in your <Button variant="link" className="p-0 h-auto text-xs" onClick={() => navigate('/profile')}>Profile Settings</Button>
            </p>
          </CardContent>
        </Card>

        {/* Endpoints */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Available Endpoints
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {endpoints.map((endpoint, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant="outline"
                      className={
                        endpoint.method === "POST" 
                          ? "bg-green-500/10 text-green-500 border-green-500/20" 
                          : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                      }
                    >
                      {endpoint.method}
                    </Badge>
                    <code className="text-sm font-mono">{endpoint.path}</code>
                  </div>
                  <span className="text-sm text-muted-foreground hidden sm:block">
                    {endpoint.description}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Code Examples */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Code className="w-5 h-5 text-primary" />
              Code Examples
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="curl" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="curl">cURL</TabsTrigger>
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
                <TabsTrigger value="php">PHP</TabsTrigger>
              </TabsList>
              
              <TabsContent value="curl" className="relative">
                <pre className="bg-muted/50 p-4 rounded-lg text-sm overflow-x-auto max-h-[300px]">
                  <code>{curlExample}</code>
                </pre>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={() => copyToClipboard(curlExample, "curl")}
                >
                  {copiedCode === "curl" ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </TabsContent>
              
              <TabsContent value="javascript" className="relative">
                <pre className="bg-muted/50 p-4 rounded-lg text-sm overflow-x-auto max-h-[300px]">
                  <code>{jsExample}</code>
                </pre>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={() => copyToClipboard(jsExample, "js")}
                >
                  {copiedCode === "js" ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </TabsContent>
              
              <TabsContent value="python" className="relative">
                <pre className="bg-muted/50 p-4 rounded-lg text-sm overflow-x-auto max-h-[300px]">
                  <code>{pythonExample}</code>
                </pre>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={() => copyToClipboard(pythonExample, "python")}
                >
                  {copiedCode === "python" ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </TabsContent>
              
              <TabsContent value="php" className="relative">
                <pre className="bg-muted/50 p-4 rounded-lg text-sm overflow-x-auto max-h-[300px]">
                  <code>{phpExample}</code>
                </pre>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={() => copyToClipboard(phpExample, "php")}
                >
                  {copiedCode === "php" ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Response Example */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Response Format</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted/50 p-4 rounded-lg text-sm overflow-x-auto">
              <code>{`{
  "success": true,
  "data": {
    "order_id": "12345",
    "status": "pending",
    "charge": 2.50
  }
}`}</code>
            </pre>
          </CardContent>
        </Card>

        {/* Support */}
        <Card className="glass-card bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold mb-2">Need Help?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              If you have questions about the API, contact our support team.
            </p>
            <Button onClick={() => navigate('/support')}>
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </BuyerLayout>
  );
};

export default BuyerAPI;
