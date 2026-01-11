import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Heart, 
  ShoppingCart, 
  Package, 
  Trash2, 
  Zap,
  Clock,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { SOCIAL_ICONS_MAP } from "@/components/icons/SocialIcons";
import { useTenant } from "@/hooks/useTenant";
import { useBuyerAuth } from "@/contexts/BuyerAuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import BuyerLayout from "./BuyerLayout";

interface FavoriteService {
  id: string;
  service_id: string;
  created_at: string;
  service: {
    id: string;
    name: string;
    category: string;
    price: number;
    description?: string;
    estimated_time?: string;
    min_quantity?: number;
    max_quantity?: number;
  };
}

const BuyerFavorites = () => {
  const navigate = useNavigate();
  const { panel } = useTenant();
  const { buyer } = useBuyerAuth();
  const { formatPrice } = useCurrency();
  const [favorites, setFavorites] = useState<FavoriteService[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    fetchFavorites();
  }, [buyer?.id, panel?.id]);

  const fetchFavorites = async () => {
    if (!buyer?.id || !panel?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('buyer_favorites')
        .select(`
          id,
          service_id,
          created_at,
          service:services(
            id,
            name,
            category,
            price,
            description,
            estimated_time,
            min_quantity,
            max_quantity
          )
        `)
        .eq('buyer_id', buyer.id)
        .eq('panel_id', panel.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Filter out any entries where service was deleted
      const validFavorites = (data || []).filter(f => f.service) as FavoriteService[];
      setFavorites(validFavorites);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast({ title: "Failed to load favorites", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (favoriteId: string) => {
    setRemovingId(favoriteId);
    try {
      const { error } = await supabase
        .from('buyer_favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;

      setFavorites(prev => prev.filter(f => f.id !== favoriteId));
      toast({ title: "Removed from favorites" });
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast({ title: "Failed to remove", variant: "destructive" });
    } finally {
      setRemovingId(null);
    }
  };

  const handleQuickOrder = (service: FavoriteService['service']) => {
    navigate(`/new-order?service=${service.id}`);
  };

  const getCategoryData = (category: string) => {
    return SOCIAL_ICONS_MAP[category] || SOCIAL_ICONS_MAP.other;
  };

  if (loading) {
    return (
      <BuyerLayout>
        <div className="space-y-6 max-w-5xl mx-auto">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        </div>
      </BuyerLayout>
    );
  }

  return (
    <BuyerLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 max-w-5xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div 
              className="p-3 rounded-xl bg-primary/10 shadow-[0_0_15px_var(--primary)]"
              whileHover={{ scale: 1.05 }}
            >
              <Heart className="w-6 h-6 text-primary fill-primary" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold">My Favorites</h1>
              <p className="text-sm text-muted-foreground">
                {favorites.length} saved service{favorites.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          <Button asChild variant="outline">
            <Link to="/services">
              <Package className="w-4 h-4 mr-2" />
              Browse Services
            </Link>
          </Button>
        </div>

        {/* Empty State */}
        {favorites.length === 0 && (
          <Card className="p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <Heart className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Save your favorite services for quick access and easy ordering.
              </p>
              <Button asChild>
                <Link to="/services">
                  <Package className="w-4 h-4 mr-2" />
                  Browse Services
                </Link>
              </Button>
            </div>
          </Card>
        )}

        {/* Favorites Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {favorites.map((favorite, index) => {
              const service = favorite.service;
              const catData = getCategoryData(service.category);
              const CatIcon = catData.icon;
              
              return (
                <motion.div
                  key={favorite.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
                    {/* Category Header */}
                    <div className={cn("p-3 flex items-center gap-2", catData.bgColor)}>
                      <CatIcon className="w-4 h-4 text-white" />
                      <span className="text-white text-sm font-medium capitalize">
                        {catData.label || service.category}
                      </span>
                    </div>
                    
                    <CardContent className="p-4 space-y-3">
                      {/* Service Name */}
                      <h3 className="font-semibold line-clamp-2 min-h-[48px]">
                        {service.name}
                      </h3>
                      
                      {/* Price & Speed */}
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-sm">
                          {formatPrice(service.price)}/1k
                        </Badge>
                        {service.estimated_time && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {service.estimated_time}
                          </div>
                        )}
                      </div>
                      
                      {/* Quantity Range */}
                      <div className="text-xs text-muted-foreground">
                        Min: {service.min_quantity?.toLocaleString() || 1} | 
                        Max: {service.max_quantity?.toLocaleString() || '10K'}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2">
                        <Button 
                          className="flex-1 gap-2"
                          onClick={() => handleQuickOrder(service)}
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Order Now
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeFavorite(favorite.id)}
                          disabled={removingId === favorite.id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Quick Order CTA */}
        {favorites.length > 0 && (
          <Card className="p-6 bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Ready to order?</h3>
                  <p className="text-sm text-muted-foreground">
                    Select a service above or place a new order
                  </p>
                </div>
              </div>
              <Button asChild>
                <Link to="/new-order">
                  New Order
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </Card>
        )}
      </motion.div>
    </BuyerLayout>
  );
};

export default BuyerFavorites;
