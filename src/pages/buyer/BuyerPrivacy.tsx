import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Shield, ArrowLeft, Printer, Lock, Eye, Database, Users, Globe, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { useTenant } from "@/hooks/useTenant";
import { supabase } from "@/integrations/supabase/client";
import BuyerLayout from "./BuyerLayout";
import { LegalTableOfContents } from "@/components/buyer/LegalTableOfContents";
import { getDefaultPrivacyPolicy, LegalSection } from "@/lib/legal-content";

// Icons for each section category
const sectionIcons: Record<string, React.ReactNode> = {
  introduction: <Shield className="w-5 h-5" />,
  'information-collected': <Database className="w-5 h-5" />,
  'how-we-use': <Eye className="w-5 h-5" />,
  'information-sharing': <Users className="w-5 h-5" />,
  'data-security': <Lock className="w-5 h-5" />,
  'data-retention': <Database className="w-5 h-5" />,
  'your-rights': <Users className="w-5 h-5" />,
  cookies: <Globe className="w-5 h-5" />,
  'third-party': <Globe className="w-5 h-5" />,
  'childrens-privacy': <Shield className="w-5 h-5" />,
  international: <Globe className="w-5 h-5" />,
  contact: <Mail className="w-5 h-5" />,
  updates: <Shield className="w-5 h-5" />,
};

const BuyerPrivacy = () => {
  const navigate = useNavigate();
  const { panel } = useTenant();
  const [sections, setSections] = useState<LegalSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPrivacy = async () => {
      if (!panel?.id) return;
      
      try {
        const { data } = await supabase
          .from('panel_settings')
          .select('privacy_policy, contact_info, updated_at')
          .eq('panel_id', panel.id)
          .single();
        
        if (data?.privacy_policy && data.privacy_policy.trim().length > 100) {
          // Use custom content - parse into sections
          setSections(parseCustomContent(data.privacy_policy));
          setLastUpdated(data.updated_at);
        } else {
          // Use default compliant content
          const contactInfo = data?.contact_info as { email?: string } | null;
          const defaultSections = getDefaultPrivacyPolicy(
            panel?.name || 'Our Platform',
            contactInfo?.email
          );
          setSections(defaultSections);
          setLastUpdated(new Date().toISOString());
        }
      } catch (error) {
        console.error('Error fetching privacy policy:', error);
        // Fallback to default content
        setSections(getDefaultPrivacyPolicy(panel?.name || 'Our Platform'));
        setLastUpdated(new Date().toISOString());
      } finally {
        setLoading(false);
      }
    };

    fetchPrivacy();
  }, [panel?.id, panel?.name]);

  // Parse custom content into sections
  const parseCustomContent = (content: string): LegalSection[] => {
    const lines = content.split('\n');
    const parsed: LegalSection[] = [];
    let currentSection: LegalSection | null = null;
    let currentContent: string[] = [];

    lines.forEach((line) => {
      // Check for section headers (starts with ** or ##)
      const headerMatch = line.match(/^(\*\*|##)\s*(\d+\.?\s*)?(.+?)(\*\*)?$/);
      if (headerMatch) {
        // Save previous section
        if (currentSection) {
          currentSection.content = currentContent.join('\n').trim();
          parsed.push(currentSection);
        }
        // Start new section
        const title = headerMatch[3].replace(/\*\*/g, '').trim();
        currentSection = {
          id: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          title: line.replace(/\*\*/g, '').trim(),
          content: ''
        };
        currentContent = [];
      } else if (currentSection) {
        currentContent.push(line);
      } else {
        // Content before first header
        if (!parsed.length && line.trim()) {
          currentSection = {
            id: 'introduction',
            title: 'Introduction',
            content: ''
          };
          currentContent.push(line);
        }
      }
    });

    // Save last section
    if (currentSection) {
      currentSection.content = currentContent.join('\n').trim();
      parsed.push(currentSection);
    }

    return parsed.length > 0 ? parsed : [{
      id: 'content',
      title: 'Privacy Policy',
      content: content
    }];
  };

  // Intersection observer for active section
  useEffect(() => {
    if (!contentRef.current || sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -60% 0px' }
    );

    const sectionElements = contentRef.current.querySelectorAll('[data-section]');
    sectionElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [sections]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Get icon for section
  const getSectionIcon = (id: string) => {
    return sectionIcons[id] || <Shield className="w-5 h-5" />;
  };

  // Format content with markdown-like styling
  const formatContent = (content: string) => {
    return content.split('\n\n').map((paragraph, index) => {
      // Handle bold text
      const formattedText = paragraph.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      
      // Handle list items
      if (paragraph.startsWith('- ')) {
        const items = paragraph.split('\n').filter(item => item.startsWith('- '));
        return (
          <ul key={index} className="list-disc list-inside space-y-2 mb-4 text-muted-foreground ml-4">
            {items.map((item, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: item.replace('- ', '').replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground">$1</strong>') }} />
            ))}
          </ul>
        );
      }
      
      // Regular paragraphs
      return (
        <p 
          key={index} 
          className="text-muted-foreground mb-4 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formattedText }}
        />
      );
    });
  };

  return (
    <BuyerLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(-1)}
              className="print:hidden"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Privacy Policy</h1>
              <p className="text-sm text-muted-foreground">
                How we collect, use, and protect your data
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="print:hidden gap-2"
          >
            <Printer className="w-4 h-4" />
            Print
          </Button>
        </div>

        <div className="flex gap-8">
          {/* Table of Contents */}
          {!loading && sections.length > 1 && (
            <LegalTableOfContents
              sections={sections}
              activeSection={activeSection}
              onSectionClick={scrollToSection}
            />
          )}

          {/* Content */}
          <Card className="flex-1 glass-card print:shadow-none print:border-0">
            <CardContent className="p-6 md:p-8" ref={contentRef}>
              {/* Header badge */}
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border/50 print:border-border">
                <div className="p-3 rounded-xl bg-primary/10 print:bg-transparent print:p-0">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold">{panel?.name || 'Panel'}</h2>
                  <p className="text-sm text-muted-foreground">Privacy Policy</p>
                </div>
              </div>

              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-6 w-48 mt-8" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {sections.map((section, index) => (
                    <section
                      key={section.id}
                      id={section.id}
                      data-section
                      className={index > 0 ? "mt-8 pt-6 border-t border-border/30" : ""}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary print:hidden">
                          {getSectionIcon(section.id)}
                        </div>
                        <h3 className="text-lg font-semibold text-foreground m-0">
                          {section.title}
                        </h3>
                      </div>
                      {formatContent(section.content)}
                    </section>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6 print:mt-12">
          Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleDateString() : new Date().toLocaleDateString()}
        </p>
      </motion.div>

      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white !important; }
          .glass-card { background: white !important; backdrop-filter: none !important; }
        }
      `}</style>
    </BuyerLayout>
  );
};

export default BuyerPrivacy;
