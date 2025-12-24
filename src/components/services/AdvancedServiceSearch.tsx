import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Search, 
  Filter, 
  X, 
  SlidersHorizontal,
  DollarSign,
  Power
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdvancedSearchFilters {
  search: string;
  provider: string;
  status: "all" | "active" | "inactive";
  priceMin: number;
  priceMax: number;
  category: string;
}

interface AdvancedServiceSearchProps {
  filters: AdvancedSearchFilters;
  onFiltersChange: (filters: AdvancedSearchFilters) => void;
  providers: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string }>;
}

export const AdvancedServiceSearch = ({
  filters,
  onFiltersChange,
  providers,
  categories,
}: AdvancedServiceSearchProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const activeFilterCount = [
    filters.provider !== "all",
    filters.status !== "all",
    filters.priceMin > 0,
    filters.priceMax < 1000,
  ].filter(Boolean).length;

  const clearFilters = () => {
    onFiltersChange({
      search: filters.search,
      provider: "all",
      status: "all",
      priceMin: 0,
      priceMax: 1000,
      category: "all",
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, ID, or description..."
          className="pl-9 bg-card/50"
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
        />
        {filters.search && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            onClick={() => onFiltersChange({ ...filters, search: "" })}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Advanced Filters Popover */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className={cn(
              "gap-2",
              activeFilterCount > 0 && "border-primary/50 bg-primary/5"
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 rounded-full text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Advanced Filters</h4>
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={clearFilters}
                >
                  Clear all
                </Button>
              )}
            </div>

            {/* Provider Filter */}
            <div className="space-y-2">
              <Label className="text-xs">Provider</Label>
              <Select
                value={filters.provider}
                onValueChange={(v) => onFiltersChange({ ...filters, provider: v })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All providers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  <SelectItem value="direct">Direct (No Provider)</SelectItem>
                  {providers.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label className="text-xs">Status</Label>
              <div className="flex gap-2">
                {["all", "active", "inactive"].map((status) => (
                  <Button
                    key={status}
                    variant={filters.status === status ? "default" : "outline"}
                    size="sm"
                    className="flex-1 h-8 text-xs capitalize"
                    onClick={() => onFiltersChange({ ...filters, status: status as any })}
                  >
                    {status === "active" && <Power className="w-3 h-3 mr-1 text-green-500" />}
                    {status === "inactive" && <Power className="w-3 h-3 mr-1 text-red-500" />}
                    {status}
                  </Button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Price Range</Label>
                <span className="text-xs text-muted-foreground">
                  ${filters.priceMin} - ${filters.priceMax}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <Slider
                  value={[filters.priceMin, filters.priceMax]}
                  onValueChange={([min, max]) =>
                    onFiltersChange({ ...filters, priceMin: min, priceMax: max })
                  }
                  min={0}
                  max={1000}
                  step={1}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filter Badges */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-1">
          {filters.provider !== "all" && (
            <Badge variant="secondary" className="gap-1 text-xs">
              Provider: {providers.find(p => p.id === filters.provider)?.name || filters.provider}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => onFiltersChange({ ...filters, provider: "all" })}
              />
            </Badge>
          )}
          {filters.status !== "all" && (
            <Badge variant="secondary" className="gap-1 text-xs capitalize">
              {filters.status}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => onFiltersChange({ ...filters, status: "all" })}
              />
            </Badge>
          )}
          {(filters.priceMin > 0 || filters.priceMax < 1000) && (
            <Badge variant="secondary" className="gap-1 text-xs">
              ${filters.priceMin}-${filters.priceMax}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => onFiltersChange({ ...filters, priceMin: 0, priceMax: 1000 })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedServiceSearch;
