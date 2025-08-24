import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, DollarSign, Shield } from "lucide-react";
import { Helmet } from "react-helmet-async";

const AdminOverview = () => {
  return (
    <div className="space-y-6">
      <Helmet>
        <title>Admin Overview - SMMPilot Platform</title>
        <meta name="description" content="Platform overview and management dashboard for super administrators." />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      
      <div>
        <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              Total Panels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">1,847</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">23,891</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              Platform Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">$456,789</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Security Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">98.2%</div>
            <p className="text-xs text-muted-foreground">All systems secure</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform activities and registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New panel created: "SocialBoost Pro"</p>
                  <p className="text-sm text-muted-foreground">by john@example.com</p>
                </div>
                <span className="text-xs text-muted-foreground">2m ago</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Domain connected: mysmmservices.com</p>
                  <p className="text-sm text-muted-foreground">SSL certificate issued</p>
                </div>
                <span className="text-xs text-muted-foreground">5m ago</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Payment gateway configured</p>
                  <p className="text-sm text-muted-foreground">Stripe integration</p>
                </div>
                <span className="text-xs text-muted-foreground">12m ago</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader>
            <CardTitle>Top Performing Panels</CardTitle>
            <CardDescription>Panels with highest revenue this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">SMMKing Pro</p>
                  <p className="text-sm text-muted-foreground">smmking.panelpilot.com</p>
                </div>
                <span className="font-medium text-primary">$15,892</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">SocialGrow</p>
                  <p className="text-sm text-muted-foreground">socialgrow.net</p>
                </div>
                <span className="font-medium text-primary">$12,567</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">BoostPanel</p>
                  <p className="text-sm text-muted-foreground">boostpanel.io</p>
                </div>
                <span className="font-medium text-primary">$9,834</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;