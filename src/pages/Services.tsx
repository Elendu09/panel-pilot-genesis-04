import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Search, Filter, Star, Clock, Users, TrendingUp, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function Services() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sample services data (will be replaced with real data from Supabase)
  const sampleServices = [
    {
      id: '1',
      name: 'Instagram Followers',
      description: 'High-quality Instagram followers from real accounts',
      category: 'instagram',
      price: 0.01,
      min_quantity: 100,
      max_quantity: 100000,
      estimated_time: '0-1 hour',
      features: ['Real accounts', 'No password required', 'Instant start', 'Lifetime guarantee']
    },
    {
      id: '2',
      name: 'YouTube Views',
      description: 'Boost your YouTube video views with real engagement',
      category: 'youtube',
      price: 0.05,
      min_quantity: 1000,
      max_quantity: 1000000,
      estimated_time: '1-6 hours',
      features: ['Real views', 'High retention', 'Safe for monetization', '24/7 support']
    },
    {
      id: '3',
      name: 'TikTok Likes',
      description: 'Get more likes on your TikTok videos instantly',
      category: 'tiktok',
      price: 0.02,
      min_quantity: 100,
      max_quantity: 500000,
      estimated_time: '0-30 minutes',
      features: ['Instant delivery', 'Real users', 'No drop guarantee', 'Worldwide']
    },
    {
      id: '4',
      name: 'Twitter Followers',
      description: 'Grow your Twitter following with active users',
      category: 'twitter',
      price: 0.03,
      min_quantity: 50,
      max_quantity: 50000,
      estimated_time: '1-2 hours',
      features: ['Active users', 'Profile picture', 'Bio included', 'Safe delivery']
    },
    {
      id: '5',
      name: 'Facebook Page Likes',
      description: 'Increase your Facebook page likes from real users',
      category: 'facebook',
      price: 0.04,
      min_quantity: 100,
      max_quantity: 100000,
      estimated_time: '2-4 hours',
      features: ['Real users', 'Mixed gender', 'Worldwide', 'No password']
    },
    {
      id: '6',
      name: 'LinkedIn Connections',
      description: 'Professional LinkedIn connections for networking',
      category: 'linkedin',
      price: 0.08,
      min_quantity: 50,
      max_quantity: 10000,
      estimated_time: '6-12 hours',
      features: ['Professional profiles', 'Real accounts', 'Slow delivery', 'Safe method']
    }
  ];

  const categories = [
    { id: 'all', name: 'All Services', icon: '🌟' },
    { id: 'instagram', name: 'Instagram', icon: '📸' },
    { id: 'youtube', name: 'YouTube', icon: '🎥' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵' },
    { id: 'twitter', name: 'Twitter', icon: '🐦' },
    { id: 'facebook', name: 'Facebook', icon: '👥' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼' }
  ];

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('is_active', true);
        
        if (error) throw error;
        
        // Use sample data if no services in database
        setServices(data?.length > 0 ? data : sampleServices);
      } catch (error) {
        console.error('Error fetching services:', error);
        setServices(sampleServices);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.icon : '🌟';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto mb-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent mb-6">
              Premium SMM Services
            </h1>
            <p className="text-xl text-muted-foreground">
              Choose from our wide range of high-quality social media marketing services
            </p>
          </div>
          
          {/* Search and Filter */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>
          </div>
          
          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="max-w-4xl mx-auto">
            <TabsList className="grid grid-cols-4 md:grid-cols-7 mb-8">
              {categories.map(category => (
                <TabsTrigger key={category.id} value={category.id} className="text-xs md:text-sm">
                  <span className="mr-1">{category.icon}</span>
                  <span className="hidden md:inline">{category.name}</span>
                  <span className="md:hidden">{category.name.split(' ')[0]}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </section>

      {/* Services Grid */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="h-4 bg-muted rounded mb-4"></div>
                  <div className="h-3 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded mb-4"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <Card key={service.id} className="p-6 bg-card/70 backdrop-blur-sm hover:bg-card/90 transition-all hover-scale border-primary/10 hover:border-primary/30">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getCategoryIcon(service.category)}</span>
                      <Badge variant="secondary" className="capitalize">
                        {service.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-medium">4.9</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2">{service.name}</h3>
                  <p className="text-muted-foreground mb-4 line-clamp-2">{service.description}</p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        Price per 1K
                      </span>
                      <span className="font-bold text-primary">${service.price.toFixed(3)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        Min/Max
                      </span>
                      <span>{service.min_quantity.toLocaleString()} - {service.max_quantity.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Delivery
                      </span>
                      <span>{service.estimated_time}</span>
                    </div>
                  </div>
                  
                  {service.features && (
                    <div className="mb-6">
                      <div className="flex flex-wrap gap-1">
                        {service.features.slice(0, 3).map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {service.features.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{service.features.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <Button asChild className="w-full">
                    <Link to={`/new-order?service=${service.id}`}>
                      <Zap className="mr-2 h-4 w-4" />
                      Order Now
                    </Link>
                  </Button>
                </Card>
              ))}
            </div>
          )}
          
          {!loading && filteredServices.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold mb-2">No services found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or category filter
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}