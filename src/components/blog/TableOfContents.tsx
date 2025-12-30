import { cn, TOCItem } from "@/lib/utils";
import { List } from "lucide-react";

interface TableOfContentsProps {
  items: TOCItem[];
  activeId: string;
}

export const TableOfContents = ({ items, activeId }: TableOfContentsProps) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  if (items.length === 0) return null;

  return (
    <nav className="hidden lg:block sticky top-24 w-64 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="flex items-center gap-2 mb-4">
        <List className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
          On This Page
        </h3>
      </div>
      <ul className="space-y-2 text-sm border-l border-border">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(e) => handleClick(e, item.id)}
              className={cn(
                "block py-1 transition-colors -ml-px border-l-2",
                item.level === 3 ? "pl-6" : "pl-4",
                activeId === item.id
                  ? "text-primary border-primary font-medium"
                  : "text-muted-foreground hover:text-foreground border-transparent hover:border-muted-foreground/50"
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};
