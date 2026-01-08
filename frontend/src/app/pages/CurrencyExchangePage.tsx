import { useState, useEffect } from 'react';
import { ArrowLeftRight, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { currencyRates } from '../data/mockData';
import { toast } from 'sonner';

interface ExchangeRateData {
  id: string;
  code: string;
  name: string;
  rate: number | string;
  buy_rate?: number | string;
  sell_rate?: number | string;
  buyRate?: number | string;   // for mock compatibility
  sellRate?: number | string; // for mock compatibility
  flag: string;
}

// Default currencies to always include (with proper NGN conversion)
const DEFAULT_CURRENCIES: ExchangeRateData[] = [
  { id: '1', code: 'USD', name: 'US Dollar', rate: 1421.41, flag: '🇺🇸', buy_rate: 1392.98, sell_rate: 1449.84 },
  { id: '2', code: 'NGN', name: 'Nigerian Naira', rate: 1, flag: '🇳🇬', buy_rate: 1, sell_rate: 1},
  { id: '3', code: 'EUR', name: 'Euro', rate: 1660.76, flag: '🇪🇺', buy_rate: 1627.94, sell_rate: 1693.58 },
  { id: '4', code: 'GBP', name: 'British Pound', rate: 1915.06, flag: '🇬🇧', buy_rate: 1876.75, sell_rate: 1953.37 },
  { id: '5', code: 'AED', name: 'UAE Dirham', rate: 387.04, flag: '🇦🇪', buy_rate: 379.09, sell_rate: 394.98 },
  { id: '6', code: 'CAD', name: 'Canadian Dollar', rate: 1027.50, flag: '🇨🇦', buy_rate: 1006.95, sell_rate: 1048.05 },
  { id: '7', code: 'AUD', name: 'Australian Dollar', rate: 955.83, flag: '🇦🇺', buy_rate: 936.71, sell_rate: 974.94 },
  { id: '8', code: 'JPY', name: 'Japanese Yen', rate: 9.07, flag: '🇯🇵', buy_rate: 8.89, sell_rate: 9.25 },
  { id: '9', code: 'CHF', name: 'Swiss Franc', rate: 1783.50, flag: '🇨🇭', buy_rate: 1747.63, sell_rate: 1819.37 },
  { id: '10', code: 'INR', name: 'Indian Rupee', rate: 15.81, flag: '🇮🇳', buy_rate: 15.49, sell_rate: 16.13 },
  { id: '11', code: 'KES', name: 'Kenyan Shilling', rate: 11.02, flag: '🇰🇪', buy_rate: 10.80, sell_rate: 11.24 },
  { id: '12', code: 'ZAR', name: 'South African Rand', rate: 86.41, flag: '🇿🇦', buy_rate: 84.68, sell_rate: 88.13 },
  { id: '13', code: 'EGP', name: 'Egyptian Pound', rate: 30.08, flag: '🇪🇬', buy_rate: 29.48, sell_rate: 30.68 },
  { id: '14', code: 'GHS', name: 'Ghanaian Cedi', rate: 133.02, flag: '🇬🇭', buy_rate: 130.36, sell_rate: 135.68 },
  { id: '15', code: 'CNY', name: 'Chinese Yuan', rate: 202.98, flag: '🇨🇳', buy_rate: 198.92, sell_rate: 207.04 },
];

interface CurrencyExchangePageProps {
  onNavigate: (page: string) => void;
  isAuthenticated: boolean;
}

export function CurrencyExchangePage({ onNavigate, isAuthenticated }: CurrencyExchangePageProps) {
  const [fromCurrency, setFromCurrency] = useState('NGN');
  const [toCurrency, setToCurrency] = useState('USD');
  const [amount, setAmount] = useState('100');
  const [convertedAmount, setConvertedAmount] = useState('0.0649');
  const [exchangeRates, setExchangeRates] = useState<ExchangeRateData[]>(DEFAULT_CURRENCIES);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        console.log('🔄 Fetching live exchange rates from API...');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const url = `${apiUrl}/exchange-rates/live?base=NGN&t=${Date.now()}`; // Cache bust with timestamp
        console.log('📍 Fetching from URL:', url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          }
        });
        
        console.log('📡 API Response status:', response.status);
        
        if (!response.ok) {
          console.error('❌ API returned error:', response.status);
          throw new Error(`Fetch failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log('📊 Live rates response:', data);
        console.log('📊 Rates object:', data.rates);

        let rates: ExchangeRateData[] = [];

        // Handle live rates response format: { success, base, rates, timestamp }
        if (data.success && data.rates) {
          // Convert from { code: rate } format to array format
          if (typeof data.rates === 'object' && !Array.isArray(data.rates)) {
            rates = Object.entries(data.rates).map(([code, rate]: [string, any]) => {
              const numRate = typeof rate === 'number' ? rate : parseFloat(rate);
              return {
                id: code,
                code: code,
                name: code, // Will be updated below
                rate: numRate,
                flag: '🌐',
                buy_rate: Math.round(numRate * 0.98 * 100) / 100,
                sell_rate: Math.round(numRate * 1.02 * 100) / 100,
              };
            });
            console.log('✅ Converted live rates from object format, total:', rates.length);
            console.log('📋 Sample rates:', rates.slice(0, 3));
          } else if (Array.isArray(data.rates)) {
            rates = data.rates;
            console.log('✅ Using live rates from array format');
          }
        } else if (Array.isArray(data)) {
          rates = data;
          console.log('✅ Found rates as direct array');
        } else if (Array.isArray(data.data)) {
          rates = data.data;
          console.log('✅ Found rates in data.data array');
        }

        console.log(`📈 Total rates found: ${rates.length}`);
        
        if (rates.length > 0) {
          console.log('✨ Setting live rates:', rates);
          // Merge live rates with defaults for currency names and additional metadata
          const currencyNames: Record<string, string> = {
            'USD': 'US Dollar',
            'EUR': 'Euro',
            'GBP': 'British Pound',
            'CAD': 'Canadian Dollar',
            'AUD': 'Australian Dollar',
            'NGN': 'Nigerian Naira',
            'KES': 'Kenyan Shilling',
            'ZAR': 'South African Rand',
            'EGP': 'Egyptian Pound',
            'GHS': 'Ghanaian Cedi',
            'JPY': 'Japanese Yen',
            'CNY': 'Chinese Yuan',
            'AED': 'UAE Dirham',
            'CHF': 'Swiss Franc',
            'INR': 'Indian Rupee',
          };

          const currencyFlags: Record<string, string> = {
            'USD': '🇺🇸',
            'EUR': '🇪🇺',
            'GBP': '🇬🇧',
            'CAD': '🇨🇦',
            'AUD': '🇦🇺',
            'NGN': '🇳🇬',
            'KES': '🇰🇪',
            'ZAR': '🇿🇦',
            'EGP': '🇪🇬',
            'GHS': '🇬🇭',
            'JPY': '🇯🇵',
            'CNY': '🇨🇳',
            'AED': '🇦🇪',
            'CHF': '🇨🇭',
            'INR': '🇮🇳',
          };

          const enrichedRates = rates.map(rate => ({
            ...rate,
            name: currencyNames[rate.code] || rate.name || rate.code,
            flag: currencyFlags[rate.code] || rate.flag || '🌐',
          }));

          console.log('✅ Final enriched rates to display:', enrichedRates);
          setExchangeRates(enrichedRates);
        } else {
          console.warn('⚠️ No rates found, falling back to defaults');
          setExchangeRates(DEFAULT_CURRENCIES);
        }
      } catch (error) {
        console.error('💥 Error fetching live exchange rates:', error);
        console.log('🔄 Using default currencies as fallback');
        setExchangeRates(DEFAULT_CURRENCIES);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExchangeRates();
  }, []);

  /* ===============================
     CONVERSION LOGIC - AUTO CONVERT
  =============================== */
  useEffect(() => {
    if (!amount || amount === '0') {
      setConvertedAmount('0');
      return;
    }

    const fromRate = exchangeRates.find(r => r.code === fromCurrency);
    const toRate = exchangeRates.find(r => r.code === toCurrency);

    if (!fromRate || !toRate) {
      console.log('❌ Missing rate:', { fromRate, toRate });
      setConvertedAmount('0');
      return;
    }

    // Parse rates properly
    const fromRateValue = parseFloat(String(fromRate.rate)) || 1;
    const toRateValue = parseFloat(String(toRate.rate)) || 1;
    
    console.log('💱 Conversion Details:', {
      fromCurrency,
      toCurrency,
      amount,
      fromRate: fromRateValue,
      toRate: toRateValue,
    });

    // Formula: All rates are relative to NGN (base currency)
    // 1 USD = 1540 NGN, so USD rate = 1540
    // To convert: amount in fromCurrency → (amount * fromRate) = amount in NGN → (amount in NGN / toRate) = amount in toCurrency
    const amountInNGN = parseFloat(amount) * fromRateValue;
    const converted = amountInNGN / toRateValue;
    
    console.log('📊 Calculation:', {
      amountInNGN,
      converted,
      result: isNaN(converted) ? '0' : converted.toFixed(4),
    });
    
    setConvertedAmount(isNaN(converted) ? '0' : converted.toFixed(4));
  }, [amount, fromCurrency, toCurrency, exchangeRates]);

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handleExchange = () => {
    if (!isAuthenticated) {
      toast.error('Please login to exchange currency');
      onNavigate('login');
      return;
    }
    // Show confirmation modal instead of immediately processing
    setShowConfirmation(true);
  };

  const handleConfirmExchange = () => {
    setShowConfirmation(false);
    toast.success('Exchange order placed successfully!');
    // Reset form
    setAmount('100');
  };

  const handleCancelExchange = () => {
    setShowConfirmation(false);
  };

  const safeRates = Array.isArray(exchangeRates) ? exchangeRates : currencyRates;
  const fromCurrencyData = safeRates.find((r) => r.code === fromCurrency);
  const toCurrencyData = safeRates.find((r) => r.code === toCurrency);

  /* ===============================
     SAFE FORMATTER (handles strings & numbers)
  =============================== */
  const safeFixed = (value?: number | string) => {
    if (value === undefined || value === null) return 'N/A';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return !isNaN(num) ? num.toFixed(2) : 'N/A';
  };

  // Compute NGN equivalents for display: convert any rate/buy/sell to Naira
  const nairaPerUSD = (() => {
    const usd = exchangeRates.find((r) => r.code === 'USD');
    if (usd && !isNaN(Number(usd.rate))) return Number(usd.rate);
    // fallback: if NGN exists and has numeric rate, return it
    const ngn = exchangeRates.find((r) => r.code === 'NGN');
    if (ngn && !isNaN(Number(ngn.rate))) return Number(ngn.rate);
    return 1;
  })();

  const toNaira = (value?: number | string, code?: string) => {
    // The API already returns rates in NGN, so just return the value as-is
    if (value === undefined || value === null) return NaN;
    const v = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(v)) return NaN;
    
    // Rates from API are already in NGN, no conversion needed
    return v;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50" />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO */}
      <section className="relative h-96 flex items-center justify-center text-white overflow-hidden" style={{backgroundImage: 'url("https://images.unsplash.com/photo-1574482620811-1aa16ffe3c82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080")', backgroundSize: 'cover', backgroundPosition: 'center'}}>
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-black/30" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl font-bold mb-6">At JF Exchange</h1>
          <p className="text-xl text-gray-100">
            Get the best exchange rates with transparent pricing and instant conversion
          </p>
        </div>
      </section>

      {/* CONVERTER */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="p-8 shadow-lg border-0">
            <h2 className="text-3xl font-bold mb-2 text-center text-gray-900">
              Currency Converter
            </h2>
            <p className="text-center text-gray-600 mb-8">Convert between any currencies in real-time</p>

            <div className="space-y-6">
              {/* From Currency Section */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                <Label className="text-sm font-semibold text-gray-700">From</Label>
                <div className="flex gap-3 mt-3">
                  <div className="flex-1">
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="text-lg font-semibold border-0 bg-white shadow-sm"
                    />
                    <p className="text-xs text-gray-600 mt-2">You send</p>
                  </div>
                  <Select value={fromCurrency} onValueChange={setFromCurrency}>
                    <SelectTrigger className="w-32 bg-white border-0 shadow-sm text-sm font-semibold h-12 px-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Array.isArray(exchangeRates) ? exchangeRates : currencyRates).map((rate) => (
                        <SelectItem key={rate.code} value={rate.code} className="text-sm">
                          {rate.flag} {rate.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <Button
                  onClick={handleSwapCurrencies}
                  className="rounded-full w-14 h-14 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg"
                  size="icon"
                >
                  <ArrowLeftRight className="w-6 h-6 text-white" />
                </Button>
              </div>

              {/* To Currency Section */}
              <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 rounded-lg">
                <Label className="text-sm font-semibold text-gray-700">To</Label>
                <div className="flex gap-3 mt-3">
                  <div className="flex-1">
                    <Input
                      value={convertedAmount}
                      readOnly
                      placeholder="Converted amount"
                      className="text-lg font-semibold border-0 bg-white shadow-sm"
                    />
                    <p className="text-xs text-gray-600 mt-2">You receive</p>
                  </div>
                  <Select value={toCurrency} onValueChange={setToCurrency}>
                    <SelectTrigger className="w-32 bg-white border-0 shadow-sm text-sm font-semibold h-12 px-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Array.isArray(exchangeRates) ? exchangeRates : currencyRates).map((rate) => (
                        <SelectItem key={rate.code} value={rate.code} className="text-sm">
                          {rate.flag} {rate.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Exchange Rate Display */}
              {fromCurrencyData && toCurrencyData && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                  <p className="text-center">
                    <span className="text-2xl font-bold text-green-600">
                      1 {fromCurrency}
                    </span>
                    <span className="text-gray-600 mx-2">=</span>
                    <span className="text-2xl font-bold text-green-600">
                      {(() => {
                        const fromRate = parseFloat(String(fromCurrencyData.rate)) || 1;
                        const toRate = parseFloat(String(toCurrencyData.rate)) || 1;
                        // All rates relative to NGN: 1 fromCurrency = (fromRate / toRate) toCurrency
                        const result = fromRate / toRate;
                        return result.toFixed(4);
                      })()}
                    </span>
                    <span className="text-gray-600 ml-2">{toCurrency}</span>
                  </p>
                  <p className="text-center text-xs text-gray-600 mt-2">Mid-market rate</p>
                </div>
              )}

              {/* Exchange Button */}
              <Button 
                onClick={handleExchange} 
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg"
              >
                {isAuthenticated ? 'Exchange Now' : 'Login to Exchange'}
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* RATES TABLE */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Exchange Rates</h2>
            <p className="text-gray-600">Real-time rates from our database</p>
          </div>

          {(Array.isArray(exchangeRates) ? exchangeRates : currencyRates).length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No exchange rates available</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(Array.isArray(exchangeRates) ? exchangeRates : currencyRates).map((rate) => (
                <Card key={rate.code} className="p-6 shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-3xl">{rate.flag}</p>
                      <p className="text-sm text-gray-600">{rate.name}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-100 to-cyan-100 p-3 rounded-lg">
                      <p className="text-lg font-bold text-blue-600">{rate.code}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Rate (NGN)</span>
                      <span className="font-semibold text-gray-900">{safeFixed(toNaira(rate.rate, rate.code))}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Buy (NGN)</span>
                      <span className="font-semibold text-green-600">{safeFixed(toNaira(rate.buyRate ?? rate.buyRate, rate.code))}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Sell (NGN)</span>
                      <span className="font-semibold text-orange-600">{safeFixed(toNaira(rate.sellRate ?? rate.sellRate, rate.code))}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CONFIRMATION MODAL */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md shadow-2xl border-0">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 rounded-t-lg">
              <div className="flex items-center justify-center gap-3">
                <CheckCircle className="w-8 h-8 text-white" />
                <h2 className="text-2xl font-bold text-white">Confirm Exchange</h2>
              </div>
            </div>

            <div className="p-8 space-y-6">
              {/* Exchange Details */}
              <div className="space-y-4">
                {/* Sending */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 font-semibold uppercase mb-2">You Send</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-blue-600">{amount}</p>
                      <p className="text-sm text-gray-600 mt-1">{fromCurrency}</p>
                    </div>
                    <span className="text-4xl">
                      {exchangeRates.find(r => r.code === fromCurrency)?.flag}
                    </span>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full p-3">
                    <ArrowLeftRight className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Receiving */}
                <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 font-semibold uppercase mb-2">You Receive</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-cyan-600">{convertedAmount}</p>
                      <p className="text-sm text-gray-600 mt-1">{toCurrency}</p>
                    </div>
                    <span className="text-4xl">
                      {exchangeRates.find(r => r.code === toCurrency)?.flag}
                    </span>
                  </div>
                </div>
              </div>

              {/* Exchange Rate Info */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Exchange Rate:</span>
                    <span className="font-semibold text-gray-900">
                      1 {fromCurrency} = {(() => {
                        const fromRate = exchangeRates.find(r => r.code === fromCurrency);
                        const toRate = exchangeRates.find(r => r.code === toCurrency);
                        if (!fromRate || !toRate) return '0.0000';
                        const rate = parseFloat(String(fromRate.rate)) || 1;
                        const toRateVal = parseFloat(String(toRate.rate)) || 1;
                        return (rate / toRateVal).toFixed(4);
                      })()} {toCurrency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount to Send:</span>
                    <span className="font-semibold text-gray-900">{amount} {fromCurrency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount to Receive:</span>
                    <span className="font-semibold text-cyan-600">{convertedAmount} {toCurrency}</span>
                  </div>
                </div>
              </div>

              {/* Fee Notice */}
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                <p className="text-xs text-amber-800">
                  <span className="font-semibold">Note:</span> A small processing fee may be applied to your exchange.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleConfirmExchange}
                  className="w-full h-11 text-base font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                >
                  Confirm Exchange
                </Button>
                <Button
                  onClick={handleCancelExchange}
                  variant="outline"
                  className="w-full h-11 text-base font-semibold text-gray-700 border border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

