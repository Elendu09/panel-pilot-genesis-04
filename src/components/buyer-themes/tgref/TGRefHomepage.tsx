import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { 
  Terminal, ChevronRight, Zap, Shield, Clock, Users, 
  Star, ArrowRight, Play, CheckCircle, Globe, Cpu,
  Instagram, Youtube, Twitter, MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface TGRefHomepageProps {
  panelName?: string;
  services?: any[];
  stats?: {
    totalOrders?: number;
    totalUsers?: number;
    servicesCount?: number;
  };
  customization?: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    backgroundColor?: string;
    textColor?: string;
    surfaceColor?: string;
    logoUrl?: string;
    heroTitle?: string;
    heroSubtitle?: string;
  };
  logoUrl?: string;
}

// TGRef Theme: Terminal/Tech aesthetic with monospace fonts, teal gradients
export const TGRefHomepage = ({ 
  panelName = 'SMM Panel', 
  services = [], 
  stats,
  customization,
  logoUrl 
}: TGRefHomepageProps) => {
  // Use customization colors or fallback to theme defaults
  const primary = customization?.primaryColor || '#00D4AA';
  const secondary = customization?.secondaryColor || '#0EA5E9';
  const accent = customization?.accentColor || '#7C3AED';
  const bgColor = customization?.backgroundColor || '#1A1B26';
  const textCol = customization?.textColor || '#FFFFFF';
  const surfaceColor = customization?.surfaceColor || '#0D0E14';
  const heroTitle = customization?.heroTitle || 'Social Growth';
  const heroSubtitle = customization?.heroSubtitle || 'Execute powerful SMM commands. Instant delivery, premium quality, unbeatable prices.';
  const displayLogo = customization?.logoUrl || logoUrl;

  const platforms = [
    { name: 'Instagram', icon: Instagram, color: '#E4405F' },
    { name: 'YouTube', icon: Youtube, color: '#FF0000' },
    { name: 'Twitter', icon: Twitter, color: '#1DA1F2' },
    { name: 'Telegram', icon: MessageCircle, color: '#0088cc' },
  ];

  const features = [
    { cmd: 'instant-delivery', desc: 'Orders start within seconds', icon: Zap },
    { cmd: 'secure-payment', desc: 'Encrypted transactions', icon: Shield },
    { cmd: 'live-support', desc: '24/7 customer assistance', icon: Users },
    { cmd: 'auto-refill', desc: 'Guaranteed delivery', icon: CheckCircle },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen font-mono" style={{ backgroundColor: bgColor, color: textCol }}>
      {/* Grid Background */}
      <div className="fixed inset-0 pointer-events-none opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(${primary}1a 1px, transparent 1px),
            linear-gradient(90deg, ${primary}1a 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 backdrop-blur-xl" style={{ borderBottom: `1px solid ${primary}33` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: `linear-gradient(to bottom right, ${primary}, ${secondary})` }}>
                <Terminal className="w-5 h-5" style={{ color: bgColor }} />
              </div>
              <span className="text-lg font-bold" style={{ color: primary }}>[{panelName}]</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6">
              <Link to="/services" className="text-sm text-gray-400 transition-colors hover:opacity-80" style={{ ['--hover-color' as any]: primary }}>
                ./services
              </Link>
              <Link to="/orders" className="text-sm text-gray-400 transition-colors">
                ./orders
              </Link>
              <Link to="/support" className="text-sm text-gray-400 transition-colors">
                ./support
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" asChild className="font-mono"
                style={{ borderColor: `${primary}4d`, color: primary }}>
                <Link to="/auth">&gt; login</Link>
              </Button>
              <Button size="sm" asChild className="font-bold font-mono hover:opacity-90"
                style={{ background: `linear-gradient(to right, ${primary}, ${secondary})`, color: bgColor }}>
                <Link to="/auth?tab=signup">&gt; register</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute top-20 right-20 w-96 h-96 rounded-full blur-[100px]" style={{ backgroundColor: `${primary}33` }} />
        <div className="absolute bottom-20 left-20 w-64 h-64 rounded-full blur-[80px]" style={{ backgroundColor: `${accent}33` }} />
        
        <motion.div 
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="text-center max-w-4xl mx-auto">
            {/* Terminal Header */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
              style={{ backgroundColor: `${primary}1a`, border: `1px solid ${primary}4d` }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: primary }} />
              <span className="text-sm" style={{ color: primary }}>system.status: online</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="text-gray-400">&gt; </span>
              <span style={{ background: `linear-gradient(to right, ${primary}, ${secondary}, ${accent})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {heroTitle}
              </span>
              <br />
              <span>Made Simple</span>
              <span className="animate-pulse" style={{ color: primary }}>_</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              <span style={{ color: secondary }}>$</span> {heroSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="font-bold font-mono text-lg px-8 hover:opacity-90"
                style={{ background: `linear-gradient(to right, ${primary}, ${secondary})`, color: bgColor }}>
                <Link to="/services" className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  ./start --now
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="font-mono"
                style={{ borderColor: `${accent}80`, color: accent }}>
                <Link to="/auth" className="flex items-center gap-2">
                  <Terminal className="w-5 h-5" />
                  ./create-account
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Code Block Preview */}
          <motion.div variants={itemVariants} className="mt-16 max-w-2xl mx-auto">
            <div className="rounded-lg overflow-hidden" style={{ backgroundColor: surfaceColor, border: `1px solid ${primary}33` }}>
              <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: `1px solid ${primary}33` }}>
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-2 text-xs text-gray-500">order.sh</span>
              </div>
              <div className="p-4 font-mono text-sm">
                <div className="text-gray-500"># Quick order example</div>
                <div className="mt-2">
                  <span style={{ color: accent }}>$</span>
                  <span> smm order </span>
                  <span style={{ color: primary }}>--service</span>
                  <span className="text-yellow-400"> "Instagram Followers"</span>
                </div>
                <div>
                  <span style={{ color: accent }}>$</span>
                  <span> smm order </span>
                  <span style={{ color: primary }}>--quantity</span>
                  <span style={{ color: secondary }}> 1000</span>
                </div>
                <div className="mt-2 text-green-400">
                  ✓ Order placed successfully! ID: #SMM-28491
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16" style={{ borderTop: `1px solid ${primary}1a`, borderBottom: `1px solid ${primary}1a` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Orders Completed', value: stats?.totalOrders || '50K+', icon: CheckCircle },
              { label: 'Active Users', value: stats?.totalUsers || '10K+', icon: Users },
              { label: 'Services Available', value: stats?.servicesCount || '500+', icon: Cpu },
              { label: 'Uptime', value: '99.9%', icon: Globe },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4"
                  style={{ backgroundColor: `${primary}1a`, border: `1px solid ${primary}33` }}>
                  <stat.icon className="w-6 h-6" style={{ color: primary }} />
                </div>
                <div className="text-3xl md:text-4xl font-bold font-mono mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Platforms Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-gray-500">[</span>
              <span>Supported Platforms</span>
              <span className="text-gray-500">]</span>
            </h2>
            <p className="text-gray-400">All major social networks in one place</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {platforms.map((platform, idx) => (
              <motion.div
                key={platform.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="p-6 rounded-lg transition-all cursor-pointer group"
                style={{ backgroundColor: surfaceColor, border: `1px solid ${primary}1a` }}
              >
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${platform.color}20` }}
                >
                  <platform.icon className="w-6 h-6" style={{ color: platform.color }} />
                </div>
                <h3 className="font-bold mb-1">{platform.name}</h3>
                <p className="text-xs text-gray-500">50+ services</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Command Style */}
      <section className="py-20" style={{ backgroundColor: surfaceColor }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span style={{ color: primary }}>&gt;</span> Why Choose Us
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.cmd}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 rounded-lg transition-all group"
                style={{ border: `1px solid ${primary}1a` }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0"
                    style={{ background: `linear-gradient(to bottom right, ${primary}, ${secondary})` }}>
                    <feature.icon className="w-5 h-5" style={{ color: bgColor }} />
                  </div>
                  <div>
                    <h3 className="font-mono mb-1" style={{ color: primary }}>
                      $ {feature.cmd}
                    </h3>
                    <p className="text-gray-400 text-sm">{feature.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to <span style={{ color: primary }}>execute</span>?
            </h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Join thousands of users growing their social presence with our automated services.
            </p>
            <Button size="lg" asChild className="font-bold font-mono text-lg px-10"
              style={{ background: `linear-gradient(to right, ${primary}, ${secondary})`, color: bgColor }}>
              <Link to="/auth?tab=signup">
                &gt; ./signup --free
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12" style={{ borderTop: `1px solid ${primary}1a` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5" style={{ color: primary }} />
              <span className="font-mono text-gray-400">
                © 2024 [{panelName}] -- All rights reserved
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm font-mono">
              <Link to="/terms" className="text-gray-500 hover:opacity-80">./terms</Link>
              <Link to="/privacy" className="text-gray-500 hover:opacity-80">./privacy</Link>
              <Link to="/support" className="text-gray-500 hover:opacity-80">./support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TGRefHomepage;
