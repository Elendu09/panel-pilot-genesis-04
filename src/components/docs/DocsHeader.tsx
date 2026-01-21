import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Menu, 
  Search, 
  Book,
  Zap,
  Code,
  Link2,
  Settings,
  HelpCircle,
  ExternalLink,
  Command
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface DocsHeaderProps {
  onMenuClick: () => void;
  onSearchClick: () => void;
}

const navTabs = [
  { name: "Getting Started", slug: "getting-started", icon: Zap },
  { name: "API", slug: "api", icon: Code },
  { name: "Integration", slug: "integration", icon: Link2 },
  { name: "Configuration", slug: "configuration", icon: Settings },
  { name: "Troubleshooting", slug: "troubleshooting", icon: HelpCircle },
];

export function DocsHeader({ onMenuClick, onSearchClick }: DocsHeaderProps) {
  const location = useLocation();
  const currentCategory = location.pathname.split("/")[2] || "";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center gap-4">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
            <Book className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="hidden sm:inline-block">HOME OF SMM</span>
        </Link>

        <Badge variant="secondary" className="hidden sm:flex">
          Docs
        </Badge>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 ml-6">
          {navTabs.map((tab) => {
            const isActive = currentCategory === tab.slug;
            return (
              <Link
                key={tab.slug}
                to={`/docs/${tab.slug}/quick-start`}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden lg:inline">{tab.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search Button */}
        <Button
          variant="outline"
          className="hidden sm:flex items-center gap-2 text-muted-foreground w-64 justify-start"
          onClick={onSearchClick}
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 text-left">Search docs...</span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <Command className="h-3 w-3" />K
          </kbd>
        </Button>

        {/* Mobile Search */}
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden"
          onClick={onSearchClick}
        >
          <Search className="h-5 w-5" />
          <span className="sr-only">Search</span>
        </Button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Back to Main Site */}
        <Button variant="ghost" size="sm" asChild className="hidden md:flex">
          <Link to="/">
            <ExternalLink className="h-4 w-4 mr-2" />
            Main Site
          </Link>
        </Button>
      </div>
    </header>
  );
}
