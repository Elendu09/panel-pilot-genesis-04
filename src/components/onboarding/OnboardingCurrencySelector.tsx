import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Info, DollarSign } from "lucide-react";
import { useEffect } from "react";

interface OnboardingCurrencySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const OnboardingCurrencySelector = ({ value, onChange }: OnboardingCurrencySelectorProps) => {
  // Always lock to USD
  useEffect(() => {
    if (value !== 'USD') {
      onChange('USD');
    }
  }, [value, onChange]);

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-base font-medium">Default Panel Currency</Label>
        <p className="text-sm text-muted-foreground mt-1">
          All service prices and transactions will be displayed in USD.
        </p>
      </div>
      
      <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-background/50">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-medium">USD — United States Dollar ($)</p>
        </div>
        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Default</Badge>
      </div>

      <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
        <p className="flex items-center gap-1.5 font-medium">
          <Info className="w-3.5 h-3.5" />
          How this works:
        </p>
        <ul className="list-disc list-inside space-y-0.5 ml-1">
          <li>Service prices will display in USD</li>
          <li>Buyers see prices in USD when browsing your services</li>
          <li>All transactions and earnings are tracked in USD</li>
        </ul>
      </div>
    </div>
  );
};
