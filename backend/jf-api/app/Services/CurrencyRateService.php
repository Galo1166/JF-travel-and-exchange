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
    public function getRate($from = 'USD', $to = 'NGN')
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
    public function getAllRates($base = 'USD')
    {
        $cacheKey = "exchange_rates_{$base}";
        
        return Cache::remember($cacheKey, $this->cacheExpiry, function () use ($base) {
            try {
                $response = Http::timeout(10)->get("{$this->baseUrl}/{$base}");
                
                if ($response->successful()) {
                    return $response->json('rates');
                }
                
                Log::warning("Exchange Rate API returned unsuccessful status: {$response->status()}");
                return [];
            } catch (\Exception $e) {
                Log::error("Currency Rate Service Error: " . $e->getMessage());
                return [];
            }
        });
    }

    /**
     * Get specific rates for common currencies
     */
    public function getCommonRates($base = 'USD')
    {
        $cacheKey = "exchange_rates_common_{$base}";
        
        return Cache::remember($cacheKey, $this->cacheExpiry, function () use ($base) {
            try {
                $response = Http::timeout(10)->get("{$this->baseUrl}/{$base}");
                
                if ($response->successful()) {
                    $allRates = $response->json('rates');
                    
                    // Return only common currencies
                    $commonCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'NGN', 'KES', 'ZAR', 'EGP'];
                    
                    $rates = [];
                    foreach ($commonCurrencies as $currency) {
                        if (isset($allRates[$currency])) {
                            $rates[$currency] = $allRates[$currency];
                        }
                    }
                    
                    return $rates;
                }
                
                Log::warning("Exchange Rate API returned unsuccessful status: {$response->status()}");
                return [];
            } catch (\Exception $e) {
                Log::error("Currency Rate Service Error: " . $e->getMessage());
                return [];
            }
        });
    }

    /**
     * Convert amount from one currency to another using live rates
     */
    public function convert($amount, $from = 'USD', $to = 'NGN')
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
    public function updateDatabaseRates($base = 'USD')
    {
        try {
            $response = Http::timeout(20)->get("{$this->baseUrl}/{$base}");
             
            if (!$response->successful()) {
                Log::error("Failed to fetch rates for update: " . $response->status());
                return false;
            }

            $rates = $response->json('rates');
            $commonCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'NGN', 'KES', 'ZAR', 'EGP', 'GHS', 'JPY', 'CNY'];

            foreach ($commonCurrencies as $code) {
                if (!isset($rates[$code])) continue;
                
                $rate = $rates[$code];
                
                // Calculate buy/sell rates with 2% margin
                // If base is USD, rate is how many X per 1 USD.
                // We keep it simple: rate is the mid-market rate.
                
                $midRate = $rate;
                $buyRate = $midRate * 0.98; // We buy lower
                $sellRate = $midRate * 1.02; // We sell higher

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
        ];
        return $names[$code] ?? $code;
    }

    /**
     * Clear cached exchange rates
     */
    public function clearCache($base = 'USD')
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
