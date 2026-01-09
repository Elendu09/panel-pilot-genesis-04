import { ReactNode, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ThumbsUp, ChevronRight, Zap, Shield, Clock, Users, 
  Star, ArrowRight, Play, CheckCircle, X, Globe, Award,
  Instagram, Youtube, Twitter, MessageCircle, Music, Facebook, Camera,
  Eye, Heart, UserPlus, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface SMMVisitHomepageProps {
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

// SMMVisit Theme: Light gray, yellow/gold primary, clean professional
export const SMMVisitHomepage = ({ 
  panelName = 'SMM Panel', 
  services = [], 
  stats,
  customization,
  logoUrl 
}: SMMVisitHomepageProps) => {
  const primary = customization?.primaryColor || '#FFD700';
  const secondary = customization?.secondaryColor || '#FFC107';
  const bgColor = customization?.backgroundColor || '#F5F5F5';
  const textCol = customization?.textColor || '#1A1A1A';
  const surfaceColor = customization?.surfaceColor || '#FFFFFF';
  const heroTitle = customization?.heroTitle || 'Boost Your';
  const heroSubtitle = customization?.heroSubtitle || 'Get real followers, likes, and views at the lowest prices. Trusted by over 100,000+ users worldwide.';
  const displayLogo = customization?.logoUrl || logoUrl;

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E4405F' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877F2' },
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: '#FF0000' },
    { id: 'twitter', name: 'Twitter', icon: Twitter, color: '#1DA1F2' },
  ];

  const features = [
    { title: 'Instant Start', desc: 'Orders begin processing immediately', icon: Zap },
    { title: 'High Quality', desc: 'Real and active accounts', icon: Award },
    { title: 'Best Prices', desc: 'Most competitive rates', icon: TrendingUp },
    { title: '24/7 Support', desc: 'Always here to help', icon: Users },
  ];

  const reviews = [
    { name: 'John D.', text: 'Best SMM panel I have used. Fast and reliable!', rating: 5, avatar: 'J' },
    { name: 'Sarah M.', text: 'Got 10k followers in just 2 hours. Amazing!', rating: 5, avatar: 'S' },
    { name: 'Mike R.', text: 'Great customer support and competitive prices.', rating: 5, avatar: 'M' },
  ];

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: bgColor, color: textCol }}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 rounded-b-2xl shadow-sm mx-4 mt-2" style={{ backgroundColor: surfaceColor }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(to bottom right, ${primary}, ${secondary})` }}>
                <Globe className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold" style={{ color: textCol }}>{panelName}</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <Link to="/services" className="text-sm text-gray-600 hover:opacity-80 transition-colors font-medium">Services</Link>
              <Link to="/orders" className="text-sm text-gray-600 hover:opacity-80 transition-colors font-medium">Orders</Link>
              <Link to="/support" className="text-sm text-gray-600 hover:opacity-80 transition-colors font-medium">Support</Link>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild className="font-medium" style={{ color: textCol }}>
                <Link to="/auth">Login</Link>
              </Button>
              <Button size="sm" asChild className="font-semibold text-white shadow-lg hover:opacity-90"
                style={{ background: `linear-gradient(to right, ${primary}, ${secondary})` }}>
                <Link to="/auth?tab=signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {heroTitle}
              <span style={{ background: `linear-gradient(to right, ${primary}, ${secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}> Social Media</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">{heroSubtitle}</p>
            <Button size="lg" asChild className="font-semibold text-lg px-10 text-white shadow-xl hover:opacity-90"
              style={{ background: `linear-gradient(to right, ${primary}, ${secondary})` }}>
              <Link to="/services">Get Started <ArrowRight className="w-5 h-5 ml-2" /></Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16" style={{ backgroundColor: surfaceColor }}>
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Happy Users', value: stats?.totalUsers || '100K+' },
            { label: 'Orders Completed', value: stats?.totalOrders || '1M+' },
            { label: 'Services', value: stats?.servicesCount || '500+' },
            { label: 'Countries', value: '150+' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-1" style={{ color: textCol }}>{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: textCol }}>Why Choose Us</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                className="p-6 rounded-2xl shadow-lg" style={{ backgroundColor: surfaceColor }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `linear-gradient(to bottom right, ${primary}, ${secondary})` }}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: textCol }}>{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-20" style={{ backgroundColor: surfaceColor }}>
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: textCol }}>Customer Reviews</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {reviews.map((review, idx) => (
              <motion.div key={review.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                className="p-6 rounded-2xl" style={{ backgroundColor: bgColor }}>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" style={{ color: primary }} />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"{review.text}"</p>
                <div className="font-semibold" style={{ color: textCol }}>{review.name}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12" style={{ backgroundColor: surfaceColor, borderTop: '1px solid #E5E7EB' }}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-gray-600">© 2024 {panelName}. All rights reserved.</span>
          <div className="flex gap-6 text-sm">
            <Link to="/terms" className="text-gray-500 hover:opacity-80">Terms</Link>
            <Link to="/privacy" className="text-gray-500 hover:opacity-80">Privacy</Link>
            <Link to="/support" className="text-gray-500 hover:opacity-80">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SMMVisitHomepage;
