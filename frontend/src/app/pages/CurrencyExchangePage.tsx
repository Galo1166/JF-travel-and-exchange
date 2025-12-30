import { useState, useEffect } from 'react';
import { ArrowLeftRight, TrendingUp, Clock } from 'lucide-react';
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

// Default currencies to always include
const DEFAULT_CURRENCIES: ExchangeRateData[] = [
  { id: '1', code: 'USD', name: 'US Dollar', rate: 1540, flag: '🇺🇸', buy_rate: 1530, sell_rate: 1550 },
  { id: '2', code: 'NGN', name: 'Nigerian Naira', rate: 1, flag: '🇳🇬', buy_rate: 1, sell_rate: 1},
  { id: '3', code: 'EUR', name: 'Euro', rate: 0.92, flag: '🇪🇺', buy_rate: 0.91, sell_rate: 0.93 },
  { id: '4', code: 'GBP', name: 'British Pound', rate: 0.79, flag: '🇬🇧', buy_rate: 0.78, sell_rate: 0.80 },
  { id: '5', code: 'AED', name: 'UAE Dirham', rate: 3.67, flag: '🇦🇪', buy_rate: 3.66, sell_rate: 3.68 },
  { id: '6', code: 'CAD', name: 'Canadian Dollar', rate: 1.36, flag: '🇨🇦', buy_rate: 1.35, sell_rate: 1.37 },
  { id: '7', code: 'AUD', name: 'Aus Dollar', rate: 1.53, flag: '🇦🇺', buy_rate: 1.52, sell_rate: 1.54 },
  { id: '8', code: 'JPY', name: 'Yen', rate: 146.50, flag: '🇯🇵', buy_rate: 146.00, sell_rate: 147.00 },
  { id: '9', code: 'CHF', name: 'Swiss Franc', rate: 0.87, flag: '🇨🇭', buy_rate: 0.86, sell_rate: 0.88 },
  { id: '10', code: 'INR', name: 'Indian Rupee', rate: 83.50, flag: '🇮🇳', buy_rate: 83.00, sell_rate: 84.00 },
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

  /* ===============================
     FETCH EXCHANGE RATES (SAFE)
  =============================== */
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        console.log('🔄 Fetching exchange rates from database...');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const response = await fetch(`${apiUrl}/exchange-rates`);
        console.log('📡 API Response status:', response.status);
        
        if (!response.ok) {
          console.error('❌ API returned error:', response.status);
          throw new Error('Fetch failed');
        }

        const data = await response.json();
        console.log('📊 Raw API response:', data);

        let rates: ExchangeRateData[] = [];

        // Try multiple response formats
        if (Array.isArray(data)) {
          rates = data;
          console.log('✅ Found rates as direct array');
        } else if (Array.isArray(data.data)) {
          rates = data.data;
          console.log('✅ Found rates in data.data array');
        } else if (Array.isArray(data.rates)) {
          rates = data.rates;
          console.log('✅ Found rates in data.rates array');
        } else if (Array.isArray(data.exchange_rates)) {
          rates = data.exchange_rates;
          console.log('✅ Found rates in data.exchange_rates array');
        }

        console.log(`📈 Total rates found: ${rates.length}`);
        
        if (rates.length > 0) {
          console.log('✨ Setting database rates:', rates);
          // Merge database rates with defaults, prioritizing database rates
          const mergedRates = [...rates];
          const rateCodes = new Set(rates.map(r => r.code));
          // Add defaults that aren't in database
          DEFAULT_CURRENCIES.forEach(def => {
            if (!rateCodes.has(def.code)) {
              mergedRates.push(def);
            }
          });
          setExchangeRates(mergedRates);
        } else {
          console.warn('⚠️ No rates found in any format, falling back to defaults');
          setExchangeRates(DEFAULT_CURRENCIES);
        }
      } catch (error) {
        console.error('💥 Error fetching exchange rates:', error);
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
    toast.success('Exchange order placed successfully!');
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
    if (value === undefined || value === null) return NaN;
    const v = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(v)) return NaN;

    if (code === 'NGN') return 1;
    if (code === 'USD') return !isNaN(nairaPerUSD) ? nairaPerUSD : v;

    // Heuristic: treat large values or specific codes as units-per-USD
    const unitsPerUsdCodes = ['JPY', 'INR'];
    if (v > 10 || unitsPerUsdCodes.includes(code || '')) {
      // v = units per USD -> 1 unit = (1/v) USD -> in NGN = (1/v) * nairaPerUSD
      return (1 / v) * nairaPerUSD;
    }

    // Otherwise treat v as USD per unit -> in NGN = v * nairaPerUSD
    return v * nairaPerUSD;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50" />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO */}
      <section className="relative bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-24 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=1200&h=500&fit=crop")',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 to-cyan-600/80" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl font-bold mb-6">At JF Exchange</h1>
          <p className="text-xl text-blue-100">
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
                      <span className="font-semibold text-green-600">{safeFixed(toNaira(rate.buy_rate ?? rate.buyRate, rate.code))}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Sell (NGN)</span>
                      <span className="font-semibold text-orange-600">{safeFixed(toNaira(rate.sell_rate ?? rate.sellRate, rate.code))}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
