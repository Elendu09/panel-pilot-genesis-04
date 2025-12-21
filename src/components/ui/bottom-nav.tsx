import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LucideIcon, Plus, X, Package, ShoppingCart, Users, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BottomNavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

interface FabMenuItem {
  name: string;
  icon: LucideIcon;
  action: () => void;
  color: string;
}

interface BottomNavProps {
  items: BottomNavItem[];
  className?: string;
  showFab?: boolean;
  fabItems?: FabMenuItem[];
}

export const BottomNav = ({ items, className, showFab = false, fabItems }: BottomNavProps) => {
  const location = useLocation();
  const [fabOpen, setFabOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/panel' || path === '/admin') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const defaultFabItems: FabMenuItem[] = fabItems || [
    { name: 'Add Service', icon: Package, action: () => console.log('Add Service'), color: 'bg-purple-500' },
    { name: 'New Order', icon: ShoppingCart, action: () => console.log('New Order'), color: 'bg-blue-500' },
    { name: 'Add Customer', icon: Users, action: () => console.log('Add Customer'), color: 'bg-green-500' },
    { name: 'Analytics', icon: BarChart3, action: () => console.log('Analytics'), color: 'bg-orange-500' },
  ];

  return (
    <>
      {/* FAB Backdrop */}
      <AnimatePresence>
        {fabOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setFabOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Floating Bottom Navigation */}
      <div className={cn(
        "bottom-nav-floating md:hidden safe-area-bottom",
        className
      )}>
        <nav className="flex items-center justify-around px-2 py-3">
          {items.map((item) => {
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

      {/* Enhanced FAB with Menu */}
      {showFab && (
        <div className="fixed bottom-24 right-4 z-50 md:hidden">
          {/* FAB Menu Items */}
          <AnimatePresence>
            {fabOpen && (
              <div className="absolute bottom-16 right-0 flex flex-col-reverse items-end gap-3 mb-2">
                {defaultFabItems.map((item, index) => (
                  <motion.button
                    key={item.name}
                    initial={{ opacity: 0, scale: 0, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0, y: 20 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      item.action();
                      setFabOpen(false);
                    }}
                    className="flex items-center gap-3 group"
                  >
                    <span className="px-3 py-1.5 rounded-lg bg-card/95 backdrop-blur-xl border border-border/50 text-sm font-medium shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.name}
                    </span>
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg",
                      item.color
                    )}>
                      <item.icon className="w-5 h-5" />
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </AnimatePresence>

          {/* Main FAB */}
          <motion.button
            onClick={() => setFabOpen(!fabOpen)}
            className={cn(
              "fab w-14 h-14",
              fabOpen && "bg-destructive"
            )}
            animate={{ rotate: fabOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
            aria-label="Quick actions"
          >
            {fabOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
          </motion.button>
        </div>
      )}
    </>
  );
};
