import { motion } from 'framer-motion';
import { StorefrontNavigation } from '@/components/storefront/StorefrontNavigation';
import { StorefrontFooter } from '@/components/storefront/StorefrontFooter';
import { StorefrontFAQSection } from '@/components/storefront/StorefrontFAQSection';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Shield, Users, Globe, Code, Terminal, Check } from 'lucide-react';

interface ThemeTGRefProps {
  panel: any;
  services: any[];
  customization?: any;
  isPreview?: boolean;
}

export function ThemeTGRef({ panel, services, customization, isPreview }: ThemeTGRefProps) {
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

  const stats = [
    { value: '10K+', label: 'Happy Customers' },
    { value: '1M+', label: 'Orders Completed' },
    { value: '500+', label: 'Services' },
    { value: '24/7', label: 'Support' },
  ];

  const features = [
    { icon: Zap, title: 'Instant Delivery', description: 'Orders start within minutes' },
    { icon: Shield, title: 'Secure & Safe', description: 'Your data is protected' },
    { icon: Users, title: 'Real Engagement', description: 'Quality followers & likes' },
    { icon: Globe, title: 'Global Coverage', description: 'All platforms supported' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white font-mono">
      <style>{`
        .tgref-theme {
          --tg-bg: #0A0A0F;
          --tg-surface: #111118;
          --tg-primary: #00B4D8;
          --tg-secondary: #90E0EF;
          --tg-accent: #00D4AA;
          --tg-text: #E0E0E0;
          --tg-muted: #6B7280;
        }
        .tgref-glow {
          box-shadow: 0 0 30px rgba(0, 180, 216, 0.2);
        }
        .tgref-border {
          border: 1px solid rgba(0, 180, 216, 0.3);
        }
        .terminal-text {
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
        }
      `}</style>

      {/* Navigation */}
      {!isPreview && (
        <StorefrontNavigation 
          panel={panel} 
          customization={{
            ...design,
            backgroundColor: '#0A0A0F',
            primaryColor: '#00B4D8',
          }}
        />
      )}

      {/* Hero Section - Bold Centered */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(0, 180, 216, 0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(0, 180, 216, 0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} />
        </div>

        {/* Glowing Orbs */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#00B4D8]/10 blur-[100px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-[#00D4AA]/10 blur-[80px]"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 6, repeat: Infinity }}
        />

        <motion.div 
          className="relative z-10 text-center px-6 max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Terminal-like badge */}
          <motion.div variants={itemVariants} className="mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#111118] tgref-border rounded-lg terminal-text text-sm text-[#00B4D8]">
              <Terminal className="w-4 h-4" />
              <span className="text-[#00D4AA]">$</span> init smm-services --premium
            </span>
          </motion.div>

          {/* Main Title */}
          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight"
          >
            <span className="text-white">Social Media</span>
            <br />
            <span className="bg-gradient-to-r from-[#00B4D8] to-[#00D4AA] bg-clip-text text-transparent">
              Growth Engine
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            variants={itemVariants}
            className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto terminal-text"
          >
            {design.heroSubtitle || 'Premium SMM services with instant delivery. Scale your social presence like a pro.'}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-[#00B4D8] hover:bg-[#00B4D8]/90 text-black font-bold px-8 py-6 text-lg tgref-glow transition-all hover:scale-105"
            >
              <Code className="w-5 h-5 mr-2" />
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-[#00B4D8]/50 text-[#00B4D8] hover:bg-[#00B4D8]/10 px-8 py-6 text-lg"
            >
              View Services
            </Button>
          </motion.div>

          {/* Stats Row */}
          <motion.div 
            variants={itemVariants}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map((stat, i) => (
              <div key={i} className="text-center p-4 bg-[#111118]/50 tgref-border rounded-lg">
                <div className="text-3xl md:text-4xl font-bold text-[#00B4D8] terminal-text">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-[#111118]/30">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-[#00B4D8]">&lt;</span>
              Why Choose Us
              <span className="text-[#00B4D8]">/&gt;</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Built for performance, designed for growth
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                className="p-6 bg-[#0A0A0F] tgref-border rounded-xl group hover:border-[#00B4D8]/60 transition-all"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-12 h-12 bg-[#00B4D8]/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#00B4D8]/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-[#00B4D8]" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
                <p className="text-gray-500">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing/Services CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="p-8 md:p-12 bg-gradient-to-br from-[#00B4D8]/10 to-[#00D4AA]/10 tgref-border rounded-2xl text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Scale?</h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Join thousands of satisfied customers who trust us for their social media growth.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {['Instagram', 'TikTok', 'YouTube', 'Telegram', 'Twitter'].map((platform) => (
                <span key={platform} className="px-4 py-2 bg-[#111118] tgref-border rounded-full text-sm text-gray-300">
                  <Check className="w-4 h-4 inline mr-2 text-[#00D4AA]" />
                  {platform}
                </span>
              ))}
            </div>
            <Button size="lg" className="bg-[#00B4D8] hover:bg-[#00B4D8]/90 text-black font-bold px-8">
              Explore Services <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      {design.enableFAQs !== false && (
        <StorefrontFAQSection 
          customization={{
            ...design,
            primaryColor: '#00B4D8',
            backgroundColor: '#0A0A0F',
          }}
        />
      )}

      {/* Footer */}
      <StorefrontFooter 
        panelName={panel?.name || 'SMM Panel'}
        footerAbout={design.footerAbout}
        footerText={design.footerText}
        primaryColor="#00B4D8"
        variant="dark"
      />
    </div>
  );
}

export default ThemeTGRef;
