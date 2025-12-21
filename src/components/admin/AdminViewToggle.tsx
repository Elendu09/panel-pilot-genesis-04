import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminViewToggleProps {
  view: 'table' | 'kanban';
  onViewChange: (view: 'table' | 'kanban') => void;
}

const AdminViewToggle = ({ view, onViewChange }: AdminViewToggleProps) => {
  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50 border border-border">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewChange('table')}
        className={cn(
          "gap-2 h-8 px-3 rounded-md transition-all",
          view === 'table' 
            ? "bg-primary text-primary-foreground shadow-sm" 
            : "hover:bg-background/80 text-muted-foreground"
        )}
      >
        <List className="w-4 h-4" />
        <span className="hidden sm:inline text-xs">Table</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewChange('kanban')}
        className={cn(
          "gap-2 h-8 px-3 rounded-md transition-all",
          view === 'kanban' 
            ? "bg-primary text-primary-foreground shadow-sm" 
            : "hover:bg-background/80 text-muted-foreground"
        )}
      >
        <LayoutGrid className="w-4 h-4" />
        <span className="hidden sm:inline text-xs">Kanban</span>
      </Button>
    </div>
  );
};

export default AdminViewToggle;
