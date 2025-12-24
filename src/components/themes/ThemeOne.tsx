import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Shield, TrendingUp, Users, Star, PlayCircle, Clock, Headphones, CreditCard, CheckCircle } from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { ShiningButton } from "@/components/ui/shining-button";
import { motion } from "framer-motion";

// Social Media Icons for floating effect
const SocialIcon = ({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
  <motion.div
    initial={{ y: 0 }}
    animate={{ y: [-8, 8, -8] }}
    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    className={`absolute w-12 h-12 rounded-xl bg-gradient-to-br shadow-lg flex items-center justify-center text-white text-xl ${className}`}
    style={style}
  >
    {children}
  </motion.div>
);

export const ThemeOne = () => {
  const stats = [
    { label: "Active Users", value: "50K+", icon: Users },
    { label: "Orders Completed", value: "2M+", icon: TrendingUp },
    { label: "Success Rate", value: "99.9%", icon: Star },
    { label: "Services Available", value: "500+", icon: Zap }
  ];

  const services = [
    {
      category: "Instagram",
      icon: "📸",
      gradient: "from-pink-500 to-purple-500",
      services: ["Premium Followers", "Real Likes", "Story Views", "Comments"],
      price: "From $0.01"
    },
    {
      category: "YouTube",
      icon: "🎥",
      gradient: "from-red-500 to-red-600",
      services: ["Subscribers", "Views", "Watch Hours", "Likes"],
      price: "From $0.05"
    },
    {
      category: "TikTok",
      icon: "🎵",
      gradient: "from-gray-900 to-pink-500",
      services: ["Followers", "Likes", "Views", "Shares"],
      price: "From $0.02"
    },
    {
      category: "Telegram",
      icon: "✈️",
      gradient: "from-blue-400 to-blue-600",
      services: ["Members", "Post Views", "Reactions", "Comments"],
      price: "From $0.03"
    }
  ];

  const benefits = [
    { icon: Zap, title: "Instant Start", description: "Orders begin within seconds" },
    { icon: Shield, title: "No Password", description: "100% safe and secure" },
    { icon: CreditCard, title: "Money Back", description: "Full refund guarantee" },
    { icon: Headphones, title: "24/7 Support", description: "Always here to help" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white overflow-hidden">
      <Navigation />
      
      {/* Hero Section - AliPanel Style */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-[#0a0a1a] to-pink-900/30" />
        
        {/* Floating Social Icons */}
        <SocialIcon className="from-pink-500 to-rose-600 top-32 left-[10%]" style={{ animationDelay: "0s" }}>📸</SocialIcon>
        <SocialIcon className="from-blue-500 to-cyan-500 top-48 right-[15%]" style={{ animationDelay: "0.5s" }}>✈️</SocialIcon>
        <SocialIcon className="from-red-500 to-red-600 bottom-32 left-[20%]" style={{ animationDelay: "1s" }}>🎥</SocialIcon>
        <SocialIcon className="from-purple-500 to-pink-500 top-20 right-[25%]" style={{ animationDelay: "1.5s" }}>🎵</SocialIcon>
        <SocialIcon className="from-green-500 to-emerald-500 bottom-40 right-[10%]" style={{ animationDelay: "2s" }}>💬</SocialIcon>
        <SocialIcon className="from-blue-600 to-blue-700 bottom-20 left-[5%]" style={{ animationDelay: "2.5s" }}>👥</SocialIcon>
        
        {/* Glow Effects */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-[100px]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge Pills */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap justify-center gap-3 mb-8"
            >
              {["Premium Followers", "Bot Starts", "Post Views", "Reactions"].map((tag, i) => (
                <Badge 
                  key={tag}
                  variant="secondary" 
                  className="px-4 py-2 text-sm bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-colors"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {tag}
                </Badge>
              ))}
            </motion.div>
            
            {/* Main Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-7xl font-extrabold mb-6"
            >
              <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Grow Your
              </span>
              <br />
              <span className="text-white">Social Media</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              The #1 SMM Panel for Instagram, TikTok, YouTube and Telegram. 
              Get real followers, likes, and views with instant delivery.
            </motion.p>
            
            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <ShiningButton 
                gradient="rainbow" 
                size="lg" 
                className="text-lg px-10 py-6 shadow-2xl shadow-pink-500/25"
                asChild
              >
                <Link to="/services">
                  ⚡ Fast Order <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </ShiningButton>
              <Button 
                asChild 
                variant="outline" 
                size="lg" 
                className="text-lg px-10 py-6 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
              >
                <Link to="/register">
                  <PlayCircle className="mr-2" /> Create Account
                </Link>
              </Button>
            </motion.div>
            
            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {stats.map((stat, index) => (
                <Card 
                  key={index} 
                  className="p-5 bg-white/5 backdrop-blur-md border border-white/10 hover:border-purple-500/50 transition-all group hover:bg-white/10"
                >
                  <div className="flex items-center justify-center mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <stat.icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </Card>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gradient-to-b from-transparent to-purple-900/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
                  <benefit.icon className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">{benefit.title}</div>
                  <div className="text-xs text-gray-400">{benefit.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 px-4 py-1 bg-purple-500/20 text-purple-300 border-purple-500/30">
              Our Services
            </Badge>
            <h2 className="text-4xl font-bold text-white mb-4">Popular Services</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Choose from our wide range of social media marketing services
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 bg-white/5 backdrop-blur-md border border-white/10 hover:border-purple-500/50 transition-all group hover:bg-white/10 h-full">
                  <div className="text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform`}>
                      {service.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{service.category}</h3>
                    <div className="space-y-2 mb-4">
                      {service.services.map((item, i) => (
                        <div key={i} className="flex items-center justify-center gap-2 text-sm text-gray-400">
                          <CheckCircle className="w-3 h-3 text-green-400" />
                          {item}
                        </div>
                      ))}
                    </div>
                    <div className="text-lg font-semibold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-4">
                      {service.price}
                    </div>
                    <ShiningButton gradient="primary" className="w-full" asChild>
                      <Link to="/services">Order Now</Link>
                    </ShiningButton>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-purple-900/20 to-transparent">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="p-8 bg-gradient-to-br from-purple-500/20 to-transparent border border-purple-500/30 backdrop-blur-md hover:scale-[1.02] transition-transform">
              <Zap className="h-12 w-12 text-purple-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">Lightning Fast</h3>
              <p className="text-gray-400">
                Get your orders processed and delivered within minutes. Our automated system ensures rapid delivery.
              </p>
            </Card>
            
            <Card className="p-8 bg-gradient-to-br from-pink-500/20 to-transparent border border-pink-500/30 backdrop-blur-md hover:scale-[1.02] transition-transform">
              <Shield className="h-12 w-12 text-pink-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">100% Secure</h3>
              <p className="text-gray-400">
                Your account safety is our priority. We use the safest methods and never ask for your passwords.
              </p>
            </Card>
            
            <Card className="p-8 bg-gradient-to-br from-cyan-500/20 to-transparent border border-cyan-500/30 backdrop-blur-md hover:scale-[1.02] transition-transform">
              <Users className="h-12 w-12 text-cyan-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">24/7 Support</h3>
              <p className="text-gray-400">
                Our dedicated support team is available round the clock to help you with any questions or issues.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
