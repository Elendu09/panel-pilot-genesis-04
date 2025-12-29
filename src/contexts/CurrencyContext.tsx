import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'NGN' | 'INR' | 'BRL' | 'TRY' | 'RUB' | 'AED' | 'CAD';

interface CurrencyConfig {
  code: Currency;
  symbol: string;
  name: string;
  rate: number;
  flag: string;
}

export const currencies: Record<Currency, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1, flag: '🇺🇸' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92, flag: '🇪🇺' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.79, flag: '🇬🇧' },
  NGN: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', rate: 1550, flag: '🇳🇬' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 83, flag: '🇮🇳' },
  BRL: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', rate: 4.97, flag: '🇧🇷' },
  TRY: { code: 'TRY', symbol: '₺', name: 'Turkish Lira', rate: 32, flag: '🇹🇷' },
  RUB: { code: 'RUB', symbol: '₽', name: 'Russian Ruble', rate: 92, flag: '🇷🇺' },
  AED: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', rate: 3.67, flag: '🇦🇪' },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rate: 1.36, flag: '🇨🇦' },
};

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (usdAmount: number) => string;
  convertPrice: (usdAmount: number) => number;
  currencyConfig: CurrencyConfig;
  allCurrencies: typeof currencies;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('preferred_currency');
      if (saved && currencies[saved as Currency]) {
        return saved as Currency;
      }
    }
    return 'USD';
  });

  useEffect(() => {
    localStorage.setItem('preferred_currency', currency);
  }, [currency]);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
  };

  const convertPrice = (usdAmount: number): number => {
    return usdAmount * currencies[currency].rate;
  };

  const formatPrice = (usdAmount: number): string => {
    const converted = convertPrice(usdAmount);
    const config = currencies[currency];
    
    // Format based on currency - show more decimals for very low prices
    if (currency === 'NGN' || currency === 'INR' || currency === 'RUB') {
      return `${config.symbol}${converted.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    }
    
    // For low prices (less than 0.01), show 3 decimal places
    if (converted < 0.01 && converted > 0) {
      return `${config.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 4 })}`;
    }
    
    return `${config.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const currencyConfig = currencies[currency];

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency,
      formatPrice,
      convertPrice,
      currencyConfig,
      allCurrencies: currencies,
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
