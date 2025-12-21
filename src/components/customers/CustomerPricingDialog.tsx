import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Percent, DollarSign, Users, Info } from "lucide-react";

interface CustomerPricingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: {
    id: string;
    name: string;
    email: string;
    segment: string;
  } | null;
  onSave: (customerId: string, discount: number) => void;
}

export const CustomerPricingDialog = ({
  open,
  onOpenChange,
  customer,
  onSave,
}: CustomerPricingDialogProps) => {
  const [discountPercent, setDiscountPercent] = useState(0);
  const [applyToAll, setApplyToAll] = useState(true);

  if (!customer) return null;

  const handleSave = () => {
    onSave(customer.id, discountPercent);
    toast({ 
      title: "Custom Pricing Set", 
      description: `${discountPercent}% discount applied to ${customer.name}` 
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Percent className="w-4 h-4 text-primary" />
            </div>
            Set Individual Pricing
          </DialogTitle>
          <DialogDescription>
            Configure custom discount for {customer.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Customer Info */}
          <Card className="bg-muted/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{customer.name}</p>
                <p className="text-sm text-muted-foreground">{customer.email}</p>
              </div>
              <Badge variant="outline" className="ml-auto">{customer.segment}</Badge>
            </CardContent>
          </Card>

          {/* Discount Slider */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Discount Percentage</Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[discountPercent]}
                onValueChange={([value]) => setDiscountPercent(value)}
                min={0}
                max={50}
                step={1}
                className="flex-1"
              />
              <div className="w-20 text-center">
                <span className="text-2xl font-bold text-primary">{discountPercent}%</span>
              </div>
            </div>
          </div>

          {/* Apply to all services */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Apply to all services</p>
                <p className="text-xs text-muted-foreground">Discount applies globally</p>
              </div>
            </div>
            <Switch 
              checked={applyToAll}
              onCheckedChange={setApplyToAll}
            />
          </div>

          {/* Preview */}
          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <Info className="w-4 h-4" />
                <p className="text-sm">
                  This customer will receive a {discountPercent}% discount on {applyToAll ? "all services" : "selected services"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Set Pricing</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
