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
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');

  // Use customization colors or fallback to theme defaults
  const primaryColor = customization?.primaryColor || '#FFD700';
  const secondaryColor = customization?.secondaryColor || '#FFC107';
  const heroTitle = customization?.heroTitle || 'Boost Your';
  const heroSubtitle = customization?.heroSubtitle || 'Get real followers, likes, and views at the lowest prices. Trusted by over 100,000+ users worldwide.';
  const displayLogo = customization?.logoUrl || logoUrl;

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E4405F' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877F2' },
    { id: 'tiktok', name: 'TikTok', icon: Music, color: '#000000' },
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: '#FF0000' },
    { id: 'twitter', name: 'Twitter', icon: Twitter, color: '#1DA1F2' },
    { id: 'telegram', name: 'Telegram', icon: MessageCircle, color: '#0088cc' },
  ];

  const comparisonItems = [
    { feature: 'Instant Delivery', us: true, others: false },
    { feature: '24/7 Support', us: true, others: false },
    { feature: 'Refill Guarantee', us: true, others: false },
    { feature: 'Secure Payments', us: true, others: true },
    { feature: 'Low Prices', us: true, others: false },
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
    <div className="min-h-screen bg-[#F5F5F5] text-gray-900 font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white rounded-b-2xl shadow-sm mx-4 mt-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFD700] to-[#FFC107] flex items-center justify-center shadow-lg">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">{panelName}</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <Link to="/services" className="text-sm text-gray-600 hover:text-[#FFD700] transition-colors font-medium">
                Services
              </Link>
              <Link to="/orders" className="text-sm text-gray-600 hover:text-[#FFD700] transition-colors font-medium">
                Orders
              </Link>
              <Link to="/support" className="text-sm text-gray-600 hover:text-[#FFD700] transition-colors font-medium">
                Support
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild className="text-gray-600 hover:text-gray-900">
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button size="sm" asChild
                className="bg-gradient-to-r from-[#FFD700] to-[#FFC107] text-gray-900 font-semibold rounded-full px-6 shadow-lg hover:shadow-xl">
                <Link to="/auth?tab=signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Floating Icons */}
              <div className="relative mb-8">
                <div className="flex items-center gap-4">
                  {platforms.slice(0, 4).map((p, idx) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + idx * 0.1 }}
                      className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                      style={{ backgroundColor: p.color }}
                    >
                      <p.icon className="w-5 h-5 text-white" />
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-50 border border-yellow-200 mb-6">
                <span className="text-2xl">👍</span>
                <span className="text-sm text-gray-700 font-medium">#1 World Panel</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                <span className="text-gray-900">Boost Your</span>
                <br />
                <span className="bg-gradient-to-r from-[#FFD700] to-[#FFC107] bg-clip-text text-transparent">
                  Social Media
                </span>
              </h1>

              <p className="text-lg text-gray-600 mb-8 max-w-lg">
                Get real followers, likes, and views at the lowest prices. 
                Trusted by over 100,000+ users worldwide.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button size="lg" asChild
                  className="bg-gradient-to-r from-[#FFD700] to-[#FFC107] text-gray-900 font-bold text-lg rounded-full px-8 shadow-lg hover:shadow-xl">
                  <Link to="/auth?tab=signup" className="flex items-center gap-2">
                    Register Now <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full">
                  <Link to="/services">How It Works</Link>
                </Button>
              </div>

              {/* Trust Avatars */}
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'].map((color, i) => (
                    <div 
                      key={i} 
                      className="w-10 h-10 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: color }}
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="font-bold text-gray-900">+100k</div>
                  <div className="text-sm text-gray-500">Trusted Users</div>
                </div>
              </div>
            </motion.div>

            {/* Right - Comparison Chart */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-gradient-to-br from-[#FFD700]/20 to-[#FFC107]/20 rounded-[40px] p-8 lg:p-12">
                {/* Comparison Card */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                  <div className="p-6 bg-gradient-to-r from-[#FFD700] to-[#FFC107]">
                    <h3 className="text-xl font-bold text-gray-900 text-center">Comparison Chart</h3>
                  </div>
                  <div className="p-6">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left py-3 text-sm font-semibold text-gray-600">Features</th>
                          <th className="text-center py-3 text-sm font-semibold text-[#FFD700]">{panelName}</th>
                          <th className="text-center py-3 text-sm font-semibold text-gray-400">Others</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comparisonItems.map((item, idx) => (
                          <tr key={idx} className="border-b border-gray-50">
                            <td className="py-4 text-sm text-gray-700">{item.feature}</td>
                            <td className="py-4 text-center">
                              {item.us ? (
                                <CheckCircle className="w-6 h-6 text-green-500 mx-auto" />
                              ) : (
                                <X className="w-6 h-6 text-red-400 mx-auto" />
                              )}
                            </td>
                            <td className="py-4 text-center">
                              {item.others ? (
                                <CheckCircle className="w-6 h-6 text-green-500 mx-auto" />
                              ) : (
                                <X className="w-6 h-6 text-red-400 mx-auto" />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quick Login Form */}
      <section className="py-8 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <Input 
              placeholder="Username or Email" 
              className="flex-1 rounded-full border-gray-200 bg-gray-50"
            />
            <Input 
              type="password" 
              placeholder="Password" 
              className="flex-1 rounded-full border-gray-200 bg-gray-50"
            />
            <Button className="bg-gradient-to-r from-[#FFD700] to-[#FFC107] text-gray-900 font-semibold rounded-full px-8">
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Orders/Second', value: '150+', icon: Zap },
              { label: 'Total Completed', value: stats?.totalOrders || '5M+', icon: CheckCircle },
              { label: 'Active Users', value: stats?.totalUsers || '100K+', icon: Users },
              { label: 'Starting Price', value: '$0.001', icon: TrendingUp },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="text-center p-6 rounded-2xl bg-gray-50"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FFC107] mb-4">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Carousel */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              What Distinguishes <span className="text-[#FFD700]">Us</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FFD700] to-[#FFC107] flex items-center justify-center mb-4">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Tabs */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Our <span className="text-[#FFD700]">Services</span>
            </h2>
          </motion.div>

          {/* Platform Tabs */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {platforms.map((platform) => (
              <button
                key={platform.id}
                onClick={() => setSelectedPlatform(platform.id)}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-full transition-all",
                  selectedPlatform === platform.id
                    ? "bg-gradient-to-r from-[#FFD700] to-[#FFC107] text-gray-900 shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                <platform.icon className="w-5 h-5" />
                <span className="font-medium">{platform.name}</span>
              </button>
            ))}
          </div>

          {/* Service Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Followers', icon: UserPlus, price: '$0.50' },
              { name: 'Likes', icon: Heart, price: '$0.30' },
              { name: 'Views', icon: Eye, price: '$0.10' },
            ].map((service, idx) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFD700] to-[#FFC107] flex items-center justify-center">
                    <service.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{service.name}</h3>
                    <p className="text-sm text-gray-500">Starting from {service.price}</p>
                  </div>
                </div>
                <Button className="w-full bg-gray-900 text-white rounded-full hover:bg-gray-800">
                  Order Now
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Customer <span className="text-[#FFD700]">Reviews</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {reviews.map((review, idx) => (
              <motion.div
                key={review.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-center gap-1 mb-4 text-[#FFD700]">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{review.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FFC107] flex items-center justify-center text-white font-bold">
                    {review.avatar}
                  </div>
                  <span className="font-bold text-gray-900">{review.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-[#FFD700] to-[#FFC107] rounded-3xl p-12 shadow-2xl"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Ready to Grow?
            </h2>
            <p className="text-gray-700 mb-8 max-w-xl mx-auto">
              Join over 100,000 satisfied customers and start growing your social media today.
            </p>
            <Button size="lg" asChild
              className="bg-gray-900 text-white font-bold text-lg rounded-full px-12 hover:bg-gray-800">
              <Link to="/auth?tab=signup">
                Get Started Free
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#FFD700]" />
              <span className="text-gray-600">
                © 2024 {panelName}. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link to="/terms" className="text-gray-500 hover:text-[#FFD700]">Terms</Link>
              <Link to="/privacy" className="text-gray-500 hover:text-[#FFD700]">Privacy</Link>
              <Link to="/support" className="text-gray-500 hover:text-[#FFD700]">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SMMVisitHomepage;
