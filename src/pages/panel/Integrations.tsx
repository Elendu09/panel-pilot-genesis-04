import { useState, useEffect } from "react";
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
  Loader2,
  MessageCircle,
  Phone
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
import { supabase } from "@/integrations/supabase/client";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: any;
  status: "connected" | "disconnected" | "pending";
  category: "payment" | "provider" | "notification" | "webhook" | "third-party" | "chat";
  color: string;
  lastSync?: string;
}

const integrations: Integration[] = [
  // Chat Widgets
  { id: "floating-chat", name: "Floating Chat Widget", description: "WhatsApp & Telegram floating chat buttons", icon: MessageCircle, status: "disconnected", category: "chat", color: "from-green-500 to-emerald-600" },
  
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
  chat: { title: "Chat Widgets", description: "Floating chat buttons for support", icon: MessageCircle },
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
  const [chatConfigOpen, setChatConfigOpen] = useState(false);
  const [panelId, setPanelId] = useState<string | null>(null);
  const [chatSettings, setChatSettings] = useState({
    enabled: false,
    whatsapp: '',
    telegram: '',
    position: 'bottom-right',
    message: 'Need help? Chat with us!'
  });
  const [savingChat, setSavingChat] = useState(false);
  const [localIntegrations, setLocalIntegrations] = useState(integrations);

  // Fetch panel ID and chat settings on mount
  useEffect(() => {
    const fetchPanelAndSettings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!profile) return;

        const { data: panel } = await supabase
          .from('panels')
          .select('id')
          .eq('owner_id', profile.id)
          .single();

        if (!panel) return;
        setPanelId(panel.id);

        // Fetch chat settings
        const { data: settings } = await supabase
          .from('panel_settings')
          .select('floating_chat_enabled, floating_chat_whatsapp, floating_chat_telegram, floating_chat_position, floating_chat_message')
          .eq('panel_id', panel.id)
          .single();

        if (settings) {
          const isEnabled = settings.floating_chat_enabled && (settings.floating_chat_whatsapp || settings.floating_chat_telegram);
          setChatSettings({
            enabled: settings.floating_chat_enabled || false,
            whatsapp: settings.floating_chat_whatsapp || '',
            telegram: settings.floating_chat_telegram || '',
            position: settings.floating_chat_position || 'bottom-right',
            message: settings.floating_chat_message || 'Need help? Chat with us!'
          });
          
          // Update floating-chat status in local integrations
          setLocalIntegrations(prev => prev.map(i => 
            i.id === 'floating-chat' 
              ? { ...i, status: isEnabled ? 'connected' as const : 'disconnected' as const }
              : i
          ));
        }
      } catch (err) {
        console.error('Error fetching panel settings:', err);
      }
    };

    fetchPanelAndSettings();
  }, []);

  const saveChatSettings = async () => {
    if (!panelId) {
      toast({ variant: "destructive", title: "Error", description: "Panel not found" });
      return;
    }

    setSavingChat(true);
    try {
      // First check if settings exist
      const { data: existing } = await supabase
        .from('panel_settings')
        .select('id')
        .eq('panel_id', panelId)
        .single();

      if (existing) {
        // Update existing settings
        const { error } = await supabase
          .from('panel_settings')
          .update({
            floating_chat_enabled: chatSettings.enabled,
            floating_chat_whatsapp: chatSettings.whatsapp || null,
            floating_chat_telegram: chatSettings.telegram || null,
            floating_chat_position: chatSettings.position,
            floating_chat_message: chatSettings.message,
            updated_at: new Date().toISOString()
          })
          .eq('panel_id', panelId);

        if (error) throw error;
      } else {
        // Insert new settings
        const { error } = await supabase
          .from('panel_settings')
          .insert({
            panel_id: panelId,
            floating_chat_enabled: chatSettings.enabled,
            floating_chat_whatsapp: chatSettings.whatsapp || null,
            floating_chat_telegram: chatSettings.telegram || null,
            floating_chat_position: chatSettings.position,
            floating_chat_message: chatSettings.message
          });

        if (error) throw error;
      }

      const isConnected = chatSettings.enabled && (chatSettings.whatsapp || chatSettings.telegram);
      setLocalIntegrations(prev => prev.map(i => 
        i.id === 'floating-chat' 
          ? { ...i, status: isConnected ? 'connected' as const : 'disconnected' as const }
          : i
      ));

      toast({ title: "Chat Widget Settings Saved", description: "Your floating chat widget has been configured." });
      setChatConfigOpen(false);
    } catch (err) {
      console.error('Error saving chat settings:', err);
      toast({ variant: "destructive", title: "Error", description: "Failed to save settings" });
    } finally {
      setSavingChat(false);
    }
  };

  const filteredIntegrations = activeTab === "all" 
    ? localIntegrations 
    : localIntegrations.filter(i => i.category === activeTab);

  const connectedCount = localIntegrations.filter(i => i.status === "connected").length;

  const handleConnect = async (integration: Integration) => {
    if (integration.id === 'floating-chat') {
      setChatConfigOpen(true);
      return;
    }
    
    setIsLoading(integration.id);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(null);
    toast({ title: `${integration.name} Connected`, description: "Integration is now active." });
  };

  const handleDisconnect = async (integration: Integration) => {
    if (integration.id === 'floating-chat') {
      setChatSettings(prev => ({ ...prev, enabled: false }));
      await saveChatSettings();
      return;
    }
    
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
        className="grid grid-cols-2 md:grid-cols-6 gap-4"
      >
        {Object.entries(categoryInfo).map(([key, info], index) => {
          const count = localIntegrations.filter(i => i.category === key && i.status === "connected").length;
          const total = localIntegrations.filter(i => i.category === key).length;
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
        <TabsList className="bg-muted/50 p-1 flex-wrap">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
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
                          onClick={() => {
                            if (integration.id === 'floating-chat') {
                              setChatConfigOpen(true);
                            } else {
                              setConfigDialog(integration);
                            }
                          }}
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

      {/* Floating Chat Widget Configuration Dialog */}
      <Dialog open={chatConfigOpen} onOpenChange={setChatConfigOpen}>
        <DialogContent className="glass-card max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              Floating Chat Widget
            </DialogTitle>
            <DialogDescription>
              Configure WhatsApp and Telegram floating chat buttons for your storefront
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm font-medium">Enable Floating Chat</p>
                <p className="text-xs text-muted-foreground">Show chat buttons on your storefront</p>
              </div>
              <Switch 
                checked={chatSettings.enabled}
                onCheckedChange={(checked) => setChatSettings(prev => ({ ...prev, enabled: checked }))}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-green-500" />
                WhatsApp Number
              </Label>
              <Input 
                placeholder="+1234567890 (include country code)"
                value={chatSettings.whatsapp}
                onChange={(e) => setChatSettings(prev => ({ ...prev, whatsapp: e.target.value }))}
                className="bg-background/50"
              />
              <p className="text-xs text-muted-foreground">Enter your WhatsApp number with country code (e.g., +1234567890)</p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Send className="w-4 h-4 text-sky-500" />
                Telegram Username
              </Label>
              <Input 
                placeholder="@username or username"
                value={chatSettings.telegram}
                onChange={(e) => setChatSettings(prev => ({ ...prev, telegram: e.target.value }))}
                className="bg-background/50"
              />
              <p className="text-xs text-muted-foreground">Enter your Telegram username (with or without @)</p>
            </div>

            <div className="space-y-2">
              <Label>Welcome Message</Label>
              <Input 
                placeholder="Need help? Chat with us!"
                value={chatSettings.message}
                onChange={(e) => setChatSettings(prev => ({ ...prev, message: e.target.value }))}
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label>Widget Position</Label>
              <Select 
                value={chatSettings.position} 
                onValueChange={(value) => setChatSettings(prev => ({ ...prev, position: value }))}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Preview */}
            <div className="p-4 rounded-lg bg-muted/30 border">
              <p className="text-xs text-muted-foreground mb-2">Preview</p>
              <div className="flex gap-2">
                {chatSettings.whatsapp && (
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                )}
                {chatSettings.telegram && (
                  <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center">
                    <Send className="w-5 h-5 text-white" />
                  </div>
                )}
                {!chatSettings.whatsapp && !chatSettings.telegram && (
                  <p className="text-sm text-muted-foreground">Add WhatsApp or Telegram to see preview</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setChatConfigOpen(false)}>Cancel</Button>
            <Button 
              onClick={saveChatSettings}
              disabled={savingChat}
              className="bg-gradient-to-r from-green-500 to-emerald-600"
            >
              {savingChat ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Integrations;
