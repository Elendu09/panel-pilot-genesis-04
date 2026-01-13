import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { LucideIcon } from "lucide-react";

interface TabItem {
  value: string;
  label: string;
  icon?: LucideIcon;
}

interface ResponsiveTabsProps {
  tabs: TabItem[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

export const ResponsiveTabs = ({ tabs, value, onValueChange, className = "", children }: ResponsiveTabsProps) => {
  return (
    <Tabs value={value} onValueChange={onValueChange} className={`w-full ${className}`}>
      {/* Mobile: Dropdown */}
      <div className="md:hidden mb-4">
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger className="w-full">
            <SelectValue>
              {tabs.find(t => t.value === value)?.label}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <SelectItem key={tab.value} value={tab.value}>
                  <div className="flex items-center gap-2">
                    {Icon && <Icon className="w-4 h-4" />}
                    {tab.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
      
      {/* Desktop: Scrollable Tabs */}
      <div className="hidden md:block">
        <ScrollArea className="w-full">
          <TabsList className="inline-flex w-max min-w-full bg-muted/50 p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger 
                  key={tab.value} 
                  value={tab.value}
                  className="flex items-center gap-2 whitespace-nowrap px-4"
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span className="hidden lg:inline">{tab.label}</span>
                  <span className="lg:hidden">{tab.label.split(' ')[0]}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
      
      {children}
    </Tabs>
  );
};
