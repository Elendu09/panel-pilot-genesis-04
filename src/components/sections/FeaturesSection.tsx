import { 
  CreditCard, 
  MessageSquare, 
  Droplets, 
  Zap,
  QrCode,
  Languages,
  Flag,
  Shield,
  TrendingUp,
  Headphones,
  Gift,
  Building2
} from "lucide-react";
import { motion } from "framer-motion";
import { PayPalIcon, StripeIcon, BitcoinIcon, RazorpayIcon } from "@/components/payment/PaymentIcons";
import { BackgroundEffects } from "@/components/effects/BackgroundEffects";

export const FeaturesSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40, rotateX: -5 },
    visible: { 
      opacity: 1, 
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring" as const,
        stiffness: 80,
        damping: 15
      }
    }
  };

  const featureCardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Grid, Bubbles & Particles */}
      <BackgroundEffects variant="section" showGrid showBubbles showParticles bubbleCount={6} particleCount={12} />
      
      {/* Background decoration */}
      <div className="absolute inset-0 bg-mesh opacity-30" />

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
            No code solution
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
            whileHover={{ y: -8, scale: 1.02 }}
            className="glass-card p-8 group relative overflow-hidden"
          >
            {/* Animated background */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
            
            <div className="text-center mb-8 relative z-10">
              <motion.div 
                className="text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2"
                whileHover={{ scale: 1.1 }}
              >
                200+
              </motion.div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">Payment systems</h3>
              <p className="text-muted-foreground">for every country</p>
            </div>
            <div className="space-y-3 relative z-10">
              {[
                { name: "PayPal", Icon: PayPalIcon },
                { name: "Razorpay", Icon: RazorpayIcon },
                { name: "Crypto/USDT", Icon: BitcoinIcon },
                { name: "Stripe", Icon: StripeIcon },
                { name: "Bank Transfer", Icon: Building2, isLucide: true },
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
                    {payment.isLucide ? (
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                        <payment.Icon className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <payment.Icon className="w-8 h-8 rounded-lg" />
                    )}
                    {payment.name}
                  </span>
                  <motion.div 
                    className="w-2 h-2 bg-primary rounded-full"
                    whileHover={{ scale: 1.5 }}
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
            whileHover={{ y: -8, scale: 1.02 }}
            className="glass-card p-8 group relative overflow-hidden"
          >
            {/* Animated particles background */}
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
              <motion.div 
                className="absolute bottom-16 left-20 w-1.5 h-1.5 bg-primary/40 rounded-full"
                animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              />
            </div>
            
            <div className="text-center relative z-10">
              <h3 className="text-xl font-semibold mb-2 bg-gradient-primary bg-clip-text text-transparent">Easy start</h3>
              <p className="text-muted-foreground mb-8">to run own panel</p>
            </div>
            
            {/* Enhanced Dashboard Visual */}
            <div className="relative w-56 h-56 mx-auto mb-6">
              {/* Outer glow ring */}
              <motion.div 
                className="absolute inset-0 rounded-full border-4 border-primary/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Feature Icons */}
              {[
                { icon: Shield, label: "DDOS", position: "top-2 left-1/2 -translate-x-1/2" },
                { icon: TrendingUp, label: "Tracker", position: "top-1/2 left-2 -translate-y-1/2" },
                { icon: Zap, label: "Premium", position: "top-1/2 right-2 -translate-y-1/2" },
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
              
              {/* Center Dashboard */}
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

          {/* Language Localizations Card */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            className="glass-card p-8 group relative overflow-hidden"
          >
            {/* Animated background */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
            
            <div className="text-center mb-8 relative z-10">
              <motion.div 
                className="text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2"
                whileHover={{ scale: 1.1 }}
              >
                20+
              </motion.div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">Language</h3>
              <p className="text-muted-foreground">localizations</p>
            </div>
            <div className="grid grid-cols-5 gap-3 relative z-10">
              {[
                { flag: "🇩🇪", name: "DE", gradient: "from-red-500 to-yellow-500" },
                { flag: "🇰🇷", name: "KR", gradient: "from-blue-500 to-red-500" },
                { flag: "🇺🇸", name: "US", gradient: "from-blue-500 to-red-500" },
                { flag: "🇮🇳", name: "IN", gradient: "from-orange-500 to-green-500" },
                { flag: "🇵🇰", name: "PK", gradient: "from-green-500 to-white" },
              ].map((country, index) => (
                <motion.div 
                  key={index} 
                  className={`aspect-square bg-gradient-to-br ${country.gradient} p-0.5 rounded-lg`}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.15, y: -5 }}
                >
                  <div className="w-full h-full bg-background/90 rounded-md flex flex-col items-center justify-center p-2 hover:bg-background/70 transition-colors">
                    <div className="text-2xl mb-1">{country.flag}</div>
                    <div className="text-xs text-primary font-medium">{country.name}</div>
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
            { icon: QrCode, title: "Promocode", desc: "Create promo codes to attract new users or retain old ones", gradient: "from-blue-500 to-cyan-500" },
            { icon: MessageSquare, title: "Pop-up messages", desc: "Notify your users and keep in touch with them", gradient: "from-purple-500 to-pink-500" },
            { icon: Droplets, title: "Drip Feed", desc: "Raise social engagement at the desired speed", gradient: "from-green-500 to-emerald-500" },
            { icon: Zap, title: "Integrations", desc: "We have a bunch of integrations to fit in your panel", gradient: "from-amber-500 to-orange-500" },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={featureCardVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="text-center p-8 glass-card group relative overflow-hidden"
            >
              {/* Animated background */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              />
              
              {/* Icon with glow effect */}
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

              {/* Bottom accent */}
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
