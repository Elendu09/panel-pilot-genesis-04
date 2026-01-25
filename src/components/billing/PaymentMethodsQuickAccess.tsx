import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Settings,
  Check,
  X,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { usePanel } from "@/hooks/usePanel";
import { useAvailablePaymentGateways } from "@/hooks/useAvailablePaymentGateways";

interface PaymentMethod {
  id: string;
  name: string;
  enabled: boolean;
  icon: "card" | "wallet";
}

interface PaymentMethodsQuickAccessProps {
  methods?: PaymentMethod[];
}

const defaultMethods: PaymentMethod[] = [];

export const PaymentMethodsQuickAccess = ({ methods = defaultMethods }: PaymentMethodsQuickAccessProps) => {
  const navigate = useNavigate();
  const { panel } = usePanel();
  const { gateways, loading } = useAvailablePaymentGateways({
    panelId: panel?.id,
    panelSettings: (panel?.settings as any) || null,
  });

  const derivedMethods: PaymentMethod[] = methods.length
    ? methods
    : gateways.map((g) => ({
        id: g.id,
        name: g.displayName,
        enabled: true,
        icon: g.id === "stripe" ? "card" : "wallet",
      }));

  const enabledCount = derivedMethods.filter((m) => m.enabled).length;

  const getIcon = (icon: string) => (icon === "card" ? CreditCard : CreditCard);

  return (
    <Card className="bg-card/60 backdrop-blur-xl border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Methods
          </CardTitle>
          <Badge variant="secondary">
            {enabledCount} active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {loading ? (
            <div className="p-3 rounded-lg border border-border/50 text-sm text-muted-foreground">
              Loading payment methods...
            </div>
          ) : derivedMethods.length === 0 ? (
            <div className="p-3 rounded-lg border border-border/50 text-sm text-muted-foreground">
              No valid payment gateways configured.
            </div>
          ) : (
            derivedMethods.map((method) => {
            const Icon = getIcon(method.icon);
            return (
              <div 
                key={method.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border",
                  method.enabled ? "bg-muted/30 border-border/50" : "bg-muted/10 border-dashed border-muted"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    method.enabled ? "bg-primary/10" : "bg-muted"
                  )}>
                    <Icon className={cn(
                      "w-4 h-4",
                      method.enabled ? "text-primary" : "text-muted-foreground"
                    )} />
                  </div>
                  <span className={cn(
                    "font-medium",
                    !method.enabled && "text-muted-foreground"
                  )}>
                    {method.name}
                  </span>
                </div>
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center",
                  method.enabled ? "bg-green-500/10" : "bg-muted"
                )}>
                  {method.enabled ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <X className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            );
          })
          )}
        </div>

        <Button 
          variant="outline" 
          className="w-full gap-2"
          onClick={() => navigate("/panel/payment-methods")}
        >
          <Settings className="w-4 h-4" />
          Manage Payment Methods
          <ArrowRight className="w-4 h-4 ml-auto" />
        </Button>
      </CardContent>
    </Card>
  );
};

