import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useBuyerAuth } from "@/contexts/BuyerAuthContext";
import { useTenant } from "@/hooks/useTenant";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface FavoriteButtonProps {
  serviceId: string;
  className?: string;
  size?: "sm" | "default" | "lg" | "icon";
}

export const FavoriteButton = ({ serviceId, className, size = "icon" }: FavoriteButtonProps) => {
  const { buyer } = useBuyerAuth();
  const { panel } = useTenant();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (buyer?.id && serviceId) {
      checkFavorite();
    }
  }, [buyer?.id, serviceId]);

  const checkFavorite = async () => {
    if (!buyer?.id) return;

    try {
      const { data } = await supabase
        .from('buyer_favorites')
        .select('id')
        .eq('buyer_id', buyer.id)
        .eq('service_id', serviceId)
        .single();

      setIsFavorite(!!data);
    } catch {
      // Not a favorite
      setIsFavorite(false);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!buyer?.id || !panel?.id || loading) return;

    setLoading(true);
    setAnimating(true);

    try {
      if (isFavorite) {
        await supabase
          .from('buyer_favorites')
          .delete()
          .eq('buyer_id', buyer.id)
          .eq('service_id', serviceId);

        setIsFavorite(false);
        toast({ title: "Removed from favorites" });
      } else {
        await supabase
          .from('buyer_favorites')
          .insert({
            buyer_id: buyer.id,
            service_id: serviceId,
            panel_id: panel.id,
          });

        setIsFavorite(true);
        toast({ title: "Added to favorites" });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({ title: "Error updating favorites", variant: "destructive" });
    } finally {
      setLoading(false);
      setTimeout(() => setAnimating(false), 300);
    }
  };

  return (
    <Button
      variant="ghost"
      size={size}
      className={cn(
        "relative transition-all duration-300",
        isFavorite && "text-blue-500 hover:text-blue-600",
        isFavorite && "shadow-[0_0_12px_rgba(59,130,246,0.5)]",
        className
      )}
      onClick={toggleFavorite}
      disabled={loading}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={isFavorite ? "filled" : "empty"}
          initial={{ scale: 0.8 }}
          animate={{ 
            scale: animating ? [1, 1.3, 1] : 1,
          }}
          transition={{ duration: 0.3 }}
          className={cn(isFavorite && "animate-pulse")}
        >
          <Heart
            className={cn(
              "w-4 h-4 transition-all",
              isFavorite && "fill-blue-500 text-blue-500"
            )}
          />
        </motion.div>
      </AnimatePresence>
    </Button>
  );
};

export default FavoriteButton;
