import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, ChevronRight, Zap, Shield, Clock, Users, 
  Star, ArrowRight, Play, CheckCircle, X, Heart,
  Instagram, Youtube, Twitter, MessageCircle, Music, Video
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface AliPanelHomepageProps {
  panelName?: string;
  services?: any[];
  stats?: {
    totalOrders?: number;
    totalUsers?: number;
    servicesCount?: number;
  };
}

// AliPanel Theme: Dark with pink-orange gradients, floating icons, glassmorphism
export const AliPanelHomepage = ({ panelName = 'SMM Panel', services = [], stats }: AliPanelHomepageProps) => {
  const floatingIcons = [
    { icon: Instagram, color: '#E4405F', delay: 0, x: -120, y: -80 },
    { icon: Youtube, color: '#FF0000', delay: 0.2, x: 130, y: -60 },
    { icon: Twitter, color: '#1DA1F2', delay: 0.4, x: -100, y: 60 },
    { icon: Music, color: '#1DB954', delay: 0.6, x: 110, y: 80 },
    { icon: Video, color: '#000000', delay: 0.8, x: 0, y: -120 },
  ];

  const servicePills = [
    { name: 'Followers', gradient: 'from-pink-500 to-rose-500' },
    { name: 'Likes', gradient: 'from-orange-500 to-amber-500' },
    { name: 'Views', gradient: 'from-violet-500 to-purple-500' },
    { name: 'Comments', gradient: 'from-cyan-500 to-blue-500' },
  ];

  const comparisonItems = [
    { feature: 'Instant Start', us: true, others: false },
    { feature: '24/7 Support', us: true, others: false },
    { feature: 'Refill Guarantee', us: true, others: false },
    { feature: 'Secure Payments', us: true, others: true },
    { feature: 'Low Prices', us: true, others: false },
  ];

  const features = [
    { title: 'Lightning Fast', desc: 'Orders start within seconds', icon: Zap, gradient: 'from-yellow-500 to-orange-500' },
    { title: 'Premium Quality', desc: 'Real and active accounts', icon: Star, gradient: 'from-pink-500 to-rose-500' },
    { title: 'Auto Refill', desc: 'Drop protection included', icon: Shield, gradient: 'from-violet-500 to-purple-500' },
    { title: '24/7 Support', desc: 'Always here to help', icon: Users, gradient: 'from-cyan-500 to-blue-500' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-poppins overflow-hidden">
      {/* Gradient Orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-r from-pink-500/20 to-orange-500/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gradient-to-r from-violet-500/15 to-purple-500/15 rounded-full blur-[100px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B6B] to-[#FF8E53] flex items-center justify-center shadow-lg shadow-pink-500/30">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-[#FF6B6B] to-[#FFCC70] bg-clip-text text-transparent">
                {panelName}
              </span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <Link to="/services" className="text-sm text-gray-400 hover:text-white transition-colors">
                Services
              </Link>
              <Link to="/orders" className="text-sm text-gray-400 hover:text-white transition-colors">
                Orders
              </Link>
              <Link to="/support" className="text-sm text-gray-400 hover:text-white transition-colors">
                Support
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild className="text-gray-400 hover:text-white">
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button size="sm" asChild
                className="bg-gradient-to-r from-[#FF6B6B] via-[#FF8E53] to-[#FFCC70] text-white font-semibold shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transition-shadow">
                <Link to="/auth?tab=signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/10 to-orange-500/10 border border-pink-500/20 mb-6">
                <Sparkles className="w-4 h-4 text-[#FF6B6B]" />
                <span className="text-sm text-[#FF8E53]">#1 Rated SMM Panel</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-[#FF6B6B] via-[#FF8E53] to-[#FFCC70] bg-clip-text text-transparent">
                  Boost Your
                </span>
                <br />
                <span className="text-white">Social Media</span>
              </h1>

              <p className="text-lg text-gray-400 mb-8 max-w-lg">
                Get real followers, likes, and views at the lowest prices. 
                Trusted by over 10,000+ customers worldwide.
              </p>

              {/* Service Pills */}
              <div className="flex flex-wrap gap-3 mb-8">
                {servicePills.map((pill, idx) => (
                  <motion.div
                    key={pill.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    className={cn(
                      "px-4 py-2 rounded-full bg-gradient-to-r text-sm font-medium text-white shadow-lg",
                      pill.gradient
                    )}
                  >
                    {pill.name}
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild
                  className="bg-gradient-to-r from-[#FF6B6B] via-[#FF8E53] to-[#FFCC70] text-white font-bold text-lg px-8 shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50">
                  <Link to="/services" className="flex items-center gap-2">
                    Start Now <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild
                  className="border-[#FF6B6B]/30 text-white hover:bg-[#FF6B6B]/10">
                  <Link to="/auth">View Services</Link>
                </Button>
              </div>
            </motion.div>

            {/* Right - Floating Icons + Comparison */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              {/* Floating Social Icons */}
              <div className="relative h-[400px] flex items-center justify-center">
                {floatingIcons.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1,
                      x: [item.x, item.x + 10, item.x],
                      y: [item.y, item.y - 15, item.y],
                    }}
                    transition={{ 
                      delay: item.delay,
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                    className="absolute"
                    style={{ left: '50%', top: '50%' }}
                  >
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl"
                      style={{ 
                        backgroundColor: item.color,
                        boxShadow: `0 10px 40px ${item.color}50`
                      }}
                    >
                      <item.icon className="w-7 h-7 text-white" />
                    </div>
                  </motion.div>
                ))}

                {/* Center Glow */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-r from-[#FF6B6B] to-[#FFCC70] blur-[60px] opacity-50" />
                </div>
              </div>

              {/* Comparison Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-full max-w-sm"
              >
                <div className="bg-[#141414]/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
                  <h3 className="text-lg font-bold mb-4 text-center">Why Choose Us?</h3>
                  <div className="space-y-3">
                    {comparisonItems.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{item.feature}</span>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">Us</span>
                            {item.us ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <X className="w-5 h-5 text-red-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">Others</span>
                            {item.others ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <X className="w-5 h-5 text-red-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Orders Delivered', value: stats?.totalOrders || '100K+', icon: '🔥' },
              { label: 'Happy Customers', value: stats?.totalUsers || '25K+', icon: '❤️' },
              { label: 'Services', value: stats?.servicesCount || '1000+', icon: '⚡' },
              { label: 'Satisfaction', value: '99.8%', icon: '⭐' },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="text-center p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10"
              >
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#FF6B6B] to-[#FFCC70] bg-clip-text text-transparent mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why <span className="bg-gradient-to-r from-[#FF6B6B] to-[#FFCC70] bg-clip-text text-transparent">Choose</span> Us
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              We provide the best SMM services with unmatched quality and speed
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -10 }}
                className="group relative p-6 rounded-2xl bg-[#141414] border border-white/5 hover:border-pink-500/30 transition-all"
              >
                <div className={cn(
                  "w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform",
                  feature.gradient
                )}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="p-12 rounded-3xl bg-gradient-to-r from-[#FF6B6B]/10 via-[#FF8E53]/10 to-[#FFCC70]/10 border border-pink-500/20"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to <span className="bg-gradient-to-r from-[#FF6B6B] to-[#FFCC70] bg-clip-text text-transparent">Grow</span>?
            </h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Start boosting your social media presence today. 
              Join thousands of satisfied customers.
            </p>
            <Button size="lg" asChild
              className="bg-gradient-to-r from-[#FF6B6B] via-[#FF8E53] to-[#FFCC70] text-white font-bold text-lg px-12 shadow-lg shadow-pink-500/30">
              <Link to="/auth?tab=signup">
                Get Started Free
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#FF6B6B]" />
              <span className="text-gray-400">
                © 2024 {panelName}. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link to="/terms" className="text-gray-500 hover:text-[#FF6B6B]">Terms</Link>
              <Link to="/privacy" className="text-gray-500 hover:text-[#FF6B6B]">Privacy</Link>
              <Link to="/support" className="text-gray-500 hover:text-[#FF6B6B]">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AliPanelHomepage;
