import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  Search,
  DollarSign,
  Percent,
  Loader2,
  Save,
  Trash2,
  Crown,
  UserCheck,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePanel } from "@/hooks/usePanel";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Customer {
  id: string;
  email: string;
  full_name: string | null;
  balance: number;
  total_spent: number;
  custom_discount: number;
}

interface CustomPrice {
  id?: string;
  client_id: string;
  custom_price: number | null;
  discount_percent: number;
}

interface CustomerPricingTabProps {
  serviceId: string;
  basePrice: number;
}

export const CustomerPricingTab = ({ serviceId, basePrice }: CustomerPricingTabProps) => {
  const { panel } = usePanel();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customPrices, setCustomPrices] = useState<Map<string, CustomPrice>>(new Map());
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (panel?.id && serviceId) {
      fetchData();
    }
  }, [panel?.id, serviceId]);

  const fetchData = async () => {
    if (!panel?.id) return;
    setLoading(true);
    try {
      // Fetch customers
      const { data: customersData, error: customersError } = await supabase
        .from('client_users')
        .select('id, email, full_name, balance, total_spent, custom_discount')
        .eq('panel_id', panel.id)
        .eq('is_active', true)
        .order('total_spent', { ascending: false });

      if (customersError) throw customersError;
      setCustomers(customersData || []);

      // Fetch existing custom prices for this service
      const { data: pricesData, error: pricesError } = await supabase
        .from('client_custom_prices')
        .select('*')
        .eq('panel_id', panel.id)
        .eq('service_id', serviceId);

      if (pricesError) throw pricesError;

      const pricesMap = new Map<string, CustomPrice>();
      (pricesData || []).forEach((p: any) => {
        pricesMap.set(p.client_id, {
          id: p.id,
          client_id: p.client_id,
          custom_price: p.custom_price,
          discount_percent: p.discount_percent || 0,
        });
      });
      setCustomPrices(pricesMap);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ variant: 'destructive', title: 'Failed to load customers' });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrice = async (customerId: string, customPrice: number | null, discountPercent: number) => {
    if (!panel?.id) return;
    setSaving(customerId);
    try {
      const existingPrice = customPrices.get(customerId);

      if (customPrice === null && discountPercent === 0) {
        // Remove custom pricing
        if (existingPrice?.id) {
          await supabase
            .from('client_custom_prices')
            .delete()
            .eq('id', existingPrice.id);
        }
        const newPrices = new Map(customPrices);
        newPrices.delete(customerId);
        setCustomPrices(newPrices);
        toast({ title: 'Custom pricing removed' });
      } else {
        // Upsert custom pricing
        const { data, error } = await supabase
          .from('client_custom_prices')
          .upsert({
            id: existingPrice?.id,
            panel_id: panel.id,
            client_id: customerId,
            service_id: serviceId,
            custom_price: customPrice,
            discount_percent: discountPercent,
          }, { onConflict: 'panel_id,client_id,service_id' })
          .select()
          .single();

        if (error) throw error;

        const newPrices = new Map(customPrices);
        newPrices.set(customerId, {
          id: data.id,
          client_id: customerId,
          custom_price: customPrice,
          discount_percent: discountPercent,
        });
        setCustomPrices(newPrices);
        toast({ title: 'Custom pricing saved' });
      }
    } catch (error) {
      console.error('Error saving price:', error);
      toast({ variant: 'destructive', title: 'Failed to save pricing' });
    } finally {
      setSaving(null);
    }
  };

  const getEffectivePrice = (customerId: string) => {
    const custom = customPrices.get(customerId);
    if (custom?.custom_price !== null && custom?.custom_price !== undefined) {
      return custom.custom_price;
    }
    if (custom?.discount_percent) {
      return basePrice * (1 - custom.discount_percent / 100);
    }
    return basePrice;
  };

  const filteredCustomers = customers.filter(c => 
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSegment = (totalSpent: number) => {
    if (totalSpent >= 1000) return 'vip';
    if (totalSpent >= 100) return 'regular';
    return 'new';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            Customer-Specific Pricing
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <p className="text-sm text-muted-foreground mb-4">
            Set special prices for individual customers. Base price: <span className="font-bold text-primary">${basePrice.toFixed(2)}</span>
          </p>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              className="pl-9 bg-background/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {filteredCustomers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No customers found</p>
                </div>
              ) : (
                filteredCustomers.map((customer) => {
                  const custom = customPrices.get(customer.id);
                  const effectivePrice = getEffectivePrice(customer.id);
                  const segment = getSegment(customer.total_spent);
                  const hasCustomPricing = custom && (custom.custom_price !== null || custom.discount_percent > 0);

                  return (
                    <CustomerPricingRow
                      key={customer.id}
                      customer={customer}
                      segment={segment}
                      basePrice={basePrice}
                      customPrice={custom?.custom_price ?? null}
                      discountPercent={custom?.discount_percent ?? 0}
                      effectivePrice={effectivePrice}
                      hasCustomPricing={!!hasCustomPricing}
                      saving={saving === customer.id}
                      onSave={(price, discount) => handleSavePrice(customer.id, price, discount)}
                    />
                  );
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

interface CustomerPricingRowProps {
  customer: Customer;
  segment: string;
  basePrice: number;
  customPrice: number | null;
  discountPercent: number;
  effectivePrice: number;
  hasCustomPricing: boolean;
  saving: boolean;
  onSave: (price: number | null, discount: number) => void;
}

const CustomerPricingRow = ({
  customer,
  segment,
  basePrice,
  customPrice,
  discountPercent,
  effectivePrice,
  hasCustomPricing,
  saving,
  onSave,
}: CustomerPricingRowProps) => {
  const [editPrice, setEditPrice] = useState<string>(customPrice?.toString() || '');
  const [editDiscount, setEditDiscount] = useState<string>(discountPercent.toString());
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    const price = editPrice ? parseFloat(editPrice) : null;
    const discount = parseFloat(editDiscount) || 0;
    onSave(price, discount);
    setIsEditing(false);
  };

  const handleRemove = () => {
    onSave(null, 0);
    setEditPrice('');
    setEditDiscount('0');
    setIsEditing(false);
  };

  return (
    <div className={cn(
      "p-3 rounded-lg border transition-colors",
      hasCustomPricing 
        ? "border-primary/30 bg-primary/5" 
        : "border-border/50 bg-muted/20"
    )}>
      <div className="flex items-center gap-3 mb-2">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs bg-primary/10 text-primary">
            {customer.full_name?.charAt(0) || customer.email.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {customer.full_name || customer.email.split('@')[0]}
          </p>
          <p className="text-xs text-muted-foreground truncate">{customer.email}</p>
        </div>
        <div className="flex items-center gap-2">
          {segment === 'vip' && (
            <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-500 border-purple-500/20">
              <Crown className="w-3 h-3 mr-1" />
              VIP
            </Badge>
          )}
          <Badge variant="outline" className={cn(
            "text-xs",
            hasCustomPricing 
              ? "bg-primary/10 text-primary border-primary/20" 
              : "bg-muted text-muted-foreground"
          )}>
            ${effectivePrice.toFixed(2)}
          </Badge>
        </div>
      </div>

      {isEditing ? (
        <div className="flex items-center gap-2 mt-3">
          <div className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              <Input
                type="number"
                placeholder="Custom price"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                className="h-8 pl-6 text-sm bg-background/50"
                step="0.01"
              />
            </div>
            <span className="text-muted-foreground text-sm">or</span>
            <div className="relative flex-1">
              <Input
                type="number"
                placeholder="Discount %"
                value={editDiscount}
                onChange={(e) => setEditDiscount(e.target.value)}
                className="h-8 pr-6 text-sm bg-background/50"
                step="1"
                max="100"
              />
              <Percent className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
            </div>
          </div>
          <Button size="sm" onClick={handleSave} disabled={saving} className="h-8">
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
          </Button>
          {hasCustomPricing && (
            <Button size="sm" variant="ghost" onClick={handleRemove} className="h-8 text-destructive hover:text-destructive">
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      ) : (
        <Button
          size="sm"
          variant="ghost"
          className="w-full h-7 text-xs mt-2"
          onClick={() => setIsEditing(true)}
        >
          {hasCustomPricing ? 'Edit Custom Price' : 'Set Custom Price'}
        </Button>
      )}
    </div>
  );
};