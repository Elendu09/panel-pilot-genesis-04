import { Helmet } from "react-helmet-async";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  Shield, 
  BarChart3, 
  Palette, 
  Users, 
  Globe, 
  Clock, 
  Smartphone,
  DollarSign,
  Settings,
  TrendingUp,
  Lock,
  CheckCircle,
  ArrowRight,
  Instagram,
  Youtube,
  Music,
  Twitter,
  Linkedin,
  Send,
  MessageSquare,
  Facebook,
  type LucideIcon
} from "lucide-react";
import { Link } from "react-router-dom";

// Platform icons with proper gradients
const platformsData: { name: string; icon: LucideIcon; gradient: string }[] = [
  { name: "Instagram", icon: Instagram, gradient: "from-pink-500 to-purple-600" },
  { name: "YouTube", icon: Youtube, gradient: "from-red-500 to-red-600" },
  { name: "TikTok", icon: Music, gradient: "from-gray-900 to-pink-500" },
  { name: "Twitter", icon: Twitter, gradient: "from-blue-400 to-blue-500" },
  { name: "Facebook", icon: Facebook, gradient: "from-blue-600 to-blue-700" },
  { name: "LinkedIn", icon: Linkedin, gradient: "from-blue-700 to-blue-800" },
  { name: "Telegram", icon: Send, gradient: "from-sky-400 to-sky-600" },
  { name: "Discord", icon: MessageSquare, gradient: "from-indigo-500 to-indigo-600" }
];

export default function Features() {
  const features = [
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Lightning Fast",
      description: "Get your orders processed instantly with our automated systems",
      benefits: ["Instant order processing", "Real-time updates", "24/7 automation"]
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Enterprise Security",
      description: "Bank-level security with SSL encryption and secure payment processing",
      benefits: ["SSL encryption", "Secure payments", "Data protection"]
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Advanced Analytics",
      description: "Track your performance with detailed analytics and reporting",
      benefits: ["Real-time dashboards", "Performance metrics", "Export reports"]
    },
    {
      icon: <Palette className="h-8 w-8" />,
      title: "Custom Branding",
      description: "White-label solution with your own branding and domain",
      benefits: ["Custom themes", "Your logo", "Custom domain"]
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Multi-User Management",
      description: "Manage different user roles and permissions efficiently",
      benefits: ["Role-based access", "User permissions", "Team collaboration"]
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Global Reach",
      description: "Support for multiple languages and currencies worldwide",
      benefits: ["Multi-language", "Multiple currencies", "Global support"]
    }
  ];

  // Use platformsData defined above

  const stats = [
    { number: "500K+", label: "Orders Delivered", icon: <CheckCircle className="h-6 w-6" /> },
    { number: "99.9%", label: "Uptime", icon: <Clock className="h-6 w-6" /> },
    { number: "10K+", label: "Happy Customers", icon: <Users className="h-6 w-6" /> },
    { number: "24/7", label: "Support", icon: <Settings className="h-6 w-6" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <Badge className="mb-6 bg-gradient-primary text-primary-foreground">
              <Zap className="w-4 h-4 mr-2" />
              Feature Rich Platform
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent mb-6">
              Powerful Features for
              <br />Your SMM Business
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Everything you need to build, manage, and scale your social media marketing panel
            </p>
            <Button asChild size="lg" className="bg-gradient-primary hover:shadow-glow">
              <Link to="/auth">
                Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => (
              <Card key={index} className="p-6 text-center bg-card/70 backdrop-blur-sm">
                <div className="flex justify-center mb-3 text-primary">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Core Features</h2>
            <p className="text-xl text-muted-foreground">
              Built for performance, designed for growth
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-8 bg-card/70 backdrop-blur-sm hover:bg-card/90 transition-all hover-scale">
                <div className="text-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground mb-6">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Platforms */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Supported Platforms</h2>
            <p className="text-xl text-muted-foreground">
              Connect with all major social media platforms
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {platformsData.map((platform, index) => {
              const IconComponent = platform.icon;
              return (
                <Card key={index} className="p-6 text-center bg-card/70 backdrop-blur-sm hover:bg-card/90 transition-all hover-scale group">
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${platform.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div className="font-medium text-sm">{platform.name}</div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Advanced Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-6 bg-gradient-primary text-primary-foreground">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Advanced Features
                </Badge>
                <h2 className="text-4xl font-bold mb-6">
                  Built for Scale & Performance
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Our platform is designed to handle high-volume operations while maintaining
                  the flexibility you need to customize your business.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Flexible Pricing</h3>
                      <p className="text-muted-foreground">Set your own prices and profit margins for each service</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Smartphone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Mobile Responsive</h3>
                      <p className="text-muted-foreground">Fully optimized for mobile devices and tablets</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Lock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Secure API</h3>
                      <p className="text-muted-foreground">RESTful API with authentication and rate limiting</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                    <BarChart3 className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Real-time Dashboard</h3>
                  <p className="text-muted-foreground mb-6">
                    Monitor your business performance with live analytics and insights
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-4 bg-card/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">$24,890</div>
                      <div className="text-sm text-muted-foreground">This Month</div>
                    </div>
                    <div className="p-4 bg-card/50 rounded-lg">
                      <div className="text-2xl font-bold text-green-500">+23%</div>
                      <div className="text-sm text-muted-foreground">Growth</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of businesses already using SMMPilot
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-primary hover:shadow-glow">
              <Link to="/auth">Start Free Trial</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}