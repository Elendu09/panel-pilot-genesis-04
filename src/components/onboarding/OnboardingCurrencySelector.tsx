import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info } from "lucide-react";
import { 
  FlagUS, FlagEU, FlagGB, FlagNG, FlagIN, FlagZA, FlagKE, FlagGH, 
  FlagBR, FlagCA, FlagAU, FlagRU, FlagTR, FlagPK, FlagBD, FlagID, 
  FlagPH, FlagVN, FlagMX, FlagAE 
} from "@/components/icons/FlagIcons";

const currencies = [
  { code: 'USD', name: 'United States Dollar', symbol: '$', FlagIcon: FlagUS },
  { code: 'EUR', name: 'Euro', symbol: '€', FlagIcon: FlagEU },
  { code: 'GBP', name: 'British Pound', symbol: '£', FlagIcon: FlagGB },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', FlagIcon: FlagNG },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', FlagIcon: FlagIN },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', FlagIcon: FlagZA },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', FlagIcon: FlagKE },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵', FlagIcon: FlagGH },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', FlagIcon: FlagBR },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', FlagIcon: FlagCA },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', FlagIcon: FlagAU },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽', FlagIcon: FlagRU },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', FlagIcon: FlagTR },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', FlagIcon: FlagPK },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', FlagIcon: FlagBD },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', FlagIcon: FlagID },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', FlagIcon: FlagPH },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', FlagIcon: FlagVN },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$', FlagIcon: FlagMX },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', FlagIcon: FlagAE },
];

interface OnboardingCurrencySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const OnboardingCurrencySelector = ({ value, onChange }: OnboardingCurrencySelectorProps) => {
  const selectedCurrency = currencies.find(c => c.code === value);

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-base font-medium">Default Panel Currency</Label>
        <p className="text-sm text-muted-foreground mt-1">
          This is the primary currency for your SMM panel. All service prices will be displayed in this currency by default.
        </p>
      </div>
      
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-background/50">
          <SelectValue>
            {selectedCurrency ? (
              <span className="flex items-center gap-2">
                <selectedCurrency.FlagIcon className="w-5 h-4 rounded-sm" />
                <span>{selectedCurrency.code}</span>
                <span className="text-muted-foreground">({selectedCurrency.symbol})</span>
              </span>
            ) : (
              'Select currency'
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {currencies.map((currency) => (
            <SelectItem key={currency.code} value={currency.code}>
              <span className="flex items-center gap-2">
                <currency.FlagIcon className="w-5 h-4 rounded-sm" />
                <span className="font-medium">{currency.code}</span>
                <span className="text-muted-foreground">
                  {currency.name} ({currency.symbol})
                </span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
        <p className="flex items-center gap-1.5 font-medium">
          <Info className="w-3.5 h-3.5" />
          How this works:
        </p>
        <ul className="list-disc list-inside space-y-0.5 ml-1">
          <li>Service prices will display in {selectedCurrency?.code || 'your selected currency'}</li>
          <li>Buyers see prices in this currency when browsing your services</li>
          <li>You can enable multi-currency later to let buyers switch currencies</li>
          <li>All transactions and earnings are tracked in this currency</li>
        </ul>
      </div>
    </div>
  );
};
