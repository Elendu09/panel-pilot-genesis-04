import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, ChevronRight, Zap, Shield, Clock, Users, 
  Star, ArrowRight, Play, CheckCircle, Flame, TrendingUp,
  Instagram, Youtube, Twitter, MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface SMMStayHomepageProps {
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

// SMMStay Theme: Dark with neon pink/purple, bold uppercase, high-energy
export const SMMStayHomepage = ({ 
  panelName = 'SMM Panel', 
  services = [], 
  stats,
  customization,
  logoUrl 
}: SMMStayHomepageProps) => {
  const primary = customization?.primaryColor || '#FF4081';
  const secondary = customization?.secondaryColor || '#E040FB';
  const bgColor = customization?.backgroundColor || '#000000';
  const textCol = customization?.textColor || '#FFFFFF';
  const surfaceColor = customization?.surfaceColor || '#0A0A0A';
  const heroTitle = customization?.heroTitle || 'Dominate';
  const heroSubtitle = customization?.heroSubtitle || 'Premium followers, likes & views at unbeatable prices';
  const displayLogo = customization?.logoUrl || logoUrl;

  const features = [
    { title: 'INSTANT START', desc: 'Orders begin within seconds', icon: Zap },
    { title: 'PREMIUM QUALITY', desc: 'Real accounts only', icon: Star },
    { title: '24/7 SUPPORT', desc: 'Always here for you', icon: Users },
    { title: 'REFILL GUARANTEE', desc: 'Drop protection included', icon: Shield },
  ];

  const platforms = [
    { name: 'Instagram', icon: Instagram, color: '#E4405F' },
    { name: 'YouTube', icon: Youtube, color: '#FF0000' },
    { name: 'Twitter', icon: Twitter, color: '#1DA1F2' },
    { name: 'Telegram', icon: MessageCircle, color: '#0088cc' },
  ];

  return (
    <div className="min-h-screen font-montserrat overflow-hidden" style={{ backgroundColor: bgColor, color: textCol }}>
      {/* Neon Grid Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{ background: `radial-gradient(circle at center, ${primary}26 0%, transparent 50%)` }} />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `linear-gradient(${primary}1a 1px, transparent 1px), linear-gradient(90deg, ${primary}1a 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 py-4" style={{ borderBottom: `1px solid ${primary}33` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(to bottom right, ${primary}, ${secondary})` }}>
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <div className="absolute inset-0 rounded-lg blur-lg opacity-50" style={{ backgroundColor: primary }} />
              </div>
              <span className="text-xl font-black uppercase tracking-wider">{panelName}</span>
            </Link>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild className="font-bold uppercase text-white hover:bg-white/10">
                <Link to="/auth">Login</Link>
              </Button>
              <Button size="sm" asChild className="font-black uppercase text-white shadow-lg hover:opacity-90"
                style={{ background: `linear-gradient(to right, ${primary}, ${secondary})`, boxShadow: `0 0 30px ${primary}66` }}>
                <Link to="/auth?tab=signup">Join Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <motion.div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase mb-6">
            <span style={{ background: `linear-gradient(to right, ${primary}, ${secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{heroTitle}</span>
            <br />
            <span>Social Media</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto uppercase tracking-wide">{heroSubtitle}</p>
          <Button size="lg" asChild className="font-black uppercase text-lg px-10 text-white shadow-xl hover:opacity-90"
            style={{ background: `linear-gradient(to right, ${primary}, ${secondary})`, boxShadow: `0 0 40px ${primary}66` }}>
            <Link to="/services">Get Started <ArrowRight className="w-5 h-5 ml-2" /></Link>
          </Button>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-16" style={{ borderTop: `1px solid ${primary}1a`, borderBottom: `1px solid ${primary}1a` }}>
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'USERS', value: stats?.totalUsers || '10K+' },
            { label: 'ORDERS', value: stats?.totalOrders || '50K+' },
            { label: 'SERVICES', value: stats?.servicesCount || '500+' },
            { label: 'UPTIME', value: '99.9%' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-black mb-1" style={{ background: `linear-gradient(to right, ${primary}, ${secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{stat.value}</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
              className="p-6 rounded-xl text-center" style={{ backgroundColor: surfaceColor, border: `1px solid ${primary}1a` }}>
              <div className="w-12 h-12 rounded-lg mx-auto mb-4 flex items-center justify-center" style={{ background: `linear-gradient(to bottom right, ${primary}, ${secondary})` }}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-black uppercase mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-400">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12" style={{ borderTop: `1px solid ${primary}1a` }}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-gray-500">© 2024 {panelName}. All rights reserved.</span>
          <div className="flex gap-6 text-sm">
            <Link to="/terms" className="text-gray-500 hover:text-white">Terms</Link>
            <Link to="/privacy" className="text-gray-500 hover:text-white">Privacy</Link>
            <Link to="/support" className="text-gray-500 hover:text-white">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SMMStayHomepage;
