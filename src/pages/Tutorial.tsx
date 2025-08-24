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
                  <CardTitle>Getting Started</CardTitle>
                  <CardDescription>Set up your account and make your first order</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">1</Badge>
                  <div>
                    <h4 className="font-semibold">Create Your Account</h4>
                    <p className="text-muted-foreground">Sign up with your email address and verify your account</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">2</Badge>
                  <div>
                    <h4 className="font-semibold">Add Funds</h4>
                    <p className="text-muted-foreground">Deposit money to your account using secure payment methods</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">3</Badge>
                  <div>
                    <h4 className="font-semibold">Browse Services</h4>
                    <p className="text-muted-foreground">Explore our wide range of social media marketing services</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">4</Badge>
                  <div>
                    <h4 className="font-semibold">Place Your Order</h4>
                    <p className="text-muted-foreground">Select a service, enter your details, and submit your order</p>
                  </div>
                </div>
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
                  <CardDescription>Learn how to manage your own SMM panel</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">1</Badge>
                  <div>
                    <h4 className="font-semibold">Panel Setup</h4>
                    <p className="text-muted-foreground">Configure your panel settings, branding, and domain</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">2</Badge>
                  <div>
                    <h4 className="font-semibold">Service Management</h4>
                    <p className="text-muted-foreground">Add services, set pricing, and manage your catalog</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">3</Badge>
                  <div>
                    <h4 className="font-semibold">User Management</h4>
                    <p className="text-muted-foreground">Manage your customers, view orders, and handle support</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">4</Badge>
                  <div>
                    <h4 className="font-semibold">Analytics & Reports</h4>
                    <p className="text-muted-foreground">Track your panel performance and revenue</p>
                  </div>
                </div>
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
                  <CardDescription>Understanding order statuses and tracking</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <Badge variant="secondary">Pending</Badge>
                  <div>
                    <h4 className="font-semibold">Order Pending</h4>
                    <p className="text-muted-foreground">Your order has been received and is being processed</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="default">In Progress</Badge>
                  <div>
                    <h4 className="font-semibold">Order In Progress</h4>
                    <p className="text-muted-foreground">The service is being delivered to your account</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="border-green-500 text-green-500">Completed</Badge>
                  <div>
                    <h4 className="font-semibold">Order Completed</h4>
                    <p className="text-muted-foreground">The service has been successfully delivered</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="destructive">Cancelled</Badge>
                  <div>
                    <h4 className="font-semibold">Order Cancelled</h4>
                    <p className="text-muted-foreground">The order was cancelled and funds were refunded</p>
                  </div>
                </div>
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
                  <CardDescription>Maximize your platform usage with advanced features</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">API</Badge>
                  <div>
                    <h4 className="font-semibold">API Integration</h4>
                    <p className="text-muted-foreground">Connect your applications using our RESTful API</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">Auto</Badge>
                  <div>
                    <h4 className="font-semibold">Automation</h4>
                    <p className="text-muted-foreground">Set up automated ordering and management workflows</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">White</Badge>
                  <div>
                    <h4 className="font-semibold">White Label</h4>
                    <p className="text-muted-foreground">Customize your panel with your own branding</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">Multi</Badge>
                  <div>
                    <h4 className="font-semibold">Multi-Panel Management</h4>
                    <p className="text-muted-foreground">Manage multiple panels from a single dashboard</p>
                  </div>
                </div>
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