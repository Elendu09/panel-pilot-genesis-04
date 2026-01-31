import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LucideIcon, Plus, X, Package, ShoppingCart, Users, BarChart3, HeadphonesIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BottomNavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  tourId?: string;
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
  centerIndex?: number;
  supportFabAction?: () => void;
}

export const BottomNav = ({ items, className, showFab = false, fabItems, centerIndex, supportFabAction }: BottomNavProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [fabOpen, setFabOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/panel' || path === '/admin') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const defaultFabItems: FabMenuItem[] = fabItems || [
    { name: 'Add Service', icon: Package, action: () => navigate('/panel/services'), color: 'bg-purple-500' },
    { name: 'New Order', icon: ShoppingCart, action: () => navigate('/panel/orders'), color: 'bg-blue-500' },
    { name: 'Add Customer', icon: Users, action: () => navigate('/panel/customers'), color: 'bg-green-500' },
    { name: 'Analytics', icon: BarChart3, action: () => navigate('/panel/analytics'), color: 'bg-orange-500' },
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

      {/* Support FAB - Single button that navigates directly to Support page */}
      {supportFabAction && (
        <div className="fixed bottom-[5.5rem] right-4 z-50 md:hidden">
          <motion.button
            onClick={supportFabAction}
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg",
              "bg-gradient-to-br from-indigo-500 to-indigo-600",
              "transition-all duration-200 hover:shadow-xl"
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Support Center"
          >
            <HeadphonesIcon className="w-5 h-5" />
          </motion.button>
        </div>
      )}

      {/* Enhanced FAB with Menu - positioned inside safe area */}
      {showFab && !supportFabAction && (
        <div className="fixed bottom-[5.5rem] right-4 z-50 md:hidden">
          {/* FAB Menu Items */}
          <AnimatePresence>
            {fabOpen && (
              <div className="absolute bottom-14 right-0 flex flex-col-reverse items-end gap-2 mb-2">
                {defaultFabItems.map((item, index) => (
                  <motion.button
                    key={item.name}
                    initial={{ opacity: 0, scale: 0.5, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.5, x: 20 }}
                    transition={{ delay: index * 0.05, type: "spring", stiffness: 400, damping: 25 }}
                    onClick={() => {
                      item.action();
                      setFabOpen(false);
                    }}
                    className="flex items-center gap-2 group"
                  >
                    <motion.span 
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 + 0.1 }}
                      className="px-3 py-1.5 rounded-lg bg-card/95 backdrop-blur-xl border border-border/50 text-xs font-medium shadow-lg whitespace-nowrap"
                    >
                      {item.name}
                    </motion.span>
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg",
                      item.color
                    )}>
                      <item.icon className="w-4 h-4" />
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
              "w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg",
              "bg-gradient-to-br from-primary to-primary/80",
              "transition-all duration-200",
              fabOpen && "bg-gradient-to-br from-destructive to-destructive/80"
            )}
            animate={{ rotate: fabOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Quick actions"
          >
            {fabOpen ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </motion.button>
        </div>
      )}

      {/* Floating Bottom Navigation */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 z-30 md:hidden",
        "bg-card/95 backdrop-blur-xl border-t border-border/50",
        "pb-safe",
        className
      )}>
        <nav className="flex items-stretch justify-around h-16 px-1">
          {items.map((item, index) => {
            const active = isActive(item.href);
            const isCenter = centerIndex !== undefined && index === centerIndex;
            
            // Center item with special styling (like buyer nav)
            if (isCenter) {
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  data-tour={item.tourId}
                  className="flex items-center justify-center flex-1 relative -mt-4"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-lg",
                      "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground",
                      "border-4 border-background"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-[8px] font-semibold mt-0.5">{item.name}</span>
                  </motion.div>
                  {/* Badge for center item */}
                  {item.badge && item.badge > 0 && (
                    <span className="absolute top-0 right-1/2 translate-x-4 min-w-[16px] h-[16px] px-1 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </Link>
              );
            }
            
            return (
              <Link
                key={item.name}
                to={item.href}
                data-tour={item.tourId}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 relative",
                  "transition-colors duration-200",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {/* Active Indicator */}
                {active && (
                  <motion.div
                    layoutId="bottomNavActiveTab"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                
                <div className="flex flex-col items-center justify-center gap-0.5">
                  <div className="relative">
                    <item.icon className={cn(
                      "w-5 h-5 transition-transform duration-200",
                      active && "scale-105"
                    )} />
                    
                    {/* Badge */}
                    {item.badge && item.badge > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] px-1 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </div>
                  <span className={cn(
                    "text-[10px] font-medium leading-tight",
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
    </>
  );
};