import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Menu, X, Zap, ShoppingCart, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LowVisionToggle } from "./LowVisionToggle";

interface StorefrontNavigationProps {
  panel?: any;
  customization?: any;
}

export const StorefrontNavigation = ({ panel, customization = {} }: StorefrontNavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const panelName = customization.companyName || panel?.name || 'SMM Panel';
  const logoUrl = customization.logoUrl || panel?.logo_url;
  const primaryColor = customization.primaryColor || '#6366F1';

  const navLinks = [
    { href: "#services", label: "Services" },
    { href: "#features", label: "Features" },
    { href: "#testimonials", label: "Reviews" },
    { href: "#faq", label: "FAQ" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            {logoUrl ? (
              <img src={logoUrl} alt={panelName} className="w-9 h-9 rounded-lg object-cover" />
            ) : (
              <div 
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}CC)` }}
              >
                <Zap className="w-5 h-5 text-white" />
              </div>
            )}
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {panelName}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a 
                key={link.href}
                href={link.href} 
                className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <LowVisionToggle accessibilitySettings={customization.accessibilitySettings} panelId={panel?.id} />
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm">
              <Link to="/buyer/auth">
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Link>
            </Button>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Button 
                asChild 
                size="sm"
                className="bg-gradient-primary hover:shadow-glow"
              >
                <Link to="/buyer/auth?mode=signup">
                  Get Started
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-border/50"
          >
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <a 
                  key={link.href}
                  href={link.href} 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col space-y-2 pt-4 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <LowVisionToggle accessibilitySettings={customization.accessibilitySettings} panelId={panel?.id} />
                  <ThemeToggle />
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/buyer/auth">Sign In</Link>
                </Button>
                <Button asChild className="bg-gradient-primary w-full">
                  <Link to="/buyer/auth?mode=signup">Get Started</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};
