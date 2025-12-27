import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, Sparkles, Zap, TrendingUp, Users, Star, MessageCircle, Shield, DollarSign, Clock, CheckCircle, CreditCard,
  Instagram, Music, Youtube, Send, Twitter
} from "lucide-react";
import { Link } from "react-router-dom";
import { AnimatedText } from "@/components/ui/animated-text";
import { motion } from "framer-motion";

interface StorefrontHeroSectionProps {
  panel?: any;
  services?: any[];
  customization?: any;
}

// Buyer-focused floating cards - different from homepage
const leftCards = [
  { icon: DollarSign, title: "Best Prices", subtitle: "Lowest in the market", delay: 0.8, gradient: "from-green-500 to-emerald-500" },
  { icon: Zap, title: "Instant Start", subtitle: "Orders begin in seconds", delay: 1.2, gradient: "from-yellow-500 to-orange-500" },
];

const rightCards = [
  { icon: Shield, title: "100% Safe", subtitle: "No password needed", delay: 1.0, gradient: "from-blue-500 to-cyan-500" },
  { icon: MessageCircle, title: "24/7 Support", subtitle: "Always here to help", delay: 1.4, gradient: "from-purple-500 to-pink-500" },
];

// Service categories with platform icons
const serviceCategories = [
  { name: "Instagram", Icon: Instagram, color: "from-pink-500 to-purple-500" },
  { name: "TikTok", Icon: Music, color: "from-cyan-400 to-pink-500" },
  { name: "YouTube", Icon: Youtube, color: "from-red-500 to-red-600" },
  { name: "Telegram", Icon: Send, color: "from-blue-400 to-blue-600" },
  { name: "Twitter", Icon: Twitter, color: "from-sky-400 to-blue-500" },
];

// Trust indicators
const trustBadges = [
  { icon: CheckCircle, text: "50K+ Happy Customers", color: "text-green-500" },
  { icon: Star, text: "99.9% Success Rate", color: "text-yellow-500" },
  { icon: Clock, text: "Instant Delivery", color: "text-blue-500" },
];

// Payment icons
const paymentMethods = [
  { letter: "V", name: "Visa", gradient: "from-blue-600 to-blue-700" },
  { letter: "M", name: "Mastercard", gradient: "from-red-500 to-orange-500" },
  { letter: "P", name: "PayPal", gradient: "from-blue-500 to-blue-600" },
  { letter: "₿", name: "Bitcoin", gradient: "from-yellow-500 to-amber-600" },
];

export const StorefrontHeroSection = ({ panel, services = [], customization = {} }: StorefrontHeroSectionProps) => {
  const panelName = customization.companyName || panel?.name || 'SMM Panel';
  const heroTitle = customization.heroTitle || 'Boost Your Social Media';
  const heroSubtitle = customization.heroSubtitle || 'Get real followers, likes, and views at the lowest prices with instant delivery. Trusted by thousands of creators and businesses worldwide.';
  const badgeText = customization.badgeText || customization.heroBadgeText || '#1 SMM Panel';
  const enableFastOrder = customization.enableFastOrder ?? true;
  const themeMode = customization.themeMode || 'dark';
  const textColor = customization.textColor || (themeMode === 'dark' ? '#FFFFFF' : '#1F2937');
  const textMuted = customization.textMuted || (themeMode === 'dark' ? '#A1A1AA' : '#4B5563');
  const cardBg = themeMode === 'dark' ? 'bg-slate-900/80' : 'bg-white shadow-md';
  const borderStyle = themeMode === 'dark' ? 'border-white/10' : 'border-gray-200';

  const animatedPhrases = customization.animatedPhrases || [
    { static: "grow your audience", bold: "for profit" },
    { static: "grow your audience", bold: "for business" },
    { static: "grow your audience", bold: "with ease" }
  ];

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `linear-gradient(135deg, ${customization.primaryColor || '#8B5CF6'}, ${customization.primaryColor || '#8B5CF6'}80)`,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.2, 0.7, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Left Floating Cards */}
      <div className="absolute left-4 lg:left-[5%] top-1/4 space-y-4 hidden lg:block z-20">
        {leftCards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: card.delay, duration: 0.8, ease: "easeOut" }}
            whileHover={{ scale: 1.05, x: 10 }}
          >
            <Card className={`p-4 ${cardBg} backdrop-blur-xl border ${borderStyle} shadow-2xl w-[190px]`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm" style={{ color: textColor }}>{card.title}</h3>
                  <p className="text-xs" style={{ color: textMuted }}>{card.subtitle}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Right Floating Cards */}
      <div className="absolute right-4 lg:right-[5%] top-1/4 space-y-4 hidden lg:block z-20">
        {rightCards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: card.delay, duration: 0.8, ease: "easeOut" }}
            whileHover={{ scale: 1.05, x: -10 }}
          >
            <Card className={`p-4 ${cardBg} backdrop-blur-xl border ${borderStyle} shadow-2xl w-[190px]`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm" style={{ color: textColor }}>{card.title}</h3>
                  <p className="text-xs" style={{ color: textMuted }}>{card.subtitle}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 text-center relative z-10 pt-24 lg:pt-32">
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <motion.div 
            className={`inline-flex items-center space-x-2 ${cardBg} backdrop-blur-xl border ${borderStyle} rounded-full px-6 py-2.5 mb-8`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles className="w-4 h-4 animate-pulse" style={{ color: customization.primaryColor || '#8B5CF6' }} />
            <span className="text-sm font-medium" style={{ color: textColor }}>{badgeText}</span>
            <span 
              className="px-2 py-0.5 text-xs rounded-full font-semibold text-white"
              style={{ backgroundColor: customization.primaryColor || '#8B5CF6' }}
            >
              Trusted
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1 
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            style={{ color: textColor }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {heroTitle.split(' ').slice(0, Math.ceil(heroTitle.split(' ').length / 2)).join(' ')}
            <br />
            <motion.span 
              className="bg-clip-text text-transparent inline-block"
              style={{ 
                backgroundImage: `linear-gradient(135deg, ${customization.primaryColor || '#8B5CF6'}, ${customization.secondaryColor || '#EC4899'})` 
              }}
              animate={{ 
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            >
              {heroTitle.split(' ').slice(Math.ceil(heroTitle.split(' ').length / 2)).join(' ') || 'Presence'}
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            className="text-lg md:text-xl mb-8 max-w-2xl mx-auto"
            style={{ color: textMuted }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {heroSubtitle}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            {enableFastOrder ? (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    asChild 
                    size="lg" 
                    className="text-lg px-8 py-6 rounded-full text-white"
                    style={{ 
                      background: `linear-gradient(135deg, ${customization.primaryColor || '#8B5CF6'}, ${customization.secondaryColor || '#EC4899'})`,
                      boxShadow: `0 10px 30px ${customization.primaryColor || '#8B5CF6'}40`
                    }}
                  >
                    <a href="#fast-order">
                      <Zap className="mr-2 w-5 h-5" /> Fast Order
                    </a>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    asChild 
                    variant="outline" 
                    size="lg" 
                    className="text-lg px-8 py-6 rounded-full backdrop-blur-sm"
                    style={{ 
                      borderColor: `${customization.primaryColor || '#8B5CF6'}50`,
                      color: textColor
                    }}
                  >
                    <Link to="/services">
                      View Services
                    </Link>
                  </Button>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    asChild 
                    size="lg" 
                    className="text-lg px-8 py-6 rounded-full text-white"
                    style={{ 
                      background: `linear-gradient(135deg, ${customization.primaryColor || '#8B5CF6'}, ${customization.secondaryColor || '#EC4899'})`,
                      boxShadow: `0 10px 30px ${customization.primaryColor || '#8B5CF6'}40`
                    }}
                  >
                    <Link to="/buyer/auth?mode=signup">
                      Get Started <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    asChild 
                    variant="outline" 
                    size="lg" 
                    className="text-lg px-8 py-6 rounded-full backdrop-blur-sm"
                    style={{ 
                      borderColor: `${customization.primaryColor || '#8B5CF6'}50`,
                      color: textColor
                    }}
                  >
                    <Link to="/services">
                      View Services
                    </Link>
                  </Button>
                </motion.div>
              </>
            )}
          </motion.div>

          {/* Platform Categories - Quick Access */}
          <motion.div 
            className="flex flex-wrap justify-center gap-2 mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            {serviceCategories.map((category, index) => (
              <motion.button
                key={category.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                className={`px-4 py-2 rounded-full ${cardBg} backdrop-blur-sm border ${borderStyle} transition-all flex items-center gap-2`}
                style={{ color: textColor }}
              >
                <category.Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{category.name}</span>
              </motion.button>
            ))}
          </motion.div>

          {/* Animated Text */}
          <motion.div 
            className="mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <AnimatedText phrases={animatedPhrases} />
          </motion.div>

          {/* Service Showcase Card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <Card className={`${cardBg} backdrop-blur-2xl border ${borderStyle} shadow-2xl overflow-hidden`}>
              {/* Panel Header */}
              <div 
                className={`flex items-center justify-between p-4 border-b ${borderStyle}`}
                style={{ backgroundColor: themeMode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${customization.primaryColor || '#8B5CF6'}, ${customization.secondaryColor || '#EC4899'})` }}
                  >
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-lg" style={{ color: textColor }}>{panelName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                    <CheckCircle className="w-3 h-3 mr-1" /> Online
                  </Badge>
                </div>
              </div>

              {/* Quick Stats in Showcase */}
              <div className={`grid grid-cols-3 divide-x ${themeMode === 'dark' ? 'divide-white/10' : 'divide-gray-200'} border-b ${borderStyle}`}>
                {[
                  { label: "Services", value: services.length > 0 ? `${services.length}+` : "500+" },
                  { label: "Avg. Delivery", value: "0-1 hr" },
                  { label: "Min. Order", value: "$0.01" },
                ].map((stat, index) => (
                  <motion.div 
                    key={index} 
                    className="p-4 text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 + index * 0.1 }}
                  >
                    <p className="text-2xl font-bold" style={{ color: customization.primaryColor || '#8B5CF6' }}>{stat.value}</p>
                    <p className="text-xs" style={{ color: textMuted }}>{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Category Preview */}
              <div className="p-4">
                <div className="grid grid-cols-5 gap-3">
                  {serviceCategories.map((category, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.2 + index * 0.1 }}
                      whileHover={{ y: -5, scale: 1.05 }}
                      className="group cursor-pointer"
                    >
                      <Card className={`p-4 ${themeMode === 'dark' ? 'bg-slate-800/50' : 'bg-gray-50'} border ${borderStyle} transition-all text-center`}>
                        <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-2 shadow-lg group-hover:shadow-xl transition-shadow`}>
                          <category.Icon className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-sm font-medium" style={{ color: textColor }}>{category.name}</p>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div 
            className="flex flex-wrap justify-center gap-6 mt-10 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.6 }}
          >
            {trustBadges.map((badge, index) => (
              <motion.div 
                key={index}
                className="flex items-center gap-2 text-sm"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.6 + index * 0.1 }}
              >
                <badge.icon className={`w-5 h-5 ${badge.color}`} />
                <span style={{ color: textMuted }}>{badge.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Payment Methods */}
          <motion.div
            className="flex items-center justify-center gap-4 pb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.6 }}
          >
            <span className="text-xs" style={{ color: textMuted }}>We accept:</span>
            <div className="flex items-center gap-3">
              {paymentMethods.map((method, i) => (
                <motion.div
                  key={i}
                  className={`w-10 h-7 rounded-md bg-gradient-to-br ${method.gradient} flex items-center justify-center text-white text-xs font-bold shadow-md`}
                  whileHover={{ scale: 1.1, y: -2 }}
                  title={method.name}
                >
                  {method.letter}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default StorefrontHeroSection;