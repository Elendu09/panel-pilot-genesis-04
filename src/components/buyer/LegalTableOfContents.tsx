import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface Section {
  id: string;
  title: string;
}

interface LegalTableOfContentsProps {
  sections: Section[];
  activeSection: string;
  onSectionClick: (id: string) => void;
}

export const LegalTableOfContents = ({
  sections,
  activeSection,
  onSectionClick,
}: LegalTableOfContentsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Account for sticky header
      const y = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
    onSectionClick(id);
    if (isMobile) setIsExpanded(false);
  };

  const tocTitle = t('legal.table_of_contents') || 'Table of Contents';

  // Mobile collapsible version
  if (isMobile) {
    return (
      <div className="mb-6 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden print:hidden">
        <Button
          variant="ghost"
          className="w-full justify-between p-4 h-auto"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="flex items-center gap-2 font-medium">
            <List className="w-4 h-4" />
            {tocTitle}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>
        
        <motion.div
          initial={false}
          animate={{ height: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <nav className="p-4 pt-0 space-y-1">
            {sections.map((section, index) => (
              <button
                key={section.id}
                onClick={() => handleClick(section.id)}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2",
                  activeSection === section.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <span className="text-xs text-muted-foreground w-5">{index + 1}.</span>
                <span className="flex-1 truncate">{section.title}</span>
              </button>
            ))}
          </nav>
        </motion.div>
      </div>
    );
  }

  // Desktop sticky sidebar version
  return (
    <div className="hidden lg:block sticky top-24 w-64 shrink-0 print:hidden">
      <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
          <List className="w-4 h-4" />
          {tocTitle}
        </h3>
        <nav className="space-y-0.5 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
          {sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => handleClick(section.id)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2",
                activeSection === section.id
                  ? "bg-primary/10 text-primary font-medium border-l-2 border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <span className="text-xs text-muted-foreground/70 w-4">{index + 1}.</span>
              <span className="flex-1 truncate">{section.title}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};
