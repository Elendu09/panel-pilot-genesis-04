import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, Eye, GripVertical, MoreVertical, Trash2, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { getIconByKey } from "@/components/icons/SocialIcons";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ServiceItem } from "./DraggableServiceItem";

interface ServiceKanbanCardProps {
  service: ServiceItem;
  providerName?: string;
  isSelected: boolean;
  onToggleSelect: () => void;
  onToggleStatus: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
  onDuplicate?: () => void;
  showDragHandle?: boolean;
}

const ServiceIcon = ({ imageUrl, category }: { imageUrl?: string; category: string }) => {
  if (imageUrl?.startsWith('icon:')) {
    const iconKey = imageUrl.replace('icon:', '');
    const iconData = getIconByKey(iconKey);
    const IconComponent = iconData.icon;
    return (
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", iconData.bgColor)}>
        <IconComponent className="text-white" size={20} />
      </div>
    );
  }

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        className="w-10 h-10 rounded-xl object-cover"
        onError={(e) => (e.currentTarget.style.display = "none")}
      />
    );
  }

  const categoryData = getIconByKey(category);
  const CategoryIcon = categoryData.icon;
  return (
    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", categoryData.bgColor)}>
      <CategoryIcon className="text-white" size={20} />
    </div>
  );
};

export const ServiceKanbanCard = ({
  service,
  providerName,
  isSelected,
  onToggleSelect,
  onToggleStatus,
  onEdit,
  onDelete,
  onView,
  onDuplicate,
  showDragHandle = true,
}: ServiceKanbanCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: service.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const profitMargin = ((service.price - service.originalPrice) / service.originalPrice * 100).toFixed(0);

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-full"
    >
      <Card
        className={cn(
          "h-full glass-card-hover transition-all cursor-pointer",
          isSelected && "ring-2 ring-primary bg-primary/5",
          isDragging && "shadow-2xl z-50"
        )}
      >
        <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-1 sm:gap-2">
            <div className="flex items-center gap-1 sm:gap-2">
              {showDragHandle && (
                <button
                  {...attributes}
                  {...listeners}
                  className="touch-none p-0.5 sm:p-1 rounded hover:bg-accent cursor-grab active:cursor-grabbing"
                >
                  <GripVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                </button>
              )}
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onToggleSelect()}
                className="h-4 w-4"
              />
              <Badge variant="outline" className="text-[10px] sm:text-xs font-mono px-1.5 sm:px-2">
                #{service.displayId}
              </Badge>
            </div>
            <Switch
              checked={service.status}
              onCheckedChange={() => onToggleStatus()}
              className="scale-75 sm:scale-90"
            />
          </div>

          {/* Service Info */}
          <div className="flex items-start gap-2 sm:gap-3" onClick={() => onView()}>
            <div className="shrink-0">
              <ServiceIcon imageUrl={service.imageUrl} category={service.category} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-xs sm:text-sm line-clamp-2 hover:text-primary transition-colors">
                {service.name}
              </h4>
              <div className="flex items-center gap-1 sm:gap-2 mt-1">
                <Badge variant="secondary" className="text-[10px] sm:text-xs capitalize px-1.5 sm:px-2">
                  {service.category}
                </Badge>
              </div>
            </div>
          </div>

          {/* Provider */}
          <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
            <span>Provider:</span>
            <span className="font-medium text-foreground truncate">
              {providerName || (service.provider === 'Direct' ? 'Direct' : 'Unknown')}
            </span>
          </div>

          {/* Quantity Range */}
          <div className="flex items-center justify-between text-[10px] sm:text-xs">
            <span className="text-muted-foreground">Qty:</span>
            <span>
              {service.minQty.toLocaleString()} - {service.maxQty.toLocaleString()}
            </span>
          </div>

          {/* Pricing */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50 overflow-hidden gap-2">
            <div className="flex flex-col sm:flex-row sm:items-baseline flex-shrink-0 min-w-0">
              <span className="text-sm sm:text-lg font-bold text-primary">${service.price.toFixed(4)}</span>
              <span className="text-[10px] sm:text-xs text-muted-foreground sm:ml-1">/ 1k</span>
            </div>
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-0.5 sm:gap-1 flex-shrink-0">
              <span className="text-[10px] sm:text-xs text-muted-foreground line-through whitespace-nowrap">
                ${service.originalPrice.toFixed(4)}
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] sm:text-xs px-1 sm:px-1.5 whitespace-nowrap flex-shrink-0",
                  Number(profitMargin) >= 25
                    ? "text-emerald-500 border-emerald-500/30"
                    : Number(profitMargin) >= 10
                    ? "text-amber-500 border-amber-500/30"
                    : "text-red-500 border-red-500/30"
                )}
              >
                +{profitMargin}%
              </Badge>
            </div>
          </div>

          {/* Actions - Stack on very small screens */}
          <div className="flex items-center gap-0.5 sm:gap-1 pt-2">
            <Button
              size="sm"
              variant="ghost"
              className="flex-1 h-7 sm:h-8 text-[10px] sm:text-xs px-1 sm:px-2"
              onClick={() => onView()}
            >
              <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 sm:mr-1" />
              <span className="hidden xs:inline">View</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="flex-1 h-7 sm:h-8 text-[10px] sm:text-xs px-1 sm:px-2"
              onClick={() => onEdit()}
            >
              <Edit className="w-3 h-3 sm:w-3.5 sm:h-3.5 sm:mr-1" />
              <span className="hidden xs:inline">Edit</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="h-7 sm:h-8 w-7 sm:w-8 p-0">
                  <MoreVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onDuplicate && (
                  <DropdownMenuItem onClick={() => onDuplicate()}>
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete()}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ServiceKanbanCard;
