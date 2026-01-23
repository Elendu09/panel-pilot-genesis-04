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

// Improved syntax highlighting with token-based approach to prevent nested spans
const highlightCode = (code: string, language: string): string => {
  let escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const tokens: string[] = [];
  const tokenize = (match: string, className: string): string => {
    const idx = tokens.length;
    tokens.push(`<span class="${className}">${match}</span>`);
    return `\x00${idx}\x00`;
  };

  switch (language) {
    case 'bash':
    case 'shell':
    case 'curl':
      escaped = escaped.replace(/(#[^\n]*)/g, (m) => tokenize(m, 'text-zinc-500 italic'));
      escaped = escaped.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, (m) => tokenize(m, 'text-amber-300'));
      escaped = escaped.replace(/\b(curl|wget|npm|yarn|pnpm|git|cd|ls|mkdir|rm|echo|export|pip|python|node|php)\b/g, (m) => tokenize(m, 'text-cyan-400 font-semibold'));
      escaped = escaped.replace(/(\s-[A-Za-z]+|\s--[a-z-]+)/g, (m) => tokenize(m, 'text-yellow-400'));
      break;

    case 'json':
      escaped = escaped.replace(/("[\w-]+")\s*:/g, (m, key) => tokenize(key, 'text-purple-400') + ':');
      escaped = escaped.replace(/:\s*("(?:[^"\\]|\\.)*")/g, (m, val) => ': ' + tokenize(val, 'text-emerald-400'));
      escaped = escaped.replace(/:\s*(\d+\.?\d*|true|false|null)\b/g, (m, val) => ': ' + tokenize(val, 'text-amber-400'));
      break;

    case 'javascript':
    case 'typescript':
    case 'js':
    case 'ts':
      escaped = escaped.replace(/(\/\/[^\n]*)/g, (m) => tokenize(m, 'text-zinc-500 italic'));
      escaped = escaped.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g, (m) => tokenize(m, 'text-emerald-400'));
      escaped = escaped.replace(/\b(const|let|var|function|async|await|return|import|export|from|if|else|try|catch|new|class|this|interface|type)\b/g, (m) => tokenize(m, 'text-purple-400'));
      escaped = escaped.replace(/\b(true|false|null|undefined|string|number|boolean)\b/g, (m) => tokenize(m, 'text-amber-400'));
      break;

    case 'php':
      escaped = escaped.replace(/(&lt;\?php|\?&gt;)/g, (m) => tokenize(m, 'text-red-400'));
      escaped = escaped.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, (m) => tokenize(m, 'text-emerald-400'));
      escaped = escaped.replace(/(\$\w+)/g, (m) => tokenize(m, 'text-cyan-400'));
      escaped = escaped.replace(/\b(echo|print|return|function|class|public|private|protected|new|if|else|foreach|while|array|use|namespace)\b/g, (m) => tokenize(m, 'text-purple-400'));
      break;

    case 'python':
      escaped = escaped.replace(/(#[^\n]*)/g, (m) => tokenize(m, 'text-zinc-500 italic'));
      escaped = escaped.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, (m) => tokenize(m, 'text-emerald-400'));
      escaped = escaped.replace(/\b(import|from|def|class|return|if|else|elif|try|except|with|as|for|in|while|print|self|requests)\b/g, (m) => tokenize(m, 'text-purple-400'));
      escaped = escaped.replace(/\b(True|False|None)\b/g, (m) => tokenize(m, 'text-amber-400'));
      break;

    case 'sql':
      escaped = escaped.replace(/(--[^\n]*)/g, (m) => tokenize(m, 'text-zinc-500 italic'));
      escaped = escaped.replace(/('(?:[^'\\]|\\.)*')/g, (m) => tokenize(m, 'text-emerald-400'));
      escaped = escaped.replace(/\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|INTO|VALUES|SET|AND|OR|NOT|IN|IS|NULL|JOIN|LEFT|RIGHT|INNER|ON|ORDER|BY|LIMIT|GROUP|HAVING|TABLE|PRIMARY|KEY|FOREIGN|REFERENCES)\b/gi, (m) => tokenize(m, 'text-cyan-400'));
      escaped = escaped.replace(/\b(\d+)\b/g, (m) => tokenize(m, 'text-amber-400'));
      break;

    case 'go':
    case 'ruby':
      escaped = escaped.replace(/(\/\/[^\n]*|#[^\n]*)/g, (m) => tokenize(m, 'text-zinc-500 italic'));
      escaped = escaped.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g, (m) => tokenize(m, 'text-emerald-400'));
      escaped = escaped.replace(/\b(func|package|import|return|if|else|for|range|def|end|class|module|require)\b/g, (m) => tokenize(m, 'text-purple-400'));
      break;

    default:
      escaped = escaped.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, (m) => tokenize(m, 'text-amber-300'));
  }

  escaped = escaped.replace(/\x00(\d+)\x00/g, (_, idx) => tokens[parseInt(idx)]);
  return escaped;
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
