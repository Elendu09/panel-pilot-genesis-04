import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleClick = (id: string) => {
    onSectionClick(id);
    if (isMobile) setIsExpanded(false);
  };

  // Mobile collapsible version
  if (isMobile) {
    return (
      <div className="mb-6 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        <Button
          variant="ghost"
          className="w-full justify-between p-4 h-auto"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="flex items-center gap-2 font-medium">
            <List className="w-4 h-4" />
            Table of Contents
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
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => handleClick(section.id)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                  activeSection === section.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {section.title}
              </button>
            ))}
          </nav>
        </motion.div>
      </div>
    );
  }

  // Desktop sticky sidebar version
  return (
    <div className="hidden lg:block sticky top-24 w-64 shrink-0">
      <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <List className="w-4 h-4" />
          Table of Contents
        </h3>
        <nav className="space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => handleClick(section.id)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-sm transition-all",
                activeSection === section.id
                  ? "bg-primary/10 text-primary font-medium border-l-2 border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {section.title}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};
