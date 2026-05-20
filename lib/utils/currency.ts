// lib/utils/currency.ts
// Currency formatting utilities using single source of truth

import { CURRENCY_CONFIG } from "@/lib/constants/currency";

/**
 * Formats a number as currency using the centralized currency configuration
 * @param amount - The amount to format
 * @param options - Optional formatting options (withDecimals, withoutDecimals, or custom)
 * @returns Formatted currency string (e.g., "₹1,23,456" or "₹1,23,456.78")
 */
export function formatCurrency(
  amount: number | null | undefined,
  options?: "withDecimals" | "withoutDecimals" | Intl.NumberFormatOptions
): string {
  if (amount == null || isNaN(amount)) {
    return "-";
  }

  const formatOptions: Intl.NumberFormatOptions =
    options === "withDecimals"
      ? CURRENCY_CONFIG.formatting.withDecimals
      : options === "withoutDecimals"
      ? CURRENCY_CONFIG.formatting.withoutDecimals
      : typeof options === "object"
      ? options
      : CURRENCY_CONFIG.formatting.default;

  return `${CURRENCY_CONFIG.symbol}${amount.toLocaleString(
    CURRENCY_CONFIG.locale,
    formatOptions
  )}`;
}

/**
 * Gets the currency symbol from the centralized configuration
 * @returns Currency symbol string
 */
export function getCurrencySymbol(): string {
  return CURRENCY_CONFIG.symbol;
}

/**
 * Formats a number as currency with symbol prefix (for use in input fields, etc.)
 * @param amount - The amount to format
 * @param options - Optional formatting options
 * @returns Formatted currency string
 */
export function formatCurrencyWithSymbol(
  amount: number | null | undefined,
  options?: "withDecimals" | "withoutDecimals" | Intl.NumberFormatOptions
): string {
  return formatCurrency(amount, options);
}


