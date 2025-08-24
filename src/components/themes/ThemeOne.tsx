import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Shield, TrendingUp, Users, Star, PlayCircle } from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";

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
      services: ["Followers", "Likes", "Views", "Comments"],
      price: "From $0.01"
    },
    {
      category: "YouTube",
      icon: "🎥",
      services: ["Subscribers", "Views", "Likes", "Watch Time"],
      price: "From $0.05"
    },
    {
      category: "TikTok",
      icon: "🎵",
      services: ["Followers", "Likes", "Views", "Shares"],
      price: "From $0.02"
    },
    {
      category: "Twitter",
      icon: "🐦",
      services: ["Followers", "Retweets", "Likes", "Views"],
      price: "From $0.03"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/15 rounded-full blur-3xl animate-float-delayed"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm animate-fade-in">
              🚀 #1 SMM Panel Platform
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent mb-6 animate-slide-up">
              Boost Your Social
              <br />
              Media Presence
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up" style={{animationDelay: '0.2s'}}>
              Get real followers, likes, views and engagement across all major social media platforms. 
              Fast delivery, affordable prices, and 24/7 support.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-slide-up" style={{animationDelay: '0.4s'}}>
              <Button asChild size="lg" className="text-lg px-8 py-6 bg-gradient-primary hover:shadow-glow transition-all">
                <Link to="/services">
                  Start Growing Now <ArrowRight className="ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 border-primary/20 hover:bg-primary/5">
                <Link to="/register">
                  <PlayCircle className="mr-2" /> Watch Demo
                </Link>
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-slide-up" style={{animationDelay: '0.6s'}}>
              {stats.map((stat, index) => (
                <Card key={index} className="p-6 bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all hover-scale">
                  <div className="flex items-center justify-center mb-3">
                    <stat.icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gradient-to-b from-transparent to-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Popular Services</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose from our wide range of social media marketing services
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="p-6 bg-card/70 backdrop-blur-sm hover:bg-card/90 transition-all hover-scale border-primary/10 hover:border-primary/30">
                <div className="text-center">
                  <div className="text-4xl mb-4">{service.icon}</div>
                  <h3 className="text-xl font-bold mb-3">{service.category}</h3>
                  <div className="space-y-2 mb-4">
                    {service.services.map((item, i) => (
                      <div key={i} className="text-sm text-muted-foreground">
                        • {item}
                      </div>
                    ))}
                  </div>
                  <div className="text-lg font-semibold text-primary mb-4">{service.price}</div>
                  <Button asChild className="w-full">
                    <Link to="/services">
                      Order Now
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover-scale">
              <Zap className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-2xl font-bold mb-4">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Get your orders processed and delivered within minutes. Our automated system ensures rapid delivery.
              </p>
            </Card>
            
            <Card className="p-8 bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20 hover-scale">
              <Shield className="h-12 w-12 text-secondary mb-4" />
              <h3 className="text-2xl font-bold mb-4">100% Secure</h3>
              <p className="text-muted-foreground">
                Your account safety is our priority. We use the safest methods and never ask for your passwords.
              </p>
            </Card>
            
            <Card className="p-8 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20 hover-scale">
              <Users className="h-12 w-12 text-accent mb-4" />
              <h3 className="text-2xl font-bold mb-4">24/7 Support</h3>
              <p className="text-muted-foreground">
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