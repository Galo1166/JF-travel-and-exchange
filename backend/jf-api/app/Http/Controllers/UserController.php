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
    public function me(): JsonResponse
    {
        try {
            $user = auth('sanctum')->user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'error' => 'Not authenticated',
                ], 401);
            }

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
            Log::error('UserController@me: Error', [
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
