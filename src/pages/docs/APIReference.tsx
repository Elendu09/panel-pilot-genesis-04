import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocsCodeBlock } from "@/components/docs/DocsCodeBlock";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Key, ShoppingCart, Package, Wallet, RefreshCw, ArrowRight } from "lucide-react";

const endpoints = [
  {
    method: "POST",
    path: "/api/v2",
    title: "Place Order",
    icon: ShoppingCart,
    description: "Submit a new order for a service.",
    params: [
      { name: "key", type: "string", required: true, desc: "Your API key" },
      { name: "action", type: "string", required: true, desc: '"add"' },
      { name: "service", type: "integer", required: true, desc: "Service ID" },
      { name: "link", type: "string", required: true, desc: "Target URL (e.g. Instagram post link)" },
      { name: "quantity", type: "integer", required: true, desc: "Order quantity" },
    ],
    exampleRequest: `curl -X POST https://yourpanel.smmpilot.online/api/v2 \\
  -H "Content-Type: application/json" \\
  -d '{
    "key": "your_api_key",
    "action": "add",
    "service": 1,
    "link": "https://instagram.com/p/example",
    "quantity": 1000
  }'`,
    exampleResponse: `{
  "order": 12345
}`,
  },
  {
    method: "POST",
    path: "/api/v2",
    title: "Check Order Status",
    icon: RefreshCw,
    description: "Check the status and progress of an existing order.",
    params: [
      { name: "key", type: "string", required: true, desc: "Your API key" },
      { name: "action", type: "string", required: true, desc: '"status"' },
      { name: "order", type: "integer", required: true, desc: "Order ID" },
    ],
    exampleRequest: `curl -X POST https://yourpanel.smmpilot.online/api/v2 \\
  -H "Content-Type: application/json" \\
  -d '{
    "key": "your_api_key",
    "action": "status",
    "order": 12345
  }'`,
    exampleResponse: `{
  "charge": "2.50",
  "start_count": "1500",
  "status": "Completed",
  "remains": "0",
  "currency": "USD"
}`,
  },
  {
    method: "POST",
    path: "/api/v2",
    title: "Get Services",
    icon: Package,
    description: "Retrieve the list of all available services and their pricing.",
    params: [
      { name: "key", type: "string", required: true, desc: "Your API key" },
      { name: "action", type: "string", required: true, desc: '"services"' },
    ],
    exampleRequest: `curl -X POST https://yourpanel.smmpilot.online/api/v2 \\
  -H "Content-Type: application/json" \\
  -d '{
    "key": "your_api_key",
    "action": "services"
  }'`,
    exampleResponse: `[
  {
    "service": 1,
    "name": "Instagram Followers",
    "type": "Default",
    "rate": "2.50",
    "min": 100,
    "max": 50000,
    "category": "Instagram"
  }
]`,
  },
  {
    method: "POST",
    path: "/api/v2",
    title: "Check Balance",
    icon: Wallet,
    description: "Get the current balance of your account.",
    params: [
      { name: "key", type: "string", required: true, desc: "Your API key" },
      { name: "action", type: "string", required: true, desc: '"balance"' },
    ],
    exampleRequest: `curl -X POST https://yourpanel.smmpilot.online/api/v2 \\
  -H "Content-Type: application/json" \\
  -d '{
    "key": "your_api_key",
    "action": "balance"
  }'`,
    exampleResponse: `{
  "balance": "150.75",
  "currency": "USD"
}`,
  },
];

const APIReference = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-10">
          <Badge variant="secondary" className="mb-3">Documentation</Badge>
          <h1 className="text-4xl font-bold mb-4">API Reference</h1>
          <p className="text-lg text-muted-foreground">
            Integrate your applications with our RESTful API. All endpoints use POST requests with JSON payloads.
          </p>
        </div>

        {/* Auth Section */}
        <Card className="mb-10 border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Key className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-2">Authentication</h2>
                <p className="text-muted-foreground mb-3">
                  All API requests require your API key. You can find your API key in your account settings on the panel. 
                  Include it as the <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">key</code> parameter in every request.
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Base URL:</strong>{" "}
                  <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">
                    https://yourpanel.smmpilot.online/api/v2
                  </code>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Endpoints */}
        <div className="space-y-8 mb-12">
          {endpoints.map((endpoint, idx) => {
            const Icon = endpoint.icon;
            return (
              <Card key={idx} className="border-border overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <Icon className="w-5 h-5 text-primary" />
                    {endpoint.title}
                    <Badge variant="outline" className="ml-auto font-mono text-xs">
                      {endpoint.method}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Parameters */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Parameters</h4>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="text-left px-3 py-2 font-medium">Name</th>
                            <th className="text-left px-3 py-2 font-medium">Type</th>
                            <th className="text-left px-3 py-2 font-medium">Required</th>
                            <th className="text-left px-3 py-2 font-medium">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {endpoint.params.map((p, i) => (
                            <tr key={i} className="border-t border-border/50">
                              <td className="px-3 py-2 font-mono text-xs">{p.name}</td>
                              <td className="px-3 py-2 text-muted-foreground">{p.type}</td>
                              <td className="px-3 py-2">
                                {p.required ? (
                                  <Badge variant="default" className="text-xs">Yes</Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs">No</Badge>
                                )}
                              </td>
                              <td className="px-3 py-2 text-muted-foreground">{p.desc}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Code Examples */}
                  <Tabs defaultValue="request" className="w-full">
                    <TabsList className="h-8">
                      <TabsTrigger value="request" className="text-xs">Request</TabsTrigger>
                      <TabsTrigger value="response" className="text-xs">Response</TabsTrigger>
                    </TabsList>
                    <TabsContent value="request">
                      <DocsCodeBlock code={endpoint.exampleRequest} language="bash" />
                    </TabsContent>
                    <TabsContent value="response">
                      <DocsCodeBlock code={endpoint.exampleResponse} language="json" />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Rate Limits & Errors */}
        <Card className="mb-10">
          <CardHeader>
            <CardTitle>Rate Limits & Error Handling</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>API requests are rate-limited to <strong className="text-foreground">100 requests per minute</strong> per API key.</p>
            <p>All error responses include a JSON object with an <code className="px-1 py-0.5 rounded bg-muted font-mono">error</code> field describing the issue.</p>
            <DocsCodeBlock code={`{
  "error": "Invalid API key"
}`} language="json" title="Error Response Example" />
          </CardContent>
        </Card>

        {/* Links */}
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" asChild>
            <Link to="/docs">Browse All Documentation</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/docs/getting-started">Getting Started Guide</Link>
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default APIReference;
