import { 
  CreditCard, 
  MessageSquare, 
  Droplets, 
  Zap,
  QrCode,
  Languages,
  Shield,
  TrendingUp,
  Headphones,
  Instagram,
  Music,
  Youtube,
  Send,
  Twitter,
  Building2
} from "lucide-react";
import { motion } from "framer-motion";
import { PayPalIcon, StripeIcon, BitcoinIcon } from "@/components/payment/PaymentIcons";

interface StorefrontFeaturesSectionProps {
  customization?: any;
}

export const StorefrontFeaturesSection = ({ customization = {} }: StorefrontFeaturesSectionProps) => {
  const themeMode = customization.themeMode || 'dark';
  const textColor = customization.textColor || (themeMode === 'dark' ? '#FFFFFF' : '#1F2937');
  const textMuted = customization.textMuted || (themeMode === 'dark' ? '#A1A1AA' : '#4B5563');
  const cardBg = themeMode === 'dark' ? 'bg-slate-900/60' : 'bg-white/80';
  const borderStyle = themeMode === 'dark' ? 'border-white/10' : 'border-gray-200';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40, rotateX: -5 },
    visible: { 
      opacity: 1, 
      y: 0,
      rotateX: 0,
      transition: { type: "spring" as const, stiffness: 80, damping: 15 }
    }
  };

  const featureCardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 }
    }
  };

  // Platform icons for services card
  const platformIcons = [
    { Icon: Instagram, name: "IG", gradient: "from-pink-500 to-purple-500" },
    { Icon: Music, name: "TT", gradient: "from-gray-900 to-pink-500" },
    { Icon: Youtube, name: "YT", gradient: "from-red-500 to-red-600" },
    { Icon: Send, name: "TG", gradient: "from-blue-400 to-blue-600" },
    { Icon: Twitter, name: "X", gradient: "from-gray-700 to-gray-900" },
  ];

  return (
    <section id="features" className="py-24 relative overflow-hidden" style={{ backgroundColor: customization.backgroundColor }}>
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
      
      {/* Background decoration */}
      <div className="absolute inset-0 bg-mesh opacity-30" />
      
      {/* Animated gradient orbs */}
      <motion.div 
        className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl"
        style={{ backgroundColor: `${customization.primaryColor || '#8B5CF6'}15` }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl"
        style={{ backgroundColor: `${customization.secondaryColor || '#EC4899'}15` }}
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Header */}
      <div className="container mx-auto px-4 text-center mb-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6"
          style={{ 
            backgroundColor: `${customization.primaryColor || '#8B5CF6'}15`,
            borderColor: `${customization.primaryColor || '#8B5CF6'}30`
          }}
        >
          <Zap className="w-4 h-4" style={{ color: customization.primaryColor || '#8B5CF6' }} />
          <span className="text-sm font-medium" style={{ color: customization.primaryColor || '#8B5CF6' }}>Powerful Features</span>
        </motion.div>

        <motion.h2 
          className="text-4xl md:text-5xl font-bold mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          style={{ color: textColor }}
        >
          <span 
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: `linear-gradient(135deg, ${customization.primaryColor || '#8B5CF6'}, ${customization.secondaryColor || '#EC4899'})` }}
          >
            Everything You Need
          </span>
        </motion.h2>
      </div>

      {/* Main Feature Cards */}
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {/* Payment Systems Card */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -8, scale: 1.02, rotateY: 3, rotateX: 2 }}
            className={`${cardBg} backdrop-blur-xl p-8 rounded-2xl border ${borderStyle} group relative overflow-hidden`}
          >
            <div className="text-center mb-8 relative z-10">
              <motion.div 
                className="text-6xl font-bold mb-2 bg-clip-text text-transparent"
                style={{ backgroundImage: `linear-gradient(135deg, ${customization.primaryColor || '#8B5CF6'}, ${customization.secondaryColor || '#EC4899'})` }}
                whileHover={{ scale: 1.1 }}
              >
                50+
              </motion.div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: textColor }}>Payment Methods</h3>
              <p style={{ color: textMuted }}>for every country</p>
            </div>
            <div className="space-y-3 relative z-10">
              {[
                { name: "PayPal", Icon: PayPalIcon },
                { name: "Stripe", Icon: StripeIcon },
                { name: "Crypto", Icon: BitcoinIcon },
                { name: "Bank Transfer", Icon: Building2, isLucide: true, gradient: "from-green-500 to-green-600" },
              ].map((payment, index) => (
                <motion.div 
                  key={payment.name}
                  className={`flex items-center justify-between p-4 rounded-lg border ${borderStyle} transition-all`}
                  style={{ backgroundColor: themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 5 }}
                >
                  <span className="font-medium flex items-center gap-3" style={{ color: textColor }}>
                    {payment.isLucide ? (
                      <div className={`w-8 h-8 bg-gradient-to-br ${payment.gradient} rounded-lg flex items-center justify-center`}>
                        <payment.Icon className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <payment.Icon className="w-8 h-8 rounded-lg" />
                    )}
                    {payment.name}
                  </span>
                  <motion.div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: customization.primaryColor || '#8B5CF6' }}
                    whileHover={{ scale: 1.5 }}
                  />
                </motion.div>
              ))}
              <p className="text-center text-sm mt-6 font-medium" style={{ color: customization.primaryColor || '#8B5CF6' }}>
                and much more...
              </p>
            </div>
          </motion.div>

          {/* Center Enhanced Dashboard Card */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -8, scale: 1.02, rotateY: -3, rotateX: 2 }}
            className={`${cardBg} backdrop-blur-xl p-8 rounded-2xl border ${borderStyle} group relative overflow-hidden`}
          >
            <div className="absolute inset-0">
              <motion.div 
                className="absolute top-10 left-10 w-2 h-2 rounded-full"
                style={{ backgroundColor: `${customization.primaryColor || '#8B5CF6'}50` }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div 
                className="absolute top-20 right-16 w-1 h-1 rounded-full"
                style={{ backgroundColor: `${customization.secondaryColor || '#EC4899'}70` }}
                animate={{ scale: [1, 2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
              />
            </div>
            
            <div className="text-center relative z-10">
              <h3 
                className="text-xl font-semibold mb-2 bg-clip-text text-transparent"
                style={{ backgroundImage: `linear-gradient(135deg, ${customization.primaryColor || '#8B5CF6'}, ${customization.secondaryColor || '#EC4899'})` }}
              >
                Easy to use
              </h3>
              <p className="mb-8" style={{ color: textMuted }}>Simple ordering process</p>
            </div>
            
            {/* Dashboard Visual */}
            <div className="relative w-56 h-56 mx-auto mb-6">
              <motion.div 
                className="absolute inset-0 rounded-full border-4"
                style={{ borderColor: `${customization.primaryColor || '#8B5CF6'}30` }}
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              
              {[
                { icon: Shield, label: "Secure", position: "top-2 left-1/2 -translate-x-1/2" },
                { icon: TrendingUp, label: "Fast", position: "top-1/2 left-2 -translate-y-1/2" },
                { icon: Zap, label: "Instant", position: "top-1/2 right-2 -translate-y-1/2" },
                { icon: Headphones, label: "Support", position: "bottom-2 left-1/2 -translate-x-1/2" },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  className={`absolute ${item.position} transform ${cardBg} rounded-lg p-2 border ${borderStyle}`}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.1 }}
                >
                  <item.icon className="w-4 h-4" style={{ color: customization.primaryColor || '#8B5CF6' }} />
                  <span className="text-xs font-medium block mt-1" style={{ color: customization.primaryColor || '#8B5CF6' }}>{item.label}</span>
                </motion.div>
              ))}
              
              <motion.div 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${customization.primaryColor || '#8B5CF6'}, ${customization.secondaryColor || '#EC4899'})` }}
                animate={{ 
                  boxShadow: [
                    `0 0 20px ${customization.primaryColor || '#8B5CF6'}50`,
                    `0 0 40px ${customization.primaryColor || '#8B5CF6'}70`,
                    `0 0 20px ${customization.primaryColor || '#8B5CF6'}50`
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                whileHover={{ scale: 1.1 }}
              >
                <Zap className="w-10 h-10 text-white" />
              </motion.div>
            </div>
          </motion.div>

          {/* Services Card */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -8, scale: 1.02, rotateY: 3, rotateX: 2 }}
            className={`${cardBg} backdrop-blur-xl p-8 rounded-2xl border ${borderStyle} group relative overflow-hidden`}
          >
            <div className="text-center mb-8 relative z-10">
              <motion.div 
                className="text-6xl font-bold mb-2 bg-clip-text text-transparent"
                style={{ backgroundImage: `linear-gradient(135deg, ${customization.primaryColor || '#8B5CF6'}, ${customization.secondaryColor || '#EC4899'})` }}
                whileHover={{ scale: 1.1 }}
              >
                10+
              </motion.div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: textColor }}>Platforms</h3>
              <p style={{ color: textMuted }}>supported</p>
            </div>
            <div className="grid grid-cols-5 gap-3 relative z-10">
              {platformIcons.map((platform, index) => (
                <motion.div 
                  key={index} 
                  className={`aspect-square bg-gradient-to-br ${platform.gradient} p-0.5 rounded-lg`}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.15, y: -5 }}
                >
                  <div 
                    className="w-full h-full rounded-md flex flex-col items-center justify-center p-2 transition-colors"
                    style={{ backgroundColor: themeMode === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)' }}
                  >
                    <platform.Icon className="w-5 h-5 mb-1" style={{ color: textColor }} />
                    <div className="text-xs font-medium" style={{ color: customization.primaryColor || '#8B5CF6' }}>{platform.name}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom Features Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {[
            { icon: QrCode, title: "Discount Codes", desc: "Use promo codes for extra savings on your orders", gradient: "from-blue-500 to-cyan-500" },
            { icon: MessageSquare, title: "24/7 Support", desc: "Our support team is always ready to help you", gradient: "from-purple-500 to-pink-500" },
            { icon: Droplets, title: "Drip Feed", desc: "Gradual delivery for natural looking growth", gradient: "from-green-500 to-emerald-500" },
            { icon: Zap, title: "Instant Start", desc: "Most orders start within minutes of payment", gradient: "from-amber-500 to-orange-500" },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={featureCardVariants}
              whileHover={{ y: -8, scale: 1.03, rotateY: 5, rotateX: 3 }}
              className={`text-center p-8 ${cardBg} backdrop-blur-xl rounded-2xl border ${borderStyle} group relative overflow-hidden`}
            >
              <div className="relative z-10 mb-6">
                <motion.div 
                  className={`w-16 h-16 mx-auto bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center shadow-lg`}
                  whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
                  transition={{ duration: 0.4 }}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </motion.div>
              </div>
              
              <h3 className="font-semibold mb-3 text-lg relative z-10" style={{ color: textColor }}>
                {feature.title}
              </h3>
              <p className="text-sm relative z-10" style={{ color: textMuted }}>
                {feature.desc}
              </p>

              <motion.div 
                className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient}`}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.5 }}
                style={{ transformOrigin: "left" }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};