import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Rocket, Target, Heart, Zap, Users } from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";

export const ThemeThree = () => {
  const platforms = [
    { name: "Instagram", color: "from-pink-500 to-purple-500", emoji: "📸" },
    { name: "YouTube", color: "from-red-500 to-red-600", emoji: "🎥" },
    { name: "TikTok", color: "from-black to-red-500", emoji: "🎵" },
    { name: "Twitter", color: "from-blue-400 to-blue-500", emoji: "🐦" },
    { name: "Facebook", color: "from-blue-600 to-blue-700", emoji: "👥" },
    { name: "LinkedIn", color: "from-blue-700 to-blue-800", emoji: "💼" }
  ];

  const benefits = [
    {
      icon: Rocket,
      title: "Viral Growth",
      description: "Transform your content into viral sensations with our proven strategies",
      color: "text-pink-500"
    },
    {
      icon: Target,
      title: "Targeted Audience",
      description: "Reach your ideal audience with precision-targeted engagement",
      color: "text-purple-500"
    },
    {
      icon: Sparkles,
      title: "Premium Quality",
      description: "High-quality engagement from real, active users worldwide",
      color: "text-yellow-500"
    },
    {
      icon: Heart,
      title: "Loved by Creators",
      description: "Trusted by 100K+ content creators and influencers globally",
      color: "text-red-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
      <Navigation />
      
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-32 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-32 left-40 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-56 h-56 bg-indigo-500/20 rounded-full blur-3xl animate-float-delayed"></div>
      </div>
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 z-10">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-5xl mx-auto">
            <Badge variant="secondary" className="mb-6 px-6 py-3 text-lg bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500/30 animate-pulse">
              ✨ The Future of Social Media Growth
            </Badge>
            
            <h1 className="text-6xl md:text-8xl font-extrabold mb-8 animate-slide-up">
              <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                Go Viral
              </span>
              <br />
              <span className="text-white">
                Today!
              </span>
            </h1>
            
            <p className="text-2xl text-purple-100 mb-10 max-w-3xl mx-auto leading-relaxed animate-slide-up" style={{animationDelay: '0.2s'}}>
              🚀 Join the revolution! Get instant followers, likes, and views across all platforms. 
              <span className="text-pink-300 font-semibold"> 2M+ orders delivered</span> with 
              <span className="text-yellow-300 font-semibold"> 99.9% success rate!</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 animate-slide-up" style={{animationDelay: '0.4s'}}>
              <Button asChild size="lg" className="text-xl px-10 py-8 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-2xl hover:shadow-pink-500/25 transform hover:scale-105 transition-all">
                <Link to="/services">
                  🔥 Start Growing Now <ArrowRight className="ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-xl px-10 py-8 border-purple-400/50 text-purple-100 hover:bg-purple-500/20 shadow-xl">
                <Link to="/register">
                  <Sparkles className="mr-2" /> See Magic Happen
                </Link>
              </Button>
            </div>
            
            {/* Platform Icons */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-6 animate-slide-up" style={{animationDelay: '0.6s'}}>
              {platforms.map((platform, index) => (
                <Card key={index} className={`p-6 bg-gradient-to-br ${platform.color} border-0 hover-scale cursor-pointer group`}>
                  <div className="text-center">
                    <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">{platform.emoji}</div>
                    <div className="text-white font-bold text-sm">{platform.name}</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "2M+", label: "Orders Delivered", icon: "🚀" },
              { value: "100K+", label: "Happy Creators", icon: "😍" },
              { value: "99.9%", label: "Success Rate", icon: "⭐" },
              { value: "24/7", label: "Support", icon: "💬" }
            ].map((stat, index) => (
              <Card key={index} className="p-6 bg-white/10 backdrop-blur-sm border-white/20 text-center hover-scale">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-purple-200 text-sm">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              Why Creators Love Us
            </h2>
            <p className="text-2xl text-purple-100">
              Join the movement that's changing social media forever! 🌟
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-8 bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all hover-scale text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 ${benefit.color} bg-white/10`}>
                  <benefit.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-white">{benefit.title}</h3>
                <p className="text-purple-200">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <Card className="p-12 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500/30 text-center backdrop-blur-sm">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-4xl font-bold mb-6 text-white">
              Ready to Break the Internet?
            </h2>
            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Join thousands of creators who are already dominating social media with our services!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-xl px-10 py-8 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold shadow-2xl hover:shadow-yellow-500/25">
                <Link to="/register">
                  🔥 Join the Revolution
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-xl px-10 py-8 border-white/50 text-white hover:bg-white/10">
                <Link to="/services">
                  💎 View Premium Services
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};