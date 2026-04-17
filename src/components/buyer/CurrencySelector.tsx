import { useState, useRef, useEffect } from "react";
import { useCurrency, currencies, Currency } from "@/contexts/CurrencyContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const allCurrencyList = (Object.values(currencies) as {
  code: Currency;
  name: string;
  symbol: string;
  flag: string;
}[]).sort((a, b) => a.code.localeCompare(b.code));

export const CurrencySelector = () => {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setSearch("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = allCurrencyList.filter(
    (c) =>
      search.trim() === "" ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 px-2.5 gap-1 font-medium"
          title="Change currency"
        >
          <span className="text-base leading-none">{currencies[currency]?.flag ?? ""}</span>
          <span className="text-xs font-semibold">{currency}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-0" onCloseAutoFocus={(e) => e.preventDefault()}>
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <Input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search currency…"
              className="h-8 pl-7 text-sm"
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
        </div>
        <ScrollArea className="h-64">
          <div className="p-1">
            {filtered.length === 0 ? (
              <p className="py-4 text-center text-xs text-muted-foreground">No match</p>
            ) : (
              filtered.map((curr) => (
                <button
                  key={curr.code}
                  onClick={() => {
                    setCurrency(curr.code);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base leading-none shrink-0">{curr.flag}</span>
                    <span className="font-medium shrink-0">{curr.code}</span>
                    <span className="text-muted-foreground text-xs truncate">{curr.name}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-muted-foreground text-xs">{curr.symbol}</span>
                    {currency === curr.code && <Check className="w-3.5 h-3.5 text-primary" />}
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
