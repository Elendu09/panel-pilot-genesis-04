import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, Users, Settings, ShoppingCart } from "lucide-react";

const Tutorial = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Platform Tutorial</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Learn how to use our SMM panel platform effectively with step-by-step guides
          </p>
        </div>

        <div className="grid gap-8 max-w-4xl mx-auto">
          {/* Getting Started */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <PlayCircle className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Getting Started — Onboarding Wizard</CardTitle>
                  <CardDescription>Set up your panel in 6 guided steps</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {[
                  { step: "1", title: "Create Your Account", desc: "Sign up with your email and verify your account to access the onboarding wizard" },
                  { step: "2", title: "Name Your Panel", desc: "Choose a unique name for your panel — this becomes your brand and subdomain" },
                  { step: "3", title: "Choose a Plan", desc: "Select a subscription plan (trial available) that matches your business needs" },
                  { step: "4", title: "Complete Payment", desc: "Pay via Paystack, Korapay, Flutterwave, crypto, or 200+ other methods" },
                  { step: "5", title: "Connect a Provider", desc: "Enter your provider's API URL and key — services sync automatically" },
                  { step: "6", title: "Set Up Domain & Branding", desc: "Connect your custom domain and customize your storefront design" },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-1">{item.step}</Badge>
                    <div>
                      <h4 className="font-semibold">{item.title}</h4>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Panel Owner Guide */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Panel Owner Guide</CardTitle>
                  <CardDescription>Master every tool in your dashboard</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {[
                  { step: "1", title: "Storefront Builder", desc: "Choose from 7+ templates, set colors, fonts, logo, and preview your store live" },
                  { step: "2", title: "Services Management", desc: "Import services from providers, set custom markup pricing, enable/disable services" },
                  { step: "3", title: "Provider Management", desc: "Connect unlimited providers, check balances, sync rates and statuses" },
                  { step: "4", title: "Payment Methods", desc: "Configure 200+ payment gateways, set fees, min/max amounts, and bonuses" },
                  { step: "5", title: "Blog Management", desc: "Create and publish blog posts with SEO optimization to attract organic traffic" },
                  { step: "6", title: "Promo & Coupons", desc: "Create discount codes, percentage or fixed amount, with expiry dates and usage limits" },
                  { step: "7", title: "Team Management", desc: "Invite team members with role-based permissions (admin, support, viewer)" },
                  { step: "8", title: "Analytics & Reports", desc: "Track revenue, orders, user growth, and export data in CSV format" },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-1">{item.step}</Badge>
                    <div>
                      <h4 className="font-semibold">{item.title}</h4>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Order Management</CardTitle>
                  <CardDescription>Understanding order lifecycle, statuses, and advanced options</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {[
                  { badge: "Pending", variant: "secondary" as const, title: "Order Pending", desc: "Order received and queued for processing by the provider" },
                  { badge: "In Progress", variant: "default" as const, title: "In Progress", desc: "Provider is actively delivering the service — progress syncs in real-time" },
                  { badge: "Completed", variant: "outline" as const, title: "Completed", desc: "Service fully delivered. Auto-complete triggers when provider confirms" },
                  { badge: "Cancelled", variant: "destructive" as const, title: "Cancelled / Refunded", desc: "Order cancelled — funds automatically refunded to customer balance" },
                  { badge: "Refill", variant: "outline" as const, title: "Refill Support", desc: "If a service drops, customers can request a refill within the guarantee period" },
                  { badge: "Drip-feed", variant: "outline" as const, title: "Drip-feed Orders", desc: "Split large orders into smaller intervals for natural, gradual engagement growth" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Badge variant={item.variant} className={item.badge === "Completed" ? "border-green-500 text-green-500" : ""}>
                      {item.badge}
                    </Badge>
                    <div>
                      <h4 className="font-semibold">{item.title}</h4>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Advanced Features */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Settings className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Advanced Features</CardTitle>
                  <CardDescription>Scale your business with powerful tools</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {[
                  { badge: "Multi", title: "Multi-Panel Management", desc: "Create and manage multiple panels from one dashboard with a panel switcher — each with its own storefront, domain, and branding" },
                  { badge: "Design", title: "Storefront Builder", desc: "7+ pre-built templates with full customization — colors, fonts, layouts, custom CSS — with live preview before publishing" },
                  { badge: "API", title: "API & Webhooks", desc: "Full REST API for placing orders, checking statuses, and managing services. Webhook support for real-time event notifications" },
                  { badge: "Promo", title: "Promo & Coupon System", desc: "Create discount codes with percentage or fixed amount off, set expiry dates, usage limits, and track redemptions" },
                  { badge: "Chat", title: "Chat Inbox", desc: "Built-in live chat system for real-time customer support directly from your panel dashboard" },
                  { badge: "Ads", title: "Provider Advertising", desc: "Monetize your panel by displaying provider ads, or advertise your services on other panels in the marketplace" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-1">{item.badge}</Badge>
                    <div>
                      <h4 className="font-semibold">{item.title}</h4>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Tutorial;
