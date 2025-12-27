import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, ArrowLeft, Instagram, Music, Youtube, Send, Twitter, 
  Linkedin, Facebook, Globe, Zap, Star, ShoppingCart, Filter
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useBuyerAuth } from "@/contexts/BuyerAuthContext";

// Platform icon mapping
const platformIcons: Record<string, React.ElementType> = {
  instagram: Instagram,
  tiktok: Music,
  youtube: Youtube,
  telegram: Send,
  twitter: Twitter,
  linkedin: Linkedin,
  facebook: Facebook,
  other: Globe,
};

const platformColors: Record<string, string> = {
  instagram: "from-pink-500 to-purple-500",
  tiktok: "from-cyan-400 to-pink-500",
  youtube: "from-red-500 to-red-600",
  telegram: "from-blue-400 to-blue-600",
  twitter: "from-sky-400 to-blue-500",
  linkedin: "from-blue-600 to-blue-700",
  facebook: "from-blue-500 to-blue-600",
  other: "from-gray-500 to-gray-600",
};

const BuyerPublicServices = () => {
  const { panelId, buyer } = useBuyerAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch services for this panel
  const { data: services = [], isLoading } = useQuery({
    queryKey: ['public-services', panelId],
    queryFn: async () => {
      if (!panelId) return [];
      
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('panel_id', panelId)
        .eq('is_active', true)
        .order('category')
        .order('display_order');

      if (error) throw error;
      return data || [];
    },
    enabled: !!panelId,
  });

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(services.map(s => s.category))];
    return cats.sort();
  }, [services]);

  // Filter services
  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const matchesSearch = !searchQuery || 
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || service.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [services, searchQuery, selectedCategory]);

  // Group by category
  const groupedServices = useMemo(() => {
    const groups: Record<string, typeof services> = {};
    filteredServices.forEach(service => {
      if (!groups[service.category]) {
        groups[service.category] = [];
      }
      groups[service.category].push(service);
    });
    return groups;
  }, [filteredServices]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Link>
              </Button>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Our Services</h1>
            </div>
            <div className="flex items-center gap-3">
              {buyer ? (
                <Button asChild size="sm">
                  <Link to="/dashboard">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
              ) : (
                <Button asChild size="sm">
                  <Link to="/auth">
                    Sign In to Order
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white dark:bg-slate-900"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="rounded-full"
            >
              <Filter className="w-4 h-4 mr-1" />
              All
            </Button>
            {categories.map(category => {
              const Icon = platformIcons[category] || Globe;
              return (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="rounded-full capitalize"
                >
                  <Icon className="w-4 h-4 mr-1" />
                  {category}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Services */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded mb-4 w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded mb-2 w-full" />
                  <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Globe className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No services found</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery ? "Try adjusting your search query" : "No services available at the moment"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedServices).map(([category, categoryServices]) => {
              const Icon = platformIcons[category] || Globe;
              const gradient = platformColors[category] || platformColors.other;
              
              return (
                <motion.div 
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white capitalize">{category}</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{categoryServices.length} services</p>
                    </div>
                  </div>

                  {/* Services Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryServices.map((service, index) => (
                      <motion.div
                        key={service.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="h-full hover:shadow-lg transition-shadow bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800">
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between gap-2">
                              <CardTitle className="text-base font-medium text-gray-900 dark:text-white line-clamp-2">
                                {service.name}
                              </CardTitle>
                              <Badge variant="secondary" className="shrink-0">
                                ${service.price.toFixed(2)}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            {service.description && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                                {service.description}
                              </p>
                            )}
                            
                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
                              <span className="flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                {service.estimated_time || 'Instant'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                {service.min_quantity}-{service.max_quantity}
                              </span>
                            </div>

                            {buyer ? (
                              <Button asChild size="sm" className="w-full">
                                <Link to={`/dashboard?service=${service.id}`}>
                                  <ShoppingCart className="w-4 h-4 mr-2" />
                                  Order Now
                                </Link>
                              </Button>
                            ) : (
                              <Button asChild size="sm" variant="outline" className="w-full">
                                <Link to="/auth">
                                  Sign In to Order
                                </Link>
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default BuyerPublicServices;