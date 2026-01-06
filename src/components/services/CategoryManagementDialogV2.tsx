import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Settings2, 
  RotateCcw,
  Loader2,
  Layers,
  RefreshCw,
  Database 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { IconPickerWithSearch } from "./IconPickerWithSearch";
import { SOCIAL_ICONS_MAP } from "@/components/icons/SocialIcons";
import { useCategoryOrder, type ServiceCategory } from "@/hooks/useUnifiedServices";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface CategoryManagementDialogV2Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  panelId: string;
  onCategoriesChange?: (categories: ServiceCategory[]) => void;
}

// Sortable category item component
function SortableCategoryItem({ 
  category, 
  onRemove,
  onToggle,
}: { 
  category: ServiceCategory; 
  onRemove: () => void;
  onToggle: (active: boolean) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const iconData = SOCIAL_ICONS_MAP[category.iconKey];
  const IconComponent = iconData?.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border bg-card transition-all",
        isDragging ? "opacity-50 shadow-lg z-50" : "hover:bg-accent/50",
        !category.isActive && "opacity-60"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded touch-none"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </button>
      
      <div 
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
          iconData?.bgColor || "bg-muted"
        )}
      >
        {IconComponent ? (
          <IconComponent className="text-white" size={16} />
        ) : (
          <Layers className="text-white" size={16} />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{category.name}</p>
        <p className="text-xs text-muted-foreground truncate">
          {category.serviceCount} services • {category.slug}
        </p>
      </div>
      
      <Badge variant="secondary" className="text-xs shrink-0">
        {category.serviceCount}
      </Badge>
      
      <div className="flex items-center gap-2 shrink-0">
        <Switch 
          checked={category.isActive}
          onCheckedChange={onToggle}
          aria-label="Toggle category"
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export function CategoryManagementDialogV2({
  open,
  onOpenChange,
  panelId,
  onCategoriesChange,
}: CategoryManagementDialogV2Props) {
  const { 
    categories, 
    loading, 
    saving, 
    refetch, 
    saveOrder, 
    addCategory, 
    removeCategory,
    toggleCategory 
  } = useCategoryOrder(panelId);
  
  const [localCategories, setLocalCategories] = useState<ServiceCategory[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", iconKey: "other" });
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Sync local state with database categories
  useEffect(() => {
    if (open && categories.length > 0) {
      setLocalCategories(categories);
      setHasChanges(false);
    }
  }, [open, categories]);

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = localCategories.findIndex((c) => c.id === active.id);
      const newIndex = localCategories.findIndex((c) => c.id === over.id);
      const newOrder = arrayMove(localCategories, oldIndex, newIndex).map((c, i) => ({
        ...c,
        position: i,
      }));
      setLocalCategories(newOrder);
      setHasChanges(true);
    }
  };

  // Add new category
  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      toast({ title: "Please enter a category name", variant: "destructive" });
      return;
    }

    try {
      await addCategory(newCategory.name, newCategory.iconKey.replace("icon:", ""));
      setNewCategory({ name: "", iconKey: "other" });
      setIsAddingNew(false);
      toast({ title: "Category added" });
    } catch (error) {
      console.error('Error adding category:', error);
      toast({ title: "Failed to add category", variant: "destructive" });
    }
  };

  // Remove category
  const handleRemoveCategory = async (categoryId: string) => {
    try {
      await removeCategory(categoryId);
      setLocalCategories(prev => prev.filter(c => c.id !== categoryId));
      toast({ title: "Category removed" });
    } catch (error) {
      console.error('Error removing category:', error);
      toast({ title: "Failed to remove category", variant: "destructive" });
    }
  };

  // Toggle category active state
  const handleToggleCategory = async (categoryId: string, isActive: boolean) => {
    try {
      await toggleCategory(categoryId, isActive);
      setLocalCategories(prev => prev.map(c => 
        c.id === categoryId ? { ...c, isActive } : c
      ));
    } catch (error) {
      console.error('Error toggling category:', error);
    }
  };

  // Sync categories from services
  const handleSyncFromServices = async () => {
    setIsSyncing(true);
    try {
      const { error } = await supabase.rpc('sync_panel_categories', { p_panel_id: panelId });
      if (error) throw error;
      
      await refetch();
      toast({ title: "Categories synced from services" });
    } catch (error) {
      console.error('Error syncing categories:', error);
      toast({ title: "Failed to sync categories", variant: "destructive" });
    } finally {
      setIsSyncing(false);
    }
  };

  // Save order changes
  const handleSave = async () => {
    try {
      await saveOrder(localCategories);
      onCategoriesChange?.(localCategories);
      setHasChanges(false);
      toast({ title: "Category order saved" });
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving categories:', error);
      toast({ title: "Failed to save categories", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-primary" />
            Manage Categories
          </DialogTitle>
          <DialogDescription>
            Drag to reorder categories. Order is persisted and synced across all pages.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-hidden">
          {/* Actions Bar */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddingNew(true)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Category
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSyncFromServices}
                disabled={isSyncing}
                className="gap-2"
              >
                {isSyncing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Database className="w-4 h-4" />
                )}
                Sync from Services
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={refetch}
              className="gap-2 text-muted-foreground"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>

          {/* Add New Category Form */}
          {isAddingNew && (
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category Name</Label>
                    <Input
                      placeholder="e.g., Gaming Services"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Icon</Label>
                    <IconPickerWithSearch
                      selectedIcon={`icon:${newCategory.iconKey}`}
                      onSelectIcon={(key) => setNewCategory(prev => ({ ...prev, iconKey: key }))}
                      maxHeight="150px"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsAddingNew(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleAddCategory}>
                    Add Category
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center h-[300px]">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : localCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-center">
              <Layers className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">No Categories Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Categories are created automatically when you import services.
              </p>
              <Button onClick={handleSyncFromServices} disabled={isSyncing}>
                {isSyncing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Database className="w-4 h-4 mr-2" />
                )}
                Sync from Services
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[350px] pr-4">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={localCategories.map(c => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {localCategories.map((category) => (
                      <SortableCategoryItem
                        key={category.id}
                        category={category}
                        onRemove={() => handleRemoveCategory(category.id)}
                        onToggle={(active) => handleToggleCategory(category.id, active)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </ScrollArea>
          )}

          {/* Info */}
          <p className="text-xs text-muted-foreground text-center">
            {localCategories.length} categories • Drag to reorder
            {hasChanges && <span className="text-primary ml-2">• Unsaved changes</span>}
          </p>
        </div>

        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !hasChanges}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CategoryManagementDialogV2;
