import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, Sparkles, Zap, TrendingUp, Users, Star, MessageCircle, Shield, DollarSign, Clock, CheckCircle, CreditCard,
  Instagram, Youtube, Send, Twitter
} from "lucide-react";
import { Link } from "react-router-dom";
import { AnimatedText } from "@/components/ui/animated-text";
import { motion } from "framer-motion";
import { TikTokIcon } from "@/components/icons/SocialIcons";

interface StorefrontHeroSectionProps {
  panel?: any;
  services?: any[];
  customization?: any;
}

// TikTok wrapper for consistent sizing
const TikTokWrapper = ({ className }: { className?: string }) => (
  <TikTokIcon className={className} size={16} />
);

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
  { name: "TikTok", Icon: TikTokWrapper, color: "from-cyan-400 to-pink-500" },
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

// Payment SVG Icons
const VisaIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 48 32" className={className} fill="none">
    <rect width="48" height="32" rx="4" fill="#1A1F71"/>
    <path d="M18.5 21.5h-3l1.9-11.5h3l-1.9 11.5zm7.6-11.2c-.6-.2-1.5-.5-2.7-.5-3 0-5.1 1.5-5.1 3.6 0 1.6 1.5 2.5 2.6 3 1.1.6 1.5 1 1.5 1.5 0 .8-1 1.2-1.8 1.2-1.2 0-1.9-.2-2.9-.6l-.4-.2-.4 2.4c.7.3 2 .6 3.4.6 3.2 0 5.2-1.5 5.2-3.7 0-1.2-.8-2.2-2.5-3-.9-.5-1.5-.8-1.5-1.3 0-.5.5-.9 1.5-.9.9 0 1.5.2 2 .4l.2.1.4-2.6zm8-0.3h-2.3c-.7 0-1.3.2-1.6.9l-4.5 10.6h3.2l.6-1.7h3.9l.4 1.7h2.8l-2.5-11.5zm-3.7 7.4l1.6-4.3.9 4.3h-2.5zm-16.8-7.4l-2.9 7.8-.3-1.5c-.5-1.8-2.2-3.8-4.1-4.8l2.7 10h3.2l4.8-11.5h-3.4z" fill="white"/>
    <path d="M8.8 10l-3.8.1-.1.4c3.8.9 6.3 3.2 7.4 6l-1.1-5.4c-.2-.7-.7-.9-1.4-1.1z" fill="#F9A533"/>
  </svg>
);

const MastercardIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 48 32" className={className} fill="none">
    <rect width="48" height="32" rx="4" fill="#000"/>
    <circle cx="18" cy="16" r="9" fill="#EB001B"/>
    <circle cx="30" cy="16" r="9" fill="#F79E1B"/>
    <path d="M24 9.5a9 9 0 010 13 9 9 0 010-13z" fill="#FF5F00"/>
  </svg>
);

const PayPalIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 48 32" className={className} fill="none">
    <rect width="48" height="32" rx="4" fill="#003087"/>
    <path d="M21.5 8h-6c-.4 0-.7.3-.8.6l-2.4 15c0 .3.2.5.5.5h3c.4 0 .7-.3.8-.6l.6-4c.1-.3.4-.6.8-.6h1.8c3.7 0 5.8-1.8 6.4-5.3.3-1.5 0-2.7-.8-3.6-.9-1-2.4-1.5-4.6-1.5l.7.5z" fill="#27346A"/>
    <path d="M35.5 8h-6c-.4 0-.7.3-.8.6l-2.4 15c0 .3.2.5.5.5h3.2c.3 0 .5-.2.5-.4l.7-4.2c.1-.3.4-.6.8-.6h1.8c3.7 0 5.8-1.8 6.4-5.3.3-1.5 0-2.7-.8-3.6-.9-1-2.4-1.5-4.6-1.5l.7.5z" fill="#2790C3"/>
  </svg>
);

const BitcoinIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 48 32" className={className} fill="none">
    <rect width="48" height="32" rx="4" fill="#F7931A"/>
    <path d="M31.5 14.2c.4-2.5-1.5-3.9-4.2-4.8l.9-3.4-2-.5-.8 3.3c-.5-.1-1.1-.2-1.6-.4l.8-3.3-2-.5-.9 3.4c-.4-.1-.8-.2-1.2-.3v-.1l-2.8-.7-.6 2.2s1.5.3 1.5.4c.8.2 1 .7.9 1.1l-.9 3.7c.1 0 .1 0 .2.1h-.2l-1.3 5.2c-.1.2-.4.6-.9.5 0 0-1.5-.4-1.5-.4l-1 2.4 2.6.7c.5.1 1 .3 1.5.4l-.9 3.5 2 .5.9-3.4c.5.1 1.1.3 1.6.4l-.9 3.4 2 .5.9-3.5c3.7.7 6.4.4 7.6-2.9.9-2.7 0-4.2-2-5.2 1.4-.3 2.5-1.2 2.8-3.1zm-5 7c-.6 2.7-5 1.2-6.4.9l1.1-4.6c1.4.4 6 1 5.3 3.7zm.7-7c-.6 2.4-4.2 1.2-5.4.9l1-4.2c1.2.3 5 .8 4.4 3.3z" fill="white"/>
  </svg>
);

const ApplePayIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 48 32" className={className} fill="none">
    <rect width="48" height="32" rx="4" fill="#000"/>
    <path d="M15.5 11c-.6.7-1.5 1.2-2.4 1.1-.1-.9.3-1.9.8-2.5.6-.7 1.5-1.2 2.3-1.2.1.9-.3 1.9-.7 2.6zm.7 1.3c-1.3-.1-2.5.8-3.1.8-.6 0-1.6-.7-2.7-.7-1.4 0-2.7.8-3.4 2-.7 1.2-.5 3.5.6 5.5.5.9 1.2 2 2.1 2h.1c.8 0 1.1-.5 2.1-.5 1 0 1.2.5 2.1.5.9 0 1.5-1 2-1.9.4-.7.6-1.4.7-1.4-.1 0-1.3-.5-1.3-2.1 0-1.3 1-2 1.1-2-.6-1-1.6-1.2-2.3-1.2z" fill="#fff"/>
    <path d="M26.5 10c1.9 0 3.2 1.3 3.2 3.2 0 1.9-1.4 3.2-3.3 3.2h-2.1v3.4h-1.5V10h3.7zm-2.2 5.1h1.8c1.3 0 2-.7 2-1.9s-.7-1.9-2-1.9h-1.8v3.8zm6.1 2.6c0-1.2 1-2 2.6-2.1l2-.1v-.6c0-.8-.5-1.2-1.4-1.2-.8 0-1.3.4-1.4.9h-1.4c.1-1.3 1.2-2.2 2.9-2.2 1.8 0 2.8.9 2.8 2.4v5h-1.4v-1.2c-.4.8-1.2 1.3-2.2 1.3-1.4 0-2.5-.8-2.5-2.2zm4.6-.6v-.6l-1.8.1c-.9.1-1.4.4-1.4 1 0 .6.5 1 1.3 1 1.1 0 1.9-.7 1.9-1.5zm2.8 4.8v-1.2c.1 0 .4.1.6.1.5 0 .8-.2 1-.8l.1-.3-2.5-7h1.6l1.7 5.6 1.7-5.6h1.5l-2.6 7.3c-.5 1.4-1.1 1.9-2.3 1.9-.2 0-.7 0-.8-.1z" fill="#fff"/>
  </svg>
);

const paymentIcons = [
  { Component: VisaIcon, name: "Visa" },
  { Component: MastercardIcon, name: "Mastercard" },
  { Component: PayPalIcon, name: "PayPal" },
  { Component: BitcoinIcon, name: "Bitcoin" },
  { Component: ApplePayIcon, name: "Apple Pay" },
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
              {paymentIcons.map((payment, i) => (
                <motion.div
                  key={i}
                  className="w-12 h-8 rounded-md overflow-hidden shadow-md"
                  whileHover={{ scale: 1.1, y: -2 }}
                  title={payment.name}
                >
                  <payment.Component className="w-full h-full" />
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