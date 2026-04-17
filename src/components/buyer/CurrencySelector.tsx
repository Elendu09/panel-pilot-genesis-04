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
import {
  FlagUS, FlagEU, FlagGB, FlagCA, FlagAU, FlagNZ, FlagCH,
  FlagNG, FlagKE, FlagGH, FlagZA, FlagEG, FlagMA, FlagXF,
  FlagIN, FlagPK, FlagBD, FlagLK, FlagNP,
  FlagPH, FlagID, FlagTH, FlagVN, FlagMY, FlagSG, FlagHK, FlagJP, FlagKR, FlagCN, FlagTW,
  FlagBR, FlagMX, FlagCO, FlagAR, FlagCL, FlagPE,
  FlagTR, FlagRU, FlagUA, FlagPL, FlagCZ, FlagHU, FlagRO, FlagBG, FlagSE, FlagNO, FlagDK,
  FlagAE,
} from "@/components/icons/FlagIcons";
import type { FlagProps } from "@/components/icons/FlagIcons";

const FLAG_MAP: Record<Currency, React.FC<FlagProps>> = {
  USD: FlagUS, EUR: FlagEU, GBP: FlagGB, CAD: FlagCA, AUD: FlagAU, NZD: FlagNZ, CHF: FlagCH,
  NGN: FlagNG, KES: FlagKE, GHS: FlagGH, ZAR: FlagZA, EGP: FlagEG, MAD: FlagMA,
  XOF: FlagXF, XAF: FlagXF,
  INR: FlagIN, PKR: FlagPK, BDT: FlagBD, LKR: FlagLK, NPR: FlagNP,
  PHP: FlagPH, IDR: FlagID, THB: FlagTH, VND: FlagVN, MYR: FlagMY,
  SGD: FlagSG, HKD: FlagHK, JPY: FlagJP, KRW: FlagKR, CNY: FlagCN, TWD: FlagTW,
  BRL: FlagBR, MXN: FlagMX, COP: FlagCO, ARS: FlagAR, CLP: FlagCL, PEN: FlagPE,
  TRY: FlagTR, RUB: FlagRU, UAH: FlagUA, PLN: FlagPL, CZK: FlagCZ,
  HUF: FlagHU, RON: FlagRO, BGN: FlagBG, SEK: FlagSE, NOK: FlagNO, DKK: FlagDK,
  AED: FlagAE,
};

const allCurrencyList = (Object.values(currencies) as {
  code: Currency; name: string; symbol: string; flag: string;
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

  const TriggerFlag = FLAG_MAP[currency];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 px-2.5 gap-1.5 font-medium"
          title="Change currency"
        >
          {TriggerFlag && <TriggerFlag className="w-5 h-4 rounded-sm shrink-0" />}
          <span className="text-xs font-semibold">{currency}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52 p-0" onCloseAutoFocus={(e) => e.preventDefault()}>
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <Input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="h-7 pl-7 text-sm"
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
        </div>

        <ScrollArea className="h-60">
          <div className="p-1">
            {filtered.length === 0 ? (
              <p className="py-4 text-center text-xs text-muted-foreground">No match</p>
            ) : (
              filtered.map((curr) => {
                const FlagIcon = FLAG_MAP[curr.code];
                return (
                  <button
                    key={curr.code}
                    onClick={() => { setCurrency(curr.code); setOpen(false); }}
                    className="flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {FlagIcon
                        ? <FlagIcon className="w-5 h-4 rounded-sm shrink-0" />
                        : <span className="w-5 h-4 rounded-sm bg-muted shrink-0" />
                      }
                      <span className="font-medium">{curr.code}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-muted-foreground text-xs">({curr.symbol})</span>
                      {currency === curr.code && <Check className="w-3.5 h-3.5 text-primary" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
