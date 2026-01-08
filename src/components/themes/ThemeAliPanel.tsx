import { motion } from 'framer-motion';
import { StorefrontNavigation } from '@/components/storefront/StorefrontNavigation';
import { StorefrontFooter } from '@/components/storefront/StorefrontFooter';
import { StorefrontFAQSection } from '@/components/storefront/StorefrontFAQSection';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Star, Users, TrendingUp, Instagram, Youtube, MessageCircle, Music, Send } from 'lucide-react';

interface ThemeAliPanelProps {
  panel: any;
  services: any[];
  customization?: any;
  isPreview?: boolean;
}

export function ThemeAliPanel({ panel, services, customization, isPreview }: ThemeAliPanelProps) {
  const design = customization || panel?.custom_branding || {};

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const servicePills = [
    { icon: Instagram, label: 'Instagram Followers', color: 'from-pink-500 to-purple-600' },
    { icon: Youtube, label: 'YouTube Views', color: 'from-red-500 to-red-600' },
    { icon: MessageCircle, label: 'Telegram Members', color: 'from-blue-400 to-blue-600' },
    { icon: Music, label: 'TikTok Likes', color: 'from-pink-400 to-cyan-400' },
    { icon: Send, label: 'Premium Followers', color: 'from-amber-400 to-orange-500' },
  ];

  const stats = design.stats || [
    { value: '50K+', label: 'Active Users' },
    { value: '5M+', label: 'Orders Delivered' },
    { value: '99.9%', label: 'Uptime' },
    { value: '24/7', label: 'Support' },
  ];

  const features = [
    { icon: Zap, title: 'Lightning Fast', description: 'Orders start instantly after payment' },
    { icon: Star, title: 'Premium Quality', description: 'High-quality real engagement' },
    { icon: Users, title: 'Mass Orders', description: 'Bulk ordering for agencies' },
    { icon: TrendingUp, title: 'Analytics', description: 'Track your growth in real-time' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white overflow-hidden">
      <style>{`
        .ali-gradient {
          background: linear-gradient(135deg, #FF6B35 0%, #EC4899 50%, #8B5CF6 100%);
        }
        .ali-text-gradient {
          background: linear-gradient(135deg, #FF6B35 0%, #EC4899 50%, #8B5CF6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .ali-glow {
          box-shadow: 0 0 60px rgba(236, 72, 153, 0.3), 0 0 100px rgba(139, 92, 246, 0.2);
        }
        .ali-card {
          background: linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
          border: 1px solid rgba(236, 72, 153, 0.2);
        }
        .floating-icon {
          filter: drop-shadow(0 10px 20px rgba(0,0,0,0.4));
        }
      `}</style>

      {/* Navigation */}
      {!isPreview && (
        <StorefrontNavigation 
          panel={panel} 
          customization={{
            ...design,
            backgroundColor: '#0A0A0F',
            primaryColor: '#EC4899',
          }}
        />
      )}

      {/* Hero Section - Gradient with Floating Icons */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0F] via-[#1a0a1a] to-[#0A0A0F]" />
        
        {/* Animated Gradient Orbs */}
        <motion.div 
          className="absolute top-20 left-10 w-72 h-72 rounded-full bg-gradient-to-r from-[#FF6B35]/20 to-[#EC4899]/20 blur-[80px]"
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-gradient-to-r from-[#8B5CF6]/20 to-[#EC4899]/20 blur-[100px]"
          animate={{ x: [0, -30, 0], y: [0, -50, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
        />

        {/* Floating Social Icons */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div 
            className="absolute top-1/4 left-[10%] floating-icon"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-2xl">
              <Instagram className="w-8 h-8 text-white" />
            </div>
          </motion.div>
          <motion.div 
            className="absolute top-1/3 right-[15%] floating-icon"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-2xl">
              <Youtube className="w-7 h-7 text-white" />
            </div>
          </motion.div>
          <motion.div 
            className="absolute bottom-1/3 left-[15%] floating-icon"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-2xl">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
          </motion.div>
          <motion.div 
            className="absolute bottom-1/4 right-[10%] floating-icon"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-400 to-cyan-400 flex items-center justify-center shadow-2xl">
              <Music className="w-7 h-7 text-white" />
            </div>
          </motion.div>
        </div>

        {/* Hero Content */}
        <motion.div 
          className="relative z-10 max-w-6xl mx-auto px-6 text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-6">
            <span className="inline-flex items-center gap-2 px-5 py-2 ali-card rounded-full text-sm">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="ali-text-gradient font-semibold">#1 SMM Panel Worldwide</span>
            </span>
          </motion.div>

          {/* Main Title */}
          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight"
          >
            <span className="text-white">Grow Your</span>
            <br />
            <span className="ali-text-gradient">Social Empire</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            variants={itemVariants}
            className="text-xl md:text-2xl text-gray-400 mb-8 max-w-2xl mx-auto"
          >
            {design.heroSubtitle || 'Premium followers, likes & views for all platforms. Instant delivery, unbeatable prices.'}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="ali-gradient text-white font-bold px-10 py-7 text-lg rounded-2xl ali-glow transition-all hover:scale-105 border-0"
            >
              Start Growing Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-[#EC4899]/50 text-white hover:bg-[#EC4899]/10 px-10 py-7 text-lg rounded-2xl"
            >
              View All Services
            </Button>
          </motion.div>

          {/* Service Pills */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-wrap justify-center gap-3"
          >
            {servicePills.map((pill, i) => (
              <motion.div
                key={i}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${pill.color} text-white text-sm font-medium shadow-lg`}
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <pill.icon className="w-4 h-4" />
                {pill.label}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-[#0d0d12]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat: any, i: number) => (
              <motion.div
                key={i}
                className="text-center p-6 ali-card rounded-2xl"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-4xl md:text-5xl font-black ali-text-gradient">{stat.value}</div>
                <div className="text-gray-400 mt-2">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Why <span className="ali-text-gradient">Choose Us?</span>
            </h2>
            <p className="text-gray-400 text-lg">The most trusted SMM panel for serious growth</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                className="p-6 ali-card rounded-2xl group hover:border-[#EC4899]/50 transition-all"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="w-14 h-14 ali-gradient rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
                <p className="text-gray-500">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="relative p-10 md:p-16 rounded-3xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            {/* Gradient Background */}
            <div className="absolute inset-0 ali-gradient opacity-90" />
            <div className="absolute inset-0 bg-black/20" />
            
            <div className="relative z-10 text-center">
              <h2 className="text-3xl md:text-5xl font-black mb-4 text-white">
                Ready to Go Viral?
              </h2>
              <p className="text-white/80 mb-8 max-w-xl mx-auto text-lg">
                Join over 50,000 creators and businesses growing with our premium services.
              </p>
              <Button size="lg" className="bg-white text-[#EC4899] font-bold px-10 py-7 text-lg rounded-2xl hover:bg-gray-100 transition-all hover:scale-105">
                Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      {design.enableFAQs !== false && (
        <StorefrontFAQSection 
          customization={{
            ...design,
            primaryColor: '#EC4899',
            backgroundColor: '#0A0A0F',
          }}
        />
      )}

      {/* Footer */}
      <StorefrontFooter 
        panelName={panel?.name || 'SMM Panel'}
        footerAbout={design.footerAbout}
        footerText={design.footerText}
        primaryColor="#EC4899"
        variant="dark"
      />
    </div>
  );
}

export default ThemeAliPanel;
