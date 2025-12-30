import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Globe, ShoppingCart, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface DomainRegistrar {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  startingPrice?: string;
  featured?: boolean;
}

interface DomainPurchaseLinksProps {
  showHeader?: boolean;
  compact?: boolean;
}

// Default registrars if none configured
const DEFAULT_REGISTRARS: DomainRegistrar[] = [
  {
    name: "Namecheap",
    url: "https://www.namecheap.com",
    description: "Affordable domains with free WhoisGuard",
    startingPrice: "$5.98/yr",
    featured: true
  },
  {
    name: "Cloudflare",
    url: "https://www.cloudflare.com/products/registrar/",
    description: "At-cost domains with free privacy",
    startingPrice: "$8.03/yr"
  },
  {
    name: "Porkbun",
    url: "https://porkbun.com",
    description: "Low prices with free SSL & privacy",
    startingPrice: "$5.99/yr"
  },
  {
    name: "GoDaddy",
    url: "https://www.godaddy.com",
    description: "World's largest domain registrar",
    startingPrice: "$9.99/yr"
  },
  {
    name: "Google Domains",
    url: "https://domains.google",
    description: "Simple domain management by Google",
    startingPrice: "$12.00/yr"
  },
  {
    name: "Hover",
    url: "https://www.hover.com",
    description: "Clean UI with free Whois privacy",
    startingPrice: "$12.99/yr"
  }
];

export const DomainPurchaseLinks = ({ showHeader = true, compact = false }: DomainPurchaseLinksProps) => {
  const [registrars, setRegistrars] = useState<DomainRegistrar[]>(DEFAULT_REGISTRARS);
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    fetchReferralLinks();
  }, []);

  const fetchReferralLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('setting_value')
        .eq('setting_key', 'domain_referrals')
        .maybeSingle();

      if (!error && data?.setting_value) {
        const settings = data.setting_value as any;
        if (settings.enabled !== undefined) {
          setEnabled(settings.enabled);
        }
        if (settings.registrars && Array.isArray(settings.registrars) && settings.registrars.length > 0) {
          setRegistrars(settings.registrars);
        }
      }
    } catch (error) {
      console.error('Error fetching referral links:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!enabled) return null;

  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-primary/20">
      {showHeader && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            Buy a Domain
          </CardTitle>
          <CardDescription>
            Don't have a domain? Purchase one from these trusted registrars to use with your panel
          </CardDescription>
        </CardHeader>
      )}
      <CardContent className={compact ? "pt-4" : ""}>
        <div className={`grid ${compact ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'} gap-4`}>
          {registrars.map((registrar, index) => (
            <motion.div
              key={registrar.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <a
                href={registrar.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Card className={`glass-card-hover h-full transition-all duration-300 ${registrar.featured ? 'border-primary/40 bg-primary/5' : ''}`}>
                  <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                    {registrar.featured && (
                      <Badge className="bg-primary/20 text-primary border-primary/30 absolute -top-2 -right-2">
                        <Star className="w-3 h-3 mr-1" /> Popular
                      </Badge>
                    )}
                    
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      {registrar.logo ? (
                        <img src={registrar.logo} alt={registrar.name} className="w-8 h-8 object-contain" />
                      ) : (
                        <Globe className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-semibold">{registrar.name}</h3>
                      {!compact && registrar.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {registrar.description}
                        </p>
                      )}
                    </div>
                    
                    {registrar.startingPrice && (
                      <Badge variant="outline" className="text-xs">
                        From {registrar.startingPrice}
                      </Badge>
                    )}
                    
                    <Button variant="ghost" size="sm" className="mt-auto w-full">
                      Visit <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              </a>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            <strong>Tip:</strong> After purchasing, you'll need to configure DNS records to point to your panel.
            Choose a registrar that offers easy DNS management.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DomainPurchaseLinks;
