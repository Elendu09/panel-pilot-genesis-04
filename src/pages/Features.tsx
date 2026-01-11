import { useState, useMemo, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { 
  Search,
  Users,
  Package,
  CreditCard,
  Settings,
  Palette,
  BarChart3,
  Shield,
  Server,
  Puzzle,
  FileText,
  Layers,
  ChevronDown,
  ChevronUp,
  List,
  ArrowUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

// Feature categories with all features
const featureCategories = [
  {
    id: "user-panel",
    title: "User Panel",
    icon: Users,
    features: [
      { title: "Mass Orders", description: "Let users set up mass orders for bulk delivery to save time." },
      { title: "User API", description: "Methods that allow your resellers to work with your panel via API." },
      { title: "Multi-currency", description: "Display service rates, user balance, and order charges based on selected currency." },
      { title: "Multi-language", description: "An optional multilingual interface that adapts to users' language preferences." },
      { title: "Language Packs", description: "Ready-made panel translations: Turkish, Portuguese, Korean, Russian, Arabic, etc." },
      { title: "RTL Support", description: "Right-to-left support for languages like Arabic, Hebrew, etc." },
      { title: "Order History", description: "Users can keep track of all their orders in one place." },
      { title: "Deposit History", description: "Shows users information on adding funds to their accounts." },
      { title: "Mobile-friendly", description: "Panels can be easily accessed and used on mobile devices." },
      { title: "Time Zone Setup", description: "Allows changing time zone settings on your panel." },
      { title: "Password Reset", description: "Lets users restore forgotten passwords." },
      { title: "Two-factor Auth", description: "Optional email-based two-factor authentication for user accounts." },
      { title: "User Notifications", description: "Communicate important information to panel users." },
      { title: "Ticket System", description: "Users can communicate with panel admins via support tickets." },
    ]
  },
  {
    id: "services",
    title: "Services",
    icon: Package,
    features: [
      { title: "Various Types", description: "The platform helps panel admins sell a great variety of services." },
      { title: "Service Descriptions", description: "Help users quickly get familiar with all services." },
      { title: "Service Categories", description: "Create categories to keep all services neatly organized." },
      { title: "Subscriptions", description: "Auto orders for likes, views, etc. on new posts." },
      { title: "Refill", description: "An order refill can be performed by a provider or manually." },
      { title: "Import from Providers", description: "Quickly import services from providers that use the platform." },
      { title: "Sync with Providers", description: "Sync rates, min & max limits, statuses with providers." },
      { title: "Mass Edit Rates", description: "Mass set service rates in percent or set new rates for services." },
      { title: "Drip-feed", description: "Divide one order into multiple intervals to build engagement gradually." },
      { title: "Cancel Services", description: "Easily cancel services you don't plan to offer anymore." },
      { title: "Bulk Actions", description: "Perform various actions related to user, order, and service management in bulk." },
      { title: "Auto Complete", description: "The system automatically changes the order status once complete." },
    ]
  },
  {
    id: "accept-payments",
    title: "Accept Payments",
    icon: CreditCard,
    features: [
      { title: "150+ Payment Methods", description: "Many already integrated payment methods with new ones added constantly." },
      { title: "Method Instructions", description: "Add multilingual instructions for each payment method." },
      { title: "Extra Fee", description: "Set an additional fee for selected methods when adding funds." },
      { title: "Currency Conversion", description: "Payment options available for conversion from other currencies." },
      { title: "Min & Max Amounts", description: "Set the min & max payment amounts for each method." },
      { title: "Payment Bonuses", description: "Reward customers for using certain payment methods." },
      { title: "Manage Payments", description: "Add payments manually and cut balances when needed." },
      { title: "Export Payments", description: "Export payment data in CSV format with customizable columns." },
    ]
  },
  {
    id: "order-processing",
    title: "Order Processing",
    icon: Layers,
    features: [
      { title: "Unlimited Providers", description: "Connect as many providers as you want without extra charges." },
      { title: "Provider Balance Check", description: "Check all your providers' balances in one place." },
      { title: "Auto & Manual Modes", description: "Connect APIs for automated processing or manage orders manually." },
      { title: "Export Orders", description: "Export order data in CSV format with customizable columns." },
      { title: "Resend Orders", description: "The option to resend an order is always available." },
      { title: "Cancel & Refund", description: "Cancel specific orders anytime and give refunds." },
      { title: "Status Change", description: "Change order statuses manually whenever needed." },
      { title: "Admin API", description: "Integrate other products and services into panels and automate tasks." },
      { title: "Drip-feed Management", description: "Change status or cancel and refund for drip-feeds." },
    ]
  },
  {
    id: "user-management",
    title: "User Management",
    icon: Settings,
    features: [
      { title: "Create Accounts", description: "Users register automatically or admins can create accounts manually." },
      { title: "Custom Rates", description: "Easily set up custom rates for each user." },
      { title: "Copy Rates", description: "Copy rates from one user to another or to multiple users at once." },
      { title: "Amount Spent", description: "Monitor how much users spend on your panel." },
      { title: "User Discount", description: "Set a personal discount on all panel services for each user." },
      { title: "Suspend Users", description: "Suspend users on your panel in a few clicks." },
      { title: "Export Users", description: "Export user data in CSV format with customizable columns." },
      { title: "Access Rules", description: "Edit panel access rules and actions users are allowed to perform." },
      { title: "Email Confirmation", description: "Enable mandatory email address confirmation after signing up." },
    ]
  },
  {
    id: "theme-editor",
    title: "Visual Theme Editor",
    icon: Palette,
    features: [
      { title: "Create Pages", description: "Create public & internal pages with customizable blocks." },
      { title: "Block Types", description: "A variety of block types (media, text, etc) for different purposes." },
      { title: "Block Styles", description: "Edit block styles and components to transform your panel's look." },
      { title: "Block Background", description: "Set gradients, images, or patterns as block backgrounds." },
      { title: "Menu Items", description: "Create custom menu sections with items from scratch." },
      { title: "Color Palette", description: "Apply one of the pre-made color palettes or create your own." },
      { title: "Custom CSS", description: "Apply custom CSS to fine-tune your panel's appearance." },
      { title: "Font Picker", description: "Select from a variety of fonts for your panel." },
      { title: "Logo & Favicon", description: "Upload your own logo and favicon for branding." },
    ]
  },
  {
    id: "seo",
    title: "SEO",
    icon: FileText,
    features: [
      { title: "Metadata", description: "Set meta titles and descriptions for your panel pages." },
      { title: "Sitemap.xml", description: "Auto-generated sitemap for better search engine indexing." },
      { title: "Robots.txt", description: "Customize your robots.txt file for crawler instructions." },
      { title: "Google Analytics", description: "Integrate Google Analytics for traffic insights." },
      { title: "Blog System", description: "Create and manage blog posts to boost SEO." },
      { title: "Custom URLs", description: "Set custom URLs for pages to improve SEO." },
    ]
  },
  {
    id: "reports",
    title: "Reports",
    icon: BarChart3,
    features: [
      { title: "Payment Reports", description: "Detailed reports on all payment transactions." },
      { title: "Order Reports", description: "Comprehensive analytics on orders placed." },
      { title: "Profit Reports", description: "Track your profits and revenue over time." },
      { title: "User Statistics", description: "Insights on user activity and registrations." },
      { title: "Export Data", description: "Export all reports in CSV format for analysis." },
    ]
  },
  {
    id: "admin-options",
    title: "Admin Options",
    icon: Shield,
    features: [
      { title: "Help Center", description: "Built-in help documentation for panel admins." },
      { title: "Notifications", description: "System notifications for important events." },
      { title: "Activity Log", description: "Track all admin and user activities." },
      { title: "Dark Mode", description: "Toggle between light and dark themes." },
      { title: "Maintenance Mode", description: "Put your panel in maintenance mode when needed." },
      { title: "Team Members", description: "Add team members with different permission levels." },
    ]
  },
  {
    id: "hosting",
    title: "Hosting",
    icon: Server,
    features: [
      { title: "CDN", description: "Content delivery network for faster global access." },
      { title: "Unlimited Bandwidth", description: "No limits on data transfer for your panel." },
      { title: "DDoS Protection", description: "Protection against distributed denial-of-service attacks." },
      { title: "Free SSL", description: "Automatic SSL certificates for secure connections." },
      { title: "Custom Domain", description: "Connect your own domain to your panel." },
      { title: "Automatic Backups", description: "Regular backups of your panel data." },
      { title: "99.9% Uptime", description: "Reliable hosting with maximum uptime guarantee." },
    ]
  },
  {
    id: "integrations",
    title: "Integrations",
    icon: Puzzle,
    features: [
      { title: "Google Analytics", description: "Track visitor behavior and traffic sources." },
      { title: "Google Tag Manager", description: "Manage marketing tags without code changes." },
      { title: "Live Chat Widgets", description: "Integrate popular live chat solutions." },
      { title: "Push Notifications", description: "Send push notifications to users." },
      { title: "Webhook Support", description: "Send event notifications to external services." },
      { title: "Social Login", description: "Allow users to sign in with social accounts." },
    ]
  },
];

export default function Features() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("user-panel");
  const [isMobileTocOpen, setIsMobileTocOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  // Track scroll position for scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Filter features based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return featureCategories;
    
    const query = searchQuery.toLowerCase();
    return featureCategories.map(category => ({
      ...category,
      features: category.features.filter(
        feature =>
          feature.title.toLowerCase().includes(query) ||
          feature.description.toLowerCase().includes(query)
      )
    })).filter(category => category.features.length > 0);
  }, [searchQuery]);

  // IntersectionObserver for accurate active section tracking
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    featureCategories.forEach(cat => {
      const element = document.getElementById(cat.id);
      if (element) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setActiveSection(cat.id);
              }
            });
          },
          {
            rootMargin: '-100px 0px -60% 0px',
            threshold: 0,
          }
        );
        observer.observe(element);
        observers.push(observer);
      }
    });

    return () => {
      observers.forEach(obs => obs.disconnect());
    };
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const y = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: y, behavior: "smooth" });
      setIsMobileTocOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background bg-grid-stroke">
      <Helmet>
        <title>Features - HOME OF SMM | Complete SMM Panel Features</title>
        <meta name="description" content="Explore all features of HOME OF SMM platform. User panel, services, payments, order processing, theme editor, SEO, reports, and more." />
      </Helmet>
      
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-8 border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {t('features.page.title')}
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              {t('features.page.subtitle')}
            </p>
            
            {/* Search */}
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t('features.page.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base bg-muted/50 border-border/50"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mobile TOC */}
      <div className="lg:hidden sticky top-16 z-30 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            className="w-full justify-between py-4 h-auto"
            onClick={() => setIsMobileTocOpen(!isMobileTocOpen)}
          >
            <span className="flex items-center gap-2 font-medium">
              <List className="w-4 h-4" />
              {t('features.page.toc')}
            </span>
            {isMobileTocOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
          
          <motion.div
            initial={false}
            animate={{ height: isMobileTocOpen ? "auto" : 0, opacity: isMobileTocOpen ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <nav className="pb-4 space-y-1">
              {featureCategories.map((category, index) => {
                const isActive = activeSection === category.id;
                const hasResults = filteredCategories.some(c => c.id === category.id);
                
                return (
                  <button
                    key={category.id}
                    onClick={() => scrollToSection(category.id)}
                    disabled={!hasResults}
                    className={cn(
                      "w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all flex items-center gap-2",
                      isActive 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                      !hasResults && "opacity-40 cursor-not-allowed"
                    )}
                  >
                    <span className="text-xs text-muted-foreground/70 w-5">{index + 1}.</span>
                    {category.title}
                  </button>
                );
              })}
            </nav>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex gap-12">
          {/* Feature List */}
          <div className="flex-1 max-w-4xl">
            {filteredCategories.map((category) => (
              <section 
                key={category.id} 
                id={category.id} 
                className="mb-16 scroll-mt-header"
              >
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <category.icon className="h-6 w-6 text-primary" />
                  {category.title}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      whileTap={{ scale: 0.97 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.3, delay: index * 0.03 }}
                      className="p-5 rounded-xl bg-muted/30 hover:bg-muted/50 active:bg-muted/70 active:ring-2 active:ring-primary/30 transition-all cursor-pointer border border-border/30 feature-card-stroke"
                    >
                      <h3 className="font-semibold text-foreground mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </section>
            ))}

            {filteredCategories.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">
                  {t('features.page.noResults')} "{searchQuery}"
                </p>
              </div>
            )}
          </div>

          {/* Sticky Sidebar Navigation - Desktop */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <nav className="sticky top-24 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                <List className="w-4 h-4" />
                {t('features.page.toc')}
              </h3>
              <ul className="space-y-0.5 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                {featureCategories.map((category, index) => {
                  const isActive = activeSection === category.id;
                  const hasResults = filteredCategories.some(c => c.id === category.id);
                  
                  return (
                    <li key={category.id}>
                      <button
                        onClick={() => scrollToSection(category.id)}
                        disabled={!hasResults}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                          isActive 
                            ? "text-primary bg-primary/10 border-l-2 border-primary" 
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                          !hasResults && "opacity-40 cursor-not-allowed"
                        )}
                      >
                        <span className="text-xs text-muted-foreground/70 w-4">{index + 1}.</span>
                        {category.title}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={scrollToTop}
              size="icon"
              className="h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90"
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}