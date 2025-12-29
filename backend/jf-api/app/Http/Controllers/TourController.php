<?php

namespace App\Http\Controllers;

use App\Models\Tour;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TourController extends Controller
{
    /**
     * Get all tours
     */
    public function index(): JsonResponse
    {
        try {
            $tours = Tour::all();
            \Log::info('getTours: Retrieved ' . count($tours) . ' tours');
            
            return response()->json([
                'success' => true,
                'tours' => $tours,
            ], 200);
        } catch (\Exception $e) {
            \Log::error('getTours: Exception', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a single tour by ID
     */
    public function show($id): JsonResponse
    {
        try {
            $tour = Tour::find($id);
            
            if (!$tour) {
                return response()->json([
                    'success' => false,
                    'error' => 'Tour not found',
                ], 404);
            }

            \Log::info('getTour: Retrieved tour', ['id' => $id, 'name' => $tour->name]);
            
            return response()->json([
                'success' => true,
                'tour' => $tour,
            ], 200);
        } catch (\Exception $e) {
            \Log::error('getTour: Exception', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create a new tour
     */
    public function store(Request $request): JsonResponse
    {
        try {
            \Log::info('createTour: Incoming request', ['body' => $request->all()]);

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'destination' => 'required|string|max:255',
                'country' => 'required|string|max:255',
                'price' => 'required|numeric|min:0',
                'duration' => 'required|string',
                'category' => 'required|string',
                'rating' => 'nullable|numeric|min:0|max:5',
                'description' => 'nullable|string',
                'image' => 'nullable|string',
                'group_size' => 'nullable|integer|min:1',
                'itinerary' => 'nullable|array',
                'included' => 'nullable|array',
                'excluded' => 'nullable|array',
            ]);

            \Log::info('createTour: Validation passed', $validated);

            $tour = Tour::create($validated);

            \Log::info('createTour: Tour created', [
                'id' => $tour->id,
                'name' => $tour->name,
                'destination' => $tour->destination,
                'price' => $tour->price,
            ]);

            return response()->json([
                'success' => true,
                'tour' => $tour,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('createTour: Validation error', $e->errors());
            return response()->json([
                'success' => false,
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            \Log::error('createTour: Exception', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update an existing tour
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            \Log::info('updateTour: Incoming request for ID ' . $id, ['body' => $request->all()]);

            $tour = Tour::find($id);
            
            if (!$tour) {
                return response()->json([
                    'success' => false,
                    'error' => 'Tour not found',
                ], 404);
            }

            $validated = $request->validate([
                'name' => 'nullable|string|max:255',
                'destination' => 'nullable|string|max:255',
                'country' => 'nullable|string|max:255',
                'price' => 'nullable|numeric|min:0',
                'duration' => 'nullable|string',
                'category' => 'nullable|string',
                'rating' => 'nullable|numeric|min:0|max:5',
                'description' => 'nullable|string',
                'image' => 'nullable|string',
                'group_size' => 'nullable|integer|min:1',
                'itinerary' => 'nullable|array',
                'included' => 'nullable|array',
                'excluded' => 'nullable|array',
            ]);

            // Only update fields that are provided
            $toUpdate = array_filter($validated, function($value) {
                return $value !== null;
            });

            $tour->update($toUpdate);

            \Log::info('updateTour: Tour updated', [
                'id' => $tour->id,
                'name' => $tour->name,
            ]);

            return response()->json([
                'success' => true,
                'tour' => $tour,
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('updateTour: Validation error', $e->errors());
            return response()->json([
                'success' => false,
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            \Log::error('updateTour: Exception', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a tour
     */
    public function destroy($id): JsonResponse
    {
        try {
            \Log::info('deleteTour: Deleting tour ID ' . $id);

            $tour = Tour::find($id);
            
            if (!$tour) {
                return response()->json([
                    'success' => false,
                    'error' => 'Tour not found',
                ], 404);
            }

            $tourName = $tour->name;
            $tour->delete();

            \Log::info('deleteTour: Tour deleted', ['id' => $id, 'name' => $tourName]);

            return response()->json([
                'success' => true,
                'message' => 'Tour deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            \Log::error('deleteTour: Exception', [
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
