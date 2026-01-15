import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Menu, X, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LanguageSelector } from "@/components/buyer/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isHomepage = location.pathname === '/';
  const { t } = useLanguage();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

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
    <header role="banner" className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" aria-label="HOME OF SMM - Home" className="flex items-center space-x-2">
            <img 
              src="/favicon.ico" 
              alt="HOME OF SMM logo" 
              className="w-8 h-8 rounded-lg object-cover"
            />
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              HOME OF SMM
            </span>
          </Link>

          {/* Desktop Navigation (lg+) */}
          <nav aria-label="Main navigation" className="hidden lg:flex items-center space-x-8">
            <Link to="/features" aria-label="Features page" className="text-muted-foreground hover:text-foreground transition-colors">
              {t('platform.features')}
            </Link>
            <Link to="/pricing" aria-label="Pricing page" className="text-muted-foreground hover:text-foreground transition-colors">
              {t('platform.pricing')}
            </Link>
            <Link to="/docs" aria-label="Documentation" className="text-muted-foreground hover:text-foreground transition-colors">
              {t('platform.docs')}
            </Link>
            <Link to="/contact" aria-label="Contact page" className="text-muted-foreground hover:text-foreground transition-colors">
              {t('platform.contact')}
            </Link>
          </nav>

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
                <Button variant="destructive" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button asChild variant="ghost">
                  <Link to="/auth">{t('platform.signin')}</Link>
                </Button>
                <Button asChild className="bg-gradient-primary hover:shadow-glow">
                  <Link to="/auth">{t('platform.getstarted')}</Link>
                </Button>
              </div>
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
                <Link to="/auth">{t('platform.signin')}</Link>
              </Button>
            )}
            <button onClick={() => setIsOpen(!isOpen)} className="p-2">
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Header Icons */}
          <div className="md:hidden flex items-center gap-1.5">
            <LanguageSelector />
            <ThemeToggle />
            <button onClick={() => setIsOpen(!isOpen)} className="p-1.5">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-4">
              <Link to="/features" className="text-muted-foreground hover:text-foreground">
                Features
              </Link>
              <Link to="/pricing" className="text-muted-foreground hover:text-foreground">
                Pricing
              </Link>
              <Link to="/docs" className="text-muted-foreground hover:text-foreground">
                Documentation
              </Link>
              <Link to="/contact" className="text-muted-foreground hover:text-foreground">
                Contact
              </Link>
              <div className="flex flex-col space-y-2 pt-4">
                <ThemeToggle />
                {user ? (
                  <div className="space-y-2">
                    <div className="px-4 py-2 text-sm text-muted-foreground border-b">
                      {profile?.full_name || user.email}
                    </div>
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link to={getDashboardPath()}>Dashboard</Link>
                    </Button>
                    <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button asChild variant="ghost" className="w-full justify-start">
                      <Link to="/auth">Sign In</Link>
                    </Button>
                    <Button asChild className="bg-gradient-primary w-full justify-start">
                      <Link to="/auth">Get Started</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
