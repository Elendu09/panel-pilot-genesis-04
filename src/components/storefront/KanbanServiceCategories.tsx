import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { 
  Star, Heart, Users, Zap, Eye, MessageSquare, TrendingUp, 
  Instagram, Youtube, Music, Send, Linkedin, Hash
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  count?: number;
}

interface KanbanServiceCategoriesProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  primaryColor?: string;
  variant?: 'dark' | 'light';
}

const CATEGORY_ICONS: Record<string, any> = {
  all: Star,
  instagram: Instagram,
  facebook: Users,
  youtube: Youtube,
  tiktok: Music,
  twitter: Hash,
  telegram: Send,
  linkedin: Linkedin,
  other: Zap,
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  all: 'from-purple-500 to-pink-500',
  instagram: 'from-purple-500 via-pink-500 to-orange-400',
  facebook: 'from-blue-500 to-blue-600',
  youtube: 'from-red-500 to-red-600',
  tiktok: 'from-cyan-400 via-slate-900 to-pink-500',
  twitter: 'from-slate-700 to-slate-900',
  telegram: 'from-sky-400 to-sky-500',
  linkedin: 'from-blue-600 to-blue-700',
  other: 'from-slate-500 to-slate-600',
};

export const KanbanServiceCategories = ({
  categories,
  selectedCategory,
  onSelectCategory,
  primaryColor = '#3B82F6',
  variant = 'dark'
}: KanbanServiceCategoriesProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const isDark = variant === 'dark';

  // Mouse drag scrolling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative">
      {/* Gradient fade edges */}
      <div className={`absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r ${isDark ? 'from-slate-900' : 'from-white'} to-transparent z-10 pointer-events-none`} />
      <div className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l ${isDark ? 'from-slate-900' : 'from-white'} to-transparent z-10 pointer-events-none`} />
      
      {/* Scrollable container */}
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`flex gap-3 overflow-x-auto scrollbar-hide py-2 px-2 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((category, index) => {
          const Icon = CATEGORY_ICONS[category.id] || Star;
          const gradient = CATEGORY_GRADIENTS[category.id] || 'from-slate-500 to-slate-600';
          const isSelected = selectedCategory === category.id;
          
          return (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelectCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
                isSelected
                  ? `bg-gradient-to-r ${gradient} text-white shadow-lg`
                  : isDark
                    ? 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/10'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                isSelected 
                  ? 'bg-white/20' 
                  : `bg-gradient-to-br ${gradient}`
              }`}>
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-white'}`} />
              </div>
              <span className="font-medium text-sm">{category.name}</span>
              {category.count !== undefined && category.count > 0 && (
                <Badge 
                  variant="secondary" 
                  className={`ml-1 text-xs px-1.5 py-0 ${
                    isSelected 
                      ? 'bg-white/20 text-white border-0' 
                      : isDark 
                        ? 'bg-white/10 text-white/60' 
                        : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {category.count}
                </Badge>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
