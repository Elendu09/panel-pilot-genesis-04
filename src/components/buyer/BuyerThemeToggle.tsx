import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBuyerThemeMode } from "@/contexts/BuyerThemeContext";

/**
 * BuyerThemeToggle - Uses BuyerThemeContext for consistent theme switching
 * across all buyer pages (homepage, dashboard, services, etc.)
 * 
 * This ensures the same localStorage key and context state is used everywhere,
 * providing seamless theme synchronization.
 */
export function BuyerThemeToggle() {
  const { themeMode, toggleThemeMode } = useBuyerThemeMode();
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleThemeMode}
      className="h-9 w-9 hover:bg-accent"
      aria-label={`Switch to ${themeMode === 'dark' ? 'light' : 'dark'} mode`}
    >
      {themeMode === 'dark' ? (
        <Sun className="h-4 w-4 text-muted-foreground transition-all" />
      ) : (
        <Moon className="h-4 w-4 text-muted-foreground transition-all" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

export default BuyerThemeToggle;
