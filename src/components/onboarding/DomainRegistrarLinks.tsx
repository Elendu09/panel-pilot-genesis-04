import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Star, Loader2 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';

interface Registrar {
  name: string;
  url: string;
  description: string;
  startingPrice: string;
  featured: boolean;
}

interface DomainRegistrarLinksProps {
  searchDomain?: string;
}

const DEFAULT_REGISTRARS: Registrar[] = [
  { 
    name: "Namecheap", 
    url: "https://www.namecheap.com/domains/registration/results/?domain=", 
    description: "Affordable domains with free WhoisGuard privacy", 
    startingPrice: "$5.98/yr", 
    featured: true 
  },
  { 
    name: "Porkbun", 
    url: "https://porkbun.com/checkout/search?q=", 
    description: "Low prices with free SSL & WHOIS privacy", 
    startingPrice: "$5.99/yr", 
    featured: false 
  },
  { 
    name: "Cloudflare", 
    url: "https://www.cloudflare.com/products/registrar/", 
    description: "At-cost domains with free privacy protection", 
    startingPrice: "$8.03/yr", 
    featured: false 
  },
  { 
    name: "GoDaddy", 
    url: "https://www.godaddy.com/domainsearch/find?domainToCheck=", 
    description: "World's largest domain registrar", 
    startingPrice: "$9.99/yr", 
    featured: false 
  },
];

export const DomainRegistrarLinks = ({ searchDomain = '' }: DomainRegistrarLinksProps) => {
  const [registrars, setRegistrars] = useState<Registrar[]>(DEFAULT_REGISTRARS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegistrars = async () => {
      try {
        const { data } = await supabase
          .from('platform_settings')
          .select('setting_value')
          .eq('setting_key', 'domain_referrals')
          .maybeSingle();
        
        const settingValue = data?.setting_value as { enabled?: boolean; registrars?: Registrar[] } | null;
        if (settingValue?.registrars && Array.isArray(settingValue.registrars)) {
          const configuredRegistrars = settingValue.registrars.filter(
            (r: Registrar) => r.name && r.url
          );
          if (configuredRegistrars.length > 0) {
            setRegistrars(configuredRegistrars);
          }
        }
      } catch (error) {
        console.error('Error fetching registrars:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRegistrars();
  }, []);

  const getRegistrarUrl = (registrar: Registrar) => {
    if (!searchDomain) return registrar.url;
    // Append domain search to URL if it ends with ? or =
    if (registrar.url.endsWith('=') || registrar.url.endsWith('?')) {
      return `${registrar.url}${searchDomain}`;
    }
    return registrar.url;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Choose a domain registrar to purchase your domain. After purchasing, come back and select "I have a domain name".
      </p>
      
      <div className="grid gap-3">
        {registrars.map((registrar, index) => (
          <Card 
            key={index} 
            className={`transition-all hover:border-primary/50 ${registrar.featured ? 'border-primary/30 bg-primary/5' : ''}`}
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold">{registrar.name}</span>
                    {registrar.featured && (
                      <Badge className="bg-primary/10 text-primary text-xs">
                        <Star className="w-3 h-3 mr-1" />
                        Recommended
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{registrar.description}</p>
                  <p className="text-xs text-primary mt-1">Starting from {registrar.startingPrice}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(getRegistrarUrl(registrar), '_blank')}
                  className="w-full sm:w-auto shrink-0 gap-2"
                >
                  Register
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center pt-2">
        💡 After purchasing your domain, add the DNS records provided in the next step to connect it.
      </p>
    </div>
  );
};
