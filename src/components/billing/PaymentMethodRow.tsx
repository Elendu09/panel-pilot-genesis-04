import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentMethodRowProps {
  icon: React.ReactNode;
  name: string;
  subtitle?: string;
  enabled?: boolean;
  onClick: () => void;
}

export function PaymentMethodRow({ icon, name, subtitle, enabled, onClick }: PaymentMethodRowProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl",
        "hover:bg-muted/50 transition-all duration-200 text-left",
        "border border-transparent hover:border-border/50",
        "group"
      )}
    >
      <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted/50 group-hover:bg-muted transition-colors shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <span className="font-medium text-foreground block truncate">{name}</span>
        {subtitle && (
          <span className="text-xs text-muted-foreground truncate block">{subtitle}</span>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {enabled !== undefined && (
          <div 
            className={cn(
              "w-2.5 h-2.5 rounded-full transition-colors",
              enabled ? "bg-emerald-500" : "bg-muted-foreground/30"
            )} 
          />
        )}
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
    </button>
  );
}
