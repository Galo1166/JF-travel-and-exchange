<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\User;

/**
 * Firebase Authentication Middleware
 * 
 * Validates Firebase ID tokens passed in the Authorization header
 * and sets the authenticated user in the request context.
 */
class FirebaseAuth
{
    /**
     * Handle an incoming request.
     *
     * @param  Request  $request
     * @param  Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // Get the Authorization header
        $authHeader = $request->header('Authorization');

        if (!$authHeader) {
            Log::warning('FirebaseAuth: Missing Authorization header');
            return response()->json([
                'success' => false,
                'error' => 'Missing authorization token',
            ], 401);
        }

        // Extract the token (format: "Bearer <token>")
        $parts = explode(' ', $authHeader);
        if (count($parts) !== 2 || $parts[0] !== 'Bearer') {
            Log::warning('FirebaseAuth: Invalid authorization header format');
            return response()->json([
                'success' => false,
                'error' => 'Invalid authorization header format',
            ], 401);
        }

        $token = $parts[1];

        try {
            // For Firebase token validation, we extract user info from the token payload
            // In a production setup, you would validate the token signature using Firebase Admin SDK
            // For now, we'll validate by extracting claims and finding the user
            
            Log::info('FirebaseAuth: Extracting email from token');
            $userEmail = $this->extractEmailFromToken($token);

            if (!$userEmail) {
                Log::warning('FirebaseAuth: Could not extract email from token', [
                    'token_preview' => substr($token, 0, 50) . '...',
                ]);
                return response()->json([
                    'success' => false,
                    'error' => 'Invalid token format - could not extract email',
                ], 401);
            }

            Log::info('FirebaseAuth: Email extracted from token', ['email' => $userEmail]);

            // Find or create user in database
            $user = User::firstOrCreate(
                ['email' => $userEmail],
                [
                    'name' => $userEmail,
                    'role' => 'user',
                    'password' => null,
                ]
            );

            // Store the user and token in the request for later use
            $request->merge([
                'user' => $user,
                'firebase_token' => $token,
                'firebase_email' => $userEmail,
            ]);

            // Also set auth user for auth() helper
            auth('api')->setUser($user);

            Log::info('FirebaseAuth: User authenticated', [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);

            return $next($request);

        } catch (\Exception $e) {
            Log::error('FirebaseAuth: Error validating token', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'success' => false,
                'error' => 'Token validation failed: ' . $e->getMessage(),
            ], 401);
        }
    }

    /**
     * Extract email from token
     * 
     * In production, use Firebase Admin SDK to validate and extract claims:
     * $decodedToken = Firebase::auth()->verifyIdToken($token);
     * return $decodedToken->claims()->get('email');
     * 
     * For now, we extract from the JWT payload
     */
    private function extractEmailFromToken(string $token): ?string
    {
        try {
            Log::info('FirebaseAuth: Starting token extraction');
            
            // JWT tokens have 3 parts separated by dots: header.payload.signature
            $parts = explode('.', $token);
            
            Log::info('FirebaseAuth: Token parts count', ['count' => count($parts)]);
            
            if (count($parts) !== 3) {
                Log::warning('FirebaseAuth: Invalid token format - expected 3 parts', ['got' => count($parts)]);
                return null;
            }

            // Decode the payload (middle part)
            // Note: JWT payload is base64url encoded
            $decoded = base64_decode(strtr($parts[1], '-_', '+/'), true);
            
            Log::info('FirebaseAuth: Base64 decode result', [
                'decoded' => $decoded ? 'success' : 'failed',
                'decoded_length' => strlen($decoded ?? ''),
            ]);
            
            if (!$decoded) {
                Log::warning('FirebaseAuth: Failed to base64 decode payload');
                return null;
            }
            
            $payload = json_decode($decoded, true);

            Log::info('FirebaseAuth: Decoded payload', [
                'keys' => is_array($payload) ? array_keys($payload) : 'not_array',
                'payload' => is_array($payload) ? $payload : 'invalid',
            ]);

            if (!is_array($payload)) {
                Log::warning('FirebaseAuth: Payload is not an array');
                return null;
            }

            // Try to get email from common JWT claims
            $email = $payload['email'] ?? $payload['preferred_username'] ?? $payload['sub'] ?? null;
            
            Log::info('FirebaseAuth: Extracted email from token', [
                'email' => $email,
                'available_claims' => array_keys($payload),
            ]);
            
            return $email;

        } catch (\Exception $e) {
            Log::error('FirebaseAuth: Error extracting email from token', [
                'error' => $e->getMessage(),
                'code' => $e->getCode(),
                'trace' => $e->getTraceAsString(),
            ]);
            return null;
        }
    }
}
