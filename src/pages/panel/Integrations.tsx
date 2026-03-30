import React, { useState, useEffect } from "react";
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
  Phone,
  Copy,
  BarChart3,
  Code,
  Megaphone,
  HelpCircle,
  Info,
  Tag,
  Activity,
  MousePointer2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
// Tabs removed - now using single-page layout
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import {
  GoogleIcon,
  TelegramIcon,
  VKIcon,
  DiscordIcon,
  WhatsAppIcon,
  FacebookIcon,
  GoogleAnalyticsIcon,
  GoogleTagManagerIcon,
  YandexMetrikaIcon,
  OneSignalIcon,
  ZendeskIcon,
  TidioIcon,
  SmartsuppIcon,
  CrispIcon,
  JivoChatIcon,
  GetButtonIcon,
  BeamerIcon,
  GetSiteControlIcon,
  AnnouncementsIcon,
  CustomCodeIcon,
  IntercomIcon,
  LiveChatIcon,
  TawkToIcon
} from "@/components/icons/IntegrationIcons";

// OAuth Providers Configuration
interface OAuthProvider {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  setupUrl: string;
  instructions: string[];
}

const oauthProviders: OAuthProvider[] = [
  {
    id: 'google',
    name: 'Google OAuth',
    icon: <GoogleIcon className="w-5 h-5" />,
    color: 'bg-white border border-gray-200', // Official Google: white background
    setupUrl: 'https://console.cloud.google.com/apis/credentials',
    instructions: [
      'Go to Google Cloud Console',
      'Create a new OAuth 2.0 Client ID',
      'Set the authorized redirect URI',
      'Copy Client ID and Secret here'
    ]
  },
  {
    id: 'telegram',
    name: 'Telegram OAuth',
    icon: <TelegramIcon className="w-5 h-5" />,
    color: 'bg-[#26A5E4]', // Official Telegram blue
    setupUrl: 'https://core.telegram.org/widgets/login',
    instructions: [
      'Message @BotFather on Telegram',
      'Create a new bot with /newbot',
      'Get your Bot Token (client_secret)',
      'Bot username goes in Client ID'
    ]
  },
  {
    id: 'vk',
    name: 'VK OAuth',
    icon: <VKIcon className="w-5 h-5" />,
    color: 'bg-[#0077FF]', // Official VK blue
    setupUrl: 'https://vk.com/apps?act=manage',
    instructions: [
      'Go to VK Developer Console',
      'Create a new Standalone application',
      'Set authorized redirect URI',
      'Copy App ID and Secure Key'
    ]
  },
  {
    id: 'discord',
    name: 'Discord OAuth',
    icon: <DiscordIcon className="w-5 h-5" />,
    color: 'bg-[#5865F2]', // Official Discord blurple
    setupUrl: 'https://discord.com/developers/applications',
    instructions: [
      'Go to Discord Developer Portal',
      'Create a new Application',
      'In OAuth2, add redirect URL',
      'Copy Client ID and Secret'
    ]
  }
];

// Service Integrations Configuration
interface ServiceIntegration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  category: 'chat' | 'analytics' | 'notifications' | 'other';
  fields: {
    type: 'input' | 'textarea' | 'phone' | 'select' | 'color';
    name: string;
    label: string;
    placeholder: string;
    helper?: string;
    options?: { value: string; label: string }[];
  }[];
}

const serviceIntegrations: ServiceIntegration[] = [
  // Chat Widgets
  {
    id: 'telegram_bot',
    name: 'Telegram',
    description: 'Chat with users via Telegram bot',
    icon: <TelegramIcon className="w-5 h-5" />,
    color: 'bg-[#26A5E4]', // Official Telegram blue
    category: 'chat',
    fields: [
      { type: 'input', name: 'bot_token', label: 'Bot Token', placeholder: '123456:ABC-DEF...', helper: 'Get from @BotFather' },
      { type: 'input', name: 'chat_id', label: 'Chat ID', placeholder: '-1001234567890', helper: 'Channel or group ID' }
    ]
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Button',
    description: 'Floating WhatsApp chat button',
    icon: <WhatsAppIcon className="w-5 h-5" />,
    color: 'bg-[#25D366]', // Official WhatsApp green
    category: 'chat',
    fields: [
      { type: 'phone', name: 'phone', label: 'Phone Number', placeholder: '+1234567890', helper: 'Include country code' },
      { type: 'input', name: 'message', label: 'Default Message', placeholder: 'Hello, I need help with...' }
    ]
  },
  {
    id: 'getbutton',
    name: 'GetButton',
    description: 'Multi-channel chat widget',
    icon: <GetButtonIcon className="w-5 h-5" />,
    color: 'bg-[#0066FF]', // GetButton blue
    category: 'chat',
    fields: [
      { type: 'textarea', name: 'code', label: 'Insert Code', placeholder: '<!-- GetButton.io widget -->', helper: 'Paste your GetButton widget code' }
    ]
  },
  {
    id: 'zendesk',
    name: 'Zendesk',
    description: 'Customer support platform',
    icon: <ZendeskIcon className="w-5 h-5" />,
    color: 'bg-[#03363D]', // Official Zendesk dark teal
    category: 'chat',
    fields: [
      { type: 'textarea', name: 'code', label: 'Insert Code', placeholder: '<!-- Zendesk Widget -->', helper: 'Paste your Zendesk widget code' }
    ]
  },
  {
    id: 'tidio',
    name: 'Tidio',
    description: 'Live chat & chatbots',
    icon: <TidioIcon className="w-5 h-5" />,
    color: 'bg-[#0066FF]', // Official Tidio blue
    category: 'chat',
    fields: [
      { type: 'textarea', name: 'code', label: 'Insert Code', placeholder: '<!-- Tidio Code -->', helper: 'Paste Tidio installation code' }
    ]
  },
  {
    id: 'smartsupp',
    name: 'Smartsupp',
    description: 'Live chat with video recordings',
    icon: <SmartsuppIcon className="w-5 h-5" />,
    color: 'bg-[#F26322]', // Official Smartsupp orange
    category: 'chat',
    fields: [
      { type: 'textarea', name: 'code', label: 'Insert Code', placeholder: '<!-- Smartsupp Code -->', helper: 'Paste Smartsupp installation code' }
    ]
  },
  {
    id: 'crisp',
    name: 'Crisp',
    description: 'All-in-one messaging platform',
    icon: <CrispIcon className="w-5 h-5" />,
    color: 'bg-[#7C3AED]', // Official Crisp purple
    category: 'chat',
    fields: [
      { type: 'input', name: 'website_id', label: 'Website ID', placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', helper: 'Find in Crisp Dashboard → Settings' }
    ]
  },
  {
    id: 'jivochat',
    name: 'Jivochat',
    description: 'Business messenger',
    icon: <JivoChatIcon className="w-5 h-5" />,
    color: 'bg-[#1AAD19]', // Official JivoChat green
    category: 'chat',
    fields: [
      { type: 'input', name: 'widget_id', label: 'Widget ID', placeholder: 'xxxxxxxxx', helper: 'Your JivoChat widget ID' },
      { type: 'textarea', name: 'code', label: 'Or Insert Code', placeholder: '<!-- JivoChat Code -->', helper: 'Or paste the full installation code' }
    ]
  },
  {
    id: 'facebook_chat',
    name: 'Facebook Chat',
    description: 'Messenger customer chat plugin',
    icon: <FacebookIcon className="w-5 h-5" />,
    color: 'bg-[#1877F2]', // Official Facebook blue
    category: 'chat',
    fields: [
      { type: 'input', name: 'page_id', label: 'Page ID', placeholder: '123456789', helper: 'Your Facebook Page ID' },
      { type: 'textarea', name: 'code', label: 'Insert Code', placeholder: '<!-- Facebook Chat Plugin -->' }
    ]
  },
  {
    id: 'intercom',
    name: 'Intercom',
    description: 'Customer messaging platform',
    icon: <IntercomIcon className="w-5 h-5" />,
    color: 'bg-[#1F8DED]', // Official Intercom blue
    category: 'chat',
    fields: [
      { type: 'input', name: 'app_id', label: 'App ID', placeholder: 'xxxxxxxx', helper: 'Your Intercom App ID' },
      { type: 'textarea', name: 'code', label: 'Or Insert Code', placeholder: '<!-- Intercom Script -->', helper: 'Or paste your full Intercom installation code' }
    ]
  },
  {
    id: 'livechat',
    name: 'LiveChat',
    description: 'Live chat software',
    icon: <LiveChatIcon className="w-5 h-5" />,
    color: 'bg-[#FF5100]', // Official LiveChat orange
    category: 'chat',
    fields: [
      { type: 'input', name: 'license', label: 'License ID', placeholder: '12345678', helper: 'Your LiveChat license number' },
      { type: 'textarea', name: 'code', label: 'Or Insert Code', placeholder: '<!-- LiveChat Script -->', helper: 'Or paste your LiveChat installation code' }
    ]
  },
  {
    id: 'tawkto',
    name: 'Tawk.to',
    description: 'Free live chat software',
    icon: <TawkToIcon className="w-5 h-5" />,
    color: 'bg-[#03A84E]', // Official Tawk.to green
    category: 'chat',
    fields: [
      { type: 'input', name: 'property_id', label: 'Property ID', placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxx', helper: 'Your Tawk.to property ID' },
      { type: 'input', name: 'widget_id', label: 'Widget ID', placeholder: 'default', helper: 'Usually "default" or custom widget ID' },
      { type: 'textarea', name: 'code', label: 'Or Insert Code', placeholder: '<!-- Tawk.to Script -->', helper: 'Or paste your full Tawk.to installation code' }
    ]
  },
  // Analytics
  {
    id: 'google_analytics',
    name: 'Google Analytics',
    description: 'Track website traffic & behavior',
    icon: <GoogleAnalyticsIcon className="w-5 h-5" />,
    color: 'bg-[#F9AB00]', // Official Google Analytics yellow/orange
    category: 'analytics',
    fields: [
      { type: 'textarea', name: 'code', label: 'Insert Code', placeholder: '<!-- Google Analytics -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"></script>', helper: 'Paste your gtag.js code' }
    ]
  },
  {
    id: 'google_tag_manager',
    name: 'Google Tag Manager',
    description: 'Manage all your tags in one place',
    icon: <GoogleTagManagerIcon className="w-5 h-5" />,
    color: 'bg-[#246FDB]', // Official GTM blue
    category: 'analytics',
    fields: [
      { type: 'input', name: 'container_id', label: 'Container ID', placeholder: 'GTM-XXXXXXX', helper: 'Your GTM container ID' }
    ]
  },
  {
    id: 'yandex_metrika',
    name: 'Yandex.Metrika',
    description: 'Russian analytics platform',
    icon: <YandexMetrikaIcon className="w-5 h-5" />,
    color: 'bg-[#FC3F1D]', // Official Yandex red
    category: 'analytics',
    fields: [
      { type: 'input', name: 'counter_id', label: 'Counter ID', placeholder: '12345678', helper: 'Your Yandex.Metrika counter ID' },
      { type: 'textarea', name: 'code', label: 'Or Insert Code', placeholder: '<!-- Yandex.Metrika counter -->' }
    ]
  },
  {
    id: 'facebook_pixel',
    name: 'Facebook Pixel',
    description: 'Track conversions & retargeting',
    icon: <FacebookIcon className="w-5 h-5" />,
    color: 'bg-[#1877F2]',
    category: 'analytics',
    fields: [
      { type: 'input', name: 'pixel_id', label: 'Pixel ID', placeholder: '123456789012345', helper: 'Your Facebook Pixel ID' },
      { type: 'textarea', name: 'code', label: 'Or Insert Code', placeholder: '<!-- Facebook Pixel Code -->', helper: 'Or paste the full pixel installation code' }
    ]
  },
  {
    id: 'hotjar',
    name: 'Hotjar',
    description: 'Heatmaps & session recordings',
    icon: <MousePointer2 className="w-5 h-5" />,
    color: 'bg-[#FF3C00]',
    category: 'analytics',
    fields: [
      { type: 'input', name: 'site_id', label: 'Site ID', placeholder: '1234567', helper: 'Your Hotjar Site ID' },
      { type: 'textarea', name: 'code', label: 'Or Insert Code', placeholder: '<!-- Hotjar Tracking Code -->', helper: 'Or paste the full Hotjar installation code' }
    ]
  },
  {
    id: 'clarity',
    name: 'Microsoft Clarity',
    description: 'Free heatmaps & session recordings',
    icon: <MousePointer2 className="w-5 h-5" />,
    color: 'bg-[#5C2D91]',
    category: 'analytics',
    fields: [
      { type: 'input', name: 'project_id', label: 'Project ID', placeholder: 'xxxxxxxxxx', helper: 'Your Clarity project ID' },
      { type: 'textarea', name: 'code', label: 'Or Insert Code', placeholder: '<!-- Clarity Code -->', helper: 'Or paste the full Clarity installation code' }
    ]
  },
  // Notifications
  {
    id: 'onesignal',
    name: 'OneSignal',
    description: 'Push notifications platform',
    icon: <OneSignalIcon className="w-5 h-5" />,
    color: 'bg-[#E54B4D]', // Official OneSignal red
    category: 'notifications',
    fields: [
      { type: 'input', name: 'app_id', label: 'App ID', placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', helper: 'Find in OneSignal Dashboard' }
    ]
  },
  {
    id: 'getsitecontrol',
    name: 'Getsitecontrol',
    description: 'Popups, surveys, forms',
    icon: <GetSiteControlIcon className="w-5 h-5" />,
    color: 'bg-[#14B8A6]', // GetSiteControl teal
    category: 'notifications',
    fields: [
      { type: 'input', name: 'widget_id', label: 'Widget ID', placeholder: 'xxxxxxxxx' },
      { type: 'textarea', name: 'code', label: 'Or Insert Code', placeholder: '<!-- GetSiteControl -->' }
    ]
  },
  {
    id: 'beamer',
    name: 'Beamer',
    description: 'Changelog & notifications',
    icon: <BeamerIcon className="w-5 h-5" />,
    color: 'bg-[#7C3AED]', // Beamer purple
    category: 'notifications',
    fields: [
      { type: 'input', name: 'product_id', label: 'Product ID', placeholder: 'xxxxx', helper: 'Your Beamer product ID' }
    ]
  },
  // Other
  {
    id: 'announcements',
    name: 'Announcements',
    description: 'Show announcements bar or popup on storefront',
    icon: <AnnouncementsIcon className="w-5 h-5" />,
    color: 'bg-[#F59E0B]', // Amber/orange
    category: 'other',
    fields: [
      { type: 'input', name: 'title', label: 'Title', placeholder: '🎉 New Feature', helper: 'Short headline displayed prominently' },
      { type: 'input', name: 'text', label: 'Description', placeholder: 'Welcome to our panel! Check out our new services.', helper: 'Main announcement text' },
      { type: 'select', name: 'icon', label: 'Icon', placeholder: 'megaphone', options: [
        { value: 'megaphone', label: '📢 Megaphone' }, { value: 'sparkles', label: '✨ Sparkles' },
        { value: 'gift', label: '🎁 Gift' }, { value: 'bell', label: '🔔 Bell' },
        { value: 'info', label: 'ℹ️ Info' }, { value: 'star', label: '⭐ Star' },
        { value: 'zap', label: '⚡ Zap' }, { value: 'alert', label: '⚠️ Alert' },
      ]},
      { type: 'select', name: 'displayMode', label: 'Display Mode', placeholder: 'header', options: [
        { value: 'header', label: 'Header Bar (top)' }, { value: 'popup', label: 'Popup (modal dialog)' },
      ]},
      { type: 'input', name: 'linkText', label: 'Link Text (optional)', placeholder: 'Learn More' },
      { type: 'input', name: 'linkUrl', label: 'Link URL (optional)', placeholder: 'https://example.com/promo' },
      { type: 'color', name: 'backgroundColor', label: 'Background Color', placeholder: '#6366F1' },
      { type: 'color', name: 'textColor', label: 'Text Color', placeholder: '#FFFFFF' }
    ]
  },
  {
    id: 'custom_head_code',
    name: 'Other (Custom Code)',
    description: 'Add custom scripts to <head>',
    icon: <CustomCodeIcon className="w-5 h-5" />,
    color: 'bg-[#475569]', // Slate gray
    category: 'other',
    fields: [
      { type: 'textarea', name: 'code', label: 'Insert Code', placeholder: '<!-- Custom Code for <head> -->\n<script>...</script>', helper: 'This code will be injected into the page <head>' }
    ]
  }
];

const Integrations = () => {
  const [panelId, setPanelId] = useState<string | null>(null);
  const [panelSubdomain, setPanelSubdomain] = useState<string>('');
  const [panelDomains, setPanelDomains] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  
  // OAuth state
  const [oauthConfigs, setOauthConfigs] = useState<Record<string, {
    client_id: string;
    client_secret: string;
    enabled: boolean;
  }>>({});
  const [oauthDialogOpen, setOauthDialogOpen] = useState(false);
  const [selectedOAuth, setSelectedOAuth] = useState<OAuthProvider | null>(null);
  const [tempOAuthConfig, setTempOAuthConfig] = useState({ client_id: '', client_secret: '', enabled: false });
  
  // Service integrations state
  const [integrations, setIntegrations] = useState<Record<string, { enabled: boolean; [key: string]: any }>>({});
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceIntegration | null>(null);
  const [tempServiceConfig, setTempServiceConfig] = useState<Record<string, any>>({});

  // Fetch panel and settings on mount
  useEffect(() => {
    const fetchPanelAndSettings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('id, active_panel_id')
          .eq('user_id', user.id)
          .single();

        if (!profile) return;

        let panelQuery = supabase
          .from('panels')
          .select('id, subdomain, custom_domain')
          .eq('owner_id', profile.id);
        if ((profile as any).active_panel_id) {
          panelQuery = panelQuery.eq('id', (profile as any).active_panel_id);
        }
        const { data: panels } = await panelQuery.order('created_at', { ascending: true }).limit(1);
        const panel = panels?.[0];

        if (!panel) return;
        setPanelId(panel.id);
        setPanelSubdomain(panel.subdomain);

        // Build list of all domains for OAuth redirect URIs
        const allDomains: string[] = [];
        
        // Add subdomain options for both platforms
        if (panel.subdomain) {
          allDomains.push(`${panel.subdomain}.smmpilot.online`);
        }
        
        // Add custom domain if set on panel
        if (panel.custom_domain) {
          allDomains.push(panel.custom_domain);
        }

        // Fetch verified custom domains from panel_domains
        const { data: domains } = await supabase
          .from('panel_domains')
          .select('domain')
          .eq('panel_id', panel.id)
          .eq('verification_status', 'verified');

        if (domains && domains.length > 0) {
          domains.forEach(d => {
            if (!allDomains.includes(d.domain)) {
              allDomains.push(d.domain);
            }
          });
        }

        setPanelDomains(allDomains);

        // Fetch settings
        const { data: settings } = await supabase
          .from('panel_settings')
          .select('*')
          .eq('panel_id', panel.id)
          .single();

        if (settings) {
          // Load OAuth configs
          const oauthData: Record<string, any> = {};
          oauthProviders.forEach(provider => {
            const clientIdKey = `oauth_${provider.id}_client_id` as keyof typeof settings;
            const clientSecretKey = `oauth_${provider.id}_client_secret` as keyof typeof settings;
            const enabledKey = `oauth_${provider.id}_enabled` as keyof typeof settings;
            oauthData[provider.id] = {
              client_id: (settings[clientIdKey] as string) || '',
              client_secret: (settings[clientSecretKey] as string) || '',
              enabled: (settings[enabledKey] as boolean) || false
            };
          });
          setOauthConfigs(oauthData);

          // Load service integrations
          const integrationsData = (settings as any).integrations || {};
          setIntegrations(integrationsData);
        }
      } catch (err) {
        console.error('Error fetching panel settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPanelAndSettings();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "URL copied to clipboard" });
  };

  const saveOAuthConfig = async () => {
    if (!panelId || !selectedOAuth) return;
    setSaving(selectedOAuth.id);
    
    try {
      const updateData: Record<string, any> = {
        [`oauth_${selectedOAuth.id}_client_id`]: tempOAuthConfig.client_id || null,
        [`oauth_${selectedOAuth.id}_client_secret`]: tempOAuthConfig.client_secret || null,
        [`oauth_${selectedOAuth.id}_enabled`]: tempOAuthConfig.enabled,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('panel_settings')
        .update(updateData)
        .eq('panel_id', panelId);

      if (error) throw error;

      setOauthConfigs(prev => ({
        ...prev,
        [selectedOAuth.id]: { ...tempOAuthConfig }
      }));

      toast({ 
        title: "OAuth Provider Saved", 
        description: `${selectedOAuth.name} configuration updated.` 
      });
      setOauthDialogOpen(false);
    } catch (err) {
      console.error('Error saving OAuth config:', err);
      toast({ variant: "destructive", title: "Error", description: "Failed to save configuration" });
    } finally {
      setSaving(null);
    }
  };

  const saveServiceConfig = async () => {
    if (!panelId || !selectedService) return;
    setSaving(selectedService.id);
    
    try {
      const updatedIntegrations = {
        ...integrations,
        [selectedService.id]: {
          enabled: tempServiceConfig.enabled ?? true,
          ...tempServiceConfig
        }
      };

      const { error } = await supabase
        .from('panel_settings')
        .update({
          integrations: updatedIntegrations,
          updated_at: new Date().toISOString()
        })
        .eq('panel_id', panelId);

      if (error) throw error;

      setIntegrations(updatedIntegrations);

      toast({ 
        title: "Integration Saved", 
        description: `${selectedService.name} configuration updated.` 
      });
      setServiceDialogOpen(false);
    } catch (err) {
      console.error('Error saving service config:', err);
      toast({ variant: "destructive", title: "Error", description: "Failed to save configuration" });
    } finally {
      setSaving(null);
    }
  };

  const openOAuthDialog = (provider: OAuthProvider) => {
    setSelectedOAuth(provider);
    setTempOAuthConfig(oauthConfigs[provider.id] || { client_id: '', client_secret: '', enabled: false });
    setOauthDialogOpen(true);
  };

  const openServiceDialog = (service: ServiceIntegration) => {
    setSelectedService(service);
    setTempServiceConfig(integrations[service.id] || { enabled: true });
    setServiceDialogOpen(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const isOAuthConnected = (providerId: string) => {
    const config = oauthConfigs[providerId];
    return config?.enabled && config?.client_id && config?.client_secret;
  };

  const isServiceConnected = (serviceId: string) => {
    const config = integrations[serviceId];
    return config?.enabled;
  };

  const connectedOAuthCount = oauthProviders.filter(p => isOAuthConnected(p.id)).length;
  const connectedServiceCount = serviceIntegrations.filter(s => isServiceConnected(s.id)).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
          <p className="text-muted-foreground">Connect OAuth providers and third-party services</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="py-1.5 px-3 bg-primary/10 border-primary/30">
            <Shield className="w-3 h-3 mr-1.5" />
            {connectedOAuthCount} OAuth
          </Badge>
          <Badge variant="outline" className="py-1.5 px-3 bg-emerald-500/10 border-emerald-500/30 text-emerald-500">
            <Plug className="w-3 h-3 mr-1.5" />
            {connectedServiceCount} Services
          </Badge>
        </div>
      </motion.div>

      {/* OAuth Integrations Section */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            OAuth Integrations
          </CardTitle>
          <CardDescription>
            Allow customers to sign up and log in using social accounts. Enabled providers will appear on your buyer auth page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 gap-4"
          >
            {oauthProviders.map((provider) => {
              const connected = isOAuthConnected(provider.id);
              return (
                <motion.div key={provider.id} variants={itemVariants}>
                  <div className={cn(
                    "flex items-center justify-between p-4 rounded-xl border transition-all",
                    connected 
                      ? "bg-emerald-500/5 border-emerald-500/30" 
                      : "bg-muted/30 border-border hover:border-primary/30"
                  )}>
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-xl", provider.color)}>
                        {provider.id === 'google' 
                          ? provider.icon 
                          : React.isValidElement(provider.icon) 
                            ? React.cloneElement(provider.icon as React.ReactElement<any>, { fill: "white", className: "w-5 h-5" })
                            : provider.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{provider.name}</span>
                          {connected && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {connected ? 'Connected' : 'Not configured'}
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant={connected ? "outline" : "default"}
                      size="sm"
                      onClick={() => openOAuthDialog(provider)}
                    >
                      {connected ? (
                        <>
                          <Settings2 className="w-4 h-4 mr-2" />
                          Edit
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Connect
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </CardContent>
      </Card>

      {/* Chat Widgets Section */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-500" />
            Chat Widgets
          </CardTitle>
          <CardDescription>
            Add live chat and support widgets to your storefront
          </CardDescription>
        </CardHeader>
        <CardContent>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-3 gap-3"
          >
            {serviceIntegrations.filter(s => s.category === 'chat').map((service) => {
              const connected = isServiceConnected(service.id);
              return (
                <motion.div key={service.id} variants={itemVariants}>
                  <div className={cn(
                    "flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer hover:border-primary/30",
                    connected 
                      ? "bg-emerald-500/5 border-emerald-500/30" 
                      : "bg-muted/20 border-border"
                  )} onClick={() => openServiceDialog(service)}>
                    <div className="flex items-center gap-2.5">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-sm", service.color)}>
                        {React.isValidElement(service.icon) 
                          ? React.cloneElement(service.icon as React.ReactElement<any>, { fill: "white", className: "w-5 h-5" })
                          : service.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium">{service.name}</span>
                          {connected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </CardContent>
      </Card>

      {/* Analytics & Tracking Section */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-orange-500" />
            Analytics & Tracking
          </CardTitle>
          <CardDescription>
            Track visitor behavior and measure conversions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-3 gap-3"
          >
            {serviceIntegrations.filter(s => s.category === 'analytics').map((service) => {
              const connected = isServiceConnected(service.id);
              return (
                <motion.div key={service.id} variants={itemVariants}>
                  <div className={cn(
                    "flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer hover:border-primary/30",
                    connected 
                      ? "bg-emerald-500/5 border-emerald-500/30" 
                      : "bg-muted/20 border-border"
                  )} onClick={() => openServiceDialog(service)}>
                    <div className="flex items-center gap-2.5">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-sm", service.color)}>
                        {/* Use generic white icons for multi-color branded icons that clash with backgrounds */}
                        {service.id === 'google_analytics' ? <BarChart3 className="w-5 h-5 text-white" /> :
                         service.id === 'google_tag_manager' ? <Tag className="w-5 h-5 text-white" /> :
                         service.id === 'yandex_metrika' ? <BarChart3 className="w-5 h-5 text-white" /> :
                         service.id === 'facebook_pixel' ? <Activity className="w-5 h-5 text-white" /> :
                         service.id === 'hotjar' ? <MousePointer2 className="w-5 h-5 text-white" /> :
                         service.id === 'clarity' ? <MousePointer2 className="w-5 h-5 text-white" /> :
                         React.isValidElement(service.icon) 
                            ? React.cloneElement(service.icon as React.ReactElement<any>, { fill: "white", className: "w-5 h-5" })
                            : service.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium">{service.name}</span>
                          {connected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </CardContent>
      </Card>

      {/* Notifications & Widgets Section */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-500" />
            Notifications & Widgets
          </CardTitle>
          <CardDescription>
            Push notifications, popups, and announcements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-3 gap-3"
          >
            {serviceIntegrations.filter(s => s.category === 'notifications').map((service) => {
              const connected = isServiceConnected(service.id);
              return (
                <motion.div key={service.id} variants={itemVariants}>
                  <div className={cn(
                    "flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer hover:border-primary/30",
                    connected 
                      ? "bg-emerald-500/5 border-emerald-500/30" 
                      : "bg-muted/20 border-border"
                  )} onClick={() => openServiceDialog(service)}>
                    <div className="flex items-center gap-2.5">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-sm", service.color)}>
                        {/* Use generic white icons for multi-color branded notification icons */}
                        {service.id === 'onesignal' ? <Bell className="w-5 h-5 text-white" /> :
                         service.id === 'beamer' ? <Megaphone className="w-5 h-5 text-white" /> :
                         service.id === 'getsitecontrol' ? <MessageSquare className="w-5 h-5 text-white" /> :
                         React.isValidElement(service.icon) 
                            ? React.cloneElement(service.icon as React.ReactElement<any>, { fill: "white", className: "w-5 h-5" })
                            : service.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium">{service.name}</span>
                          {connected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </CardContent>
      </Card>

      {/* Other Integrations Section */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5 text-slate-500" />
            Other Integrations
          </CardTitle>
          <CardDescription>
            Announcements, custom code, and more
          </CardDescription>
        </CardHeader>
        <CardContent>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-3 gap-3"
          >
            {serviceIntegrations.filter(s => s.category === 'other').map((service) => {
              const connected = isServiceConnected(service.id);
              return (
                <motion.div key={service.id} variants={itemVariants}>
                  <div className={cn(
                    "flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer hover:border-primary/30",
                    connected 
                      ? "bg-emerald-500/5 border-emerald-500/30" 
                      : "bg-muted/20 border-border"
                  )} onClick={() => openServiceDialog(service)}>
                    <div className="flex items-center gap-2.5">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-sm", service.color)}>
                        {React.isValidElement(service.icon) 
                          ? React.cloneElement(service.icon as React.ReactElement<any>, { fill: "white", className: "w-5 h-5" })
                          : service.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium">{service.name}</span>
                          {connected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </CardContent>
      </Card>

      {/* Email / SMTP Integration Card */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-500" />
            Email / SMTP
          </CardTitle>
          <CardDescription>
            Configure SMTP to send password reset and verification emails to your tenant users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className={cn(
            "flex items-center justify-between p-4 rounded-lg border transition-all",
            settings?.integrations?.smtp?.host
              ? "bg-emerald-500/5 border-emerald-500/30"
              : "bg-muted/20 border-border"
          )}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Send className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="font-medium text-sm">SMTP Configuration</p>
                <p className="text-xs text-muted-foreground">
                  {settings?.integrations?.smtp?.host
                    ? `Connected: ${settings.integrations.smtp.host}`
                    : "Not configured — temp passwords shown in UI only"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {settings?.integrations?.smtp?.host && (
                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">Connected</Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/panel/settings'}
              >
                <Settings2 className="w-4 h-4 mr-1" />
                Configure
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* OAuth Configuration Dialog */}
      <Dialog open={oauthDialogOpen} onOpenChange={setOauthDialogOpen}>
        <DialogContent className="glass-card max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedOAuth && (
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-xl", selectedOAuth.color)}>
                  {selectedOAuth.icon}
                </div>
              )}
              Configure {selectedOAuth?.name}
            </DialogTitle>
            <DialogDescription>
              Set up social login for your storefront customers
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Setup Instructions */}
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Setup Instructions:
              </p>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                {selectedOAuth?.instructions.map((instruction, idx) => (
                  <li key={idx}>{instruction}</li>
                ))}
              </ol>
              <Button variant="link" size="sm" className="mt-2 h-auto p-0" asChild>
                <a href={selectedOAuth?.setupUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Open Developer Console
                </a>
              </Button>
            </div>

            {/* Redirect URIs - Show all configured domains */}
            <div className="space-y-2">
              <Label>Redirect URIs (add ALL to your OAuth app)</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {/* Primary callback URL using Supabase edge function */}
                <div className="flex gap-2">
                  <Input 
                    readOnly 
                    value={`https://tooudgubuhxjbbvzjcgx.supabase.co/functions/v1/oauth-callback?provider=${selectedOAuth?.id}`}
                    className="bg-muted/50 font-mono text-xs flex-1"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => copyToClipboard(`https://tooudgubuhxjbbvzjcgx.supabase.co/functions/v1/oauth-callback?provider=${selectedOAuth?.id}`)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Add the redirect URI above to your OAuth provider settings. The edge function will handle the callback for all your domains.
              </p>
              
              {/* Show configured domains for reference */}
              {panelDomains.length > 0 && (
                <div className="mt-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                  <p className="text-xs font-medium mb-1">Your configured domains:</p>
                  <div className="flex flex-wrap gap-1">
                    {panelDomains.map((domain, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs font-mono">
                        {domain}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Client ID */}
            <div className="space-y-2">
              <Label>Client ID</Label>
              <Input 
                placeholder="Enter client ID"
                value={tempOAuthConfig.client_id}
                onChange={(e) => setTempOAuthConfig(prev => ({ ...prev, client_id: e.target.value }))}
                className="bg-background/50 font-mono text-sm"
              />
            </div>

            {/* Client Secret */}
            <div className="space-y-2">
              <Label>Client Secret</Label>
              <Input 
                type="password"
                placeholder="Enter client secret"
                value={tempOAuthConfig.client_secret}
                onChange={(e) => setTempOAuthConfig(prev => ({ ...prev, client_secret: e.target.value }))}
                className="bg-background/50 font-mono text-sm"
              />
            </div>

            {/* Enable Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm font-medium">Enable Provider</p>
                <p className="text-xs text-muted-foreground">Show on buyer auth page</p>
              </div>
              <Switch 
                checked={tempOAuthConfig.enabled}
                onCheckedChange={(checked) => setTempOAuthConfig(prev => ({ ...prev, enabled: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOauthDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={saveOAuthConfig}
              disabled={saving === selectedOAuth?.id || !tempOAuthConfig.client_id}
            >
              {saving === selectedOAuth?.id ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save Configuration'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Service Integration Configuration Dialog */}
      <Dialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen}>
        <DialogContent className="glass-card max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedService && (
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-xl", selectedService.color)}>
                  {selectedService.icon}
                </div>
              )}
              Configure {selectedService?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedService?.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Enable Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm font-medium">Enable Integration</p>
                <p className="text-xs text-muted-foreground">Activate on your storefront</p>
              </div>
              <Switch 
                checked={tempServiceConfig.enabled ?? true}
                onCheckedChange={(checked) => setTempServiceConfig(prev => ({ ...prev, enabled: checked }))}
              />
            </div>

            {/* Dynamic Fields */}
            {selectedService?.fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label>{field.label}</Label>
                {field.type === 'textarea' ? (
                  <Textarea 
                    placeholder={field.placeholder}
                    value={tempServiceConfig[field.name] || ''}
                    onChange={(e) => setTempServiceConfig(prev => ({ ...prev, [field.name]: e.target.value }))}
                    className="bg-background/50 font-mono text-xs min-h-[100px]"
                  />
                ) : field.type === 'select' && field.options ? (
                  <Select
                    value={tempServiceConfig[field.name] || ''}
                    onValueChange={(value) => setTempServiceConfig(prev => ({ ...prev, [field.name]: value }))}
                  >
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder={field.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.type === 'color' ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={tempServiceConfig[field.name] || field.placeholder || '#6366F1'}
                      onChange={(e) => setTempServiceConfig(prev => ({ ...prev, [field.name]: e.target.value }))}
                      className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                    />
                    <Input
                      placeholder={field.placeholder}
                      value={tempServiceConfig[field.name] || ''}
                      onChange={(e) => setTempServiceConfig(prev => ({ ...prev, [field.name]: e.target.value }))}
                      className="bg-background/50 font-mono text-sm flex-1"
                    />
                  </div>
                ) : (
                  <Input 
                    type={field.type === 'phone' ? 'tel' : 'text'}
                    placeholder={field.placeholder}
                    value={tempServiceConfig[field.name] || ''}
                    onChange={(e) => setTempServiceConfig(prev => ({ ...prev, [field.name]: e.target.value }))}
                    className="bg-background/50"
                  />
                )}
                {field.helper && (
                  <p className="text-xs text-muted-foreground">{field.helper}</p>
                )}
              </div>
            ))}

            {/* Info about head injection */}
            {selectedService?.fields.some(f => f.type === 'textarea') && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <p className="text-xs text-amber-600 dark:text-amber-400 flex items-start gap-2">
                  <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Code will be injected into your storefront's &lt;head&gt; section for verification and functionality.</span>
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setServiceDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={saveServiceConfig}
              disabled={saving === selectedService?.id}
              className="bg-gradient-to-r from-primary to-primary/80"
            >
              {saving === selectedService?.id ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save Configuration'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Integrations;
