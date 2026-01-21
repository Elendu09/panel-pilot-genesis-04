import { ReactNode, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { DocsHeader } from "@/components/docs/DocsHeader";
import { DocsSidebarEnhanced } from "@/components/docs/DocsSidebarEnhanced";
import { DocsMobileSidebar } from "@/components/docs/DocsMobileSidebar";
import { DocsSearch } from "@/components/docs/DocsSearch";
import { cn } from "@/lib/utils";

interface DocsLayoutProps {
  children: ReactNode;
}

export function DocsLayout({ children }: DocsLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Keyboard shortcut for search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Docs Header */}
      <DocsHeader 
        onMenuClick={() => setSidebarOpen(true)} 
        onSearchClick={() => setSearchOpen(true)} 
      />

      {/* Mobile Sidebar */}
      <DocsMobileSidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Search Dialog */}
      <DocsSearch 
        open={searchOpen} 
        onClose={() => setSearchOpen(false)} 
      />

      {/* Main Layout */}
      <div className="flex">
        {/* Desktop Sidebar */}
        <DocsSidebarEnhanced className="hidden lg:block" />

        {/* Main Content */}
        <main className={cn(
          "flex-1 min-w-0",
          "lg:pl-0"
        )}>
          {children}
        </main>
      </div>
    </div>
  );
}
