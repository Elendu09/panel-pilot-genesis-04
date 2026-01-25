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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { CreditCard, CheckCircle2, Loader2 } from "lucide-react";
import type { AvailableGateway } from "@/hooks/useAvailablePaymentGateways";

interface GatewaySelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gateways: AvailableGateway[];
  onSelect: (gatewayId: string) => void;
  loading?: boolean;
  title?: string;
  description?: string;
}

const gatewayColors: Record<string, string> = {
  stripe: "from-blue-500 to-blue-600",
  paypal: "from-blue-400 to-blue-500",
  flutterwave: "from-orange-400 to-yellow-400",
  paystack: "from-cyan-500 to-blue-500",
  korapay: "from-purple-500 to-indigo-500",
  razorpay: "from-blue-600 to-indigo-600",
  cryptomus: "from-green-500 to-green-600",
  coinbase: "from-blue-600 to-blue-700",
  crypto: "from-orange-500 to-yellow-500",
  manual: "from-emerald-500 to-teal-600",
};

export const GatewaySelectDialog = ({
  open,
  onOpenChange,
  gateways,
  onSelect,
  loading = false,
  title = "Select Payment Method",
  description = "Choose how you'd like to pay",
}: GatewaySelectDialogProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleConfirm = () => {
    if (selectedId) {
      onSelect(selectedId);
    }
  };

  const getGradient = (gateway: AvailableGateway) => {
    return gatewayColors[gateway.id] || gatewayColors[gateway.category || ""] || "from-gray-500 to-gray-600";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[300px] pr-2">
          <div className="grid gap-2">
            {gateways.map((gateway) => (
              <button
                key={gateway.id}
                onClick={() => setSelectedId(gateway.id)}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border transition-all text-left",
                  selectedId === gateway.id
                    ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br",
                      getGradient(gateway)
                    )}
                  >
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{gateway.displayName}</p>
                    {(gateway.feePercentage || gateway.fixedFee) && (
                      <p className="text-xs text-muted-foreground">
                        {gateway.feePercentage ? `${gateway.feePercentage}%` : ""}
                        {gateway.feePercentage && gateway.fixedFee ? " + " : ""}
                        {gateway.fixedFee ? `$${gateway.fixedFee}` : ""} fee
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {gateway.category && (
                    <Badge variant="outline" className="text-xs capitalize">
                      {gateway.category}
                    </Badge>
                  )}
                  {selectedId === gateway.id && (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedId || loading}
            className="bg-gradient-primary"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Continue to Payment"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
