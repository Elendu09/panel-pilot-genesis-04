import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface KanbanColumnProps {
  title: string;
  count: number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  textColor: string;
  children: ReactNode;
  emptyMessage?: string;
  loading?: boolean;
}

const KanbanColumn = ({
  title,
  count,
  icon: Icon,
  color,
  bgColor,
  textColor,
  children,
  emptyMessage = "No items",
  loading = false
}: KanbanColumnProps) => {
  return (
    <div className="space-y-4">
      {/* Column Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg bg-gradient-to-br", color)}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-xs text-muted-foreground">{count} items</p>
            </div>
          </div>
          <Badge variant="outline" className={cn(bgColor, textColor, "border-current/20")}>
            {count}
          </Badge>
        </div>
      </motion.div>

      {/* Column Items */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-muted/50 rounded-xl animate-pulse" />
          ))
        ) : count === 0 ? (
          <div className="glass-card p-8 text-center">
            <Icon className={cn("w-10 h-10 mx-auto mb-3", textColor, "opacity-50")} />
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
