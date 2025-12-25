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
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Settings2, 
  RotateCcw,
  Loader2,
  Layers 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { IconPickerWithSearch } from "./IconPickerWithSearch";
import { SOCIAL_ICONS_MAP } from "@/components/icons/SocialIcons";
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

export interface CategoryPreset {
  id: string;
  label: string;
  iconKey: string;
  order: number;
  isDefault?: boolean;
}

interface CategoryManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  panelId: string;
  onCategoriesChange: (categories: CategoryPreset[]) => void;
  currentCategories: CategoryPreset[];
}

// Default categories that match the DB enum
const DEFAULT_CATEGORIES: CategoryPreset[] = [
  { id: "instagram", label: "Instagram", iconKey: "instagram", order: 1, isDefault: true },
  { id: "facebook", label: "Facebook", iconKey: "facebook", order: 2, isDefault: true },
  { id: "twitter", label: "Twitter/X", iconKey: "twitter", order: 3, isDefault: true },
  { id: "youtube", label: "YouTube", iconKey: "youtube", order: 4, isDefault: true },
  { id: "tiktok", label: "TikTok", iconKey: "tiktok", order: 5, isDefault: true },
  { id: "linkedin", label: "LinkedIn", iconKey: "linkedin", order: 6, isDefault: true },
  { id: "telegram", label: "Telegram", iconKey: "telegram", order: 7, isDefault: true },
  { id: "spotify", label: "Spotify", iconKey: "spotify", order: 8, isDefault: true },
  { id: "soundcloud", label: "SoundCloud", iconKey: "soundcloud", order: 9, isDefault: true },
  { id: "audiomack", label: "Audiomack", iconKey: "audiomack", order: 10, isDefault: true },
  { id: "twitch", label: "Twitch", iconKey: "twitch", order: 11, isDefault: true },
  { id: "discord", label: "Discord", iconKey: "discord", order: 12, isDefault: true },
  { id: "pinterest", label: "Pinterest", iconKey: "pinterest", order: 13, isDefault: true },
  { id: "snapchat", label: "Snapchat", iconKey: "snapchat", order: 14, isDefault: true },
  { id: "threads", label: "Threads", iconKey: "threads", order: 15, isDefault: true },
  { id: "other", label: "Other", iconKey: "other", order: 16, isDefault: true },
];

// Sortable category item component
function SortableCategoryItem({ 
  category, 
  onRemove, 
  onEdit 
}: { 
  category: CategoryPreset; 
  onRemove: () => void;
  onEdit: () => void;
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
        isDragging ? "opacity-50 shadow-lg" : "hover:bg-accent/50"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
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
        <p className="font-medium text-sm truncate">{category.label}</p>
        <p className="text-xs text-muted-foreground truncate">ID: {category.id}</p>
      </div>
      
      {category.isDefault && (
        <Badge variant="secondary" className="text-xs shrink-0">Default</Badge>
      )}
      
      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onEdit}
        >
          <Settings2 className="w-4 h-4" />
        </Button>
        {!category.isDefault && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={onRemove}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export function CategoryManagementDialog({
  open,
  onOpenChange,
  panelId,
  onCategoriesChange,
  currentCategories,
}: CategoryManagementDialogProps) {
  const [categories, setCategories] = useState<CategoryPreset[]>(currentCategories);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCategory, setNewCategory] = useState({ label: "", iconKey: "other" });
  const [editingCategory, setEditingCategory] = useState<CategoryPreset | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (open) {
      setCategories(currentCategories.length > 0 ? currentCategories : DEFAULT_CATEGORIES);
    }
  }, [open, currentCategories]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((c) => c.id === active.id);
      const newIndex = categories.findIndex((c) => c.id === over.id);
      const newOrder = arrayMove(categories, oldIndex, newIndex).map((c, i) => ({
        ...c,
        order: i + 1,
      }));
      setCategories(newOrder);
    }
  };

  const handleAddCategory = () => {
    if (!newCategory.label.trim()) {
      toast({ title: "Please enter a category name", variant: "destructive" });
      return;
    }

    const id = newCategory.label.toLowerCase().replace(/[^a-z0-9]/g, "-");
    if (categories.some(c => c.id === id)) {
      toast({ title: "Category ID already exists", variant: "destructive" });
      return;
    }

    const newPreset: CategoryPreset = {
      id,
      label: newCategory.label,
      iconKey: newCategory.iconKey.replace("icon:", ""),
      order: categories.length + 1,
      isDefault: false,
    };

    setCategories([...categories, newPreset]);
    setNewCategory({ label: "", iconKey: "other" });
    setIsAddingNew(false);
    toast({ title: "Category added" });
  };

  const handleRemoveCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  const handleResetToDefaults = () => {
    setCategories(DEFAULT_CATEGORIES);
    toast({ title: "Reset to default categories" });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Convert to JSON-compatible format
      const categoryPresetsJson = categories.map(c => ({
        id: c.id,
        label: c.label,
        iconKey: c.iconKey,
        order: c.order,
        isDefault: c.isDefault || false,
      }));
      
      // Save to panel settings
      const { error } = await supabase
        .from('panels')
        .update({
          settings: {
            category_presets: categoryPresetsJson,
          } as any
        })
        .eq('id', panelId);

      if (error) throw error;

      onCategoriesChange(categories);
      toast({ title: "Categories saved successfully" });
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving categories:', error);
      toast({ title: "Failed to save categories", variant: "destructive" });
    } finally {
      setIsSaving(false);
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
            Customize sidebar categories. Drag to reorder, add custom presets, or remove unused ones.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-hidden">
          {/* Actions Bar */}
          <div className="flex items-center justify-between gap-2">
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
              variant="ghost"
              size="sm"
              onClick={handleResetToDefaults}
              className="gap-2 text-muted-foreground"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Defaults
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
                      value={newCategory.label}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, label: e.target.value }))}
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

          {/* Categories List */}
          <ScrollArea className="h-[350px] pr-4">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={categories.map(c => c.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {categories.map((category) => (
                    <SortableCategoryItem
                      key={category.id}
                      category={category}
                      onRemove={() => handleRemoveCategory(category.id)}
                      onEdit={() => setEditingCategory(category)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </ScrollArea>

          {/* Info */}
          <p className="text-xs text-muted-foreground text-center">
            {categories.length} categories • Drag to reorder
          </p>
        </div>

        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
