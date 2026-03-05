import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Menu, 
  X,
  Search, 
  Zap,
  Code,
  Link2,
  Settings,
  HelpCircle,
  Command,
  Users,
  Shield,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";

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

const siteLinks = [
  { name: "Features", href: "/features" },
  { name: "Pricing", href: "/pricing" },
  { name: "Blog", href: "/blog" },
  { name: "Documentation", href: "/docs" },
  { name: "Contact", href: "/contact" },
];

export function DocsHeader({ onMenuClick, onSearchClick }: DocsHeaderProps) {
  const location = useLocation();
  const currentCategory = location.pathname.split("/")[2] || "";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  const getDashboardPath = () => {
    switch (profile?.role) {
      case 'admin':
        return '/admin';
      case 'panel_owner':
        return '/panel';
      case 'buyer':
        return '/client';
      default:
        return '/';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 gap-4">
            <Link to="/" className="flex items-center space-x-2 shrink-0" data-testid="link-docs-home">
              <img 
                src="/favicon.ico" 
                alt="HOME OF SMM logo" 
                className="w-8 h-8 rounded-lg object-cover"
              />
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                HOME OF SMM
              </span>
            </Link>

            <Badge variant="secondary" className="hidden sm:flex shrink-0" data-testid="badge-docs">
              Docs
            </Badge>

            <nav className="hidden lg:flex items-center gap-1 ml-2" aria-label="Main navigation">
              {siteLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  data-testid={`link-nav-${link.name.toLowerCase()}`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            <div className="flex-1" />

            <Button
              variant="outline"
              className="hidden md:flex items-center gap-2 text-muted-foreground w-56 lg:w-72 justify-start"
              onClick={onSearchClick}
              data-testid="button-search-docs"
            >
              <Search className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1 text-left text-sm">Search docs...</span>
              <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <Command className="h-3 w-3" />K
              </kbd>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden shrink-0"
              onClick={onSearchClick}
              data-testid="button-search-mobile"
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>

            <div className="hidden lg:flex items-center gap-3">
              <ThemeToggle />
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground truncate max-w-[120px]" data-testid="text-user-name">
                    {profile?.full_name || user.email?.split('@')[0]}
                  </span>
                  <Button asChild variant="outline" size="sm" data-testid="link-dashboard">
                    <Link to={getDashboardPath()}>Dashboard</Link>
                  </Button>
                  <Button variant="destructive" size="sm" onClick={signOut} data-testid="button-logout">
                    <LogOut className="h-4 w-4 mr-1" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button asChild variant="ghost" data-testid="link-signin">
                    <Link to="/auth">Sign In</Link>
                  </Button>
                  <Button asChild className="bg-gradient-primary hover:shadow-glow" data-testid="link-getstarted">
                    <Link to="/auth">Get Started</Link>
                  </Button>
                </div>
              )}
            </div>

            <div className="lg:hidden flex items-center gap-1.5">
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5"
                data-testid="button-mobile-menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-border">
              <div className="flex flex-col space-y-4">
                {siteLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid={`link-mobile-${link.name.toLowerCase()}`}
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="flex flex-col space-y-2 pt-4 border-t border-border">
                  {user ? (
                    <>
                      <div className="px-4 py-2 text-sm text-muted-foreground" data-testid="text-mobile-user">
                        {profile?.full_name || user.email}
                      </div>
                      <Button asChild variant="outline" className="w-full justify-start" data-testid="link-mobile-dashboard">
                        <Link to={getDashboardPath()} onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                      </Button>
                      <Button variant="ghost" onClick={() => { signOut(); setMobileMenuOpen(false); }} className="w-full justify-start" data-testid="button-mobile-logout">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button asChild variant="ghost" className="w-full justify-start" data-testid="link-mobile-signin">
                        <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                      </Button>
                      <Button asChild className="bg-gradient-primary w-full justify-start" data-testid="link-mobile-getstarted">
                        <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="hidden lg:block border-b bg-background/60 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-1 py-2 overflow-x-auto" aria-label="Documentation categories">
            {navTabs.map((tab) => {
              const isActive = currentCategory === tab.slug;
              return (
                <Link
                  key={tab.slug}
                  to={`/docs/${tab.slug}/${tab.defaultArticle}`}
                  className={cn(
                    "relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                  data-testid={`link-docs-tab-${tab.slug}`}
                >
                  {isActive && (
                    <div className="absolute inset-0 rounded-md bg-gradient-to-r from-primary/15 to-primary-glow/10 border border-primary/20" />
                  )}
                  
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
                    "relative flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-all whitespace-nowrap",
                    isActive
                      ? "text-foreground bg-primary/10 border border-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                  data-testid={`link-docs-tab-mobile-${tab.slug}`}
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
