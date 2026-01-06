import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  RefreshCw, 
  DollarSign, 
  Clock, 
  Edit2, 
  Check, 
  X,
  TrendingUp,
  Globe,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface CurrencyRate {
  id: string;
  currency_code: string;
  currency_name: string;
  rate_to_usd: number;
  is_auto_updated: boolean;
  last_updated_at: string;
}

const ExchangeRateManager = () => {
  const { toast } = useToast();
  const [rates, setRates] = useState<CurrencyRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      const { data, error } = await supabase
        .from('currency_rates')
        .select('*')
        .order('currency_code');
      
      if (error) throw error;
      setRates(data || []);
    } catch (error) {
      console.error('Error fetching rates:', error);
      toast({ variant: "destructive", title: "Failed to load exchange rates" });
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (rate: CurrencyRate) => {
    setEditingId(rate.id);
    setEditValue(rate.rate_to_usd.toString());
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const saveRate = async (rate: CurrencyRate) => {
    const newRate = parseFloat(editValue);
    if (isNaN(newRate) || newRate <= 0) {
      toast({ variant: "destructive", title: "Invalid rate", description: "Rate must be a positive number" });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('currency_rates')
        .update({ 
          rate_to_usd: newRate,
          last_updated_at: new Date().toISOString(),
          is_auto_updated: false
        })
        .eq('id', rate.id);

      if (error) throw error;
      
      toast({ title: "Rate updated", description: `${rate.currency_code} rate set to ${newRate} USD` });
      setEditingId(null);
      fetchRates();
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to update rate" });
    } finally {
      setSaving(false);
    }
  };

  const toggleAutoUpdate = async (rate: CurrencyRate) => {
    try {
      const { error } = await supabase
        .from('currency_rates')
        .update({ is_auto_updated: !rate.is_auto_updated })
        .eq('id', rate.id);

      if (error) throw error;
      fetchRates();
      toast({ title: rate.is_auto_updated ? "Auto-update disabled" : "Auto-update enabled" });
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to toggle auto-update" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Exchange Rates
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage currency conversion rates for provider pricing
          </p>
        </div>
        <Button variant="outline" onClick={fetchRates} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Conversion Rates (1 Currency = X USD)
          </CardTitle>
          <CardDescription>
            These rates are used to convert provider prices to USD before applying markup
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {rates.map((rate) => (
              <div 
                key={rate.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border bg-card/50",
                  rate.currency_code === 'USD' && "bg-primary/5 border-primary/20"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center font-mono font-bold text-sm">
                    {rate.currency_code}
                  </div>
                  <div>
                    <p className="font-medium">{rate.currency_name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(rate.last_updated_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {editingId === rate.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.000001"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-32 h-8 text-sm"
                        autoFocus
                      />
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => saveRate(rate)} disabled={saving}>
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 text-green-500" />}
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={cancelEdit}>
                        <X className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="text-right">
                        <p className="font-mono font-semibold text-lg">
                          <DollarSign className="w-4 h-4 inline text-muted-foreground" />
                          {rate.rate_to_usd.toFixed(6)}
                        </p>
                      </div>
                      
                      {rate.currency_code !== 'USD' && (
                        <>
                          <div className="flex items-center gap-2">
                            <Switch 
                              checked={rate.is_auto_updated}
                              onCheckedChange={() => toggleAutoUpdate(rate)}
                            />
                            <span className="text-xs text-muted-foreground">Auto</span>
                          </div>
                          
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(rate)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      
                      {rate.currency_code === 'USD' && (
                        <Badge variant="secondary">Base</Badge>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card bg-muted/30">
        <CardContent className="p-4">
          <h4 className="font-medium mb-2">How Currency Conversion Works</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Provider rates are stored in their original currency</li>
            <li>• All rates are converted to USD using these exchange rates</li>
            <li>• Markup percentage is applied to the USD cost</li>
            <li>• Buyers always see prices in USD</li>
            <li>• Recalculate pricing after updating exchange rates</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExchangeRateManager;
