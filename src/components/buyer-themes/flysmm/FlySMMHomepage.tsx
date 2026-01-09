import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { 
  Rocket, ChevronRight, Zap, Shield, Clock, Users, 
  Star, ArrowRight, Play, CheckCircle, Heart, Sparkles,
  Instagram, Youtube, Twitter, MessageCircle, CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface FlySMMHomepageProps {
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
    logoUrl?: string;
    heroTitle?: string;
    heroSubtitle?: string;
  };
  logoUrl?: string;
}

// FlySMM Theme: Light, friendly, illustrated style with blue accents
export const FlySMMHomepage = ({ 
  panelName = 'SMM Panel', 
  services = [], 
  stats,
  customization,
  logoUrl 
}: FlySMMHomepageProps) => {
  // Use customization colors or fallback to theme defaults
  const primaryColor = customization?.primaryColor || '#2196F3';
  const secondaryColor = customization?.secondaryColor || '#00BCD4';
  const heroTitle = customization?.heroTitle || 'Grow Your';
  const heroSubtitle = customization?.heroSubtitle || 'Get real followers, likes, and views at the best prices. Fast delivery, premium quality, 24/7 support.';
  const displayLogo = customization?.logoUrl || logoUrl;
  const features = [
    { title: 'Instant Delivery', desc: 'Your order starts processing immediately', icon: Zap, color: '#2196F3' },
    { title: 'Secure Payments', desc: 'Protected by industry-standard encryption', icon: Shield, color: '#00BCD4' },
    { title: '24/7 Support', desc: 'Our team is always here to help you', icon: Users, color: '#4CAF50' },
    { title: 'Best Prices', desc: 'Competitive rates for premium services', icon: Star, color: '#FF9800' },
  ];

  const steps = [
    { num: '1', title: 'Create Account', desc: 'Sign up for free in seconds' },
    { num: '2', title: 'Add Funds', desc: 'Deposit using your preferred method' },
    { num: '3', title: 'Place Order', desc: 'Select service and start growing' },
  ];

  const paymentMethods = [
    'Visa', 'Mastercard', 'PayPal', 'Crypto', 'Apple Pay', 'Google Pay'
  ];

  const testimonials = [
    { name: 'Sarah M.', text: 'Amazing service! Got my followers within minutes.', rating: 5 },
    { name: 'John D.', text: 'Best SMM panel I have ever used. Highly recommend!', rating: 5 },
    { name: 'Emily R.', text: 'Great prices and even better customer support.', rating: 5 },
  ];

  // Theme colors with customization support
  const bgColor = customization?.backgroundColor || '#F8FAFC';
  const textCol = customization?.textColor || '#1F2937';

  return (
    <div className="min-h-screen font-nunito" style={{ backgroundColor: bgColor, color: textCol }}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2196F3] to-[#00BCD4] flex items-center justify-center shadow-lg shadow-blue-200">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-[#2196F3]">{panelName}</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <Link to="/services" className="text-sm text-gray-600 hover:text-[#2196F3] transition-colors">
                Services
              </Link>
              <Link to="/orders" className="text-sm text-gray-600 hover:text-[#2196F3] transition-colors">
                My Orders
              </Link>
              <Link to="/support" className="text-sm text-gray-600 hover:text-[#2196F3] transition-colors">
                Support
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild className="text-gray-600 hover:text-[#2196F3]">
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button size="sm" asChild
                className="bg-gradient-to-r from-[#2196F3] to-[#00BCD4] text-white font-semibold rounded-full px-6 shadow-lg shadow-blue-200 hover:shadow-blue-300">
                <Link to="/auth?tab=signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        {/* Wave Background */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" className="w-full">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" fill="white"/>
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-6">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm text-[#2196F3] font-medium">Trusted by 10,000+ users</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                <span className="text-gray-900">Grow Your</span>
                <br />
                <span className="bg-gradient-to-r from-[#2196F3] to-[#00BCD4] bg-clip-text text-transparent">
                  Social Media
                </span>
                <br />
                <span className="text-gray-900">Instantly</span>
              </h1>

              <p className="text-lg text-gray-600 mb-8 max-w-lg">
                Get real followers, likes, and views at the best prices. 
                Fast delivery, premium quality, 24/7 support.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button size="lg" asChild
                  className="bg-gradient-to-r from-[#2196F3] to-[#00BCD4] text-white font-bold text-lg rounded-full px-8 shadow-lg shadow-blue-200 hover:shadow-blue-300">
                  <Link to="/auth?tab=signup" className="flex items-center gap-2">
                    <Rocket className="w-5 h-5" />
                    Start Free
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild
                  className="border-[#2196F3] text-[#2196F3] hover:bg-blue-50 rounded-full">
                  <Link to="/services" className="flex items-center gap-2">
                    View Services <ChevronRight className="w-5 h-5" />
                  </Link>
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center gap-6">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 border-2 border-white" />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 text-yellow-500">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">4.9/5 from 2,000+ reviews</span>
                </div>
              </div>
            </motion.div>

            {/* Right - Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                {/* Main Card */}
                <div className="bg-white rounded-3xl shadow-2xl shadow-blue-100 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                      <Instagram className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">Instagram Followers</div>
                      <div className="text-sm text-gray-500">Premium Quality</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-600">Quantity</span>
                      <span className="font-bold text-gray-900">1,000</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-600">Price</span>
                      <span className="font-bold text-[#2196F3]">$2.99</span>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-[#2196F3] to-[#00BCD4] text-white rounded-xl py-6">
                      Order Now
                    </Button>
                  </div>
                </div>

                {/* Floating Elements */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-8 -right-8 bg-white rounded-2xl shadow-xl p-4"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <span className="font-medium text-gray-900">Order Completed!</span>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                  className="absolute -bottom-4 -left-8 bg-white rounded-2xl shadow-xl p-4"
                >
                  <div className="flex items-center gap-2">
                    <Zap className="w-6 h-6 text-yellow-500" />
                    <span className="font-medium text-gray-900">Instant Start</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              How It <span className="text-[#2196F3]">Works</span>
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Get started in 3 simple steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, idx) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.15 }}
                className="relative text-center"
              >
                {/* Connector Line */}
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-[#2196F3] to-[#00BCD4]" />
                )}
                
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#2196F3] to-[#00BCD4] text-white text-2xl font-bold mb-6 shadow-lg shadow-blue-200">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Why Choose <span className="text-[#2196F3]">Us</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="bg-white rounded-3xl p-8 shadow-lg shadow-gray-100 hover:shadow-xl hover:shadow-blue-100 transition-all"
              >
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: `${feature.color}15` }}
                >
                  <feature.icon className="w-7 h-7" style={{ color: feature.color }} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              What Our <span className="text-[#2196F3]">Customers</span> Say
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((item, idx) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-3xl p-8 shadow-lg"
              >
                {/* Speech Bubble Tail */}
                <div className="relative">
                  <div className="flex items-center gap-1 mb-4 text-yellow-500">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic">"{item.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2196F3] to-[#00BCD4]" />
                    <span className="font-bold text-gray-900">{item.name}</span>
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
            className="bg-gradient-to-r from-[#2196F3] to-[#00BCD4] rounded-3xl p-12 text-white shadow-2xl shadow-blue-200"
          >
            <Rocket className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Grow?
            </h2>
            <p className="text-blue-100 mb-8 max-w-xl mx-auto">
              Join thousands of satisfied customers and start growing your social media today.
            </p>
            <Button size="lg" asChild
              className="bg-white text-[#2196F3] font-bold text-lg rounded-full px-12 hover:bg-blue-50">
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
              <Rocket className="w-5 h-5 text-[#2196F3]" />
              <span className="text-gray-600">
                © 2024 {panelName}. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link to="/terms" className="text-gray-500 hover:text-[#2196F3]">Terms</Link>
              <Link to="/privacy" className="text-gray-500 hover:text-[#2196F3]">Privacy</Link>
              <Link to="/support" className="text-gray-500 hover:text-[#2196F3]">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FlySMMHomepage;
