import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Menu, 
  Search, 
  Zap,
  Code,
  Link2,
  Settings,
  HelpCircle,
  Command,
  Users,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface DocsHeaderProps {
  onMenuClick: () => void;
  onSearchClick: () => void;
}

const navTabs = [
  { name: "Getting Started", slug: "getting-started", defaultArticle: "quick-start-guide", icon: Zap, color: "from-yellow-500 to-orange-500" },
  { name: "API", slug: "api", defaultArticle: "panel-api-overview", icon: Code, color: "from-blue-500 to-cyan-500" },
  { name: "Integration", slug: "integration", defaultArticle: "provider-integration", icon: Link2, color: "from-purple-500 to-pink-500" },
  { name: "Configuration", slug: "configuration", defaultArticle: "panel-settings", icon: Settings, color: "from-green-500 to-emerald-500" },
  { name: "Users", slug: "user-management", defaultArticle: "customer-overview", icon: Users, color: "from-orange-500 to-red-500" },
  { name: "Security", slug: "security", defaultArticle: "security-overview", icon: Shield, color: "from-red-500 to-rose-500" },
  { name: "Troubleshooting", slug: "troubleshooting", defaultArticle: "common-issues", icon: HelpCircle, color: "from-amber-500 to-yellow-500" },
];

export function DocsHeader({ onMenuClick, onSearchClick }: DocsHeaderProps) {
  const location = useLocation();
  const currentCategory = location.pathname.split("/")[2] || "";

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Row 1: Brand + Search + Theme */}
      <div className="border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center gap-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden shrink-0"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>

          {/* Brand Logo + Name */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img 
              src="/favicon.ico" 
              alt="HOME OF SMM" 
              className="w-8 h-8 rounded-lg"
            />
            {/* Show brand name on all screens */}
            <div className="flex flex-col">
              <span className="text-sm font-bold leading-tight">HOME OF SMM</span>
              <span className="hidden sm:block text-[10px] text-muted-foreground leading-tight">Documentation</span>
            </div>
          </Link>

          <Badge variant="secondary" className="hidden sm:flex bg-primary/10 text-primary border-primary/20">
            Docs
          </Badge>

          {/* Desktop Main Site Navigation */}
          <nav className="hidden lg:flex items-center gap-1 ml-4">
            {[
              { name: "Features", href: "/features" },
              { name: "Pricing", href: "/pricing" },
              { name: "Blog", href: "/blog" },
              { name: "Documentation", href: "/docs" },
              { name: "Contact", href: "/contact" },
            ].map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Search Button - Desktop */}
          <Button
            variant="outline"
            className="hidden md:flex items-center gap-2 text-muted-foreground w-64 lg:w-80 justify-start bg-muted/30 border-border/50 hover:bg-muted/50 hover:border-primary/30 transition-all"
            onClick={onSearchClick}
          >
            <Search className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1 text-left text-sm">Search docs...</span>
            <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-background/80 px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <Command className="h-3 w-3" />K
            </kbd>
          </Button>

          {/* Mobile Search */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden shrink-0"
            onClick={onSearchClick}
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>

          {/* Theme Toggle - Fixed Width */}
          <div className="w-9 h-9 shrink-0 flex items-center justify-center">
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Row 2: Desktop Navigation Tabs */}
      <div className="hidden lg:block border-b bg-background/60 backdrop-blur-sm">
        <div className="container">
          <nav className="flex items-center gap-1 py-2 overflow-x-auto">
            {navTabs.map((tab) => {
              const isActive = currentCategory === tab.slug;
              return (
                <Link
                  key={tab.slug}
                  to={`/docs/${tab.slug}/${tab.defaultArticle}`}
                  className={cn(
                    "relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {/* Active tab background */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/15 to-primary-glow/10 border border-primary/20" />
                  )}
                  
                  {/* Icon with gradient background when active */}
                  <div className={cn(
                    "relative w-6 h-6 rounded-md flex items-center justify-center transition-all",
                    isActive 
                      ? `bg-gradient-to-br ${tab.color} shadow-sm` 
                      : "bg-transparent"
                  )}>
                    <tab.icon className={cn(
                      "h-3.5 w-3.5 transition-colors",
                      isActive ? "text-white" : ""
                    )} />
                  </div>
                  
                  <span className="relative">{tab.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Category Tabs - Scrollable */}
      <div className="lg:hidden border-b bg-background/80 backdrop-blur-xl">
        <ScrollArea className="w-full">
          <div className="flex items-center gap-1 px-4 py-2">
            {navTabs.map((tab) => {
              const isActive = currentCategory === tab.slug;
              return (
                <Link
                  key={tab.slug}
                  to={`/docs/${tab.slug}/${tab.defaultArticle}`}
                  className={cn(
                    "relative flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap",
                    isActive
                      ? "text-foreground bg-primary/10 border border-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 rounded flex items-center justify-center",
                    isActive ? `bg-gradient-to-br ${tab.color}` : "bg-muted/50"
                  )}>
                    <tab.icon className={cn(
                      "h-3 w-3",
                      isActive ? "text-white" : "text-muted-foreground"
                    )} />
                  </div>
                  <span>{tab.name}</span>
                </Link>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
      </div>
    </header>
  );
}
