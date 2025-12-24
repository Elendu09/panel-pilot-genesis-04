import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Wand2, 
  ArrowUpDown, 
  Loader2, 
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceToolsCardsProps {
  onAutoFix: () => void;
  onSmartCategorize: () => void;
  onAutoArrange: () => void;
  onHealthCheck: () => void;
  isAutoFixing: boolean;
  totalServices: number;
  healthIssues?: number;
}

export const ServiceToolsCards = ({
  onAutoFix,
  onSmartCategorize,
  onAutoArrange,
  onHealthCheck,
  isAutoFixing,
  totalServices,
  healthIssues = 0,
}: ServiceToolsCardsProps) => {
  const [autoArrangeEnabled, setAutoArrangeEnabled] = useState(false);

  const tools = [
    {
      id: "auto-fix",
      title: "Auto-Fix Icons",
      description: "Automatically detect and assign icons based on service names",
      icon: Sparkles,
      action: onAutoFix,
      loading: isAutoFixing,
      color: "from-violet-500 to-purple-600",
      iconBg: "bg-violet-500/10 text-violet-500",
    },
    {
      id: "smart-categorize",
      title: "Smart Categorize",
      description: "AI-powered categorization for your services",
      icon: Wand2,
      action: onSmartCategorize,
      loading: false,
      color: "from-blue-500 to-cyan-600",
      iconBg: "bg-blue-500/10 text-blue-500",
    },
    {
      id: "auto-arrange",
      title: "Auto Arrange",
      description: "Automatically sort services by category and popularity",
      icon: ArrowUpDown,
      action: onAutoArrange,
      loading: false,
      color: "from-emerald-500 to-teal-600",
      iconBg: "bg-emerald-500/10 text-emerald-500",
      hasToggle: true,
      toggleValue: autoArrangeEnabled,
      onToggle: setAutoArrangeEnabled,
    },
    {
      id: "health-check",
      title: "Health Check",
      description: "Scan for errors, duplicates, and missing data",
      icon: healthIssues > 0 ? AlertTriangle : CheckCircle,
      action: onHealthCheck,
      loading: false,
      color: healthIssues > 0 ? "from-amber-500 to-orange-600" : "from-green-500 to-emerald-600",
      iconBg: healthIssues > 0 ? "bg-amber-500/10 text-amber-500" : "bg-green-500/10 text-green-500",
      badge: healthIssues > 0 ? `${healthIssues} issues` : undefined,
      badgeVariant: healthIssues > 0 ? "destructive" : "secondary",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {tools.map((tool) => (
        <Card 
          key={tool.id} 
          className={cn(
            "relative overflow-hidden transition-all hover:shadow-lg cursor-pointer group",
            "border border-border/50 hover:border-primary/30"
          )}
          onClick={() => !tool.hasToggle && tool.action()}
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
              {tool.hasToggle ? (
                <Switch
                  checked={tool.toggleValue}
                  onCheckedChange={(checked) => {
                    tool.onToggle?.(checked);
                    if (checked) tool.action();
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : tool.badge ? (
                <Badge 
                  variant={tool.badgeVariant as any}
                  className="text-xs"
                >
                  {tool.badge}
                </Badge>
              ) : null}
            </div>
            <h3 className="font-semibold text-sm mb-1">{tool.title}</h3>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {tool.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ServiceToolsCards;
