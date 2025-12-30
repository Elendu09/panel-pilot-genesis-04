import { useState } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CalendarDays, Clock, ArrowRight, X } from "lucide-react";

const blogPosts = [
  {
    id: 1,
    title: "The Future of Social Media Marketing: Trends for 2024",
    excerpt: "Discover the latest trends in social media marketing and how they can impact your business growth strategy.",
    content: `
      <h2 class="text-2xl font-bold mb-4">Introduction to SMM Trends</h2>
      <p class="mb-4">Social media marketing continues to evolve rapidly. In 2024, we're seeing significant shifts in how brands connect with their audiences. The landscape is more competitive than ever, but also more opportunity-rich for those who stay ahead of the curve.</p>
      
      <h2 class="text-2xl font-bold mb-4 mt-6">Key Trends to Watch</h2>
      <p class="mb-4"><strong>1. Short-form video content dominates</strong> - TikTok, Reels, and Shorts are leading engagement metrics. Brands that master the art of quick, captivating content are seeing exponential growth in their reach and engagement rates.</p>
      <p class="mb-4"><strong>2. AI-powered content creation</strong> - Artificial intelligence is revolutionizing how we create and optimize content. From generating captions to analyzing performance, AI tools are becoming indispensable for marketers.</p>
      <p class="mb-4"><strong>3. Authentic influencer partnerships</strong> - Gone are the days of obvious sponsored posts. Audiences crave authenticity, and brands are shifting towards long-term partnerships with micro-influencers who genuinely align with their values.</p>
      
      <h2 class="text-2xl font-bold mb-4 mt-6">Conclusion</h2>
      <p class="mb-4">Staying ahead in social media marketing requires constant adaptation and a willingness to experiment with new formats and platforms. The brands that will thrive are those that prioritize genuine connection over vanity metrics.</p>
    `,
    category: "Marketing",
    readTime: "5 min read",
    date: "Jan 15, 2024",
    image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=300&fit=crop"
  },
  {
    id: 2,
    title: "Building an Effective SMM Panel: Best Practices",
    excerpt: "Learn how to create and manage a successful SMM panel that drives results for your clients.",
    content: `
      <h2 class="text-2xl font-bold mb-4">Why SMM Panels Matter</h2>
      <p class="mb-4">An SMM panel is more than just a reselling platform—it's a complete business ecosystem that enables entrepreneurs to offer social media marketing services at scale. The key to success lies in understanding your market and delivering consistent value.</p>
      
      <h2 class="text-2xl font-bold mb-4 mt-6">Essential Features for Your Panel</h2>
      <p class="mb-4"><strong>Reliable Service Providers</strong> - Your panel is only as good as your suppliers. Partner with providers who offer quality services with minimal refund rates and consistent delivery times.</p>
      <p class="mb-4"><strong>User-Friendly Interface</strong> - Your customers should be able to navigate your panel effortlessly. Invest in clean design, intuitive ordering processes, and responsive customer support.</p>
      <p class="mb-4"><strong>Competitive Pricing</strong> - Research your market thoroughly. Price too high and you'll lose customers; price too low and you'll sacrifice margins needed for growth.</p>
      
      <h2 class="text-2xl font-bold mb-4 mt-6">Growing Your Customer Base</h2>
      <p class="mb-4">Success comes from a combination of quality service, competitive pricing, and strategic marketing. Focus on building trust through transparency and delivering on your promises consistently.</p>
    `,
    category: "Business",
    readTime: "8 min read",
    date: "Jan 12, 2024",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=300&fit=crop"
  },
  {
    id: 3,
    title: "Instagram Growth Strategies That Actually Work",
    excerpt: "Proven tactics to increase your Instagram followers, engagement, and overall presence organically.",
    content: `
      <h2 class="text-2xl font-bold mb-4">The Foundation of Instagram Growth</h2>
      <p class="mb-4">Growing on Instagram isn't about hacks or shortcuts—it's about understanding the platform's algorithm and creating content that resonates with your target audience. Let's dive into strategies that actually deliver results.</p>
      
      <h2 class="text-2xl font-bold mb-4 mt-6">Content Strategy</h2>
      <p class="mb-4"><strong>Consistency is Key</strong> - Post regularly but prioritize quality over quantity. Aim for 4-7 posts per week, with Stories daily to maintain visibility in your followers' feeds.</p>
      <p class="mb-4"><strong>Embrace Reels</strong> - Instagram is pushing Reels heavily. Accounts that regularly post Reels see significantly higher reach and follower growth compared to those who stick to static posts.</p>
      <p class="mb-4"><strong>Engage Authentically</strong> - Spend time engaging with your community. Reply to comments, engage with similar accounts, and build genuine relationships.</p>
      
      <h2 class="text-2xl font-bold mb-4 mt-6">Optimization Tips</h2>
      <p class="mb-4">Use relevant hashtags (mix of popular and niche), optimize your bio for searchability, and leverage Instagram's features like Guides, Collabs, and Broadcast Channels to maximize your reach.</p>
    `,
    category: "Instagram",
    readTime: "6 min read",
    date: "Jan 10, 2024",
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=300&fit=crop"
  },
  {
    id: 4,
    title: "YouTube Marketing: From Zero to Hero",
    excerpt: "Complete guide to building a successful YouTube channel and leveraging video content for business growth.",
    content: `
      <h2 class="text-2xl font-bold mb-4">Why YouTube Matters for Your Business</h2>
      <p class="mb-4">YouTube is the second-largest search engine in the world. With over 2 billion logged-in users monthly, it offers unparalleled reach for businesses willing to invest in video content. But success on YouTube requires strategy, patience, and consistency.</p>
      
      <h2 class="text-2xl font-bold mb-4 mt-6">Building Your Channel Foundation</h2>
      <p class="mb-4"><strong>Define Your Niche</strong> - Don't try to appeal to everyone. Pick a specific topic or audience and become the go-to resource for that community.</p>
      <p class="mb-4"><strong>Invest in Quality</strong> - You don't need expensive equipment, but good audio is non-negotiable. Poor sound quality is the fastest way to lose viewers.</p>
      <p class="mb-4"><strong>Master the Thumbnail Game</strong> - Your thumbnail is your video's billboard. Invest time in creating eye-catching, click-worthy thumbnails that accurately represent your content.</p>
      
      <h2 class="text-2xl font-bold mb-4 mt-6">Growth Strategies</h2>
      <p class="mb-4">Focus on searchable content early on, collaborate with other creators in your niche, and optimize your titles and descriptions for YouTube SEO. Consistency in posting schedule helps train both the algorithm and your audience.</p>
    `,
    category: "YouTube",
    readTime: "12 min read",
    date: "Jan 8, 2024",
    image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=300&fit=crop"
  },
  {
    id: 5,
    title: "TikTok Algorithm Secrets: How to Go Viral",
    excerpt: "Understanding TikTok's algorithm and creating content that resonates with your target audience.",
    content: `
      <h2 class="text-2xl font-bold mb-4">Decoding the TikTok Algorithm</h2>
      <p class="mb-4">TikTok's algorithm is unique in that it prioritizes content quality over follower count. This means even new accounts can go viral if they create the right content. Understanding how the algorithm works is the first step to TikTok success.</p>
      
      <h2 class="text-2xl font-bold mb-4 mt-6">Key Ranking Factors</h2>
      <p class="mb-4"><strong>Watch Time</strong> - The algorithm heavily weights how long people watch your videos. Hook viewers in the first second and keep them engaged throughout.</p>
      <p class="mb-4"><strong>Engagement Velocity</strong> - How quickly your video gains likes, comments, shares, and saves matters. Encourage interaction with strong calls-to-action.</p>
      <p class="mb-4"><strong>Completion Rate</strong> - Videos that are watched to the end (or looped) get pushed to more users. Keep your content tight and compelling.</p>
      
      <h2 class="text-2xl font-bold mb-4 mt-6">Creating Viral-Worthy Content</h2>
      <p class="mb-4">Trend-jack popular sounds and formats, but add your unique twist. Authenticity resonates on TikTok—users can spot inauthenticity immediately. Post frequently, analyze what works, and iterate quickly.</p>
    `,
    category: "TikTok",
    readTime: "7 min read",
    date: "Jan 5, 2024",
    image: "https://images.unsplash.com/photo-1611605698335-8b1569810432?w=600&h=300&fit=crop"
  },
  {
    id: 6,
    title: "The ROI of Social Media Marketing: Measuring Success",
    excerpt: "Learn how to track and measure the return on investment of your social media marketing campaigns.",
    content: `
      <h2 class="text-2xl font-bold mb-4">Why Measuring ROI Matters</h2>
      <p class="mb-4">Without proper measurement, you're essentially flying blind with your social media efforts. Understanding your ROI helps you allocate budget effectively, justify marketing spend, and continuously improve your strategies.</p>
      
      <h2 class="text-2xl font-bold mb-4 mt-6">Key Metrics to Track</h2>
      <p class="mb-4"><strong>Conversion Rate</strong> - How many social media visitors take your desired action? This could be purchases, sign-ups, or any other goal.</p>
      <p class="mb-4"><strong>Cost Per Acquisition (CPA)</strong> - What does it cost to acquire a customer through social media? Compare this to other channels to optimize your mix.</p>
      <p class="mb-4"><strong>Customer Lifetime Value (CLV)</strong> - Social media customers often have different lifetime values than other channels. Track this to understand true ROI.</p>
      
      <h2 class="text-2xl font-bold mb-4 mt-6">Tools and Techniques</h2>
      <p class="mb-4">Use UTM parameters to track social traffic, set up proper goal tracking in Google Analytics, and leverage each platform's native analytics. Consider attribution modeling to understand how social media contributes to your overall marketing funnel.</p>
    `,
    category: "Analytics",
    readTime: "10 min read",
    date: "Jan 3, 2024",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=300&fit=crop"
  }
];

const Blog = () => {
  const [selectedPost, setSelectedPost] = useState<typeof blogPosts[0] | null>(null);

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
                <Button 
                  variant="outline" 
                  className="w-full group"
                  onClick={() => setSelectedPost(post)}
                >
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

      {/* Blog Post Modal */}
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{selectedPost?.category}</Badge>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {selectedPost?.readTime}
              </span>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                {selectedPost?.date}
              </span>
            </div>
            <DialogTitle className="text-2xl font-bold">{selectedPost?.title}</DialogTitle>
          </DialogHeader>
          
          {selectedPost?.image && (
            <div className="aspect-video overflow-hidden rounded-lg my-4">
              <img 
                src={selectedPost.image} 
                alt={selectedPost.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div 
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: selectedPost?.content || '' }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Blog;
