// Analytics utility functions for calculating real growth/loss metrics

export interface ChangeResult {
  value: string;
  trend: 'up' | 'down' | 'neutral';
  percentage: number;
}

/**
 * Calculate the percentage change between current and previous values
 */
export function calculateChange(current: number, previous: number): ChangeResult {
  if (previous === 0) {
    if (current === 0) {
      return { value: '0%', trend: 'neutral', percentage: 0 };
    }
    return { value: '+100%', trend: 'up', percentage: 100 };
  }

  const percentageChange = ((current - previous) / previous) * 100;
  const trend: 'up' | 'down' | 'neutral' = 
    percentageChange > 0 ? 'up' : 
    percentageChange < 0 ? 'down' : 'neutral';
  
  const sign = percentageChange > 0 ? '+' : '';
  const formattedValue = `${sign}${percentageChange.toFixed(1)}%`;

  return {
    value: formattedValue,
    trend,
    percentage: percentageChange
  };
}

/**
 * Calculate absolute change between current and previous values
 */
export function calculateAbsoluteChange(current: number, previous: number): ChangeResult {
  const diff = current - previous;
  const trend: 'up' | 'down' | 'neutral' = 
    diff > 0 ? 'up' : 
    diff < 0 ? 'down' : 'neutral';
  
  const sign = diff > 0 ? '+' : '';
  const formattedValue = `${sign}${diff}`;

  return {
    value: formattedValue,
    trend,
    percentage: diff
  };
}

/**
 * Get date range for analytics queries
 */
export function getDateRange(daysAgo: number): { startDate: Date; endDate: Date } {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysAgo);
  return { startDate, endDate };
}

/**
 * Get previous period date range for comparison
 */
export function getPreviousPeriodRange(daysAgo: number): { startDate: Date; endDate: Date } {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() - daysAgo);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (daysAgo * 2));
  return { startDate, endDate };
}

/**
 * Format currency with proper localization
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format large numbers with K/M suffix
 */
export function formatCompactNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}
