import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Instagram, Youtube, Facebook, Twitter, Users, Heart, Star, MessageCircle } from 'lucide-react';

interface QuantityPresetsProps {
  onSelect: (quantity: number) => void;
  selectedQuantity: number;
  pricePerUnit: number;
  minQuantity?: number;
  maxQuantity?: number;
  category?: string;
  formatPrice: (amount: number) => string;
  className?: string;
}

const getCategoryIcon = (category?: string) => {
  if (!category) return Users;
  const lower = category.toLowerCase();
  if (lower.includes('instagram')) return Instagram;
  if (lower.includes('youtube')) return Youtube;
  if (lower.includes('facebook')) return Facebook;
  if (lower.includes('twitter') || lower.includes('x')) return Twitter;
  if (lower.includes('like')) return Heart;
  if (lower.includes('comment')) return MessageCircle;
  if (lower.includes('review') || lower.includes('rating')) return Star;
  return Users;
};

export const QuantityPresets = ({
  onSelect,
  selectedQuantity,
  pricePerUnit,
  minQuantity = 1,
  maxQuantity = 100000,
  category,
  formatPrice,
  className = ''
}: QuantityPresetsProps) => {
  const Icon = getCategoryIcon(category);
  
  // Generate smart presets based on min/max
  const presets = [
    Math.max(minQuantity, 100),
    Math.max(minQuantity, 500),
    Math.max(minQuantity, 1000),
    Math.max(minQuantity, 2500),
    Math.max(minQuantity, 5000),
    Math.min(maxQuantity, 10000)
  ].filter((val, idx, arr) => {
    // Remove duplicates and values above max
    return val <= maxQuantity && arr.indexOf(val) === idx;
  }).slice(0, 6);

  // Fill remaining slots if needed
  while (presets.length < 6 && presets[presets.length - 1] < maxQuantity) {
    const next = presets[presets.length - 1] * 2;
    if (next <= maxQuantity) {
      presets.push(next);
    } else break;
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={`grid grid-cols-3 gap-2 ${className}`}
    >
      {presets.map((preset) => {
        const isSelected = selectedQuantity === preset;
        const price = (preset / 1000) * pricePerUnit;
        
        return (
          <motion.button
            key={preset}
            variants={item}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(preset)}
            className={cn(
              "relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200",
              "bg-background hover:bg-accent/50",
              isSelected 
                ? "border-primary bg-primary/10 shadow-lg shadow-primary/20" 
                : "border-border hover:border-primary/50"
            )}
          >
            {/* Selection indicator */}
            {isSelected && (
              <motion.div
                layoutId="preset-selected"
                className="absolute inset-0 rounded-xl bg-primary/5 border-2 border-primary"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            
            {/* Icon */}
            <Icon className={cn(
              "w-5 h-5 mb-1 transition-colors",
              isSelected ? "text-primary" : "text-muted-foreground"
            )} />
            
            {/* Quantity */}
            <span className={cn(
              "text-sm font-bold transition-colors",
              isSelected ? "text-primary" : "text-foreground"
            )}>
              {preset >= 1000 ? `${preset / 1000}K` : preset.toLocaleString()}
            </span>
            
            {/* Price */}
            <span className="text-xs text-muted-foreground">
              {formatPrice(price)}
            </span>
          </motion.button>
        );
      })}
    </motion.div>
  );
};
