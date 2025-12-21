import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Plug, 
  CreditCard, 
  Bell, 
  Webhook, 
  Zap,
  Plus,
  Check,
  Settings2,
  ExternalLink,
  RefreshCw,
  Trash2,
  ChevronRight,
  Shield,
  Globe,
  MessageSquare,
  Mail,
  Send,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: any;
  status: "connected" | "disconnected" | "pending";
  category: "payment" | "provider" | "notification" | "webhook" | "third-party";
  color: string;
  lastSync?: string;
}

const integrations: Integration[] = [
  // Payment Gateways
  { id: "stripe", name: "Stripe", description: "Accept credit card payments worldwide", icon: CreditCard, status: "connected", category: "payment", color: "from-purple-500 to-indigo-600", lastSync: "2 min ago" },
  { id: "paypal", name: "PayPal", description: "Accept PayPal payments", icon: CreditCard, status: "disconnected", category: "payment", color: "from-blue-500 to-blue-600" },
  { id: "crypto", name: "Coinbase Commerce", description: "Accept cryptocurrency payments", icon: CreditCard, status: "disconnected", category: "payment", color: "from-amber-500 to-orange-600" },
  { id: "perfectmoney", name: "Perfect Money", description: "Accept Perfect Money payments", icon: CreditCard, status: "connected", category: "payment", color: "from-green-500 to-emerald-600", lastSync: "5 min ago" },
  
  // Provider APIs
  { id: "provider-smmkings", name: "SMMKings API", description: "Main SMM service provider", icon: Plug, status: "connected", category: "provider", color: "from-pink-500 to-rose-600", lastSync: "1 min ago" },
  { id: "provider-socpanel", name: "SocPanel API", description: "Premium SMM services", icon: Plug, status: "connected", category: "provider", color: "from-cyan-500 to-teal-600", lastSync: "3 min ago" },
  { id: "provider-custom", name: "Custom API", description: "Add your own provider API", icon: Plug, status: "disconnected", category: "provider", color: "from-slate-500 to-slate-600" },
  
  // Notifications
  { id: "telegram", name: "Telegram Bot", description: "Send notifications to Telegram", icon: Send, status: "connected", category: "notification", color: "from-sky-500 to-blue-600", lastSync: "Just now" },
  { id: "discord", name: "Discord Webhook", description: "Send notifications to Discord", icon: MessageSquare, status: "disconnected", category: "notification", color: "from-indigo-500 to-purple-600" },
  { id: "email", name: "Email (SMTP)", description: "Send email notifications", icon: Mail, status: "connected", category: "notification", color: "from-red-500 to-pink-600", lastSync: "10 min ago" },
  
  // Webhooks
  { id: "webhook-orders", name: "Order Webhooks", description: "Notify external systems on orders", icon: Webhook, status: "connected", category: "webhook", color: "from-emerald-500 to-green-600" },
  { id: "webhook-users", name: "User Webhooks", description: "Notify on user registrations", icon: Webhook, status: "disconnected", category: "webhook", color: "from-amber-500 to-yellow-600" },
  
  // Third-party
  { id: "zapier", name: "Zapier", description: "Connect with 5000+ apps", icon: Zap, status: "disconnected", category: "third-party", color: "from-orange-500 to-red-600" },
  { id: "make", name: "Make (Integromat)", description: "Advanced automation workflows", icon: Zap, status: "disconnected", category: "third-party", color: "from-violet-500 to-purple-600" },
];

const categoryInfo = {
  payment: { title: "Payment Gateways", description: "Accept payments from customers", icon: CreditCard },
  provider: { title: "Provider APIs", description: "Connect to SMM service providers", icon: Plug },
  notification: { title: "Notifications", description: "Send alerts and notifications", icon: Bell },
  webhook: { title: "Webhooks", description: "Real-time event notifications", icon: Webhook },
  "third-party": { title: "Third-party Tools", description: "Automation and integrations", icon: Zap },
};

const Integrations = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [configDialog, setConfigDialog] = useState<Integration | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const filteredIntegrations = activeTab === "all" 
    ? integrations 
    : integrations.filter(i => i.category === activeTab);

  const connectedCount = integrations.filter(i => i.status === "connected").length;

  const handleConnect = async (integration: Integration) => {
    setIsLoading(integration.id);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(null);
    toast({ title: `${integration.name} Connected`, description: "Integration is now active." });
  };

  const handleDisconnect = async (integration: Integration) => {
    setIsLoading(integration.id);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(null);
    toast({ title: `${integration.name} Disconnected`, description: "Integration has been removed." });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Integrations
          </h1>
          <p className="text-muted-foreground">Connect your panel to external services and APIs</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="py-1.5 px-3 bg-primary/10 border-primary/30">
            <Check className="w-3 h-3 mr-1.5" />
            {connectedCount} Connected
          </Badge>
          <Button className="bg-gradient-to-r from-primary to-primary/80">
            <Plus className="w-4 h-4 mr-2" />
            Add Custom
          </Button>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-5 gap-4"
      >
        {Object.entries(categoryInfo).map(([key, info], index) => {
          const count = integrations.filter(i => i.category === key && i.status === "connected").length;
          const total = integrations.filter(i => i.category === key).length;
          return (
            <motion.div key={key} variants={itemVariants}>
              <Card 
                className={cn(
                  "glass-stat-card cursor-pointer transition-all hover:scale-[1.02]",
                  activeTab === key && "ring-2 ring-primary"
                )}
                onClick={() => setActiveTab(key)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <info.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{info.title}</p>
                      <p className="text-lg font-bold">{count}/{total}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="provider">Providers</TabsTrigger>
          <TabsTrigger value="notification">Notifications</TabsTrigger>
          <TabsTrigger value="webhook">Webhooks</TabsTrigger>
          <TabsTrigger value="third-party">Third-party</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Integrations Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {filteredIntegrations.map((integration) => (
          <motion.div key={integration.id} variants={itemVariants}>
            <Card className="glass-stat-card overflow-hidden group hover:border-primary/30 transition-all">
              {/* Gradient Header */}
              <div className={cn("h-2 bg-gradient-to-r", integration.color)} />
              
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2.5 rounded-xl bg-gradient-to-br", integration.color)}>
                      <integration.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{integration.name}</h3>
                      <p className="text-xs text-muted-foreground">{integration.description}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={integration.status === "connected" ? "default" : "secondary"}
                      className={cn(
                        integration.status === "connected" && "bg-green-500/10 text-green-500 border-green-500/20"
                      )}
                    >
                      {integration.status === "connected" ? (
                        <>
                          <Check className="w-3 h-3 mr-1" />
                          Connected
                        </>
                      ) : "Disconnected"}
                    </Badge>
                    {integration.lastSync && (
                      <span className="text-xs text-muted-foreground">
                        Synced {integration.lastSync}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {integration.status === "connected" ? (
                      <>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8"
                          onClick={() => setConfigDialog(integration)}
                        >
                          <Settings2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDisconnect(integration)}
                          disabled={isLoading === integration.id}
                        >
                          {isLoading === integration.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </>
                    ) : (
                      <Button 
                        size="sm" 
                        onClick={() => handleConnect(integration)}
                        disabled={isLoading === integration.id}
                      >
                        {isLoading === integration.id ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Plus className="w-4 h-4 mr-2" />
                        )}
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Configuration Dialog */}
      <Dialog open={!!configDialog} onOpenChange={() => setConfigDialog(null)}>
        <DialogContent className="glass-card max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {configDialog && (
                <div className={cn("p-2 rounded-lg bg-gradient-to-br", configDialog.color)}>
                  <configDialog.icon className="w-4 h-4 text-white" />
                </div>
              )}
              Configure {configDialog?.name}
            </DialogTitle>
            <DialogDescription>
              Update your integration settings and credentials
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>API Key / Secret</Label>
              <Input type="password" value="••••••••••••••••" className="bg-background/50" />
            </div>
            <div className="space-y-2">
              <Label>Webhook URL</Label>
              <Input value="https://api.yourpanel.com/webhook/stripe" readOnly className="bg-background/50" />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm font-medium">Auto-sync enabled</p>
                <p className="text-xs text-muted-foreground">Sync data every 5 minutes</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm font-medium">Sandbox/Test Mode</p>
                <p className="text-xs text-muted-foreground">Use test credentials</p>
              </div>
              <Switch />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigDialog(null)}>Cancel</Button>
            <Button onClick={() => {
              toast({ title: "Settings Saved" });
              setConfigDialog(null);
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Integrations;
