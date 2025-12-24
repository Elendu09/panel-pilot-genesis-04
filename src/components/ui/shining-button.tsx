import * as React from "react";
import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "./button";

interface ShiningButtonProps extends ButtonProps {
  shimmer?: boolean;
  glow?: boolean;
  gradient?: "primary" | "secondary" | "accent" | "rainbow";
}

const ShiningButton = React.forwardRef<HTMLButtonElement, ShiningButtonProps>(
  ({ className, shimmer = true, glow = true, gradient = "primary", children, ...props }, ref) => {
    const gradientClasses = {
      primary: "bg-gradient-to-r from-primary via-primary/80 to-primary",
      secondary: "bg-gradient-to-r from-secondary via-secondary/80 to-secondary",
      accent: "bg-gradient-to-r from-accent via-accent/80 to-accent",
      rainbow: "bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500",
    };

    return (
      <Button
        ref={ref}
        className={cn(
          "relative overflow-hidden transition-all duration-300",
          gradientClasses[gradient],
          glow && "hover:shadow-glow",
          shimmer && "shimmer-button",
          className
        )}
        {...props}
      >
        {shimmer && (
          <span className="absolute inset-0 overflow-hidden">
            <span className="absolute inset-0 -translate-x-full animate-shimmer-slide bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </span>
        )}
        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>
      </Button>
    );
  }
);

ShiningButton.displayName = "ShiningButton";

export { ShiningButton };
