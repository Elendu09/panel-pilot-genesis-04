import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { List, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface DocsTableOfContentsProps {
  content: string;
}

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export function DocsTableOfContents({ content }: DocsTableOfContentsProps) {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Extract headings from content
  useEffect(() => {
    if (!content) return;

    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    const extracted: TOCItem[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      if (level <= 3) {
        extracted.push({ id, text, level });
      }
    }

    setHeadings(extracted);
  }, [content]);

  // Track active heading and scroll progress
  useEffect(() => {
    const handleScroll = () => {
      // Calculate scroll progress
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(Math.min(scrollProgress, 100));
      setShowBackToTop(scrollTop > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track active heading on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -80% 0px' }
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <aside className="hidden xl:block w-64 shrink-0">
      <div className="sticky top-24 pl-8">
        {/* Progress indicator */}
        <div className="h-1 w-full bg-muted rounded-full mb-4 overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-primary to-primary-glow rounded-full"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <List className="h-4 w-4 text-muted-foreground" />
            On this page
          </h4>
          <span className="text-xs text-muted-foreground">
            {Math.round(progress)}%
          </span>
        </div>

        <ScrollArea className="h-[calc(100vh-14rem)]">
          <nav className="space-y-0.5 pr-4">
            {headings.map((heading, index) => (
              <button
                key={`${heading.id}-${index}`}
                onClick={() => scrollToHeading(heading.id)}
                className={cn(
                  "block w-full text-left text-sm py-1.5 px-2 rounded-md transition-all duration-200 hover:bg-muted/50",
                  heading.level === 1 && "pl-2 font-medium",
                  heading.level === 2 && "pl-2",
                  heading.level === 3 && "pl-6 text-xs",
                  activeId === heading.id
                    ? "text-primary bg-primary/10 font-medium border-l-2 border-primary -ml-0.5 pl-[calc(0.5rem+2px)]"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {heading.text}
              </button>
            ))}
          </nav>
        </ScrollArea>

        {/* Back to top button */}
        <AnimatePresence>
          {showBackToTop && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-4"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={scrollToTop}
                className="w-full text-xs"
              >
                <ChevronUp className="h-3 w-3 mr-1" />
                Back to top
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}
