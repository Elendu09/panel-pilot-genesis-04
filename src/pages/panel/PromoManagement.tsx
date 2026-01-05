import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Plus, 
  Sparkles, 
  Tag, 
  Percent, 
  DollarSign, 
  Calendar, 
  Users, 
  Copy, 
  Trash2, 
  Edit, 
  RefreshCw,
  Zap,
  TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { usePanel } from "@/hooks/usePanel";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface PromoCode {
  id: string;
  panel_id: string;
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  used_count: number;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
}

const PromoManagement = () => {
  const { panel } = usePanel();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  
  // Form state
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minOrderAmount, setMinOrderAmount] = useState<number>(5);
  const [maxUses, setMaxUses] = useState<number | null>(null);
  const [validFrom, setValidFrom] = useState<string>("");
  const [validUntil, setValidUntil] = useState<string>("");
  const [isActive, setIsActive] = useState(true);

  // Fetch promo codes
  const { data: promoCodes = [], isLoading } = useQuery({
    queryKey: ['promo-codes', panel?.id],
    queryFn: async () => {
      if (!panel?.id) return [];
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('panel_id', panel.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PromoCode[];
    },
    enabled: !!panel?.id,
  });

  // Generate random code
  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const prefix = panel?.name?.slice(0, 3).toUpperCase() || 'SMM';
    let code = prefix;
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(code);
  };

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: {
      code: string;
      discount_type: string;
      discount_value: number;
      min_order_amount: number;
      max_uses: number | null;
      valid_from: string | null;
      valid_until: string | null;
      is_active: boolean;
    }) => {
      if (editingPromo) {
        const { error } = await supabase
          .from('promo_codes')
          .update(data)
          .eq('id', editingPromo.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('promo_codes')
          .insert([{
            ...data,
            panel_id: panel?.id,
          }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
      toast({ title: editingPromo ? "Promo code updated" : "Promo code created" });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to save promo code",
        variant: "destructive" 
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('promo_codes')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
      toast({ title: "Promo code deleted" });
    },
  });

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('promo_codes')
        .update({ is_active: isActive })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
    },
  });

  const resetForm = () => {
    setCode("");
    setDiscountType('percent');
    setDiscountValue(10);
    setMinOrderAmount(5);
    setMaxUses(null);
    setValidFrom("");
    setValidUntil("");
    setIsActive(true);
    setEditingPromo(null);
  };

  const handleEdit = (promo: PromoCode) => {
    setEditingPromo(promo);
    setCode(promo.code);
    setDiscountType(promo.discount_type);
    setDiscountValue(promo.discount_value);
    setMinOrderAmount(promo.min_order_amount);
    setMaxUses(promo.max_uses);
    setValidFrom(promo.valid_from ? promo.valid_from.split('T')[0] : "");
    setValidUntil(promo.valid_until ? promo.valid_until.split('T')[0] : "");
    setIsActive(promo.is_active);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!code) {
      toast({ title: "Please enter a promo code", variant: "destructive" });
      return;
    }
    
    saveMutation.mutate({
      code: code.toUpperCase(),
      discount_type: discountType,
      discount_value: discountValue,
      min_order_amount: minOrderAmount,
      max_uses: maxUses,
      valid_from: validFrom || null,
      valid_until: validUntil || null,
      is_active: isActive,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Code copied to clipboard" });
  };

  // Stats
  const totalCodes = promoCodes.length;
  const activeCodes = promoCodes.filter(p => p.is_active).length;
  const totalUses = promoCodes.reduce((acc, p) => acc + (p.used_count || 0), 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-20"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Tag className="w-6 h-6 text-primary" />
            Promo Codes
          </h1>
          <p className="text-muted-foreground text-sm">
            Create and manage promotional codes for your customers
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Promo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingPromo ? "Edit Promo Code" : "Create Promo Code"}</DialogTitle>
              <DialogDescription>
                {editingPromo ? "Update the promo code details" : "Create a new promotional code for your customers"}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* Code */}
              <div className="space-y-2">
                <Label>Promo Code</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="SUMMER2024"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="font-mono uppercase"
                  />
                  <Button variant="outline" size="icon" onClick={generateCode} title="Generate random code">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Discount Type</Label>
                  <Select value={discountType} onValueChange={(v: 'percent' | 'fixed') => setDiscountType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">
                        <div className="flex items-center gap-2">
                          <Percent className="w-4 h-4" />
                          Percentage
                        </div>
                      </SelectItem>
                      <SelectItem value="fixed">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          Fixed Amount
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Discount Value</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {discountType === 'percent' ? '%' : '$'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Min Order & Max Uses */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min Order Amount ($)</Label>
                  <Input
                    type="number"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Uses (leave empty for unlimited)</Label>
                  <Input
                    type="number"
                    value={maxUses || ""}
                    onChange={(e) => setMaxUses(e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="Unlimited"
                  />
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valid From</Label>
                  <Input
                    type="date"
                    value={validFrom}
                    onChange={(e) => setValidFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valid Until</Label>
                  <Input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <Label>Active</Label>
                </div>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving..." : editingPromo ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-md bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Tag className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCodes}</p>
                <p className="text-xs text-muted-foreground">Total Codes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-br from-green-500/10 to-green-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Sparkles className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeCodes}</p>
                <p className="text-xs text-muted-foreground">Active Codes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-br from-amber-500/10 to-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <TrendingUp className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalUses}</p>
                <p className="text-xs text-muted-foreground">Total Uses</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Promo Codes Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">All Promo Codes</CardTitle>
          <CardDescription>Manage your promotional codes</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : promoCodes.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <h3 className="text-lg font-medium mb-1">No promo codes yet</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Create your first promotional code to attract more customers
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Promo Code
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Min Order</TableHead>
                    <TableHead>Uses</TableHead>
                    <TableHead>Valid Until</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promoCodes.map((promo) => (
                    <TableRow key={promo.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="font-mono font-semibold bg-muted px-2 py-1 rounded">
                            {promo.code}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => copyToClipboard(promo.code)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="gap-1">
                          {promo.discount_type === 'percent' ? (
                            <><Percent className="w-3 h-3" /> {promo.discount_value}%</>
                          ) : (
                            <><DollarSign className="w-3 h-3" /> {promo.discount_value}</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>${promo.min_order_amount}</TableCell>
                      <TableCell>
                        <span className="font-mono">
                          {promo.used_count}/{promo.max_uses || '∞'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {promo.valid_until ? (
                          <span className="text-sm">
                            {format(new Date(promo.valid_until), 'MMM d, yyyy')}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">No expiry</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={promo.is_active}
                          onCheckedChange={(checked) => 
                            toggleActiveMutation.mutate({ id: promo.id, isActive: checked })
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(promo)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete promo code?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the promo code "{promo.code}". This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteMutation.mutate(promo.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PromoManagement;
