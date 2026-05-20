// lib/constants/currency.ts
// Single source of truth for currency configuration

export const CURRENCY_CONFIG = {
  // Currency symbol
  symbol: "₹",
  
  // Currency code (ISO 4217)
  code: "INR",
  
  // Locale for formatting
  locale: "en-IN",
  
  // Formatting options
  formatting: {
    // Default formatting options
    default: {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    },
    
    // Formatting with decimals (for precise amounts)
    withDecimals: {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
    
    // Formatting without decimals (for whole numbers)
    withoutDecimals: {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    },
  },
} as const;

// Type for currency configuration
export type CurrencyConfig = typeof CURRENCY_CONFIG;

