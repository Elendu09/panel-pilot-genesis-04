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
}

// TGRef Theme: Terminal/Tech aesthetic with monospace fonts, teal gradients
export const TGRefHomepage = ({ panelName = 'SMM Panel', services = [], stats }: TGRefHomepageProps) => {
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
    <div className="min-h-screen bg-[#1A1B26] text-white font-mono">
      {/* Grid Background */}
      <div className="fixed inset-0 pointer-events-none opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 212, 170, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 212, 170, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 border-b border-[#00D4AA]/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-[#00D4AA] to-[#0EA5E9] flex items-center justify-center">
                <Terminal className="w-5 h-5 text-[#1A1B26]" />
              </div>
              <span className="text-lg font-bold text-[#00D4AA]">[{panelName}]</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6">
              <Link to="/services" className="text-sm text-gray-400 hover:text-[#00D4AA] transition-colors">
                ./services
              </Link>
              <Link to="/orders" className="text-sm text-gray-400 hover:text-[#00D4AA] transition-colors">
                ./orders
              </Link>
              <Link to="/support" className="text-sm text-gray-400 hover:text-[#00D4AA] transition-colors">
                ./support
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" asChild
                className="border-[#00D4AA]/30 text-[#00D4AA] hover:bg-[#00D4AA]/10 font-mono">
                <Link to="/auth">&gt; login</Link>
              </Button>
              <Button size="sm" asChild
                className="bg-gradient-to-r from-[#00D4AA] to-[#0EA5E9] text-[#1A1B26] font-bold font-mono hover:opacity-90">
                <Link to="/auth?tab=signup">&gt; register</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute top-20 right-20 w-96 h-96 bg-[#00D4AA]/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-[#7C3AED]/20 rounded-full blur-[80px]" />
        
        <motion.div 
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="text-center max-w-4xl mx-auto">
            {/* Terminal Header */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00D4AA]/10 border border-[#00D4AA]/30 mb-8">
              <span className="w-2 h-2 rounded-full bg-[#00D4AA] animate-pulse" />
              <span className="text-sm text-[#00D4AA]">system.status: online</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="text-gray-400">&gt; </span>
              <span className="bg-gradient-to-r from-[#00D4AA] via-[#0EA5E9] to-[#7C3AED] bg-clip-text text-transparent">
                Social Growth
              </span>
              <br />
              <span className="text-white">Made Simple</span>
              <span className="animate-pulse text-[#00D4AA]">_</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              <span className="text-[#0EA5E9]">$</span> Execute powerful SMM commands. 
              Instant delivery, premium quality, unbeatable prices.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild
                className="bg-gradient-to-r from-[#00D4AA] to-[#0EA5E9] text-[#1A1B26] font-bold font-mono text-lg px-8 hover:opacity-90">
                <Link to="/services" className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  ./start --now
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild
                className="border-[#7C3AED]/50 text-[#7C3AED] hover:bg-[#7C3AED]/10 font-mono">
                <Link to="/auth" className="flex items-center gap-2">
                  <Terminal className="w-5 h-5" />
                  ./create-account
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Code Block Preview */}
          <motion.div 
            variants={itemVariants}
            className="mt-16 max-w-2xl mx-auto"
          >
            <div className="bg-[#0D0E14] rounded-lg border border-[#00D4AA]/20 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-[#0D0E14] border-b border-[#00D4AA]/20">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-2 text-xs text-gray-500">order.sh</span>
              </div>
              <div className="p-4 font-mono text-sm">
                <div className="text-gray-500"># Quick order example</div>
                <div className="mt-2">
                  <span className="text-[#7C3AED]">$</span>
                  <span className="text-white"> smm order </span>
                  <span className="text-[#00D4AA]">--service</span>
                  <span className="text-yellow-400"> "Instagram Followers"</span>
                </div>
                <div>
                  <span className="text-[#7C3AED]">$</span>
                  <span className="text-white"> smm order </span>
                  <span className="text-[#00D4AA]">--quantity</span>
                  <span className="text-[#0EA5E9]"> 1000</span>
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
      <section className="py-16 border-y border-[#00D4AA]/10">
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
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#00D4AA]/10 border border-[#00D4AA]/20 mb-4">
                  <stat.icon className="w-6 h-6 text-[#00D4AA]" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white font-mono mb-1">
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
              <span className="text-white">Supported Platforms</span>
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
                className="p-6 rounded-lg bg-[#0D0E14] border border-[#00D4AA]/10 hover:border-[#00D4AA]/30 transition-all cursor-pointer group"
              >
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${platform.color}20` }}
                >
                  <platform.icon className="w-6 h-6" style={{ color: platform.color }} />
                </div>
                <h3 className="font-bold text-white mb-1">{platform.name}</h3>
                <p className="text-xs text-gray-500">50+ services</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Command Style */}
      <section className="py-20 bg-[#0D0E14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-[#00D4AA]">&gt;</span> Why Choose Us
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.cmd}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 rounded-lg border border-[#00D4AA]/10 hover:border-[#00D4AA]/30 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded bg-gradient-to-br from-[#00D4AA] to-[#0EA5E9] flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-[#1A1B26]" />
                  </div>
                  <div>
                    <h3 className="font-mono text-[#00D4AA] mb-1">
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
              Ready to <span className="text-[#00D4AA]">execute</span>?
            </h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Join thousands of users growing their social presence with our automated services.
            </p>
            <Button size="lg" asChild
              className="bg-gradient-to-r from-[#00D4AA] to-[#0EA5E9] text-[#1A1B26] font-bold font-mono text-lg px-10">
              <Link to="/auth?tab=signup">
                &gt; ./signup --free
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[#00D4AA]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-[#00D4AA]" />
              <span className="font-mono text-gray-400">
                © 2024 [{panelName}] -- All rights reserved
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm font-mono">
              <Link to="/terms" className="text-gray-500 hover:text-[#00D4AA]">./terms</Link>
              <Link to="/privacy" className="text-gray-500 hover:text-[#00D4AA]">./privacy</Link>
              <Link to="/support" className="text-gray-500 hover:text-[#00D4AA]">./support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TGRefHomepage;
