<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class AmadeusService
{
    private $baseUrl = 'https://test.api.amadeus.com';
    private $clientId;
    private $clientSecret;
    
    // Airports supported by Amadeus (major international and regional Nigerian airports)
    private $supportedAirports = [
        'LOS', 'ABV', 'KAN', 'PHC', 'ENU', 'KAD', 'ILR', 'JOS', 'MJU', 'MKU', 'OWR', 'WAR'
    ];

    public function __construct()
    {
        $this->clientId = env('AMADEUS_API_KEY');
        $this->clientSecret = env('AMADEUS_API_SECRET');
    }

    /**
     * Get OAuth2 Access Token
     * Request token from Amadeus and cache it.
     */
    public function getAccessToken()
    {
        // Return cached token if available
        if (Cache::has('amadeus_access_token')) {
            return Cache::get('amadeus_access_token');
        }

        try {
            $response = Http::asForm()->post("{$this->baseUrl}/v1/security/oauth2/token", [
                'grant_type' => 'client_credentials',
                'client_id' => $this->clientId,
                'client_secret' => $this->clientSecret,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $token = $data['access_token'];
                $expiresIn = $data['expires_in'];

                // Cache token for slightly less than expiration time to be safe
                Cache::put('amadeus_access_token', $token, $expiresIn - 60);

                return $token;
            }

            Log::error('Amadeus Token Error: ' . $response->body());
            return null;

        } catch (\Exception $e) {
            Log::error('Amadeus Connection Error: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Validate if airports are supported by Amadeus
     */
    private function validateAirports($origin, $destination)
    {
        if (!in_array($origin, $this->supportedAirports)) {
            return [
                'valid' => false,
                'error' => "Origin airport '{$origin}' is not supported. Supported airports: " . implode(', ', $this->supportedAirports)
            ];
        }
        
        if (!in_array($destination, $this->supportedAirports)) {
            return [
                'valid' => false,
                'error' => "Destination airport '{$destination}' is not supported. Supported airports: " . implode(', ', $this->supportedAirports)
            ];
        }
        
        return ['valid' => true];
    }

    /**
     * Search for flights
     */
    public function searchFlights($params)
    {
        // Validate airports first
        $validation = $this->validateAirports($params['origin'], $params['destination']);
        if (!$validation['valid']) {
            return ['error' => $validation['error']];
        }
        
        $token = $this->getAccessToken();

        if (!$token) {
            return ['error' => 'Unable to authenticate with flight service'];
        }

        try {
            $response = Http::withToken($token)->get("{$this->baseUrl}/v2/shopping/flight-offers", [
                'originLocationCode' => $params['origin'],
                'destinationLocationCode' => $params['destination'],
                'departureDate' => $params['departureDate'],
                'adults' => $params['adults'] ?? 1,
                'currencyCode' => 'NGN',
                'max' => 10
            ]);

            if ($response->successful()) {
                return $this->transformResponse($response->json());
            }

            $responseData = $response->json();
            Log::error('Amadeus Search Error: ' . $response->body());
            
            // Check for specific Amadeus errors
            if (isset($responseData['errors'])) {
                $errorMessage = $responseData['errors'][0]['detail'] ?? 'Flight search failed';
                return ['error' => $errorMessage];
            }
            
            return ['error' => 'Flight search failed. The route may not be available.'];

        } catch (\Exception $e) {
            Log::error('Amadeus Search Exception: ' . $e->getMessage());
            return ['error' => 'An unexpected error occurred: ' . $e->getMessage()];
        }
    }

    /**
     * Transform Amadeus response to simpler JSON
     */
    private function transformResponse($data)
    {
        $transformed = [];
        $markup = 3000; // Configurable markup in NGN

        if (empty($data['data'])) {
            return [];
        }

        // Helper to find carrier name from dictionaries
        $carriers = $data['dictionaries']['carriers'] ?? [];

        foreach ($data['data'] as $offer) {
            $itinerary = $offer['itineraries'][0]['segments'][0]; // Assuming direct flights for simplicity for now
            $carrierCode = $itinerary['carrierCode'];
            $airlineName = $carriers[$carrierCode] ?? $carrierCode;

            $basePrice = (float) $offer['price']['total'];
            $finalPrice = $basePrice + $markup;

            $transformed[] = [
                'airline' => $airlineName,
                'airlineCode' => $carrierCode,
                'from' => $itinerary['departure']['iataCode'],
                'to' => $itinerary['arrival']['iataCode'],
                'departureTime' => date('H:i', strtotime($itinerary['departure']['at'])),
                'arrivalTime' => date('H:i', strtotime($itinerary['arrival']['at'])),
                'price' => $finalPrice,
                'basePrice' => $basePrice,
                'currency' => 'NGN',
                'duration' => $itinerary['duration']
            ];
        }

        return $transformed;
    }
}
