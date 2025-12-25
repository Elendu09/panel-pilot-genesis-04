import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Filter, 
  X, 
  Save, 
  Trash2, 
  RotateCcw,
  Image,
  Power,
  DollarSign,
  Hash,
  Building2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

export interface ServiceFilters {
  provider?: string;
  status?: "all" | "active" | "inactive";
  priceMin?: number;
  priceMax?: number;
  qtyMin?: number;
  qtyMax?: number;
  hasIcon?: "all" | "with" | "without";
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: ServiceFilters;
}

interface AdvancedFiltersSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: ServiceFilters;
  onFiltersChange: (filters: ServiceFilters) => void;
  providers: Array<{ id: string; name: string }>;
  onApply: () => void;
}

const STORAGE_KEY = "service-filter-presets";

// Default filter state
const DEFAULT_FILTERS: ServiceFilters = {
  provider: undefined,
  status: "all",
  priceMin: undefined,
  priceMax: undefined,
  qtyMin: undefined,
  qtyMax: undefined,
  hasIcon: "all",
};

export function AdvancedFiltersSheet({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  providers,
  onApply,
}: AdvancedFiltersSheetProps) {
  const [localFilters, setLocalFilters] = useState<ServiceFilters>(filters);
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [newPresetName, setNewPresetName] = useState("");
  const [showSavePreset, setShowSavePreset] = useState(false);

  // Load presets from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setPresets(JSON.parse(saved));
      } catch {
        setPresets([]);
      }
    }
  }, []);

  // Sync local filters with prop
  useEffect(() => {
    if (open) {
      setLocalFilters(filters);
    }
  }, [open, filters]);

  const savePresets = (newPresets: FilterPreset[]) => {
    setPresets(newPresets);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPresets));
  };

  const handleSavePreset = () => {
    if (!newPresetName.trim()) {
      toast({ title: "Please enter a preset name", variant: "destructive" });
      return;
    }

    const newPreset: FilterPreset = {
      id: Date.now().toString(),
      name: newPresetName,
      filters: { ...localFilters },
    };

    savePresets([...presets, newPreset]);
    setNewPresetName("");
    setShowSavePreset(false);
    toast({ title: "Filter preset saved" });
  };

  const handleLoadPreset = (preset: FilterPreset) => {
    setLocalFilters(preset.filters);
    toast({ title: `Loaded preset: ${preset.name}` });
  };

  const handleDeletePreset = (id: string) => {
    savePresets(presets.filter(p => p.id !== id));
    toast({ title: "Preset deleted" });
  };

  const handleReset = () => {
    setLocalFilters(DEFAULT_FILTERS);
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    onApply();
    onOpenChange(false);
  };

  const activeFilterCount = Object.entries(localFilters).filter(
    ([key, value]) => {
      if (key === "status" && value === "all") return false;
      if (key === "hasIcon" && value === "all") return false;
      return value !== undefined && value !== "";
    }
  ).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            Advanced Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary">{activeFilterCount} active</Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            Filter services by provider, status, price, quantity, and more.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 py-4">
            {/* Provider Filter */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                Provider
              </Label>
              <Select
                value={localFilters.provider || "all"}
                onValueChange={(v) => 
                  setLocalFilters(prev => ({ ...prev, provider: v === "all" ? undefined : v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Providers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  <SelectItem value="direct">Direct (No Provider)</SelectItem>
                  {providers.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Power className="w-4 h-4 text-muted-foreground" />
                Status
              </Label>
              <div className="flex gap-2">
                {(["all", "active", "inactive"] as const).map((status) => (
                  <Button
                    key={status}
                    variant={localFilters.status === status ? "default" : "outline"}
                    size="sm"
                    className="flex-1 capitalize"
                    onClick={() => setLocalFilters(prev => ({ ...prev, status }))}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                Price Range (per 1K)
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Min</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    value={localFilters.priceMin ?? ""}
                    onChange={(e) => 
                      setLocalFilters(prev => ({ 
                        ...prev, 
                        priceMin: e.target.value ? parseFloat(e.target.value) : undefined 
                      }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Max</Label>
                  <Input
                    type="number"
                    placeholder="100.00"
                    step="0.01"
                    value={localFilters.priceMax ?? ""}
                    onChange={(e) => 
                      setLocalFilters(prev => ({ 
                        ...prev, 
                        priceMax: e.target.value ? parseFloat(e.target.value) : undefined 
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Quantity Range */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-muted-foreground" />
                Quantity Range
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Min Qty</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={localFilters.qtyMin ?? ""}
                    onChange={(e) => 
                      setLocalFilters(prev => ({ 
                        ...prev, 
                        qtyMin: e.target.value ? parseInt(e.target.value) : undefined 
                      }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Max Qty</Label>
                  <Input
                    type="number"
                    placeholder="100000"
                    value={localFilters.qtyMax ?? ""}
                    onChange={(e) => 
                      setLocalFilters(prev => ({ 
                        ...prev, 
                        qtyMax: e.target.value ? parseInt(e.target.value) : undefined 
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Icon Filter */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Image className="w-4 h-4 text-muted-foreground" />
                Icon Status
              </Label>
              <div className="flex gap-2">
                {([
                  { value: "all", label: "All" },
                  { value: "with", label: "Has Icon" },
                  { value: "without", label: "No Icon" },
                ] as const).map((option) => (
                  <Button
                    key={option.value}
                    variant={localFilters.hasIcon === option.value ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => setLocalFilters(prev => ({ ...prev, hasIcon: option.value }))}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Saved Presets */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center justify-between">
                <Label>Saved Presets</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSavePreset(!showSavePreset)}
                >
                  <Save className="w-4 h-4 mr-1" />
                  Save Current
                </Button>
              </div>

              {showSavePreset && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Preset name..."
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSavePreset()}
                  />
                  <Button size="sm" onClick={handleSavePreset}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowSavePreset(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {presets.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No saved presets yet
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {presets.map((preset) => (
                    <Card key={preset.id} className="group">
                      <CardContent className="p-3 flex items-center justify-between">
                        <button
                          className="flex-1 text-left text-sm font-medium hover:text-primary transition-colors"
                          onClick={() => handleLoadPreset(preset)}
                        >
                          {preset.name}
                        </button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                          onClick={() => handleDeletePreset(preset.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <SheetFooter className="pt-4 border-t flex-row gap-2">
          <Button variant="outline" onClick={handleReset} className="flex-1">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleApply} className="flex-1">
            <Filter className="w-4 h-4 mr-2" />
            Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// Utility to count active filters for external use
export function countActiveFilters(filters: ServiceFilters): number {
  return Object.entries(filters).filter(([key, value]) => {
    if (key === "status" && value === "all") return false;
    if (key === "hasIcon" && value === "all") return false;
    return value !== undefined && value !== "";
  }).length;
}
