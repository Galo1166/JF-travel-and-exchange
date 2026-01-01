<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    /**
     * Get user by email
     */
    public function getByEmail($email): JsonResponse
    {
        try {
            Log::info('UserController@getByEmail: Fetching user', ['email' => $email]);

            $user = User::where('email', $email)->first();

            if (!$user) {
                Log::warning('UserController@getByEmail: User not found', ['email' => $email]);
                return response()->json([
                    'success' => false,
                    'error' => 'User not found',
                ], 404);
            }

            Log::info('UserController@getByEmail: User found', ['id' => $user->id]);

            return response()->json([
                'success' => true,
                'user' => [
                    'id' => $user->id,
                    'email' => $user->email,
                    'name' => $user->name,
                    'role' => $user->role ?? 'user',
                ],
            ], 200);
        } catch (\Exception $e) {
            Log::error('UserController@getByEmail: Error', [
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get current authenticated user
     */
    public function me(Request $request): JsonResponse
    {
        try {
            // Get user from request (set by FirebaseAuth middleware)
            $user = $request->user() ?? auth()->user() ?? $request->get('user');

            if (!$user) {
                Log::warning('UserController@me: User not authenticated');
                return response()->json([
                    'success' => false,
                    'error' => 'Not authenticated',
                ], 401);
            }

            Log::info('UserController@me: Retrieved current user', ['user_id' => $user->id]);

            return response()->json([
                'success' => true,
                'user' => [
                    'id' => $user->id,
                    'email' => $user->email,
                    'name' => $user->name,
                    'phone_number' => $user->phone_number,
                    'preferred_currency' => $user->preferred_currency ?? 'USD',
                    'role' => $user->role ?? 'user',
                ],
            ], 200);
        } catch (\Exception $e) {
            Log::error('UserController@me: Error', [
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update user profile (phone number and preferred currency)
     */
    public function updateProfile(Request $request): JsonResponse
    {
        try {
            // Get user from request (set by FirebaseAuth middleware)
            $user = $request->user() ?? auth()->user() ?? $request->get('user');

            if (!$user) {
                Log::warning('UserController@updateProfile: User not authenticated');
                return response()->json([
                    'success' => false,
                    'error' => 'Not authenticated',
                ], 401);
            }

            Log::info('UserController@updateProfile: Updating user', ['user_id' => $user->id]);

            $validated = $request->validate([
                'phone_number' => 'nullable|string|max:20',
                'preferred_currency' => 'nullable|string|in:USD,EUR,GBP,NGN,GHS,KES',
            ]);

            $user->update($validated);

            Log::info('UserController@updateProfile: Profile updated', ['user_id' => $user->id]);

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'user' => [
                    'id' => $user->id,
                    'email' => $user->email,
                    'name' => $user->name,
                    'phone_number' => $user->phone_number,
                    'preferred_currency' => $user->preferred_currency,
                    'role' => $user->role,
                ],
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('UserController@updateProfile: Validation failed', [
                'errors' => $e->errors(),
            ]);
            return response()->json([
                'success' => false,
                'error' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('UserController@updateProfile: Error', [
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get user's bookings
     */
    public function getBookings(Request $request): JsonResponse
    {
        try {
            // Get user from request (set by FirebaseAuth middleware)
            $user = $request->user() ?? auth()->user() ?? $request->get('user');

            if (!$user) {
                Log::warning('UserController@getBookings: User not authenticated');
                return response()->json([
                    'success' => false,
                    'error' => 'Not authenticated',
                ], 401);
            }

            Log::info('UserController@getBookings: Fetching bookings for user', ['user_id' => $user->id]);

            try {
                $bookings = \App\Models\TourBooking::where('user_id', $user->id)
                    ->with('tour')
                    ->orderBy('created_at', 'desc')
                    ->get()
                    ->map(function ($booking) {
                        return [
                            'id' => $booking->id,
                            'tour_id' => $booking->tour_id,
                            'tour_name' => $booking->tour->name ?? 'Unknown Tour',
                            'booking_date' => $booking->booking_date,
                            'travel_date' => $booking->travel_date,
                            'number_of_travelers' => $booking->number_of_travelers,
                            'total_price' => $booking->total_price,
                            'status' => $booking->status,
                            'full_name' => $booking->full_name,
                            'email' => $booking->email,
                            'phone' => $booking->phone,
                            'payment_method' => $booking->payment_method,
                            'created_at' => $booking->created_at,
                        ];
                    });
            } catch (\Illuminate\Database\QueryException $qe) {
                Log::error('UserController@getBookings: Database query failed', ['error' => $qe->getMessage()]);
                return response()->json([
                    'success' => false,
                    'error' => 'Database unavailable',
                    'details' => $qe->getMessage(),
                ], 503);
            }

            Log::info('UserController@getBookings: Retrieved bookings', ['count' => count($bookings)]);

            return response()->json([
                'success' => true,
                'bookings' => $bookings,
                'total' => count($bookings),
            ], 200);
        } catch (\Exception $e) {
            Log::error('UserController@getBookings: Error', [
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
