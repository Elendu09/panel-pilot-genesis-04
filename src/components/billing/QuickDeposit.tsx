import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  Wallet,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
// usePanel removed - not needed since we use admin gateways now
import { useAdminPaymentGateways } from "@/hooks/useAdminPaymentGateways";

interface QuickDepositProps {
  onDeposit: (amount: number, method: string) => void;
  loading?: boolean;
}

const quickAmounts = [10, 25, 50, 100, 250, 500];

export const QuickDeposit = ({ onDeposit, loading }: QuickDepositProps) => {
  // Use admin-controlled payment gateways for panel owner deposits (not panel-configured buyer gateways)
  const { gateways, loading: gatewaysLoading } = useAdminPaymentGateways();
  const [amount, setAmount] = useState<number | string>(50);
  const [selectedMethod, setSelectedMethod] = useState<string>("stripe");

  useEffect(() => {
    if (!selectedMethod && gateways.length > 0) setSelectedMethod(gateways[0].id);
    if (selectedMethod && gateways.length > 0 && !gateways.some((g) => g.id === selectedMethod)) {
      setSelectedMethod(gateways[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gateways.length]);

  const handleQuickAmount = (value: number) => {
    setAmount(value);
  };

  const handleDeposit = () => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount) || numAmount <= 0) return;
    onDeposit(numAmount, selectedMethod);
  };

  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  const isValidAmount = !isNaN(numericAmount) && numericAmount > 0;

  return (
    <Card className="bg-card/60 backdrop-blur-xl border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-primary" />
          Add Funds
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Amount Buttons */}
        <div>
          <Label className="text-sm text-muted-foreground">Select Amount</Label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {quickAmounts.map((value) => (
              <Button
                key={value}
                variant={amount === value ? "default" : "outline"}
                className={cn(
                  "h-12 text-lg font-semibold",
                  amount === value && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                )}
                onClick={() => handleQuickAmount(value)}
                disabled={loading}
              >
                ${value}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Amount */}
        <div>
          <Label htmlFor="custom-amount">Or enter custom amount</Label>
          <div className="relative mt-1">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="custom-amount"
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-10 text-lg h-12"
              placeholder="Enter amount"
              disabled={loading}
            />
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <Label className="text-sm text-muted-foreground">Payment Method</Label>
          {gatewaysLoading ? (
            <div className="mt-2 rounded-lg border border-border/50 p-4 text-sm text-muted-foreground">
              Loading payment methods...
            </div>
          ) : gateways.length === 0 ? (
            <div className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-600 dark:text-amber-400 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Payment gateways have not been configured by the platform administrator yet. Please check back later or contact support.</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {gateways.map((g) => (
                <Button
                  key={g.id}
                  variant="outline"
                  disabled={loading}
                  className={cn(
                    "h-14 justify-start gap-3 relative",
                    selectedMethod === g.id && "border-primary bg-primary/5 ring-2 ring-primary ring-offset-2 ring-offset-background"
                  )}
                  onClick={() => setSelectedMethod(g.id)}
                >
                  <span className="font-medium">{g.displayName}</span>
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Deposit Button */}
        <Button 
          className="w-full h-12 text-lg gap-2" 
          onClick={handleDeposit}
          disabled={loading || gatewaysLoading || gateways.length === 0 || !isValidAmount}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <DollarSign className="w-5 h-5" />
              Deposit ${isValidAmount ? numericAmount.toFixed(2) : '0.00'}
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Secure payment processing. You'll be redirected to complete payment.
        </p>
      </CardContent>
    </Card>
  );
};
