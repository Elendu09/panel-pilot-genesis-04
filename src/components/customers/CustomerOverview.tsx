import { useRef, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight, Trophy, Crown, Zap, Users, Star } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Customer {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: "active" | "inactive" | "suspended";
  segment: "vip" | "regular" | "new";
  balance: number;
  totalSpent: number;
  totalOrders: number;
  joinedAt: string;
  lastActive: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  customers: Customer[];
}

interface CustomerOverviewProps {
  customers: Customer[];
  onSelectCustomer: (customer: Customer) => void;
}

export function CustomerOverview({ customers, onSelectCustomer }: CustomerOverviewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const kanbanColumns: KanbanColumn[] = [
    {
      id: "top-spenders",
      title: "Top Spenders",
      icon: Trophy,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/30",
      customers: [...customers].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 3),
    },
    {
      id: "vip",
      title: "VIP Members",
      icon: Crown,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
      customers: customers.filter(c => c.segment === "vip"),
    },
    {
      id: "most-active",
      title: "Most Active",
      icon: Zap,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
      customers: [...customers].sort((a, b) => b.totalOrders - a.totalOrders).slice(0, 3),
    },
    {
      id: "regular",
      title: "Regular Users",
      icon: Users,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30",
      customers: customers.filter(c => c.segment === "regular" && c.status === "active"),
    },
    {
      id: "new",
      title: "New Users",
      icon: Star,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/30",
      customers: customers.filter(c => c.segment === "new"),
    },
  ];

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', checkScrollButtons);
      window.addEventListener('resize', checkScrollButtons);
      return () => {
        scrollElement.removeEventListener('scroll', checkScrollButtons);
        window.removeEventListener('resize', checkScrollButtons);
      };
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 280; // Slightly more than column width
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <Card className="bg-card/60 backdrop-blur-xl border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Customer Overview</CardTitle>
      </CardHeader>
      <CardContent className="relative">
        {/* Left scroll button & gradient */}
        <div 
          className={cn(
            "absolute left-0 top-0 bottom-4 w-16 z-10 flex items-center justify-start pl-2 transition-opacity duration-200",
            "bg-gradient-to-r from-card via-card/80 to-transparent",
            canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <Button 
            variant="secondary" 
            size="icon" 
            className="h-10 w-10 rounded-full shadow-lg"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </div>

        {/* Right scroll button & gradient */}
        <div 
          className={cn(
            "absolute right-0 top-0 bottom-4 w-16 z-10 flex items-center justify-end pr-2 transition-opacity duration-200",
            "bg-gradient-to-l from-card via-card/80 to-transparent",
            canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <Button 
            variant="secondary" 
            size="icon" 
            className="h-10 w-10 rounded-full shadow-lg"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Scrollable container */}
        <div 
          ref={scrollRef}
          className="flex gap-4 pb-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {kanbanColumns.map((column) => (
            <div 
              key={column.id} 
              className={cn(
                "w-64 min-w-[256px] flex-shrink-0 rounded-xl border-2 p-4 snap-start",
                column.borderColor, 
                column.bgColor
              )}
            >
              <div className="flex items-center gap-2 mb-4">
                <column.icon className={cn("w-5 h-5", column.color)} />
                <h3 className="font-semibold">{column.title}</h3>
                <Badge variant="secondary" className="ml-auto">{column.customers.length}</Badge>
              </div>
              <div className="space-y-3">
                {column.customers.slice(0, 4).map((customer) => (
                  <motion.div
                    key={customer.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-card/80 backdrop-blur-sm rounded-lg p-3 border border-border/50 cursor-pointer hover:border-primary/30 transition-all"
                    onClick={() => onSelectCustomer(customer)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={customer.avatar} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {customer.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{customer.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{customer.email}</p>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Balance</span>
                      <span className="font-medium text-primary">${customer.balance.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-muted-foreground">Spent</span>
                      <span className="font-medium">${customer.totalSpent.toFixed(0)}</span>
                    </div>
                  </motion.div>
                ))}
                {column.customers.length > 4 && (
                  <p className="text-xs text-center text-muted-foreground">+{column.customers.length - 4} more</p>
                )}
                {column.customers.length === 0 && (
                  <p className="text-xs text-center text-muted-foreground py-4">No customers</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
