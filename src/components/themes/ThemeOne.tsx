import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Shield, TrendingUp, Users, Star, PlayCircle, Clock, Headphones, CreditCard, CheckCircle, Search } from "lucide-react";
import { ShiningButton } from "@/components/ui/shining-button";
import { motion } from "framer-motion";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";
import { LowVisionToggle } from "@/components/storefront/LowVisionToggle";
import { KanbanServiceCategories } from "@/components/storefront/KanbanServiceCategories";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface ThemeOneProps {
  panel?: any;
  services?: any[];
  customization?: any;
}

// Social Media Icons for floating effect
const SocialIcon = ({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
  <motion.div
    initial={{ y: 0 }}
    animate={{ y: [-8, 8, -8] }}
    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    className={`absolute w-12 h-12 rounded-xl bg-gradient-to-br shadow-lg flex items-center justify-center text-white text-xl ${className}`}
    style={style}
  >
    {children}
  </motion.div>
);

export const ThemeOne = ({ panel, services = [], customization = {} }: ThemeOneProps) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dynamic customization values
  const panelName = customization.companyName || panel?.name || 'SMM Panel';
  const primaryColor = customization.primaryColor || panel?.primary_color || '#8B5CF6';
  const secondaryColor = customization.secondaryColor || '#EC4899';
  const backgroundColor = customization.backgroundColor || '#0a0a1a';
  const surfaceColor = customization.surfaceColor || '#1a1a2e';
  const textColor = customization.textColor || '#FFFFFF';
  const fontFamily = customization.fontFamily || 'Inter, system-ui, sans-serif';
  const borderRadius = customization.borderRadius || '12';
  const heroTitle = customization.heroTitle || 'Grow Your Social Media';
  const heroSubtitle = customization.heroSubtitle || 'The #1 SMM Panel for Instagram, TikTok, YouTube and Telegram. Get real followers, likes, and views with instant delivery.';
  const socialPlatforms = customization.socialPlatforms || [];
  const accessibilitySettings = customization.accessibilitySettings;

  // Build categories from services
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
    const matchesSearch = service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = [
    { label: "Active Users", value: "50K+", icon: Users },
    { label: "Orders Completed", value: "2M+", icon: TrendingUp },
    { label: "Success Rate", value: "99.9%", icon: Star },
    { label: "Services Available", value: `${services.length || '500'}+`, icon: Zap }
  ];

  const defaultServices = [
    { category: "Instagram", icon: "📸", gradient: "from-pink-500 to-purple-500", services: ["Premium Followers", "Real Likes", "Story Views", "Comments"], price: "From $0.01" },
    { category: "YouTube", icon: "🎥", gradient: "from-red-500 to-red-600", services: ["Subscribers", "Views", "Watch Hours", "Likes"], price: "From $0.05" },
    { category: "TikTok", icon: "🎵", gradient: "from-gray-900 to-pink-500", services: ["Followers", "Likes", "Views", "Shares"], price: "From $0.02" },
    { category: "Telegram", icon: "✈️", gradient: "from-blue-400 to-blue-600", services: ["Members", "Post Views", "Reactions", "Comments"], price: "From $0.03" }
  ];

  const benefits = [
    { icon: Zap, title: "Instant Start", description: "Orders begin within seconds" },
    { icon: Shield, title: "No Password", description: "100% safe and secure" },
    { icon: CreditCard, title: "Money Back", description: "Full refund guarantee" },
    { icon: Headphones, title: "24/7 Support", description: "Always here to help" },
  ];

  // Create CSS variables for dynamic theming
  const themeStyles = {
    '--theme-primary': primaryColor,
    '--theme-secondary': secondaryColor,
    '--theme-bg': backgroundColor,
    '--theme-surface': surfaceColor,
    '--theme-text': textColor,
    '--theme-radius': `${borderRadius}px`,
    '--theme-font': fontFamily,
  } as React.CSSProperties;

  return (
    <div 
      className="min-h-screen text-white overflow-hidden"
      style={{ 
        backgroundColor, 
        fontFamily,
        color: textColor,
        ...themeStyles,
      }}
    >
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/10" style={{ backgroundColor: `${backgroundColor}CC` }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {(customization.logoUrl || panel?.logo_url) && (
              <img src={customization.logoUrl || panel?.logo_url} alt={panelName} className="h-10 w-10 object-cover" style={{ borderRadius: `${borderRadius}px` }} />
            )}
            <div>
              <h1 className="text-xl font-bold" style={{ color: textColor }}>{panelName}</h1>
              <p className="text-sm hidden sm:block" style={{ color: `${textColor}99` }}>{customization.tagline || 'Premium SMM Services'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LowVisionToggle accessibilitySettings={accessibilitySettings} panelId={panel?.id} variant="dark" />
            <nav className="hidden md:flex items-center gap-6">
              <a href="#services" className="text-sm transition-colors" style={{ color: `${textColor}CC` }}>Services</a>
              <a href="#features" className="text-sm transition-colors" style={{ color: `${textColor}CC` }}>Features</a>
              <a href="#faq" className="text-sm transition-colors" style={{ color: `${textColor}CC` }}>FAQ</a>
            </nav>
            <ShiningButton gradient="rainbow" size="sm" asChild style={{ borderRadius: `${borderRadius}px` }}>
              <Link to="/login">Login</Link>
            </ShiningButton>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-[#0a0a1a] to-pink-900/30" />
        
        {/* Floating Social Icons */}
        <SocialIcon className="from-pink-500 to-rose-600 top-32 left-[10%]" style={{ animationDelay: "0s" }}>📸</SocialIcon>
        <SocialIcon className="from-blue-500 to-cyan-500 top-48 right-[15%]" style={{ animationDelay: "0.5s" }}>✈️</SocialIcon>
        <SocialIcon className="from-red-500 to-red-600 bottom-32 left-[20%]" style={{ animationDelay: "1s" }}>🎥</SocialIcon>
        <SocialIcon className="from-purple-500 to-pink-500 top-20 right-[25%]" style={{ animationDelay: "1.5s" }}>🎵</SocialIcon>
        <SocialIcon className="from-green-500 to-emerald-500 bottom-40 right-[10%]" style={{ animationDelay: "2s" }}>💬</SocialIcon>
        <SocialIcon className="from-blue-600 to-blue-700 bottom-20 left-[5%]" style={{ animationDelay: "2.5s" }}>👥</SocialIcon>
        
        {/* Glow Effects */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-[100px]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap justify-center gap-3 mb-8">
              {["Premium Followers", "Bot Starts", "Post Views", "Reactions"].map((tag, i) => (
                <Badge key={tag} variant="secondary" className="px-4 py-2 text-sm bg-white/10 backdrop-blur-sm border border-white/20 text-white">
                  {tag}
                </Badge>
              ))}
            </motion.div>
            
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-5xl md:text-7xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">{heroTitle.split(' ').slice(0, 2).join(' ')}</span>
              <br />
              <span className="text-white">{heroTitle.split(' ').slice(2).join(' ') || 'Social Media'}</span>
            </motion.h1>
            
            <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              {heroSubtitle}
            </motion.p>
            
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <ShiningButton gradient="rainbow" size="lg" className="text-lg px-10 py-6 shadow-2xl" style={{ borderRadius: `${borderRadius}px`, boxShadow: `0 25px 50px -12px ${primaryColor}40` }} asChild>
                <Link to="/services">⚡ Fast Order <ArrowRight className="ml-2 w-5 h-5" /></Link>
              </ShiningButton>
              <Button asChild variant="outline" size="lg" className="text-lg px-10 py-6 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm" style={{ borderRadius: `${borderRadius}px` }}>
                <Link to="/register"><PlayCircle className="mr-2" /> Create Account</Link>
              </Button>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <Card key={index} className="p-5 bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/30 transition-all group hover:bg-white/10" style={{ borderRadius: `${borderRadius}px` }}>
                  <div className="flex items-center justify-center mb-3">
                    <div className="w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`, borderRadius: `${borderRadius}px` }}>
                      <stat.icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold mb-1" style={{ color: textColor }}>{stat.value}</div>
                  <div className="text-sm" style={{ color: `${textColor}99` }}>{stat.label}</div>
                </Card>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16" style={{ background: `linear-gradient(180deg, transparent, ${primaryColor}20)` }}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3 p-4 backdrop-blur-sm border border-white/10" style={{ backgroundColor: `${surfaceColor}80`, borderRadius: `${borderRadius}px` }}>
                <div className="w-10 h-10 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${primaryColor}50, ${secondaryColor}50)`, borderRadius: `${borderRadius}px` }}>
                  <benefit.icon className="w-5 h-5" style={{ color: primaryColor }} />
                </div>
                <div>
                  <div className="font-semibold text-sm" style={{ color: textColor }}>{benefit.title}</div>
                  <div className="text-xs" style={{ color: `${textColor}80` }}>{benefit.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section with Kanban Categories */}
      <section id="services" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <Badge variant="secondary" className="mb-4 px-4 py-1 border-0" style={{ backgroundColor: `${primaryColor}30`, color: primaryColor }}>Our Services</Badge>
            <h2 className="text-4xl font-bold mb-4" style={{ color: textColor }}>Popular Services</h2>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: `${textColor}99` }}>Choose from our wide range of social media marketing services</p>
          </div>

          {/* Kanban Categories */}
          <div className="mb-8">
            <KanbanServiceCategories 
              categories={categories} 
              selectedCategory={selectedCategory} 
              onSelectCategory={setSelectedCategory}
              variant="dark"
              primaryColor={primaryColor}
            />
          </div>

          {/* Search */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: `${textColor}60` }} />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-white/10 placeholder:text-gray-500"
                style={{ backgroundColor: `${surfaceColor}80`, color: textColor, borderRadius: `${borderRadius}px` }}
              />
            </div>
          </div>
          
          {/* Services Grid */}
          {filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredServices.slice(0, 8).map((service, index) => (
                <motion.div key={service.id || index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} viewport={{ once: true }}>
                  <Card className="p-6 bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/30 transition-all group hover:bg-white/10 h-full" style={{ borderRadius: `${borderRadius}px` }}>
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`, borderRadius: `${borderRadius}px` }}>
                        {service.image_url?.startsWith('icon:') ? service.image_url.replace('icon:', '') : '📦'}
                      </div>
                      <h3 className="text-lg font-bold mb-2 line-clamp-2" style={{ color: textColor }}>{service.name}</h3>
                      <p className="text-sm mb-4 line-clamp-2" style={{ color: `${textColor}80` }}>{service.description || 'High quality service'}</p>
                      <div className="text-lg font-semibold mb-4" style={{ background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        ${service.price}/1K
                      </div>
                      <ShiningButton gradient="primary" className="w-full" style={{ borderRadius: `${borderRadius}px` }} asChild>
                        <Link to={`/order?service=${service.id}`}>Order Now</Link>
                      </ShiningButton>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {defaultServices.map((service, index) => (
                <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} viewport={{ once: true }}>
                  <Card className="p-6 bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/30 transition-all group hover:bg-white/10 h-full" style={{ borderRadius: `${borderRadius}px` }}>
                    <div className="text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${service.gradient} flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform`} style={{ borderRadius: `${borderRadius}px` }}>
                        {service.icon}
                      </div>
                      <h3 className="text-xl font-bold mb-3" style={{ color: textColor }}>{service.category}</h3>
                      <div className="space-y-2 mb-4">
                        {service.services.map((item, i) => (
                          <div key={i} className="flex items-center justify-center gap-2 text-sm" style={{ color: `${textColor}80` }}>
                            <CheckCircle className="w-3 h-3" style={{ color: '#22c55e' }} />{item}
                          </div>
                        ))}
                      </div>
                      <div className="text-lg font-semibold mb-4" style={{ background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{service.price}</div>
                      <ShiningButton gradient="primary" className="w-full" style={{ borderRadius: `${borderRadius}px` }} asChild>
                        <Link to="/services">Order Now</Link>
                      </ShiningButton>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12" style={{ color: `${textColor}80` }}>No services found matching your criteria.</div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20" style={{ background: `linear-gradient(180deg, ${primaryColor}20, transparent)` }}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="p-8 backdrop-blur-md border hover:scale-[1.02] transition-transform" style={{ background: `linear-gradient(135deg, ${primaryColor}30, transparent)`, borderColor: `${primaryColor}50`, borderRadius: `${borderRadius}px` }}>
              <Zap className="h-12 w-12 mb-4" style={{ color: primaryColor }} />
              <h3 className="text-2xl font-bold mb-4" style={{ color: textColor }}>Lightning Fast</h3>
              <p style={{ color: `${textColor}80` }}>Get your orders processed and delivered within minutes. Our automated system ensures rapid delivery.</p>
            </Card>
            <Card className="p-8 backdrop-blur-md border hover:scale-[1.02] transition-transform" style={{ background: `linear-gradient(135deg, ${secondaryColor}30, transparent)`, borderColor: `${secondaryColor}50`, borderRadius: `${borderRadius}px` }}>
              <Shield className="h-12 w-12 mb-4" style={{ color: secondaryColor }} />
              <h3 className="text-2xl font-bold mb-4" style={{ color: textColor }}>100% Secure</h3>
              <p style={{ color: `${textColor}80` }}>Your account safety is our priority. We use the safest methods and never ask for your passwords.</p>
            </Card>
            <Card className="p-8 backdrop-blur-md border hover:scale-[1.02] transition-transform" style={{ background: `linear-gradient(135deg, ${primaryColor}30, transparent)`, borderColor: `${primaryColor}50`, borderRadius: `${borderRadius}px` }}>
              <Users className="h-12 w-12 mb-4" style={{ color: primaryColor }} />
              <h3 className="text-2xl font-bold mb-4" style={{ color: textColor }}>24/7 Support</h3>
              <p style={{ color: `${textColor}80` }}>Our dedicated support team is available round the clock to help you with any questions or issues.</p>
            </Card>
          </div>
        </div>
      </section>

      <StorefrontFooter 
        panelName={panelName}
        footerAbout={customization.footerAbout}
        footerText={customization.footerText}
        socialPlatforms={socialPlatforms}
        primaryColor={primaryColor}
        variant="dark"
      />
    </div>
  );
};
