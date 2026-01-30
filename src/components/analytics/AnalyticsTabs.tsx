import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutGrid, CreditCard, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalyticsTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export function AnalyticsTabs({ activeTab, onTabChange }: AnalyticsTabsProps) {
  const tabs = [
    { value: 'overview', label: 'Overview', icon: LayoutGrid },
    { value: 'payments', label: 'Payments', icon: CreditCard },
    { value: 'customers', label: 'Customers', icon: Users },
  ];

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="bg-muted/50 backdrop-blur-sm h-10 p-1 gap-1 w-full md:w-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger 
              key={tab.value}
              value={tab.value}
              className={cn(
                "flex items-center gap-2 px-3 md:px-4 flex-1 md:flex-none",
                "data-[state=active]:bg-background data-[state=active]:shadow-sm",
                "data-[state=active]:text-foreground",
                "transition-all duration-200"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="text-xs sm:text-sm">{tab.label}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
