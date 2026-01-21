import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Copy, Terminal } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CodeExample {
  language: string;
  label: string;
  code: string;
}

interface DocsCodeBlockProps {
  code?: string;
  language?: string;
  title?: string;
  examples?: CodeExample[];
  showLineNumbers?: boolean;
}

// Simple syntax highlighting for common patterns
const highlightSyntax = (code: string, language: string): string => {
  let highlighted = code;

  // Escape HTML entities
  highlighted = highlighted
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Common patterns for syntax highlighting
  const patterns: Record<string, { regex: RegExp; className: string }[]> = {
    bash: [
      { regex: /(curl|wget|npm|yarn|pnpm|git|cd|ls|mkdir|rm|echo|export)/g, className: 'text-cyan-400' },
      { regex: /(-X\s+\w+|-H\s+|-d\s+|--\w+)/g, className: 'text-yellow-400' },
      { regex: /(https?:\/\/[^\s"']+)/g, className: 'text-green-400' },
      { regex: /(".*?"|'.*?')/g, className: 'text-amber-300' },
      { regex: /(#.*$)/gm, className: 'text-muted-foreground italic' },
    ],
    json: [
      { regex: /("[\w-]+")\s*:/g, className: 'text-purple-400' },
      { regex: /:\s*(".*?")/g, className: 'text-green-400' },
      { regex: /:\s*(\d+|true|false|null)/g, className: 'text-amber-400' },
    ],
    javascript: [
      { regex: /\b(const|let|var|function|async|await|return|import|export|from|if|else|try|catch)\b/g, className: 'text-purple-400' },
      { regex: /\b(true|false|null|undefined)\b/g, className: 'text-amber-400' },
      { regex: /(\/\/.*$)/gm, className: 'text-muted-foreground italic' },
      { regex: /(".*?"|'.*?'|`.*?`)/g, className: 'text-green-400' },
      { regex: /\b(\d+)\b/g, className: 'text-amber-400' },
    ],
    php: [
      { regex: /(&lt;\?php|\?&gt;)/g, className: 'text-red-400' },
      { regex: /(\$\w+)/g, className: 'text-cyan-400' },
      { regex: /\b(echo|print|return|function|class|public|private|protected|new|if|else|foreach|while)\b/g, className: 'text-purple-400' },
      { regex: /(".*?"|'.*?')/g, className: 'text-green-400' },
      { regex: /(\/\/.*$|#.*$)/gm, className: 'text-muted-foreground italic' },
    ],
    python: [
      { regex: /\b(import|from|def|class|return|if|else|elif|try|except|with|as|for|in|while|True|False|None)\b/g, className: 'text-purple-400' },
      { regex: /(#.*$)/gm, className: 'text-muted-foreground italic' },
      { regex: /(".*?"|'.*?'|"""[\s\S]*?"""|'''[\s\S]*?''')/g, className: 'text-green-400' },
      { regex: /\b(\d+)\b/g, className: 'text-amber-400' },
    ],
  };

  const langPatterns = patterns[language] || patterns['bash'];
  
  langPatterns.forEach(({ regex, className }) => {
    highlighted = highlighted.replace(regex, (match) => 
      `<span class="${className}">${match}</span>`
    );
  });

  return highlighted;
};

export function DocsCodeBlock({ 
  code, 
  language = "bash", 
  title, 
  examples,
  showLineNumbers = false 
}: DocsCodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState(examples?.[0]?.language || language);

  const copyToClipboard = async (textToCopy: string) => {
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const renderCode = (codeText: string, lang: string) => {
    const lines = codeText.split('\n');
    const highlighted = highlightSyntax(codeText, lang);

    return (
      <div className="relative">
        <pre className={cn(
          "p-4 overflow-x-auto text-sm font-mono leading-relaxed",
          showLineNumbers && "pl-12"
        )}>
          {showLineNumbers && (
            <div className="absolute left-0 top-0 pt-4 pl-4 select-none text-muted-foreground/50 text-right w-8">
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
          )}
          <code 
            dangerouslySetInnerHTML={{ __html: highlighted }}
            className="text-foreground/90"
          />
        </pre>
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 hover:bg-background/80"
          onClick={() => copyToClipboard(codeText)}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
    );
  };

  // Multi-language tabs view
  if (examples && examples.length > 1) {
    return (
      <div className="my-6 rounded-lg overflow-hidden border border-border bg-muted/30 backdrop-blur-sm group">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border">
            <TabsList className="h-8 bg-transparent p-0 gap-1">
              {examples.map((example) => (
                <TabsTrigger
                  key={example.language}
                  value={example.language}
                  className="h-7 px-3 text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded"
                >
                  {example.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {title && (
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Terminal className="h-3 w-3" />
                {title}
              </span>
            )}
          </div>
          {examples.map((example) => (
            <TabsContent key={example.language} value={example.language} className="m-0">
              {renderCode(example.code, example.language)}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    );
  }

  // Single code block view
  return (
    <div className="my-6 rounded-lg overflow-hidden border border-border bg-muted/30 backdrop-blur-sm group">
      {title && (
        <div className="px-4 py-2 bg-muted/50 border-b border-border text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <Terminal className="h-3 w-3" />
          {title}
        </div>
      )}
      {renderCode(code || '', language)}
    </div>
  );
}