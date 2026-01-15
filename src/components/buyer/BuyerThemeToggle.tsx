import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBuyerThemeMode } from "@/contexts/BuyerThemeContext";
import { cn } from "@/lib/utils";

/**
 * Theme toggle specifically for buyer pages.
 * Uses BuyerThemeContext to sync with homepage theme toggle.
 */
export function BuyerThemeToggle({ className }: { className?: string }) {
  const { themeMode, toggleThemeMode } = useBuyerThemeMode();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleThemeMode}
      className={cn("h-9 w-9 transition-colors", className)}
      aria-label={`Switch to ${themeMode === 'dark' ? 'light' : 'dark'} mode`}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
