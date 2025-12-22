import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Wallet, Plus, Minus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BulkBalanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onApply: (action: "add" | "subtract", amount: number, reason: string) => Promise<void>;
}

export const BulkBalanceDialog = ({
  open,
  onOpenChange,
  selectedCount,
  onApply,
}: BulkBalanceDialogProps) => {
  const [action, setAction] = useState<"add" | "subtract">("add");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [applying, setApplying] = useState(false);

  const handleApply = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;

    setApplying(true);
    try {
      await onApply(action, numAmount, reason);
      onOpenChange(false);
      setAmount("");
      setReason("");
      setAction("add");
    } finally {
      setApplying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Bulk Balance Adjustment
          </DialogTitle>
          <DialogDescription>
            Adjust balance for{" "}
            <Badge variant="secondary" className="mx-1">
              {selectedCount}
            </Badge>
            selected customers
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Action Toggle */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setAction("add")}
              className={cn(
                "flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all",
                action === "add"
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
                  : "border-border hover:border-emerald-500/50"
              )}
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Add Funds</span>
            </button>
            <button
              onClick={() => setAction("subtract")}
              className={cn(
                "flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all",
                action === "subtract"
                  ? "border-destructive bg-destructive/10 text-destructive"
                  : "border-border hover:border-destructive/50"
              )}
            >
              <Minus className="w-5 h-5" />
              <span className="font-medium">Deduct Funds</span>
            </button>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label>Amount ($)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                type="number"
                placeholder="0.00"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7 text-lg"
              />
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label>Reason (Optional)</Label>
            <Input
              placeholder="e.g., Bonus credit, Refund, Promotional..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          {/* Summary */}
          {amount && parseFloat(amount) > 0 && (
            <div className={cn(
              "p-4 rounded-xl",
              action === "add" ? "bg-emerald-500/10" : "bg-destructive/10"
            )}>
              <p className="text-sm">
                <span className="text-muted-foreground">Total adjustment:</span>{" "}
                <span className={cn(
                  "font-bold",
                  action === "add" ? "text-emerald-500" : "text-destructive"
                )}>
                  {action === "add" ? "+" : "-"}${parseFloat(amount).toFixed(2)}
                </span>
                <span className="text-muted-foreground"> × {selectedCount} customers = </span>
                <span className={cn(
                  "font-bold",
                  action === "add" ? "text-emerald-500" : "text-destructive"
                )}>
                  {action === "add" ? "+" : "-"}${(parseFloat(amount) * selectedCount).toFixed(2)}
                </span>
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={!amount || parseFloat(amount) <= 0 || applying}
            className={cn(
              action === "add" 
                ? "bg-emerald-500 hover:bg-emerald-600" 
                : "bg-destructive hover:bg-destructive/90"
            )}
          >
            {applying && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {action === "add" ? "Add to All" : "Deduct from All"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
