import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Shield, ArrowLeft, Printer, Lock, Eye, Database, Users, Globe, Mail, Cookie, UserCheck, RefreshCw, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { useTenant } from "@/hooks/useTenant";
import { supabase } from "@/integrations/supabase/client";
import BuyerLayout from "./BuyerLayout";
import { LegalTableOfContents } from "@/components/buyer/LegalTableOfContents";
import { getDefaultPrivacyPolicy, LegalSection } from "@/lib/legal-content";
import { useLanguage } from "@/contexts/LanguageContext";

// Section icons mapping
const sectionIcons: Record<string, React.ElementType> = {
  'introduction': Shield,
  'information-collected': Database,
  'how-we-use': Eye,
  'information-sharing': Users,
  'data-security': Lock,
  'data-retention': Database,
  'your-rights': UserCheck,
  'cookies': Cookie,
  'third-party': Globe,
  'childrens-privacy': Shield,
  'international': Globe,
  'contact': Mail,
  'updates': RefreshCw,
  'content': Info,
};

const BuyerPrivacy = () => {
  const navigate = useNavigate();
  const { panel } = useTenant();
  const { t } = useLanguage();
  const [sections, setSections] = useState<LegalSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>("");
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const fetchPrivacyPolicy = async () => {
      if (!panel?.id) return;
      
      try {
        const { data } = await (supabase as any)
          .from('panel_settings_public')
          .select('privacy_policy, contact_info, updated_at')
          .eq('panel_id', panel.id)
          .single();
        
        const contactInfo = data?.contact_info as Record<string, any> | null;
        const supportEmail = contactInfo?.email;
        
        // If custom content exists and is substantial, parse it
        if (data?.privacy_policy && data.privacy_policy.length > 200) {
          const parsedSections = parseCustomContent(data.privacy_policy);
          setSections(parsedSections);
        } else {
          // Use default compliant content
          setSections(getDefaultPrivacyPolicy(panel?.name || 'Our Panel', supportEmail));
        }
        
        if (data?.updated_at) {
          setLastUpdated(new Date(data.updated_at).toLocaleDateString());
        } else {
          setLastUpdated(new Date().toLocaleDateString());
        }
      } catch (error) {
        console.error('Error fetching privacy policy:', error);
        setSections(getDefaultPrivacyPolicy(panel?.name || 'Our Panel'));
        setLastUpdated(new Date().toLocaleDateString());
      } finally {
        setLoading(false);
      }
    };

    fetchPrivacyPolicy();
  }, [panel?.id, panel?.name]);

  // Parse custom content into sections
  const parseCustomContent = (content: string): LegalSection[] => {
    const lines = content.split('\n');
    const parsedSections: LegalSection[] = [];
    let currentSection: LegalSection | null = null;
    let contentBuffer: string[] = [];

    lines.forEach((line) => {
      // Check for headers (## or ** style)
      const headerMatch = line.match(/^#{1,2}\s+(.+)$/) || line.match(/^\*\*(.+)\*\*$/);
      
      if (headerMatch) {
        // Save previous section
        if (currentSection) {
          currentSection.content = contentBuffer.join('\n').trim();
          parsedSections.push(currentSection);
        }
        
        const title = headerMatch[1].trim();
        const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        
        currentSection = { id, title, content: '' };
        contentBuffer = [];
      } else if (currentSection) {
        contentBuffer.push(line);
      }
    });

    // Don't forget the last section
    if (currentSection) {
      currentSection.content = contentBuffer.join('\n').trim();
      parsedSections.push(currentSection);
    }

    return parsedSections.length > 0 ? parsedSections : getDefaultPrivacyPolicy(panel?.name || 'Our Panel');
  };

  // Track active section on scroll
  useEffect(() => {
    if (sections.length === 0) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );

    sections.forEach((section) => {
      const el = sectionRefs.current[section.id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  const scrollToSection = (id: string) => {
    const el = sectionRefs.current[id];
    if (el) {
      // Use smaller offset since TOC is already collapsed when this is called on mobile
      const isMobile = window.innerWidth < 1024;
      const offset = isMobile ? 120 : 100;
      const y = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    setActiveSection(id);
  };

  const handlePrint = () => {
    window.print();
  };

  const getSectionIcon = (id: string) => {
    return sectionIcons[id] || Shield;
  };

  // Format content with markdown-like styling
  const formatContent = (content: string) => {
    return content.split('\n\n').map((paragraph, index) => {
      // Handle bold text
      const formattedParagraph = paragraph.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      
      // Handle list items
      if (paragraph.startsWith('- ')) {
        const items = paragraph.split('\n').filter(item => item.startsWith('- '));
        return (
          <ul key={index} className="list-disc list-inside space-y-1.5 mb-4 text-muted-foreground ml-4">
            {items.map((item, i) => (
              <li key={i} className="leading-relaxed">{item.replace('- ', '')}</li>
            ))}
          </ul>
        );
      }
      
      // Regular paragraphs
      return (
        <p 
          key={index} 
          className="text-muted-foreground mb-4 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formattedParagraph }}
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
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
              <h1 className="text-2xl font-bold">{t('nav.privacy')}</h1>
              <p className="text-sm text-muted-foreground">
                {t('legal.privacy_subtitle') || 'How we collect, use, and protect your data'}
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
            {t('common.print') || 'Print'}
          </Button>
        </div>

        {/* Main Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Table of Contents */}
          {!loading && sections.length > 0 && (
            <LegalTableOfContents
              sections={sections}
              activeSection={activeSection}
              onSectionClick={scrollToSection}
            />
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <Card className="glass-card">
              <CardContent className="p-6 md:p-8">
                {/* Document Header */}
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border/50 print:border-b-2">
                  <div className="p-3 rounded-xl bg-primary/10 print:bg-primary/20">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold">{panel?.name || 'Panel'}</h2>
                    <p className="text-sm text-muted-foreground">{t('nav.privacy')}</p>
                  </div>
                </div>

                {loading ? (
                  <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="space-y-3">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-5/6" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-8">
                    {sections.map((section) => {
                      const IconComponent = getSectionIcon(section.id);
                      return (
                        <section
                          key={section.id}
                          id={section.id}
                          ref={(el) => (sectionRefs.current[section.id] = el)}
                          className="scroll-mt-24 print:break-inside-avoid"
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-primary/10 print:bg-primary/20">
                              <IconComponent className="w-4 h-4 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground">
                              {section.title}
                            </h3>
                          </div>
                          <div className="pl-11 print:pl-0">
                            {formatContent(section.content)}
                          </div>
                        </section>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Footer */}
            <p className="text-center text-xs text-muted-foreground mt-6 print:mt-8">
              {t('legal.last_updated') || 'Last updated'}: {lastUpdated}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .glass-card, .glass-card * {
            visibility: visible;
          }
          .glass-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none !important;
            border: none !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </BuyerLayout>
  );
};

export default BuyerPrivacy;
