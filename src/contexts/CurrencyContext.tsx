import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Extended currency list with 40+ currencies
export type Currency = 
  | 'USD' | 'EUR' | 'GBP' | 'NGN' | 'INR' | 'BRL' | 'TRY' | 'RUB' | 'AED' | 'CAD'
  | 'KES' | 'GHS' | 'ZAR' | 'PKR' | 'PHP' | 'IDR' | 'MXN' | 'COP' | 'ARS' | 'CLP'
  | 'PEN' | 'EGP' | 'MAD' | 'XOF' | 'XAF' | 'THB' | 'VND' | 'MYR' | 'SGD' | 'HKD'
  | 'JPY' | 'KRW' | 'CNY' | 'TWD' | 'AUD' | 'NZD' | 'CHF' | 'SEK' | 'NOK' | 'DKK'
  | 'PLN' | 'CZK' | 'HUF' | 'RON' | 'BGN' | 'UAH' | 'BDT' | 'LKR' | 'NPR';

interface CurrencyConfig {
  code: Currency;
  symbol: string;
  name: string;
  rate: number;
  flag: string;
}

// Comprehensive currency database
export const currencies: Record<Currency, CurrencyConfig> = {
  // Major Currencies
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1, flag: '🇺🇸' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92, flag: '🇪🇺' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.79, flag: '🇬🇧' },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rate: 1.36, flag: '🇨🇦' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rate: 1.55, flag: '🇦🇺' },
  NZD: { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', rate: 1.68, flag: '🇳🇿' },
  CHF: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', rate: 0.89, flag: '🇨🇭' },
  
  // African Currencies
  NGN: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', rate: 1550, flag: '🇳🇬' },
  KES: { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', rate: 129, flag: '🇰🇪' },
  GHS: { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', rate: 12.5, flag: '🇬🇭' },
  ZAR: { code: 'ZAR', symbol: 'R', name: 'South African Rand', rate: 18.5, flag: '🇿🇦' },
  EGP: { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', rate: 31, flag: '🇪🇬' },
  MAD: { code: 'MAD', symbol: 'MAD', name: 'Moroccan Dirham', rate: 10, flag: '🇲🇦' },
  XOF: { code: 'XOF', symbol: 'CFA', name: 'West African CFA', rate: 610, flag: '🌍' },
  XAF: { code: 'XAF', symbol: 'FCFA', name: 'Central African CFA', rate: 610, flag: '🌍' },
  
  // Asian Currencies
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 83, flag: '🇮🇳' },
  PKR: { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', rate: 278, flag: '🇵🇰' },
  BDT: { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', rate: 110, flag: '🇧🇩' },
  LKR: { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee', rate: 320, flag: '🇱🇰' },
  NPR: { code: 'NPR', symbol: 'रू', name: 'Nepalese Rupee', rate: 133, flag: '🇳🇵' },
  PHP: { code: 'PHP', symbol: '₱', name: 'Philippine Peso', rate: 56, flag: '🇵🇭' },
  IDR: { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', rate: 15800, flag: '🇮🇩' },
  THB: { code: 'THB', symbol: '฿', name: 'Thai Baht', rate: 35, flag: '🇹🇭' },
  VND: { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', rate: 24500, flag: '🇻🇳' },
  MYR: { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', rate: 4.7, flag: '🇲🇾' },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rate: 1.35, flag: '🇸🇬' },
  HKD: { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', rate: 7.8, flag: '🇭🇰' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 150, flag: '🇯🇵' },
  KRW: { code: 'KRW', symbol: '₩', name: 'South Korean Won', rate: 1350, flag: '🇰🇷' },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', rate: 7.2, flag: '🇨🇳' },
  TWD: { code: 'TWD', symbol: 'NT$', name: 'Taiwan Dollar', rate: 32, flag: '🇹🇼' },
  
  // LATAM Currencies
  BRL: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', rate: 4.97, flag: '🇧🇷' },
  MXN: { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso', rate: 17.2, flag: '🇲🇽' },
  COP: { code: 'COP', symbol: 'COL$', name: 'Colombian Peso', rate: 4000, flag: '🇨🇴' },
  ARS: { code: 'ARS', symbol: 'AR$', name: 'Argentine Peso', rate: 850, flag: '🇦🇷' },
  CLP: { code: 'CLP', symbol: 'CL$', name: 'Chilean Peso', rate: 900, flag: '🇨🇱' },
  PEN: { code: 'PEN', symbol: 'S/', name: 'Peruvian Sol', rate: 3.7, flag: '🇵🇪' },
  
  // European Currencies
  TRY: { code: 'TRY', symbol: '₺', name: 'Turkish Lira', rate: 32, flag: '🇹🇷' },
  RUB: { code: 'RUB', symbol: '₽', name: 'Russian Ruble', rate: 92, flag: '🇷🇺' },
  UAH: { code: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia', rate: 37, flag: '🇺🇦' },
  PLN: { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', rate: 4.0, flag: '🇵🇱' },
  CZK: { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna', rate: 23, flag: '🇨🇿' },
  HUF: { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint', rate: 360, flag: '🇭🇺' },
  RON: { code: 'RON', symbol: 'lei', name: 'Romanian Leu', rate: 4.6, flag: '🇷🇴' },
  BGN: { code: 'BGN', symbol: 'лв', name: 'Bulgarian Lev', rate: 1.8, flag: '🇧🇬' },
  SEK: { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', rate: 10.5, flag: '🇸🇪' },
  NOK: { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', rate: 10.8, flag: '🇳🇴' },
  DKK: { code: 'DKK', symbol: 'kr', name: 'Danish Krone', rate: 6.9, flag: '🇩🇰' },
  
  // Middle East
  AED: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', rate: 3.67, flag: '🇦🇪' },
};

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  setDefaultFromPanel: (panelCurrency: string) => void;
  formatPrice: (usdAmount: number) => string;
  convertPrice: (usdAmount: number) => number;
  convertToUSD: (amount: number, fromCurrency?: Currency) => number;
  convertBetween: (amount: number, from: Currency, to: Currency) => number;
  currencyConfig: CurrencyConfig;
  allCurrencies: typeof currencies;
  panelCurrency: Currency;
  setPanelCurrency: (currency: Currency) => void;
  liveRates: Record<string, number>;
  refreshRates: () => Promise<void>;
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

  const [panelCurrency, setPanelCurrencyState] = useState<Currency>('USD');
  const [liveRates, setLiveRates] = useState<Record<string, number>>({});

  useEffect(() => {
    localStorage.setItem('preferred_currency', currency);
  }, [currency]);

  // Fetch live rates from database on mount
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const { data } = await supabase
          .from('currency_rates')
          .select('currency_code, rate_to_usd');
        
        if (data && data.length > 0) {
          const rates: Record<string, number> = {};
          data.forEach((r: any) => {
            rates[r.currency_code] = r.rate_to_usd;
          });
          setLiveRates(rates);
        }
      } catch (error) {
        console.error('Error fetching currency rates:', error);
      }
    };

    fetchRates();
  }, []);

  const refreshRates = async () => {
    try {
      const { data } = await supabase.functions.invoke('currency-convert', {
        body: { action: 'updateRates' }
      });
      
      if (data?.success) {
        // Refetch from database
        const { data: rates } = await supabase
          .from('currency_rates')
          .select('currency_code, rate_to_usd');
        
        if (rates) {
          const rateMap: Record<string, number> = {};
          rates.forEach((r: any) => {
            rateMap[r.currency_code] = r.rate_to_usd;
          });
          setLiveRates(rateMap);
        }
      }
    } catch (error) {
      console.error('Error refreshing rates:', error);
    }
  };

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('currency_user_set', 'true');
  };

  const setPanelCurrency = (newCurrency: Currency) => {
    setPanelCurrencyState(newCurrency);
  };

  // Set currency from panel default (only if user hasn't manually set one)
  const setDefaultFromPanel = (panelCurrencyCode: string) => {
    const hasUserPreference = localStorage.getItem('currency_user_set');
    if (!hasUserPreference && currencies[panelCurrencyCode as Currency]) {
      setCurrencyState(panelCurrencyCode as Currency);
    }
    if (currencies[panelCurrencyCode as Currency]) {
      setPanelCurrencyState(panelCurrencyCode as Currency);
    }
  };

  // Get the effective rate for a currency (live rate if available, fallback to static)
  const getRate = (curr: Currency): number => {
    return liveRates[curr] || currencies[curr]?.rate || 1;
  };

  const convertPrice = (usdAmount: number): number => {
    return usdAmount * getRate(currency);
  };

  const convertToUSD = (amount: number, fromCurrency?: Currency): number => {
    const from = fromCurrency || currency;
    return amount / getRate(from);
  };

  const convertBetween = (amount: number, from: Currency, to: Currency): number => {
    const usdAmount = amount / getRate(from);
    return usdAmount * getRate(to);
  };

  const formatPrice = (usdAmount: number): string => {
    const converted = convertPrice(usdAmount);
    const config = currencies[currency];
    
    // High-value currencies (no decimals needed)
    const noDecimalCurrencies = ['NGN', 'INR', 'RUB', 'KES', 'PKR', 'IDR', 'VND', 'KRW', 'JPY', 'COP', 'CLP', 'HUF'];
    if (noDecimalCurrencies.includes(currency)) {
      return `${config.symbol}${Math.round(converted).toLocaleString()}`;
    }
    
    // For very low prices (< 0.01), show 4 decimal places - important for per-1K pricing
    if (converted < 0.01 && converted > 0) {
      return `${config.symbol}${converted.toLocaleString(undefined, { 
        minimumFractionDigits: 4, 
        maximumFractionDigits: 4 
      })}`;
    }
    
    // For low prices (< 1.00), show 4 decimal places for per-1K precision
    if (converted < 1.00 && converted > 0) {
      return `${config.symbol}${converted.toLocaleString(undefined, { 
        minimumFractionDigits: 4, 
        maximumFractionDigits: 4 
      })}`;
    }
    
    return `${config.symbol}${converted.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  const currencyConfig = currencies[currency];

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency,
      setDefaultFromPanel,
      formatPrice,
      convertPrice,
      convertToUSD,
      convertBetween,
      currencyConfig,
      allCurrencies: currencies,
      panelCurrency,
      setPanelCurrency,
      liveRates,
      refreshRates,
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
