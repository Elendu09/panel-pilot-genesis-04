import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Edit, Trash2, Power, Eye, MoreVertical, Image, Copy, DollarSign, Tag, FileText, Palette, Ban, CheckCircle, ArrowUpDown } from "lucide-react";
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
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { getIconByKey } from "@/components/icons/SocialIcons";

// Helper to render service icon (handles icon: prefix)
const ServiceIcon = ({ imageUrl, category, size = "small" }: { imageUrl?: string; category: string; size?: "small" | "medium" }) => {
  const sizeClasses = size === "small" ? "w-5 h-5" : "w-8 h-8";
  const iconSize = size === "small" ? 14 : 20;
  
  // Check if it's an icon reference
  if (imageUrl?.startsWith('icon:')) {
    const iconKey = imageUrl.replace('icon:', '');
    const iconData = getIconByKey(iconKey);
    const IconComponent = iconData.icon;
    return (
      <div className={cn(sizeClasses, "rounded flex items-center justify-center", iconData.bgColor)}>
        <IconComponent className="text-white" size={iconSize} />
      </div>
    );
  }
  
  // It's a URL - try to load the image
  if (imageUrl && !imageUrl.startsWith('icon:')) {
    return (
      <img 
        src={imageUrl} 
        alt="" 
        className={cn(sizeClasses, "rounded object-cover")}
        onError={(e) => {
          // On error, hide the image and show fallback
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }
  
  // Fallback to category icon
  const categoryData = getIconByKey(category);
  const CategoryIcon = categoryData.icon;
  return (
    <div className={cn(sizeClasses, "rounded flex items-center justify-center", categoryData.bgColor)}>
      <CategoryIcon className="text-white" size={iconSize} />
    </div>
  );
};

export interface ServiceItem {
  id: string;
  displayId: number;
  providerServiceId?: string; // The actual service ID from the provider API
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
  description?: string;
  serviceType?: string;
  dripfeedAvailable?: boolean;
}

interface DraggableServiceItemProps {
  service: ServiceItem;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onEdit: (service: ServiceItem) => void;
  onDelete: (id: string) => void;
  onView: (service: ServiceItem) => void;
  onDuplicate?: (service: ServiceItem) => void;
  onBulkEnable?: () => void;
  onBulkDisable?: () => void;
  onChangeCategory?: (service: ServiceItem) => void;
  onChangeIcon?: (service: ServiceItem) => void;
  getCategoryIcon: (category: string) => React.ComponentType<{ className?: string }>;
  isMobile?: boolean;
  showDragHandle?: boolean;
}

export const DraggableServiceItem = ({
  service,
  isSelected,
  onToggleSelect,
  onToggleStatus,
  onEdit,
  onDelete,
  onView,
  onDuplicate,
  onBulkEnable,
  onBulkDisable,
  onChangeCategory,
  onChangeIcon,
  getCategoryIcon,
  isMobile = false,
  showDragHandle = true,
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
          "glass-card p-3 sm:p-4 rounded-xl transition-all",
          isSelected && "ring-2 ring-primary",
          isDragging && "shadow-2xl z-50"
        )}
      >
        {/* Header with drag handle and checkbox */}
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <button
            {...attributes}
            {...listeners}
            className="touch-none p-0.5 sm:p-1 rounded hover:bg-accent cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
          </button>
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect(service.id)}
            className="h-4 w-4"
          />
          <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 font-mono">
            #{service.displayOrder || service.displayId}
          </Badge>
          {service.providerServiceId && (
            <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 font-mono opacity-60">
              P:{service.providerServiceId}
            </Badge>
          )}
          <div className="flex-1" />
          <Switch
            checked={service.status}
            onCheckedChange={() => onToggleStatus(service.id)}
            className="scale-75 sm:scale-100"
          />
        </div>

        {/* Service Info */}
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 shrink-0">
            <ServiceIcon imageUrl={service.imageUrl} category={service.category} size="medium" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-xs sm:text-sm line-clamp-2">{service.name}</h4>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{service.provider}</p>
            <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
              <Badge variant="secondary" className="text-[10px] sm:text-xs capitalize px-1.5">
                {service.category}
              </Badge>
              <span className="text-[10px] sm:text-xs text-muted-foreground">
                {service.minQty.toLocaleString()} - {service.maxQty.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Pricing & Stats */}
        <div className="flex items-center justify-between mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-border/50">
          <div className="flex flex-col sm:flex-row sm:items-baseline">
            <span className="text-sm sm:text-lg font-bold text-primary">${service.price.toFixed(4)}</span>
            <span className="text-[10px] sm:text-xs text-muted-foreground sm:ml-1">/ 1k</span>
            <Badge variant="outline" className={cn(
              "mt-0.5 sm:mt-0 sm:ml-2 text-[10px] sm:text-xs w-fit px-1",
              Number(profitMargin) >= 25 ? "text-emerald-500" : Number(profitMargin) >= 10 ? "text-amber-500" : "text-red-500"
            )}>
              +{profitMargin}%
            </Badge>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1">
            <Button size="icon" variant="ghost" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => onView(service)}>
              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => onEdit(service)}>
              <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7 sm:h-8 sm:w-8 text-destructive" onClick={() => onDelete(service.id)}>
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
            onCheckedChange={() => onToggleSelect(service.id)}
          />
        </div>
      </td>

      {/* ID - Shows panel service ID and provider ID */}
      <td className="py-3 px-2">
        <div className="flex flex-col gap-0.5">
          <Badge variant="outline" className="text-xs font-mono bg-primary/5 w-fit">
            #{service.displayOrder || service.displayId}
          </Badge>
          {service.providerServiceId && (
            <span className="text-[10px] text-muted-foreground font-mono">
              Provider: {service.providerServiceId}
            </span>
          )}
        </div>
      </td>

      {/* Service */}
      <td className="py-3 px-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 shrink-0">
            <ServiceIcon imageUrl={service.imageUrl} category={service.category} size="small" />
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
          <span className="font-semibold text-primary">${service.price.toFixed(4)}</span>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground line-through">${service.originalPrice.toFixed(4)}</span>
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
          <DropdownMenuContent align="end" className="w-56 bg-popover border border-border shadow-lg z-50">
            <DropdownMenuLabel className="text-xs text-muted-foreground">Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(service)}>
              <Edit className="w-4 h-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onView(service)}>
              <Eye className="w-4 h-4 mr-2" /> View Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">Bulk Operations</DropdownMenuLabel>
            {onBulkDisable && (
              <DropdownMenuItem onClick={onBulkDisable}>
                <Ban className="w-4 h-4 mr-2" /> Disable all
              </DropdownMenuItem>
            )}
            {onBulkEnable && (
              <DropdownMenuItem onClick={onBulkEnable}>
                <CheckCircle className="w-4 h-4 mr-2" /> Enable all
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">Modify</DropdownMenuLabel>
            {onChangeCategory && (
              <DropdownMenuItem onClick={() => onChangeCategory(service)}>
                <Tag className="w-4 h-4 mr-2" /> Change category
              </DropdownMenuItem>
            )}
            {onChangeIcon && (
              <DropdownMenuItem onClick={() => onChangeIcon(service)}>
                <Palette className="w-4 h-4 mr-2" /> Change icon
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onEdit(service)}>
              <FileText className="w-4 h-4 mr-2" /> Change name & description
            </DropdownMenuItem>
            {onDuplicate && (
              <DropdownMenuItem onClick={() => onDuplicate(service)}>
                <Copy className="w-4 h-4 mr-2" /> Duplicate
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onEdit(service)}>
              <DollarSign className="w-4 h-4 mr-2" /> Change price
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(service.id)} className="text-destructive focus:text-destructive">
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </motion.tr>
  );
};

export default DraggableServiceItem;