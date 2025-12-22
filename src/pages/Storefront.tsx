import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTenant, useTenantServices } from '@/hooks/useTenant';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SOCIAL_ICONS_MAP } from '@/components/icons/SocialIcons';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Filter, 
  Star, 
  Users, 
  Clock, 
  Shield,
  Zap,
  TrendingUp,
  Heart,
  MessageSquare,
  Eye,
  Image
} from 'lucide-react';
import { toast } from 'sonner';

// Helper component to render service icon
const ServiceIcon = ({ imageUrl, className }: { imageUrl?: string | null; className?: string }) => {
  if (!imageUrl) {
    return (
      <div className={cn("w-10 h-10 rounded-lg bg-muted flex items-center justify-center", className)}>
        <Image className="w-5 h-5 text-muted-foreground" />
      </div>
    );
  }

  if (imageUrl.startsWith('icon:')) {
    const iconKey = imageUrl.replace('icon:', '');
    const iconData = SOCIAL_ICONS_MAP[iconKey];
    if (iconData) {
      const IconComponent = iconData.icon;
      return (
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", iconData.bgColor, className)}>
          <IconComponent className="text-white" size={20} />
        </div>
      );
    }
  }

  return (
    <img 
      src={imageUrl} 
      alt="Service" 
      className={cn("w-10 h-10 rounded-lg object-cover", className)}
      onError={(e) => {
        e.currentTarget.style.display = 'none';
      }}
    />
  );
};

const Storefront = () => {
  const { panel, loading: tenantLoading, error: tenantError, isTenantDomain } = useTenant();
  const { services, loading: servicesLoading } = useTenantServices(panel?.id);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedService, setSelectedService] = useState<any>(null);
  const [quantity, setQuantity] = useState(100);
  const [targetUrl, setTargetUrl] = useState('');

  const categories = [
    { id: 'all', name: 'All Services', icon: Star },
    { id: 'instagram', name: 'Instagram', icon: Heart },
    { id: 'facebook', name: 'Facebook', icon: Users },
    { id: 'tiktok', name: 'TikTok', icon: Zap },
    { id: 'youtube', name: 'YouTube', icon: Eye },
    { id: 'twitter', name: 'Twitter', icon: MessageSquare },
    { id: 'linkedin', name: 'LinkedIn', icon: TrendingUp },
  ];

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading panel...</p>
        </div>
      </div>
    );
  }

  if (tenantError || !panel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Panel Not Found</h1>
          <p className="text-muted-foreground">
            {tenantError || 'This panel is not available or has been deactivated.'}
          </p>
        </div>
      </div>
    );
  }

  const handleOrder = () => {
    if (!selectedService || !targetUrl.trim()) {
      toast.error('Please select a service and enter a target URL');
      return;
    }

    toast.success('Order placed successfully! You will be redirected to payment.');
    // In a real app, this would handle the order creation and payment flow
  };

  const canonicalUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Helmet>
        <title>{panel.settings?.seo_title || `${panel.name} - SMM Panel`}</title>
        <meta 
          name="description" 
          content={panel.settings?.seo_description || `Professional social media marketing services from ${panel.name}`} 
        />
        <meta 
          name="keywords" 
          content={panel.settings?.seo_keywords || 'social media marketing, instagram followers, youtube views, tiktok likes'}
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={panel.settings?.seo_title || `${panel.name} - SMM Panel`} />
        <meta 
          property="og:description" 
          content={panel.settings?.seo_description || `Professional social media marketing services from ${panel.name}`} 
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        {panel.logo_url && <meta property="og:image" content={panel.logo_url} />}
        
        {/* Custom panel styles */}
        <style>{`
          :root {
            --primary: ${panel.primary_color ? 
              panel.primary_color.replace('#', '').match(/.{2}/g)?.map(hex => parseInt(hex, 16)).join(' ') 
              : '59 130 246'} !important;
            --secondary: ${panel.secondary_color ? 
              panel.secondary_color.replace('#', '').match(/.{2}/g)?.map(hex => parseInt(hex, 16)).join(' ')
              : '30 64 175'} !important;
          }
          
        `}</style>
      </Helmet>

      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {panel.logo_url && (
                <img 
                  src={panel.logo_url} 
                  alt={panel.name}
                  className="h-10 w-10 rounded-lg object-cover"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  {panel.name}
                </h1>
                <p className="text-sm text-muted-foreground">Professional SMM Services</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-gradient-success">
                <Shield className="w-3 h-3 mr-1" />
                Trusted Panel
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Boost Your Social Media Presence
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get high-quality followers, likes, views, and engagement for all major social platforms
            with our premium SMM services.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center space-x-1"
                >
                  <Icon className="w-4 h-4" />
                  <span>{category.name}</span>
                </Button>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Services List */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {servicesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading services...</p>
                </div>
              ) : filteredServices.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No services found matching your criteria.</p>
                </div>
              ) : (
                filteredServices.map((service) => (
                  <Card 
                    key={service.id} 
                    className={`cursor-pointer transition-all duration-200 hover:shadow-elegant ${
                      selectedService?.id === service.id ? 'ring-2 ring-primary shadow-glow' : ''
                    }`}
                    onClick={() => setSelectedService(service)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <ServiceIcon imageUrl={service.image_url} />
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate">{service.name}</CardTitle>
                        </div>
                        <Badge variant="secondary" className="capitalize shrink-0">
                          {service.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {service.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <span className="font-medium">${service.price}</span>
                            <span className="text-muted-foreground">per 1000</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{service.estimated_time || '24-48h'}</span>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Min: {service.min_quantity} | Max: {service.max_quantity}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Order Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 bg-gradient-card border-border shadow-card">
              <CardHeader>
                <CardTitle>Place Order</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedService ? (
                  <>
                    <div>
                      <Label className="text-sm font-medium">Selected Service</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedService.name}
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="targetUrl">Target URL</Label>
                      <Input
                        id="targetUrl"
                        placeholder="https://instagram.com/yourprofile"
                        value={targetUrl}
                        onChange={(e) => setTargetUrl(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min={selectedService.min_quantity}
                        max={selectedService.max_quantity}
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value))}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Min: {selectedService.min_quantity} | Max: {selectedService.max_quantity}
                      </p>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-medium">Total Cost:</span>
                        <span className="text-lg font-bold text-primary">
                          ${((selectedService.price * quantity) / 1000).toFixed(2)}
                        </span>
                      </div>
                      <Button 
                        onClick={handleOrder}
                        className="w-full bg-gradient-primary hover:shadow-glow"
                        size="lg"
                      >
                        Place Order
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Select a service to place an order
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-4">About {panel.name}</h3>
              <p className="text-sm text-muted-foreground">
                Professional social media marketing services with high-quality results
                and excellent customer support.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Instagram Growth</li>
                <li>YouTube Promotion</li>
                <li>TikTok Marketing</li>
                <li>Facebook Engagement</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <p className="text-sm text-muted-foreground">
                {panel.settings?.contact_info?.email || 'Contact us for support'}
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; 2024 {panel.name}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Storefront;