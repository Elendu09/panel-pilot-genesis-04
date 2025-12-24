import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Lightbulb, 
  ChevronDown, 
  ChevronUp,
  Target,
  TrendingUp,
  Users,
  DollarSign,
  Zap,
  RefreshCw,
  Star,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceTipsProps {
  variant?: "panel-owner" | "buyer";
  compact?: boolean;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const panelOwnerTips = [
  {
    icon: DollarSign,
    title: "Set Competitive Markup",
    description: "Aim for 15-30% markup to balance profit with competitiveness. Research similar panels for pricing benchmarks.",
    color: "text-green-500"
  },
  {
    icon: RefreshCw,
    title: "Enable Refill Options",
    description: "Services with refill guarantees have 40% higher conversion rates. Enable refill for premium services.",
    color: "text-blue-500"
  },
  {
    icon: Target,
    title: "Organize by Platform",
    description: "Group services by platform (Instagram, TikTok, etc.) for easier navigation. Use the auto-categorize feature.",
    color: "text-purple-500"
  },
  {
    icon: Star,
    title: "Use Descriptive Names",
    description: "Include quality indicators in names: 'Instagram Followers [HQ] [30-Day Refill]' helps buyers choose confidently.",
    color: "text-amber-500"
  },
  {
    icon: Zap,
    title: "Highlight Speed",
    description: "Mark fast-delivery services as 'Instant Start' - speed is a key decision factor for 60% of buyers.",
    color: "text-orange-500"
  },
  {
    icon: Users,
    title: "Set Reasonable Limits",
    description: "Keep min/max quantities aligned with provider limits. Too-high minimums discourage first-time buyers.",
    color: "text-cyan-500"
  }
];

const buyerTips = [
  {
    icon: Target,
    title: "Choose Quality Services",
    description: "Look for 'HQ' (High Quality) or 'Real' in service names for better results.",
    color: "text-green-500"
  },
  {
    icon: RefreshCw,
    title: "Check Refill Policy",
    description: "Services with refill guarantees will replace any drops for free within the warranty period.",
    color: "text-blue-500"
  },
  {
    icon: TrendingUp,
    title: "Start Small",
    description: "Test new services with minimum orders first. Scale up once you're satisfied with quality.",
    color: "text-purple-500"
  },
  {
    icon: Zap,
    title: "Delivery Speed",
    description: "'Instant' = starts within minutes. 'Drip' = gradual delivery for natural-looking growth.",
    color: "text-amber-500"
  }
];

export const ServiceTips = ({ 
  variant = "panel-owner", 
  compact = false,
  dismissible = true,
  onDismiss 
}: ServiceTipsProps) => {
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [isDismissed, setIsDismissed] = useState(false);
  
  const tips = variant === "panel-owner" ? panelOwnerTips : buyerTips;
  const displayedTips = isExpanded ? tips : tips.slice(0, 2);
  
  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  if (isDismissed) return null;

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-background to-primary/5 border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Lightbulb className="w-4 h-4 text-primary" />
            </div>
            <span className="font-semibold text-sm">
              {variant === "panel-owner" ? "Tips for Panel Owners" : "Ordering Tips"}
            </span>
            <Badge variant="outline" className="text-[10px] bg-primary/10 border-primary/20">
              Pro Tips
            </Badge>
          </div>
          {dismissible && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={handleDismiss}
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
        
        <div className="grid gap-2">
          {displayedTips.map((tip, index) => (
            <div 
              key={index}
              className="flex items-start gap-3 p-2 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
            >
              <tip.icon className={cn("w-4 h-4 mt-0.5 flex-shrink-0", tip.color)} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{tip.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {tip.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {tips.length > 2 && (
          <Button 
            variant="ghost" 
            size="sm"
            className="w-full mt-2 text-xs h-7"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3 h-3 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3 mr-1" />
                Show {tips.length - 2} More Tips
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ServiceTips;
