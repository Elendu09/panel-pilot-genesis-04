import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  HelpCircle, 
  MessageSquare, 
  Search, 
  Mail, 
  Phone, 
  Clock,
  CheckCircle,
  ArrowRight,
  BookOpen,
  Video,
  Users,
  Zap
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function Support() {
  const [searchTerm, setSearchTerm] = useState('');

  const faqCategories = [
    {
      title: "Getting Started",
      questions: [
        {
          q: "How do I create my first SMM panel?",
          a: "Creating your SMM panel is simple! Sign up for an account, complete the verification process, choose your plan, and follow our step-by-step setup wizard. You'll have your panel running in under 30 minutes."
        },
        {
          q: "What payment methods do you accept?",
          a: "We accept all major credit cards, PayPal, Bitcoin, and bank transfers. For enterprise clients, we also offer custom payment arrangements and invoicing."
        },
        {
          q: "Do I need technical knowledge to use HomeOfSMM?",
          a: "Not at all! HomeOfSMM is designed for users of all technical levels. Our intuitive interface and comprehensive documentation make it easy for anyone to start and manage their SMM panel."
        }
      ]
    },
    {
      title: "Panel Management",
      questions: [
        {
          q: "How do I customize my panel's branding?",
          a: "Go to Settings > Branding in your dashboard. You can upload your logo, customize colors, set your panel name, and configure the domain. Changes are applied instantly across your panel."
        },
        {
          q: "Can I set custom pricing for services?",
          a: "Yes! You have complete control over pricing. Set your markup percentage or fixed prices for each service. You can also create tiered pricing for different customer levels."
        },
        {
          q: "How do I add new services to my panel?",
          a: "Navigate to Services > Add Service in your dashboard. Choose from our catalog of available services or contact support to request specific services for your niche."
        }
      ]
    },
    {
      title: "Orders & Payments",
      questions: [
        {
          q: "How are orders processed?",
          a: "Orders are automatically routed to our provider network and processed in real-time. You can track order status, set delivery speeds, and configure automatic refunds for failed orders."
        },
        {
          q: "When do I receive payments?",
          a: "Payments are processed instantly when customers pay. Your earnings are available in your wallet immediately and can be withdrawn according to your chosen payout schedule."
        },
        {
          q: "What happens if an order fails?",
          a: "Failed orders are automatically refunded to your customer's account. You can configure automatic retry attempts and set custom refund policies in your panel settings."
        }
      ]
    },
    {
      title: "API & Integration",
      questions: [
        {
          q: "Do you provide API access?",
          a: "Yes! All plans include full API access. Our RESTful API allows you to integrate with existing systems, automate operations, and build custom applications."
        },
        {
          q: "Is there API documentation available?",
          a: "Comprehensive API documentation is available in your dashboard and at docs.homeofsmm.com. It includes code examples, testing tools, and integration guides."
        },
        {
          q: "Can I connect multiple panels to one account?",
          a: "Absolutely! Manage multiple panels from a single dashboard. Perfect for agencies or entrepreneurs running multiple brands or niches."
        }
      ]
    }
  ];

  const supportOptions = [
    {
      title: "Live Chat",
      description: "Get instant help from our support team",
      availability: "24/7 Available",
      icon: <MessageSquare className="w-6 h-6" />,
      action: "Start Chat",
      primary: true
    },
    {
      title: "Email Support",
      description: "Send us detailed questions anytime",
      availability: "Response within 2 hours",
      icon: <Mail className="w-6 h-6" />,
      action: "Send Email"
    },
    {
      title: "Phone Support",
      description: "Talk directly with our experts",
      availability: "Business Hours",
      icon: <Phone className="w-6 h-6" />,
      action: "Schedule Call"
    },
    {
      title: "Video Tutorials",
      description: "Watch step-by-step guides",
      availability: "Available 24/7",
      icon: <Video className="w-6 h-6" />,
      action: "Watch Now"
    }
  ];

  const resources = [
    {
      title: "Knowledge Base",
      description: "Comprehensive guides and tutorials",
      icon: <BookOpen className="w-5 h-5" />,
      link: "/docs"
    },
    {
      title: "Community Forum",
      description: "Connect with other panel owners",
      icon: <Users className="w-5 h-5" />,
      link: "#"
    },
    {
      title: "Video Academy",
      description: "Learn through video courses",
      icon: <Video className="w-5 h-5" />,
      link: "#"
    },
    {
      title: "Best Practices",
      description: "Industry tips and strategies",
      icon: <Zap className="w-5 h-5" />,
      link: "/blog"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <Badge className="mb-6 bg-gradient-primary text-primary-foreground">
              <HelpCircle className="w-4 h-4 mr-2" />
              Support Center
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent mb-6">
              How Can We
              <br />Help You Today?
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Find answers, get support, and learn how to make the most of your SMM panel
            </p>
            
            {/* Search */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for help articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Options */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Get Support</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {supportOptions.map((option, index) => (
                <Card key={index} className={`p-6 text-center bg-card/70 backdrop-blur-sm hover:bg-card/90 transition-all cursor-pointer hover-scale ${option.primary ? 'ring-2 ring-primary' : ''}`}>
                  <div className="text-primary mb-4 flex justify-center">
                    {option.icon}
                  </div>
                  <h3 className="font-semibold mb-2">{option.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{option.description}</p>
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-4">
                    <Clock className="w-3 h-3" />
                    {option.availability}
                  </div>
                  <Button 
                    variant={option.primary ? "default" : "outline"} 
                    size="sm" 
                    className={option.primary ? "bg-gradient-primary hover:shadow-glow w-full" : "w-full"}
                  >
                    {option.action}
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-lg text-muted-foreground">
                Quick answers to common questions
              </p>
            </div>

            <Tabs defaultValue={faqCategories[0].title} className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-8">
                {faqCategories.map((category, index) => (
                  <TabsTrigger key={index} value={category.title} className="text-sm">
                    {category.title}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {faqCategories.map((category, index) => (
                <TabsContent key={index} value={category.title}>
                  <div className="space-y-4">
                    {category.questions.map((faq, i) => (
                      <Card key={i} className="p-6 bg-card/70 backdrop-blur-sm">
                        <h3 className="font-semibold mb-3 flex items-start gap-2">
                          <HelpCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          {faq.q}
                        </h3>
                        <p className="text-muted-foreground pl-7">{faq.a}</p>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Additional Resources</h2>
              <p className="text-lg text-muted-foreground">
                Explore our comprehensive learning materials
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {resources.map((resource, index) => (
                <Card key={index} className="p-6 bg-card/70 backdrop-blur-sm hover:bg-card/90 transition-all cursor-pointer">
                  <div className="text-primary mb-3">
                    {resource.icon}
                  </div>
                  <h3 className="font-semibold mb-2">{resource.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{resource.description}</p>
                  <Link to={resource.link} className="flex items-center text-primary text-sm font-medium">
                    Explore <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 bg-card/70 backdrop-blur-sm">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Still Need Help?</h2>
                <p className="text-muted-foreground">
                  Can't find what you're looking for? Send us a message and we'll get back to you quickly.
                </p>
              </div>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <Input placeholder="Your name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input type="email" placeholder="your@email.com" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <Input placeholder="How can we help?" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <Textarea 
                    placeholder="Describe your question or issue in detail..."
                    rows={5}
                  />
                </div>
                
                <Button className="w-full bg-gradient-primary hover:shadow-glow">
                  Send Message
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* Status */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto p-8 text-center bg-card/70 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-2 mb-4">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <h3 className="text-xl font-semibold">All Systems Operational</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              All HomeOfSMM services are running smoothly. Check our status page for real-time updates.
            </p>
            <Button variant="outline">
              View Status Page
            </Button>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}