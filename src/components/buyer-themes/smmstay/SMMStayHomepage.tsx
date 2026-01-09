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
  // Use customization colors or fallback to theme defaults
  const primaryColor = customization?.primaryColor || '#FF4081';
  const secondaryColor = customization?.secondaryColor || '#E040FB';
  const heroTitle = customization?.heroTitle || 'Dominate';
  const heroSubtitle = customization?.heroSubtitle || 'Premium followers, likes & views at unbeatable prices';
  const displayLogo = customization?.logoUrl || logoUrl;
  const features = [
    { title: 'INSTANT START', desc: 'Orders begin within seconds', icon: Zap },
    { title: 'PREMIUM QUALITY', desc: 'Real accounts only', icon: Star },
    { title: '24/7 SUPPORT', desc: 'Always here for you', icon: Users },
    { title: 'REFILL GUARANTEE', desc: 'Drop protection included', icon: Shield },
  ];

  const liveOrders = [
    { service: 'Instagram Followers', qty: 5000, time: '2s ago' },
    { service: 'TikTok Likes', qty: 10000, time: '5s ago' },
    { service: 'YouTube Views', qty: 25000, time: '8s ago' },
    { service: 'Twitter Followers', qty: 2000, time: '12s ago' },
  ];

  const platforms = [
    { name: 'Instagram', icon: Instagram, color: '#E4405F' },
    { name: 'YouTube', icon: Youtube, color: '#FF0000' },
    { name: 'Twitter', icon: Twitter, color: '#1DA1F2' },
    { name: 'Telegram', icon: MessageCircle, color: '#0088cc' },
  ];

  return (
    <div className="min-h-screen bg-black text-white font-montserrat overflow-hidden">
      {/* Neon Grid Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,64,129,0.15)_0%,_transparent_50%)]" />
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,64,129,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,64,129,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 py-4 border-b border-[#FF4081]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF4081] to-[#E040FB] flex items-center justify-center">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <div className="absolute inset-0 rounded-lg bg-[#FF4081] blur-lg opacity-50" />
              </div>
              <span className="text-xl font-black uppercase tracking-wider text-white">
                {panelName}
              </span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <Link to="/services" className="text-sm font-bold uppercase tracking-wider text-gray-400 hover:text-[#FF4081] transition-colors">
                Services
              </Link>
              <Link to="/orders" className="text-sm font-bold uppercase tracking-wider text-gray-400 hover:text-[#FF4081] transition-colors">
                Orders
              </Link>
              <Link to="/support" className="text-sm font-bold uppercase tracking-wider text-gray-400 hover:text-[#FF4081] transition-colors">
                Support
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" asChild
                className="border-[#FF4081] text-[#FF4081] hover:bg-[#FF4081]/10 font-bold uppercase tracking-wider rounded-none">
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button size="sm" asChild
                className="bg-[#FF4081] text-white font-bold uppercase tracking-wider rounded-none shadow-[0_0_20px_rgba(255,64,129,0.5)] hover:shadow-[0_0_30px_rgba(255,64,129,0.7)]">
                <Link to="/auth?tab=signup">Join Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-5xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 border border-[#FF4081] mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-[#FF4081] animate-pulse" />
              <span className="text-sm font-bold uppercase tracking-widest text-[#FF4081]">
                #1 SMM Provider
              </span>
            </motion.div>

            {/* Outlined Text Heading */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase leading-none mb-8">
              <span 
                className="block"
                style={{
                  WebkitTextStroke: '2px #FF4081',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Dominate
              </span>
              <span className="block bg-gradient-to-r from-[#FF4081] via-[#FF80AB] to-[#E040FB] bg-clip-text text-transparent">
                Social Media
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto uppercase tracking-wide">
              Premium followers, likes & views at unbeatable prices
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild
                className="bg-gradient-to-r from-[#FF4081] to-[#E040FB] text-white font-black uppercase tracking-widest text-lg px-10 rounded-none shadow-[0_0_30px_rgba(255,64,129,0.5)] hover:shadow-[0_0_50px_rgba(255,64,129,0.7)]">
                <Link to="/services" className="flex items-center gap-2">
                  Get Started <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild
                className="border-2 border-[#E040FB] text-[#E040FB] hover:bg-[#E040FB]/10 font-bold uppercase tracking-wider rounded-none">
                <Link to="/auth">View Prices</Link>
              </Button>
            </div>
          </motion.div>

          {/* Animated Stats */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto"
          >
            {[
              { value: stats?.totalOrders || '500K+', label: 'ORDERS' },
              { value: stats?.totalUsers || '50K+', label: 'USERS' },
              { value: '99.9%', label: 'UPTIME' },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
              >
                <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-[#FF4081] to-[#E040FB] bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mt-2">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Live Orders Ticker */}
      <section className="py-8 border-y border-[#FF4081]/20 overflow-hidden bg-black/50">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...liveOrders, ...liveOrders].map((order, idx) => (
            <div key={idx} className="inline-flex items-center gap-3 mx-8">
              <div className="w-2 h-2 rounded-full bg-[#FF4081] animate-pulse" />
              <span className="text-sm font-bold text-white">{order.service}</span>
              <span className="text-sm text-[#FF4081]">+{order.qty.toLocaleString()}</span>
              <span className="text-xs text-gray-500">{order.time}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Platforms */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-wider">
              <span className="text-white">All </span>
              <span className="text-[#FF4081]">Platforms</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {platforms.map((platform, idx) => (
              <motion.div
                key={platform.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="relative group"
              >
                <div className="p-8 border-2 border-[#FF4081]/20 hover:border-[#FF4081] transition-all bg-black/50">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FF4081]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div 
                    className="w-16 h-16 rounded-lg flex items-center justify-center mb-4 mx-auto"
                    style={{ backgroundColor: `${platform.color}20` }}
                  >
                    <platform.icon className="w-8 h-8" style={{ color: platform.color }} />
                  </div>
                  <h3 className="text-center font-bold uppercase tracking-wider text-white">
                    {platform.name}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-wider">
              <span className="text-white">Why </span>
              <span className="text-[#FF4081]">Choose Us</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="relative group"
              >
                <div className="p-8 border-2 border-[#FF4081]/20 hover:border-[#FF4081] bg-black/50 transition-all h-full">
                  {/* Neon Glow on Hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute inset-0 bg-[#FF4081]/5" />
                    <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(255,64,129,0.3)]" />
                  </div>
                  
                  <div className="relative">
                    <div className="w-14 h-14 flex items-center justify-center mb-6 border-2 border-[#FF4081] bg-[#FF4081]/10">
                      <feature.icon className="w-7 h-7 text-[#FF4081]" />
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-wider text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-400">{feature.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="relative p-12 border-2 border-[#FF4081]"
          >
            {/* Neon Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#FF4081]/10 via-[#E040FB]/10 to-[#FF4081]/10" />
            <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(255,64,129,0.2)]" />
            
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-wider mb-4">
                <span className="text-white">Ready to </span>
                <span className="text-[#FF4081]">Dominate</span>
                <span className="text-white">?</span>
              </h2>
              <p className="text-gray-400 mb-8 uppercase tracking-wide">
                Join thousands of satisfied customers today
              </p>
              <Button size="lg" asChild
                className="bg-[#FF4081] text-white font-black uppercase tracking-widest text-lg px-12 rounded-none shadow-[0_0_30px_rgba(255,64,129,0.5)]">
                <Link to="/auth?tab=signup">
                  Start Now
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[#FF4081]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#FF4081]" />
              <span className="text-gray-400 uppercase tracking-wider text-sm">
                © 2024 {panelName}. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link to="/terms" className="text-gray-500 hover:text-[#FF4081] uppercase tracking-wider">Terms</Link>
              <Link to="/privacy" className="text-gray-500 hover:text-[#FF4081] uppercase tracking-wider">Privacy</Link>
              <Link to="/support" className="text-gray-500 hover:text-[#FF4081] uppercase tracking-wider">Support</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Marquee Animation */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default SMMStayHomepage;
