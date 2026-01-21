import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Zap, Code, Link2, Settings, AlertTriangle, ChevronRight,
  BookOpen
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const categories = [
  {
    name: "Getting Started",
    slug: "getting-started",
    icon: Zap,
    articles: [
      { title: "Quick Start Guide", slug: "quick-start" },
      { title: "Creating Your First Panel", slug: "creating-panel" },
      { title: "Connecting Providers", slug: "connecting-providers" },
      { title: "Payment Setup", slug: "payment-setup" },
      { title: "Customizing Storefront", slug: "customizing-storefront" },
    ]
  },
  {
    name: "API Reference",
    slug: "api",
    icon: Code,
    articles: [
      { title: "API Overview", slug: "api-overview" },
      { title: "Services Endpoint", slug: "services-endpoint" },
      { title: "Orders Endpoint", slug: "orders-endpoint" },
      { title: "Balance Endpoint", slug: "balance-endpoint" },
      { title: "Webhooks Guide", slug: "webhooks-guide" },
      { title: "Error Reference", slug: "api-errors" },
    ]
  },
  {
    name: "Integration",
    slug: "integration",
    icon: Link2,
    articles: [
      { title: "Provider Integration", slug: "provider-integration" },
      { title: "Payment Gateways", slug: "payment-gateway-integration" },
      { title: "Custom Domain", slug: "custom-domain" },
      { title: "Webhook Configuration", slug: "webhook-configuration" },
    ]
  },
  {
    name: "Configuration",
    slug: "configuration",
    icon: Settings,
    articles: [
      { title: "Panel Settings", slug: "panel-settings" },
      { title: "Pricing & Markup", slug: "pricing-services" },
      { title: "SEO Configuration", slug: "seo-configuration" },
      { title: "Email Notifications", slug: "email-notifications" },
    ]
  },
  {
    name: "Troubleshooting",
    slug: "troubleshooting",
    icon: AlertTriangle,
    articles: [
      { title: "Common Issues", slug: "common-issues" },
      { title: "FAQ", slug: "faq" },
      { title: "Contact Support", slug: "contact-support" },
    ]
  },
];

export function DocsSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <aside className="hidden lg:block w-64 shrink-0">
      <div className="sticky top-24">
        <ScrollArea className="h-[calc(100vh-120px)] pr-4">
          <nav className="space-y-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <div key={category.slug}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-sm">{category.name}</span>
                  </div>
                  <ul className="space-y-1 ml-6 border-l border-border">
                    {category.articles.map((article) => {
                      const href = `/docs/${category.slug}/${article.slug}`;
                      const isActive = currentPath === href;
                      return (
                        <li key={article.slug}>
                          <Link
                            to={href}
                            className={cn(
                              "block py-1.5 px-3 text-sm transition-colors -ml-px border-l-2",
                              isActive
                                ? "border-primary text-primary font-medium"
                                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                            )}
                          >
                            {article.title}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </nav>
        </ScrollArea>
      </div>
    </aside>
  );
}

export { categories };
