import { cn } from "@/lib/utils";
import { 
  AlertTriangle, 
  Info, 
  Lightbulb, 
  AlertCircle, 
  CheckCircle2,
  Flame,
  BookOpen
} from "lucide-react";

type CalloutType = 'info' | 'tip' | 'warning' | 'danger' | 'success' | 'note';

interface DocsCalloutProps {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const calloutConfig: Record<CalloutType, { 
  icon: React.ElementType; 
  bg: string; 
  border: string; 
  iconColor: string;
  titleColor: string;
  defaultTitle: string;
}> = {
  info: {
    icon: Info,
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    iconColor: "text-blue-500",
    titleColor: "text-blue-400",
    defaultTitle: "Info"
  },
  tip: {
    icon: Lightbulb,
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    iconColor: "text-green-500",
    titleColor: "text-green-400",
    defaultTitle: "Tip"
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    iconColor: "text-yellow-500",
    titleColor: "text-yellow-400",
    defaultTitle: "Warning"
  },
  danger: {
    icon: Flame,
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    iconColor: "text-red-500",
    titleColor: "text-red-400",
    defaultTitle: "Danger"
  },
  success: {
    icon: CheckCircle2,
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    iconColor: "text-emerald-500",
    titleColor: "text-emerald-400",
    defaultTitle: "Success"
  },
  note: {
    icon: BookOpen,
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    iconColor: "text-purple-500",
    titleColor: "text-purple-400",
    defaultTitle: "Note"
  }
};

export function DocsCallout({ 
  type = 'info', 
  title, 
  children, 
  className 
}: DocsCalloutProps) {
  const config = calloutConfig[type];
  const Icon = config.icon;

  return (
    <div 
      className={cn(
        "my-6 rounded-lg border p-4 backdrop-blur-sm",
        config.bg,
        config.border,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", config.iconColor)} />
        <div className="flex-1 min-w-0">
          {(title || config.defaultTitle) && (
            <h5 className={cn("font-semibold mb-1", config.titleColor)}>
              {title || config.defaultTitle}
            </h5>
          )}
          <div className="text-sm text-foreground/80 leading-relaxed [&>p]:mb-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
