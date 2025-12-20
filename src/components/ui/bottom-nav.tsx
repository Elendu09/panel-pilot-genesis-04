import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LucideIcon, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface BottomNavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

interface BottomNavProps {
  items: BottomNavItem[];
  className?: string;
  showFab?: boolean;
  fabAction?: () => void;
}

export const BottomNav = ({ items, className, showFab = false, fabAction }: BottomNavProps) => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/panel' || path === '/admin') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Floating Bottom Navigation */}
      <div className={cn(
        "bottom-nav-floating md:hidden safe-area-bottom",
        className
      )}>
        <nav className="flex items-center justify-around px-2 py-3">
          {items.map((item, index) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex flex-col items-center justify-center px-4 py-2 rounded-xl transition-all duration-300 min-w-0 flex-1 relative group",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {/* Active Indicator Pill */}
                {active && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary/10 rounded-xl border border-primary/20"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                
                <div className="relative z-10">
                  <div className="relative">
                    <item.icon className={cn(
                      "h-5 w-5 mb-1 transition-transform duration-200",
                      active && "scale-110"
                    )} />
                    
                    {/* Badge */}
                    {item.badge && item.badge > 0 && (
                      <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse-glow">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </div>
                  <span className={cn(
                    "text-[10px] font-medium truncate max-w-full transition-all duration-200",
                    active && "font-semibold"
                  )}>
                    {item.name}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Floating Action Button */}
      {showFab && (
        <button
          onClick={fabAction}
          className="fab bottom-24 right-4 md:hidden"
          aria-label="Quick action"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}
    </>
  );
};
