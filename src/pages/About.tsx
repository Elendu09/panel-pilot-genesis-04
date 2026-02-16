import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  Users, 
  Target, 
  Award, 
  Globe, 
  TrendingUp,
  Heart,
  Lightbulb,
  Shield,
  Clock
} from "lucide-react";
import { Link } from "react-router-dom";

export default function About() {
  const stats = [
    { number: "10,000+", label: "Active Panels", icon: <Globe className="w-5 h-5" /> },
    { number: "1M+", label: "Orders Processed", icon: <TrendingUp className="w-5 h-5" /> },
    { number: "99.9%", label: "Uptime", icon: <Shield className="w-5 h-5" /> },
    { number: "24/7", label: "Support", icon: <Clock className="w-5 h-5" /> }
  ];

  const values = [
    {
      icon: <Lightbulb className="w-6 h-6" />,
      title: "Innovation",
      description: "We continuously evolve our platform with cutting-edge features and technologies to stay ahead of industry trends."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Customer Success",
      description: "Your success is our success. We provide comprehensive support and resources to help you thrive in the SMM industry."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Reliability",
      description: "Built on robust infrastructure with 99.9% uptime guarantee, ensuring your business never stops growing."
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Transparency",
      description: "No hidden fees, clear pricing, and honest communication. We believe in building trust through transparency."
    }
  ];

  const team = [
    {
      name: "Alex Thompson",
      role: "CEO & Founder",
      bio: "Former Meta engineer with 10+ years in social media technology. Passionate about democratizing SMM tools."
    },
    {
      name: "Sarah Chen",
      role: "CTO",
      bio: "Ex-Google software architect specializing in scalable systems. Leads our technical innovation and platform development."
    },
    {
      name: "Marcus Rodriguez",
      role: "Head of Growth",
      bio: "Digital marketing veteran who built multiple 7-figure SMM agencies. Now helping others achieve similar success."
    },
    {
      name: "Emma Wilson",
      role: "Customer Success Director",
      bio: "Customer experience expert committed to ensuring every user maximizes their potential with our platform."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-gradient-primary text-primary-foreground">
              <Users className="w-4 h-4 mr-2" />
              About HOME OF SMM
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent mb-6">
              Empowering SMM
              <br />Entrepreneurs Worldwide
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              We're on a mission to democratize social media marketing by providing powerful, 
              accessible tools that help businesses of all sizes succeed in the digital landscape.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <Card key={index} className="p-6 text-center bg-card/70 backdrop-blur-sm">
                <div className="text-primary mb-2 flex justify-center">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold mb-1">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-6">Our Story</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    HOME OF SMM was born from a simple observation: the social media marketing industry 
                    was dominated by complex, expensive platforms that were out of reach for most entrepreneurs.
                  </p>
                  <p>
                    Our founders, having worked at major tech companies, saw an opportunity to level the 
                    playing field. They envisioned a platform that would give anyone the power to start 
                    and scale their own SMM business, regardless of technical expertise or budget.
                  </p>
                  <p>
                    Since our launch in 2020, we've helped over 10,000 entrepreneurs build successful 
                    SMM businesses, processing millions of orders and generating substantial revenue 
                    for our community of panel owners.
                  </p>
                  <p>
                    Today, HOME OF SMM stands as the industry leader in white-label SMM solutions, 
                    trusted by businesses in over 100 countries worldwide.
                  </p>
                </div>
              </div>
              
              <Card className="p-8 bg-gradient-to-br from-primary/10 to-secondary/10">
                <div className="text-center">
                  <Zap className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                  <p className="text-muted-foreground">
                    To democratize social media marketing by providing powerful, accessible tools 
                    that enable anyone to build and scale a successful SMM business.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Our Values</h2>
            <p className="text-xl text-muted-foreground">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {values.map((value, index) => (
              <Card key={index} className="p-8 bg-card/70 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    {value.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-xl text-muted-foreground">
              The passionate people behind HOME OF SMM
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {team.map((member, index) => (
              <Card key={index} className="p-6 text-center bg-card/70 backdrop-blur-sm">
                <div className="w-20 h-20 bg-gradient-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-10 h-10 text-primary-foreground" />
                </div>
                <h3 className="font-bold text-lg mb-1">{member.name}</h3>
                <Badge variant="secondary" className="mb-3">{member.role}</Badge>
                <p className="text-sm text-muted-foreground">{member.bio}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Recognition & Awards</h2>
            <p className="text-xl text-muted-foreground">
              Industry recognition for our innovation and excellence
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="p-6 text-center bg-card/70 backdrop-blur-sm">
              <Award className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-bold mb-2">Best SMM Platform 2023</h3>
              <p className="text-sm text-muted-foreground">Digital Marketing Awards</p>
            </Card>
            
            <Card className="p-6 text-center bg-card/70 backdrop-blur-sm">
              <Target className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-bold mb-2">Innovation in SaaS</h3>
              <p className="text-sm text-muted-foreground">Tech Innovation Summit 2023</p>
            </Card>
            
            <Card className="p-6 text-center bg-card/70 backdrop-blur-sm">
              <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-bold mb-2">Fastest Growing Platform</h3>
              <p className="text-sm text-muted-foreground">SMM Industry Report 2023</p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Join Our Journey</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Be part of the future of social media marketing. Start your SMM business today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-primary hover:shadow-glow">
              <Link to="/auth">Start Your Panel</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/contact">Get in Touch</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}