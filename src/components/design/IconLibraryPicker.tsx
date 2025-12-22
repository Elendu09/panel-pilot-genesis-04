import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Check } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

// Popular icons for features
const popularIcons = [
  "Zap", "Shield", "Clock", "TrendingUp", "Star", "Heart", 
  "CheckCircle", "Award", "Gift", "Rocket", "Target", "Users",
  "Lock", "Eye", "Headphones", "MessageCircle", "ThumbsUp", "Crown",
  "Flame", "Sparkles", "Bolt", "Globe", "Phone", "Mail",
  "CreditCard", "DollarSign", "ShoppingCart", "Package", "Truck", "Calendar"
];

interface IconLibraryPickerProps {
  selectedIcon?: string;
  onSelect: (iconName: string) => void;
}

export const IconLibraryPicker = ({ selectedIcon, onSelect }: IconLibraryPickerProps) => {
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  // Get all icon names
  const allIconNames = Object.keys(LucideIcons).filter(
    key => key !== 'default' && 
           key !== 'createLucideIcon' && 
           !key.includes('Icon') &&
           typeof (LucideIcons as any)[key] === 'function'
  );

  // Filter icons based on search
  const filteredIcons = showAll 
    ? allIconNames.filter(name => name.toLowerCase().includes(search.toLowerCase()))
    : popularIcons.filter(name => name.toLowerCase().includes(search.toLowerCase()));

  const renderIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    if (!IconComponent) return null;
    return <IconComponent className="w-5 h-5" />;
  };

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Icon Library</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowAll(!showAll)}
            className="text-xs"
          >
            {showAll ? "Show Popular" : "Show All"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search icons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <ScrollArea className="h-[200px]">
          <div className="grid grid-cols-6 gap-2">
            {filteredIcons.slice(0, 60).map((iconName) => (
              <Button
                key={iconName}
                variant="ghost"
                size="sm"
                className={cn(
                  "h-10 w-full p-0 relative hover:bg-primary/10",
                  selectedIcon === iconName && "bg-primary/20 ring-2 ring-primary"
                )}
                onClick={() => onSelect(iconName)}
                title={iconName}
              >
                {renderIcon(iconName)}
                {selectedIcon === iconName && (
                  <Check className="w-3 h-3 absolute top-0.5 right-0.5 text-primary" />
                )}
              </Button>
            ))}
          </div>
        </ScrollArea>
        
        {selectedIcon && (
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">Selected:</span>
            <div className="flex items-center gap-2 px-2 py-1 bg-primary/10 rounded text-primary">
              {renderIcon(selectedIcon)}
              <span className="text-xs font-medium">{selectedIcon}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IconLibraryPicker;
