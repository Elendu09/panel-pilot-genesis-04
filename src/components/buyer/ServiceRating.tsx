import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface ServiceRatingProps {
  serviceId: string;
  showCount?: boolean;
  size?: "sm" | "default";
  className?: string;
}

export const ServiceRating = ({ 
  serviceId, 
  showCount = true, 
  size = "default",
  className 
}: ServiceRatingProps) => {
  const [avgRating, setAvgRating] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState<number>(0);

  useEffect(() => {
    if (serviceId) {
      fetchRating();
    }
  }, [serviceId]);

  const fetchRating = async () => {
    try {
      const { data, error } = await supabase
        .from('service_reviews')
        .select('rating')
        .eq('service_id', serviceId)
        .eq('is_visible', true);

      if (error) throw error;

      if (data && data.length > 0) {
        const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
        setAvgRating(Math.round(avg * 10) / 10);
        setReviewCount(data.length);
      }
    } catch (error) {
      console.error('Error fetching rating:', error);
    }
  };

  if (reviewCount === 0) return null;

  const iconSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Star className={cn(iconSize, "fill-yellow-400 text-yellow-400")} />
      <span className={cn("font-medium", textSize)}>{avgRating.toFixed(1)}</span>
      {showCount && (
        <span className={cn("text-muted-foreground", textSize)}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
};

export default ServiceRating;
