import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Rocket, Target, Heart, Zap, Users, CheckCircle, Clock, Shield, Star, Search } from "lucide-react";
import { ShiningButton } from "@/components/ui/shining-button";
import { motion } from "framer-motion";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";
import { LowVisionToggle } from "@/components/storefront/LowVisionToggle";
import { KanbanServiceCategories } from "@/components/storefront/KanbanServiceCategories";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface ThemeThreeProps {
  panel?: any;
  services?: any[];
  customization?: any;
}

const FloatingBubble = ({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => (
  <motion.div
    initial={{ y: 0, scale: 1 }}
    animate={{ y: [-8, 8, -8], scale: [1, 1.02, 1] }}
    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay }}
    className={`absolute bg-white rounded-2xl shadow-xl p-4 ${className}`}
  >
    {children}
  </motion.div>
);

export const ThemeThree = ({ panel, services = [], customization = {} }: ThemeThreeProps) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dynamic customization values
  const panelName = customization.companyName || panel?.name || 'SMM Panel';
  const primaryColor = customization.primaryColor || panel?.primary_color || '#F97316';
  const secondaryColor = customization.secondaryColor || '#F59E0B';
  const backgroundColor = customization.backgroundColor || '#FFF7ED';
  const surfaceColor = customization.surfaceColor || '#FFFFFF';
  const textColor = customization.textColor || '#1F2937';
  const fontFamily = customization.fontFamily || 'Inter, system-ui, sans-serif';
  const borderRadius = customization.borderRadius || '12';
  const heroTitle = customization.heroTitle || 'The Best Prices In Social Networks';
  const heroSubtitle = customization.heroSubtitle || 'Get instant followers, likes, and views at the lowest prices. Join over 100,000 satisfied customers.';
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

  const bubbleStats = [
    { text: "Millions of completed orders", icon: "🚀", position: "top-32 left-[5%]" },
    { text: "Only quality exclusive services", icon: "⭐", position: "top-48 right-[8%]" },
    { text: "Thousands of happy customers", icon: "😊", position: "bottom-40 left-[8%]" },
    { text: "Huge service assortment", icon: "📦", position: "bottom-32 right-[5%]" },
  ];

  const useCases = [
    { label: "For self usage", color: "bg-orange-100 text-orange-700" },
    { label: "For business", color: "bg-blue-100 text-blue-700" },
    { label: "For Resellers", color: "bg-purple-100 text-purple-700" },
  ];

  const features = [
    { icon: Zap, title: "SimpleUI", description: "Track your orders with our intuitive interface.", badge: null },
    { icon: Clock, title: "DripFeed", description: "Set custom intervals for gradual delivery.", badge: "Popular" },
    { icon: Users, title: "MassOrder", description: "Place bulk orders with ease.", badge: "Business" },
    { icon: Star, title: "SuperPack", description: "Subscribe to premium plans and save up to 30%!", badge: "New" },
  ];

  const platforms = [
    { name: "Instagram", emoji: "📸", color: "bg-gradient-to-br from-pink-400 to-purple-500" },
    { name: "YouTube", emoji: "🎥", color: "bg-gradient-to-br from-red-500 to-red-600" },
    { name: "TikTok", emoji: "🎵", color: "bg-gradient-to-br from-gray-800 to-gray-900" },
    { name: "Telegram", emoji: "✈️", color: "bg-gradient-to-br from-blue-400 to-blue-500" },
    { name: "Facebook", emoji: "👥", color: "bg-gradient-to-br from-blue-600 to-blue-700" },
    { name: "Twitter", emoji: "🐦", color: "bg-gradient-to-br from-sky-400 to-sky-500" },
  ];

  return (
    <div 
      className="min-h-screen overflow-hidden"
      style={{ 
        background: `linear-gradient(135deg, ${backgroundColor}, ${surfaceColor})`,
        fontFamily,
        color: textColor,
      }}
    >
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b shadow-sm" style={{ backgroundColor: `${surfaceColor}CC`, borderColor: `${primaryColor}20` }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {(customization.logoUrl || panel?.logo_url) && (
              <img src={customization.logoUrl || panel?.logo_url} alt={panelName} className="h-10 w-10 rounded-lg object-cover" />
            )}
            <div>
              <h1 className="text-xl font-bold" style={{ color: textColor }}>{panelName}</h1>
              <p className="text-gray-500 text-sm hidden sm:block">{customization.tagline || 'Best Prices Guaranteed'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LowVisionToggle accessibilitySettings={accessibilitySettings} panelId={panel?.id} variant="light" />
            <nav className="hidden md:flex items-center gap-6">
              <a href="#services" className="text-sm opacity-80 hover:opacity-100 transition-colors" style={{ color: textColor }}>Services</a>
              <a href="#features" className="text-sm opacity-80 hover:opacity-100 transition-colors" style={{ color: textColor }}>Features</a>
            </nav>
            <Button 
              className="text-white hover:opacity-90" 
              style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`, borderRadius: `${borderRadius}px` }}
              asChild
            >
              <Link to="/login">Login</Link>
            </Button>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-100/50 via-transparent to-amber-100/50" />
        
        {bubbleStats.map((bubble, i) => (
          <FloatingBubble key={i} className={bubble.position} delay={i * 0.5}>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 whitespace-nowrap">
              <span className="text-lg">{bubble.icon}</span>
              {bubble.text}
            </div>
          </FloatingBubble>
        ))}
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap justify-center gap-3 mb-8">
              {useCases.map((useCase, i) => (
                <Badge key={i} className={`px-4 py-2 text-sm font-medium ${useCase.color} border-0`}>{useCase.label}</Badge>
              ))}
            </motion.div>
            
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-7xl font-extrabold mb-6">
              <span className="text-gray-900">{heroTitle.split(' ').slice(0, 3).join(' ')} </span>
              <br />
              <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent">
                {heroTitle.split(' ').slice(3).join(' ') || 'In Social Networks'}
              </span>
            </motion.h1>
            
            <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              {heroSubtitle}
            </motion.p>
            
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <ShiningButton gradient="accent" size="lg" className="text-lg px-10 py-6 bg-gradient-to-r from-orange-500 to-amber-500 shadow-xl shadow-orange-500/25" asChild>
                <Link to="/services">⚡ Fast Order <ArrowRight className="ml-2 w-5 h-5" /></Link>
              </ShiningButton>
              <Button asChild variant="outline" size="lg" className="text-lg px-10 py-6 border-gray-300 text-gray-700 hover:bg-white shadow-lg">
                <Link to="/register"><Sparkles className="mr-2" /> Start Now</Link>
              </Button>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-wrap justify-center gap-4">
              {platforms.map((platform, index) => (
                <div key={index} className={`w-14 h-14 rounded-xl ${platform.color} flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform cursor-pointer`} title={platform.name}>
                  {platform.emoji}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "2M+", label: "Orders Delivered", icon: Rocket, color: "text-orange-500" },
              { value: "100K+", label: "Happy Customers", icon: Heart, color: "text-pink-500" },
              { value: "99.9%", label: "Success Rate", icon: Target, color: "text-green-500" },
              { value: "24/7", label: "Support", icon: Shield, color: "text-blue-500" }
            ].map((stat, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} viewport={{ once: true }}>
                <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg text-center hover:shadow-xl transition-shadow">
                  <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-gray-500 text-sm">{stat.label}</div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <Badge className="mb-4 px-4 py-1 bg-orange-100 text-orange-700 border-0">Services</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Browse All Services</h2>
          </div>

          <div className="mb-8">
            <KanbanServiceCategories categories={categories} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} variant="light" />
          </div>

          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search services..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-white border-gray-200" />
            </div>
          </div>

          {filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredServices.slice(0, 8).map((service, index) => (
                <motion.div key={service.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} viewport={{ once: true }}>
                  <Card className="p-6 bg-white border-0 shadow-lg hover:shadow-xl transition-all h-full">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center mb-4 text-xl">
                      {service.image_url?.startsWith('icon:') ? service.image_url.replace('icon:', '') : '📦'}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{service.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{service.description}</p>
                    <div className="text-orange-600 font-semibold mb-4">${service.price}/1K</div>
                    <Button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white" asChild>
                      <Link to={`/order?service=${service.id}`}>Order Now</Link>
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">No services available yet.</div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 px-4 py-1 bg-orange-100 text-orange-700 border-0">Features</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Tools For Growth</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} viewport={{ once: true }}>
                <Card className="p-6 bg-white border-0 shadow-lg hover:shadow-xl transition-all h-full relative">
                  {feature.badge && <Badge className="absolute top-4 right-4 bg-orange-500 text-white border-0">{feature.badge}</Badge>}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8">
            {[
              { icon: CheckCircle, text: "No Password Required", color: "text-green-500" },
              { icon: Shield, text: "Secure Payments", color: "text-blue-500" },
              { icon: Clock, text: "Instant Delivery", color: "text-orange-500" },
              { icon: Heart, text: "100% Satisfaction", color: "text-pink-500" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-700">
                <item.icon className={`w-5 h-5 ${item.color}`} />
                <span className="font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="p-12 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 border-0 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full translate-x-1/4 translate-y-1/4" />
            <div className="relative z-10">
              <div className="text-5xl mb-6">🎉</div>
              <h2 className="text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">Join over 100,000 happy customers today!</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="text-xl px-10 py-6 bg-white text-orange-600 hover:bg-gray-100 shadow-xl font-bold">
                  <Link to="/register">🚀 Create Free Account</Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <StorefrontFooter panelName={panelName} footerAbout={customization.footerAbout} footerText={customization.footerText} socialPlatforms={socialPlatforms} primaryColor={primaryColor} variant="light" />
    </div>
  );
};
