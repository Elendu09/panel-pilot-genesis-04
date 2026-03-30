import { useContext } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, Sparkles, Zap, TrendingUp, Users, Star, MessageCircle, Shield, DollarSign, Clock, CheckCircle, CreditCard,
  Instagram, Youtube, Send, Twitter
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatedText } from "@/components/ui/animated-text";
import { motion } from "framer-motion";
import { TikTokIcon } from "@/components/icons/SocialIcons";
import { useDeviceKey, defaultHeroShowFloatingCards, defaultHeroShowCategories } from "@/hooks/use-device-key";
import { BuyerAuthContext } from "@/contexts/BuyerAuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { AnimatedHeroText, getThemeDefaultAnimationStyle, getAnimatedWordFromTitle } from "@/components/buyer-themes/shared/AnimatedHeroText";

interface StorefrontHeroSectionProps {
  panel?: any;
  services?: any[];
  customization?: any;
}

// TikTok wrapper for consistent sizing
const TikTokWrapper = ({ className }: { className?: string }) => (
  <TikTokIcon className={className} size={16} />
);

// Buyer-focused floating cards - will be translated
const getLeftCards = (t: (key: string) => string) => [
  { icon: DollarSign, titleKey: 'storefront.hero.card.bestPrices', subtitleKey: 'storefront.hero.card.bestPricesDesc', delay: 0.8, gradient: "from-green-500 to-emerald-500" },
  { icon: Zap, titleKey: 'storefront.hero.card.instantStart', subtitleKey: 'storefront.hero.card.instantStartDesc', delay: 1.2, gradient: "from-yellow-500 to-orange-500" },
];

const getRightCards = (t: (key: string) => string) => [
  { icon: Shield, titleKey: 'storefront.hero.card.safe', subtitleKey: 'storefront.hero.card.safeDesc', delay: 1.0, gradient: "from-blue-500 to-cyan-500" },
  { icon: MessageCircle, titleKey: 'storefront.hero.card.support', subtitleKey: 'storefront.hero.card.supportDesc', delay: 1.4, gradient: "from-purple-500 to-pink-500" },
];

// Service categories with platform icons
const serviceCategories = [
  { name: "Instagram", Icon: Instagram, color: "from-pink-500 to-purple-500" },
  { name: "TikTok", Icon: TikTokWrapper, color: "from-cyan-400 to-pink-500" },
  { name: "YouTube", Icon: Youtube, color: "from-red-500 to-red-600" },
  { name: "Telegram", Icon: Send, color: "from-blue-400 to-blue-600" },
  { name: "Twitter", Icon: Twitter, color: "from-sky-400 to-blue-500" },
];

// Trust indicators - will be translated
const getTrustBadges = (t: (key: string) => string) => [
  { icon: CheckCircle, textKey: 'storefront.hero.trust.customers', color: "text-green-500" },
  { icon: Star, textKey: 'storefront.hero.trust.success', color: "text-yellow-500" },
  { icon: Clock, textKey: 'storefront.hero.trust.delivery', color: "text-blue-500" },
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
  const navigate = useNavigate();
  const deviceKey = useDeviceKey();
  
  // Get translations - wrapped in try/catch since it may not always be available
  let t = (key: string) => key;
  try {
    const lang = useLanguage();
    t = lang.t;
  } catch {
    // Not within LanguageProvider context
  }
  
  // Safely access buyer auth context (may not be available in preview mode)
  const buyerAuthContext = useContext(BuyerAuthContext);
  const buyer = buyerAuthContext?.buyer ?? null;
  
  const panelName = customization.companyName || panel?.name || 'SMM Panel';
  // Use panel owner's custom content if set, otherwise use translated defaults
  const heroTitle = customization.heroTitle || t('storefront.hero.defaultTitle');
  const heroSubtitle = customization.heroSubtitle || t('storefront.hero.defaultSubtitle');
  const badgeText = customization.badgeText || customization.heroBadgeText || t('storefront.hero.defaultBadge');
  const enableFastOrder = customization.enableFastOrder ?? true;
  const themeMode = customization.themeMode || 'dark';
  const enableHeroImage = customization.enableHeroImage && customization.heroImageUrl;
  const heroImagePosition = customization.heroImagePosition || 'right';
  const textColor = customization.textColor || (themeMode === 'dark' ? '#FFFFFF' : '#1F2937');
  const textMuted = customization.textMuted || (themeMode === 'dark' ? '#A1A1AA' : '#4B5563');
  const cardBg = themeMode === 'dark' ? 'bg-slate-900/80' : 'bg-white shadow-md';
  const borderStyle = themeMode === 'dark' ? 'border-white/10' : 'border-gray-200';

  // Per-device settings
  const heroShowFloatingCards = customization.heroShowFloatingCards?.[deviceKey] ?? defaultHeroShowFloatingCards[deviceKey];
  const heroShowCategories = customization.heroShowCategories?.[deviceKey] ?? defaultHeroShowCategories[deviceKey];
  
  // Animation settings for hero text
  const buyerTheme = panel?.buyer_theme || 'default';
  const heroAnimationStyle = customization.heroAnimationStyle || getThemeDefaultAnimationStyle(buyerTheme);
  const enableAnimations = customization.enableAnimations ?? true;
  const primaryColor = customization.primaryColor || '#8B5CF6';
  const secondaryColor = customization.secondaryColor || '#EC4899';
  
  // Extract animated word from title
  const { before: heroTextBefore, animatedWord: heroAnimatedWord, after: heroTextAfter } = getAnimatedWordFromTitle(heroTitle, 'last');

  const animatedPhrases = customization.animatedPhrases || [
    { static: "grow your audience", bold: "for profit" },
    { static: "grow your audience", bold: "for business" },
    { static: "grow your audience", bold: "with ease" }
  ];

  return (
    <section className="relative min-h-[70vh] md:min-h-[80vh] lg:min-h-screen overflow-hidden pb-8 md:pb-12">
      {/* Floating Particles - Reduced count for performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full will-change-transform"
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
      {heroShowFloatingCards && (
        <div className="absolute left-4 lg:left-[5%] top-1/4 space-y-4 hidden lg:block z-20">
          {getLeftCards(t).map((card, index) => (
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
                  <h3 className="font-bold text-sm" style={{ color: textColor }}>{t(card.titleKey)}</h3>
                  <p className="text-xs" style={{ color: textMuted }}>{t(card.subtitleKey)}</p>
                </div>
              </div>
            </Card>
          </motion.div>
          ))}
        </div>
      )}

      {/* Right Floating Cards */}
      {heroShowFloatingCards && (
        <div className="absolute right-4 lg:right-[5%] top-1/4 space-y-4 hidden lg:block z-20">
        {getRightCards(t).map((card, index) => (
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
                  <h3 className="font-bold text-sm" style={{ color: textColor }}>{t(card.titleKey)}</h3>
                  <p className="text-xs" style={{ color: textMuted }}>{t(card.subtitleKey)}</p>
                </div>
              </div>
            </Card>
          </motion.div>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 text-center relative z-10 pt-24 sm:pt-24 lg:pt-32">
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge - Added top margin for mobile to avoid menu overlap */}
          <motion.div
            className={`inline-flex items-center space-x-1.5 sm:space-x-2 ${cardBg} backdrop-blur-xl border ${borderStyle} rounded-full px-4 sm:px-6 py-2 sm:py-2.5 mb-6 sm:mb-8`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse" style={{ color: customization.primaryColor || '#8B5CF6' }} />
            <span className="text-xs sm:text-sm font-medium" style={{ color: textColor }}>{badgeText}</span>
            <span 
              className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs rounded-full font-semibold text-white"
              style={{ backgroundColor: customization.primaryColor || '#8B5CF6' }}
            >
              {t('storefront.hero.trusted')}
            </span>
          </motion.div>

          {/* Main Heading - SEO: Single H1 with semantic structure and AnimatedHeroText */}
          <motion.h1 
            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight px-2"
            style={{ color: textColor }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {heroTextBefore && <span>{heroTextBefore} </span>}
            <AnimatedHeroText
              text={heroAnimatedWord}
              animationStyle={heroAnimationStyle}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              enableAnimations={enableAnimations}
            />
            {heroTextAfter && <span> {heroTextAfter}</span>}
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto px-4"
            style={{ color: textMuted }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {heroSubtitle}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-6 sm:mb-8 px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            {enableFastOrder ? (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    size="lg" 
                    className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-full text-white w-full sm:w-auto"
                    style={{ 
                      background: `linear-gradient(135deg, ${customization.primaryColor || '#8B5CF6'}, ${customization.secondaryColor || '#EC4899'})`,
                      boxShadow: `0 10px 30px ${customization.primaryColor || '#8B5CF6'}40`
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      // Logged-in buyers go to buyer order page
                      if (buyer) {
                        navigate('/new-order');
                        return;
                      }
                      // Guests always go to the dedicated Fast Order page
                      const panelId = panel?.id;
                      navigate(panelId ? `/fast-order?panel=${panelId}` : '/fast-order');
                    }}
                  >
                    <Zap className="mr-2 w-4 h-4 sm:w-5 sm:h-5" /> {t('storefront.hero.fastOrder')}
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    asChild 
                    variant="outline" 
                    size="lg" 
                    className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-full backdrop-blur-sm w-full sm:w-auto"
                    style={{ 
                      borderColor: `${customization.primaryColor || '#8B5CF6'}50`,
                      color: textColor
                    }}
                  >
                    <Link to="/services">
                      {t('storefront.hero.viewServices')}
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
                    className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-full text-white w-full sm:w-auto"
                    style={{ 
                      background: `linear-gradient(135deg, ${customization.primaryColor || '#8B5CF6'}, ${customization.secondaryColor || '#EC4899'})`,
                      boxShadow: `0 10px 30px ${customization.primaryColor || '#8B5CF6'}40`
                    }}
                  >
                    <Link to="/buyer/auth?mode=signup">
                      {t('storefront.hero.getStarted')} <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                    </Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    asChild 
                    variant="outline" 
                    size="lg" 
                    className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-full backdrop-blur-sm w-full sm:w-auto"
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
          {heroShowCategories && (
            <motion.div 
              className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-8 sm:mb-10 px-2"
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
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full ${cardBg} backdrop-blur-sm border ${borderStyle} transition-all flex items-center gap-1.5 sm:gap-2`}
                  style={{ color: textColor }}
                >
                  <category.Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-medium">{category.name}</span>
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* Animated Text */}
          <motion.div 
            className="mb-8 sm:mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <AnimatedText phrases={animatedPhrases} />
          </motion.div>

          {/* Service Showcase Card - Hidden on mobile, shown on tablet+ */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="max-w-4xl mx-auto hidden sm:block"
          >
            <Card className={`${cardBg} backdrop-blur-2xl border ${borderStyle} shadow-2xl overflow-hidden`}>
              {/* Panel Header */}
              <div 
                className={`flex items-center justify-between p-3 sm:p-4 border-b ${borderStyle}`}
                style={{ backgroundColor: themeMode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div 
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${customization.primaryColor || '#8B5CF6'}, ${customization.secondaryColor || '#EC4899'})` }}
                  >
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <span className="font-bold text-base sm:text-lg" style={{ color: textColor }}>{panelName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-green-500/20 text-green-500 border-green-500/30 text-xs">
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
                    className="p-3 sm:p-4 text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 + index * 0.1 }}
                  >
                    <p className="text-xl sm:text-2xl font-bold" style={{ color: customization.primaryColor || '#8B5CF6' }}>{stat.value}</p>
                    <p className="text-[10px] sm:text-xs" style={{ color: textMuted }}>{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Category Preview */}
              <div className="p-3 sm:p-4">
                <div className="grid grid-cols-5 gap-2 sm:gap-3">
                  {serviceCategories.map((category, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.2 + index * 0.1 }}
                      whileHover={{ y: -5, scale: 1.05 }}
                      className="group cursor-pointer"
                    >
                      <Card className={`p-2 sm:p-4 ${themeMode === 'dark' ? 'bg-slate-800/50' : 'bg-gray-50'} border ${borderStyle} transition-all text-center`}>
                        <div className={`w-8 h-8 sm:w-12 sm:h-12 mx-auto rounded-lg sm:rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-1 sm:mb-2 shadow-lg group-hover:shadow-xl transition-shadow`}>
                          <category.Icon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <p className="text-[10px] sm:text-sm font-medium" style={{ color: textColor }}>{category.name}</p>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Mobile Service Showcase - Compact horizontal scroll */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="sm:hidden overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory"
          >
            <div className="flex gap-3" style={{ width: 'max-content' }}>
              {serviceCategories.map((category, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  className="snap-center"
                >
                  <Card className={`p-3 ${cardBg} border ${borderStyle} text-center min-w-[80px]`}>
                    <div className={`w-10 h-10 mx-auto rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center mb-2 shadow-lg`}>
                      <category.Icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-xs font-medium" style={{ color: textColor }}>{category.name}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div 
            className="flex flex-wrap justify-center gap-3 sm:gap-6 mt-6 sm:mt-10 mb-6 sm:mb-8 px-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.6 }}
          >
            {getTrustBadges(t).map((badge, index) => (
              <motion.div 
                key={index}
                className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.6 + index * 0.1 }}
              >
                <badge.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${badge.color}`} />
                <span style={{ color: textMuted }}>{t(badge.textKey)}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Payment Methods */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 pb-6 sm:pb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.6 }}
          >
            <span className="text-[10px] sm:text-xs" style={{ color: textMuted }}>{t('storefront.hero.trust.payments')}:</span>
            <div className="flex items-center gap-2 sm:gap-3">
              {paymentIcons.map((payment, i) => (
                <motion.div
                  key={i}
                  className="w-10 h-6 sm:w-12 sm:h-8 rounded-md overflow-hidden shadow-md"
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