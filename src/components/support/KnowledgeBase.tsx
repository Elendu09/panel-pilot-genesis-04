import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Search, 
  Book, 
  HelpCircle, 
  Zap, 
  CreditCard, 
  Globe, 
  Shield, 
  Settings,
  ChevronRight
} from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

interface KnowledgeCategory {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  faqs: FAQItem[];
}

const knowledgeCategories: KnowledgeCategory[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: Zap,
    color: "text-blue-500 bg-blue-500/10",
    faqs: [
      {
        question: "How do I set up my SMM panel?",
        answer: "After creating your account, the platform guides you through a 6-step onboarding wizard: name your panel, choose a plan, complete payment, connect a provider, set up your domain, and configure branding. Each step can also be completed later from your dashboard."
      },
      {
        question: "How do I connect a provider API?",
        answer: "During onboarding (step 5) or from Provider Management in your dashboard, click 'Add Provider', enter your provider's API URL and API key. The system verifies the connection and syncs available services automatically."
      },
      {
        question: "What's the difference between provider and panel prices?",
        answer: "Provider price is what you pay to the upstream provider for each service. Panel price is what you charge your customers. The difference is your profit margin. You can set custom markup when importing services."
      }
    ]
  },
  {
    id: "payments",
    title: "Payments & Billing",
    icon: CreditCard,
    color: "text-emerald-500 bg-emerald-500/10",
    faqs: [
      {
        question: "What payment methods are supported?",
        answer: "We support 200+ payment systems including PayPal, Stripe, Paystack, Korapay, Flutterwave, PerfectMoney, Cryptomus, USDT, and bank transfers for multiple countries."
      },
      {
        question: "How do commissions work?",
        answer: "The platform charges a small commission (default 5%) on completed orders. You only pay when you earn - zero fees if you have no income."
      },
      {
        question: "When do I receive payouts?",
        answer: "Payouts are processed automatically based on your configured payment schedule. You can view pending payouts in your Billing section."
      }
    ]
  },
  {
    id: "domains",
    title: "Custom Domains",
    icon: Globe,
    color: "text-violet-500 bg-violet-500/10",
    faqs: [
      {
        question: "How do I connect my own domain?",
        answer: "Go to Domain Settings, enter your domain, and follow the DNS configuration instructions. You'll need to add CNAME records pointing to our servers. SSL certificates are automatically provisioned."
      },
      {
        question: "How long does DNS propagation take?",
        answer: "DNS changes typically propagate within 24-48 hours, though most changes reflect within a few hours. Use the 'Verify DNS' button to check status."
      },
      {
        question: "Can I use a subdomain instead of a full domain?",
        answer: "Yes! You can use either a custom subdomain (shop.yourdomain.com) or a full domain (yourdomain.com). Both are fully supported."
      }
    ]
  },
  {
    id: "security",
    title: "Security & Account",
    icon: Shield,
    color: "text-amber-500 bg-amber-500/10",
    faqs: [
      {
        question: "How do I enable two-factor authentication?",
        answer: "Go to Security Settings and enable 2FA. You'll need an authenticator app like Google Authenticator or Authy to set it up."
      },
      {
        question: "What should I do if I suspect unauthorized access?",
        answer: "Immediately change your password, enable 2FA if not already active, and review your recent activity in the Audit Logs. Contact support if you notice suspicious activity."
      },
      {
        question: "How is my data protected?",
        answer: "We use industry-standard encryption for all data at rest and in transit. API keys are encrypted and never displayed in full. Regular security audits ensure ongoing protection."
      }
    ]
  },
  {
    id: "orders",
    title: "Orders & Services",
    icon: Settings,
    color: "text-pink-500 bg-pink-500/10",
    faqs: [
      {
        question: "What happens if an order fails?",
        answer: "Failed orders are automatically refunded to the customer's balance. You can also manually refund orders from the Order Management page."
      },
      {
        question: "Can I set custom prices for services?",
        answer: "Yes! Each service can have its own custom price. You can also use the Pricing Optimizer tool to automatically suggest optimal pricing based on market rates."
      },
      {
        question: "How do I track order progress?",
        answer: "Orders sync with provider status automatically. View real-time progress in Order Management. Customers can also track their orders on your storefront."
      }
    ]
  },
  {
    id: "multi-panel",
    title: "Multi-Panel & Scaling",
    icon: Zap,
    color: "text-indigo-500 bg-indigo-500/10",
    faqs: [
      {
        question: "Can I run multiple panels?",
        answer: "Yes! You can create and manage multiple panels from a single dashboard. Each panel has its own storefront, domain, branding, services, and customer base. Use the panel switcher in your dashboard to switch between them."
      },
      {
        question: "Do multiple panels share the same providers?",
        answer: "Each panel has independent provider connections. You can connect the same or different providers to each panel with separate API keys and pricing configurations."
      },
      {
        question: "Can each panel have a different domain?",
        answer: "Yes. Each panel can have its own custom domain or use a unique subdomain (e.g., panel1.smmpilot.online, panel2.smmpilot.online). Configure domains from each panel's settings."
      }
    ]
  },
  {
    id: "storefront",
    title: "Storefront & Design",
    icon: Globe,
    color: "text-teal-500 bg-teal-500/10",
    faqs: [
      {
        question: "How do I customize my storefront?",
        answer: "Use the Storefront Builder in your dashboard to choose from 7+ pre-built templates. Customize colors, fonts, logos, and layouts with a live preview before publishing."
      },
      {
        question: "Can I add a blog to my panel?",
        answer: "Yes! Go to Blog Management in your dashboard to create and publish blog posts. Blog posts are SEO-optimized and displayed on your storefront to attract organic traffic."
      },
      {
        question: "How do promo codes work?",
        answer: "Navigate to Promo & Coupons in your dashboard to create discount codes. Set percentage or fixed amount discounts, expiry dates, usage limits, and track redemptions."
      }
    ]
  }
];

export const KnowledgeBase = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredCategories = knowledgeCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => 
    selectedCategory === null || category.id === selectedCategory
  ).filter(category => 
    searchTerm === "" || category.faqs.length > 0
  );

  const totalFAQs = knowledgeCategories.reduce((sum, cat) => sum + cat.faqs.length, 0);

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card className="bg-gradient-card border-border">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Book className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">Knowledge Base</h2>
              <p className="text-sm text-muted-foreground">
                {totalFAQs} articles across {knowledgeCategories.length} categories
              </p>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search knowledge base..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={selectedCategory === null ? "default" : "outline"}
          className="cursor-pointer px-3 py-1.5 text-sm"
          onClick={() => setSelectedCategory(null)}
        >
          All Categories
        </Badge>
        {knowledgeCategories.map((category) => {
          const Icon = category.icon;
          return (
            <Badge
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              className="cursor-pointer px-3 py-1.5 text-sm gap-1.5"
              onClick={() => setSelectedCategory(category.id)}
            >
              <Icon className="w-3 h-3" />
              {category.title}
            </Badge>
          );
        })}
      </div>

      {/* FAQ Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCategories.map((category) => {
          const Icon = category.icon;
          return (
            <Card key={category.id} className="bg-gradient-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-base">
                  <div className={`p-2 rounded-lg ${category.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {category.title}
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {category.faqs.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {category.faqs.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No matching articles found
                  </p>
                ) : (
                  <Accordion type="single" collapsible className="w-full">
                    {category.faqs.map((faq, index) => (
                      <AccordionItem key={index} value={`${category.id}-${index}`} className="border-border/50">
                        <AccordionTrigger className="text-left text-sm hover:no-underline py-3">
                          <span className="flex items-start gap-2 pr-2">
                            <HelpCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                            {faq.question}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground pl-6">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredCategories.length === 0 && (
        <Card className="bg-gradient-card border-border">
          <CardContent className="py-12 text-center">
            <HelpCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or browse all categories
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
