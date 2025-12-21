import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Percent, Users, CalendarIcon, Check } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface BulkDiscountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onApply: (discount: number, expiresAt: Date | null) => void;
}

export const BulkDiscountDialog = ({
  open,
  onOpenChange,
  selectedCount,
  onApply,
}: BulkDiscountDialogProps) => {
  const { toast } = useToast();
  const [discount, setDiscount] = useState(10);
  const [hasExpiry, setHasExpiry] = useState(false);
  const [expiryDate, setExpiryDate] = useState<Date | undefined>();
  const [applying, setApplying] = useState(false);

  const handleApply = async () => {
    if (hasExpiry && !expiryDate) {
      toast({ variant: "destructive", title: "Error", description: "Please select an expiry date" });
      return;
    }

    setApplying(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      onApply(discount, hasExpiry && expiryDate ? expiryDate : null);
      toast({ 
        title: "Discount Applied", 
        description: `${discount}% discount applied to ${selectedCount} customers` 
      });
      onOpenChange(false);
      setDiscount(10);
      setHasExpiry(false);
      setExpiryDate(undefined);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to apply discount" });
    } finally {
      setApplying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Percent className="w-5 h-5" />
            Apply Bulk Discount
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Applying to <Badge variant="secondary">{selectedCount} customers</Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Discount Percentage</Label>
              <span className="text-2xl font-bold text-primary">{discount}%</span>
            </div>
            <Slider
              value={[discount]}
              onValueChange={(value) => setDiscount(value[0])}
              max={50}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1%</span>
              <span>25%</span>
              <span>50%</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div>
              <Label>Set Expiry Date</Label>
              <p className="text-xs text-muted-foreground">Optional: discount expires on a specific date</p>
            </div>
            <Switch checked={hasExpiry} onCheckedChange={setHasExpiry} />
          </div>

          {hasExpiry && (
            <div>
              <Label>Expiry Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full mt-1 justify-start text-left font-normal",
                      !expiryDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expiryDate ? format(expiryDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={expiryDate}
                    onSelect={setExpiryDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          <div className="p-4 bg-muted/30 rounded-lg space-y-2">
            <p className="text-sm font-medium">Summary</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Customers affected</span>
              <span>{selectedCount}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Discount</span>
              <span className="text-primary font-medium">{discount}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Duration</span>
              <span>{hasExpiry && expiryDate ? `Until ${format(expiryDate, "PP")}` : "Permanent"}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={applying} className="gap-2">
            <Check className="w-4 h-4" />
            {applying ? "Applying..." : "Apply Discount"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
