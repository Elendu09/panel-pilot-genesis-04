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
  Image,
  ChevronDown,
  ChevronUp
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
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Get design customization from panel.custom_branding or use defaults
  const design = panel?.custom_branding || {};
  const primaryColor = design.primaryColor || panel?.primary_color || '#8B5CF6';
  const secondaryColor = design.secondaryColor || panel?.secondary_color || '#06B6D4';
  const backgroundColor = design.backgroundColor || '#0F172A';
  const surfaceColor = design.surfaceColor || '#1E293B';
  const textColor = design.textColor || '#F8FAFC';
  const mutedColor = design.mutedColor || '#94A3B8';
  const borderRadius = design.borderRadius || '8';
  
  const heroTitle = design.heroTitle || 'Boost Your Social Media Presence';
  const heroSubtitle = design.heroSubtitle || 'Get high-quality followers, likes, views, and engagement for all major social platforms with our premium SMM services.';
  const heroCta = design.heroCta || 'Get Started';
  
  const showHero = design.showHero !== false;
  const showFeatures = design.showFeatures !== false;
  const showStats = design.showStats !== false;
  const showFaqs = design.showFaqs !== false;
  
  const features = design.features || [
    { icon: 'Zap', title: 'Lightning Fast', description: 'Orders start within seconds' },
    { icon: 'Shield', title: '100% Safe', description: 'Secure payment & delivery' },
    { icon: 'Clock', title: '24/7 Support', description: "We're always here to help" },
    { icon: 'TrendingUp', title: 'Real Results', description: 'Genuine engagement growth' },
  ];
  
  const stats = design.stats || [
    { value: '10K+', label: 'Happy Customers' },
    { value: '50K+', label: 'Orders Completed' },
    { value: '99.9%', label: 'Uptime' },
  ];
  
  const faqs = design.faqs || [
    { question: 'How fast are orders delivered?', answer: 'Most orders start within 0-15 minutes and complete within 24 hours depending on the service.' },
    { question: 'Is it safe for my account?', answer: 'Yes! We use safe delivery methods that comply with platform guidelines to protect your account.' },
    { question: 'What payment methods do you accept?', answer: 'We accept all major payment methods including PayPal, credit cards, and cryptocurrency.' },
  ];
  
  const footerAbout = design.footerAbout || 'Professional social media marketing services with high-quality results and excellent customer support.';
  const footerContact = design.footerContact || panel?.settings?.contact_info?.email || 'Contact us for support';
  const footerText = design.footerText || `© 2024 ${panel?.name || 'SMM Panel'}. All rights reserved.`;

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
        
      {/* Custom panel styles using design customization */}
        <style>{`
          :root {
            --panel-primary: ${primaryColor};
            --panel-secondary: ${secondaryColor};
            --panel-bg: ${backgroundColor};
            --panel-surface: ${surfaceColor};
            --panel-text: ${textColor};
            --panel-muted: ${mutedColor};
          }
        `}</style>
      </Helmet>

      {/* Header */}
      <header 
        className="border-b backdrop-blur-sm sticky top-0 z-50"
        style={{ backgroundColor: surfaceColor, borderColor: `${mutedColor}30` }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {(design.logoUrl || panel?.logo_url) && (
                <img 
                  src={design.logoUrl || panel?.logo_url} 
                  alt={panel?.name}
                  className="h-10 w-10 rounded-lg object-cover"
                  style={{ borderRadius: `${borderRadius}px` }}
                />
              )}
              <div>
                <h1 
                  className="text-2xl font-bold"
                  style={{ color: primaryColor }}
                >
                  {design.companyName || panel?.name}
                </h1>
                <p style={{ color: mutedColor }} className="text-sm">
                  {design.tagline || 'Professional SMM Services'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-opacity"
                style={{ backgroundColor: primaryColor, borderRadius: `${borderRadius}px` }}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </header>

      <div style={{ backgroundColor }}>
        {/* Hero Section */}
        {showHero && (
          <div className="container mx-auto px-4 py-16 text-center">
            <h2 
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{ color: textColor }}
            >
              {heroTitle}
            </h2>
            <p 
              className="text-xl max-w-2xl mx-auto mb-8"
              style={{ color: mutedColor }}
            >
              {heroSubtitle}
            </p>
            <button
              className="px-8 py-4 text-lg font-semibold text-white rounded-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: primaryColor, borderRadius: `${borderRadius}px` }}
            >
              {heroCta}
            </button>
          </div>
        )}

        {/* Features Section */}
        {showFeatures && (
          <div className="container mx-auto px-4 py-12">
            <h3 
              className="text-2xl font-bold text-center mb-8"
              style={{ color: textColor }}
            >
              Why Choose Us?
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {features.map((feature, i) => {
                const iconMap: Record<string, any> = { Zap, Shield, Clock, TrendingUp };
                const IconComponent = iconMap[feature.icon] || Zap;
                return (
                  <div 
                    key={i}
                    className="p-4 rounded-lg text-center"
                    style={{ backgroundColor: surfaceColor, borderRadius: `${borderRadius}px` }}
                  >
                    <div 
                      className="w-12 h-12 rounded-lg mx-auto mb-3 flex items-center justify-center"
                      style={{ backgroundColor: `${secondaryColor}30` }}
                    >
                      <IconComponent className="w-6 h-6" style={{ color: secondaryColor }} />
                    </div>
                    <h4 className="font-semibold mb-1" style={{ color: textColor }}>
                      {feature.title}
                    </h4>
                    <p className="text-sm" style={{ color: mutedColor }}>
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Stats Section */}
        {showStats && (
          <div 
            className="py-12"
            style={{ backgroundColor: `${primaryColor}15` }}
          >
            <div className="container mx-auto px-4">
              <div className="flex justify-around flex-wrap gap-8">
                {stats.map((stat, i) => (
                  <div key={i} className="text-center">
                    <div 
                      className="text-4xl font-bold mb-1"
                      style={{ color: primaryColor }}
                    >
                      {stat.value}
                    </div>
                    <div style={{ color: mutedColor }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Services Section */}
        <div className="container mx-auto px-4 py-12">
          <h3 
            className="text-2xl font-bold text-center mb-8"
            style={{ color: textColor }}
          >
            Our Services
          </h3>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-6 mb-8">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: mutedColor }} />
                <Input
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  style={{ backgroundColor: surfaceColor, borderColor: `${mutedColor}30`, color: textColor }}
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
                    style={selectedCategory === category.id ? { backgroundColor: primaryColor } : {}}
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
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: primaryColor }}></div>
                    <p style={{ color: mutedColor }}>Loading services...</p>
                  </div>
                ) : filteredServices.length === 0 ? (
                  <div className="text-center py-8">
                    <p style={{ color: mutedColor }}>No services found matching your criteria.</p>
                  </div>
                ) : (
                  filteredServices.map((service) => (
                    <Card 
                      key={service.id} 
                      className={`cursor-pointer transition-all duration-200 ${
                        selectedService?.id === service.id ? 'ring-2' : ''
                      }`}
                      style={{ 
                        backgroundColor: surfaceColor, 
                        borderColor: `${mutedColor}30`,
                        ...(selectedService?.id === service.id ? { ringColor: primaryColor } : {})
                      }}
                      onClick={() => setSelectedService(service)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <ServiceIcon imageUrl={service.image_url} />
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg truncate" style={{ color: textColor }}>
                              {service.name}
                            </CardTitle>
                          </div>
                          <Badge variant="secondary" className="capitalize shrink-0">
                            {service.category}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-4" style={{ color: mutedColor }}>
                          {service.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <span className="font-medium" style={{ color: textColor }}>${service.price}</span>
                              <span style={{ color: mutedColor }}>per 1000</span>
                            </div>
                            <div className="flex items-center space-x-1" style={{ color: mutedColor }}>
                              <Clock className="w-4 h-4" />
                              <span>{service.estimated_time || '24-48h'}</span>
                            </div>
                          </div>
                          <div className="text-sm" style={{ color: mutedColor }}>
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
              <Card 
                className="sticky top-24"
                style={{ backgroundColor: surfaceColor, borderColor: `${mutedColor}30` }}
              >
                <CardHeader>
                  <CardTitle style={{ color: textColor }}>Place Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedService ? (
                    <>
                      <div>
                        <Label className="text-sm font-medium" style={{ color: textColor }}>Selected Service</Label>
                        <p className="text-sm mt-1" style={{ color: mutedColor }}>
                          {selectedService.name}
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="targetUrl" style={{ color: textColor }}>Target URL</Label>
                        <Input
                          id="targetUrl"
                          placeholder="https://instagram.com/yourprofile"
                          value={targetUrl}
                          onChange={(e) => setTargetUrl(e.target.value)}
                          style={{ backgroundColor, borderColor: `${mutedColor}30`, color: textColor }}
                        />
                      </div>

                      <div>
                        <Label htmlFor="quantity" style={{ color: textColor }}>Quantity</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min={selectedService.min_quantity}
                          max={selectedService.max_quantity}
                          value={quantity}
                          onChange={(e) => setQuantity(parseInt(e.target.value))}
                          style={{ backgroundColor, borderColor: `${mutedColor}30`, color: textColor }}
                        />
                        <p className="text-xs mt-1" style={{ color: mutedColor }}>
                          Min: {selectedService.min_quantity} | Max: {selectedService.max_quantity}
                        </p>
                      </div>

                      <div className="pt-4 border-t" style={{ borderColor: `${mutedColor}30` }}>
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-medium" style={{ color: textColor }}>Total Cost:</span>
                          <span className="text-lg font-bold" style={{ color: primaryColor }}>
                            ${((selectedService.price * quantity) / 1000).toFixed(2)}
                          </span>
                        </div>
                        <Button 
                          onClick={handleOrder}
                          className="w-full text-white"
                          style={{ backgroundColor: primaryColor }}
                          size="lg"
                        >
                          Place Order
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p style={{ color: mutedColor }}>
                        Select a service to place an order
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* FAQs Section */}
        {showFaqs && faqs.length > 0 && (
          <div className="container mx-auto px-4 py-12">
            <h3 
              className="text-2xl font-bold text-center mb-8"
              style={{ color: textColor }}
            >
              Frequently Asked Questions
            </h3>
            <div className="max-w-2xl mx-auto space-y-3">
              {faqs.map((faq, i) => (
                <div 
                  key={i}
                  className="rounded-lg overflow-hidden"
                  style={{ backgroundColor: surfaceColor, borderRadius: `${borderRadius}px` }}
                >
                  <button
                    className="w-full p-4 flex items-center justify-between text-left"
                    onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  >
                    <span className="font-medium" style={{ color: textColor }}>
                      {faq.question}
                    </span>
                    {expandedFaq === i ? (
                      <ChevronUp className="w-5 h-5" style={{ color: mutedColor }} />
                    ) : (
                      <ChevronDown className="w-5 h-5" style={{ color: mutedColor }} />
                    )}
                  </button>
                  {expandedFaq === i && (
                    <div className="px-4 pb-4">
                      <p style={{ color: mutedColor }}>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{ backgroundColor: surfaceColor, borderTop: `1px solid ${mutedColor}30` }}>
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-4" style={{ color: textColor }}>
                About {design.companyName || panel?.name}
              </h3>
              <p className="text-sm" style={{ color: mutedColor }}>
                {footerAbout}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4" style={{ color: textColor }}>Services</h3>
              <ul className="space-y-2 text-sm" style={{ color: mutedColor }}>
                <li>Instagram Growth</li>
                <li>YouTube Promotion</li>
                <li>TikTok Marketing</li>
                <li>Facebook Engagement</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4" style={{ color: textColor }}>Support</h3>
              <p className="text-sm" style={{ color: mutedColor }}>
                {footerContact}
              </p>
            </div>
          </div>
          <div 
            className="mt-8 pt-8 text-center text-sm"
            style={{ borderTop: `1px solid ${mutedColor}30`, color: mutedColor }}
          >
            <p>{footerText}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Storefront;