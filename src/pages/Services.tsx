import { Helmet } from "react-helmet-async";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Zap, 
  ArrowRight, 
  BarChart3, 
  RefreshCw, 
  Shield,
  Layers,
  Settings,
  Globe,
  CheckCircle,
  TrendingUp,
  Users
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const features = [
  {
    icon: Package,
    title: "Bulk Service Import",
    description: "Import thousands of services from providers with automatic markup calculation",
    color: "bg-blue-500/10 text-blue-500"
  },
  {
    icon: BarChart3,
    title: "Smart Analytics",
    description: "Track service performance, popular categories, and revenue metrics",
    color: "bg-emerald-500/10 text-emerald-500"
  },
  {
    icon: RefreshCw,
    title: "Auto-Sync",
    description: "Keep services synchronized with provider updates automatically",
    color: "bg-violet-500/10 text-violet-500"
  },
  {
    icon: Shield,
    title: "Health Monitoring",
    description: "Detect issues and fix problems with one-click auto-repair",
    color: "bg-amber-500/10 text-amber-500"
  },
  {
    icon: Layers,
    title: "Category Management",
    description: "Organize services into categories with drag-and-drop reordering",
    color: "bg-pink-500/10 text-pink-500"
  },
  {
    icon: Settings,
    title: "Bulk Operations",
    description: "Apply changes to multiple services at once with bulk editing tools",
    color: "bg-cyan-500/10 text-cyan-500"
  }
];

const stats = [
  { value: "50+", label: "Platform Categories", icon: Globe },
  { value: "1000+", label: "Services Supported", icon: Package },
  { value: "99.9%", label: "Uptime", icon: CheckCircle },
  { value: "24/7", label: "Auto-Sync", icon: RefreshCw }
];

// Marketing page for unauthenticated users
const ServicesMarketingPage = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <Navigation />
    <main className="flex-1">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container mx-auto px-4 relative z-10"
        >
          <motion.div variants={itemVariants} className="text-center max-w-3xl mx-auto">
            <Badge className="mb-4 px-4 py-1.5 bg-primary/10 text-primary border-primary/20">
              <Zap className="w-3 h-3 mr-1" />
              Powerful Service Tools
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text">
              Manage Services Like a Pro
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Import, organize, and optimize your SMM services with powerful tools 
              designed to maximize your panel's potential.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gap-2" asChild>
                <Link to="/auth">
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="gap-2" asChild>
                <Link to="/demo">
                  View Demo
                </Link>
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-border/50 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                variants={itemVariants}
                className="text-center"
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Everything You Need to Manage Services
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Professional tools to import, organize, and optimize your SMM services
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="h-full glass-card hover:border-primary/30 transition-all group">
                    <CardContent className="p-6">
                      <div className={cn("w-12 h-12 rounded-xl mb-4 flex items-center justify-center", feature.color)}>
                        <feature.icon className="w-6 h-6" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Supercharge Your Panel?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of panel owners who use our service tools to grow their business
            </p>
            <Button size="lg" className="gap-2" asChild>
              <Link to="/auth">
                Start Your Panel Today
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

// Dashboard for authenticated panel owners
const ServicesDashboard = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <Navigation />
    <main className="flex-1 container mx-auto px-4 py-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Service Tools</h1>
            <p className="text-muted-foreground">Manage and optimize your panel services</p>
          </div>
          <Button className="gap-2" asChild>
            <Link to="/panel/services">
              <Package className="w-4 h-4" />
              Go to Services
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>

        {/* Quick Actions Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { title: "Import Services", icon: Package, href: "/panel/services", color: "from-blue-500 to-blue-600" },
            { title: "Service Health", icon: Shield, href: "/panel/services", color: "from-emerald-500 to-emerald-600" },
            { title: "Analytics", icon: BarChart3, href: "/panel/analytics", color: "from-violet-500 to-violet-600" },
            { title: "Providers", icon: Users, href: "/panel/providers", color: "from-amber-500 to-amber-600" },
          ].map((action, index) => (
            <Link key={index} to={action.href}>
              <Card className="glass-card hover:border-primary/30 transition-all group cursor-pointer h-full">
                <CardContent className="p-4 text-center">
                  <div className={cn("w-12 h-12 mx-auto rounded-xl mb-3 flex items-center justify-center bg-gradient-to-br", action.color)}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-medium text-sm group-hover:text-primary transition-colors">{action.title}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </motion.div>

        {/* Features Overview */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Available Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", feature.color)}>
                      <feature.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{feature.title}</h4>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Tips */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card bg-gradient-to-r from-primary/5 to-transparent">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
                <div className="text-center md:text-left flex-1">
                  <h3 className="font-semibold text-lg mb-1">Pro Tip: Optimize Your Services</h3>
                  <p className="text-muted-foreground text-sm">
                    Use the Health Check feature to identify and fix issues with your services. 
                    Enable auto-sync to keep prices updated with your providers.
                  </p>
                </div>
                <Button variant="outline" className="gap-2 shrink-0" asChild>
                  <Link to="/panel/services">
                    Open Services
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </main>
    <Footer />
  </div>
);

const Services = () => {
  const { user, profile } = useAuth();
  const isAuthenticated = !!user;
  const isPanelOwner = profile?.role === 'panel_owner' || profile?.role === 'super_admin';

  return (
    <>
      <Helmet>
        <title>Service Tools - HOME OF SMM</title>
        <meta 
          name="description" 
          content="Powerful service tools for your SMM panel. Import, organize, and optimize your services with advanced analytics and bulk operations." 
        />
      </Helmet>
      {isAuthenticated && isPanelOwner ? <ServicesDashboard /> : <ServicesMarketingPage />}
    </>
  );
};

export default Services;
