import { useState, useEffect } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  Zap, 
  Search, 
  TrendingUp, 
  Shield, 
  Clock,
  Star,
  Instagram,
  Youtube,
  Twitter,
  Facebook,
  ArrowRight,
  Sparkles,
  Target,
  Users,
  Eye,
  Heart,
  MessageCircle,
  Share2
} from "lucide-react";

const UserHome = () => {
  const { user, profile } = useAuth();
  const [services, setServices] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      // Fetch available services
      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .limit(8);

      // Fetch recent orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('buyer_id', profile?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setServices(servicesData || []);
      setRecentOrders(ordersData || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Instagram Followers",
      description: "Boost your Instagram presence",
      icon: Instagram,
      price: "$0.12",
      unit: "per 100",
      gradient: "from-pink-500 to-rose-500"
    },
    {
      title: "YouTube Views",
      description: "Increase video visibility",
      icon: Youtube,
      price: "$0.08",
      unit: "per 1000",
      gradient: "from-red-500 to-red-600"
    },
    {
      title: "TikTok Likes",
      description: "Get more engagement",
      icon: Heart,
      price: "$0.15",
      unit: "per 1000",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      title: "Twitter Followers",
      description: "Grow your audience",
      icon: Twitter,
      price: "$0.20",
      unit: "per 100",
      gradient: "from-blue-400 to-blue-600"
    }
  ];

  const platformStats = [
    { platform: "Instagram", icon: Instagram, color: "text-pink-400", orders: 847, revenue: "$10,847" },
    { platform: "YouTube", icon: Youtube, color: "text-red-400", orders: 634, revenue: "$8,234" },
    { platform: "TikTok", icon: Heart, color: "text-purple-400", orders: 523, revenue: "$6,789" },
    { platform: "Twitter", icon: Twitter, color: "text-blue-400", orders: 412, revenue: "$5,234" }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">Please log in to continue</h1>
          <Button asChild>
            <a href="/auth">Sign In</a>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-background to-secondary/20 pt-20">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        <div className="container mx-auto px-4 py-16 relative">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Welcome back, <span className="bg-gradient-primary bg-clip-text text-transparent">{profile?.full_name || user.email?.split('@')[0]}</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Ready to supercharge your social media presence? Explore our premium services and boost your online impact.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span>Secure & Safe</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span>Fast Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span>High Quality</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <Card className="bg-gradient-card border-border shadow-card">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-primary">{recentOrders.length}</h3>
                <p className="text-muted-foreground">Active Orders</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-card border-border shadow-card">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-primary">${profile?.balance || '0.00'}</h3>
                <p className="text-muted-foreground">Account Balance</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-card border-border shadow-card">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-primary">98.5%</h3>
                <p className="text-muted-foreground">Success Rate</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-card border-border shadow-card">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-primary">${profile?.total_spent || '0.00'}</h3>
                <p className="text-muted-foreground">Total Spent</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Quick Order</h2>
            <p className="text-muted-foreground">Start boosting your social media in just one click</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Card key={index} className="bg-gradient-card border-border shadow-card hover:shadow-elegant transition-all group cursor-pointer">
                <CardContent className="p-6">
                  <div className={`w-16 h-16 bg-gradient-to-r ${action.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{action.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{action.description}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-primary">{action.price}</span>
                      <span className="text-muted-foreground text-sm ml-1">{action.unit}</span>
                    </div>
                    <Button size="sm" className="bg-gradient-primary hover:shadow-glow">
                      Order
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Popular Services</h2>
            <p className="text-muted-foreground">Choose from our most requested social media services</p>
          </div>
          
          <Tabs defaultValue="instagram" className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:w-1/2 mx-auto mb-8">
              <TabsTrigger value="instagram" className="flex items-center gap-2">
                <Instagram className="w-4 h-4" />
                Instagram
              </TabsTrigger>
              <TabsTrigger value="youtube" className="flex items-center gap-2">
                <Youtube className="w-4 h-4" />
                YouTube
              </TabsTrigger>
              <TabsTrigger value="tiktok" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                TikTok
              </TabsTrigger>
              <TabsTrigger value="twitter" className="flex items-center gap-2">
                <Twitter className="w-4 h-4" />
                Twitter
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="instagram" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: "Instagram Followers", price: "$0.12", per: "100", features: ["High Quality", "Fast Delivery", "Guaranteed"] },
                  { name: "Instagram Likes", price: "$0.08", per: "100", features: ["Real Accounts", "Instant", "Safe"] },
                  { name: "Instagram Views", price: "$0.05", per: "1000", features: ["Premium Quality", "24/7 Support", "Refill"] }
                ].map((service, index) => (
                  <Card key={index} className="bg-gradient-card border-border shadow-card">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {service.name}
                        <Badge className="bg-pink-500/20 text-pink-400">Popular</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <span className="text-2xl font-bold text-primary">{service.price}</span>
                          <span className="text-muted-foreground ml-1">per {service.per}</span>
                        </div>
                      </div>
                      <ul className="space-y-2 mb-4">
                        {service.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm">
                            <Sparkles className="w-3 h-3 text-primary" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button className="w-full bg-gradient-primary hover:shadow-glow">
                        Order Now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            {/* Similar content for other tabs */}
            <TabsContent value="youtube" className="space-y-4">
              <div className="text-center py-12">
                <Youtube className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">YouTube Services</h3>
                <p className="text-muted-foreground">Boost your YouTube channel with views, subscribers, and likes</p>
                <Button className="mt-4 bg-gradient-primary hover:shadow-glow">
                  Explore YouTube Services
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="tiktok" className="space-y-4">
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">TikTok Services</h3>
                <p className="text-muted-foreground">Grow your TikTok presence with likes, followers, and views</p>
                <Button className="mt-4 bg-gradient-primary hover:shadow-glow">
                  Explore TikTok Services
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="twitter" className="space-y-4">
              <div className="text-center py-12">
                <Twitter className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Twitter Services</h3>
                <p className="text-muted-foreground">Increase your Twitter influence with followers, likes, and retweets</p>
                <Button className="mt-4 bg-gradient-primary hover:shadow-glow">
                  Explore Twitter Services
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Recent Activity */}
      {recentOrders.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Recent Orders</h2>
              <p className="text-muted-foreground">Track your latest social media boosts</p>
            </div>
            
            <div className="max-w-4xl mx-auto space-y-4">
              {recentOrders.slice(0, 3).map((order, index) => (
                <Card key={index} className="bg-gradient-card border-border shadow-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                          <Target className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Order #{order.order_number}</h3>
                          <p className="text-muted-foreground text-sm">{order.target_url}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          className={
                            order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            order.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }
                        >
                          {order.status}
                        </Badge>
                        <p className="text-muted-foreground text-sm mt-1">${order.price}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <div className="text-center pt-8">
                <Button variant="outline" className="gap-2">
                  View All Orders
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default UserHome;