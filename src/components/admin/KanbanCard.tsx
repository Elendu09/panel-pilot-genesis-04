import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface KanbanCardProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

const variantStyles = {
  default: "border-border hover:border-primary/50",
  success: "border-emerald-500/30 hover:border-emerald-500/60 bg-emerald-500/5",
  warning: "border-amber-500/30 hover:border-amber-500/60 bg-amber-500/5",
  danger: "border-red-500/30 hover:border-red-500/60 bg-red-500/5",
  info: "border-blue-500/30 hover:border-blue-500/60 bg-blue-500/5"
};

const KanbanCard = ({
  children,
  onClick,
  className,
  variant = 'default'
}: KanbanCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={cn(
        "relative rounded-xl border p-4 cursor-pointer",
        "bg-card/80 backdrop-blur-sm",
        "shadow-sm hover:shadow-md transition-all duration-300",
        "group overflow-hidden",
        variantStyles[variant],
        className
      )}
    >
      {/* Hover Glow Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default KanbanCard;
