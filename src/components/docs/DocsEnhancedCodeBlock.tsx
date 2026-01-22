import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocsEnhancedCodeBlockProps {
  code: string;
  language?: string;
}

const languageLabels: Record<string, string> = {
  bash: "Bash",
  shell: "Shell",
  json: "JSON",
  javascript: "JavaScript",
  typescript: "TypeScript",
  python: "Python",
  php: "PHP",
  curl: "cURL",
  html: "HTML",
  css: "CSS",
  sql: "SQL",
  go: "Go",
  ruby: "Ruby",
};

// Syntax highlighting patterns
const highlightCode = (code: string, language: string): string => {
  let highlighted = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const patterns: Record<string, { regex: RegExp; className: string }[]> = {
    bash: [
      { regex: /(curl|wget|npm|yarn|pnpm|git|cd|ls|mkdir|rm|echo|export)/g, className: 'text-cyan-400' },
      { regex: /(-X\s+\w+|-H\s+|-d\s+|--\w+)/g, className: 'text-yellow-400' },
      { regex: /(https?:\/\/[^\s"']+)/g, className: 'text-green-400' },
      { regex: /(".*?"|'.*?')/g, className: 'text-amber-300' },
      { regex: /(#.*$)/gm, className: 'text-zinc-500 italic' },
    ],
    json: [
      { regex: /("[\w-]+")\s*:/g, className: 'text-purple-400' },
      { regex: /:\s*(".*?")/g, className: 'text-green-400' },
      { regex: /:\s*(\d+|true|false|null)/g, className: 'text-amber-400' },
    ],
    javascript: [
      { regex: /\b(const|let|var|function|async|await|return|import|export|from|if|else|try|catch)\b/g, className: 'text-purple-400' },
      { regex: /\b(true|false|null|undefined)\b/g, className: 'text-amber-400' },
      { regex: /(\/\/.*$)/gm, className: 'text-zinc-500 italic' },
      { regex: /(".*?"|'.*?'|`.*?`)/g, className: 'text-green-400' },
      { regex: /\b(\d+)\b/g, className: 'text-amber-400' },
    ],
    typescript: [
      { regex: /\b(const|let|var|function|async|await|return|import|export|from|if|else|try|catch|interface|type)\b/g, className: 'text-purple-400' },
      { regex: /\b(true|false|null|undefined|string|number|boolean)\b/g, className: 'text-amber-400' },
      { regex: /(\/\/.*$)/gm, className: 'text-zinc-500 italic' },
      { regex: /(".*?"|'.*?'|`.*?`)/g, className: 'text-green-400' },
    ],
    php: [
      { regex: /(&lt;\?php|\?&gt;)/g, className: 'text-red-400' },
      { regex: /(\$\w+)/g, className: 'text-cyan-400' },
      { regex: /\b(echo|print|return|function|class|public|private|protected|new|if|else|foreach|while)\b/g, className: 'text-purple-400' },
      { regex: /(".*?"|'.*?')/g, className: 'text-green-400' },
      { regex: /(\/\/.*$|#.*$)/gm, className: 'text-zinc-500 italic' },
    ],
    python: [
      { regex: /\b(import|from|def|class|return|if|else|elif|try|except|with|as|for|in|while|True|False|None)\b/g, className: 'text-purple-400' },
      { regex: /(#.*$)/gm, className: 'text-zinc-500 italic' },
      { regex: /(".*?"|'.*?')/g, className: 'text-green-400' },
      { regex: /\b(\d+)\b/g, className: 'text-amber-400' },
    ],
    sql: [
      { regex: /\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|TABLE|INTO|VALUES|AND|OR|NOT|NULL|PRIMARY|KEY|FOREIGN|REFERENCES)\b/gi, className: 'text-purple-400' },
      { regex: /('.*?')/g, className: 'text-green-400' },
      { regex: /(--.*$)/gm, className: 'text-zinc-500 italic' },
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

export function DocsEnhancedCodeBlock({ code, language = "bash" }: DocsEnhancedCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayLanguage = languageLabels[language] || language.toUpperCase();
  const highlighted = highlightCode(code, language);

  return (
    <div className="my-4 rounded-lg overflow-hidden border border-border bg-zinc-950 dark:bg-zinc-900 group">
      {/* Header with language label and copy button */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-800/80 border-b border-zinc-700/50">
        <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
          {displayLanguage}
        </span>
        <Button
          size="sm"
          variant="ghost"
          className={cn(
            "h-7 px-2.5 text-xs font-medium transition-all",
            copied 
              ? "bg-green-600/20 text-green-400 hover:bg-green-600/20" 
              : "bg-zinc-700/50 text-zinc-300 hover:bg-zinc-600/50 hover:text-white"
          )}
          onClick={copyToClipboard}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 mr-1" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 mr-1" />
              Copy
            </>
          )}
        </Button>
      </div>
      
      {/* Code content */}
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
        <code 
          className="font-mono text-zinc-100"
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </pre>
    </div>
  );
}
