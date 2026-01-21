import { useParams, Link } from "react-router-dom";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { DocsSidebar, categories } from "@/components/docs/DocsSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Clock, BookOpen } from "lucide-react";
import { Helmet } from "react-helmet-async";

// Static documentation content
const docsContent: Record<string, { title: string; content: React.ReactNode; readTime: string }> = {
  "quick-start": {
    title: "Quick Start Guide",
    readTime: "10 min",
    content: (
      <div className="prose prose-invert max-w-none">
        <h2>Welcome to HOME OF SMM</h2>
        <p>This guide will help you set up your SMM panel in under 10 minutes.</p>
        
        <h3>Step 1: Create Your Account</h3>
        <ol>
          <li>Visit our <Link to="/auth" className="text-primary hover:underline">signup page</Link> and register</li>
          <li>Verify your email address</li>
          <li>Complete your profile information</li>
        </ol>

        <h3>Step 2: Set Up Your Panel</h3>
        <p>After logging in, you'll be guided through our onboarding wizard:</p>
        <ul>
          <li><strong>Choose your panel name</strong> - This will be your brand identity</li>
          <li><strong>Select a subdomain</strong> - e.g., yourpanel.homeofsmm.com</li>
          <li><strong>Pick a theme</strong> - Choose from our premium templates</li>
        </ul>

        <h3>Step 3: Connect a Provider</h3>
        <p>To offer services, connect at least one SMM provider:</p>
        <ol>
          <li>Go to <strong>Settings → Providers</strong></li>
          <li>Click <strong>Add Provider</strong></li>
          <li>Enter your provider's API URL and key</li>
          <li>Click <strong>Test Connection</strong> then <strong>Save</strong></li>
        </ol>

        <h3>Step 4: Configure Pricing</h3>
        <p>Set your markup percentage to determine your profit margin.</p>

        <h3>Step 5: Add Payment Methods</h3>
        <p>Enable customers to pay you by configuring payment gateways.</p>

        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mt-6">
          <p className="font-semibold text-primary mb-2">🎉 You're Ready!</p>
          <p className="text-sm">Your panel is now live. Share your panel URL with customers and start earning!</p>
        </div>
      </div>
    ),
  },
  "api-overview": {
    title: "API Overview & Authentication",
    readTime: "8 min",
    content: (
      <div className="prose prose-invert max-w-none">
        <h2>API Overview</h2>
        <p>The HOME OF SMM API allows you to integrate your panel with external systems.</p>

        <h3>Base URL</h3>
        <pre className="bg-muted p-4 rounded-lg"><code>https://yourpanel.homeofsmm.com/api/v2</code></pre>

        <h3>Authentication</h3>
        <p>All API requests require an API key:</p>
        <pre className="bg-muted p-4 rounded-lg"><code>{`curl -H "Authorization: Bearer YOUR_API_KEY" \\
     https://yourpanel.homeofsmm.com/api/v2/services`}</code></pre>

        <h3>Response Format</h3>
        <pre className="bg-muted p-4 rounded-lg"><code>{`{
  "status": "success",
  "data": { ... },
  "message": "Optional message"
}`}</code></pre>

        <h3>Rate Limiting</h3>
        <table className="w-full">
          <thead>
            <tr>
              <th>Plan</th>
              <th>Requests/Minute</th>
              <th>Requests/Day</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Free</td><td>30</td><td>1,000</td></tr>
            <tr><td>Pro</td><td>100</td><td>10,000</td></tr>
            <tr><td>Enterprise</td><td>500</td><td>Unlimited</td></tr>
          </tbody>
        </table>
      </div>
    ),
  },
  "faq": {
    title: "Frequently Asked Questions",
    readTime: "6 min",
    content: (
      <div className="prose prose-invert max-w-none">
        <h2>Frequently Asked Questions</h2>
        
        <h3>Getting Started</h3>
        <p><strong>Q: How long does it take to set up a panel?</strong></p>
        <p>A: You can have a fully functional panel in under 10 minutes.</p>

        <p><strong>Q: Do I need coding skills?</strong></p>
        <p>A: No coding required! Everything is managed through our visual dashboard.</p>

        <h3>Pricing & Payments</h3>
        <p><strong>Q: How much does it cost?</strong></p>
        <p>A: We offer plans starting from $29/month. See our <Link to="/pricing" className="text-primary hover:underline">pricing page</Link> for details.</p>

        <p><strong>Q: What payment methods are supported?</strong></p>
        <p>A: You can accept Stripe, PayPal, cryptocurrency, and manual bank transfers.</p>

        <h3>Technical</h3>
        <p><strong>Q: Can I use my own domain?</strong></p>
        <p>A: Yes! Custom domains are supported with free SSL certificates.</p>

        <p><strong>Q: Is there an API?</strong></p>
        <p>A: Yes, we provide a full REST API for integration and automation.</p>
      </div>
    ),
  },
};

export default function DocsArticle() {
  const { category, slug } = useParams();
  const articleKey = slug || "";
  const article = docsContent[articleKey];

  // Find current category and article for navigation
  const currentCategory = categories.find(c => c.slug === category);
  const currentIndex = currentCategory?.articles.findIndex(a => a.slug === slug) ?? -1;
  const prevArticle = currentIndex > 0 ? currentCategory?.articles[currentIndex - 1] : null;
  const nextArticle = currentIndex < (currentCategory?.articles.length ?? 0) - 1 
    ? currentCategory?.articles[currentIndex + 1] 
    : null;

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-8">This documentation article is coming soon.</p>
          <Button asChild>
            <Link to="/docs">Back to Documentation</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{article.title} | HOME OF SMM Documentation</title>
        <meta name="description" content={`Learn about ${article.title} in our comprehensive documentation.`} />
      </Helmet>
      
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          <DocsSidebar />

          <main className="flex-1 min-w-0">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Link to="/docs" className="hover:text-foreground">Docs</Link>
              <span>/</span>
              <Link to={`/docs/${category}`} className="hover:text-foreground capitalize">
                {category?.replace("-", " ")}
              </Link>
              <span>/</span>
              <span className="text-foreground">{article.title}</span>
            </div>

            {/* Article Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {article.readTime} read
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {category?.replace("-", " ")}
                </Badge>
              </div>
            </div>

            {/* Article Content */}
            <Card className="p-8 mb-8">
              {article.content}
            </Card>

            {/* Navigation */}
            <div className="flex justify-between gap-4">
              {prevArticle ? (
                <Button variant="outline" asChild className="flex-1 justify-start">
                  <Link to={`/docs/${category}/${prevArticle.slug}`}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {prevArticle.title}
                  </Link>
                </Button>
              ) : <div />}
              {nextArticle && (
                <Button variant="outline" asChild className="flex-1 justify-end">
                  <Link to={`/docs/${category}/${nextArticle.slug}`}>
                    {nextArticle.title}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              )}
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
