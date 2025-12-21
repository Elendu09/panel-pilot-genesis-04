import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Edit, Trash2, Power, Eye, MoreVertical, Image } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface ServiceItem {
  id: string;
  displayId: number;
  name: string;
  category: string;
  provider: string;
  minQty: number;
  maxQty: number;
  price: number;
  originalPrice: number;
  status: boolean;
  orders: number;
  providerId: string;
  imageUrl?: string;
  displayOrder: number;
}

interface DraggableServiceItemProps {
  service: ServiceItem;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onEdit: (service: ServiceItem) => void;
  onDelete: (id: string) => void;
  onView: (service: ServiceItem) => void;
  getCategoryIcon: (category: string) => React.ComponentType<{ className?: string }>;
  isMobile?: boolean;
}

export const DraggableServiceItem = ({
  service,
  isSelected,
  onToggleSelect,
  onToggleStatus,
  onEdit,
  onDelete,
  onView,
  getCategoryIcon,
  isMobile = false,
}: DraggableServiceItemProps) => {
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

  const CategoryIcon = getCategoryIcon(service.category);
  const profitMargin = ((service.price - service.originalPrice) / service.originalPrice * 100).toFixed(0);

  if (isMobile) {
    return (
      <motion.div
        ref={setNodeRef}
        style={style}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "glass-card p-4 rounded-xl transition-all",
          isSelected && "ring-2 ring-primary",
          isDragging && "shadow-2xl z-50"
        )}
      >
        {/* Header with drag handle and checkbox */}
        <div className="flex items-center gap-3 mb-3">
          <button
            {...attributes}
            {...listeners}
            className="touch-none p-1 rounded hover:bg-accent cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </button>
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect(service.id)}
          />
          <Badge variant="outline" className="text-xs">
            #{service.displayId}
          </Badge>
          <div className="flex-1" />
          <Switch
            checked={service.status}
            onCheckedChange={() => onToggleStatus(service.id)}
          />
        </div>

        {/* Service Info */}
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            {service.imageUrl ? (
              <img src={service.imageUrl} alt="" className="w-8 h-8 rounded object-cover" />
            ) : (
              <CategoryIcon className="w-5 h-5 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">{service.name}</h4>
            <p className="text-xs text-muted-foreground">{service.provider}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs capitalize">
                {service.category}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {service.minQty.toLocaleString()} - {service.maxQty.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Pricing & Stats */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
          <div>
            <span className="text-lg font-bold text-primary">${service.price.toFixed(2)}</span>
            <span className="text-xs text-muted-foreground ml-1">/ 1k</span>
            <Badge variant="outline" className={cn(
              "ml-2 text-xs",
              Number(profitMargin) >= 25 ? "text-emerald-500" : Number(profitMargin) >= 10 ? "text-amber-500" : "text-red-500"
            )}>
              +{profitMargin}%
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" onClick={() => onView(service)}>
              <Eye className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => onEdit(service)}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" className="text-destructive" onClick={() => onDelete(service.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Desktop View
  return (
    <motion.tr
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "border-b border-border/30 hover:bg-accent/30 transition-colors",
        isSelected && "bg-primary/5",
        isDragging && "shadow-lg z-50 bg-card"
      )}
    >
      {/* Drag Handle & Selection */}
      <td className="py-3 px-2">
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="touch-none p-1 rounded hover:bg-accent cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </button>
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect(service.id)}
          />
        </div>
      </td>

      {/* ID */}
      <td className="py-3 px-2">
        <Badge variant="outline" className="text-xs font-mono">
          #{service.displayId}
        </Badge>
      </td>

      {/* Service */}
      <td className="py-3 px-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 shrink-0">
            {service.imageUrl ? (
              <img src={service.imageUrl} alt="" className="w-5 h-5 rounded object-cover" />
            ) : (
              <CategoryIcon className="w-4 h-4 text-primary" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate max-w-[200px]">{service.name}</p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs capitalize">
                {service.category}
              </Badge>
              <span className="text-xs text-muted-foreground">{service.provider}</span>
            </div>
          </div>
        </div>
      </td>

      {/* Quantity Range */}
      <td className="py-3 px-2 text-center">
        <span className="text-xs text-muted-foreground">
          {service.minQty.toLocaleString()} - {service.maxQty.toLocaleString()}
        </span>
      </td>

      {/* Price */}
      <td className="py-3 px-2">
        <div className="flex flex-col items-end">
          <span className="font-semibold text-primary">${service.price.toFixed(2)}</span>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground line-through">${service.originalPrice.toFixed(2)}</span>
            <Badge variant="outline" className={cn(
              "text-xs",
              Number(profitMargin) >= 25 ? "text-emerald-500 border-emerald-500/30" : 
              Number(profitMargin) >= 10 ? "text-amber-500 border-amber-500/30" : 
              "text-red-500 border-red-500/30"
            )}>
              +{profitMargin}%
            </Badge>
          </div>
        </div>
      </td>

      {/* Orders */}
      <td className="py-3 px-2 text-center">
        <span className="text-sm font-medium">{service.orders.toLocaleString()}</span>
      </td>

      {/* Status */}
      <td className="py-3 px-2 text-center">
        <Switch
          checked={service.status}
          onCheckedChange={() => onToggleStatus(service.id)}
        />
      </td>

      {/* Actions */}
      <td className="py-3 px-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass-card">
            <DropdownMenuItem onClick={() => onView(service)}>
              <Eye className="w-4 h-4 mr-2" /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(service)}>
              <Edit className="w-4 h-4 mr-2" /> Edit Service
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(service.id)} className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </motion.tr>
  );
};

export default DraggableServiceItem;