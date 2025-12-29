import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Phone, 
  Mail, 
  ArrowLeft, 
  MessageSquare,
  Globe,
  MapPin,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { useTenant } from "@/hooks/useTenant";
import { useBuyerAuth } from "@/contexts/BuyerAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import BuyerLayout from "./BuyerLayout";

interface ContactInfo {
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
}

interface SocialLinks {
  whatsapp?: string;
  telegram?: string;
  discord?: string;
  twitter?: string;
  instagram?: string;
}

const BuyerContact = () => {
  const navigate = useNavigate();
  const { panel } = useTenant();
  const { buyer } = useBuyerAuth();
  const [contactInfo, setContactInfo] = useState<ContactInfo>({});
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({});
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const [formData, setFormData] = useState({
    name: buyer?.full_name || "",
    email: buyer?.email || "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    const fetchContactInfo = async () => {
      if (!panel?.id) return;
      
      try {
        const { data } = await supabase
          .from('panel_settings')
          .select('contact_info, social_links')
          .eq('panel_id', panel.id)
          .single();
        
        if (data) {
          setContactInfo((data.contact_info as ContactInfo) || {});
          setSocialLinks((data.social_links as SocialLinks) || {});
        }
      } catch (error) {
        console.error('Error fetching contact info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContactInfo();
  }, [panel?.id]);

  useEffect(() => {
    if (buyer) {
      setFormData(prev => ({
        ...prev,
        name: buyer.full_name || prev.name,
        email: buyer.email || prev.email,
      }));
    }
  }, [buyer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject || !formData.message) {
      toast({
        title: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    
    try {
      // Create a support ticket
      const { error } = await supabase
        .from('support_tickets')
        .insert({
          panel_id: panel?.id,
          user_id: buyer?.id,
          subject: formData.subject,
          status: 'open',
          priority: 'medium',
          ticket_type: 'user_to_panel',
          messages: [{
            sender: 'user',
            content: formData.message,
            timestamp: new Date().toISOString(),
            senderName: formData.name,
            senderEmail: formData.email,
          }],
        });

      if (error) throw error;

      toast({
        title: "Message Sent!",
        description: "We'll get back to you as soon as possible.",
      });

      setFormData(prev => ({ ...prev, subject: "", message: "" }));
    } catch (error: any) {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const contactMethods = [
    {
      icon: Mail,
      label: "Email",
      value: contactInfo.email,
      href: contactInfo.email ? `mailto:${contactInfo.email}` : undefined,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: Phone,
      label: "Phone",
      value: contactInfo.phone,
      href: contactInfo.phone ? `tel:${contactInfo.phone}` : undefined,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      icon: Globe,
      label: "Website",
      value: contactInfo.website,
      href: contactInfo.website,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      icon: MapPin,
      label: "Address",
      value: contactInfo.address,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ].filter(m => m.value);

  const socialMethods = [
    {
      label: "WhatsApp",
      value: socialLinks.whatsapp,
      href: socialLinks.whatsapp ? `https://wa.me/${socialLinks.whatsapp.replace(/[^0-9]/g, '')}` : undefined,
      color: "bg-[#25D366]",
    },
    {
      label: "Telegram",
      value: socialLinks.telegram,
      href: socialLinks.telegram ? `https://t.me/${socialLinks.telegram}` : undefined,
      color: "bg-[#0088cc]",
    },
    {
      label: "Discord",
      value: socialLinks.discord,
      href: socialLinks.discord,
      color: "bg-[#5865F2]",
    },
  ].filter(m => m.value);

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
          <div>
            <h1 className="text-2xl font-bold">Contact Us</h1>
            <p className="text-sm text-muted-foreground">
              Get in touch with our support team
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Info */}
          <div className="space-y-4">
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold">{panel?.name || 'Panel'}</h2>
                    <p className="text-sm text-muted-foreground">Contact Information</p>
                  </div>
                </div>

                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : contactMethods.length === 0 && socialMethods.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No contact information available yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {contactMethods.map((method, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        {method.href ? (
                          <a
                            href={method.href}
                            target={method.label === "Website" ? "_blank" : undefined}
                            rel={method.label === "Website" ? "noopener noreferrer" : undefined}
                            className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                          >
                            <div className={`p-2 rounded-lg ${method.bgColor}`}>
                              <method.icon className={`w-5 h-5 ${method.color}`} />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">{method.label}</p>
                              <p className="font-medium">{method.value}</p>
                            </div>
                          </a>
                        ) : (
                          <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30">
                            <div className={`p-2 rounded-lg ${method.bgColor}`}>
                              <method.icon className={`w-5 h-5 ${method.color}`} />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">{method.label}</p>
                              <p className="font-medium">{method.value}</p>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}

                    {socialMethods.length > 0 && (
                      <>
                        <div className="border-t border-border/50 my-4" />
                        <p className="text-sm font-medium mb-3">Social Media</p>
                        <div className="flex flex-wrap gap-2">
                          {socialMethods.map((social, index) => (
                            <a
                              key={index}
                              href={social.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity ${social.color}`}
                            >
                              {social.label}
                            </a>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="glass-card">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Send us a message</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="How can we help?"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your question or issue..."
                    rows={5}
                  />
                </div>
                <Button type="submit" className="w-full gap-2" disabled={sending}>
                  {sending ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </BuyerLayout>
  );
};

export default BuyerContact;
