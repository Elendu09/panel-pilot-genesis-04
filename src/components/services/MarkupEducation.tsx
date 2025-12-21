import { Info, TrendingUp, Calculator, AlertTriangle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface MarkupEducationProps {
  providerPrice: number;
  markupPercentage: number;
  showDetailedInfo?: boolean;
}

export const MarkupEducation = ({ 
  providerPrice, 
  markupPercentage, 
  showDetailedInfo = false 
}: MarkupEducationProps) => {
  const yourPrice = providerPrice * (1 + markupPercentage / 100);
  const profit = yourPrice - providerPrice;
  const profitMargin = markupPercentage;

  // Determine profit level color
  const getProfitColor = () => {
    if (markupPercentage < 10) return "text-red-500";
    if (markupPercentage < 25) return "text-amber-500";
    return "text-emerald-500";
  };

  const getProfitBg = () => {
    if (markupPercentage < 10) return "bg-red-500/10";
    if (markupPercentage < 25) return "bg-amber-500/10";
    return "bg-emerald-500/10";
  };

  const getProfitLabel = () => {
    if (markupPercentage < 10) return "Low margin";
    if (markupPercentage < 25) return "Standard margin";
    return "Good margin";
  };

  return (
    <TooltipProvider>
      <div className={cn(
        "rounded-lg border p-3 space-y-2",
        getProfitBg(),
        "border-border/50"
      )}>
        {/* Formula Display */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Provider Price</span>
          <span className="font-medium">${providerPrice.toFixed(2)}</span>
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground flex items-center gap-1">
            Markup ({markupPercentage}%)
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-3 h-3 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs p-3">
                <div className="space-y-2 text-xs">
                  <p className="font-medium">How Markup Works</p>
                  <p className="text-muted-foreground">
                    Your Price = Provider Price × (1 + Markup%)
                  </p>
                  <div className="mt-2 p-2 bg-muted rounded text-center">
                    ${yourPrice.toFixed(2)} = ${providerPrice.toFixed(2)} × (1 + {markupPercentage}%)
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-emerald-500">💚 25-50%: Good profit margin</p>
                    <p className="text-amber-500">🟡 10-25%: Standard margin</p>
                    <p className="text-red-500">🔴 0-10%: Low margin</p>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </span>
          <span className={cn("font-medium", getProfitColor())}>
            +${profit.toFixed(2)}
          </span>
        </div>

        <div className="border-t border-border/50 pt-2 flex items-center justify-between">
          <span className="text-sm font-medium">Your Price</span>
          <span className="text-lg font-bold text-primary">
            ${yourPrice.toFixed(2)}
          </span>
        </div>

        {/* Profit Indicator */}
        <div className={cn(
          "flex items-center gap-2 text-xs px-2 py-1 rounded",
          getProfitBg()
        )}>
          {markupPercentage < 10 ? (
            <AlertTriangle className={cn("w-3 h-3", getProfitColor())} />
          ) : (
            <TrendingUp className={cn("w-3 h-3", getProfitColor())} />
          )}
          <span className={getProfitColor()}>{getProfitLabel()}</span>
        </div>

        {showDetailedInfo && (
          <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2 mt-2">
            <div className="flex items-center gap-1 mb-1">
              <Calculator className="w-3 h-3" />
              <span className="font-medium">Example Calculation</span>
            </div>
            <p>If you sell 1000 units at ${yourPrice.toFixed(2)}/1k:</p>
            <p className={cn("font-medium", getProfitColor())}>
              Your profit: ${(profit * 1).toFixed(2)} per 1000 units
            </p>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default MarkupEducation;