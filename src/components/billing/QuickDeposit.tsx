import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  CreditCard, 
  Wallet,
  Zap,
  Bitcoin
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickDepositProps {
  onDeposit: (amount: number, method: string) => void;
  loading?: boolean;
}

const quickAmounts = [10, 25, 50, 100, 250, 500];

const paymentMethods = [
  { id: "stripe", name: "Credit Card", icon: CreditCard, available: true },
  { id: "paypal", name: "PayPal", icon: Wallet, available: true },
  { id: "crypto", name: "Crypto", icon: Bitcoin, available: true },
  { id: "perfectmoney", name: "Perfect Money", icon: DollarSign, available: false },
];

export const QuickDeposit = ({ onDeposit, loading }: QuickDepositProps) => {
  const [amount, setAmount] = useState<number | string>(50);
  const [selectedMethod, setSelectedMethod] = useState("stripe");

  const handleQuickAmount = (value: number) => {
    setAmount(value);
  };

  const handleDeposit = () => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount) || numAmount <= 0) return;
    onDeposit(numAmount, selectedMethod);
  };

  return (
    <Card className="bg-card/60 backdrop-blur-xl border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Quick Deposit
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
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-10 text-lg h-12"
              placeholder="Enter amount"
            />
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <Label className="text-sm text-muted-foreground">Payment Method</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              return (
                <Button
                  key={method.id}
                  variant="outline"
                  disabled={!method.available}
                  className={cn(
                    "h-14 justify-start gap-3 relative",
                    selectedMethod === method.id && method.available && "border-primary bg-primary/5 ring-2 ring-primary ring-offset-2 ring-offset-background"
                  )}
                  onClick={() => method.available && setSelectedMethod(method.id)}
                >
                  <Icon className="w-5 h-5" />
                  <span>{method.name}</span>
                  {!method.available && (
                    <Badge variant="secondary" className="absolute right-2 top-1/2 -translate-y-1/2 text-xs">
                      Soon
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Deposit Button */}
        <Button 
          className="w-full h-12 text-lg gap-2" 
          onClick={handleDeposit}
          disabled={loading || !amount || (typeof amount === 'string' && parseFloat(amount) <= 0)}
        >
          <DollarSign className="w-5 h-5" />
          {loading ? "Processing..." : `Deposit $${typeof amount === 'string' ? amount : amount.toFixed(2)}`}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Secure payment processing. Funds are credited instantly.
        </p>
      </CardContent>
    </Card>
  );
};
