/**
 * Pricing utilities for consistent price formatting and calculations
 * All prices are assumed to be "per 1K" (per 1000 units)
 */

/**
 * Formats a price per 1K with appropriate decimal precision
 * - Prices < 1.00: 4 decimals (e.g., $0.0025)
 * - Prices >= 1.00: 2 decimals (e.g., $2.50)
 * 
 * @param price - The price per 1K units
 * @param currencySymbol - Currency symbol to prepend (default: $)
 */
export const formatPricePer1K = (price: number, currencySymbol: string = '$'): string => {
  if (price === 0) return `${currencySymbol}0.00`;
  
  // For prices under $1, show 4 decimal places
  if (price < 1) {
    return `${currencySymbol}${price.toFixed(4)}`;
  }
  
  // For prices $1 and above, show 2 decimal places
  return `${currencySymbol}${price.toFixed(2)}`;
};

/**
 * Calculates the final sale price after applying markup
 * 
 * @param providerRate - The provider's rate per 1K
 * @param markupPercent - The markup percentage (e.g., 25 for 25%)
 */
export const applyMarkup = (providerRate: number, markupPercent: number): number => {
  return providerRate * (1 + markupPercent / 100);
};

/**
 * Calculates the profit per 1K from a sale
 * 
 * @param salePrice - Your sale price per 1K
 * @param providerRate - The provider's rate per 1K
 */
export const calculateProfitPer1K = (salePrice: number, providerRate: number): number => {
  return salePrice - providerRate;
};

/**
 * Calculates markup percentage from provider rate and sale price
 * 
 * @param salePrice - Your sale price per 1K  
 * @param providerRate - The provider's rate per 1K
 */
export const calculateMarkupPercent = (salePrice: number, providerRate: number): number => {
  if (providerRate === 0) return 0;
  return ((salePrice - providerRate) / providerRate) * 100;
};

/**
 * Calculates order total cost
 * 
 * @param quantity - Number of units ordered
 * @param pricePer1K - Price per 1000 units
 */
export const calculateOrderTotal = (quantity: number, pricePer1K: number): number => {
  return (quantity / 1000) * pricePer1K;
};
