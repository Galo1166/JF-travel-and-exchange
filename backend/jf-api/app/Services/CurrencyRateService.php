<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CurrencyRateService
{
    protected $baseUrl = 'https://open.er-api.com/v6/latest';
    protected $cacheExpiry = 3600; // 1 hour

    public function __construct()
    {
        // No API key needed for this free endpoint
    }

    /**
     * Get exchange rate from one currency to another
     */
    public function getRate($from = 'NGN', $to = 'USD')
    {
        $cacheKey = "exchange_rate_{$from}_{$to}";
        
        return Cache::remember($cacheKey, $this->cacheExpiry, function () use ($from, $to) {
            try {
                $response = Http::timeout(10)->get("{$this->baseUrl}/{$from}");
                
                if ($response->successful()) {
                    $rates = $response->json('rates'); // Open ER API uses 'rates' key
                    return $rates[$to] ?? null;
                }
                
                Log::warning("Exchange Rate API returned unsuccessful status: {$response->status()}");
                return null;
            } catch (\Exception $e) {
                Log::error("Currency Rate Service Error: " . $e->getMessage());
                return null;
            }
        });
    }

    /**
     * Get all exchange rates for a given base currency
     */
    public function getAllRates($base = 'NGN')
    {
        $cacheKey = "exchange_rates_{$base}";
        
        return Cache::remember($cacheKey, $this->cacheExpiry, function () use ($base) {
            try {
                // Always fetch from USD for accuracy, then convert to requested base
                $response = Http::timeout(10)->get("{$this->baseUrl}/USD");
                
                if (!$response->successful()) {
                    Log::warning("Exchange Rate API returned unsuccessful status: {$response->status()}");
                    return [];
                }
                
                $rates = $response->json('rates');
                
                // If requesting NGN base, convert all rates
                if ($base === 'NGN') {
                    $ngnPerUsd = $rates['NGN'] ?? 1600;
                    $convertedRates = [];
                    foreach ($rates as $code => $rateFromUsd) {
                        if ($rateFromUsd > 0) {
                            $convertedRates[$code] = round($ngnPerUsd / $rateFromUsd * 100) / 100;
                        }
                    }
                    return $convertedRates;
                }
                
                return $rates;
            } catch (\Exception $e) {
                Log::error("Currency Rate Service Error: " . $e->getMessage());
                return [];
            }
        });
    }

    /**
     * Get specific rates for common currencies
     */
    public function getCommonRates($base = 'NGN')
    {
        $cacheKey = "exchange_rates_common_{$base}";
        
        return Cache::remember($cacheKey, $this->cacheExpiry, function () use ($base) {
            try {
                // Always fetch from USD for accuracy, then convert to requested base
                $response = Http::timeout(10)->get("{$this->baseUrl}/USD");
                
                if (!$response->successful()) {
                    Log::warning("Exchange Rate API returned unsuccessful status: {$response->status()}");
                    return [];
                }
                
                $allRates = $response->json('rates');
                
                // Return only common currencies
                $commonCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'NGN', 'KES', 'ZAR', 'EGP', 'GHS', 'CNY', 'AED', 'CHF', 'INR'];
                
                $rates = [];
                
                if ($base === 'NGN') {
                    // Convert all rates to NGN
                    $ngnPerUsd = $allRates['NGN'] ?? 1600;
                    foreach ($commonCurrencies as $currency) {
                        if (isset($allRates[$currency]) && $allRates[$currency] > 0) {
                            $rates[$currency] = round($ngnPerUsd / $allRates[$currency] * 100) / 100;
                        }
                    }
                } else {
                    // Return raw rates for other bases
                    foreach ($commonCurrencies as $currency) {
                        if (isset($allRates[$currency])) {
                            $rates[$currency] = $allRates[$currency];
                        }
                    }
                }
                
                return $rates;
            } catch (\Exception $e) {
                Log::error("Currency Rate Service Error: " . $e->getMessage());
                return [];
            }
        });
    }

    /**
     * Convert amount from one currency to another using live rates
     */
    public function convert($amount, $from = 'NGN', $to = 'USD')
    {
        if ($from === $to) {
            return $amount;
        }

        $rate = $this->getRate($from, $to);
        
        if (!$rate) {
            Log::warning("Could not fetch rate for {$from} to {$to}");
            return $amount;
        }

        return round($amount * $rate * 100) / 100;
    }

    /**
     * Update database rates from API
     */
    public function updateDatabaseRates($base = 'NGN')
    {
        try {
            // Always fetch rates from USD as base for accuracy, then convert to NGN
            $response = Http::timeout(20)->get("{$this->baseUrl}/USD");
             
            if (!$response->successful()) {
                Log::error("Failed to fetch rates for update: " . $response->status());
                return false;
            }

            $rates = $response->json('rates');
            $commonCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'NGN', 'KES', 'ZAR', 'EGP', 'GHS', 'JPY', 'CNY', 'AED', 'CHF', 'INR'];

            // Get NGN rate from USD base (how many NGN per 1 USD)
            $ngnPerUsd = $rates['NGN'] ?? 1600; // Fallback if NGN not in response

            foreach ($commonCurrencies as $code) {
                if (!isset($rates[$code])) continue;
                
                $currencyPerUsd = $rates[$code];
                
                // Convert all rates to NGN base
                // Formula: If 1 USD = X NGN, and 1 USD = Y EUR
                // Then 1 EUR = X/Y NGN (how many NGN per 1 unit of that currency)
                if ($base === 'NGN' && $currencyPerUsd > 0) {
                    $rate = $ngnPerUsd / $currencyPerUsd;
                } else {
                    $rate = $currencyPerUsd;
                }
                
                // Calculate buy/sell rates with 2% margin
                // rate is the mid-market rate
                
                $midRate = round($rate * 100) / 100; // Round to 2 decimals
                $buyRate = round($midRate * 0.98 * 100) / 100; // We buy lower
                $sellRate = round($midRate * 1.02 * 100) / 100; // We sell higher

                Log::info("Updating currency {$code}: API Rate = {$currencyPerUsd}, Converted = {$midRate} NGN");

                \App\Models\CurrencyRate::updateOrCreate(
                    ['code' => $code],
                    [
                        'name' => $this->getCurrencyName($code), // Helper or simple map
                        'rate' => $midRate,
                        'buy_rate' => $buyRate,
                        'sell_rate' => $sellRate,
                        // 'flag' => ... (keep existing or null if new)
                    ]
                );
            }
            
            $this->clearCache($base);
            Log::info("Database currency rates updated successfully.");
            return true;

        } catch (\Exception $e) {
            Log::error("Error updating database rates: " . $e->getMessage());
            return false;
        }
    }
    
    private function getCurrencyName($code)
    {
        $names = [
            'USD' => 'US Dollar',
            'EUR' => 'Euro',
            'GBP' => 'British Pound',
            'CAD' => 'Canadian Dollar',
            'AUD' => 'Australian Dollar',
            'NGN' => 'Nigerian Naira',
            'KES' => 'Kenyan Shilling',
            'ZAR' => 'South African Rand',
            'EGP' => 'Egyptian Pound',
            'GHS' => 'Ghanaian Cedi',
            'JPY' => 'Japanese Yen',
            'CNY' => 'Chinese Yuan',
            'AED' => 'UAE Dirham',
            'CHF' => 'Swiss Franc',
            'INR' => 'Indian Rupee',
        ];
        return $names[$code] ?? $code;
    }

    /**
     * Clear cached exchange rates
     */
    public function clearCache($base = 'NGN')
    {
        Cache::forget("exchange_rates_{$base}");
        Cache::forget("exchange_rates_common_{$base}");
    }

    /**
     * Check if API key is configured
     */
    public function isConfigured()
    {
        return true; // Always configured since we use free API
    }
}
