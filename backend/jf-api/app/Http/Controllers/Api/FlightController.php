<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AmadeusService;
use App\Services\StaticFlightService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FlightController extends Controller
{
    protected $amadeusService;
    protected $staticFlightService;

    public function __construct(AmadeusService $amadeusService, StaticFlightService $staticFlightService)
    {
        $this->amadeusService = $amadeusService;
        $this->staticFlightService = $staticFlightService;
    }

    public function search(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'origin' => 'required|string|size:3',
            'destination' => 'required|string|size:3',
            'departureDate' => 'required|date|after_or_equal:today',
            'adults' => 'sometimes|integer|min:1|max:9',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $results = $this->amadeusService->searchFlights($request->all());

        if (isset($results['error'])) {
            return response()->json($results, 500);
        }

        return response()->json([
            'data' => $results,
            'meta' => [
                'count' => count($results)
            ]
        ]);
    }

    public function nigerianLocal(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'origin' => 'required|string|size:3',
            'destination' => 'required|string|size:3',
            'departureDate' => 'required|date|after_or_equal:today',
            'adults' => 'sometimes|integer|min:1|max:9',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $results = $this->amadeusService->getNigerianLocalFlights($request->all());

        if (isset($results['error'])) {
            return response()->json($results, 500);
        }

        return response()->json([
            'data' => $results,
            'meta' => [
                'count' => count($results),
                'flightType' => 'domestic',
                'region' => 'Nigerian Local'
            ]
        ]);
    }

    public function static(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'origin' => 'required|string|size:3',
            'destination' => 'required|string|size:3',
            'adults' => 'sometimes|integer|min:1|max:9',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $results = $this->staticFlightService->searchFlights($request->all());

        if (empty($results)) {
            return response()->json([
                'error' => 'No static flights available for this route',
                'availableRoutes' => $this->staticFlightService->getAvailableRoutes()
            ], 404);
        }

        return response()->json([
            'data' => $results,
            'meta' => [
                'count' => count($results),
                'source' => 'static',
                'description' => 'Fixed flight prices and schedules'
            ]
        ]);
    }

    public function searchWithFallback(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'origin' => 'required|string|size:3',
            'destination' => 'required|string|size:3',
            'departureDate' => 'required|date|after_or_equal:today',
            'adults' => 'sometimes|integer|min:1|max:9',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Try Amadeus API first
        $amadeusResults = $this->amadeusService->searchFlights($request->all());

        // If Amadeus returns results, use them
        if (!isset($amadeusResults['error']) && !empty($amadeusResults)) {
            return response()->json([
                'data' => $amadeusResults,
                'meta' => [
                    'count' => count($amadeusResults),
                    'source' => 'amadeus',
                    'live' => true
                ]
            ]);
        }

        // Fallback to static flights
        $staticResults = $this->staticFlightService->searchFlights($request->all());

        if (!empty($staticResults)) {
            return response()->json([
                'data' => $staticResults,
                'meta' => [
                    'count' => count($staticResults),
                    'source' => 'static',
                    'fallback' => true,
                    'note' => 'Using static prices - live API unavailable'
                ]
            ]);
        }

        // No results from either source
        return response()->json([
            'error' => 'No flights available for this route',
            'amadeusError' => $amadeusResults['error'] ?? 'Unknown error'
        ], 404);
    }

    public function availableRoutes()
    {
        $staticRoutes = $this->staticFlightService->getAvailableRoutes();

        return response()->json([
            'success' => true,
            'routes' => $staticRoutes,
            'count' => count($staticRoutes),
            'description' => 'Available static flight routes'
        ]);
    }
}
