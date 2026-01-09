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
    surfaceColor?: string;
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
  const primary = customization?.primaryColor || '#2196F3';
  const secondary = customization?.secondaryColor || '#00BCD4';
  const bgColor = customization?.backgroundColor || '#F8FAFC';
  const textCol = customization?.textColor || '#1F2937';
  const surfaceColor = customization?.surfaceColor || '#FFFFFF';
  const heroTitle = customization?.heroTitle || 'Grow Your';
  const heroSubtitle = customization?.heroSubtitle || 'Get real followers, likes, and views at the best prices. Fast delivery, premium quality, 24/7 support.';
  const displayLogo = customization?.logoUrl || logoUrl;

  const features = [
    { title: 'Instant Delivery', desc: 'Your order starts processing immediately', icon: Zap, color: primary },
    { title: 'Secure Payments', desc: 'Protected by industry-standard encryption', icon: Shield, color: secondary },
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

  return (
    <div className="min-h-screen font-nunito" style={{ backgroundColor: bgColor, color: textCol }}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 shadow-sm" style={{ backgroundColor: surfaceColor }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: `linear-gradient(to bottom right, ${primary}, ${secondary})`, boxShadow: `0 10px 25px -5px ${primary}33` }}>
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold" style={{ color: primary }}>{panelName}</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <Link to="/services" className="text-sm text-gray-600 hover:opacity-80 transition-colors" style={{ ['--hover-color' as any]: primary }}>
                Services
              </Link>
              <Link to="/orders" className="text-sm text-gray-600 hover:opacity-80 transition-colors">
                My Orders
              </Link>
              <Link to="/support" className="text-sm text-gray-600 hover:opacity-80 transition-colors">
                Support
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild className="text-gray-600 hover:opacity-80">
                <Link to="/auth">Login</Link>
              </Button>
              <Button size="sm" asChild className="text-white font-semibold shadow-lg hover:opacity-90"
                style={{ background: `linear-gradient(to right, ${primary}, ${secondary})`, boxShadow: `0 10px 25px -5px ${primary}33` }}>
                <Link to="/auth?tab=signup">Sign Up Free</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 lg:py-32 overflow-hidden" style={{ background: `linear-gradient(to bottom, ${surfaceColor}, ${bgColor})` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                style={{ backgroundColor: `${primary}1a` }}>
                <Sparkles className="w-4 h-4" style={{ color: primary }} />
                <span className="text-sm font-medium" style={{ color: primary }}>Trusted by 10,000+ customers</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight" style={{ color: textCol }}>
                {heroTitle}
                <br />
                <span style={{ background: `linear-gradient(to right, ${primary}, ${secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Social Media
                </span>
                <br />
                Today! 🚀
              </h1>

              <p className="text-lg text-gray-600 mb-8 max-w-lg">
                {heroSubtitle}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button size="lg" asChild className="text-white font-semibold text-lg px-8 shadow-xl hover:opacity-90"
                  style={{ background: `linear-gradient(to right, ${primary}, ${secondary})`, boxShadow: `0 20px 40px -10px ${primary}4d` }}>
                  <Link to="/services" className="flex items-center gap-2">
                    Get Started <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="font-semibold"
                  style={{ borderColor: primary, color: primary }}>
                  <Link to="/auth">View Prices</Link>
                </Button>
              </div>

              {/* Payment Methods */}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <CreditCard className="w-5 h-5" />
                <span>We accept: {paymentMethods.join(', ')}</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              {/* Illustration placeholder - Abstract shapes */}
              <div className="relative w-full h-[400px]">
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px]" style={{ backgroundColor: `${primary}33` }} />
                <div className="absolute bottom-0 left-10 w-48 h-48 rounded-full blur-[60px]" style={{ backgroundColor: `${secondary}33` }} />
                
                {/* Stats Cards */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute top-10 right-10 p-4 rounded-2xl shadow-xl"
                  style={{ backgroundColor: surfaceColor }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${primary}1a` }}>
                      <Users className="w-5 h-5" style={{ color: primary }} />
                    </div>
                    <div>
                      <div className="font-bold" style={{ color: textCol }}>{stats?.totalUsers || '10K+'}</div>
                      <div className="text-xs text-gray-500">Happy Users</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity }}
                  className="absolute bottom-20 left-0 p-4 rounded-2xl shadow-xl"
                  style={{ backgroundColor: surfaceColor }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#4CAF501a' }}>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <div className="font-bold" style={{ color: textCol }}>{stats?.totalOrders || '50K+'}</div>
                      <div className="text-xs text-gray-500">Orders Done</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20" style={{ backgroundColor: surfaceColor }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: textCol }}>
              How It <span style={{ color: primary }}>Works</span>
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Get started in just 3 simple steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, idx) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center text-2xl font-bold text-white shadow-lg"
                  style={{ background: `linear-gradient(to bottom right, ${primary}, ${secondary})` }}>
                  {step.num}
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: textCol }}>{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20" style={{ backgroundColor: bgColor }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: textCol }}>
              Why Choose <span style={{ color: primary }}>Us</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
                style={{ backgroundColor: surfaceColor }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${feature.color}1a` }}>
                  <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: textCol }}>{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20" style={{ backgroundColor: surfaceColor }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: textCol }}>
              What Our <span style={{ color: primary }}>Customers</span> Say
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 rounded-2xl"
                style={{ backgroundColor: bgColor }}
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" style={{ color: '#FFB800' }} />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.text}"</p>
                <div className="font-semibold" style={{ color: textCol }}>{testimonial.name}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20" style={{ backgroundColor: bgColor }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="p-12 rounded-3xl shadow-xl"
            style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Ready to Grow Your Social Media?
            </h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">
              Join thousands of satisfied customers and start growing today.
            </p>
            <Button size="lg" asChild className="font-semibold text-lg px-10 shadow-xl hover:opacity-90"
              style={{ backgroundColor: surfaceColor, color: primary }}>
              <Link to="/auth?tab=signup">
                Start Now - It's Free! <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12" style={{ backgroundColor: surfaceColor, borderTop: '1px solid #E5E7EB' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Rocket className="w-5 h-5" style={{ color: primary }} />
              <span className="text-gray-600">
                © 2024 {panelName}. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link to="/terms" className="text-gray-500 hover:opacity-80 transition-colors">Terms</Link>
              <Link to="/privacy" className="text-gray-500 hover:opacity-80 transition-colors">Privacy</Link>
              <Link to="/support" className="text-gray-500 hover:opacity-80 transition-colors">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FlySMMHomepage;
