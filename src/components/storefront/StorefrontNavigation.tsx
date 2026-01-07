import { useState, useMemo, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, LogIn, Sun, Moon, LayoutDashboard, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useBuyerAuth } from "@/contexts/BuyerAuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/buyer/LanguageSelector";

interface StorefrontNavigationProps {
  panel?: any;
  customization?: any;
}

// Memoized nav link component
const NavLink = memo(({ link, index, textMuted, textColor, onClick }: { 
  link: { href: string; label: string; isRoute: boolean }; 
  index: number; 
  textMuted: string; 
  textColor: string;
  onClick: (link: { href: string; isRoute: boolean }) => void;
}) => (
  <motion.button 
    onClick={() => onClick(link)}
    className="text-sm font-medium transition-colors bg-transparent border-none cursor-pointer"
    style={{ color: textMuted }}
    whileHover={{ color: textColor, y: -2 }}
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
  >
    {link.label}
  </motion.button>
));
NavLink.displayName = 'NavLink';

export const StorefrontNavigation = memo(({ panel, customization = {} }: StorefrontNavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  
  // Get translations - wrapped in try/catch since it may not always be available
  let t = (key: string) => key;
  try {
    const lang = useLanguage();
    t = lang.t;
  } catch {
    // Not within LanguageProvider context
  }
  
  // Get buyer auth state - wrapped in try/catch since it may not always be available
  let buyer = null;
  let signOut: (() => void) | null = null;
  try {
    const auth = useBuyerAuth();
    buyer = auth.buyer;
    signOut = auth.signOut;
  } catch {
    // Not within BuyerAuthProvider context
  }
  
  // Memoize derived values
  const styles = useMemo(() => {
    const themeMode = customization.themeMode || 'dark';
    return {
      panelName: customization.companyName || panel?.name || 'SMM Panel',
      logoUrl: customization.logoUrl || panel?.logo_url,
      primaryColor: customization.primaryColor || '#6366F1',
      themeMode,
      textColor: customization.textColor || (themeMode === 'dark' ? '#FFFFFF' : '#1F2937'),
      textMuted: customization.textMuted || (themeMode === 'dark' ? '#A1A1AA' : '#4B5563'),
      surfaceColor: customization.surfaceColor || (themeMode === 'dark' ? '#12121F' : '#FFFFFF'),
      borderColor: customization.borderColor || (themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
    };
  }, [customization, panel]);

  const { panelName, logoUrl, primaryColor, themeMode, textColor, textMuted, surfaceColor, borderColor } = styles;
  const setThemeMode = customization.setThemeMode;
  // Show blog in menu if explicitly enabled via customization or if panel has blog_enabled
  const showBlogInMenu = customization.showBlogInMenu ?? panel?.blog_enabled ?? false;

  // Memoize navigation links with translations
  const navLinks = useMemo(() => {
    const baseNavLinks = [
      { href: "/services", label: t('storefront.nav.services'), isRoute: true },
      { href: "#features", label: t('storefront.nav.features'), isRoute: false },
      { href: "#testimonials", label: t('storefront.nav.reviews'), isRoute: false },
      { href: "#faq", label: t('storefront.nav.faq'), isRoute: false },
    ];
    return showBlogInMenu
      ? [...baseNavLinks, { href: "/blog", label: t('storefront.nav.blog'), isRoute: true }]
      : baseNavLinks;
  }, [showBlogInMenu, t]);

  const toggleThemeMode = useCallback(() => {
    if (setThemeMode) {
      setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
    }
  }, [setThemeMode, themeMode]);

  const handleNavClick = useCallback((link: { href: string; isRoute: boolean }) => {
    if (link.isRoute) {
      navigate(link.href);
    } else {
      const element = document.querySelector(link.href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsOpen(false);
  }, [navigate]);

  const handleSignOut = useCallback(() => {
    if (signOut) {
      signOut();
      navigate('/');
    }
  }, [signOut, navigate]);

  return (
    <motion.nav 
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl"
      style={{ 
        backgroundColor: themeMode === 'dark' ? `${surfaceColor}E6` : `${surfaceColor}F2`,
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
          <motion.img 
            src={logoUrl || '/default-panel-favicon.png'} 
            alt={panelName} 
            className="w-9 h-9 rounded-lg object-cover"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          />
            <span 
              className="text-xl font-bold bg-clip-text text-transparent"
              style={{ 
                backgroundImage: `linear-gradient(135deg, ${primaryColor}, ${customization.secondaryColor || primaryColor})`
              }}
            >
              {panelName}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link, index) => (
              <NavLink 
                key={link.href}
                link={link}
                index={index}
                textMuted={textMuted}
                textColor={textColor}
                onClick={handleNavClick}
              />
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Language Selector */}
            <LanguageSelector />
            
            {/* Theme Mode Toggle */}
            {setThemeMode && (
              <motion.button
                onClick={toggleThemeMode}
                className="p-2 rounded-lg transition-colors"
                style={{ 
                  backgroundColor: themeMode === 'dark' ? `${primaryColor}20` : `${primaryColor}15`,
                  color: textColor,
                  border: themeMode === 'light' ? '1px solid rgba(0,0,0,0.1)' : 'none'
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label={themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {themeMode === 'dark' ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </motion.button>
            )}
            
            {/* Auth buttons - show Dashboard if logged in */}
            {buyer ? (
              <>
                <Button 
                  asChild 
                  variant="ghost" 
                  size="sm" 
                  className={themeMode === 'light' ? 'hover:bg-gray-100' : ''}
                  style={{ color: textColor }}
                >
                  <Link to="/dashboard">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    {t('storefront.nav.dashboard')}
                  </Link>
                </Button>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={handleSignOut}
                    style={{ 
                      borderColor: themeMode === 'light' ? 'rgba(0,0,0,0.2)' : borderColor,
                      color: textColor 
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {t('storefront.nav.signOut')}
                  </Button>
                </motion.div>
              </>
            ) : (
              <>
                <Button 
                  asChild 
                  variant="ghost" 
                  size="sm" 
                  className={themeMode === 'light' ? 'hover:bg-gray-100' : ''}
                  style={{ color: textColor }}
                >
                  <Link to="/auth?tab=login">
                    <LogIn className="w-4 h-4 mr-2" />
                    {t('storefront.nav.signIn')}
                  </Link>
                </Button>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    asChild 
                    size="sm"
                    className="text-white"
                    style={{ 
                      background: `linear-gradient(135deg, ${primaryColor}, ${customization.secondaryColor || primaryColor})`,
                      boxShadow: `0 4px 20px ${primaryColor}40`
                    }}
                  >
                    <Link to="/auth?tab=signup">
                      {t('storefront.nav.getStarted')}
                    </Link>
                  </Button>
                </motion.div>
              </>
            )}
          </div>

          {/* Mobile Header Icons - VISIBLE BESIDE HAMBURGER */}
          <div className="md:hidden flex items-center gap-2">
            {/* Language Selector on Mobile */}
            <LanguageSelector />
            
            {setThemeMode && (
              <motion.button
                onClick={toggleThemeMode}
                className="p-2 rounded-lg"
                style={{ 
                  backgroundColor: themeMode === 'dark' ? `${primaryColor}20` : 'rgba(0,0,0,0.05)',
                  color: textColor,
                  border: themeMode === 'light' ? '1px solid rgba(0,0,0,0.15)' : 'none'
                }}
                whileTap={{ scale: 0.95 }}
                aria-label={themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {themeMode === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </motion.button>
            )}
            
            <motion.button
              className="p-2 rounded-lg bg-transparent border-none cursor-pointer"
              style={{ color: textColor }}
              onClick={() => setIsOpen(!isOpen)}
              whileTap={{ scale: 0.95 }}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
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
                  <motion.button 
                    key={link.href}
                    onClick={() => handleNavClick(link)}
                    className="text-left transition-colors bg-transparent border-none cursor-pointer py-2"
                    style={{ color: textMuted }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {link.label}
                  </motion.button>
                ))}
                <div 
                  className="flex flex-col space-y-3 pt-4" 
                  style={{ borderTop: `1px solid ${borderColor}` }}
                >
                  {setThemeMode && (
                    <motion.button
                      onClick={toggleThemeMode}
                      className="p-2 rounded-lg flex items-center gap-2 mb-2"
                      style={{ 
                        backgroundColor: themeMode === 'dark' ? `${primaryColor}20` : 'rgba(0,0,0,0.05)',
                        color: textColor,
                        border: themeMode === 'light' ? '1px solid rgba(0,0,0,0.1)' : 'none'
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {themeMode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                      <span className="text-sm">{themeMode === 'dark' ? 'Light' : 'Dark'}</span>
                    </motion.button>
                  )}
                  {/* Auth buttons - show Dashboard if logged in */}
                  {buyer ? (
                    <>
                      <Button 
                        asChild 
                        variant="outline" 
                        className={`w-full ${themeMode === 'light' ? 'bg-white hover:bg-gray-50' : ''}`}
                        style={{ 
                          borderColor: themeMode === 'light' ? 'rgba(0,0,0,0.2)' : borderColor, 
                          color: textColor 
                        }}
                      >
                        <Link to="/dashboard">
                          <LayoutDashboard className="w-4 h-4 mr-2" />
                          {t('storefront.nav.dashboard')}
                        </Link>
                      </Button>
                      <Button 
                        onClick={handleSignOut}
                        className="w-full text-white"
                        style={{ 
                          background: `linear-gradient(135deg, ${primaryColor}, ${customization.secondaryColor || primaryColor})`
                        }}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        {t('storefront.nav.signOut')}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        asChild 
                        variant="outline" 
                        className={`w-full ${themeMode === 'light' ? 'bg-white hover:bg-gray-50' : ''}`}
                        style={{ 
                          borderColor: themeMode === 'light' ? 'rgba(0,0,0,0.2)' : borderColor, 
                          color: textColor 
                        }}
                      >
                        <Link to="/auth?tab=login">{t('storefront.nav.signIn')}</Link>
                      </Button>
                      <Button 
                        asChild 
                        className="w-full text-white"
                        style={{ 
                          background: `linear-gradient(135deg, ${primaryColor}, ${customization.secondaryColor || primaryColor})`
                        }}
                      >
                        <Link to="/auth?tab=signup">{t('storefront.nav.getStarted')}</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
});
StorefrontNavigation.displayName = 'StorefrontNavigation';
