import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useBuyerAuth } from "@/contexts/BuyerAuthContext";
import { useTenant } from "@/hooks/useTenant";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface ServiceReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  serviceId: string;
  serviceName: string;
  onReviewSubmitted?: () => void;
}

export const ServiceReviewDialog = ({
  open,
  onOpenChange,
  orderId,
  serviceId,
  serviceName,
  onReviewSubmitted,
}: ServiceReviewDialogProps) => {
  const { buyer } = useBuyerAuth();
  const { panel } = useTenant();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!buyer?.id || !panel?.id || rating === 0) {
      toast({ title: "Please select a rating", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('service_reviews')
        .insert({
          buyer_id: buyer.id,
          service_id: serviceId,
          order_id: orderId,
          panel_id: panel.id,
          rating,
          review_text: reviewText.trim() || null,
        });

      if (error) throw error;

      toast({ title: "Review submitted!", description: "Thank you for your feedback" });
      onOpenChange(false);
      onReviewSubmitted?.();
      
      // Reset form
      setRating(0);
      setReviewText("");
    } catch (error: any) {
      console.error('Error submitting review:', error);
      if (error.code === '23505') {
        toast({ title: "Already reviewed", description: "You've already reviewed this order", variant: "destructive" });
      } else {
        toast({ title: "Error submitting review", variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate Your Experience</DialogTitle>
          <DialogDescription>
            How was your experience with {serviceName}?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Star Rating */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-1 focus:outline-none"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={cn(
                      "w-8 h-8 transition-colors",
                      star <= displayRating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    )}
                  />
                </motion.button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {displayRating === 1 && "Poor"}
              {displayRating === 2 && "Fair"}
              {displayRating === 3 && "Good"}
              {displayRating === 4 && "Very Good"}
              {displayRating === 5 && "Excellent"}
              {displayRating === 0 && "Click to rate"}
            </p>
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <Textarea
              placeholder="Share your experience (optional)..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
              maxLength={500}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {reviewText.length}/500
            </p>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={loading || rating === 0}
            className="w-full"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Star className="w-4 h-4 mr-2" />
            )}
            Submit Review
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceReviewDialog;
