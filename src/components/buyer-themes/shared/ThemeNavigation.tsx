import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon, LayoutDashboard, LogOut, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BuyerAuthContext } from '@/contexts/BuyerAuthContext';
import { LanguageSelector } from '@/components/buyer/LanguageSelector';

interface ThemeNavigationProps {
  companyName: string;
  logoUrl?: string;
  logoIcon: React.ReactNode;
  defaultIcon?: React.ReactNode;
  showBlogInMenu?: boolean;
  themeMode?: 'light' | 'dark';
  onThemeModeChange?: (mode: 'light' | 'dark') => void;
  containerMax?: number;
  mutedColor?: string;
  primaryColor?: string;
  textColor?: string;
  surfaceColor?: string;
  bgColor?: string;
  navStyle?: 'default' | 'terminal' | 'floating' | 'neon';
  primaryButtonStyle?: React.CSSProperties;
  loginLabel?: string;
  signupLabel?: string;
  navLinks?: { label: string; to: string }[];
}

export const ThemeNavigation = ({
  companyName,
  logoUrl,
  logoIcon,
  defaultIcon,
  showBlogInMenu = false,
  themeMode = 'dark',
  onThemeModeChange,
  containerMax = 1280,
  mutedColor = '#9CA3AF',
  primaryColor = '#6366F1',
  textColor = '#FFFFFF',
  surfaceColor = '#1A1A1A',
  bgColor = '#0A0A0A',
  navStyle = 'default',
  primaryButtonStyle = {},
  loginLabel = 'Login',
  signupLabel = 'Sign Up',
  navLinks,
}: ThemeNavigationProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  // Try to get buyer auth context - may not be available in preview mode
  const buyerAuthContext = useContext(BuyerAuthContext);
  const buyer = buyerAuthContext?.buyer || null;
  const signOut = buyerAuthContext?.signOut;
  
  const isLight = themeMode === 'light';
  
  const defaultLinks = [
    { label: navStyle === 'terminal' ? './services' : 'Services', to: '/services' },
    { label: navStyle === 'terminal' ? './orders' : 'Orders', to: '/orders' },
    ...(showBlogInMenu ? [{ label: navStyle === 'terminal' ? './blog' : 'Blog', to: '/blog' }] : []),
    { label: navStyle === 'terminal' ? './support' : 'Support', to: '/support' },
  ];
  
  const links = navLinks || defaultLinks;

  const toggleTheme = () => {
    onThemeModeChange?.(isLight ? 'dark' : 'light');
  };

  const handleSignOut = () => {
    signOut?.();
    navigate('/');
  };

  const navBgStyle = navStyle === 'floating' 
    ? { backgroundColor: surfaceColor, borderRadius: '0 0 1rem 1rem', margin: '0.5rem 1rem 0' }
    : navStyle === 'terminal'
    ? { backgroundColor: 'transparent', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${primaryColor}33` }
    : navStyle === 'neon'
    ? { backgroundColor: 'transparent', borderBottom: `1px solid ${primaryColor}33` }
    : { backgroundColor: surfaceColor };

  return (
    <header>
      <nav 
        className={cn(
          "relative z-50",
          navStyle === 'floating' ? 'shadow-sm' : '',
          navStyle === 'terminal' ? 'backdrop-blur-xl' : ''
        )}
        style={navBgStyle}
        aria-label="Main navigation"
      >
        <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: containerMax }}>
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3" aria-label={`${companyName} home`}>
              {logoUrl ? (
                <img src={logoUrl} alt={companyName} className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl object-contain" loading="eager" />
              ) : (
                defaultIcon || logoIcon
              )}
              <span 
                className={cn(
                  "text-lg sm:text-xl font-bold truncate max-w-[120px] sm:max-w-none",
                  navStyle === 'terminal' ? 'font-mono' : '',
                  navStyle === 'neon' ? 'uppercase tracking-wider' : ''
                )}
                style={{ color: navStyle === 'terminal' ? primaryColor : textColor }}
              >
                {navStyle === 'terminal' ? `[${companyName}]` : companyName}
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              {links.map((link) => (
                <Link 
                  key={link.to}
                  to={link.to} 
                  className={cn(
                    "text-sm transition-colors font-medium hover:opacity-80",
                    navStyle === 'terminal' ? 'font-mono' : '',
                    navStyle === 'neon' ? 'uppercase tracking-wider font-bold' : ''
                  )}
                  style={{ color: mutedColor }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-2 sm:gap-3">
              {/* Language Selector */}
              <LanguageSelector />
              
              {/* Theme Toggle */}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={toggleTheme}
                className="hover:bg-white/10"
                aria-label={`Switch to ${isLight ? 'dark' : 'light'} mode`}
              >
                {isLight ? (
                  <Moon className="w-5 h-5" style={{ color: mutedColor }} />
                ) : (
                  <Sun className="w-5 h-5" style={{ color: mutedColor }} />
                )}
              </Button>
              
              {buyer ? (
                // Logged-in user: Show Dashboard & Sign Out
                <>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    asChild 
                    className={cn(
                      "font-medium hover:bg-white/10",
                      navStyle === 'terminal' ? 'font-mono' : '',
                      navStyle === 'neon' ? 'uppercase font-bold' : ''
                    )}
                    style={{ color: textColor }}
                  >
                    <Link to="/dashboard" className="flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4" />
                      {navStyle === 'terminal' ? '> dashboard' : 'Dashboard'}
                    </Link>
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleSignOut}
                    className={cn(
                      "font-semibold shadow-lg hover:opacity-90",
                      navStyle === 'terminal' ? 'font-mono font-bold' : '',
                      navStyle === 'neon' ? 'uppercase font-black' : ''
                    )}
                    style={{ ...primaryButtonStyle, color: navStyle === 'terminal' ? bgColor : 'white' }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {navStyle === 'terminal' ? '> logout' : 'Sign Out'}
                  </Button>
                </>
              ) : (
                // Not logged in: Show Login & Sign Up
                <>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    asChild 
                    className={cn(
                      "font-medium hover:bg-white/10",
                      navStyle === 'terminal' ? 'font-mono' : '',
                      navStyle === 'neon' ? 'uppercase font-bold' : ''
                    )}
                    style={{ color: textColor }}
                  >
                    <Link to="/auth">
                      {navStyle === 'terminal' ? '> login' : loginLabel}
                    </Link>
                  </Button>
                  <Button 
                    size="sm" 
                    asChild 
                    className={cn(
                      "font-semibold shadow-lg hover:opacity-90",
                      navStyle === 'terminal' ? 'font-mono font-bold' : '',
                      navStyle === 'neon' ? 'uppercase font-black' : ''
                    )}
                    style={{ ...primaryButtonStyle, color: navStyle === 'terminal' ? bgColor : 'white' }}
                  >
                    <Link to="/auth?tab=signup">
                      {navStyle === 'terminal' ? '> register' : signupLabel}
                    </Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              {/* Mobile Language Selector */}
              <LanguageSelector />
              
              {/* Mobile Theme Toggle */}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={toggleTheme}
                className="hover:bg-white/10"
                aria-label={`Switch to ${isLight ? 'dark' : 'light'} mode`}
              >
                {isLight ? (
                  <Moon className="w-5 h-5" style={{ color: mutedColor }} />
                ) : (
                  <Sun className="w-5 h-5" style={{ color: mutedColor }} />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                className="hover:bg-white/10"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" style={{ color: textColor }} />
                ) : (
                  <Menu className="w-6 h-6" style={{ color: textColor }} />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden"
              style={{ backgroundColor: surfaceColor, borderTop: `1px solid ${primaryColor}1a` }}
            >
              <div className="px-4 py-4 space-y-2">
                {links.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "block py-3 px-4 rounded-lg text-sm font-medium transition-colors hover:bg-white/5",
                      navStyle === 'terminal' ? 'font-mono' : '',
                      navStyle === 'neon' ? 'uppercase tracking-wider font-bold' : ''
                    )}
                    style={{ color: mutedColor }}
                  >
                    {link.label}
                  </Link>
                ))}
                
                <div className="pt-4 border-t space-y-2" style={{ borderColor: `${primaryColor}1a` }}>
                  {buyer ? (
                    // Logged-in user mobile buttons
                    <>
                      <Button 
                        variant="ghost" 
                        asChild 
                        className={cn(
                          "w-full justify-center font-medium",
                          navStyle === 'terminal' ? 'font-mono' : '',
                          navStyle === 'neon' ? 'uppercase font-bold' : ''
                        )}
                        style={{ color: textColor }}
                      >
                        <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                          <LayoutDashboard className="w-4 h-4" />
                          {navStyle === 'terminal' ? '> dashboard' : 'Dashboard'}
                        </Link>
                      </Button>
                      <Button 
                        onClick={() => {
                          handleSignOut();
                          setMobileMenuOpen(false);
                        }}
                        className={cn(
                          "w-full justify-center font-semibold shadow-lg",
                          navStyle === 'terminal' ? 'font-mono font-bold' : '',
                          navStyle === 'neon' ? 'uppercase font-black' : ''
                        )}
                        style={{ ...primaryButtonStyle, color: navStyle === 'terminal' ? bgColor : 'white' }}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        {navStyle === 'terminal' ? '> logout' : 'Sign Out'}
                      </Button>
                    </>
                  ) : (
                    // Not logged in mobile buttons
                    <>
                      <Button 
                        variant="ghost" 
                        asChild 
                        className={cn(
                          "w-full justify-center font-medium",
                          navStyle === 'terminal' ? 'font-mono' : '',
                          navStyle === 'neon' ? 'uppercase font-bold' : ''
                        )}
                        style={{ color: textColor }}
                      >
                        <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                          {navStyle === 'terminal' ? '> login' : loginLabel}
                        </Link>
                      </Button>
                      <Button 
                        asChild 
                        className={cn(
                          "w-full justify-center font-semibold shadow-lg",
                          navStyle === 'terminal' ? 'font-mono font-bold' : '',
                          navStyle === 'neon' ? 'uppercase font-black' : ''
                        )}
                        style={{ ...primaryButtonStyle, color: navStyle === 'terminal' ? bgColor : 'white' }}
                      >
                        <Link to="/auth?tab=signup" onClick={() => setMobileMenuOpen(false)}>
                          {navStyle === 'terminal' ? '> register' : signupLabel}
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

export default ThemeNavigation;