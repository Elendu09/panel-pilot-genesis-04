import { useState } from "react";
import { 
  Plus, 
  Upload, 
  Link, 
  Search, 
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Hand,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ServiceItem } from "./DraggableServiceItem";

// Emoji icons for service types
const SERVICE_EMOJIS: Record<string, string> = {
  instagram: "📸",
  facebook: "👥",
  twitter: "🐦",
  youtube: "🎬",
  tiktok: "🎵",
  linkedin: "💼",
  telegram: "✈️",
  spotify: "🎧",
  discord: "🎮",
  twitch: "📺",
  other: "📦",
};

interface MobileServiceViewProps {
  services: ServiceItem[];
  categories: Array<{ id: string; name: string }>;
  categoryCounts: Record<string, number>;
  selectedCategory: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onToggleStatus: (id: string) => void;
  onAddService: () => void;
  onImportServices: () => void;
  onServiceClick: (service: ServiceItem) => void;
}

export const MobileServiceView = ({
  services,
  categories,
  categoryCounts,
  selectedCategory,
  searchQuery,
  onSearchChange,
  onCategoryChange,
  onToggleStatus,
  onAddService,
  onImportServices,
  onServiceClick,
}: MobileServiceViewProps) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['all']));

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // Group services by category
  const groupedServices = services.reduce((acc, service) => {
    const cat = service.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(service);
    return acc;
  }, {} as Record<string, ServiceItem[]>);

  const getEmoji = (name: string, category: string) => {
    const lowerName = name.toLowerCase();
    // Try to detect based on service name
    if (lowerName.includes('follower') || lowerName.includes('follow')) return "😊";
    if (lowerName.includes('like')) return "❤️";
    if (lowerName.includes('view')) return "👀";
    if (lowerName.includes('comment')) return "💬";
    if (lowerName.includes('share')) return "🔄";
    if (lowerName.includes('subscriber')) return "🔔";
    // Fall back to category emoji
    return SERVICE_EMOJIS[category] || "📦";
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Quick Action Cards */}
      <ScrollArea className="w-full">
        <div className="flex gap-3 pb-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onAddService}
            className="flex flex-col items-center justify-center min-w-[100px] h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 p-3"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mb-1">
              <Plus className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs font-medium text-primary">Add service</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onImportServices}
            className="flex flex-col items-center justify-center min-w-[100px] h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20 p-3"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mb-1">
              <Upload className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-xs font-medium text-blue-500">Import services</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center justify-center min-w-[100px] h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/20 p-3"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center mb-1">
              <Link className="w-5 h-5 text-purple-500" />
            </div>
            <span className="text-xs font-medium text-purple-500">Direct providers</span>
          </motion.button>
        </div>
      </ScrollArea>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Service id"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-card/50 border-border/50 rounded-xl"
        />
      </div>

      {/* Category Filter Row */}
      <div className="flex items-center gap-2">
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="flex-1 bg-card/50 border-border/50 rounded-xl">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="rounded-xl shrink-0">
          <Plus className="w-4 h-4 mr-1" />
          Add category
        </Button>
      </div>

      {/* All Categories Header */}
      <div className="flex items-center justify-between py-2">
        <span className="text-sm font-medium text-muted-foreground">All categories</span>
        <Button variant="ghost" size="sm" className="h-8 text-muted-foreground">
          Move categories
          <Hand className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Services List by Category */}
      <div className="space-y-3">
        {selectedCategory === 'all' ? (
          // Show grouped by category
          Object.entries(groupedServices).map(([category, categoryServices]) => {
            const isExpanded = expandedCategories.has(category);
            const categoryInfo = categories.find(c => c.id === category);

            return (
              <Collapsible
                key={category}
                open={isExpanded}
                onOpenChange={() => toggleCategory(category)}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-xl bg-card/50 border border-border/30 hover:bg-card/80 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{SERVICE_EMOJIS[category] || "📦"}</span>
                    <span className="font-medium capitalize">{categoryInfo?.name || category}</span>
                    <Badge variant="secondary" className="text-xs">
                      {categoryServices.length}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Enable all</DropdownMenuItem>
                        <DropdownMenuItem>Disable all</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete category</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <AnimatePresence>
                    <div className="space-y-2 mt-2 pl-2">
                      {categoryServices.map((service, index) => (
                        <MobileServiceCard
                          key={service.id}
                          service={service}
                          emoji={getEmoji(service.name, service.category)}
                          index={index}
                          onToggleStatus={() => onToggleStatus(service.id)}
                          onClick={() => onServiceClick(service)}
                        />
                      ))}
                    </div>
                  </AnimatePresence>
                </CollapsibleContent>
              </Collapsible>
            );
          })
        ) : (
          // Show flat list for selected category
          <div className="space-y-2">
            {services.map((service, index) => (
              <MobileServiceCard
                key={service.id}
                service={service}
                emoji={getEmoji(service.name, service.category)}
                index={index}
                onToggleStatus={() => onToggleStatus(service.id)}
                onClick={() => onServiceClick(service)}
              />
            ))}
          </div>
        )}

        {services.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No services found</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface MobileServiceCardProps {
  service: ServiceItem;
  emoji: string;
  index: number;
  onToggleStatus: () => void;
  onClick: () => void;
}

const MobileServiceCard = ({ service, emoji, index, onToggleStatus, onClick }: MobileServiceCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="flex items-center gap-3 p-3 rounded-xl bg-card/30 border border-border/30 active:bg-card/50"
      onClick={onClick}
    >
      {/* Emoji Icon */}
      <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-xl shrink-0">
        {emoji}
      </div>

      {/* Service Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{service.name}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{service.displayId || service.id.slice(0, 8)}</span>
          <span>•</span>
          <span className="text-primary font-medium">${service.price.toFixed(4)}</span>
          <ChevronRight className="w-3 h-3 ml-auto" />
        </div>
      </div>

      {/* Status Toggle */}
      <Switch
        checked={service.status}
        onCheckedChange={() => onToggleStatus()}
        onClick={(e) => e.stopPropagation()}
        className="shrink-0 data-[state=checked]:bg-green-500"
      />
    </motion.div>
  );
};

export default MobileServiceView;
