import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTenant, useTenantServices } from '@/hooks/useTenant';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SOCIAL_ICONS_MAP } from '@/components/icons/SocialIcons';
import { cn } from '@/lib/utils';
import { 
  Search, 
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
  ChevronUp,
  CheckCircle,
  Instagram,
  Youtube,
  Twitter
} from 'lucide-react';
import { toast } from 'sonner';

const ServiceIcon = ({ imageUrl, className }: { imageUrl?: string | null; className?: string }) => {
  if (!imageUrl) {
    return (
      <div className={cn("w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center", className)}>
        <Image className="w-5 h-5 text-slate-400" />
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
  const { panel, loading: tenantLoading, error: tenantError } = useTenant();
  const { services, loading: servicesLoading } = useTenantServices(panel?.id);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedService, setSelectedService] = useState<any>(null);
  const [quantity, setQuantity] = useState(100);
  const [targetUrl, setTargetUrl] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const design = panel?.custom_branding || {};
  const primaryColor = design.primaryColor || panel?.primary_color || '#3B82F6';
  const secondaryColor = design.secondaryColor || panel?.secondary_color || '#06B6D4';
  
  const heroTitle = design.heroTitle || 'Boost Your Social Media Presence';
  const heroSubtitle = design.heroSubtitle || 'Get high-quality followers, likes, views, and engagement for all major social platforms with our premium SMM services.';
  const heroCta = design.heroCta || 'Get Started';
  
  const showHero = design.showHero !== false;
  const showFeatures = design.showFeatures !== false;
  const showStats = design.showStats !== false;
  const showFaqs = design.showFaqs !== false;
  const showTestimonials = design.showTestimonials !== false;
  
  const features = design.features || [
    { icon: 'Zap', title: 'Lightning Fast', description: 'Orders start within seconds' },
    { icon: 'Shield', title: '100% Safe', description: 'Secure payment & delivery' },
    { icon: 'Clock', title: '24/7 Support', description: "We're always here to help" },
    { icon: 'TrendingUp', title: 'Real Results', description: 'Genuine engagement growth' },
  ];
  
  const stats = design.stats || [
    { value: '10K+', label: 'Happy Customers' },
    { value: '50K+', label: 'Orders Completed' },
    { value: '99.9%', label: 'Uptime Guarantee' },
    { value: '24/7', label: 'Customer Support' },
  ];
  
  const faqs = design.faqs || [
    { question: 'How fast are orders delivered?', answer: 'Most orders start within 0-15 minutes and complete within 24 hours depending on the service.' },
    { question: 'Is it safe for my account?', answer: 'Yes! We use safe delivery methods that comply with platform guidelines to protect your account.' },
    { question: 'What payment methods do you accept?', answer: 'We accept all major payment methods including PayPal, credit cards, and cryptocurrency.' },
  ];

  const testimonials = [
    { name: 'Sarah K.', role: 'Influencer', content: 'Amazing service! My Instagram grew by 10K followers in just 2 weeks.', avatar: 'SK' },
    { name: 'Mike R.', role: 'Business Owner', content: 'The best SMM panel I have ever used. Fast delivery and great prices.', avatar: 'MR' },
    { name: 'Emily C.', role: 'Content Creator', content: 'Customer support is incredible. They helped me 24/7 with any questions.', avatar: 'EC' },
  ];
  
  const footerAbout = design.footerAbout || 'Professional social media marketing services with high-quality results and excellent customer support.';
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading panel...</p>
        </div>
      </div>
    );
  }

  if (tenantError || !panel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Panel Not Found</h1>
          <p className="text-slate-600">
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
  };

  const canonicalUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const platformServices = [
    { icon: Instagram, name: 'Instagram', description: 'Followers, Likes, Views, Comments', color: 'bg-gradient-to-br from-purple-500 to-pink-500' },
    { icon: Youtube, name: 'YouTube', description: 'Subscribers, Views, Watch Hours', color: 'bg-red-500' },
    { icon: Twitter, name: 'Twitter / X', description: 'Followers, Retweets, Likes', color: 'bg-slate-900' },
    { icon: MessageSquare, name: 'TikTok', description: 'Followers, Likes, Views, Shares', color: 'bg-gradient-to-br from-cyan-400 to-pink-500' },
    { icon: Users, name: 'Facebook', description: 'Page Likes, Post Engagement', color: 'bg-blue-600' },
    { icon: TrendingUp, name: 'LinkedIn', description: 'Connections, Post Engagement', color: 'bg-blue-700' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{panel.settings?.seo_title || `${panel.name} - SMM Panel`}</title>
        <meta name="description" content={panel.settings?.seo_description || `Professional social media marketing services from ${panel.name}`} />
        <meta name="keywords" content={panel.settings?.seo_keywords || 'social media marketing, instagram followers, youtube views, tiktok likes'} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={panel.settings?.seo_title || `${panel.name} - SMM Panel`} />
        <meta property="og:description" content={panel.settings?.seo_description || `Professional social media marketing services from ${panel.name}`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        {panel.logo_url && <meta property="og:image" content={panel.logo_url} />}
      </Helmet>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {(design.logoUrl || panel?.logo_url) && (
                <img 
                  src={design.logoUrl || panel?.logo_url} 
                  alt={panel?.name}
                  className="h-10 w-10 rounded-lg object-cover"
                />
              )}
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  {design.companyName || panel?.name}
                </h1>
                <p className="text-slate-500 text-sm hidden sm:block">
                  {design.tagline || 'Professional SMM Services'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <nav className="hidden md:flex items-center gap-6">
                <a href="#services" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Services</a>
                <a href="#testimonials" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Reviews</a>
                <a href="#faq" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">FAQ</a>
              </nav>
              <Button
                className="text-white shadow-lg hover:shadow-xl transition-all"
                style={{ backgroundColor: primaryColor }}
              >
                Login
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {showHero && (
        <section className="py-20 px-4 bg-gradient-to-b from-slate-50 to-white">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-blue-100 text-blue-700 border-0 px-4 py-1.5">
              <Star className="w-4 h-4 mr-2 fill-blue-500" />
              #1 Rated SMM Panel
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
              {heroTitle}
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
              {heroSubtitle}
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button 
                size="lg"
                className="text-white shadow-lg hover:shadow-xl transition-all px-8"
                style={{ backgroundColor: primaryColor }}
              >
                {heroCta}
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                View Pricing
              </Button>
            </div>
            
            {/* Trust badges */}
            <div className="mt-12 flex items-center justify-center gap-8 flex-wrap">
              <div className="flex items-center gap-2 text-slate-600">
                <Shield className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">Secure Payments</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium">Instant Delivery</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <CheckCircle className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium">Quality Guaranteed</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      {showStats && (
        <section className="py-12 bg-white border-y border-slate-100">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-3xl md:text-4xl font-bold mb-1" style={{ color: primaryColor }}>
                    {stat.value}
                  </p>
                  <p className="text-slate-600 text-sm font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Platform Services */}
      {showFeatures && (
        <section className="py-16 px-4 bg-slate-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Core Services</h2>
              <p className="text-slate-600 max-w-xl mx-auto">
                We provide high-quality social media marketing services for all major platforms
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {platformServices.map((service, index) => {
                const Icon = service.icon;
                return (
                  <Card 
                    key={index}
                    className="bg-white border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 rounded-xl ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">{service.name}</h3>
                      <p className="text-slate-600 text-sm">{service.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Services Section */}
      <section id="services" className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Browse All Services</h2>
            <p className="text-slate-600">Select a service to place your order</p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-6 mb-8">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-slate-200"
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
                    <p className="text-slate-500">Loading services...</p>
                  </div>
                ) : filteredServices.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-500">No services found matching your criteria.</p>
                  </div>
                ) : (
                  filteredServices.map((service) => (
                    <Card 
                      key={service.id} 
                      className={cn(
                        "cursor-pointer transition-all duration-200 bg-white border-slate-200 hover:border-slate-300 hover:shadow-md",
                        selectedService?.id === service.id && "ring-2 ring-blue-500"
                      )}
                      onClick={() => setSelectedService(service)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <ServiceIcon imageUrl={service.image_url} />
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg truncate text-slate-900">
                              {service.name}
                            </CardTitle>
                          </div>
                          <Badge variant="secondary" className="capitalize shrink-0 bg-slate-100 text-slate-700">
                            {service.category}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-600 mb-4">
                          {service.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <span className="font-semibold text-slate-900">${service.price}</span>
                              <span className="text-slate-500">per 1000</span>
                            </div>
                            <div className="flex items-center space-x-1 text-slate-500">
                              <Clock className="w-4 h-4" />
                              <span>{service.estimated_time || '24-48h'}</span>
                            </div>
                          </div>
                          <div className="text-sm text-slate-500">
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
              <Card className="sticky top-24 bg-white border-slate-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-slate-900">Place Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedService ? (
                    <>
                      <div>
                        <Label className="text-sm font-medium text-slate-700">Selected Service</Label>
                        <p className="text-sm mt-1 text-slate-600">
                          {selectedService.name}
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="targetUrl" className="text-slate-700">Target URL</Label>
                        <Input
                          id="targetUrl"
                          placeholder="https://instagram.com/yourprofile"
                          value={targetUrl}
                          onChange={(e) => setTargetUrl(e.target.value)}
                          className="bg-white border-slate-200"
                        />
                      </div>

                      <div>
                        <Label htmlFor="quantity" className="text-slate-700">Quantity</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min={selectedService.min_quantity}
                          max={selectedService.max_quantity}
                          value={quantity}
                          onChange={(e) => setQuantity(parseInt(e.target.value))}
                          className="bg-white border-slate-200"
                        />
                        <p className="text-xs mt-1 text-slate-500">
                          Min: {selectedService.min_quantity} | Max: {selectedService.max_quantity}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-slate-200">
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-medium text-slate-900">Total Cost:</span>
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
                      <p className="text-slate-500">
                        Select a service to place an order
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {showTestimonials && (
        <section id="testimonials" className="py-16 px-4 bg-slate-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-1 mb-4">
                {[1,2,3,4,5].map((i) => (
                  <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Loved by Thousands of Customers</h2>
              <p className="text-slate-600">See what our satisfied customers have to say</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="bg-white border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[1,2,3,4,5].map((i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-slate-700 mb-4">"{testimonial.content}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold text-slate-600">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{testimonial.name}</p>
                        <p className="text-slate-500 text-xs">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQs Section */}
      {showFaqs && faqs.length > 0 && (
        <section id="faq" className="py-16 px-4 bg-white">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-slate-600">Find answers to common questions about our services</p>
            </div>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div 
                  key={i}
                  className="border border-slate-200 rounded-lg overflow-hidden bg-white"
                >
                  <button
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                    onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  >
                    <span className="font-medium text-slate-900">{faq.question}</span>
                    {expandedFaq === i ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                  {expandedFaq === i && (
                    <div className="px-4 pb-4">
                      <p className="text-slate-600">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section 
        className="py-16 px-4"
        style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor || primaryColor})` }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to grow your social media?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of satisfied customers and start growing your online presence today.
          </p>
          <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 shadow-lg px-8">
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-1">
              <h3 className="font-bold text-lg mb-4">{design.companyName || panel?.name}</h3>
              <p className="text-slate-400 text-sm">{footerAbout}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
                <li><a href="#" className="hover:text-white transition-colors">YouTube</a></li>
                <li><a href="#" className="hover:text-white transition-colors">TikTok</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center">
            <p className="text-slate-400 text-sm">{footerText}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Storefront;