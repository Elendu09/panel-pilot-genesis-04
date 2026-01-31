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
        "w-full flex items-center gap-4 p-4 rounded-xl",
        "bg-card/50 backdrop-blur-sm border border-border/30",
        "hover:bg-card/80 hover:shadow-lg hover:-translate-y-0.5",
        "transition-all duration-300 text-left group"
      )}
    >
      <div className={cn(
        "w-12 h-12 flex items-center justify-center rounded-xl",
        "bg-gradient-to-br from-muted/80 to-muted/40",
        "group-hover:scale-110 transition-transform duration-300 shadow-sm",
        "ring-1 ring-border/30"
      )}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <span className="font-semibold text-foreground block truncate">{name}</span>
        {subtitle && (
          <span className="text-xs text-muted-foreground truncate block mt-0.5">{subtitle}</span>
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {enabled !== undefined && (
          <div 
            className={cn(
              "w-3 h-3 rounded-full transition-all shadow-sm",
              enabled 
                ? "bg-emerald-500 ring-4 ring-emerald-500/20" 
                : "bg-muted-foreground/30"
            )} 
          />
        )}
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 group-hover:text-foreground transition-all" />
      </div>
    </button>
  );
}
