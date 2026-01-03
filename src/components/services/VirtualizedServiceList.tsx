import { useCallback, CSSProperties, ReactElement } from 'react';
import { List } from 'react-window';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Eye, Trash2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ServiceItem } from './DraggableServiceItem';
import { SOCIAL_ICONS_MAP } from '@/components/icons/SocialIcons';

interface VirtualizedServiceListProps {
  services: ServiceItem[];
  selectedServices: string[];
  onToggleSelect: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onEdit: (service: ServiceItem) => void;
  onView: (service: ServiceItem) => void;
  onDelete: (id: string) => void;
  getCategoryIcon: (category: string) => React.ComponentType<{ className?: string }>;
  height?: number;
}

const ROW_HEIGHT = 72;

interface RowProps {
  services: ServiceItem[];
  selectedServices: string[];
  onToggleSelect: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onEdit: (service: ServiceItem) => void;
  onView: (service: ServiceItem) => void;
  onDelete: (id: string) => void;
  getCategoryIcon: (category: string) => React.ComponentType<{ className?: string }>;
}

const ServiceRow = ({
  ariaAttributes,
  index,
  style,
  services,
  selectedServices,
  onToggleSelect,
  onToggleStatus,
  onEdit,
  onView,
  onDelete,
  getCategoryIcon,
}: {
  ariaAttributes: { "aria-posinset": number; "aria-setsize": number; role: "listitem" };
  index: number;
  style: CSSProperties;
} & RowProps): ReactElement => {
  const service = services[index];
  if (!service) {
    return <div style={style} {...ariaAttributes} />;
  }

  const isSelected = selectedServices.includes(service.id);
  const CategoryIcon = getCategoryIcon(service.category);
  const profitMargin = ((service.price - service.originalPrice) / service.originalPrice * 100);

  // Check if service has a custom icon
  const iconKey = service.imageUrl?.replace('icon:', '');
  const customIcon = iconKey ? SOCIAL_ICONS_MAP[iconKey] : null;

  return (
    <div 
      style={style}
      {...ariaAttributes}
      className={cn(
        "flex items-center gap-3 px-4 border-b border-border/30 transition-colors",
        isSelected ? "bg-primary/5" : "hover:bg-muted/30"
      )}
    >
      {/* Drag Handle */}
      <GripVertical className="w-4 h-4 text-muted-foreground/50 cursor-grab shrink-0" />

      {/* Checkbox */}
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onToggleSelect(service.id)}
        className="shrink-0"
      />

      {/* Service ID */}
      <span className="text-xs text-muted-foreground w-20 shrink-0 font-mono">
        ID: {service.providerServiceId || service.displayId || index + 1}
      </span>

      {/* Icon & Name */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {customIcon ? (
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", customIcon.bgColor)}>
            <customIcon.icon className="text-white" size={16} />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <CategoryIcon className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{service.name}</p>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] capitalize">
              {service.category}
            </Badge>
            <span className="text-[10px] text-muted-foreground truncate">
              {service.provider || 'Direct'}
            </span>
          </div>
        </div>
      </div>

      {/* Qty Range - Hidden on small screens */}
      <div className="hidden lg:block text-xs text-muted-foreground w-24 shrink-0">
        {service.minQty?.toLocaleString()} - {service.maxQty?.toLocaleString()}
      </div>

      {/* Price */}
      <div className="text-right w-24 shrink-0">
        <p className="text-sm font-medium">${service.price.toFixed(2)}</p>
        <p className={cn(
          "text-[10px]",
          profitMargin > 0 ? "text-emerald-500" : "text-muted-foreground"
        )}>
          {profitMargin > 0 ? `+${profitMargin.toFixed(0)}%` : '-'}
        </p>
      </div>

      {/* Status */}
      <Switch
        checked={service.status}
        onCheckedChange={() => onToggleStatus(service.id)}
        className="shrink-0"
      />

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onView(service)}>
            <Eye className="w-4 h-4 mr-2" />
            View
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEdit(service)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onDelete(service.id)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export const VirtualizedServiceList = ({
  services,
  selectedServices,
  onToggleSelect,
  onToggleStatus,
  onEdit,
  onView,
  onDelete,
  getCategoryIcon,
  height = 600,
}: VirtualizedServiceListProps) => {
  if (services.length === 0) {
    return null;
  }

  const listHeight = Math.min(height, services.length * ROW_HEIGHT);

  return (
    <Card className="glass-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 bg-muted/30 text-xs font-medium text-muted-foreground">
        <div className="w-4" /> {/* Drag handle space */}
        <div className="w-4" /> {/* Checkbox space */}
        <div className="w-12">ID</div>
        <div className="flex-1">Service</div>
        <div className="hidden lg:block w-24">Qty Range</div>
        <div className="w-24 text-right">Price</div>
        <div className="w-10">Status</div>
        <div className="w-8" /> {/* Actions space */}
      </div>

      {/* Virtualized List */}
      <List
        rowComponent={ServiceRow}
        rowCount={services.length}
        rowHeight={ROW_HEIGHT}
        rowProps={{
          services,
          selectedServices,
          onToggleSelect,
          onToggleStatus,
          onEdit,
          onView,
          onDelete,
          getCategoryIcon,
        }}
        style={{ height: listHeight }}
        className="scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
      />
    </Card>
  );
};

export default VirtualizedServiceList;
