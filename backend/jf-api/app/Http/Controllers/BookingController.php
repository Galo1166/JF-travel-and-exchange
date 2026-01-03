<?php

namespace App\Http\Controllers;

use App\Models\TourBooking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class BookingController extends Controller
{
    /**
     * Get all tour bookings with user and tour details
     */
    public function index(): JsonResponse
    {
        try {
            Log::info('BookingController@index: Fetching all bookings');

            $bookings = TourBooking::with(['user', 'tour'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($booking) {
                    return [
                        'id' => $booking->id,
                        'user_id' => $booking->user_id,
                        'user_name' => $booking->user->name ?? 'Unknown',
                        'user_email' => $booking->user->email ?? 'Unknown',
                        'phone' => $booking->phone,
                        'tour_id' => $booking->tour_id,
                        'tour_name' => $booking->tour->name ?? 'Unknown',
                        'booking_date' => $booking->booking_date,
                        'travel_date' => $booking->travel_date,
                        'number_of_travelers' => $booking->number_of_travelers,
                        'total_price' => $booking->total_price,
                        'currency' => $booking->currency ?? 'USD',
                        'status' => $booking->status,
                        'payment_method' => $booking->payment_method,
                        'created_at' => $booking->created_at,
                        'updated_at' => $booking->updated_at,
                    ];
                });

            Log::info('BookingController@index: Retrieved ' . count($bookings) . ' bookings');

            return response()->json([
                'success' => true,
                'bookings' => $bookings,
                'total' => count($bookings),
            ], 200);
        } catch (\Exception $e) {
            Log::error('BookingController@index: Error', [
                'message' => $e->getMessage(),
                'stack' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch bookings',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a specific booking by ID
     */
    public function show($id): JsonResponse
    {
        try {
            Log::info('BookingController@show: Fetching booking', ['id' => $id]);

            $booking = TourBooking::with(['user', 'tour'])->find($id);

            if (!$booking) {
                Log::warning('BookingController@show: Booking not found', ['id' => $id]);
                return response()->json([
                    'success' => false,
                    'error' => 'Booking not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'booking' => [
                    'id' => $booking->id,
                    'user_id' => $booking->user_id,
                    'user_name' => $booking->user->name ?? 'Unknown',
                    'user_email' => $booking->user->email ?? 'Unknown',
                    'phone' => $booking->phone,
                    'tour_id' => $booking->tour_id,
                    'tour_name' => $booking->tour->name ?? 'Unknown',
                    'booking_date' => $booking->booking_date,
                    'travel_date' => $booking->travel_date,
                    'number_of_travelers' => $booking->number_of_travelers,
                    'total_price' => $booking->total_price,
                    'currency' => $booking->currency ?? 'USD',
                    'status' => $booking->status,
                    'payment_method' => $booking->payment_method,
                    'created_at' => $booking->created_at,
                    'updated_at' => $booking->updated_at,
                ],
            ], 200);
        } catch (\Exception $e) {
            Log::error('BookingController@show: Error', [
                'id' => $id,
                'message' => $e->getMessage(),
                'stack' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch booking',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create a new tour booking
     */
    public function store(Request $request): JsonResponse
    {
        try {
            Log::info('BookingController@store: Creating booking', [
                'body' => $request->all(),
            ]);

            $validated = $request->validate([
                'user_id' => 'required|integer|exists:users,id',
                'tour_id' => 'required|integer|exists:tours,id',
                'booking_date' => 'required|date',
                'travel_date' => 'required|date|after_or_equal:booking_date',
                'number_of_travelers' => 'required|integer|min:1',
                'total_price' => 'required|numeric|min:0',
                'currency' => 'nullable|string|max:3',
                'status' => 'nullable|in:pending,confirmed,completed,cancelled',
                'full_name' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'phone' => 'required|string|max:20',
                'payment_method' => 'required|string|in:paystack,paypal,bank',
            ]);

            // Set default status if not provided
            $validated['status'] = $validated['status'] ?? 'pending';

            $booking = TourBooking::create($validated);

            Log::info('BookingController@store: Booking created', [
                'id' => $booking->id,
                'status' => $booking->status,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Booking created successfully',
                'booking' => $booking,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('BookingController@store: Validation failed', [
                'errors' => $e->errors(),
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('BookingController@store: Error', [
                'message' => $e->getMessage(),
                'stack' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to create booking',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update booking status
     * This endpoint is specifically for changing status from pending to completed
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        try {
            Log::info('BookingController@updateStatus: Updating booking status', [
                'id' => $id,
                'body' => $request->all(),
            ]);

            $booking = TourBooking::find($id);

            if (!$booking) {
                Log::warning('BookingController@updateStatus: Booking not found', ['id' => $id]);
                return response()->json([
                    'success' => false,
                    'error' => 'Booking not found',
                ], 404);
            }

            $validated = $request->validate([
                'status' => 'required|in:pending,confirmed,completed,cancelled',
            ]);

            $oldStatus = $booking->status;
            $booking->update($validated);

            Log::info('BookingController@updateStatus: Status updated', [
                'id' => $id,
                'old_status' => $oldStatus,
                'new_status' => $booking->status,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Booking status updated successfully',
                'booking' => [
                    'id' => $booking->id,
                    'status' => $booking->status,
                    'updated_at' => $booking->updated_at,
                ],
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('BookingController@updateStatus: Validation failed', [
                'id' => $id,
                'errors' => $e->errors(),
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('BookingController@updateStatus: Error', [
                'id' => $id,
                'message' => $e->getMessage(),
                'stack' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to update booking status',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update an entire booking
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            Log::info('BookingController@update: Updating booking', [
                'id' => $id,
                'body' => $request->all(),
            ]);

            $booking = TourBooking::find($id);

            if (!$booking) {
                Log::warning('BookingController@update: Booking not found', ['id' => $id]);
                return response()->json([
                    'success' => false,
                    'error' => 'Booking not found',
                ], 404);
            }

            $validated = $request->validate([
                'user_id' => 'sometimes|integer|exists:users,id',
                'tour_id' => 'sometimes|integer|exists:tours,id',
                'booking_date' => 'sometimes|date',
                'travel_date' => 'sometimes|date|after_or_equal:booking_date',
                'number_of_travelers' => 'sometimes|integer|min:1',
                'total_price' => 'sometimes|numeric|min:0',
                'status' => 'sometimes|in:pending,confirmed,completed,cancelled',
            ]);

            $booking->update($validated);

            Log::info('BookingController@update: Booking updated', ['id' => $id]);

            return response()->json([
                'success' => true,
                'message' => 'Booking updated successfully',
                'booking' => $booking,
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('BookingController@update: Validation failed', [
                'id' => $id,
                'errors' => $e->errors(),
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('BookingController@update: Error', [
                'id' => $id,
                'message' => $e->getMessage(),
                'stack' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to update booking',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a booking
     */
    public function destroy($id): JsonResponse
    {
        try {
            Log::info('BookingController@destroy: Deleting booking', ['id' => $id]);

            $booking = TourBooking::find($id);

            if (!$booking) {
                Log::warning('BookingController@destroy: Booking not found', ['id' => $id]);
                return response()->json([
                    'success' => false,
                    'error' => 'Booking not found',
                ], 404);
            }

            $booking->delete();

            Log::info('BookingController@destroy: Booking deleted', ['id' => $id]);

            return response()->json([
                'success' => true,
                'message' => 'Booking deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            Log::error('BookingController@destroy: Error', [
                'id' => $id,
                'message' => $e->getMessage(),
                'stack' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to delete booking',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
