import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, Star, Globe, Shield, Zap, Users, Clock, CreditCard, Headphones, Lock, Search } from "lucide-react";
import { ShiningButton } from "@/components/ui/shining-button";
import { motion } from "framer-motion";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";
import { LowVisionToggle } from "@/components/storefront/LowVisionToggle";
import { KanbanServiceCategories } from "@/components/storefront/KanbanServiceCategories";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface ThemeTwoProps {
  panel?: any;
  services?: any[];
  customization?: any;
}

const FloatingIcon = ({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => (
  <motion.div
    initial={{ y: 0, opacity: 0.7 }}
    animate={{ y: [-5, 5, -5], opacity: [0.7, 1, 0.7] }}
    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay }}
    className={`absolute w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg ${className}`}
  >
    {children}
  </motion.div>
);

export const ThemeTwo = ({ panel, services = [], customization = {} }: ThemeTwoProps) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const panelName = customization.companyName || panel?.name || 'SMM Panel';
  const primaryColor = customization.primaryColor || panel?.primary_color || '#6366F1';
  const heroTitle = customization.heroTitle || 'Professional Social Media Marketing Solutions';
  const heroSubtitle = customization.heroSubtitle || 'Elevate your brand with our premium social media marketing services. Trusted by 50,000+ businesses worldwide.';
  const socialPlatforms = customization.socialPlatforms || [];
  const accessibilitySettings = customization.accessibilitySettings;

  // Build categories
  const categoryMap = new Map<string, number>();
  categoryMap.set('all', services.length);
  services.forEach(s => {
    const cat = s.category || 'other';
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
  });
  
  const categories = [
    { id: 'all', name: 'All Services', count: categoryMap.get('all') || 0 },
    ...Array.from(categoryMap.entries())
      .filter(([k]) => k !== 'all')
      .map(([id, count]) => ({ id, name: id.charAt(0).toUpperCase() + id.slice(1), count }))
  ];

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const features = [
    { icon: CheckCircle, title: "Verified Services", description: "All our services are tested and verified for maximum quality." },
    { icon: Zap, title: "Instant Delivery", description: "Most orders start within 0-1 hour and complete quickly." },
    { icon: Shield, title: "Money Back Guarantee", description: "100% refund if we can't deliver what we promise." },
    { icon: Globe, title: "Global Coverage", description: "We serve customers worldwide with 24/7 support." }
  ];

  const testimonials = [
    { name: "Sarah Johnson", role: "Digital Marketer", content: "This platform has revolutionized how I manage my clients' social media growth.", rating: 5, avatar: "👩‍💼" },
    { name: "Mike Chen", role: "Content Creator", content: "Fast delivery, great prices, and excellent customer service.", rating: 5, avatar: "👨‍🎤" },
    { name: "Emma Rodriguez", role: "Small Business Owner", content: "Helped me grow my business Instagram from 500 to 50K followers.", rating: 5, avatar: "👩‍💻" }
  ];

  const trustBadges = [
    { icon: Lock, text: "No Password Required" },
    { icon: CreditCard, text: "Money Back Guarantee" },
    { icon: Headphones, text: "24/7 Support" },
  ];

  const quickPrices = services.slice(0, 4).map(s => ({
    service: s.name?.substring(0, 25) + (s.name?.length > 25 ? '...' : ''),
    price: `$${s.price}/1K`,
    icon: s.image_url?.startsWith('icon:') ? s.image_url.replace('icon:', '') : '📦'
  }));

  const defaultQuickPrices = [
    { service: "Instagram Followers", price: "$0.01/1K", icon: "📸" },
    { service: "YouTube Views", price: "$0.05/1K", icon: "🎥" },
    { service: "TikTok Likes", price: "$0.02/1K", icon: "🎵" },
    { service: "Telegram Members", price: "$0.03/1K", icon: "✈️" },
  ];

  return (
    <div className="min-h-screen bg-[#0c0c1d] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0c0c1d]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {(customization.logoUrl || panel?.logo_url) && (
              <img src={customization.logoUrl || panel?.logo_url} alt={panelName} className="h-10 w-10 rounded-lg object-cover" />
            )}
            <div>
              <h1 className="text-xl font-bold text-white">{panelName}</h1>
              <p className="text-gray-400 text-sm hidden sm:block">{customization.tagline || 'Professional SMM Services'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LowVisionToggle accessibilitySettings={accessibilitySettings} panelId={panel?.id} variant="dark" />
            <nav className="hidden md:flex items-center gap-6">
              <a href="#services" className="text-sm text-gray-300 hover:text-white transition-colors">Services</a>
              <a href="#testimonials" className="text-sm text-gray-300 hover:text-white transition-colors">Reviews</a>
            </nav>
            <ShiningButton gradient="primary" size="sm" asChild>
              <Link to="/login">Get Started</Link>
            </ShiningButton>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 via-[#0c0c1d] to-purple-900/20" />
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px]" />
        
        <FloatingIcon className="top-32 left-[8%]" delay={0}>📸</FloatingIcon>
        <FloatingIcon className="top-48 left-[15%]" delay={0.5}>🎥</FloatingIcon>
        <FloatingIcon className="bottom-32 left-[5%]" delay={1}>🎵</FloatingIcon>
        <FloatingIcon className="top-24 right-[35%]" delay={1.5}>✈️</FloatingIcon>
        <FloatingIcon className="bottom-40 right-[8%]" delay={2}>👥</FloatingIcon>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-left">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Badge variant="outline" className="mb-6 border-indigo-500/50 text-indigo-300 bg-indigo-500/10 px-4 py-2">⚡ Professional SMM Services</Badge>
              </motion.div>
              
              <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-6xl font-bold mb-6">
                {heroTitle.split(' ').slice(0, 3).join(' ')}
                <span className="block bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  {heroTitle.split(' ').slice(3).join(' ') || 'Marketing Solutions'}
                </span>
              </motion.h1>
              
              <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl text-gray-400 mb-8 leading-relaxed max-w-xl">
                {heroSubtitle}
              </motion.p>
              
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row gap-4 mb-8">
                <ShiningButton gradient="primary" size="lg" className="text-lg px-8 py-6" asChild>
                  <Link to="/services">Get Started <ArrowRight className="ml-2" /></Link>
                </ShiningButton>
                <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 border-white/20 text-white hover:bg-white/5">
                  <Link to="/register">View Pricing</Link>
                </Button>
              </motion.div>
              
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-wrap items-center gap-6">
                {trustBadges.map((badge, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
                    <badge.icon className="h-4 w-4 text-green-400" />{badge.text}
                  </div>
                ))}
              </motion.div>
            </div>
            
            {/* Quick Order Card */}
            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="flex-1 w-full max-w-md">
              <Card className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl shadow-purple-500/10">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">Quick Order</h3>
                  <p className="text-gray-400">Start your growth journey</p>
                </div>
                <div className="space-y-3">
                  {(quickPrices.length > 0 ? quickPrices : defaultQuickPrices).map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10 hover:border-indigo-500/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{item.icon}</span>
                        <span className="text-white text-sm">{item.service}</span>
                      </div>
                      <span className="font-semibold text-indigo-400">{item.price}</span>
                    </div>
                  ))}
                </div>
                <ShiningButton gradient="primary" className="w-full mt-6 py-6 text-lg" asChild>
                  <Link to="/new-order">Place Order Now</Link>
                </ShiningButton>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gradient-to-b from-transparent to-indigo-900/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <Badge variant="secondary" className="mb-4 px-4 py-1 bg-indigo-500/20 text-indigo-300 border-indigo-500/30">Our Services</Badge>
            <h2 className="text-4xl font-bold text-white mb-4">Browse Services</h2>
          </div>

          <div className="mb-8">
            <KanbanServiceCategories categories={categories} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} variant="dark" />
          </div>

          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search services..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500" />
            </div>
          </div>

          {filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredServices.slice(0, 8).map((service, index) => (
                <motion.div key={service.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} viewport={{ once: true }}>
                  <Card className="p-6 text-center bg-white/5 backdrop-blur-sm border border-white/10 hover:border-indigo-500/50 transition-all hover:bg-white/10 h-full">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xl">
                      {service.image_url?.startsWith('icon:') ? service.image_url.replace('icon:', '') : '📦'}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{service.name}</h3>
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">{service.description}</p>
                    <div className="text-indigo-400 font-semibold mb-4">${service.price}/1K</div>
                    <Button size="sm" className="w-full" asChild><Link to={`/order?service=${service.id}`}>Order</Link></Button>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">No services available yet.</div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 px-4 py-1 bg-indigo-500/20 text-indigo-300 border-indigo-500/30">Why Choose Us</Badge>
            <h2 className="text-4xl font-bold text-white mb-4">Why Choose Our Platform?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} viewport={{ once: true }}>
                <Card className="p-6 text-center bg-white/5 backdrop-blur-sm border border-white/10 hover:border-indigo-500/50 h-full">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center">
                    <feature.icon className="h-8 w-8 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 px-4 py-1 bg-purple-500/20 text-purple-300 border-purple-500/30">Testimonials</Badge>
            <h2 className="text-4xl font-bold text-white mb-4">What Our Clients Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} viewport={{ once: true }}>
                <Card className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 h-full">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (<Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />))}
                  </div>
                  <p className="text-gray-300 mb-6 italic">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xl">{testimonial.avatar}</div>
                    <div>
                      <div className="font-semibold text-white">{testimonial.name}</div>
                      <div className="text-sm text-gray-400">{testimonial.role}</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="p-12 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-white/10 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Grow Your Social Media?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">Join thousands of satisfied customers today</p>
            <ShiningButton gradient="rainbow" size="lg" className="text-lg px-10 py-6" asChild>
              <Link to="/register">🚀 Get Started Now <ArrowRight className="ml-2" /></Link>
            </ShiningButton>
          </Card>
        </div>
      </section>

      <StorefrontFooter panelName={panelName} footerAbout={customization.footerAbout} footerText={customization.footerText} socialPlatforms={socialPlatforms} primaryColor={primaryColor} variant="dark" />
    </div>
  );
};
