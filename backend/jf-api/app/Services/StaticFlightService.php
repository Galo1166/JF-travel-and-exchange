<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class StaticFlightService
{
    /**
     * Static flight data for Nigerian routes
     * Provides fallback flight options when Amadeus API is unavailable
     */
    private $staticFlights = [
        'LOS-ABV' => [
            [
                'airline' => 'Dana Air',
                'airlineCode' => 'DA',
                'from' => 'LOS',
                'to' => 'ABV',
                'departureTime' => '07:00',
                'arrivalTime' => '08:15',
                'price' => 110000,
                'basePrice' => 100000,
                'currency' => 'NGN',
                'duration' => 'PT1H15M',
                'isStatic' => true,
                'flightNumber' => 'DA101'
            ],
            [
                'airline' => 'Air Peace',
                'airlineCode' => 'NC',
                'from' => 'LOS',
                'to' => 'ABV',
                'departureTime' => '10:30',
                'arrivalTime' => '11:45',
                'price' => 122000,
                'basePrice' => 112000,
                'currency' => 'NGN',
                'duration' => 'PT1H15M',
                'isStatic' => true,
                'flightNumber' => 'NC202'
            ],
            [
                'airline' => 'Overland Airways',
                'airlineCode' => 'C3',
                'from' => 'LOS',
                'to' => 'ABV',
                'departureTime' => '14:00',
                'arrivalTime' => '15:15',
                'price' => 116000,
                'basePrice' => 106000,
                'currency' => 'NGN',
                'duration' => 'PT1H15M',
                'isStatic' => true,
                'flightNumber' => 'C3303'
            ]
        ],
        'ABV-LOS' => [
            [
                'airline' => 'Dana Air',
                'airlineCode' => 'DA',
                'from' => 'ABV',
                'to' => 'LOS',
                'departureTime' => '08:30',
                'arrivalTime' => '09:45',
                'price' => 110000,
                'basePrice' => 100000,
                'currency' => 'NGN',
                'duration' => 'PT1H15M',
                'isStatic' => true,
                'flightNumber' => 'DA104'
            ],
            [
                'airline' => 'Air Peace',
                'airlineCode' => 'NC',
                'from' => 'ABV',
                'to' => 'LOS',
                'departureTime' => '12:00',
                'arrivalTime' => '13:15',
                'price' => 122000,
                'basePrice' => 112000,
                'currency' => 'NGN',
                'duration' => 'PT1H15M',
                'isStatic' => true,
                'flightNumber' => 'NC205'
            ]
        ],
        'LOS-KAN' => [
            [
                'airline' => 'Dana Air',
                'airlineCode' => 'DA',
                'from' => 'LOS',
                'to' => 'KAN',
                'departureTime' => '06:00',
                'arrivalTime' => '07:45',
                'price' => 105000,
                'basePrice' => 97000,
                'currency' => 'NGN',
                'duration' => 'PT1H45M',
                'isStatic' => true,
                'flightNumber' => 'DA501'
            ],
            [
                'airline' => 'Air Peace',
                'airlineCode' => 'NC',
                'from' => 'LOS',
                'to' => 'KAN',
                'departureTime' => '09:00',
                'arrivalTime' => '10:45',
                'price' => 105000,
                'basePrice' => 97000,
                'currency' => 'NGN',
                'duration' => 'PT1H45M',
                'isStatic' => true,
                'flightNumber' => 'NC501'
            ]
        ],
        'KAN-LOS' => [
            [
                'airline' => 'Dana Air',
                'airlineCode' => 'DA',
                'from' => 'KAN',
                'to' => 'LOS',
                'departureTime' => '11:00',
                'arrivalTime' => '12:45',
                'price' => 98000,
                'basePrice' => 90000,
                'currency' => 'NGN',
                'duration' => 'PT1H45M',
                'isStatic' => true,
                'flightNumber' => 'DA504'
            ],
            [
                'airline' => 'Air Peace',
                'airlineCode' => 'NC',
                'from' => 'KAN',
                'to' => 'LOS',
                'departureTime' => '16:00',
                'arrivalTime' => '17:45',
                'price' => 98000,
                'basePrice' => 90000,
                'currency' => 'NGN',
                'duration' => 'PT1H45M',
                'isStatic' => true,
                'flightNumber' => 'NC504'
            ]
        ],
        'LOS-PHC' => [
            [
                'airline' => 'Dana Air',
                'airlineCode' => 'DA',
                'from' => 'LOS',
                'to' => 'PHC',
                'departureTime' => '08:00',
                'arrivalTime' => '09:30',
                'price' => 116000,
                'basePrice' => 107000,
                'currency' => 'NGN',
                'duration' => 'PT1H30M',
                'isStatic' => true,
                'flightNumber' => 'DA301'
            ],
            [
                'airline' => 'Air Peace',
                'airlineCode' => 'NC',
                'from' => 'LOS',
                'to' => 'PHC',
                'departureTime' => '11:30',
                'arrivalTime' => '13:00',
                'price' => 125000,
                'basePrice' => 115000,
                'currency' => 'NGN',
                'duration' => 'PT1H30M',
                'isStatic' => true,
                'flightNumber' => 'NC301'
            ]
        ],
        'PHC-LOS' => [
            [
                'airline' => 'Dana Air',
                'airlineCode' => 'DA',
                'from' => 'PHC',
                'to' => 'LOS',
                'departureTime' => '10:00',
                'arrivalTime' => '11:30',
                'price' => 116000,
                'basePrice' => 107000,
                'currency' => 'NGN',
                'duration' => 'PT1H30M',
                'isStatic' => true,
                'flightNumber' => 'DA304'
            ],
            [
                'airline' => 'Air Peace',
                'airlineCode' => 'NC',
                'from' => 'PHC',
                'to' => 'LOS',
                'departureTime' => '14:00',
                'arrivalTime' => '15:30',
                'price' => 125000,
                'basePrice' => 115000,
                'currency' => 'NGN',
                'duration' => 'PT1H30M',
                'isStatic' => true,
                'flightNumber' => 'NC304'
            ]
        ],
        'ABV-KAN' => [
            [
                'airline' => 'Dana Air',
                'airlineCode' => 'DA',
                'from' => 'ABV',
                'to' => 'KAN',
                'departureTime' => '09:00',
                'arrivalTime' => '10:20',
                'price' => 105000,
                'basePrice' => 97000,
                'currency' => 'NGN',
                'duration' => 'PT1H20M',
                'isStatic' => true,
                'flightNumber' => 'DA401'
            ],
            [
                'airline' => 'Air Peace',
                'airlineCode' => 'NC',
                'from' => 'ABV',
                'to' => 'KAN',
                'departureTime' => '13:00',
                'arrivalTime' => '14:20',
                'price' => 115000,
                'basePrice' => 105000,
                'currency' => 'NGN',
                'duration' => 'PT1H20M',
                'isStatic' => true,
                'flightNumber' => 'NC401'
            ]
        ],
        'KAN-ABV' => [
            [
                'airline' => 'Dana Air',
                'airlineCode' => 'DA',
                'from' => 'KAN',
                'to' => 'ABV',
                'departureTime' => '11:30',
                'arrivalTime' => '12:50',
                'price' => 105000,
                'basePrice' => 97000,
                'currency' => 'NGN',
                'duration' => 'PT1H20M',
                'isStatic' => true,
                'flightNumber' => 'DA404'
            ],
            [
                'airline' => 'Air Peace',
                'airlineCode' => 'NC',
                'from' => 'KAN',
                'to' => 'ABV',
                'departureTime' => '15:00',
                'arrivalTime' => '16:20',
                'price' => 115000,
                'basePrice' => 105000,
                'currency' => 'NGN',
                'duration' => 'PT1H20M',
                'isStatic' => true,
                'flightNumber' => 'NC404'
            ]
        ],
        'LOS-ENU' => [
            [
                'airline' => 'Dana Air',
                'airlineCode' => 'DA',
                'from' => 'LOS',
                'to' => 'ENU',
                'departureTime' => '07:30',
                'arrivalTime' => '09:15',
                'price' => 127000,
                'basePrice' => 117000,
                'currency' => 'NGN',
                'duration' => 'PT1H45M',
                'isStatic' => true,
                'flightNumber' => 'DA701'
            ],
            [
                'airline' => 'Air Peace',
                'airlineCode' => 'NC',
                'from' => 'LOS',
                'to' => 'ENU',
                'departureTime' => '12:00',
                'arrivalTime' => '13:45',
                'price' => 130000,
                'basePrice' => 121000,
                'currency' => 'NGN',
                'duration' => 'PT1H45M',
                'isStatic' => true,
                'flightNumber' => 'NC701'
            ]
        ],
        'ENU-LOS' => [
            [
                'airline' => 'Dana Air',
                'airlineCode' => 'DA',
                'from' => 'ENU',
                'to' => 'LOS',
                'departureTime' => '10:00',
                'arrivalTime' => '11:45',
                'price' => 127000,
                'basePrice' => 117000,
                'currency' => 'NGN',
                'duration' => 'PT1H45M',
                'isStatic' => true,
                'flightNumber' => 'DA704'
            ],
            [
                'airline' => 'Air Peace',
                'airlineCode' => 'NC',
                'from' => 'ENU',
                'to' => 'LOS',
                'departureTime' => '14:30',
                'arrivalTime' => '16:15',
                'price' => 130000,
                'basePrice' => 121000,
                'currency' => 'NGN',
                'duration' => 'PT1H45M',
                'isStatic' => true,
                'flightNumber' => 'NC704'
            ]
        ]
    ];

    /**
     * Get static flights for a route
     */
    public function getStaticFlights($origin, $destination)
    {
        $route = strtoupper($origin) . '-' . strtoupper($destination);

        if (isset($this->staticFlights[$route])) {
            Log::info('StaticFlightService: Returning static flights for route', ['route' => $route]);
            return $this->staticFlights[$route];
        }

        Log::warning('StaticFlightService: No static flights found for route', ['route' => $route]);
        return [];
    }

    /**
     * Get all available routes with static flights
     */
    public function getAvailableRoutes()
    {
        return array_keys($this->staticFlights);
    }

    /**
     * Search static flights with parameters
     */
    public function searchFlights($params)
    {
        $origin = strtoupper($params['origin'] ?? '');
        $destination = strtoupper($params['destination'] ?? '');
        $adults = intval($params['adults'] ?? 1);

        $flights = $this->getStaticFlights($origin, $destination);

        if (empty($flights)) {
            return [];
        }

        // Apply any filtering or adjustments based on adults
        // For static flights, we just return as-is
        return $flights;
    }

    /**
     * Add a custom static flight route
     * Useful for adding more routes dynamically
     */
    public function addRoute($origin, $destination, $flights)
    {
        $route = strtoupper($origin) . '-' . strtoupper($destination);
        $this->staticFlights[$route] = $flights;
        Log::info('StaticFlightService: Added route', ['route' => $route, 'count' => count($flights)]);
    }

    /**
     * Get flight details by route and index
     */
    public function getFlightByIndex($origin, $destination, $index)
    {
        $flights = $this->getStaticFlights($origin, $destination);
        
        if (isset($flights[$index])) {
            return $flights[$index];
        }

        return null;
    }
}
