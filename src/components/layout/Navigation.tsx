import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Menu, X, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LanguageSelector } from "@/components/buyer/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const isHomepage = location.pathname === '/';
  const { t } = useLanguage();

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
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <nav className="container mx-auto px-4" aria-label="Main navigation">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2" aria-label="HOME OF SMM - Go to homepage">
            <img 
              src="/favicon.ico" 
              alt="HOME OF SMM Logo - SMM Panel Platform" 
              className="w-8 h-8 rounded-lg object-cover"
              width="32"
              height="32"
            />
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              HOME OF SMM
            </span>
          </Link>

          {/* Desktop Navigation (lg+) */}
          <ul className="hidden lg:flex items-center space-x-8 list-none" role="menubar">
            <li role="none">
              <Link to="/features" className="text-muted-foreground hover:text-foreground transition-colors" role="menuitem">
                {t('platform.features')}
              </Link>
            </li>
            <li role="none">
              <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors" role="menuitem">
                {t('platform.pricing')}
              </Link>
            </li>
            <li role="none">
              <Link to="/docs" className="text-muted-foreground hover:text-foreground transition-colors" role="menuitem">
                {t('platform.docs')}
              </Link>
            </li>
            <li role="none">
              <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors" role="menuitem">
                {t('platform.contact')}
              </Link>
            </li>
          </ul>

          {/* Desktop Actions (lg+) */}
          <div className="hidden lg:flex items-center gap-3">
            <LanguageSelector />
            <ThemeToggle />
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-muted-foreground truncate max-w-[150px]">
                  {profile?.full_name || user.email?.split('@')[0]}
                </span>
                <Button asChild variant="outline" size="sm">
                  <Link to={getDashboardPath()}>Dashboard</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to="/services">Service Tools</Link>
                </Button>
                <Button variant="destructive" size="sm" onClick={signOut} aria-label="Sign out of your account">
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>
            ) : (
              <ul className="flex items-center space-x-2 list-none">
                <li>
                  <Button asChild variant="ghost">
                    <Link to="/auth" aria-label="Sign in to your account">{t('platform.signin')}</Link>
                  </Button>
                </li>
                <li>
                  <Button asChild className="bg-gradient-primary hover:shadow-glow">
                    <Link to="/auth" aria-label="Get started with HOME OF SMM - Create your SMM panel">{t('platform.getstarted')}</Link>
                  </Button>
                </li>
              </ul>
            )}
          </div>

          {/* Tablet Navigation (md to lg) */}
          <div className="hidden md:flex lg:hidden items-center gap-2">
            <LanguageSelector />
            <ThemeToggle />
            {user ? (
              <Button asChild variant="outline" size="sm">
                <Link to={getDashboardPath()}>Dashboard</Link>
              </Button>
            ) : (
              <Button asChild size="sm" className="bg-gradient-primary">
                <Link to="/auth" aria-label="Sign in to your account">{t('platform.signin')}</Link>
              </Button>
            )}
            <button onClick={() => setIsOpen(!isOpen)} className="p-2" aria-label={isOpen ? "Close menu" : "Open menu"} aria-expanded={isOpen}>
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Header Icons */}
          <div className="md:hidden flex items-center gap-1.5">
            <LanguageSelector />
            <ThemeToggle />
            <button onClick={() => setIsOpen(!isOpen)} className="p-1.5" aria-label={isOpen ? "Close menu" : "Open menu"} aria-expanded={isOpen}>
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <ul className="flex flex-col space-y-4 list-none">
              <li>
                <Link to="/features" className="text-muted-foreground hover:text-foreground block">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-muted-foreground hover:text-foreground block">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/docs" className="text-muted-foreground hover:text-foreground block">
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-foreground block">
                  Contact
                </Link>
              </li>
            </ul>
            <div className="flex flex-col space-y-2 pt-4 mt-4 border-t border-border">
              <ThemeToggle />
              {user ? (
                <div className="space-y-2">
                  <div className="px-4 py-2 text-sm text-muted-foreground border-b">
                    {profile?.full_name || user.email}
                  </div>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link to={getDashboardPath()}>Dashboard</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link to="/services">Service Tools</Link>
                  </Button>
                  <Button variant="ghost" onClick={signOut} className="w-full justify-start">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <ul className="space-y-2 list-none">
                  <li>
                    <Button asChild variant="ghost" className="w-full justify-start">
                      <Link to="/auth">Sign In</Link>
                    </Button>
                  </li>
                  <li>
                    <Button asChild className="bg-gradient-primary w-full justify-start">
                      <Link to="/auth">Get Started</Link>
                    </Button>
                  </li>
                </ul>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};