import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search, Upload } from "lucide-react";
import { SOCIAL_ICONS_MAP } from "@/components/icons/SocialIcons";

interface IconPickerWithSearchProps {
  selectedIcon: string;
  onSelectIcon: (iconKey: string) => void;
  className?: string;
  maxHeight?: string;
  onUploadClick?: () => void;
  showUploadButton?: boolean;
}

export function IconPickerWithSearch({
  selectedIcon,
  onSelectIcon,
  className,
  maxHeight = "200px",
  onUploadClick,
  showUploadButton = true,
}: IconPickerWithSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredIcons = useMemo(() => {
    if (!searchQuery.trim()) {
      return Object.entries(SOCIAL_ICONS_MAP);
    }
    
    const query = searchQuery.toLowerCase();
    return Object.entries(SOCIAL_ICONS_MAP).filter(([key, { label }]) => 
      key.toLowerCase().includes(query) || 
      label.toLowerCase().includes(query)
    );
  }, [searchQuery]);
  
  return (
    <div className={cn("space-y-2", className)}>
      {/* Search Input with Upload Button */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search icons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        {showUploadButton && onUploadClick && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 px-3 shrink-0"
            onClick={onUploadClick}
          >
            <Upload className="w-4 h-4 mr-1.5" />
            Upload
          </Button>
        )}
      </div>
      
      {/* Icons Grid */}
      <ScrollArea 
        className="border rounded-lg bg-muted/30" 
        style={{ maxHeight }}
      >
        {filteredIcons.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            No icons found matching "{searchQuery}"
          </div>
        ) : (
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 p-3">
            {filteredIcons.map(([key, { icon: IconComponent, label, bgColor }]) => {
              const isSelected = selectedIcon === `icon:${key}`;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onSelectIcon(`icon:${key}`)}
                  className={cn(
                    "p-1.5 rounded-lg transition-all hover:scale-105 flex flex-col items-center gap-1",
                    isSelected
                      ? "ring-2 ring-primary bg-primary/10"
                      : "hover:bg-muted/50"
                  )}
                  title={label}
                >
                  <div
                    className={cn(
                      "w-7 h-7 rounded-md flex items-center justify-center",
                      bgColor
                    )}
                  >
                    <IconComponent className="text-white" size={14} />
                  </div>
                  <span className="text-[9px] text-muted-foreground truncate w-full text-center leading-tight">
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>
      
      {/* Result count */}
      {searchQuery && (
        <p className="text-xs text-muted-foreground text-center">
          {filteredIcons.length} icon{filteredIcons.length !== 1 ? 's' : ''} found
        </p>
      )}
    </div>
  );
}
