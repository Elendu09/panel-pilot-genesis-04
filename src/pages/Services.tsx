import { useState, useMemo, useCallback, memo } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Users, Search, Package, TrendingUp, Shield, CheckCircle, LayoutDashboard, ShoppingCart, Heart, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";

const topServices = [
  {
    id: 1,
    rank: 1,
    icon: "📦",
    title: "Premium BOT START MIX",
    subtitle: "BOT START • boostlega.online",
    provider: "Direct provider",
    activeAccounts: "3519 active accounts",
    category: "Ads",
    price: "$6.9",
    featured: true
  },
  {
    id: 2,
    rank: 1,
    icon: "📦",
    title: "Premium подписчики 14 DAYS",
    subtitle: "Telegram Premium подписчик • boostlega.online",
    provider: "Direct provider",
    activeAccounts: "2600 active accounts",
    category: "Ads",
    price: "$8.1",
    featured: false
  },
  {
    id: 3,
    rank: 1,
    icon: "⭐",
    title: "Premium BOT START | NO ACTIVITY | 30 DAYS",
    subtitle: "Premium BOT START • testagram.com",
    provider: "Direct provider",
    activeAccounts: "12778 active accounts",
    category: "Ads",
    price: "$4",
    featured: false
  },
  {
    id: 4,
    rank: 1,
    icon: "🎯",
    title: "IG ru Подписчики RU HQ ( 6 ≡ 30 )",
    subtitle: "Instagram подписчик (таргет) • asmm.pro",
    provider: "Direct provider",
    activeAccounts: "8500 active accounts",
    category: "Ads",
    price: "$5.4",
    featured: false
  }
];

const socialPlatforms = [
  { id: 'all', name: 'All', color: 'bg-blue-500' },
  { id: 'telegram', name: 'Telegram', color: 'bg-blue-400' },
  { id: 'instagram', name: 'Instagram', color: 'bg-pink-500' },
  { id: 'tiktok', name: 'TikTok', color: 'bg-black' },
  { id: 'vk', name: 'VK', color: 'bg-blue-600' },
  { id: 'youtube', name: 'Youtube', color: 'bg-red-500' },
  { id: 'facebook', name: 'Facebook', color: 'bg-blue-700' },
  { id: 'twitter', name: 'Twitter', color: 'bg-sky-400' }
];

// Memoized Service Card
const ServiceCard = memo(({ service }: { service: typeof topServices[0] }) => (
  <Card className="bg-card/50 border-border/50 hover:bg-card/80 hover:border-primary/20 transition-all duration-300 group">
    <CardContent className="p-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="text-2xl font-bold text-primary min-w-[2rem] bg-gradient-primary bg-clip-text text-transparent">
            #{service.rank}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
              <span className="text-lg">{service.icon}</span>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">{service.title}</h3>
              <p className="text-muted-foreground text-sm">{service.subtitle}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Badge className="bg-gradient-success text-white border-0">
              <Shield className="w-3 h-3 mr-1" />
              {service.provider}
            </Badge>
            <div className="flex items-center gap-1 text-primary">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">{service.activeAccounts}</span>
            </div>
          </div>

          <Badge variant="secondary" className="bg-accent text-accent-foreground">
            <Package className="w-3 h-3 mr-1" />
            {service.category}
          </Badge>

          <div className="text-right">
            <div className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">≈ {service.price}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span>4.9</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hover:text-primary">
              <Heart className="w-4 h-4" />
            </Button>
            <Button className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Order
            </Button>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
));
ServiceCard.displayName = 'ServiceCard';

// Memoized Platform Button
const PlatformButton = memo(({ platform, isActive, onClick }: { 
  platform: typeof socialPlatforms[0]; 
  isActive: boolean;
  onClick: () => void;
}) => (
  <Button
    variant={isActive ? 'default' : 'outline'}
    size="sm"
    onClick={onClick}
    className={`transition-all duration-300 ${
      isActive 
        ? 'bg-gradient-primary shadow-glow' 
        : 'bg-card border-border hover:border-primary/50 hover:bg-card/80'
    }`}
  >
    {platform.name}
  </Button>
));
PlatformButton.displayName = 'PlatformButton';

const Services = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activePlatform, setActivePlatform] = useState('all');
  const { user, profile } = useAuth();

  const handlePlatformClick = useCallback((platformId: string) => {
    setActivePlatform(platformId);
  }, []);

  const filteredServices = useMemo(() => {
    return topServices.filter(service => 
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.subtitle.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const getDashboardPath = useCallback(() => {
    if (!profile) return '/auth';
    return profile.role === 'admin' ? '/admin' : '/panel';
  }, [profile]);

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Helmet>
        <title>Top SMM Services | SMMPilot Platform</title>
        <meta name="description" content="Discover the best SMM panel services with high quality providers, competitive pricing, and reliable delivery for Instagram, YouTube, TikTok and more." />
        <meta name="keywords" content="SMM services, social media marketing, instagram followers, youtube subscribers, tiktok likes, best SMM panel" />
        <link rel="canonical" href={`${typeof window !== 'undefined' ? window.location.origin : ''}/services`} />
      </Helmet>
      <Navigation />
      
      <div className="container mx-auto px-4 pt-32 pb-16">
        {/* Auth User Quick Actions */}
        {user && (
          <div className="max-w-6xl mx-auto mb-8">
            <Card className="bg-gradient-card border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                      <Zap className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Welcome back, {profile?.full_name || user.email?.split('@')[0]}</p>
                      <p className="text-sm text-muted-foreground">Quick access to your dashboard and orders</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button asChild variant="outline" size="sm">
                      <Link to="/new-order">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        New Order
                      </Link>
                    </Button>
                    <Button asChild size="sm" className="bg-gradient-primary hover:shadow-glow">
                      <Link to={getDashboardPath()}>
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
            <TrendingUp className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Top SMM Panel Services
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-2">
            Premium quality services with proven performance
          </p>
          <p className="text-muted-foreground/70 text-sm">
            Ranked by service quality, reliability and customer satisfaction
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search services (e.g., instagram likes, youtube views)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-card border-border text-foreground placeholder-muted-foreground"
              />
            </div>
            <Button className="bg-gradient-primary hover:shadow-glow px-8">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>

          <Tabs defaultValue="services" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-card border-border">
              <TabsTrigger value="providers">Top Providers</TabsTrigger>
              <TabsTrigger value="services">All Services</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex justify-end mt-4">
            <Select defaultValue="usd">
              <SelectTrigger className="w-32 bg-card border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usd">USD $</SelectItem>
                <SelectItem value="eur">EUR €</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Social Platform Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {socialPlatforms.map((platform) => (
            <PlatformButton
              key={platform.id}
              platform={platform}
              isActive={activePlatform === platform.id}
              onClick={() => handlePlatformClick(platform.id)}
            />
          ))}
        </div>

        {/* Services List */}
        <div className="max-w-6xl mx-auto space-y-4">
          {filteredServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
          {filteredServices.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No services found matching your search.</p>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="border-primary/20 bg-gradient-card max-w-2xl mx-auto shadow-elegant">
            <CardContent className="p-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow">
                  <TrendingUp className="w-6 h-6 text-primary-foreground" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
                {user ? 'Ready to Place an Order?' : 'Want to List Your Services?'}
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {user 
                  ? 'Access your dashboard to manage orders, track progress, and discover exclusive deals.'
                  : 'Join thousands of successful SMM providers and showcase your services to a global audience.'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {user ? (
                  <>
                    <Button asChild size="lg" className="bg-gradient-primary hover:shadow-glow">
                      <Link to={getDashboardPath()}>
                        <LayoutDashboard className="w-5 h-5 mr-2" />
                        Go to Dashboard
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <Link to="/new-order">
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Place Order
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild size="lg" className="bg-gradient-primary hover:shadow-glow">
                      <Link to="/auth">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Get Started
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <Link to="/contact">Learn More</Link>
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Services;
