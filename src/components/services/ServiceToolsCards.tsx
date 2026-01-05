import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Wand2, 
  ArrowUpDown, 
  Loader2, 
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  DollarSign,
  Layers,
  SortAsc,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type ArrangeOption = 
  | "name-asc" 
  | "name-desc" 
  | "price-high" 
  | "price-low" 
  | "popularity" 
  | "recent";

interface ServiceToolsCardsProps {
  onSmartOrganize: () => void;
  onAutoArrange: (option: ArrangeOption) => void;
  isOrganizing: boolean;
  totalServices: number;
}

export const ServiceToolsCards = ({
  onSmartOrganize,
  onAutoArrange,
  isOrganizing,
  totalServices,
}: ServiceToolsCardsProps) => {
  const [autoArrangeEnabled, setAutoArrangeEnabled] = useState(false);

  const arrangeOptions: { value: ArrangeOption; label: string; icon: typeof ArrowUp; description: string }[] = [
    { value: "name-asc", label: "Name (A-Z)", icon: SortAsc, description: "Alphabetical order" },
    { value: "name-desc", label: "Name (Z-A)", icon: ArrowDown, description: "Reverse alphabetical" },
    { value: "price-high", label: "Price (High to Low)", icon: DollarSign, description: "Most expensive first" },
    { value: "price-low", label: "Price (Low to High)", icon: DollarSign, description: "Cheapest first" },
    { value: "popularity", label: "By Popularity", icon: TrendingUp, description: "Most ordered first" },
    { value: "recent", label: "Recently Added", icon: ArrowUp, description: "Newest first" },
  ];

  const tools = [
    {
      id: "smart-organize",
      title: "Smart Organize + Health Check",
      description: "AI scans 50+ platforms, fixes icons, categories & health issues automatically",
      icon: Wand2,
      action: onSmartOrganize,
      loading: isOrganizing,
      color: "from-violet-500 to-purple-600",
      iconBg: "bg-violet-500/10 text-violet-500",
      badge: "50+ platforms",
      badgeVariant: "secondary",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {tools.map((tool) => (
        <Card 
          key={tool.id} 
          className={cn(
            "relative overflow-hidden transition-all hover:shadow-lg cursor-pointer group",
            "border border-border/50 hover:border-primary/30"
          )}
          onClick={() => tool.action()}
        >
          <div className={cn(
            "absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity",
            `bg-gradient-to-br ${tool.color}`
          )} />
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className={cn("p-2 rounded-lg", tool.iconBg)}>
                {tool.loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <tool.icon className="w-5 h-5" />
                )}
              </div>
              {tool.badge && (
                <Badge 
                  variant={tool.badgeVariant as any}
                  className="text-xs"
                >
                  {tool.badge}
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-sm mb-1">{tool.title}</h3>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {tool.description}
            </p>
          </CardContent>
        </Card>
      ))}

      {/* Auto Arrange with Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Card 
            className={cn(
              "relative overflow-hidden transition-all hover:shadow-lg cursor-pointer group",
              "border border-border/50 hover:border-primary/30"
            )}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity bg-gradient-to-br from-emerald-500 to-teal-600" />
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <ArrowUpDown className="w-5 h-5" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  6 options
                </Badge>
              </div>
              <h3 className="font-semibold text-sm mb-1">Auto Arrange</h3>
              <p className="text-xs text-muted-foreground line-clamp-2">
                Sort services by name, category, price, or popularity
              </p>
            </CardContent>
          </Card>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Sort Services By</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {arrangeOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onAutoArrange(option.value)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <option.icon className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">{option.label}</p>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ServiceToolsCards;