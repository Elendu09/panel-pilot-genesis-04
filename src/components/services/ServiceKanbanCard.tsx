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
        <CardContent className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              {showDragHandle && (
                <button
                  {...attributes}
                  {...listeners}
                  className="touch-none p-1 rounded hover:bg-accent cursor-grab active:cursor-grabbing"
                >
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onToggleSelect()}
              />
              <Badge variant="outline" className="text-xs font-mono">
                #{service.displayId}
              </Badge>
            </div>
            <Switch
              checked={service.status}
              onCheckedChange={() => onToggleStatus()}
              className="scale-90"
            />
          </div>

          {/* Service Info */}
          <div className="flex items-start gap-3" onClick={() => onView()}>
            <ServiceIcon imageUrl={service.imageUrl} category={service.category} />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors">
                {service.name}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs capitalize">
                  {service.category}
                </Badge>
              </div>
            </div>
          </div>

          {/* Provider */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Provider:</span>
            <span className="font-medium text-foreground">
              {providerName || (service.provider === 'Direct' ? 'Direct' : 'Unknown')}
            </span>
          </div>

          {/* Quantity Range */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Quantity:</span>
            <span>
              {service.minQty.toLocaleString()} - {service.maxQty.toLocaleString()}
            </span>
          </div>

          {/* Pricing */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div>
              <span className="text-lg font-bold text-primary">${service.price.toFixed(2)}</span>
              <span className="text-xs text-muted-foreground ml-1">/ 1k</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground line-through">
                ${service.originalPrice.toFixed(2)}
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
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

          {/* Actions */}
          <div className="flex items-center gap-1 pt-2">
            <Button
              size="sm"
              variant="ghost"
              className="flex-1 h-8"
              onClick={() => onView()}
            >
              <Eye className="w-3.5 h-3.5 mr-1" />
              View
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="flex-1 h-8"
              onClick={() => onEdit()}
            >
              <Edit className="w-3.5 h-3.5 mr-1" />
              Edit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <MoreVertical className="w-4 h-4" />
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
