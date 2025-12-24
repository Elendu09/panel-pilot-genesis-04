import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowRight, Star, Shield, Zap, Clock, CreditCard, Users, Briefcase, Music2, ShoppingBag, Search, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";
import { LowVisionToggle } from "@/components/storefront/LowVisionToggle";
import { KanbanServiceCategories } from "@/components/storefront/KanbanServiceCategories";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface ThemeFourProps {
  panel?: any;
  services?: any[];
  customization?: any;
}

// Floating particle dots
const ParticleDot = ({ style }: { style: React.CSSProperties }) => (
  <motion.div
    className="absolute w-1 h-1 bg-white/40 rounded-full"
    style={style}
    animate={{
      opacity: [0.2, 0.6, 0.2],
      scale: [1, 1.2, 1],
    }}
    transition={{
      duration: 3 + Math.random() * 2,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

// Social platform floating icons
const FloatingSocialIcon = ({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => (
  <motion.div
    initial={{ y: 0, rotate: 0 }}
    animate={{ y: [-10, 10, -10], rotate: [-5, 5, -5] }}
    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay }}
    className={`absolute ${className}`}
  >
    {children}
  </motion.div>
);

export const ThemeFour = ({ panel, services = [], customization = {} }: ThemeFourProps) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const panelName = customization.companyName || panel?.name || 'Grace Cometh Panel';
  const primaryColor = customization.primaryColor || panel?.primary_color || '#6B4226';
  const heroTitle = customization.heroTitle || 'Where Growth Meet Grace';
  const heroSubtitle = customization.heroSubtitle || 'Unlock effortless social media success with our panel. We\'re the simplest and fastest way to boost your online presence across Instagram, Facebook, TikTok, YouTube and more.';
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
    { icon: Star, title: "High Quality", description: "We always strive to provide the best services possible." },
    { icon: CreditCard, title: "Multiple Payment Options", description: "We offer various options to add funds to your account." },
    { icon: Shield, title: "Affordable Growth", description: "Get premium quality at soft, budget-friendly prices." },
    { icon: Zap, title: "Fast Delivery", description: "Your orders start processing almost instantly. No delays." },
    { icon: Clock, title: "Safe & Secure", description: "We use industry-standard systems to keep your account safe." },
    { icon: CheckCircle, title: "Grace Inspired Simplicity", description: "The entire experience is designed to be easy & guided." },
  ];

  const beneficiaries = [
    { icon: Users, title: "Influencers", description: "Build credibility with a larger, engaged audience." },
    { icon: Briefcase, title: "Businesses", description: "Boost visibility, drive traffic, and generate leads." },
    { icon: Music2, title: "Musicians & Artists", description: "Amplify your reach and grow your fanbase." },
    { icon: ShoppingBag, title: "Resellers", description: "Buy in bulk at lower rates and resell for profit." },
  ];

  const howItWorks = [
    { step: "1", title: "Create Account", description: "Sign up for free in seconds." },
    { step: "2", title: "Add Funds", description: "Choose your preferred payment method." },
    { step: "3", title: "Place Order", description: "Select a service and enter your details." },
    { step: "4", title: "See Results", description: "Watch your social media grow!" },
  ];

  // Generate random particles
  const particles = Array.from({ length: 50 }, (_, i) => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 3}s`,
  }));

  return (
    <div className="min-h-screen bg-[#5D3A1A] text-white overflow-hidden">
      {/* Particle Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {particles.map((particle, i) => (
          <ParticleDot key={i} style={particle} />
        ))}
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#5D3A1A]/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {(customization.logoUrl || panel?.logo_url) && (
              <img src={customization.logoUrl || panel?.logo_url} alt={panelName} className="h-10 w-10 rounded-lg object-cover" />
            )}
            <h1 className="text-xl font-bold text-white">{panelName}</h1>
          </div>
          <div className="flex items-center gap-4">
            <LowVisionToggle accessibilitySettings={accessibilitySettings} panelId={panel?.id} variant="dark" />
            <nav className="hidden md:flex items-center gap-6">
              <a href="#services" className="text-sm text-white/80 hover:text-white transition-colors">Services</a>
              <a href="#features" className="text-sm text-white/80 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm text-white/80 hover:text-white transition-colors">How It Works</a>
            </nav>
            <Button className="bg-white text-[#5D3A1A] hover:bg-white/90" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Floating Social Icons */}
        <FloatingSocialIcon className="top-32 right-[10%]" delay={0}>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-2xl transform rotate-12">
            <span className="text-3xl">f</span>
          </div>
        </FloatingSocialIcon>
        <FloatingSocialIcon className="top-48 left-[15%]" delay={0.5}>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400 flex items-center justify-center shadow-2xl transform -rotate-6">
            <span className="text-2xl">📸</span>
          </div>
        </FloatingSocialIcon>
        <FloatingSocialIcon className="bottom-40 right-[20%]" delay={1}>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-2xl transform rotate-6">
            <span className="text-xl">▶</span>
          </div>
        </FloatingSocialIcon>
        <FloatingSocialIcon className="top-60 right-[30%]" delay={1.5}>
          <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center shadow-2xl transform -rotate-12">
            <span className="text-xl">🎵</span>
          </div>
        </FloatingSocialIcon>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Badge className="mb-6 bg-white/20 text-white border-0 backdrop-blur-sm px-4 py-2">
                #1 Top-Rated SMM Panel
              </Badge>
            </motion.div>
            
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-7xl font-bold mb-4">
              <span className="text-white">Where </span>
              <span className="text-amber-300">Growth</span>
              <br />
              <span className="text-white">Meet Grace</span>
            </motion.h1>
            
            <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl text-white/80 mb-10 max-w-xl leading-relaxed">
              {heroSubtitle}
            </motion.p>
            
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-white text-[#5D3A1A] hover:bg-white/90 text-lg px-8 py-6 rounded-full shadow-xl" asChild>
                <Link to="/register">Get started <ArrowRight className="ml-2" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6 rounded-full" asChild>
                <Link to="/services">Explore services</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-[#4A2E15]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Why Choose Us?</h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">Learn why using our panel is the best & cheapest way to get popular online.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} viewport={{ once: true }}>
                <Card className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all h-full">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-amber-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-white/60">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Can Benefit Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="text-white">Who Can </span>
              <span className="text-amber-300">Benefit</span>
              <span className="text-white"> From</span>
              <br />
              <span className="text-white">{panelName}?</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {beneficiaries.map((item, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} viewport={{ once: true }}>
                <Card className="p-6 text-center bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all h-full">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-4 shadow-lg">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-white/60 text-sm">{item.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-[#4A2E15]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-white mb-4">Our Services</h2>
            <p className="text-white/70 text-lg">Browse our wide range of social media services</p>
          </div>

          <div className="mb-8">
            <KanbanServiceCategories categories={categories} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} primaryColor={primaryColor} variant="dark" />
          </div>

          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input placeholder="Search services..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40" />
            </div>
          </div>

          {filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredServices.slice(0, 8).map((service, index) => (
                <motion.div key={service.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} viewport={{ once: true }}>
                  <Card className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all h-full">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-4 text-xl">
                      {service.image_url?.startsWith('icon:') ? service.image_url.replace('icon:', '') : '📦'}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{service.name}</h3>
                    <p className="text-white/60 text-sm mb-3 line-clamp-2">{service.description}</p>
                    <div className="text-amber-400 font-semibold mb-4">${service.price}/1K</div>
                    <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white" asChild>
                      <Link to={`/order?service=${service.id}`}>Order Now</Link>
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-white/60">No services available yet.</div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-white/70 text-lg">Get started in 4 simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {howItWorks.map((step, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} viewport={{ once: true }}>
                <Card className="p-6 text-center bg-white/5 backdrop-blur-sm border border-white/10 h-full relative">
                  <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-4 text-xl font-bold text-white shadow-lg">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-white/60 text-sm">{step.description}</p>
                  {index < howItWorks.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 w-6 text-amber-400">→</div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#4A2E15]">
        <div className="container mx-auto px-4">
          <Card className="p-12 bg-gradient-to-r from-amber-600/30 to-orange-600/30 border border-amber-500/30 text-center backdrop-blur-sm">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Grow Your Social Media?</h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">Join thousands of satisfied customers and start your growth journey today!</p>
            <Button size="lg" className="bg-white text-[#5D3A1A] hover:bg-white/90 text-lg px-10 py-6 rounded-full shadow-xl" asChild>
              <Link to="/register">🚀 Get Started Now <ArrowRight className="ml-2" /></Link>
            </Button>
          </Card>
        </div>
      </section>

      {/* WhatsApp & Telegram Floating Buttons */}
      <div className="fixed bottom-6 left-6 z-50">
        <motion.a
          href="https://wa.me/"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
        >
          <span className="text-2xl text-white">💬</span>
        </motion.a>
      </div>
      <div className="fixed bottom-6 right-6 z-50">
        <motion.a
          href="https://t.me/"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="w-14 h-14 rounded-full bg-sky-500 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
        >
          <span className="text-2xl text-white">✈️</span>
        </motion.a>
      </div>

      <StorefrontFooter panelName={panelName} footerAbout={customization.footerAbout} footerText={customization.footerText} socialPlatforms={socialPlatforms} primaryColor={primaryColor} variant="dark" />
    </div>
  );
};
