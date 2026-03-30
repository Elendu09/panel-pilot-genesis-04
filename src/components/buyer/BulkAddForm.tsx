import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Package, AlertTriangle, CheckCircle, Info, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface BulkAddFormProps {
  services: any[];
  getEffectivePrice: (service: any) => number;
  formatPrice: (amount: number) => string;
  onAddToCart: (items: { service: any; quantity: number; targetUrl: string; effectivePrice: number }[]) => Promise<void>;
  disabled?: boolean;
}

interface ParsedLine {
  lineNum: number;
  raw: string;
  serviceId: string;
  quantity: number;
  link: string;
  service: any | null;
  error: string | null;
  total: number;
}

export const BulkAddForm = ({
  services,
  getEffectivePrice,
  formatPrice,
  onAddToCart,
  disabled = false,
}: BulkAddFormProps) => {
  const [input, setInput] = useState("");
  const [adding, setAdding] = useState(false);

  // Build lookup by display_order (the tenant-facing ID)
  const serviceByDisplayOrder = useMemo(() => {
    const map = new Map<string, any>();
    services.forEach((s) => {
      if (s.display_order != null) {
        map.set(String(s.display_order), s);
      }
    });
    return map;
  }, [services]);

  // Parse each line
  const parsed: ParsedLine[] = useMemo(() => {
    if (!input.trim()) return [];

    return input
      .split("\n")
      .map((raw, idx) => {
        const trimmed = raw.trim();
        if (!trimmed) return null;

        const parts = trimmed.split("|").map((p) => p.trim());
        if (parts.length < 3) {
          return {
            lineNum: idx + 1,
            raw: trimmed,
            serviceId: "",
            quantity: 0,
            link: "",
            service: null,
            error: "Invalid format. Use: service_id|quantity|link",
            total: 0,
          };
        }

        const [serviceIdStr, quantityStr, link] = parts;
        const service = serviceByDisplayOrder.get(serviceIdStr);
        const quantity = parseInt(quantityStr, 10);

        if (!service) {
          return {
            lineNum: idx + 1,
            raw: trimmed,
            serviceId: serviceIdStr,
            quantity,
            link,
            service: null,
            error: `Service ID "${serviceIdStr}" not found`,
            total: 0,
          };
        }

        if (isNaN(quantity) || quantity <= 0) {
          return {
            lineNum: idx + 1,
            raw: trimmed,
            serviceId: serviceIdStr,
            quantity: 0,
            link,
            service,
            error: "Invalid quantity",
            total: 0,
          };
        }

        const minQty = service.min_quantity || 1;
        const maxQty = service.max_quantity || 1000000;
        if (quantity < minQty) {
          return {
            lineNum: idx + 1,
            raw: trimmed,
            serviceId: serviceIdStr,
            quantity,
            link,
            service,
            error: `Min quantity: ${minQty}`,
            total: 0,
          };
        }
        if (quantity > maxQty) {
          return {
            lineNum: idx + 1,
            raw: trimmed,
            serviceId: serviceIdStr,
            quantity,
            link,
            service,
            error: `Max quantity: ${maxQty}`,
            total: 0,
          };
        }

        if (!link || (!link.startsWith("http://") && !link.startsWith("https://"))) {
          return {
            lineNum: idx + 1,
            raw: trimmed,
            serviceId: serviceIdStr,
            quantity,
            link,
            service,
            error: "Invalid URL (must start with http:// or https://)",
            total: 0,
          };
        }

        const price = getEffectivePrice(service);
        const total = (price * quantity) / 1000;

        return {
          lineNum: idx + 1,
          raw: trimmed,
          serviceId: serviceIdStr,
          quantity,
          link,
          service,
          error: null,
          total,
        };
      })
      .filter(Boolean) as ParsedLine[];
  }, [input, serviceByDisplayOrder, getEffectivePrice]);

  const validLines = parsed.filter((p) => !p.error);
  const errorLines = parsed.filter((p) => p.error);
  const grandTotal = validLines.reduce((sum, p) => sum + p.total, 0);

  const handleSubmit = async () => {
    if (validLines.length === 0) return;
    setAdding(true);
    try {
      const items = validLines.map((p) => ({
        service: p.service,
        quantity: p.quantity,
        targetUrl: p.link,
        effectivePrice: getEffectivePrice(p.service),
      }));
      await onAddToCart(items);
      setInput("");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Package className="w-4 h-4 text-primary" />
        <span className="font-semibold text-sm">Mass Order</span>
      </div>

      {/* Format guide */}
      <div className="rounded-lg border border-border/60 bg-muted/30 p-3 space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
          <Info className="w-3.5 h-3.5 text-primary" />
          Format: <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[11px] font-mono">service_id|quantity|link</code>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          One order per line. Service ID is the number shown next to each service (e.g., #113).
        </p>
        <div className="text-[11px] text-muted-foreground font-mono bg-background/80 rounded p-2 border border-border/40 space-y-0.5">
          <div>113|1000|https://instagram.com/example</div>
          <div>205|5000|https://youtube.com/watch?v=xxx</div>
          <div>89|2000|https://tiktok.com/@user/video/123</div>
        </div>
      </div>

      {/* Textarea */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Enter your orders below</Label>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={"113|1000|https://instagram.com/example\n205|5000|https://youtube.com/watch?v=xxx"}
          className="min-h-[140px] font-mono text-sm resize-y"
          disabled={disabled || adding}
        />
      </div>

      {/* Validation Results */}
      {parsed.length > 0 && (
        <div className="space-y-2">
          {/* Valid orders */}
          {validLines.length > 0 && (
            <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400">
                <CheckCircle className="w-3.5 h-3.5" />
                {validLines.length} valid order{validLines.length !== 1 ? "s" : ""}
              </div>
              <div className="space-y-1 max-h-[120px] overflow-y-auto">
                {validLines.map((p) => (
                  <div key={p.lineNum} className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground font-mono truncate max-w-[60%]">
                      <Badge variant="outline" className="text-[9px] px-1 py-0 mr-1.5 h-4">
                        #{p.serviceId}
                      </Badge>
                      {p.service?.name?.slice(0, 40)}
                    </span>
                    <span className="flex items-center gap-2 text-foreground/80">
                      <span>{p.quantity.toLocaleString()}</span>
                      <span className="font-medium">{formatPrice(p.total)}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Errors */}
          {errorLines.length > 0 && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-destructive">
                <AlertTriangle className="w-3.5 h-3.5" />
                {errorLines.length} error{errorLines.length !== 1 ? "s" : ""}
              </div>
              <div className="space-y-1 max-h-[80px] overflow-y-auto">
                {errorLines.map((p) => (
                  <div key={p.lineNum} className="text-[11px] text-destructive/80">
                    Line {p.lineNum}: {p.error}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Summary & Submit */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <div className="text-sm text-muted-foreground">
          {parsed.length > 0
            ? `${validLines.length} of ${parsed.length} lines ready`
            : "Enter orders above"}
        </div>
        <div className="flex items-center gap-3">
          {grandTotal > 0 && (
            <span className="font-bold text-sm">{formatPrice(grandTotal)}</span>
          )}
          <Button
            onClick={handleSubmit}
            disabled={disabled || adding || validLines.length === 0}
            size="sm"
            className="gap-1.5"
          >
            {adding ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
            Add {validLines.length} Order{validLines.length !== 1 ? "s" : ""} to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};
