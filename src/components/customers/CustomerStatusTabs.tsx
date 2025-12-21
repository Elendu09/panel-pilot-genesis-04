import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Users, Circle, UserX } from "lucide-react";

interface CustomerStatusTabsProps {
  activeTab: "all" | "online" | "banned";
  onTabChange: (tab: "all" | "online" | "banned") => void;
  counts: {
    all: number;
    online: number;
    banned: number;
  };
}

export const CustomerStatusTabs = ({ activeTab, onTabChange, counts }: CustomerStatusTabsProps) => {
  const tabs = [
    { 
      id: "all" as const, 
      label: "All Customers", 
      icon: Users, 
      count: counts.all,
      color: "primary",
      gradient: "from-primary/20 to-primary/5",
      activeGradient: "from-primary/30 to-primary/10",
      glowColor: "shadow-primary/20"
    },
    { 
      id: "online" as const, 
      label: "Online Now", 
      icon: Circle, 
      count: counts.online,
      color: "emerald",
      gradient: "from-emerald-500/20 to-emerald-500/5",
      activeGradient: "from-emerald-500/30 to-emerald-500/10",
      glowColor: "shadow-emerald-500/20"
    },
    { 
      id: "banned" as const, 
      label: "Banned", 
      icon: UserX, 
      count: counts.banned,
      color: "destructive",
      gradient: "from-destructive/20 to-destructive/5",
      activeGradient: "from-destructive/30 to-destructive/10",
      glowColor: "shadow-destructive/20"
    },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        
        return (
          <motion.button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300",
              "backdrop-blur-xl bg-gradient-to-br",
              isActive 
                ? `${tab.activeGradient} border-${tab.color === "primary" ? "primary" : tab.color === "emerald" ? "emerald-500" : "destructive"}/40 shadow-lg ${tab.glowColor}`
                : `${tab.gradient} border-border/50 hover:border-${tab.color === "primary" ? "primary" : tab.color === "emerald" ? "emerald-500" : "destructive"}/30`,
              "cursor-pointer group"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Active indicator glow */}
            {isActive && (
              <motion.div
                layoutId="activeTabGlow"
                className={cn(
                  "absolute inset-0 rounded-xl opacity-50",
                  `bg-gradient-to-br ${tab.activeGradient}`
                )}
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            
            <div className={cn(
              "relative z-10 p-2 rounded-lg transition-colors",
              tab.color === "primary" && (isActive ? "bg-primary/20" : "bg-primary/10"),
              tab.color === "emerald" && (isActive ? "bg-emerald-500/20" : "bg-emerald-500/10"),
              tab.color === "destructive" && (isActive ? "bg-destructive/20" : "bg-destructive/10"),
            )}>
              <Icon className={cn(
                "w-4 h-4 transition-colors",
                tab.color === "primary" && "text-primary",
                tab.color === "emerald" && "text-emerald-500",
                tab.color === "destructive" && "text-destructive",
                tab.id === "online" && "fill-current"
              )} />
            </div>
            
            <div className="relative z-10 text-left">
              <p className={cn(
                "text-sm font-medium transition-colors",
                isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
              )}>
                {tab.label}
              </p>
              <motion.p 
                className={cn(
                  "text-xl font-bold",
                  tab.color === "primary" && "text-primary",
                  tab.color === "emerald" && "text-emerald-500",
                  tab.color === "destructive" && "text-destructive",
                )}
                key={tab.count}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
              >
                {tab.count}
              </motion.p>
            </div>
            
            {/* Active indicator dot */}
            {isActive && (
              <motion.div
                layoutId="activeIndicator"
                className={cn(
                  "absolute -top-1 -right-1 w-3 h-3 rounded-full",
                  tab.color === "primary" && "bg-primary",
                  tab.color === "emerald" && "bg-emerald-500",
                  tab.color === "destructive" && "bg-destructive",
                )}
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <span className={cn(
                  "absolute inset-0 rounded-full animate-ping opacity-75",
                  tab.color === "primary" && "bg-primary",
                  tab.color === "emerald" && "bg-emerald-500",
                  tab.color === "destructive" && "bg-destructive",
                )} />
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
};
