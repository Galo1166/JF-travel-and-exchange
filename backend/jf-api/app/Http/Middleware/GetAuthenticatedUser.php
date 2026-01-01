<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Get Authenticated User Middleware
 * 
 * Provides a fallback method to retrieve the authenticated user
 * from the request object when using custom auth (Firebase).
 */
class GetAuthenticatedUser
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
        // Make the auth helper work with our custom Firebase auth
        // by checking if user was set by FirebaseAuth middleware
        if ($request->has('user')) {
            $user = $request->get('user');
            
            // Override the auth() helper to return our user
            $request->setUserResolver(function () use ($user) {
                return $user;
            });
        }

        return $next($request);
    }
}
