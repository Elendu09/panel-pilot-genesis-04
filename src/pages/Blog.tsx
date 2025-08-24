import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, ArrowRight } from "lucide-react";

const blogPosts = [
  {
    id: 1,
    title: "The Future of Social Media Marketing: Trends for 2024",
    excerpt: "Discover the latest trends in social media marketing and how they can impact your business growth strategy.",
    category: "Marketing",
    readTime: "5 min read",
    date: "Jan 15, 2024",
    image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=300&fit=crop"
  },
  {
    id: 2,
    title: "Building an Effective SMM Panel: Best Practices",
    excerpt: "Learn how to create and manage a successful SMM panel that drives results for your clients.",
    category: "Business",
    readTime: "8 min read",
    date: "Jan 12, 2024",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=300&fit=crop"
  },
  {
    id: 3,
    title: "Instagram Growth Strategies That Actually Work",
    excerpt: "Proven tactics to increase your Instagram followers, engagement, and overall presence organically.",
    category: "Instagram",
    readTime: "6 min read",
    date: "Jan 10, 2024",
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=300&fit=crop"
  },
  {
    id: 4,
    title: "YouTube Marketing: From Zero to Hero",
    excerpt: "Complete guide to building a successful YouTube channel and leveraging video content for business growth.",
    category: "YouTube",
    readTime: "12 min read",
    date: "Jan 8, 2024",
    image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=300&fit=crop"
  },
  {
    id: 5,
    title: "TikTok Algorithm Secrets: How to Go Viral",
    excerpt: "Understanding TikTok's algorithm and creating content that resonates with your target audience.",
    category: "TikTok",
    readTime: "7 min read",
    date: "Jan 5, 2024",
    image: "https://images.unsplash.com/photo-1611605698335-8b1569810432?w=600&h=300&fit=crop"
  },
  {
    id: 6,
    title: "The ROI of Social Media Marketing: Measuring Success",
    excerpt: "Learn how to track and measure the return on investment of your social media marketing campaigns.",
    category: "Analytics",
    readTime: "10 min read",
    date: "Jan 3, 2024",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=300&fit=crop"
  }
];

const Blog = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Blog & Insights</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stay updated with the latest trends, tips, and strategies in social media marketing
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
          {blogPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">{post.category}</Badge>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    {post.readTime}
                  </div>
                </div>
                <CardTitle className="line-clamp-2 hover:text-primary transition-colors">
                  {post.title}
                </CardTitle>
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4 mr-1" />
                  {post.date}
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="line-clamp-3 mb-4">
                  {post.excerpt}
                </CardDescription>
                <Button variant="outline" className="w-full group">
                  Read More
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="mt-16 bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Subscribe to our newsletter and get the latest social media marketing insights delivered to your inbox.
          </p>
          <div className="flex gap-4 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 rounded-lg border border-border bg-background"
            />
            <Button>Subscribe</Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Blog;