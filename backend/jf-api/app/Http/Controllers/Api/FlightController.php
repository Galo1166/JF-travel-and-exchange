<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AmadeusService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FlightController extends Controller
{
    protected $amadeusService;

    public function __construct(AmadeusService $amadeusService)
    {
        $this->amadeusService = $amadeusService;
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
}
