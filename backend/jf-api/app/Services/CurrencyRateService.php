<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CurrencyRateService
{
    protected $apiKey;
    protected $baseUrl = 'https://v6.exchangerate-api.com/v6';
    protected $cacheExpiry = 3600; // 1 hour

    public function __construct()
    {
        $this->apiKey = config('services.exchange_rate.key');
    }

    /**
     * Get exchange rate from one currency to another
     */
    public function getRate($from = 'USD', $to = 'NGN')
    {
        $cacheKey = "exchange_rate_{$from}_{$to}";
        
        return Cache::remember($cacheKey, $this->cacheExpiry, function () use ($from, $to) {
            try {
                $response = Http::timeout(10)->get("{$this->baseUrl}/{$this->apiKey}/latest/{$from}");
                
                if ($response->successful()) {
                    $rates = $response->json('conversion_rates');
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
                $response = Http::timeout(10)->get("{$this->baseUrl}/{$this->apiKey}/latest/{$base}");
                
                if ($response->successful()) {
                    return $response->json('conversion_rates');
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
                $response = Http::timeout(10)->get("{$this->baseUrl}/{$this->apiKey}/latest/{$base}");
                
                if ($response->successful()) {
                    $allRates = $response->json('conversion_rates');
                    
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
        return !empty($this->apiKey);
    }
}
