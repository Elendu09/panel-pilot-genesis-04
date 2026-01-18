import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fallback exchange rates (updated periodically)
const fallbackRates: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  NGN: 1550,
  INR: 83,
  BRL: 4.97,
  TRY: 32,
  RUB: 92,
  AED: 3.67,
  CAD: 1.36,
  KES: 129,
  GHS: 12.5,
  ZAR: 18.5,
  PKR: 278,
  PHP: 56,
  IDR: 15800,
  MXN: 17.2,
  COP: 4000,
  ARS: 850,
  CLP: 900,
  PEN: 3.7,
  EGP: 31,
  MAD: 10,
  XOF: 610,
  XAF: 610,
  THB: 35,
  VND: 24500,
  MYR: 4.7,
  SGD: 1.35,
  HKD: 7.8,
  JPY: 150,
  KRW: 1350,
  CNY: 7.2,
  TWD: 32,
  AUD: 1.55,
  NZD: 1.68,
  CHF: 0.89,
  SEK: 10.5,
  NOK: 10.8,
  DKK: 6.9,
  PLN: 4.0,
  CZK: 23,
  HUF: 360,
  RON: 4.6,
  BGN: 1.8,
  HRK: 7.0,
  UAH: 37,
  BDT: 110,
  LKR: 320,
  NPR: 133,
  MMK: 2100,
};

// Currency metadata
const currencyMeta: Record<string, { symbol: string; name: string; flag: string }> = {
  USD: { symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  EUR: { symbol: '€', name: 'Euro', flag: '🇪🇺' },
  GBP: { symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  NGN: { symbol: '₦', name: 'Nigerian Naira', flag: '🇳🇬' },
  INR: { symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
  BRL: { symbol: 'R$', name: 'Brazilian Real', flag: '🇧🇷' },
  TRY: { symbol: '₺', name: 'Turkish Lira', flag: '🇹🇷' },
  RUB: { symbol: '₽', name: 'Russian Ruble', flag: '🇷🇺' },
  AED: { symbol: 'د.إ', name: 'UAE Dirham', flag: '🇦🇪' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦' },
  KES: { symbol: 'KSh', name: 'Kenyan Shilling', flag: '🇰🇪' },
  GHS: { symbol: 'GH₵', name: 'Ghanaian Cedi', flag: '🇬🇭' },
  ZAR: { symbol: 'R', name: 'South African Rand', flag: '🇿🇦' },
  PKR: { symbol: '₨', name: 'Pakistani Rupee', flag: '🇵🇰' },
  PHP: { symbol: '₱', name: 'Philippine Peso', flag: '🇵🇭' },
  IDR: { symbol: 'Rp', name: 'Indonesian Rupiah', flag: '🇮🇩' },
  MXN: { symbol: 'MX$', name: 'Mexican Peso', flag: '🇲🇽' },
  COP: { symbol: 'COL$', name: 'Colombian Peso', flag: '🇨🇴' },
  ARS: { symbol: 'AR$', name: 'Argentine Peso', flag: '🇦🇷' },
  CLP: { symbol: 'CL$', name: 'Chilean Peso', flag: '🇨🇱' },
  PEN: { symbol: 'S/', name: 'Peruvian Sol', flag: '🇵🇪' },
  EGP: { symbol: 'E£', name: 'Egyptian Pound', flag: '🇪🇬' },
  MAD: { symbol: 'MAD', name: 'Moroccan Dirham', flag: '🇲🇦' },
  XOF: { symbol: 'CFA', name: 'West African CFA', flag: '🌍' },
  XAF: { symbol: 'FCFA', name: 'Central African CFA', flag: '🌍' },
  THB: { symbol: '฿', name: 'Thai Baht', flag: '🇹🇭' },
  VND: { symbol: '₫', name: 'Vietnamese Dong', flag: '🇻🇳' },
  MYR: { symbol: 'RM', name: 'Malaysian Ringgit', flag: '🇲🇾' },
  SGD: { symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬' },
  HKD: { symbol: 'HK$', name: 'Hong Kong Dollar', flag: '🇭🇰' },
  JPY: { symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵' },
  KRW: { symbol: '₩', name: 'South Korean Won', flag: '🇰🇷' },
  CNY: { symbol: '¥', name: 'Chinese Yuan', flag: '🇨🇳' },
  TWD: { symbol: 'NT$', name: 'Taiwan Dollar', flag: '🇹🇼' },
  AUD: { symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' },
  NZD: { symbol: 'NZ$', name: 'New Zealand Dollar', flag: '🇳🇿' },
  CHF: { symbol: 'CHF', name: 'Swiss Franc', flag: '🇨🇭' },
  SEK: { symbol: 'kr', name: 'Swedish Krona', flag: '🇸🇪' },
  NOK: { symbol: 'kr', name: 'Norwegian Krone', flag: '🇳🇴' },
  DKK: { symbol: 'kr', name: 'Danish Krone', flag: '🇩🇰' },
  PLN: { symbol: 'zł', name: 'Polish Zloty', flag: '🇵🇱' },
  CZK: { symbol: 'Kč', name: 'Czech Koruna', flag: '🇨🇿' },
  HUF: { symbol: 'Ft', name: 'Hungarian Forint', flag: '🇭🇺' },
  RON: { symbol: 'lei', name: 'Romanian Leu', flag: '🇷🇴' },
  BGN: { symbol: 'лв', name: 'Bulgarian Lev', flag: '🇧🇬' },
  UAH: { symbol: '₴', name: 'Ukrainian Hryvnia', flag: '🇺🇦' },
  BDT: { symbol: '৳', name: 'Bangladeshi Taka', flag: '🇧🇩' },
  LKR: { symbol: 'Rs', name: 'Sri Lankan Rupee', flag: '🇱🇰' },
  NPR: { symbol: 'रू', name: 'Nepalese Rupee', flag: '🇳🇵' },
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, amount, fromCurrency, toCurrency, updateRates } = await req.json();

    console.log(`[currency-convert] Action: ${action}, Amount: ${amount}, From: ${fromCurrency}, To: ${toCurrency}`);

    // Get rates from database or use fallback
    let rates: Record<string, number> = { ...fallbackRates };
    
    const { data: dbRates } = await supabase
      .from('currency_rates')
      .select('currency_code, rate_to_usd');
    
    if (dbRates && dbRates.length > 0) {
      dbRates.forEach((r: any) => {
        rates[r.currency_code] = r.rate_to_usd;
      });
    }

    switch (action) {
      case 'convert': {
        // Convert amount from one currency to another
        const from = (fromCurrency || 'USD').toUpperCase();
        const to = (toCurrency || 'USD').toUpperCase();
        
        if (!rates[from] || !rates[to]) {
          return new Response(
            JSON.stringify({ error: `Unsupported currency: ${from} or ${to}` }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Convert to USD first, then to target currency
        const usdAmount = amount / rates[from];
        const convertedAmount = usdAmount * rates[to];
        const exchangeRate = rates[to] / rates[from];

        return new Response(
          JSON.stringify({
            success: true,
            originalAmount: amount,
            originalCurrency: from,
            convertedAmount: Number(convertedAmount.toFixed(2)),
            targetCurrency: to,
            exchangeRate: Number(exchangeRate.toFixed(6)),
            usdEquivalent: Number(usdAmount.toFixed(2)),
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'getRates': {
        // Return all available rates with metadata
        const ratesWithMeta = Object.entries(rates).map(([code, rate]) => ({
          code,
          rate,
          ...currencyMeta[code],
        }));

        return new Response(
          JSON.stringify({
            success: true,
            baseCurrency: 'USD',
            rates: ratesWithMeta,
            lastUpdated: new Date().toISOString(),
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'updateRates': {
        // Fetch live rates from external API and update database
        const apiKey = Deno.env.get('EXCHANGE_RATE_API_KEY');
        
        if (!apiKey) {
          // Use fallback rates
          const updates = Object.entries(fallbackRates).map(([code, rate]) => ({
            currency_code: code,
            currency_name: currencyMeta[code]?.name || code,
            rate_to_usd: rate,
            is_auto_updated: false,
            last_updated_at: new Date().toISOString(),
          }));

          for (const update of updates) {
            await supabase
              .from('currency_rates')
              .upsert(update, { onConflict: 'currency_code' });
          }

          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Updated with fallback rates (no API key configured)',
              ratesUpdated: updates.length 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Fetch from Open Exchange Rates or similar API
        try {
          const response = await fetch(
            `https://openexchangerates.org/api/latest.json?app_id=${apiKey}`
          );
          const data = await response.json();

          if (data.rates) {
            const updates = Object.entries(data.rates).map(([code, rate]) => ({
              currency_code: code,
              currency_name: currencyMeta[code]?.name || code,
              rate_to_usd: rate as number,
              is_auto_updated: true,
              last_updated_at: new Date().toISOString(),
            }));

            for (const update of updates) {
              await supabase
                .from('currency_rates')
                .upsert(update, { onConflict: 'currency_code' });
            }

            return new Response(
              JSON.stringify({ 
                success: true, 
                message: 'Rates updated from live API',
                ratesUpdated: updates.length 
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        } catch (apiError) {
          console.error('[currency-convert] API fetch error:', apiError);
        }

        return new Response(
          JSON.stringify({ success: false, error: 'Failed to fetch live rates' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'formatPrice': {
        // Format price for display in a specific currency
        const currency = (toCurrency || 'USD').toUpperCase();
        const meta = currencyMeta[currency] || { symbol: currency, name: currency };
        const rate = rates[currency] || 1;
        
        const convertedAmount = amount * rate;
        
        // Format based on currency type
        let formatted: string;
        if (['JPY', 'KRW', 'VND', 'IDR'].includes(currency)) {
          // No decimals for these currencies
          formatted = `${meta.symbol}${Math.round(convertedAmount).toLocaleString()}`;
        } else if (['NGN', 'INR', 'RUB', 'PKR'].includes(currency)) {
          // No decimals for high-value currencies
          formatted = `${meta.symbol}${Math.round(convertedAmount).toLocaleString()}`;
        } else {
          formatted = `${meta.symbol}${convertedAmount.toFixed(2)}`;
        }

        return new Response(
          JSON.stringify({
            success: true,
            formatted,
            amount: convertedAmount,
            currency,
            symbol: meta.symbol,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action. Use: convert, getRates, updateRates, formatPrice' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('[currency-convert] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
