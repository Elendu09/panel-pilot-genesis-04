import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Plug, 
  Globe, 
  Palette, 
  Settings,
  CreditCard,
  Code,
  FileText,
  Shield,
  HelpCircle,
  Search,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePanel } from "@/hooks/usePanel";
import { Badge } from "@/components/ui/badge";

interface SearchResult {
  id: string;
  type: "page" | "service" | "customer" | "order";
  title: string;
  subtitle?: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const navigationItems: SearchResult[] = [
  { id: "dashboard", type: "page", title: "Dashboard", href: "/panel", icon: LayoutDashboard },
  { id: "services", type: "page", title: "Services", href: "/panel/services", icon: Package },
  { id: "orders", type: "page", title: "Orders", href: "/panel/orders", icon: ShoppingCart },
  { id: "customers", type: "page", title: "Customers", href: "/panel/customers", icon: Users },
  { id: "analytics", type: "page", title: "Analytics", href: "/panel/analytics", icon: BarChart3 },
  { id: "providers", type: "page", title: "Providers", href: "/panel/providers", icon: Plug },
  { id: "domain", type: "page", title: "Domain Settings", href: "/panel/domain", icon: Globe },
  { id: "design", type: "page", title: "Design & Theme", href: "/panel/design", icon: Palette },
  { id: "settings", type: "page", title: "General Settings", href: "/panel/settings", icon: Settings },
  { id: "payments", type: "page", title: "Payment Methods", href: "/panel/payments", icon: CreditCard },
  { id: "api", type: "page", title: "API Management", href: "/panel/api", icon: Code },
  { id: "blog", type: "page", title: "Blog", href: "/panel/blog", icon: FileText },
  { id: "security", type: "page", title: "Security", href: "/panel/security", icon: Shield },
  { id: "support", type: "page", title: "Support Center", href: "/panel/support", icon: HelpCircle },
];

interface PanelSearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PanelSearchCommand({ open, onOpenChange }: PanelSearchCommandProps) {
  const navigate = useNavigate();
  const { panel } = usePanel();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<SearchResult[]>([]);
  const [customers, setCustomers] = useState<SearchResult[]>([]);
  const [orders, setOrders] = useState<SearchResult[]>([]);

  // Search services, customers, orders from database
  const searchDatabase = useCallback(async (query: string) => {
    if (!panel?.id || query.length < 2) {
      setServices([]);
      setCustomers([]);
      setOrders([]);
      return;
    }

    setLoading(true);
    try {
      // Search services
      const { data: servicesData } = await supabase
        .from("services")
        .select("id, name, category, price")
        .eq("panel_id", panel.id)
        .ilike("name", `%${query}%`)
        .limit(5);

      // Search customers
      const { data: customersData } = await supabase
        .from("client_users")
        .select("id, email, full_name, username")
        .eq("panel_id", panel.id)
        .or(`email.ilike.%${query}%,full_name.ilike.%${query}%,username.ilike.%${query}%`)
        .limit(5);

      // Search orders by order number
      const { data: ordersData } = await supabase
        .from("orders")
        .select("id, order_number, status, price")
        .eq("panel_id", panel.id)
        .ilike("order_number", `%${query}%`)
        .limit(5);

      setServices(
        (servicesData || []).map((s) => ({
          id: s.id,
          type: "service" as const,
          title: s.name,
          subtitle: `${s.category} • $${Number(s.price).toFixed(2)}`,
          href: `/panel/services?edit=${s.id}`,
          icon: Package,
        }))
      );

      setCustomers(
        (customersData || []).map((c) => ({
          id: c.id,
          type: "customer" as const,
          title: c.full_name || c.username || c.email,
          subtitle: c.email,
          href: `/panel/customers?view=${c.id}`,
          icon: Users,
        }))
      );

      setOrders(
        (ordersData || []).map((o) => ({
          id: o.id,
          type: "order" as const,
          title: o.order_number,
          subtitle: `${o.status} • $${Number(o.price).toFixed(2)}`,
          href: `/panel/orders?view=${o.id}`,
          icon: ShoppingCart,
        }))
      );
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  }, [panel?.id]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchDatabase(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, searchDatabase]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setSearch("");
      setServices([]);
      setCustomers([]);
      setOrders([]);
    }
  }, [open]);

  const handleSelect = (result: SearchResult) => {
    navigate(result.href);
    onOpenChange(false);
  };

  const filteredNavigation = navigationItems.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase())
  );

  const hasResults = filteredNavigation.length > 0 || services.length > 0 || customers.length > 0 || orders.length > 0;

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Search services, customers, orders, pages..." 
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        {loading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">Searching...</span>
          </div>
        )}
        
        {!loading && !hasResults && (
          <CommandEmpty>No results found.</CommandEmpty>
        )}

        {/* Pages */}
        {filteredNavigation.length > 0 && (
          <CommandGroup heading="Pages">
            {filteredNavigation.map((item) => (
              <CommandItem
                key={item.id}
                value={item.title}
                onSelect={() => handleSelect(item)}
                className="cursor-pointer"
              >
                {item.icon && <item.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
                <span>{item.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Services */}
        {services.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Services">
              {services.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`service-${item.title}`}
                  onSelect={() => handleSelect(item)}
                  className="cursor-pointer"
                >
                  <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span>{item.title}</span>
                    {item.subtitle && (
                      <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                    )}
                  </div>
                  <Badge variant="secondary" className="ml-auto text-xs">Service</Badge>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* Customers */}
        {customers.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Customers">
              {customers.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`customer-${item.title}`}
                  onSelect={() => handleSelect(item)}
                  className="cursor-pointer"
                >
                  <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span>{item.title}</span>
                    {item.subtitle && (
                      <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                    )}
                  </div>
                  <Badge variant="secondary" className="ml-auto text-xs">Customer</Badge>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* Orders */}
        {orders.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Orders">
              {orders.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`order-${item.title}`}
                  onSelect={() => handleSelect(item)}
                  className="cursor-pointer"
                >
                  <ShoppingCart className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span>{item.title}</span>
                    {item.subtitle && (
                      <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                    )}
                  </div>
                  <Badge variant="secondary" className="ml-auto text-xs">Order</Badge>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}

export function usePanelSearch() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return { open, setOpen };
}
