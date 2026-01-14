import { useCurrency, currencies, Currency } from "@/contexts/CurrencyContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { 
  FlagUS, FlagEU, FlagGB, FlagNG, FlagIN, FlagBR, FlagTR, FlagRU, FlagAE, FlagCA 
} from "@/components/icons/FlagIcons";

interface CurrencyItem {
  code: Currency;
  name: string;
  symbol: string;
  FlagIcon: React.FC<{ className?: string }>;
}

const currencyList: CurrencyItem[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', FlagIcon: FlagUS },
  { code: 'EUR', name: 'Euro', symbol: '€', FlagIcon: FlagEU },
  { code: 'GBP', name: 'British Pound', symbol: '£', FlagIcon: FlagGB },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', FlagIcon: FlagNG },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', FlagIcon: FlagIN },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', FlagIcon: FlagBR },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', FlagIcon: FlagTR },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽', FlagIcon: FlagRU },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', FlagIcon: FlagAE },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', FlagIcon: FlagCA },
];

export const CurrencySelector = () => {
  const { currency, setCurrency, currencyConfig } = useCurrency();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 px-2.5 gap-1 font-medium" title="Change currency">
          <span className="text-xs font-semibold">{currency}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {currencyList.map((curr) => {
          const FlagComponent = curr.FlagIcon;
          return (
            <DropdownMenuItem
              key={curr.code}
              onClick={() => setCurrency(curr.code)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <FlagComponent className="w-5 h-4 rounded-sm" />
                <span>{curr.code}</span>
                <span className="text-muted-foreground text-xs">({curr.symbol})</span>
              </div>
              {currency === curr.code && <Check className="w-4 h-4 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
