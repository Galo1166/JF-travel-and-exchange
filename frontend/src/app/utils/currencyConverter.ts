import { currencyRates } from '../data/mockData';
import axios from 'axios';

// Cache for live rates with timestamp
let cachedRates: Record<string, number> | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

/**
 * Fetch live exchange rates from backend API
 */
export async function getLiveExchangeRates(base: string = 'USD'): Promise<Record<string, number> | null> {
  try {
    // Return cached rates if still valid
    if (cachedRates && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
      console.log('Using cached exchange rates');
      return cachedRates;
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const response = await axios.get(`${apiUrl}/exchange-rates/live`, {
      params: { base },
      timeout: 5000,
    });

    if (response.data?.success && response.data?.rates) {
      cachedRates = response.data.rates;
      cacheTimestamp = Date.now();
      console.log('Fetched fresh exchange rates from API');
      return cachedRates;
    }
  } catch (error) {
    console.error('Failed to fetch live exchange rates:', error);
  }

  return null;
}

/**
 * Convert amount between currencies using live rates with fallback to mock data
 */
export async function convertCurrencyLive(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  liveRates?: Record<string, number>
): Promise<number> {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // Use provided live rates or try to fetch them
  let rates = liveRates;
  if (!rates) {
    rates = await getLiveExchangeRates(fromCurrency);
  }

  // If we have live rates, use them
  if (rates && toCurrency in rates) {
    // Divide by rate for NGN to other currencies, multiply for others
    if (fromCurrency === 'NGN') {
      return Math.round((amount / rates[toCurrency]) * 100) / 100;
    }
    return Math.round(amount * rates[toCurrency] * 100) / 100;
  }

  // Fallback to mock data conversion
  return convertCurrency(amount, fromCurrency, toCurrency);
}

/**
 * Convert amount between currencies using mock/static rates
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // Get the rates for both currencies
  const fromRate = currencyRates.find(c => c.code === fromCurrency);
  const toRate = currencyRates.find(c => c.code === toCurrency);

  if (!fromRate || !toRate) {
    return amount; // Return original amount if currency not found
  }

  // Convert from any currency to USD first, then to target currency
  const amountInUSD = amount / fromRate.rate;
  const convertedAmount = amountInUSD * toRate.rate;

  return Math.round(convertedAmount * 100) / 100; // Round to 2 decimal places
}

/**
 * Format currency with symbol and proper decimal places
 */
export function formatCurrency(amount: number, currencyCode: string): string {
  const currencyData = currencyRates.find(c => c.code === currencyCode);
  const symbol = currencyData?.flag || currencyCode;
  
  // Format the number with appropriate decimal places
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${formatted} ${currencyCode}`;
}

/**
 * Get currency symbol or flag
 */
export function getCurrencySymbol(currencyCode: string): string {
  const currencyData = currencyRates.find(c => c.code === currencyCode);
  return currencyData?.flag || currencyCode;
}

/**
 * Clear cached exchange rates
 */
export function clearRatesCache(): void {
  cachedRates = null;
  cacheTimestamp = 0;
  console.log('Exchange rates cache cleared');
}
