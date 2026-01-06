import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Package, Link as LinkIcon, Hash } from "lucide-react";
import { SOCIAL_ICONS_MAP } from "@/components/icons/SocialIcons";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { SpeedGauge } from "@/components/buyer/SpeedGauge";

interface BulkOrderRow {
  id: string;
  serviceId: string;
  quantity: number;
  targetUrl: string;
}

interface BulkAddFormProps {
  services: any[];
  getEffectivePrice: (service: any) => number;
  formatPrice: (amount: number) => string;
  onAddToCart: (items: { service: any; quantity: number; targetUrl: string; effectivePrice: number }[]) => Promise<void>;
  disabled?: boolean;
}

export const BulkAddForm = ({
  services,
  getEffectivePrice,
  formatPrice,
  onAddToCart,
  disabled = false,
}: BulkAddFormProps) => {
  const [rows, setRows] = useState<BulkOrderRow[]>([
    { id: crypto.randomUUID(), serviceId: "", quantity: 1000, targetUrl: "" },
  ]);
  const [adding, setAdding] = useState(false);

  // Group services by category for easier selection
  const groupedServices = useMemo(() => {
    const groups: Record<string, any[]> = {};
    services.forEach((s) => {
      const cat = s.category || "other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(s);
    });
    return groups;
  }, [services]);

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { id: crypto.randomUUID(), serviceId: "", quantity: 1000, targetUrl: "" },
    ]);
  };

  const removeRow = (id: string) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const updateRow = (id: string, updates: Partial<BulkOrderRow>) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const getRowTotal = (row: BulkOrderRow) => {
    const service = services.find((s) => s.id === row.serviceId);
    if (!service) return 0;
    return (getEffectivePrice(service) * row.quantity) / 1000;
  };

  const totalAmount = rows.reduce((sum, row) => sum + getRowTotal(row), 0);
  const validRows = rows.filter(
    (r) => r.serviceId && r.targetUrl.trim() && r.quantity > 0
  );

  const handleAddAll = async () => {
    if (validRows.length === 0) return;

    setAdding(true);
    try {
      const items = validRows.map((row) => {
        const service = services.find((s) => s.id === row.serviceId)!;
        return {
          service,
          quantity: row.quantity,
          targetUrl: row.targetUrl,
          effectivePrice: getEffectivePrice(service),
        };
      });

      await onAddToCart(items);

      // Reset form
      setRows([
        { id: crypto.randomUUID(), serviceId: "", quantity: 1000, targetUrl: "" },
      ]);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">Bulk Add Services</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={addRow}
          disabled={disabled || adding}
          className="gap-1 h-8"
        >
          <Plus className="w-3 h-3" />
          Add Row
        </Button>
      </div>

      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
        <AnimatePresence mode="popLayout">
          {rows.map((row, index) => {
            const selectedService = services.find((s) => s.id === row.serviceId);
            const categoryData = selectedService
              ? SOCIAL_ICONS_MAP[selectedService.category] || SOCIAL_ICONS_MAP.other
              : null;

            return (
              <motion.div
                key={row.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-3 rounded-lg border bg-card/50 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    #{index + 1}
                  </Badge>
                  {rows.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRow(row.id)}
                      disabled={disabled || adding}
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>

                {/* Service Select */}
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    Service
                  </Label>
                  <Select
                    value={row.serviceId}
                    onValueChange={(val) => {
                      const svc = services.find((s) => s.id === val);
                      updateRow(row.id, {
                        serviceId: val,
                        quantity: svc?.min_quantity || 1000,
                      });
                    }}
                    disabled={disabled || adding}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Select service..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {Object.entries(groupedServices).map(([cat, svcs]) => {
                        const catData = SOCIAL_ICONS_MAP[cat] || SOCIAL_ICONS_MAP.other;
                        const CatIcon = catData.icon;
                        return (
                          <div key={cat}>
                            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                              <div className={cn("p-1 rounded", catData.bgColor)}>
                                <CatIcon className="w-2.5 h-2.5 text-white" />
                              </div>
                              {catData.label || cat}
                            </div>
                            {svcs.map((svc) => (
                              <SelectItem
                                key={svc.id}
                                value={svc.id}
                                className="text-sm"
                              >
                                <div className="flex items-center justify-between w-full gap-2">
                                  <span className="truncate max-w-[180px]">
                                    {svc.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatPrice(getEffectivePrice(svc))}/1k
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </div>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Quantity */}
                  <div className="space-y-1.5">
                    <Label className="text-xs flex items-center gap-1">
                      <Hash className="w-3 h-3" />
                      Quantity
                    </Label>
                    <Input
                      type="number"
                      value={row.quantity}
                      onChange={(e) =>
                        updateRow(row.id, {
                          quantity: Math.max(
                            selectedService?.min_quantity || 1,
                            parseInt(e.target.value) || 0
                          ),
                        })
                      }
                      min={selectedService?.min_quantity || 1}
                      className="h-9 text-sm"
                      disabled={disabled || adding || !row.serviceId}
                    />
                  </div>

                  {/* Line Total */}
                  <div className="space-y-1.5">
                    <Label className="text-xs">Total</Label>
                    <div className="h-9 px-3 flex items-center rounded-md border bg-muted/50 text-sm font-medium">
                      {formatPrice(getRowTotal(row))}
                    </div>
                  </div>
                </div>

                {/* Target URL */}
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1">
                    <LinkIcon className="w-3 h-3" />
                    Target URL
                  </Label>
                  <Input
                    placeholder="https://..."
                    value={row.targetUrl}
                    onChange={(e) =>
                      updateRow(row.id, { targetUrl: e.target.value })
                    }
                    className="h-9 text-sm"
                    disabled={disabled || adding || !row.serviceId}
                  />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between pt-2 border-t">
        <div>
          <span className="text-sm text-muted-foreground">
            {validRows.length} of {rows.length} rows ready
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-bold">{formatPrice(totalAmount)}</span>
          <Button
            onClick={handleAddAll}
            disabled={disabled || adding || validRows.length === 0}
            size="sm"
            className="gap-1"
          >
            <Plus className="w-3 h-3" />
            Add All to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};
