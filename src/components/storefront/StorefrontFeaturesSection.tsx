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
} from "lucide-react";
import { motion } from "framer-motion";

interface StorefrontFeaturesSectionProps {
  customization?: any;
}

export const StorefrontFeaturesSection = ({ customization = {} }: StorefrontFeaturesSectionProps) => {
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

  return (
    <section id="features" className="py-24 bg-background relative overflow-hidden">
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
      
      {/* Background decoration */}
      <div className="absolute inset-0 bg-mesh opacity-30" />
      
      {/* Animated gradient orbs */}
      <motion.div 
        className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
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
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
        >
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Powerful Features</span>
        </motion.div>

        <motion.h2 
          className="text-4xl md:text-5xl font-bold mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <span className="bg-gradient-primary bg-clip-text text-transparent">
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
            className="glass-card p-8 group relative overflow-hidden perspective-1000 transform-3d"
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 shimmer-effect opacity-0 group-hover:opacity-100 pointer-events-none rounded-xl" />
            
            {/* Gradient border glow */}
            <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-primary/40 via-accent/40 to-primary/40 opacity-0 group-hover:opacity-100 blur-[2px] transition-opacity duration-500" style={{ zIndex: -1 }} />
            
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
            
            <div className="text-center mb-8 relative z-10">
              <motion.div 
                className="text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2"
                whileHover={{ scale: 1.1 }}
              >
                50+
              </motion.div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">Payment Methods</h3>
              <p className="text-muted-foreground">for every country</p>
            </div>
            <div className="space-y-3 relative z-10">
              {[
                { name: "PayPal", letter: "P", gradient: "from-blue-500 to-blue-600" },
                { name: "Stripe", letter: "S", gradient: "from-purple-500 to-indigo-600" },
                { name: "Crypto", letter: "₿", gradient: "from-yellow-500 to-amber-500" },
                { name: "Bank Transfer", letter: "B", gradient: "from-green-500 to-green-600" },
              ].map((payment, index) => (
                <motion.div 
                  key={payment.name}
                  className="flex items-center justify-between p-4 bg-background/60 rounded-lg border border-primary/20 hover:border-primary/40 transition-all"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 5, backgroundColor: "hsl(var(--primary) / 0.1)" }}
                >
                  <span className="font-medium flex items-center gap-3">
                    <div className={`w-8 h-8 bg-gradient-to-br ${payment.gradient} rounded-lg flex items-center justify-center text-white text-xs font-bold`}>
                      {payment.letter}
                    </div>
                    {payment.name}
                  </span>
                  <motion.div 
                    className={`w-6 h-6 bg-gradient-to-br ${payment.gradient} rounded-full`}
                    whileHover={{ scale: 1.2, rotate: 180 }}
                  />
                </motion.div>
              ))}
              <p className="text-center text-primary/70 text-sm mt-6 font-medium group-hover:text-primary transition-colors">
                and much more...
              </p>
            </div>
          </motion.div>

          {/* Center Enhanced Dashboard Card */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -8, scale: 1.02, rotateY: -3, rotateX: 2 }}
            className="glass-card p-8 group relative overflow-hidden perspective-1000 transform-3d"
          >
            <div className="absolute inset-0">
              <motion.div 
                className="absolute top-10 left-10 w-2 h-2 bg-primary/30 rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div 
                className="absolute top-20 right-16 w-1 h-1 bg-accent/50 rounded-full"
                animate={{ scale: [1, 2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
              />
            </div>
            
            <div className="text-center relative z-10">
              <h3 className="text-xl font-semibold mb-2 bg-gradient-primary bg-clip-text text-transparent">Easy to use</h3>
              <p className="text-muted-foreground mb-8">Simple ordering process</p>
            </div>
            
            {/* Dashboard Visual */}
            <div className="relative w-56 h-56 mx-auto mb-6">
              <motion.div 
                className="absolute inset-0 rounded-full border-4 border-primary/20"
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
                  className={`absolute ${item.position} transform glass-card rounded-lg p-2 border border-primary/30`}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.1, borderColor: "hsl(var(--primary))" }}
                >
                  <item.icon className="w-4 h-4 text-primary" />
                  <span className="text-xs text-primary font-medium block mt-1">{item.label}</span>
                </motion.div>
              ))}
              
              <motion.div 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-glow"
                animate={{ 
                  boxShadow: [
                    "0 0 20px hsl(var(--primary) / 0.3)",
                    "0 0 40px hsl(var(--primary) / 0.5)",
                    "0 0 20px hsl(var(--primary) / 0.3)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                whileHover={{ scale: 1.1 }}
              >
                <Zap className="w-10 h-10 text-primary-foreground" />
              </motion.div>
            </div>
          </motion.div>

          {/* Services Card */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -8, scale: 1.02, rotateY: 3, rotateX: 2 }}
            className="glass-card p-8 group relative overflow-hidden perspective-1000 transform-3d"
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 shimmer-effect opacity-0 group-hover:opacity-100 pointer-events-none rounded-xl" />
            
            {/* Gradient border glow */}
            <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-accent/40 via-primary/40 to-accent/40 opacity-0 group-hover:opacity-100 blur-[2px] transition-opacity duration-500" style={{ zIndex: -1 }} />
            
            <motion.div 
              className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
            
            <div className="text-center mb-8 relative z-10">
              <motion.div 
                className="text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2"
                whileHover={{ scale: 1.1 }}
              >
                10+
              </motion.div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">Platforms</h3>
              <p className="text-muted-foreground">supported</p>
            </div>
            <div className="grid grid-cols-5 gap-3 relative z-10">
              {[
                { icon: "📸", name: "IG", gradient: "from-pink-500 to-purple-500" },
                { icon: "🎵", name: "TT", gradient: "from-gray-900 to-pink-500" },
                { icon: "🎥", name: "YT", gradient: "from-red-500 to-red-600" },
                { icon: "✈️", name: "TG", gradient: "from-blue-400 to-blue-600" },
                { icon: "🐦", name: "X", gradient: "from-gray-800 to-gray-900" },
              ].map((platform, index) => (
                <motion.div 
                  key={index} 
                  className={`aspect-square bg-gradient-to-br ${platform.gradient} p-0.5 rounded-lg`}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.15, y: -5 }}
                >
                  <div className="w-full h-full bg-background/90 rounded-md flex flex-col items-center justify-center p-2 hover:bg-background/70 transition-colors">
                    <div className="text-2xl mb-1">{platform.icon}</div>
                    <div className="text-xs text-primary font-medium">{platform.name}</div>
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
              className="text-center p-8 glass-card group relative overflow-hidden perspective-1000 transform-3d hover-tilt"
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 shimmer-effect opacity-0 group-hover:opacity-100 pointer-events-none rounded-xl" />
              
              {/* Gradient border glow */}
              <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 opacity-0 group-hover:opacity-100 blur-[2px] transition-opacity duration-500" style={{ zIndex: -1 }} />
              
              <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              />
              
              <div className="relative z-10 mb-6">
                <motion.div 
                  className={`w-16 h-16 mx-auto bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center shadow-lg`}
                  whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
                  transition={{ duration: 0.4 }}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </motion.div>
              </div>
              
              <h3 className="font-semibold mb-3 text-lg group-hover:text-primary transition-colors relative z-10">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground relative z-10">
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
