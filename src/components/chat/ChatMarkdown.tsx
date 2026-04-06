import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface ChatMarkdownProps {
  content: string;
  className?: string;
}

export const ChatMarkdown = ({ content, className }: ChatMarkdownProps) => {
  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-1 last:mb-0 leading-relaxed">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          ul: ({ children }) => <ul className="list-disc list-inside my-1 space-y-0.5">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside my-1 space-y-0.5">{children}</ol>,
          li: ({ children }) => <li className="text-sm">{children}</li>,
          code: ({ children }) => (
            <code className="bg-background/50 px-1 py-0.5 rounded text-xs font-mono">{children}</code>
          ),
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
