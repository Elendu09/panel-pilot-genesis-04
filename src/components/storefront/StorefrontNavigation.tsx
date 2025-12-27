import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Zap, LogIn, Sun, Moon } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  const themeMode = customization.themeMode || 'dark';
  const setThemeMode = customization.setThemeMode;
  const backgroundColor = customization.backgroundColor || '#0F0F1A';
  const textColor = customization.textColor || '#FFFFFF';
  const surfaceColor = customization.surfaceColor || '#1A1A2E';
  const borderColor = customization.borderColor || 'rgba(255,255,255,0.1)';

  const navLinks = [
    { href: "#services", label: "Services" },
    { href: "#features", label: "Features" },
    { href: "#testimonials", label: "Reviews" },
    { href: "#faq", label: "FAQ" },
  ];

  const toggleThemeMode = () => {
    if (setThemeMode) {
      setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
    }
  };

  return (
    <motion.nav 
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl"
      style={{ 
        backgroundColor: `${surfaceColor}E6`,
        borderBottom: `1px solid ${borderColor}`
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            {logoUrl ? (
              <motion.img 
                src={logoUrl} 
                alt={panelName} 
                className="w-9 h-9 rounded-lg object-cover"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              />
            ) : (
              <motion.div 
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}CC)` }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Zap className="w-5 h-5 text-white" />
              </motion.div>
            )}
            <span 
              className="text-xl font-bold"
              style={{ 
                background: `linear-gradient(135deg, ${primaryColor}, ${customization.secondaryColor || primaryColor})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              {panelName}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link, index) => (
              <motion.a 
                key={link.href}
                href={link.href} 
                className="text-sm font-medium transition-colors"
                style={{ color: customization.textMuted || '#A1A1AA' }}
                whileHover={{ 
                  color: textColor,
                  y: -2 
                }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {link.label}
              </motion.a>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <LowVisionToggle accessibilitySettings={customization.accessibilitySettings} panelId={panel?.id} />
            
            {/* Theme Mode Toggle */}
            {setThemeMode && (
              <motion.button
                onClick={toggleThemeMode}
                className="p-2 rounded-lg transition-colors"
                style={{ 
                  backgroundColor: `${primaryColor}15`,
                  color: textColor
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {themeMode === 'dark' ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </motion.button>
            )}
            
            <Button asChild variant="ghost" size="sm" style={{ color: textColor }}>
              <Link to="/buyer/auth">
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Link>
            </Button>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Button 
                asChild 
                size="sm"
                style={{ 
                  background: `linear-gradient(135deg, ${primaryColor}, ${customization.secondaryColor || primaryColor})`,
                  boxShadow: `0 4px 20px ${primaryColor}40`
                }}
              >
                <Link to="/buyer/auth?mode=signup">
                  Get Started
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden p-2 rounded-lg"
            style={{ color: textColor }}
            onClick={() => setIsOpen(!isOpen)}
            whileTap={{ scale: 0.95 }}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden py-4"
              style={{ borderTop: `1px solid ${borderColor}` }}
            >
              <div className="flex flex-col space-y-4">
                {navLinks.map((link, index) => (
                  <motion.a 
                    key={link.href}
                    href={link.href} 
                    className="transition-colors"
                    style={{ color: customization.textMuted || '#A1A1AA' }}
                    onClick={() => setIsOpen(false)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {link.label}
                  </motion.a>
                ))}
                <div 
                  className="flex flex-col space-y-2 pt-4" 
                  style={{ borderTop: `1px solid ${borderColor}` }}
                >
                  <div className="flex items-center gap-2">
                    <LowVisionToggle accessibilitySettings={customization.accessibilitySettings} panelId={panel?.id} />
                    {setThemeMode && (
                      <motion.button
                        onClick={toggleThemeMode}
                        className="p-2 rounded-lg"
                        style={{ 
                          backgroundColor: `${primaryColor}15`,
                          color: textColor
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {themeMode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                      </motion.button>
                    )}
                  </div>
                  <Button 
                    asChild 
                    variant="outline" 
                    className="w-full"
                    style={{ borderColor, color: textColor }}
                  >
                    <Link to="/buyer/auth">Sign In</Link>
                  </Button>
                  <Button 
                    asChild 
                    className="w-full"
                    style={{ 
                      background: `linear-gradient(135deg, ${primaryColor}, ${customization.secondaryColor || primaryColor})`
                    }}
                  >
                    <Link to="/buyer/auth?mode=signup">Get Started</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};
