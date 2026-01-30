import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutGrid, CreditCard, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalyticsTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export function AnalyticsTabs({ activeTab, onTabChange }: AnalyticsTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="bg-muted/50 h-10 p-1 gap-1">
        <TabsTrigger 
          value="overview" 
          className={cn(
            "flex items-center gap-2 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm",
            "transition-all duration-200"
          )}
        >
          <LayoutGrid className="w-4 h-4" />
          <span className="hidden sm:inline">Overview</span>
        </TabsTrigger>
        <TabsTrigger 
          value="payments"
          className={cn(
            "flex items-center gap-2 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm",
            "transition-all duration-200"
          )}
        >
          <CreditCard className="w-4 h-4" />
          <span className="hidden sm:inline">Payments</span>
        </TabsTrigger>
        <TabsTrigger 
          value="customers"
          className={cn(
            "flex items-center gap-2 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm",
            "transition-all duration-200"
          )}
        >
          <Users className="w-4 h-4" />
          <span className="hidden sm:inline">Customers</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
